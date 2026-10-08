import { createServerFn } from "@tanstack/react-start";
import { createServerSupabase } from "./server";

type SessionInput = {
  access_token: string;
  refresh_token: string;
};

type AdminLoginInput = {
  email: string;
  password: string;
};

export const checkAuthRuntime = createServerFn({ method: "GET" })
  .handler(async () => {
    const supabase = createServerSupabase();
    const { error } = await supabase.auth.getSession();

    if (error) {
      throw new Error("Runtime SSR do Supabase indisponível: " + error.message);
    }

    return { ok: true };
  });

export const signInAdmin = createServerFn({ method: "POST" })
  .validator((data: AdminLoginInput) => {
    const email = data.email?.trim();
    if (!email || !data.password) {
      throw new Error("E-mail e palavra-passe são obrigatórios.");
    }
    return { email, password: data.password };
  })
  .handler(async ({ data }) => {
    const supabase = createServerSupabase();

    const signed = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signed.error) {
      throw new Error("Falha na autenticação: " + signed.error.message);
    }

    const session = signed.data.session;
    const user = signed.data.user;

    if (!session?.user?.id || !user?.id) {
      throw new Error("O Supabase autenticou a conta, mas não criou uma sessão válida.");
    }

    const profileResult = await supabase
      .from("user_profiles")
      .select("display_name,role,is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileResult.error) {
      await supabase.auth.signOut();
      throw new Error("Não foi possível validar o perfil administrativo: " + profileResult.error.message);
    }

    if (!profileResult.data || profileResult.data.role !== "admin" || profileResult.data.is_active !== true) {
      await supabase.auth.signOut();
      throw new Error("A conta autenticada não tem permissões administrativas ativas.");
    }

    const aalResult = await supabase.auth.mfa.getAuthenticatorAssuranceLevel(session.access_token);

    if (aalResult.error) {
      await supabase.auth.signOut();
      throw new Error("Não foi possível verificar o nível de autenticação MFA: " + aalResult.error.message);
    }

    return {
      ok: true,
      userId: user.id,
      displayName: profileResult.data.display_name ?? "Administrador",
      currentLevel: aalResult.data.currentLevel,
      nextLevel: aalResult.data.nextLevel,
    };
  });

export const establishAdminSession = createServerFn({ method: "POST" })
  .validator((data: SessionInput) => {
    if (!data.access_token || !data.refresh_token) {
      throw new Error("Dados de sessão incompletos.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const supabase = createServerSupabase();

    const sessionResult = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

    if (sessionResult.error) {
      throw new Error("Não foi possível guardar a sessão administrativa: " + sessionResult.error.message);
    }

    const session = sessionResult.data.session;
    if (!session?.user?.id) {
      throw new Error("O Supabase não devolveu uma sessão administrativa válida.");
    }

    const userResult = await supabase.auth.getUser();
    if (userResult.error || !userResult.data.user?.id) {
      throw new Error("A identidade administrativa não pôde ser confirmada: " + (userResult.error?.message ?? "utilizador ausente"));
    }

    const [profileResult, aalResult] = await Promise.all([
      supabase.from("user_profiles").select("display_name,role,is_active").eq("id", session.user.id).maybeSingle(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(session.access_token),
    ]);

    if (profileResult.error) {
      throw new Error("Perfil administrativo: " + profileResult.error.message);
    }

    if (!profileResult.data || profileResult.data.role !== "admin" || profileResult.data.is_active !== true) {
      await supabase.auth.signOut();
      throw new Error("A conta autenticada não tem permissões administrativas ativas.");
    }

    if (aalResult.error || aalResult.data.currentLevel !== "aal2") {
      await supabase.auth.signOut();
      throw new Error("A sessão foi autenticada, mas o MFA não atingiu AAL2.");
    }

    return {
      ok: true,
      userId: session.user.id,
      displayName: profileResult.data.display_name ?? "Administrador",
    };
  });
