import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { requireSupabase } from "@/lib/supabase";
import { transitionGradeSheet, type GradeWorkflowAction } from "@/lib/adminedu/api";

type GradeSheet = {
  id: string;
  class_id: string;
  subject_id: string;
  academic_year: number;
  trimester: number;
  state: "draft" | "submitted" | "reviewed" | "approved" | "published" | "returned";
  version: number;
  updated_at: string;
};

const actions: Record<GradeSheet["state"], Array<{ action: GradeWorkflowAction; label: string }>> = {
  draft: [{ action: "submit_grade_sheet", label: "Submeter" }],
  submitted: [
    { action: "review_grade_sheet", label: "Conferir" },
    { action: "return_grade_sheet", label: "Devolver" },
  ],
  reviewed: [
    { action: "approve_grade_sheet", label: "Aprovar" },
    { action: "return_grade_sheet", label: "Devolver" },
  ],
  approved: [{ action: "publish_grade_sheet", label: "Publicar" }],
  published: [],
  returned: [{ action: "submit_grade_sheet", label: "Resubmeter" }],
};

export function GradeWorkflowPanel() {
  const [rows, setRows] = useState<GradeSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const { data, error: queryError } = await requireSupabase()
      .from("grade_sheets")
      .select("id,class_id,subject_id,academic_year,trimester,state,version,updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (queryError) setError("Não foi possível carregar as folhas de notas.");
    setRows((data ?? []) as GradeSheet[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function execute(row: GradeSheet, action: GradeWorkflowAction) {
    let reason: string | undefined;
    if (action === "return_grade_sheet") {
      reason = window.prompt("Indique a justificação da devolução (mínimo 10 caracteres):")?.trim();
      if (!reason || reason.length < 10) {
        setError("A devolução exige uma justificação com pelo menos 10 caracteres.");
        return;
      }
    }

    const label = actions[row.state].find((item) => item.action === action)?.label ?? "executar";
    if (window.prompt(`Para confirmar “${label}”, escreva CONFIRMO:`) !== "CONFIRMO") {
      setError("A ação não foi confirmada.");
      return;
    }

    setBusy(row.id);
    setError("");
    try {
      await transitionGradeSheet(row.id, action, reason);
      await load();
    } catch {
      setError("Não foi possível executar a ação solicitada.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 text-slate-700" size={20} />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Workflow de folhas de notas</h2>
          <p className="mt-1 text-sm text-slate-600">
            As transições são autorizadas no backend. Cada ação crítica exige confirmação individual.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          <AlertTriangle className="mr-2 inline-block" size={16} />{error}
        </div>
      )}

      {loading ? (
        <p className="mt-5 text-sm text-slate-500">A carregar...</p>
      ) : rows.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">Não existem folhas de notas disponíveis para este perfil.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-3 py-2">Referência</th><th className="px-3 py-2">Ano</th><th className="px-3 py-2">Período</th><th className="px-3 py-2">Estado</th><th className="px-3 py-2">Ações</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-3 py-3 font-mono text-xs text-slate-600">{row.id}</td>
                  <td className="px-3 py-3">{row.academic_year}</td>
                  <td className="px-3 py-3">{row.trimester}</td>
                  <td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium">{row.state}</span></td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      {actions[row.state].map(({ action, label }) => (
                        <button
                          key={action}
                          disabled={busy === row.id}
                          onClick={() => void execute(row, action)}
                          className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                        >
                          {action === "return_grade_sheet" ? <RotateCcw size={13} /> : action === "publish_grade_sheet" ? <CheckCircle2 size={13} /> : <Send size={13} />}
                          {label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
