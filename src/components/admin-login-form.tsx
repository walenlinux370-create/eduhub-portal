"use client";

import {useState} from "react";
import Link from "next/link";
import {createSupabaseBrowserClient} from "@/lib/supabase/client";

type Props={role:"admin"|"teacher"};
const supabase=createSupabaseBrowserClient();

export function AdminLoginForm({role}:Props){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);
    setError("");

    if(password.length<12){
      setError("Não foi possível autenticar. Verifique os dados ou contacte o administrador.");
      setBusy(false);
      return;
    }

    const {error:authError}=await supabase.auth.signInWithPassword({
      email:email.trim().toLowerCase(),
      password
    });

    if(authError){
      setError("Não foi possível autenticar. Verifique os dados ou contacte o administrador.");
      setBusy(false);
      return;
    }

    const {data:factors,error:factorsError}=await supabase.auth.mfa.listFactors();
    const verifiedTotp=factors?.totp?.find(factor=>factor.status==="verified");

    if(factorsError || !verifiedTotp){
      await supabase.auth.signOut();
      setError("Não foi possível autenticar. A autenticação multifator TOTP é obrigatória.");
      setBusy(false);
      return;
    }

    const {data:challenge,error:challengeError}=await supabase.auth.mfa.challenge({
      factorId:verifiedTotp.id
    });

    if(challengeError || !challenge?.id){
      await supabase.auth.signOut();
      setError("Não foi possível autenticar. Tente novamente.");
      setBusy(false);
      return;
    }

    const code=window.prompt("Introduza o código TOTP de 6 dígitos.");
    if(!code || !/^\d{6}$/.test(code)){
      await supabase.auth.signOut();
      setError("Não foi possível autenticar. O código MFA é obrigatório.");
      setBusy(false);
      return;
    }

    const {error:verifyError}=await supabase.auth.mfa.verify({
      factorId:verifiedTotp.id,
      challengeId:challenge.id,
      code
    });

    if(verifyError){
      await supabase.auth.signOut();
      setError("Não foi possível autenticar. Verifique o código MFA e tente novamente.");
      setBusy(false);
      return;
    }

    window.location.assign(role==="admin"?"/admin":"/professor");
  }

  return <form className="card mt-7 p-7" onSubmit={submit}>
    <label className="block text-sm font-bold">E-mail institucional
      <input name="email" type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/>
    </label>
    <label className="mt-4 block text-sm font-bold">Palavra-passe
      <input name="password" type="password" required minLength={12} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/>
    </label>
    <button disabled={busy} className="btn-primary mt-6 w-full">{busy?"A autenticar…":"Entrar"}</button>
    {role==="admin"&&<Link className="mt-4 block text-center text-sm font-bold underline" href="/admin/recuperar">Esqueci a palavra-passe</Link>}
    {error&&<p role="alert" className="mt-4 text-sm font-bold text-red-700">{error}</p>}
  </form>;
}
