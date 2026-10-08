import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireSupabase } from "@/lib/supabase";

type Teacher={id:string;display_name:string;is_active:boolean};
type ClassRow={id:string;level:number;name:string;academic_year:number};
type Subject={id:string;name:string;min_level:number;max_level:number};
type Assignment={id:string;teacher_id:string;subject_id:string;class_id:string;academic_year:number; teacher?:Teacher; subject?:Subject; class?:ClassRow};

export const Route=createFileRoute("/admin/professores")({
  head:()=>({meta:[{title:"Professores — Painel Administrativo"},{name:"robots",content:"noindex,nofollow"}]}),
  component:ProfessoresPage,
});

function ProfessoresPage(){
  const [teachers,setTeachers]=useState<Teacher[]>([]); const [classes,setClasses]=useState<ClassRow[]>([]); const [subjects,setSubjects]=useState<Subject[]>([]); const [assignments,setAssignments]=useState<Assignment[]>([]);
  const [teacherId,setTeacherId]=useState(""); const [subjectId,setSubjectId]=useState(""); const [classId,setClassId]=useState(""); const [year,setYear]=useState(new Date().getFullYear()); const [message,setMessage]=useState("");
  const supabase=requireSupabase();
  async function load(){
    const [t,c,s,a]=await Promise.all([
      supabase.from("user_profiles").select("id,display_name,is_active").eq("role","teacher").order("display_name"),
      supabase.from("classes").select("id,level,name,academic_year").order("academic_year",{ascending:false}).order("level").order("name"),
      supabase.from("subjects").select("id,name,min_level,max_level").order("name"),
      supabase.from("teacher_assignments").select("id,teacher_id,subject_id,class_id,academic_year").order("academic_year",{ascending:false})
    ]);
    const e=[t.error,c.error,s.error,a.error].find(Boolean); if(e){setMessage(e!.message);return;}
    setTeachers(t.data??[]);setClasses(c.data??[]);setSubjects(s.data??[]);setAssignments(a.data??[]);
    if(!teacherId&&t.data?.[0])setTeacherId(t.data[0].id); if(!classId&&c.data?.[0]){setClassId(c.data[0].id);setYear(c.data[0].academic_year)} if(!subjectId&&s.data?.[0])setSubjectId(s.data[0].id);
  }
  useEffect(()=>{load()},[]);
  const teacherMap=Object.fromEntries(teachers.map(x=>[x.id,x])); const classMap=Object.fromEntries(classes.map(x=>[x.id,x])); const subjectMap=Object.fromEntries(subjects.map(x=>[x.id,x]));
  async function assign(){
    setMessage(""); if(!teacherId||!subjectId||!classId)return setMessage("Selecione professor, disciplina e turma.");
    const c=classMap[classId]; if(c) setYear(c.academic_year);
    const result=await supabase.from("teacher_assignments").insert({teacher_id:teacherId,subject_id:subjectId,class_id:classId,academic_year:c?.academic_year??year});
    if(result.error)setMessage(result.error.message);else{setMessage("Atribuição criada.");await load();}
  }
  async function remove(id:string){const result=await supabase.from("teacher_assignments").delete().eq("id",id);if(result.error)setMessage(result.error.message);else{setMessage("Atribuição removida.");await load();}}
  return <AdminShell>
    <p className="text-sm font-bold uppercase tracking-widest text-yellow-600">Administração académica</p><h2 className="mt-1 text-3xl font-bold text-primary">Professores</h2><p className="mt-2 text-sm text-muted-foreground">Consulte professores ativos e atribua disciplinas às turmas.</p>
    <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="rounded-xl border bg-background p-5"><h3 className="font-semibold">Nova atribuição</h3><div className="mt-4 space-y-3">
        <label className="block text-sm">Professor<select value={teacherId} onChange={e=>setTeacherId(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2">{teachers.map(t=><option key={t.id} value={t.id}>{t.display_name}{!t.is_active?" — inativo":""}</option>)}</select></label>
        <label className="block text-sm">Turma<select value={classId} onChange={e=>{const id=e.target.value;setClassId(id);if(classMap[id])setYear(classMap[id].academic_year)}} className="mt-1 w-full rounded-md border bg-background p-2">{classes.map(c=><option key={c.id} value={c.id}>{c.level}ª — {c.name} ({c.academic_year})</option>)}</select></label>
        <label className="block text-sm">Disciplina<select value={subjectId} onChange={e=>setSubjectId(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2">{subjects.map(s=><option key={s.id} value={s.id}>{s.name} ({s.min_level}ª–{s.max_level}ª)</option>)}</select></label>
        {message&&<p className="rounded-md bg-muted p-2 text-sm">{message}</p>}<button onClick={assign} disabled={!teachers.length||!classes.length||!subjects.length} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Atribuir professor</button>
      </div></section>
      <section className="overflow-hidden rounded-xl border bg-background"><div className="border-b p-4 font-semibold">{assignments.length} atribuição(ões)</div><div className="divide-y">{assignments.map(a=><div key={a.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-semibold">{teacherMap[a.teacher_id]?.display_name??"Professor"}</p><p className="text-sm text-muted-foreground">{subjectMap[a.subject_id]?.name??"Disciplina"} · {classMap[a.class_id] ? classMap[a.class_id].level+"ª — "+classMap[a.class_id].name : "Turma"} · {a.academic_year}</p></div><button onClick={()=>remove(a.id)} className="rounded-md border px-3 py-2 text-sm">Remover</button></div>)}{!assignments.length&&<p className="p-6 text-sm text-muted-foreground">Nenhuma atribuição cadastrada.</p>}</div></section>
    </div>
  </AdminShell>;
}
