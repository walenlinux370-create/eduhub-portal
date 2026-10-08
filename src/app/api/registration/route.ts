import {NextResponse} from "next/server";
import {registrationSchema} from "@/lib/validation";
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
    p_endpoint:"registration",
    p_window_seconds:3600,
    p_max_requests:5
  });
  if(limitError || allowed!==true){
    return NextResponse.json({ok:false},{status:429});
  }

  const form=await req.formData().catch(()=>null);
  if(!form)return NextResponse.json({ok:false},{status:400});

  const parsed=registrationSchema.safeParse(Object.fromEntries(form.entries()));
  if(!parsed.success)return NextResponse.json({ok:false},{status:400});

  const {error}=await supabaseAdmin.from("registration_requests").insert({
    full_name:parsed.data.full_name,
    contact:parsed.data.contact,
    guardian_name:parsed.data.guardian_name,
    guardian_contact:parsed.data.guardian_contact,
    class_level:parsed.data.class_level,
    class_name:parsed.data.class_name,
    consent_at:new Date().toISOString(),
    status:"pending"
  });

  if(error)return NextResponse.json({ok:false},{status:500});
  return NextResponse.json({ok:true},{status:201});
}
