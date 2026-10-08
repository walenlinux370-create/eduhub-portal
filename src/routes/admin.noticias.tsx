import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireSupabase } from "@/lib/supabase";

type News={id:string;slug:string;title:string;excerpt:string;body_html:string;video_url:string|null;published:boolean;published_at:string|null;created_at:string};

export const Route=createFileRoute("/admin/noticias")({
  head:()=>({meta:[{title:"Notícias — Painel Administrativo"},{name:"robots",content:"noindex,nofollow"}]}),
  component:AdminNoticiasPage,
});

function slugify(value:string){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,180)}

function AdminNoticiasPage(){
  const supabase=requireSupabase();
  const empty={slug:"",title:"",excerpt:"",body_html:"",video_url:"",published:false};
  const [items,setItems]=useState<News[]>([]);
  const [form,setForm]=useState(empty);
  const [editing,setEditing]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  async function load(){
    const r=await supabase.from("news").select("id,slug,title,excerpt,body_html,video_url,published,published_at,created_at").order("created_at",{ascending:false});
    if(r.error)setMessage(r.error.message); else setItems((r.data??[]) as News[]);
  }
  useEffect(()=>{load()},[]);

  function edit(n:News){
    setEditing(n.id);setForm({slug:n.slug,title:n.title,excerpt:n.excerpt,body_html:n.body_html,video_url:n.video_url??"",published:n.published});
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function reset(){setEditing(null);setForm(empty);}

  async function save(){
    setMessage("");
    const slug=slugify(form.slug||form.title);
    if(!slug||slug.length<3){setMessage("Informe um título/slug válido.");return}
    if(!form.title.trim()||form.title.length>180){setMessage("O título deve ter entre 1 e 180 caracteres.");return}
    if(!form.excerpt.trim()||form.excerpt.length>500){setMessage("O resumo deve ter entre 1 e 500 caracteres.");return}
    if(!form.body_html.trim()){setMessage("O conteúdo é obrigatório.");return}
    if(form.video_url&&!/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(form.video_url)){setMessage("O vídeo deve ser do YouTube.");return}
    setBusy(true);
    try{
      const payload={slug,title:form.title.trim(),excerpt:form.excerpt.trim(),body_html:form.body_html,video_url:form.video_url.trim()||null,published:form.published};
      const r=editing?await supabase.from("news").update(payload).eq("id",editing):await supabase.from("news").insert(payload);
      if(r.error)throw r.error;
      setMessage(editing?"Notícia atualizada.":"Notícia criada.");
      reset();await load();
    }catch(e:any){setMessage(e?.message||"Não foi possível guardar a notícia.");}
    finally{setBusy(false)}
  }

  async function toggle(n:News){
    setBusy(true);setMessage("");
    try{
      const r=await supabase.from("news").update({published:!n.published}).eq("id",n.id);
      if(r.error)throw r.error;
      await load();setMessage(!n.published?"Notícia publicada.":"Notícia retirada da publicação.");
    }catch(e:any){setMessage(e?.message||"Não foi possível alterar a publicação.");}
    finally{setBusy(false)}
  }

  async function remove(n:News){
    if(!window.confirm("Eliminar a notícia ""+n.title+""?"))return;
    setBusy(true);
    try{const r=await supabase.from("news").delete().eq("id",n.id);if(r.error)throw r.error;await load();setMessage("Notícia eliminada.");}
    catch(e:any){setMessage(e?.message||"Não foi possível eliminar a notícia.");}
    finally{setBusy(false)}
  }

  return <AdminShell>
    <p className="text-sm font-bold uppercase tracking-widest text-yellow-600">Administração</p>
    <h2 className="mt-1 text-3xl font-bold text-primary">Notícias</h2>
    <p className="mt-2 text-sm text-muted-foreground">Crie e publique notícias institucionais. O conteúdo é validado no banco de dados e todas as alterações são auditadas.</p>
    <section className="mt-6 rounded-xl border bg-background p-5">
      <div className="flex items-center justify-between"><h3 className="font-semibold">{editing?"Editar notícia":"Nova notícia"}</h3>{editing&&<button onClick={reset} className="rounded-md border px-3 py-2 text-sm">Cancelar</button>}</div>
      <div className="mt-4 grid gap-4">
        <label className="text-sm">Título<input value={form.title} maxLength={180} onChange={e=>setForm({...form,title:e.target.value})} className="mt-1 w-full rounded-md border bg-background p-2"/></label>
        <label className="text-sm">Slug<input value={form.slug} maxLength={180} onChange={e=>setForm({...form,slug:e.target.value})} className="mt-1 w-full rounded-md border bg-background p-2" placeholder="ex.: inscricoes-abertas-2027"/></label>
        <label className="text-sm">Resumo<textarea value={form.excerpt} maxLength={500} rows={3} onChange={e=>setForm({...form,excerpt:e.target.value})} className="mt-1 w-full rounded-md border bg-background p-2"/></label>
        <label className="text-sm">Conteúdo HTML<textarea value={form.body_html} rows={10} onChange={e=>setForm({...form,body_html:e.target.value})} className="mt-1 w-full rounded-md border bg-background p-2 font-mono text-sm"/></label>
        <label className="text-sm">Vídeo YouTube (opcional)<input value={form.video_url} onChange={e=>setForm({...form,video_url:e.target.value})} className="mt-1 w-full rounded-md border bg-background p-2" placeholder="https://www.youtube.com/..."/></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Publicar imediatamente</label>
      </div>
      {message&&<p className="mt-4 rounded-md bg-muted p-3 text-sm">{message}</p>}
      <button disabled={busy} onClick={save} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy?"A guardar…":"Guardar notícia"}</button>
    </section>
    <section className="mt-6 overflow-hidden rounded-xl border bg-background">
      <div className="border-b p-5"><h3 className="font-semibold">Arquivo</h3><p className="text-sm text-muted-foreground">{items.length} notícia(s).</p></div>
      <div className="divide-y">
        {items.map(n=><div key={n.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center"><div className="min-w-0 flex-1"><p className="font-medium">{n.title}</p><p className="text-xs text-muted-foreground">{n.slug} · {n.published?"Publicada":"Rascunho"}</p></div><div className="flex gap-2"><button onClick={()=>edit(n)} className="rounded-md border px-3 py-2 text-sm">Editar</button><button disabled={busy} onClick={()=>toggle(n)} className="rounded-md border px-3 py-2 text-sm">{n.published?"Despublicar":"Publicar"}</button><button disabled={busy} onClick={()=>remove(n)} className="rounded-md border px-3 py-2 text-sm text-destructive">Eliminar</button></div></div>)}
        {!items.length&&<p className="p-8 text-center text-sm text-muted-foreground">Ainda não existem notícias.</p>}
      </div>
    </section>
  </AdminShell>;
}
