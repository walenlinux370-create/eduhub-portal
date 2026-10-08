import { createServerFn } from "@tanstack/react-start";
import { createServerSupabase } from "./server";

type SessionInput = {
  access_token: string;
  refresh_token: string;
};

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
      throw new Error(
        "A identidade administrativa não pôde ser confirmada: " +
          (userResult.error?.message ?? "utilizador ausente"),
      );
    }

    const [profileResult, aalResult] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("display_name,role,is_active")
        .eq("id", session.user.id)
        .maybeSingle(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(session.access_token),
    ]);

    if (profileResult.error) {
      throw new Error("Perfil administrativo: " + profileResult.error.message);
    }

    if (
      !profileResult.data ||
      profileResult.data.role !== "admin" ||
      profileResult.data.is_active !== true
    ) {
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
