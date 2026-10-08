import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = (name: string) =>
  readFileSync(resolve(process.cwd(), "supabase/migrations", name), "utf8");

describe("security acceptance contract", () => {
  it("keeps core public tables behind RLS and denies browser table access by default", () => {
    const sql = migration("0001_initial.sql");

    for (const table of [
      "user_profiles",
      "students",
      "registration_requests",
      "grades",
      "attendance",
      "schedules",
      "materials",
      "news",
      "audit_logs",
    ]) {
      expect(sql).toContain(`alter table public.${table} enable row level security;`);
    }

    expect(sql).toContain("revoke all on all tables in schema public from anon;");
    expect(sql).toContain("revoke all on all tables in schema public from authenticated;");
    expect(sql).toContain("revoke all on public.audit_logs from anon,authenticated;");
  });

  it("restricts sensitive student authentication operations", () => {
    const sql = migration("0001_initial.sql");
    const admin = migration("0013_admin_student_management.sql");

    expect(sql).toContain("revoke execute on function public.verify_student_login(text,text,inet) from public,anon,authenticated;");
    expect(admin).toContain("or (select auth.jwt()->>'aal') <> 'aal2'");
    expect(admin).toContain("auth_code_hash=crypt(code,gen_salt('bf',12))");
    expect(admin).toContain("for i in 1..12 loop");
    expect(sql).toContain("failed_code_attempts=least(failed_code_attempts+1,5)");
    expect(sql).toContain("now()+interval '15 minutes'");
  });

  it("requires AAL2 for administrator mutations", () => {
    for (const file of [
      "0013_admin_student_management.sql",
      "0015_admin_academic_management.sql",
      "0017_grade_mfa_hardening.sql",
      "0019_attendance_aal2_hardening.sql",
      "0020_materials_secure_storage.sql",
      "0021_news_cms.sql",
      "0022_audit_admin.sql",
    ]) {
      const sql = migration(file);
      expect(sql).toMatch(/auth\.jwt\(\)->>'aal'.*aal2|aal.*aal2/s);
    }
  });

  it("locks published grades against teacher edits and keeps grade range valid", () => {
    const sql = migration("0016_grade_workflow.sql");
    expect(sql).toContain("old.state='published' and role_now='teacher'");
    expect(sql).toContain("raise exception 'published_grade_locked'");
    expect(sql).toContain("new.final_grade < 0 or new.final_grade > 20");
    expect(sql).toContain("jsonb_typeof(new.component_scores) <> 'object'");
  });

  it("keeps pedagogical materials private and scoped", () => {
    const sql = migration("0020_materials_secure_storage.sql");
    expect(sql).toContain("'materials',");
    expect(sql).toContain("public=false");
    expect(sql).toContain("file_size_limit=52428800");
    expect(sql).toContain("materials_storage_select");
    expect(sql).toContain("public.current_role()='teacher'");
    expect(sql).toContain("revoke delete on public.materials from authenticated;");
  });

  it("exposes only published news publicly", () => {
    const sql = migration("0021_news_cms.sql");
    expect(sql).toContain(
      "using(published=true and published_at is not null)"
    );
    expect(sql).toContain("public.current_role()='admin'");
    expect(sql).toContain("auth.jwt()->>'aal')='aal2'");
  });

  it("makes audit records append-only and redacts secrets", () => {
    const sql = migration("0022_audit_admin.sql");
    expect(sql).toContain("raise exception 'audit_logs_immutable'");
    expect(sql).toContain("revoke all on public.audit_logs from public, anon, authenticated;");
    for (const key of [
      "auth_code_hash",
      "password_hash",
      "access_token",
      "refresh_token",
      "totp_secret",
      "mfa_secret",
      "otp_secret",
    ]) {
      expect(sql).toContain(`'${key}'`);
    }
  });
});
