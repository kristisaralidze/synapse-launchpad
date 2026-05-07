export type Target = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  score: number;
  scoreLabel: "Strong" | "Moderate" | "Vulnerable";
};