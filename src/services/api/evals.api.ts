import { apiClient } from './core/client';

export interface EvaluationBadge {
  label: string;
  percentage: number;
  color: 'green' | 'amber' | 'red' | string;
  tier: string;
}

export interface EvaluationDimensionDetail {
  dimension_name: string;
  score: number;
  target_threshold: number;
  status: 'PASS' | 'WARNING' | 'FAIL' | string;
  summary: string;
  issues_detected: string[];
}

export interface EvalRunResponse {
  id: string;
  contact_id?: string | null;
  research_run_id?: string | null;
  overall_accuracy_score: number;
  identity_accuracy_score: number;
  citation_validity_score: number;
  grounding_score: number;
  faithfulness_score: number;
  solution_alignment_score: number;
  total_claims_evaluated: number;
  verified_claims_count: number;
  hallucinated_claims_count: number;
  badge: EvaluationBadge;
  dimensions: EvaluationDimensionDetail[];
  detailed_findings: Record<string, any>;
  created_at?: string | null;
}

export interface EvalSummaryResponse {
  total_evaluated_contacts: number;
  average_overall_accuracy: number;
  average_identity_accuracy: number;
  average_citation_validity: number;
  average_grounding_score: number;
  average_faithfulness_score: number;
  average_solution_alignment: number;
  badge_distribution: {
    green: number;
    amber: number;
    red: number;
  };
  recent_runs: EvalRunResponse[];
}

export interface EvalBatchResult {
  evaluated_count: number;
  total_eval_runs: number;
  average_accuracy_score: number;
}

export const evalsApi = {
  getContactEvaluation: (contactId: string) =>
    apiClient.get<EvalRunResponse>(`/api/v1/evals/contact/${contactId}`),

  runContactEvaluation: (contactId: string, useLlmJudge = true) =>
    apiClient.post<EvalRunResponse>(`/api/v1/evals/evaluate/${contactId}?use_llm_judge=${useLlmJudge}`, {}),

  getSummary: () =>
    apiClient.get<EvalSummaryResponse>('/api/v1/evals/summary'),

  evaluateBatch: (useLlmJudge = false) =>
    apiClient.post<EvalBatchResult>(`/api/v1/evals/evaluate-batch?use_llm_judge=${useLlmJudge}`, {}),
};

