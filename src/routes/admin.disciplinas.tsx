import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireSupabase } from "@/lib/supabase";

type Subject={id:string;name:string;min_level:number;max_level:number};

export const Route=createFileRoute("/admin/disciplinas")({
  head:()=>({meta:[{title:"Disciplinas — Painel Administrativo"},{name:"robots",content:"noindex,nofollow"}]}),
  component:DisciplinasPage,
});

function DisciplinasPage(){
  const [rows,setRows]=useState<Subject[]>([]);
  const [name,setName]=useState(""); const [min,setMin]=useState(1); const [max,setMax]=useState(12);
  const [editing,setEditing]=useState<string|null>(null); const [message,setMessage]=useState("");
  const supabase=requireSupabase();
  async function load(){const {data,error}=await supabase.from("subjects").select("id,name,min_level,max_level").order("name"); if(error)setMessage(error.message);else setRows(data??[]);}
  useEffect(()=>{load()},[]);
  async function save(){
    setMessage(""); const clean=name.trim(); if(!clean)return setMessage("Indique o nome da disciplina.");
    if(min>max)return setMessage("O nível inicial não pode ser maior que o final.");
    const result=editing?await supabase.from("subjects").update({name:clean,min_level:min,max_level:max}).eq("id",editing):await supabase.from("subjects").insert({name:clean,min_level:min,max_level:max});
    if(result.error)setMessage(result.error.message);else{setMessage(editing?"Disciplina atualizada.":"Disciplina criada.");setName("");setEditing(null);await load();}
  }
  return <AdminShell>
    <p className="text-sm font-bold uppercase tracking-widest text-yellow-600">Administração académica</p><h2 className="mt-1 text-3xl font-bold text-primary">Disciplinas</h2><p className="mt-2 text-sm text-muted-foreground">Defina o intervalo de classes em que cada disciplina pode ser atribuída.</p>
    <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-xl border bg-background p-5"><h3 className="font-semibold">{editing?"Editar disciplina":"Nova disciplina"}</h3><div className="mt-4 space-y-3">
        <label className="block text-sm">Nome<input value={name} onChange={e=>setName(e.target.value)} maxLength={120} className="mt-1 w-full rounded-md border bg-background p-2"/></label>
        <div className="grid grid-cols-2 gap-3"><label className="text-sm">Da classe<select value={min} onChange={e=>setMin(Number(e.target.value))} className="mt-1 w-full rounded-md border bg-background p-2">{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}ª</option>)}</select></label><label className="text-sm">Até<select value={max} onChange={e=>setMax(Number(e.target.value))} className="mt-1 w-full rounded-md border bg-background p-2">{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}ª</option>)}</select></label></div>
        {message&&<p className="rounded-md bg-muted p-2 text-sm">{message}</p>}<div className="flex gap-2"><button onClick={save} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{editing?"Guardar":"Criar disciplina"}</button>{editing&&<button onClick={()=>{setEditing(null);setName("");setMessage("")}} className="rounded-md border px-4 py-2 text-sm">Cancelar</button>}</div>
      </div></section>
      <section className="overflow-hidden rounded-xl border bg-background"><div className="border-b p-4 font-semibold">{rows.length} disciplina(s)</div><div className="divide-y">{rows.map(r=><div key={r.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-semibold">{r.name}</p><p className="text-sm text-muted-foreground">{r.min_level}ª–{r.max_level}ª classe</p></div><button onClick={()=>{setEditing(r.id);setName(r.name);setMin(r.min_level);setMax(r.max_level);setMessage("")}} className="rounded-md border px-3 py-2 text-sm">Editar</button></div>)}{!rows.length&&<p className="p-6 text-sm text-muted-foreground">Nenhuma disciplina cadastrada.</p>}</div></section>
    </div>
  </AdminShell>;
}
