import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/site/SiteLayout";
import { requireSupabase, isSupabaseConfigured } from "@/lib/supabase";
import DOMPurify from "dompurify";
import { news as fallbackNews } from "@/lib/news";
import { useEffect, useState } from "react";

type News={id:string;slug:string;title:string;excerpt:string;body_html:string;published_at:string|null};

export const Route = createFileRoute("/noticias")({
  head: () => ({meta:[
    { title:"Notícias e Eventos — Escola Comunitária Jossyquina" },
    { name:"description",content:"Novidades, eventos e comunicados da Escola Comunitária Jossyquina." },
    { property:"og:title",content:"Notícias — Jossyquina" },
    { property:"og:description",content:"Novidades, eventos e comunicados da escola." },
  ]}),
  component: Noticias,
});

function Noticias(){
  const [items,setItems]=useState<News[]>([]);
  useEffect(()=>{
    if(!isSupabaseConfigured){return}
    const supabase=requireSupabase();
    supabase.from("news").select("id,slug,title,excerpt,body_html,published_at").eq("published",true).order("published_at",{ascending:false})
      .then(({data})=>{if(data?.length)setItems(data as News[])});
  },[]);

  return <><PageHeader eyebrow="Actualidade" title="Notícias e eventos" /><Section>
    <div className="divide-y divide-border">
      {items.length?items.map(n=><article key={n.id} className="py-8">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">{n.published_at?new Date(n.published_at).toLocaleDateString("pt-MZ"):""} </p>
        <h2 className="mt-2 text-2xl font-semibold text-primary">{n.title}</h2>
        <p className="mt-2 text-muted-foreground">{n.excerpt}</p>
        <div className="prose prose-sm mt-4 max-w-none" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(n.body_html,{USE_PROFILES:{html:true},FORBID_TAGS:["style","form","iframe","object","embed"],FORBID_ATTR:["style","srcset"]})}} />
      </article>):fallbackNews.map(n=><article key={n.title} className="grid gap-3 py-8 md:grid-cols-[180px_1fr]">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">{n.date}<br/><span className="text-gold">{n.tag}</span></p>
        <div><h2 className="text-2xl font-semibold text-primary">{n.title}</h2><p className="mt-2 text-muted-foreground">{n.excerpt}</p></div>
      </article>)}
    </div>
  </Section></>;
}
