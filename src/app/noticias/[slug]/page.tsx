import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {sanitizeHtml,validateVideoUrl} from "@/lib/cms";

type Props={params:Promise<{slug:string}>};

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {slug}=await params;
  const {data:item}=await supabaseAdmin.from("news").select("title,excerpt").eq("slug",slug).eq("published",true).maybeSingle();
  return item?{title:item.title,description:item.excerpt}:{title:"Notícia não encontrada"};
}

export default async function Page({params}:Props){
  const {slug}=await params;
  const {data:item}=await supabaseAdmin.from("news").select("title,excerpt,body_html,video_url,published_at,slug").eq("slug",slug).eq("published",true).maybeSingle();
  if(!item)notFound();
  const video=item.video_url?validateVideoUrl(item.video_url):null;
  const jsonLd={"@context":"https://schema.org","@type":"Article","headline":item.title,"description":item.excerpt,"datePublished":item.published_at};
  return <main className="container-site py-14">
    <nav aria-label="Breadcrumb" className="mb-5 text-sm"><Link href="/">Início</Link> <span aria-hidden="true">/</span> <Link href="/noticias">Notícias</Link> <span aria-hidden="true">/</span> <span>{item.title}</span></nav>
    <article className="mx-auto max-w-4xl">
      <p className="text-sm font-bold text-blue-700">{item.published_at?new Date(item.published_at).toLocaleDateString("pt-MZ"):"Publicado"}</p>
      <h1 className="mt-2 text-4xl font-black">{item.title}</h1>
      <p className="mt-4 text-lg text-slate-600">{item.excerpt}</p>
      <div className="prose mt-8 max-w-none" dangerouslySetInnerHTML={{__html:sanitizeHtml(item.body_html)}} />
      {video&&<div className="mt-8 aspect-video overflow-hidden rounded-xl"><iframe title={item.title} src={video} className="h-full w-full" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" allowFullScreen/></div>}
    </article>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
  </main>
}