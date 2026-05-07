import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { AppShell } from "@/components/synapse/AppShell";
import {
  MOCK_EVENTS,
  MOCK_THOUGHTS,
  PLAYBACK_TIMELINE,
  SCORE_DELTA,
  SEVERITY_DOT,
  scoreBandLabel,
  scoreColorForNumber,
  type MockEvent,
  type MockThought,
} from "@/lib/synapse/mockPlayback";
import { supabase } from "@/lib/synapse/supabase";

export const Route = createFileRoute("/live/$campaignId")({
  head: () => ({
    meta: [{ title: "Live Engagement — Synapse" }],
  }),
  component: LiveCampaign,
});

function rowToThought(row: Record<string, unknown>, idx: number): MockThought {
  return {
    step: typeof row.step === "number" ? row.step : idx + 1,
    time: row.created_at
      ? new Date(row.created_at as string).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : "--:--:--",
    reasoning: (row.reasoning as string) ?? "",
    action: (row.action as string) ?? "",
    observation: (row.observation as string) ?? "",
  };
}

function rowToEvent(row: Record<string, unknown>, idx: number): MockEvent | null {
  const type = row.event_type as string | undefined;
  if (!type) return null;
  // Map backend event_type → MockEventType
  const typeMap: Record<string, MockEvent["type"]> = {
    email_delivered: "delivered",
    delivered: "delivered",
    opened: "opened",
    clicked: "clicked",
    credentials_entered: "credentials_entered",
    training_delivered: "training_delivered",
  };
  const evType: MockEvent["type"] = typeMap[type] ?? "delivered";
  const descriptions: Record<string, string> = {
    delivered: "Lure email delivered",
    opened: "Email opened",
    clicked: "Link clicked",
    credentials_entered: "Credentials entered — simulation complete",
    training_delivered: "Awareness training delivered",
  };
  return {
    id: (row.id as string) ?? `ev-${idx}`,
    type: evType,
    description: descriptions[evType] ?? type,
    time: row.created_at
      ? new Date(row.created_at as string).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : "--:--:--",
  };
}

