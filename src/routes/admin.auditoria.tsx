import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, ShieldCheck, RefreshCw } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireSupabase } from "@/lib/supabase";

type AuditRow = {
  id: number;
  actor_user_id: string | null;
  actor_name: string | null;
  event_type: string;
  entity_table: string;
  entity_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  created_at: string;
  total_count: number;
};

function formatJson(value: unknown) {
  if (value == null) return "—";
  return JSON.stringify(value, null, 2);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-MZ", { dateStyle: "short", timeStyle: "medium" }).format(new Date(value));
}

export const Route = createFileRoute("/admin/auditoria")({
  head: () => ({ meta: [{ title: "Auditoria — Painel Administrativo" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AuditPage,
});

function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [eventType, setEventType] = useState("");
  const [entityTable, setEntityTable] = useState("");
  const [actor, setActor] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 25;
  const total = rows[0]?.total_count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const supabase = requireSupabase();
      const { data, error: rpcError } = await supabase.rpc("admin_audit_logs", {
        p_event_type: eventType || null,
        p_entity_table: entityTable || null,
        p_actor: actor.trim() || null,
        p_from: from ? new Date(from + "T00:00:00").toISOString() : null,
        p_to: to ? new Date(to + "T23:59:59.999").toISOString() : null,
        p_search: search.trim() || null,
        p_limit: pageSize,
        p_offset: page * pageSize,
      });
      if (rpcError) throw rpcError;
      setRows((data ?? []) as AuditRow[]);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : "Não foi possível carregar a auditoria.");
    } finally { setLoading(false); }
  }, [eventType, entityTable, actor, search, from, to, page]);

  useEffect(() => { void load(); }, [load]);

  const eventOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.event_type))).sort(), [rows]);
  const entityOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.entity_table))).sort(), [rows]);

  return (
    <AdminShell>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-yellow-600">Segurança</p>
          <h2 className="mt-1 text-3xl font-bold text-primary">Auditoria</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Registos imutáveis de logins, códigos, notas, presenças e alterações administrativas. A leitura exige sessão administrativa com MFA AAL2.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-50">
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />Atualizar
        </button>
      </div>

      <section className="mt-6 rounded-xl border bg-background p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="text-sm font-medium">Evento<select value={eventType} onChange={(e) => { setEventType(e.target.value); setPage(0); }} className="mt-1 w-full rounded-md border bg-background px-3 py-2"><option value="">Todos</option>{eventOptions.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
          <label className="text-sm font-medium">Tabela<select value={entityTable} onChange={(e) => { setEntityTable(e.target.value); setPage(0); }} className="mt-1 w-full rounded-md border bg-background px-3 py-2"><option value="">Todas</option>{entityOptions.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
          <label className="text-sm font-medium">Ator<input value={actor} onChange={(e) => setActor(e.target.value)} placeholder="Nome, email ou UUID" className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
          <label className="text-sm font-medium">De<input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Até<input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
          <label className="text-sm font-medium">Pesquisa<div className="mt-1 flex"><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") setPage(0); }} placeholder="evento, tabela ou ID" className="min-w-0 flex-1 rounded-l-md border bg-background px-3 py-2" /><button type="button" onClick={() => setPage(0)} className="rounded-r-md border border-l-0 px-3" aria-label="Pesquisar"><Search className="h-4 w-4" /></button></div></label>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-xl border bg-background shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-yellow-600" /><span className="font-semibold">{total} registos</span></div><span className="text-xs text-muted-foreground">Página {page + 1} de {pageCount}</span></div>
        {loading ? <div className="p-8 text-center text-sm text-muted-foreground">A carregar registos…</div> : error ? <div className="p-8 text-center text-sm text-destructive">{error}</div> : rows.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">Nenhum registo encontrado.</div> : (
          <div className="divide-y">{rows.map((row) => (
            <article key={row.id} className="p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><p className="font-semibold text-primary">{row.event_type}</p><p className="text-sm text-muted-foreground">{row.entity_table}{row.entity_id ? ` · ID: ${row.entity_id}` : ""} · {row.actor_name || "Sistema"}</p></div><time className="text-xs text-muted-foreground">{formatDate(row.created_at)}</time></div>
              <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold">Ver dados do evento</summary><div className="mt-3 grid gap-3 lg:grid-cols-3">{(["before_data","after_data","metadata"] as const).map((key) => <div key={key}><p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{key === "before_data" ? "Antes" : key === "after_data" ? "Depois" : "Metadados"}</p><pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{formatJson(row[key])}</pre></div>)}</div></details>
            </article>
          ))}</div>
        )}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Anterior</button>
          <span className="text-xs text-muted-foreground">{total ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, total)} de ${total}` : "0 registos"}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1 || loading} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm disabled:opacity-40">Próxima<ChevronRight className="h-4 w-4" /></button>
        </div>
      </section>
    </AdminShell>
  );
}
