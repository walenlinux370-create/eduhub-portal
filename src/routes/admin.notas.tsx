import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireSupabase } from "@/lib/supabase";

type ClassRow={id:string;level:number;name:string;academic_year:number};
type Subject={id:string;name:string;min_level:number;max_level:number};
type Student={id:string;full_name:string;registration_number:string;class_id:string;status:string};
type Grade={id:string;student_id:string;subject_id:string;class_id:string;trimester:number;academic_year:number;component_scores:Record<string,string|number>;final_grade:number|null;state:"draft"|"published"};

export const Route=createFileRoute("/admin/notas")({
  head:()=>({meta:[{title:"Notas — Painel Administrativo"},{name:"robots",content:"noindex,nofollow"}]}),
  component:NotasPage,
});

function NotasPage(){
  const supabase=requireSupabase();
  const [classes,setClasses]=useState<ClassRow[]>([]);
  const [subjects,setSubjects]=useState<Subject[]>([]);
  const [students,setStudents]=useState<Student[]>([]);
  const [grades,setGrades]=useState<Grade[]>([]);
  const [classId,setClassId]=useState("");
  const [subjectId,setSubjectId]=useState("");
  const [trimester,setTrimester]=useState(1);
  const [selectedStudent,setSelectedStudent]=useState("");
  const [components,setComponents]=useState({teste1:"",teste2:"",trabalho:""});
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  const currentClass=useMemo(()=>classes.find(c=>c.id===classId),[classes,classId]);

  async function loadBase(){
    const [c,s]=await Promise.all([
      supabase.from("classes").select("id,level,name,academic_year").order("academic_year",{ascending:false}).order("level").order("name"),
      supabase.from("subjects").select("id,name,min_level,max_level").order("name")
    ]);
    if(c.error||s.error){setMessage(c.error?.message||s.error?.message||"Erro ao carregar dados.");return;}
    setClasses(c.data??[]);setSubjects(s.data??[]);
    if(!classId&&c.data?.[0])setClassId(c.data[0].id);
    if(!subjectId&&s.data?.[0])setSubjectId(s.data[0].id);
  }

  async function loadClass(){
    if(!classId)return;
    const c=classes.find(x=>x.id===classId);
    const [st,g]=await Promise.all([
      supabase.from("students").select("id,full_name,registration_number,class_id,status").eq("class_id",classId).eq("status","active").order("full_name"),
      supabase.from("grades").select("id,student_id,subject_id,class_id,trimester,academic_year,component_scores,final_grade,state").eq("class_id",classId).eq("subject_id",subjectId).eq("trimester",trimester).eq("academic_year",c?.academic_year??new Date().getFullYear())
    ]);
    if(st.error||g.error){setMessage(st.error?.message||g.error?.message||"Erro ao carregar notas.");return;}
    setStudents(st.data??[]);setGrades((g.data??[]) as Grade[]);
    if(!selectedStudent&&st.data?.[0])setSelectedStudent(st.data[0].id);
  }

  useEffect(()=>{loadBase()},[]);
  useEffect(()=>{loadClass()},[classId,subjectId,trimester]);

  const gradeFor=(id:string)=>grades.find(g=>g.student_id===id);
  function openGrade(id:string){
    setSelectedStudent(id);
    const g=gradeFor(id);
    const c=g?.component_scores||{};
    setComponents({teste1:String(c["teste1"]??""),teste2:String(c["teste2"]??""),trabalho:String(c["trabalho"]??"")});
    setMessage("");
  }

  async function save(){
    setMessage(""); setBusy(true);
    try{
      const c=currentClass;
      if(!c||!selectedStudent||!subjectId)return setMessage("Selecione turma, disciplina e aluno.");
      const vals=Object.values(components).map(Number);
      if(vals.some(v=>Number.isNaN(v)||v<0||v>20))return setMessage("Cada componente deve estar entre 0 e 20.");
      const existing=gradeFor(selectedStudent);
      const payload={student_id:selectedStudent,subject_id:subjectId,class_id:classId,trimester,academic_year:c.academic_year,teacher_id:(await supabase.auth.getUser()).data.user?.id,component_scores:components,state:existing?.state??"draft"};
      const result=existing
        ? await supabase.from("grades").update({component_scores:components}).eq("id",existing.id)
        : await supabase.from("grades").insert(payload);
      if(result.error)throw result.error;
      const id=existing?.id||(await supabase.from("grades").select("id").eq("student_id",selectedStudent).eq("subject_id",subjectId).eq("trimester",trimester).eq("academic_year",c.academic_year).single()).data?.id;
      if(id){const calc=await supabase.rpc("calculate_grade_final",{p_grade_id:id});if(calc.error)throw calc.error;}
      setMessage("Nota guardada e média calculada."); await loadClass();
    }catch(e:any){setMessage(e?.message||"Não foi possível guardar a nota.");}
    finally{setBusy(false);}
  }

  async function togglePublish(g:Grade){
    setBusy(true);setMessage("");
    const next=g.state==="published"?"draft":"published";
    const result=await supabase.from("grades").update({state:next}).eq("id",g.id);
    if(result.error)setMessage(result.error.message);else{setMessage(next==="published"?"Nota publicada.":"Nota voltou para rascunho.");await loadClass();}
    setBusy(false);
  }

  return <AdminShell>
    <p className="text-sm font-bold uppercase tracking-widest text-yellow-600">Administração académica</p>
    <h2 className="mt-1 text-3xl font-bold text-primary">Notas</h2>
    <p className="mt-2 text-sm text-muted-foreground">Lance componentes, calcule a média e controle a publicação das notas.</p>
    <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
      <section className="rounded-xl border bg-background p-5">
        <h3 className="font-semibold">Contexto</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">Turma<select value={classId} onChange={e=>setClassId(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2">{classes.map(c=><option key={c.id} value={c.id}>{c.level}ª — {c.name} ({c.academic_year})</option>)}</select></label>
          <label className="block text-sm">Disciplina<select value={subjectId} onChange={e=>setSubjectId(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2">{subjects.filter(s=>currentClass?s.min_level<=currentClass.level&&s.max_level>=currentClass.level:true).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label className="block text-sm">Trimestre<select value={trimester} onChange={e=>setTrimester(Number(e.target.value))} className="mt-1 w-full rounded-md border bg-background p-2"><option value={1}>1.º trimestre</option><option value={2}>2.º trimestre</option><option value={3}>3.º trimestre</option></select></label>
          {message&&<p className="rounded-md bg-muted p-2 text-sm">{message}</p>}
        </div>
      </section>
      <section className="rounded-xl border bg-background p-5">
        <h3 className="font-semibold">Alunos ativos</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{students.map(s=><button key={s.id} onClick={()=>openGrade(s.id)} className={"rounded-lg border p-3 text-left "+(selectedStudent===s.id?"border-yellow-500 ring-1 ring-yellow-500":"")}><p className="font-semibold">{s.full_name}</p><p className="text-xs text-muted-foreground">{s.registration_number}</p><p className="mt-1 text-sm">{gradeFor(s.id)?.final_grade??"—"} / 20 · {gradeFor(s.id)?.state==="published"?"Publicado":"Rascunho"}</p></button>)}</div>
        {selectedStudent&&<div className="mt-6 border-t pt-5">
          <p className="font-semibold">{students.find(s=>s.id===selectedStudent)?.full_name}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">{(["teste1","teste2","trabalho"] as const).map(k=><label key={k} className="text-sm">{k==="teste1"?"Teste 1":k==="teste2"?"Teste 2":"Trabalho"}<input type="number" min="0" max="20" step="0.01" value={components[k]} onChange={e=>setComponents({...components,[k]:e.target.value})} className="mt-1 w-full rounded-md border bg-background p-2"/></label>)}</div>
          <div className="mt-4 flex flex-wrap gap-2"><button disabled={busy} onClick={save} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Guardar nota</button>{gradeFor(selectedStudent)&&<button disabled={busy} onClick={()=>togglePublish(gradeFor(selectedStudent)!)} className="rounded-md border px-4 py-2 text-sm disabled:opacity-50">{gradeFor(selectedStudent)?.state==="published"?"Retirar publicação":"Publicar nota"}</button>}</div>
        </div>}
      </section>
    </div>
  </AdminShell>;
}
