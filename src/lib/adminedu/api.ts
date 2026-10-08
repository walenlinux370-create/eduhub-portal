import { requireSupabase } from "@/lib/supabase";

export type GradeWorkflowAction =
  | "submit_grade_sheet"
  | "review_grade_sheet"
  | "approve_grade_sheet"
  | "publish_grade_sheet"
  | "return_grade_sheet";

export async function transitionGradeSheet(
  gradeSheetId: string,
  action: GradeWorkflowAction,
  reason?: string,
) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.functions.invoke("adminedu-grade-workflow", {
    body: { grade_sheet_id: gradeSheetId, action, reason },
  });
  if (error) throw new Error("Erro ao processar solicitação");
  return data;
}
