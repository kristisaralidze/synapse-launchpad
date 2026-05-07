export type Target = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  created_at?: string;
};

export type ScoreLabel = "Strong" | "Moderate" | "Vulnerable";

export type Score = {
  id: string;
  target_id: string;
  score: number;
  reason: string | null;
  calculated_at: string;
};

export type AgentThought = {
  id: string;
  campaign_id: string;
  step: number;
  reasoning: string | null;
  action: string | null;
  observation: string | null;
  created_at: string;
};

export type CampaignEventType =
  | "email_delivered"
  | "opened"
  | "clicked"
  | "credentials_entered"
  | "training_delivered";

export type CampaignEvent = {
  id: string;
  campaign_id: string;
  event_type: CampaignEventType | string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

export type Campaign = {
  id: string;
  target_id: string;
  status: string;
  attempts: number;
  started_at: string;
  finished_at: string | null;
};

export function scoreLabel(score: number): ScoreLabel {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Moderate";
  return "Vulnerable";
}

export function scoreColor(score: number): string {
  if (score >= 70) return "var(--color-score-good)";
  if (score >= 40) return "var(--color-score-warn)";
  return "var(--color-score-bad)";
}