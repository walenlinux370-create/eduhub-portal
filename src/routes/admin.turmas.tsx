import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireSupabase } from "@/lib/supabase";

type ClassRow = { id:string; level:number; name:string; academic_year:number };

export const Route = createFileRoute("/admin/turmas")({
  head: () => ({ meta: [{ title: "Turmas — Painel Administrativo" }, { name:"robots", content:"noindex,nofollow" }] }),
  component: TurmasPage,
});

function TurmasPage() {
  const [rows,setRows]=useState<ClassRow[]>([]);
  const [level,setLevel]=useState(1);
  const [name,setName]=useState("");
  const [year,setYear]=useState(new Date().getFullYear());
  const [editing,setEditing]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const supabase=requireSupabase();

  async function load(){
    const {data,error}=await supabase.from("classes").select("id,level,name,academic_year").order("academic_year",{ascending:false}).order("level").order("name");
    if(error) setMessage(error.message); else setRows(data??[]);
  }
  useEffect(()=>{load()},[]);

  async function save(){
    setMessage("");
    const clean=name.trim().toUpperCase();
    if(!clean) return setMessage("Indique o nome da turma.");
    const payload={level,name:clean,academic_year:year};
    const result=editing
      ? await supabase.from("classes").update(payload).eq("id",editing)
      : await supabase.from("classes").insert(payload);
    if(result.error) setMessage(result.error.message);
    else { setMessage(editing?"Turma atualizada.":"Turma criada."); setName(""); setEditing(null); await load(); }
  }
  function edit(r:ClassRow){setEditing(r.id);setLevel(r.level);setName(r.name);setYear(r.academic_year);window.scrollTo({top:0,behavior:"smooth"});}
  return <AdminShell>
    <p className="text-sm font-bold uppercase tracking-widest text-yellow-600">Administração académica</p>
    <h2 className="mt-1 text-3xl font-bold text-primary">Turmas</h2>
    <p className="mt-2 text-sm text-muted-foreground">Crie e atualize turmas por nível e ano letivo.</p>
    <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-xl border bg-background p-5">
        <h3 className="font-semibold">{editing?"Editar turma":"Nova turma"}</h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">Nível<select value={level} onChange={e=>setLevel(Number(e.target.value))} className="mt-1 w-full rounded-md border bg-background p-2">{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}ª classe</option>)}</select></label>
          <label className="block text-sm">Nome da turma<input value={name} onChange={e=>setName(e.target.value)} placeholder="A" maxLength={20} className="mt-1 w-full rounded-md border bg-background p-2"/></label>
          <label className="block text-sm">Ano letivo<input type="number" value={year} onChange={e=>setYear(Number(e.target.value))} min={2020} max={2100} className="mt-1 w-full rounded-md border bg-background p-2"/></label>
          {message && <p className="rounded-md bg-muted p-2 text-sm">{message}</p>}
          <div className="flex gap-2"><button onClick={save} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{editing?"Guardar":"Criar turma"}</button>{editing&&<button onClick={()=>{setEditing(null);setName("");setMessage("")}} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>}</div>
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border bg-background">
        <div className="border-b p-4 font-semibold">{rows.length} turma(s)</div>
        <div className="divide-y">{rows.map(r=><div key={r.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-semibold">{r.level}ª classe — Turma {r.name}</p><p className="text-sm text-muted-foreground">Ano letivo {r.academic_year}</p></div><button onClick={()=>edit(r)} className="rounded-md border px-3 py-2 text-sm">Editar</button></div>)}{!rows.length&&<p className="p-6 text-sm text-muted-foreground">Nenhuma turma cadastrada.</p>}</div>
      </section>
    </div>
  </AdminShell>;
}
