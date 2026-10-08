import {NextResponse} from "next/server";
import {contactSchema} from "@/lib/validation";
import {supabaseAdmin} from "@/lib/supabase/admin";

function clientKey(req:Request){
  return req.headers.get("x-real-ip")?.trim()
    || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

export async function POST(req:Request){
  const key=clientKey(req);
  const {data:allowed,error:limitError}=await supabaseAdmin.rpc("check_public_rate_limit",{
    p_key:key,
    p_endpoint:"contact",
    p_window_seconds:3600,
    p_max_requests:10
  });
  if(limitError || allowed!==true){
    return NextResponse.json({ok:false},{status:429});
  }

  const form=await req.formData().catch(()=>null);
  if(!form)return NextResponse.json({ok:false},{status:400});

  const parsed=contactSchema.safeParse(Object.fromEntries(form.entries()));
  if(!parsed.success)return NextResponse.json({ok:false},{status:400});

  if(parsed.data.website)return NextResponse.json({ok:true});
  return NextResponse.json({ok:true});
}
