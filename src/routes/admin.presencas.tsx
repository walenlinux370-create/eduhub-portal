import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireSupabase } from "@/lib/supabase";

type ClassRow={id:string;level:number;name:string;academic_year:number};
type Subject={id:string;name:string;min_level:number;max_level:number};
type Student={id:string;full_name:string;registration_number:string};
type Attendance={id:string;student_id:string;present:boolean;attendance_date:string};

export const Route=createFileRoute("/admin/presencas")({
  head:()=>({meta:[{title:"Presenças — Painel Administrativo"},{name:"robots",content:"noindex,nofollow"}]}),
  component:PresencasPage,
});

function PresencasPage(){
  const supabase=requireSupabase();
  const [classes,setClasses]=useState<ClassRow[]>([]);
  const [subjects,setSubjects]=useState<Subject[]>([]);
  const [students,setStudents]=useState<Student[]>([]);
  const [attendance,setAttendance]=useState<Attendance[]>([]);
  const [classId,setClassId]=useState("");
  const [subjectId,setSubjectId]=useState("");
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [marks,setMarks]=useState<Record<string,boolean>>({});
  const currentClass=useMemo(()=>classes.find(c=>c.id===classId),[classes,classId]);

  async function loadBase(){
    const [c,s]=await Promise.all([
      supabase.from("classes").select("id,level,name,academic_year").order("academic_year",{ascending:false}).order("level").order("name"),
      supabase.from("subjects").select("id,name,min_level,max_level").order("name")
    ]);
    if(c.error||s.error){setMessage(c.error?.message||s.error?.message||"Erro ao carregar dados.");return;}
    setClasses(c.data??[]);setSubjects(s.data??[]);
    if(!classId&&c.data?.[0])setClassId(c.data[0].id);
    const firstClass=c.data?.[0];
    const firstSubject=s.data?.find(x=>firstClass?x.min_level<=firstClass.level&&x.max_level>=firstClass.level:true);
    if(firstSubject) setSubjectId(firstSubject.id);
  }

  async function loadSheet(){
    if(!classId||!subjectId||!date)return;
    const [st,at]=await Promise.all([
      supabase.from("students").select("id,full_name,registration_number").eq("class_id",classId).eq("status","active").order("full_name"),
      supabase.from("attendance").select("id,student_id,present,attendance_date").eq("class_id",classId).eq("subject_id",subjectId).eq("attendance_date",date)
    ]);
    if(st.error||at.error){setMessage(st.error?.message||at.error?.message||"Erro ao carregar presenças.");return;}
    setStudents(st.data??[]);setAttendance((at.data??[]) as Attendance[]);
    setMarks(Object.fromEntries((at.data??[]).map(x=>[x.student_id,x.present])));
  }

  useEffect(()=>{loadBase()},[]);
  useEffect(()=>{loadSheet()},[classId,subjectId,date]);

  const filteredSubjects=subjects.filter(s=>currentClass?s.min_level<=currentClass.level&&s.max_level>=currentClass.level:true);

  async function saveSheet(){
    if(!classId||!subjectId||!date||!students.length)return;
    setBusy(true);setMessage("");
    try{
      const existingByStudent=new Map(attendance.map(a=>[a.student_id,a.id]));
      for(const student of students){
        const present=marks[student.id]===true;
        const existingId=existingByStudent.get(student.id);
        const result=existingId
          ? await supabase.from("attendance").update({present}).eq("id",existingId)
          : await supabase.from("attendance").insert({student_id:student.id,class_id:classId,subject_id:subjectId,attendance_date:date,present});
        if(result.error)throw result.error;
      }
      setMessage("Folha de presença guardada com sucesso.");
      await loadSheet();
    }catch(e:any){setMessage(e?.message||"Não foi possível guardar a folha de presença.");}
    finally{setBusy(false);}
  }

  const presentCount=students.filter(s=>marks[s.id]===true).length;
  return <AdminShell>
    <p className="text-sm font-bold uppercase tracking-widest text-yellow-600">Administração académica</p>
    <h2 className="mt-1 text-3xl font-bold text-primary">Presenças</h2>
    <p className="mt-2 text-sm text-muted-foreground">Registe a assiduidade por turma, disciplina e data. O professor responsável é determinado no servidor.</p>
    <section className="mt-6 rounded-xl border bg-background p-5">
      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-sm">Turma<select value={classId} onChange={e=>setClassId(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2">{classes.map(c=><option key={c.id} value={c.id}>{c.level}ª — {c.name} ({c.academic_year})</option>)}</select></label>
        <label className="text-sm">Disciplina<select value={subjectId} onChange={e=>setSubjectId(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2">{filteredSubjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label className="text-sm">Data<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2"/></label>
        <div className="rounded-md bg-muted p-3 text-sm"><p className="font-semibold">Resumo</p><p className="mt-1">{presentCount} de {students.length} presentes</p></div>
      </div>
      {message&&<p className="mt-4 rounded-md bg-muted p-3 text-sm">{message}</p>}
    </section>
    <section className="mt-6 overflow-hidden rounded-xl border bg-background">
      <div className="flex items-center justify-between border-b p-5"><div><h3 className="font-semibold">Folha de presença</h3><p className="text-sm text-muted-foreground">Marque os alunos presentes; os restantes ficam ausentes.</p></div><button disabled={busy||!students.length} onClick={saveSheet} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy?"A guardar…":"Guardar presenças"}</button></div>
      <div className="divide-y">
        {students.map((student,index)=><label key={student.id} className="flex cursor-pointer items-center gap-4 p-4 hover:bg-muted/40"><input type="checkbox" checked={marks[student.id]===true} onChange={e=>setMarks({...marks,[student.id]:e.target.checked})} className="h-5 w-5"/><span className="w-8 text-sm text-muted-foreground">{index+1}.</span><span className="flex-1"><span className="font-medium">{student.full_name}</span><span className="ml-2 text-xs text-muted-foreground">{student.registration_number}</span></span><span className="text-sm">{marks[student.id]===true?"Presente":"Ausente"}</span></label>)}
        {!students.length&&<p className="p-8 text-center text-sm text-muted-foreground">Não existem alunos ativos nesta turma.</p>}
      </div>
    </section>
  </AdminShell>;
}