function LiveCampaign() {
  const { campaignId } = Route.useParams();
  const isMock = campaignId.startsWith("mock-");

  const [thoughts, setThoughts] = useState<MockThought[]>([]);
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [score, setScore] = useState(100);
  const [complete, setComplete] = useState(false);
  const [runId, setRunId] = useState(0);
  const thoughtsScrollRef = useRef<HTMLDivElement | null>(null);

  const reset = useCallback(() => {
    setThoughts([]);
    setEvents([]);
    setScore(100);
    setComplete(false);
    setRunId((n) => n + 1);
  }, []);

  // Mock playback for demo campaigns
  useEffect(() => {
    if (!isMock) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const step of PLAYBACK_TIMELINE) {
      const t = setTimeout(() => {
        if (step.kind === "thought") {
          setThoughts((prev) => [...prev, MOCK_THOUGHTS[step.index]]);
        } else if (step.kind === "event") {
          const ev = MOCK_EVENTS[step.index];
          setEvents((prev) => [ev, ...prev]);
          setScore((s) => Math.max(0, s + SCORE_DELTA[ev.type]));
        } else {
          setComplete(true);
        }
      }, step.at);
      timers.push(t);
    }
    return () => timers.forEach(clearTimeout);
  }, [isMock, runId]);

  // Real Supabase realtime for live campaigns
  useEffect(() => {
    if (isMock || !supabase) return;

    // Load existing rows first
    Promise.all([
      supabase
        .from("agent_thoughts")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("step", { ascending: true }),
      supabase
        .from("events")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: true }),
      supabase
        .from("campaigns")
        .select("status")
        .eq("id", campaignId)
        .single(),
    ]).then(([thoughtsRes, eventsRes, campaignRes]) => {
      if (thoughtsRes.data) {
        setThoughts((thoughtsRes.data as Record<string, unknown>[]).map((r, i) => rowToThought(r, i)));
      }
      if (eventsRes.data) {
        const mapped = (eventsRes.data as Record<string, unknown>[])
          .map((r, i) => rowToEvent(r, i))
          .filter((e): e is MockEvent => e !== null);
        setEvents(mapped.reverse());
        const last = mapped[mapped.length - 1];
        if (last) {
          setScore((s) => Math.max(0, s + SCORE_DELTA[last.type]));
        }
      }
      if (campaignRes.data?.status === "done" || campaignRes.data?.status === "complete") {
        setComplete(true);
      }
    });

    // Subscribe to new thoughts
    const thoughtsSub = supabase
      .channel(`thoughts:${campaignId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_thoughts", filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          setThoughts((prev) => {
            const t = rowToThought(row, prev.length);
            return [...prev, t];
          });
        }
      )
      .subscribe();

    // Subscribe to new events
    const eventsSub = supabase
      .channel(`events:${campaignId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "events", filter: `campaign_id=eq.${campaignId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const ev = rowToEvent(row, 0);
          if (!ev) return;
          setEvents((prev) => [ev, ...prev]);
          setScore((s) => Math.max(0, s + SCORE_DELTA[ev.type]));
          if (ev.type === "credentials_entered" || ev.type === "training_delivered") {
            setComplete(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(thoughtsSub);
      supabase?.removeChannel(eventsSub);
    };
  }, [isMock, campaignId]);

  // Auto-scroll thoughts column to bottom on new arrival.
  useEffect(() => {
    const el = thoughtsScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [thoughts.length]);

  return (
    <AppShell>
      <Header complete={complete} count={thoughts.length} onReplay={reset} />

      <div className="mt-6 grid grid-cols-[62fr_38fr] gap-6 h-[calc(100vh-260px)] min-h-[520px]">
        <ReasoningColumn thoughts={thoughts} scrollRef={thoughtsScrollRef} />
        <div className="flex flex-col gap-4 min-h-0">
          <ScoreCard score={score} />
          <ActivityCard events={events} />
        </div>
      </div>
    </AppShell>
  );
}

function Header({
  complete,
  count,
  onReplay,
}: {
  complete: boolean;
  count: number;
  onReplay: () => void;
}) {
  void count;
  return (
    <header>
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="text-[13px] text-[var(--color-text-tertiary)]">
            <Link to="/" className="hover:text-[var(--color-text-primary)] transition-colors">
              Targets
            </Link>
            <span className="mx-1.5">/</span>
            <span>Engagement</span>
          </div>
          <h1 className="mt-1 text-[28px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">
            Jasper Gräfe
          </h1>
          <div className="mt-1 text-[14px] text-[var(--color-text-secondary)]">
            Conference Followup <span className="mx-1.5 text-[var(--color-text-tertiary)]">·</span>
            Started 14:22:01
            <span className="mx-1.5 text-[var(--color-text-tertiary)]">·</span>
            Attempt 2 of 3
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 pt-1">
          <button
            onClick={onReplay}
            className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Replay demo
          </button>
          <LiveIndicator complete={complete} />
        </div>
      </div>

      <div className="mt-6 h-px bg-[var(--color-border-base)]" />
    </header>
  );
}

function LiveIndicator({ complete }: { complete: boolean }) {
  if (complete) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="block w-1.5 h-1.5 rounded-full"
          style={{ background: "#15803D" }}
        />
        <span className="text-[13px] font-medium text-[var(--color-text-primary)]">Complete</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="relative block w-1.5 h-1.5">
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: "#B91C1C" }}
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
      <span className="text-[13px] font-medium text-[var(--color-text-primary)]">Live</span>
    </div>
  );
}

function ReasoningColumn({
  thoughts,
  scrollRef,
}: {
  thoughts: MockThought[];
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-baseline justify-between pb-3 border-b border-[var(--color-border-base)]">
        <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">
          Agent reasoning
        </h2>
        <span className="text-[13px] text-[var(--color-text-tertiary)] tabular-nums">
          {thoughts.length} {thoughts.length === 1 ? "step" : "steps"}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-4 pr-1">
        {thoughts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <p className="text-[14px] text-[var(--color-text-tertiary)]">
              Awaiting first agent thought.
            </p>
            <p className="mt-1 text-[13px] text-[var(--color-text-tertiary)]">
              The agent is initializing OSINT and selecting a scenario.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-4">
            {thoughts.map((t) => (
              <ThoughtCard key={t.step} thought={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ThoughtCard({ thought }: { thought: MockThought }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-surface border border-[var(--color-border-base)] rounded-lg p-5"
    >
      <div className="flex items-center justify-between mb-3.5">
        <span
          className="text-[12px] font-medium text-[var(--color-text-primary)] rounded px-2 py-0.5"
          style={{ background: "#F3F4F6" }}
        >
          Step {thought.step}
        </span>
        <span
          className="font-mono text-[13px] text-[var(--color-text-tertiary)] tabular-nums"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {thought.time}
        </span>
      </div>

      <Section label="Reasoning" body={thought.reasoning} />
      <div className="h-3" />
      <Section label="Action" body={thought.action} />
      <div className="h-3" />
      <Section label="Observation" body={thought.observation} />
    </motion.article>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-[var(--color-text-tertiary)]">{label}</div>
      <p className="mt-1 text-[14px] text-[var(--color-text-primary)] leading-[1.55]">{body}</p>
    </div>
  );
}

function ScoreCard({ score }: { score: number }) {
  const mv = useMotionValue(score);
  const display = useTransform(mv, (v) => Math.round(v));
  const [shown, setShown] = useState(score);
  const [color, setColor] = useState(scoreColorForNumber(score));

  useEffect(() => {
    const controls = animate(mv, score, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [score, mv]);

  useEffect(() => {
    const unsub = display.on("change", (v) => {
      setShown(v);
      setColor(scoreColorForNumber(v));
    });
    return unsub;
  }, [display]);

  const pct = Math.max(0, Math.min(100, shown));

  return (
    <div className="bg-surface border border-[var(--color-border-base)] rounded-lg p-6">
      <div className="text-[13px] text-[var(--color-text-tertiary)]">Human Firewall Index</div>

      <div className="mt-4 flex items-baseline gap-2">
        <span
          className="font-mono font-semibold leading-none tabular-nums"
          style={{
            fontSize: 56,
            color,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {shown}
        </span>
        <span className="text-[22px] text-[var(--color-text-tertiary)] leading-none">/ 100</span>
      </div>

      <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
        <motion.div
          className="h-full"
          style={{ background: color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="mt-3 text-[13px] text-[var(--color-text-secondary)]">
        {scoreBandLabel(shown)}
      </div>
    </div>
  );
}

function ActivityCard({ events }: { events: MockEvent[] }) {
  return (
    <div className="bg-surface border border-[var(--color-border-base)] rounded-lg flex flex-col min-h-0 flex-1">
      <div className="flex items-baseline justify-between px-4 py-4 border-b border-[var(--color-border-base)]">
        <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">Activity</h2>
        <span className="text-[13px] text-[var(--color-text-tertiary)] tabular-nums">
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="px-4 py-6 text-[13px] text-[var(--color-text-tertiary)]">
            No events yet.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((ev, i) => (
              <EventRow key={ev.id} event={ev} last={i === events.length - 1} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function EventRow({ event, last }: { event: MockEvent; last: boolean }) {
  const isCreds = event.type === "credentials_entered";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: isCreds ? 0.985 : 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: isCreds ? 0.35 : 0.2, ease: "easeOut" }}
      className={`flex items-center gap-3 px-4 py-3.5 ${
        last ? "" : "border-b border-[var(--color-border-base)]"
      }`}
    >
      <span
        className="block w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: SEVERITY_DOT[event.type] }}
      />
      <span className="flex-1 text-[14px] text-[var(--color-text-primary)] truncate">
        {event.description}
      </span>
      <span
        className="font-mono text-[13px] text-[var(--color-text-tertiary)] tabular-nums"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {event.time}
      </span>
    </motion.div>
  );
}