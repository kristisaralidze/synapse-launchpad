export type MockThought = {
  step: number;
  time: string;
  reasoning: string;
  action: string;
  observation: string;
};

export type MockEventType =
  | "delivered"
  | "opened"
  | "clicked"
  | "credentials_entered"
  | "training_delivered";

export type MockEvent = {
  id: string;
  time: string;
  type: MockEventType;
  description: string;
};

export const MOCK_THOUGHTS: MockThought[] = [
  {
    step: 1,
    time: "14:22:04",
    reasoning:
      "Target works in Customer Success at Celonis. Public LinkedIn shows attendance at SaaStock 2025 last month. Posts publicly about product strategy. High signal-to-noise ratio for a conference-followup pretext.",
    action:
      'Selecting "Conference Followup" scenario; drafting lure as a fellow attendee requesting a quick chat.',
    observation:
      'Lure drafted. Subject: "Following up from SaaStock — quick question on Celonis CS workflow".',
  },
  {
    step: 2,
    time: "14:22:18",
    reasoning:
      "First lure relies on familiarity heuristic; minimal authority pressure. Sending and observing.",
    action: "Sending email via SMTP. Tracking pixel and unique click URL injected.",
    observation: "Email delivered. Awaiting open signal.",
  },
  {
    step: 3,
    time: "14:23:07",
    reasoning:
      "Target opened email but did not click. After 30 seconds no further action — engagement signal weak. Familiarity alone insufficient.",
    action:
      "Drafting follow-up with stronger authority cue (referencing his manager from public org chart) and tighter urgency framing.",
    observation: 'Lure v2 drafted. Subject: "Re: SaaStock chat — Maria suggested I reach out".',
  },
  {
    step: 4,
    time: "14:23:42",
    reasoning:
      "Authority plus social proof should clear the bar. Sending now and watching for engagement within 30 seconds.",
    action: "Sending lure v2. Same tracking surface as v1.",
    observation:
      "Email delivered. Opened in 4 seconds. Click registered in 11 seconds.",
  },
  {
    step: 5,
    time: "14:23:58",
    reasoning:
      "Target landed on cloned Celonis SSO page and submitted credentials. Pivot to in-context training delivery through the same channel.",
    action:
      "Triggering training email through the same inbox; subject prefixed with security warning.",
    observation: "Training email queued. Engagement complete.",
  },
];

const TARGET_EMAIL = "jasper.graefe@celonis.com";

export const MOCK_EVENTS: MockEvent[] = [
  { id: "e1", time: "14:22:18", type: "delivered", description: `Email delivered to ${TARGET_EMAIL}` },
  { id: "e2", time: "14:22:35", type: "opened", description: "Email opened" },
  { id: "e3", time: "14:23:42", type: "delivered", description: `Email delivered to ${TARGET_EMAIL}` },
  { id: "e4", time: "14:23:46", type: "opened", description: "Email opened" },
  { id: "e5", time: "14:23:53", type: "clicked", description: "Link clicked → cloned SSO page" },
  { id: "e6", time: "14:23:58", type: "credentials_entered", description: "Credentials entered" },
  { id: "e7", time: "14:24:06", type: "training_delivered", description: "Training email delivered" },
];

export const SCORE_DELTA: Record<MockEventType, number> = {
  delivered: 0,
  opened: -10,
  clicked: -25,
  credentials_entered: -50,
  training_delivered: 0,
};

export type PlaybackStep =
  | { at: number; kind: "thought"; index: number }
  | { at: number; kind: "event"; index: number }
  | { at: number; kind: "complete" };

export const PLAYBACK_TIMELINE: PlaybackStep[] = [
  { at: 800, kind: "thought", index: 0 },
  { at: 2400, kind: "thought", index: 1 },
  { at: 2400, kind: "event", index: 0 },
  { at: 3600, kind: "event", index: 1 },
  { at: 5000, kind: "thought", index: 2 },
  { at: 6600, kind: "thought", index: 3 },
  { at: 6600, kind: "event", index: 2 },
  { at: 7400, kind: "event", index: 3 },
  { at: 8400, kind: "event", index: 4 },
  { at: 9200, kind: "event", index: 5 },
  { at: 10400, kind: "thought", index: 4 },
  { at: 10400, kind: "event", index: 6 },
  { at: 11600, kind: "complete" },
];

export const SEVERITY_DOT: Record<MockEventType, string> = {
  delivered: "#A3A3A3",
  opened: "#B45309",
  clicked: "#B91C1C",
  credentials_entered: "#7F1D1D",
  training_delivered: "#15803D",
};

export function scoreColorForNumber(score: number) {
  if (score >= 70) return "#15803D";
  if (score >= 40) return "#B45309";
  return "#B91C1C";
}

export function scoreBandLabel(score: number) {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Moderate";
  if (score >= 15) return "Vulnerable";
  return "Compromised";
}