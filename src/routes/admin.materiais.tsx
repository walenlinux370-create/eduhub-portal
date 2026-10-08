import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireSupabase } from "@/lib/supabase";

type ClassRow={id:string;level:number;name:string;academic_year:number};
type Subject={id:string;name:string;min_level:number;max_level:number};
type Material={id:string;class_id:string;subject_id:string;title:string;storage_path:string;mime_type:string;size_bytes:number;created_at:string};

const MAX_SIZE=50*1024*1024;
const ALLOWED=new Set([
  "application/pdf","application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain","image/jpeg","image/png"
]);

export const Route=createFileRoute("/admin/materiais")({
  head:()=>({meta:[{title:"Materiais — Painel Administrativo"},{name:"robots",content:"noindex,nofollow"}]}),
  component:MateriaisPage,
});

function MateriaisPage(){
  const supabase=requireSupabase();
  const [classes,setClasses]=useState<ClassRow[]>([]);
  const [subjects,setSubjects]=useState<Subject[]>([]);
  const [materials,setMaterials]=useState<Material[]>([]);
  const [classId,setClassId]=useState("");
  const [subjectId,setSubjectId]=useState("");
  const [title,setTitle]=useState("");
  const [file,setFile]=useState<File|null>(null);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  const currentClass=useMemo(()=>classes.find(c=>c.id===classId),[classes,classId]);
  const filteredSubjects=useMemo(()=>subjects.filter(s=>currentClass?s.min_level<=currentClass.level&&s.max_level>=currentClass.level:true),[subjects,currentClass]);
  const subjectNames=useMemo(()=>new Map(subjects.map(s=>[s.id,s.name])),[subjects]);
  const classNames=useMemo(()=>new Map(classes.map(c=>[c.id,String(c.level)+"ª — "+c.name+" ("+c.academic_year+")"])),[classes]);

  async function load(){
    const [c,s,m]=await Promise.all([
      supabase.from("classes").select("id,level,name,academic_year").order("academic_year",{ascending:false}).order("level").order("name"),
      supabase.from("subjects").select("id,name,min_level,max_level").order("name"),
      supabase.from("materials").select("id,class_id,subject_id,title,storage_path,mime_type,size_bytes,created_at").order("created_at",{ascending:false})
    ]);
    if(c.error||s.error||m.error){setMessage(c.error?.message||s.error?.message||m.error?.message||"Erro ao carregar materiais.");return;}
    setClasses(c.data??[]);setSubjects(s.data??[]);setMaterials((m.data??[]) as Material[]);
    if(!classId&&c.data?.[0])setClassId(c.data[0].id);
    const firstClass=c.data?.[0];
    const firstSubject=s.data?.find(x=>firstClass?x.min_level<=firstClass.level&&x.max_level>=firstClass.level:true);
    if(!subjectId&&firstSubject)setSubjectId(firstSubject.id);
  }

  useEffect(()=>{load()},[]);

  async function upload(){
    setMessage("");
    if(!classId||!subjectId){setMessage("Selecione a turma e a disciplina.");return;}
    if(!title.trim()||title.trim().length>160){setMessage("Informe um título entre 1 e 160 caracteres.");return;}
    if(!file){setMessage("Selecione um ficheiro.");return;}
    if(file.size<=0||file.size>MAX_SIZE){setMessage("O ficheiro deve ter no máximo 50 MB.");return;}
    if(!ALLOWED.has(file.type)){setMessage("Tipo de ficheiro não permitido.");return;}

    setBusy(true);
    const extension=file.name.includes(".")?file.name.slice(file.name.lastIndexOf(".")).toLowerCase():"";
    const objectPath=classId+"/"+subjectId+"/"+crypto.randomUUID()+extension;
    try{
      const uploaded=await supabase.storage.from("materials").upload(objectPath,file,{contentType:file.type,upsert:false});
      if(uploaded.error)throw uploaded.error;
      const inserted=await supabase.from("materials").insert({
        class_id:classId,subject_id:subjectId,title:title.trim(),
        storage_path:objectPath,mime_type:file.type,size_bytes:file.size
      }).select("id,class_id,subject_id,title,storage_path,mime_type,size_bytes,created_at").single();
      if(inserted.error){
        await supabase.storage.from("materials").remove([objectPath]);
        throw inserted.error;
      }
      setTitle("");setFile(null);
      const input=document.getElementById("material-file") as HTMLInputElement|null;if(input)input.value="";
      setMessage("Material enviado com sucesso.");
      await load();
    }catch(e:any){setMessage(e?.message||"Não foi possível enviar o material.");}
    finally{setBusy(false);}
  }

  async function openMaterial(material:Material){
    const result=await supabase.storage.from("materials").createSignedUrl(material.storage_path,300);
    if(result.error){setMessage(result.error.message);return;}
    window.open(result.data.signedUrl,"_blank","noopener,noreferrer");
  }

  async function removeMaterial(material:Material){
    if(!window.confirm("Eliminar o material \""+material.title+"\"?"))return;
    setBusy(true);setMessage("");
    try{
      const db=await supabase.from("materials").delete().eq("id",material.id);
      if(db.error)throw db.error;
      const storage=await supabase.storage.from("materials").remove([material.storage_path]);
      if(storage.error)throw storage.error;
      setMessage("Material eliminado.");
      await load();
    }catch(e:any){setMessage(e?.message||"Não foi possível eliminar o material.");}
    finally{setBusy(false);}
  }

  return <AdminShell>
    <p className="text-sm font-bold uppercase tracking-widest text-yellow-600">Administração académica</p>
    <h2 className="mt-1 text-3xl font-bold text-primary">Materiais</h2>
    <p className="mt-2 text-sm text-muted-foreground">Publique materiais pedagógicos privados por turma e disciplina. Os ficheiros não ficam públicos e os acessos são controlados pelo Supabase.</p>

    <section className="mt-6 rounded-xl border bg-background p-5">
      <h3 className="font-semibold">Adicionar material</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm">Turma<select value={classId} onChange={e=>{setClassId(e.target.value);const c=classes.find(x=>x.id===e.target.value);const s=subjects.find(x=>c&&x.min_level<=c.level&&x.max_level>=c.level);if(s)setSubjectId(s.id)}} className="mt-1 w-full rounded-md border bg-background p-2">{classes.map(c=><option key={c.id} value={c.id}>{c.level}ª — {c.name} ({c.academic_year})</option>)}</select></label>
        <label className="text-sm">Disciplina<select value={subjectId} onChange={e=>setSubjectId(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2">{filteredSubjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label className="text-sm md:col-span-2">Título<input value={title} maxLength={160} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2" placeholder="Ex.: Ficha de Matemática — Frações"/></label>
        <label className="text-sm md:col-span-2">Ficheiro<input id="material-file" type="file" onChange={e=>setFile(e.target.files?.[0]??null)} className="mt-1 block w-full rounded-md border bg-background p-2" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"/></label>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4"><p className="text-xs text-muted-foreground">Máximo 50 MB. PDF, Word, PowerPoint, Excel, TXT e imagens JPG/PNG.</p><button disabled={busy} onClick={upload} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy?"A processar…":"Enviar material"}</button></div>
      {message&&<p className="mt-4 rounded-md bg-muted p-3 text-sm">{message}</p>}
    </section>

    <section className="mt-6 overflow-hidden rounded-xl border bg-background">
      <div className="border-b p-5"><h3 className="font-semibold">Materiais publicados</h3><p className="text-sm text-muted-foreground">{materials.length} material(is) registado(s).</p></div>
      <div className="divide-y">
        {materials.map(m=><div key={m.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
          <div className="min-w-0 flex-1"><p className="font-medium">{m.title}</p><p className="text-xs text-muted-foreground">{classNames.get(m.class_id)??m.class_id} · {subjectNames.get(m.subject_id)??m.subject_id} · {(m.size_bytes/1024/1024).toFixed(2)} MB</p></div>
          <div className="flex gap-2"><button onClick={()=>openMaterial(m)} className="rounded-md border px-3 py-2 text-sm">Abrir</button><button disabled={busy} onClick={()=>removeMaterial(m)} className="rounded-md border px-3 py-2 text-sm text-destructive disabled:opacity-50">Eliminar</button></div>
        </div>)}
        {!materials.length&&<p className="p-8 text-center text-sm text-muted-foreground">Ainda não existem materiais.</p>}
      </div>
    </section>
  </AdminShell>;
}
