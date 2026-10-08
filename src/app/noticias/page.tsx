import Link from "next/link";
import {supabaseAdmin} from "@/lib/supabase/admin";
import {sanitizeHtml} from "@/lib/cms";

export const metadata={title:"Notícias",description:"Notícias, avisos e vídeos da Escola Comunitária Jossyquina."};

export default async function Page(){
  const {data:items}=await supabaseAdmin.from("news").select("id,slug,title,excerpt,body_html,video_url,published_at").eq("published",true).order("published_at",{ascending:false}).limit(20);
  return <main className="container-site py-14">
    <nav aria-label="Breadcrumb" className="mb-5 text-sm"><Link href="/">Início</Link> <span aria-hidden="true">/</span> <span>Notícias</span></nav>
    <h1 className="text-4xl font-black">Notícias e Avisos</h1>
    <p className="mt-3 text-slate-600">Informações oficiais da Escola Comunitária Jossyquina.</p>
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {(items??[]).map(item=><article className="card p-6" key={item.id}>
        <p className="text-xs font-bold uppercase text-blue-700">{item.published_at?new Date(item.published_at).toLocaleDateString("pt-MZ"): "Publicado"}</p>
        <h2 className="mt-2 text-2xl font-black">{item.title}</h2>
        <p className="mt-3 text-slate-600">{item.excerpt}</p>
        <div className="prose mt-5 max-w-none text-sm" dangerouslySetInnerHTML={{__html:sanitizeHtml(item.body_html)}} />
        {item.video_url&&<div className="mt-5 aspect-video overflow-hidden rounded-xl"><iframe title={item.title} src={item.video_url} className="h-full w-full" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation" allowFullScreen/></div>}
        <Link href={"/noticias/"+item.slug} className="mt-5 inline-block font-bold underline">Abrir notícia</Link>
      </article>)}
    </div>
    {!items?.length&&<p className="mt-8 card p-7 text-slate-600">Ainda não existem notícias publicadas.</p>}
  </main>
}