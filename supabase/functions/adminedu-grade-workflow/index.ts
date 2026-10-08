import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Content-Type":"application/json"};

Deno.serve(async (req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  if(req.method!=="POST") return new Response(JSON.stringify({error:"method_not_allowed"}),{status:405,headers:cors});
  const authHeader=req.headers.get("Authorization");
  if(!authHeader?.startsWith("Bearer ")) return new Response(JSON.stringify({error:"unauthorized"}),{status:401,headers:cors});
  const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,{global:{headers:{Authorization:authHeader}}});
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError||!user) return new Response(JSON.stringify({error:"unauthorized"}),{status:401,headers:cors});
  let body:any; try{body=await req.json();}catch{return new Response(JSON.stringify({error:"invalid_request"}),{status:400,headers:cors});}
  if(!body?.grade_sheet_id||!/^[0-9a-f-]{36}$/i.test(body.grade_sheet_id)) return new Response(JSON.stringify({error:"invalid_request"}),{status:400,headers:cors});
  const states:any={submit_grade_sheet:"submitted",review_grade_sheet:"reviewed",approve_grade_sheet:"approved",publish_grade_sheet:"published"};
  const nextState=body.action==="return_grade_sheet"?"returned":states[body.action];
  if(!nextState) return new Response(JSON.stringify({error:"invalid_request"}),{status:400,headers:cors});
  if(body.action==="return_grade_sheet"&&(!body.reason||body.reason.trim().length<10)) return new Response(JSON.stringify({error:"invalid_request"}),{status:400,headers:cors});
  const patch:any={state:nextState}; if(body.action==="return_grade_sheet") patch.return_reason=body.reason.trim();
  const {data,error}=await supabase.from("grade_sheets").update(patch).eq("id",body.grade_sheet_id).select("id,state,version,updated_at").maybeSingle();
  if(error||!data){console.error("grade_workflow_failed",{user_id:user.id,action:body.action,error:error?.message});return new Response(JSON.stringify({error:"request_failed"}),{status:400,headers:cors});}
  return new Response(JSON.stringify({ok:true,grade_sheet:data}),{status:200,headers:cors});
});