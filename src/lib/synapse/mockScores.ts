export type ScoreTarget = {
  id: string;
  name: string;
  role: string;
  company: string;
  score: number;
  weak: string;
  strong: string;
};

export const mockTargets: ScoreTarget[] = [
  { id: "t-001", name: "Jasper Gräfe", role: "Customer Success Manager", company: "Celonis", score: 5, weak: "authority + social proof", strong: "—" },
  { id: "t-002", name: "Anna Weber", role: "Engineering Lead", company: "Celonis", score: 71, weak: "curiosity bait", strong: "urgency, authority" },
  { id: "t-003", name: "Marc Lindqvist", role: "Sales Director", company: "Celonis", score: 52, weak: "invoice scams", strong: "conference followups" },
  { id: "t-004", name: "Sven Müller", role: "DevOps Engineer", company: "Celonis", score: 88, weak: "—", strong: "urgency, authority, curiosity" },
  { id: "t-005", name: "Priya Patel", role: "Product Manager", company: "Celonis", score: 64, weak: "manager-impersonation", strong: "invoice, vendor" },
  { id: "t-006", name: "Tom Reinhart", role: "Finance Analyst", company: "Celonis", score: 41, weak: "vendor message", strong: "IT reset, urgency" },
];

export const mockSeries = [
  { date: "Apr 8", score: 78 }, { date: "Apr 9", score: 77 },
  { date: "Apr 10", score: 79 }, { date: "Apr 11", score: 78 },
  { date: "Apr 12", score: 76 }, { date: "Apr 13", score: 75 },
  { date: "Apr 14", score: 76 }, { date: "Apr 15", score: 74 },
  { date: "Apr 16", score: 72 }, { date: "Apr 17", score: 73 },
  { date: "Apr 18", score: 71 }, { date: "Apr 19", score: 70 },
  { date: "Apr 20", score: 71 }, { date: "Apr 21", score: 69 },
  { date: "Apr 22", score: 68 }, { date: "Apr 23", score: 70 },
  { date: "Apr 24", score: 71 }, { date: "Apr 25", score: 70 },
  { date: "Apr 26", score: 72 }, { date: "Apr 27", score: 73 },
  { date: "Apr 28", score: 71 }, { date: "Apr 29", score: 70 },
  { date: "Apr 30", score: 68 }, { date: "May 1", score: 69 },
  { date: "May 2", score: 71 }, { date: "May 3", score: 70 },
  { date: "May 4", score: 69 }, { date: "May 5", score: 70 },
  { date: "May 6", score: 72 }, { date: "May 7", score: 67 },
];

export type ScoreTier = {
  label: "Strong" | "Moderate" | "Vulnerable" | "Compromised";
  color: string;
  bg: string;
  text: string;
};

export function tierFor(score: number): ScoreTier {
  if (score >= 70) return { label: "Strong", color: "#15803D", bg: "#DCFCE7", text: "#15803D" };
  if (score >= 40) return { label: "Moderate", color: "#B45309", bg: "#FEF3C7", text: "#B45309" };
  if (score >= 15) return { label: "Vulnerable", color: "#B91C1C", bg: "#FEE2E2", text: "#B91C1C" };
  return { label: "Compromised", color: "#7F1D1D", bg: "#FEE2E2", text: "#7F1D1D" };
}