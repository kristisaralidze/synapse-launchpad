import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { AppShell } from "@/components/synapse/AppShell";
import { mockSeries, mockTargets, tierFor, type ScoreTarget } from "@/lib/synapse/mockScores";
import { supabase } from "@/lib/synapse/supabase";

export const Route = createFileRoute("/scores")({
  head: () => ({
    meta: [
      { title: "Scores — Synapse" },
      { name: "description", content: "Aggregate human firewall health across the organization." },
    ],
  }),
  component: ScoresPage,
});

const TNUM: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

type Stat = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

const stats: Stat[] = [
  { label: "Average score", value: "67", delta: "−5 vs last week", positive: false },
  { label: "Targets assessed", value: "6", delta: "+2 vs last week", positive: true },
  { label: "Engagements run", value: "24", delta: "+8 vs last week", positive: true },
  { label: "Compromise rate", value: "33%", delta: "+8% vs last week", positive: false },
];

function StatCard({ s }: { s: Stat }) {
  const isDown = s.delta.startsWith("−") || s.delta.startsWith("-");
  const Arrow = isDown ? ArrowDown : ArrowUp;
  const color = s.positive ? "#15803D" : "#B91C1C";
  return (
    <div className="bg-surface border border-[var(--color-border-base)] rounded-lg p-5">
      <div className="text-[13px] text-[var(--color-text-tertiary)]">{s.label}</div>
      <div
        className="mt-2 font-mono font-semibold text-[32px] leading-none text-[var(--color-text-primary)]"
        style={TNUM}
      >
        {s.value}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[12px]" style={{ color }}>
        <Arrow size={12} />
        <span style={TNUM}>{s.delta}</span>
      </div>
    </div>
  );
}

type Range = "7D" | "30D" | "90D";

function TrendCard() {
  const [range, setRange] = useState<Range>("30D");
  const data = range === "7D" ? mockSeries.slice(-7) : mockSeries;

  return (
    <div className="bg-surface border border-[var(--color-border-base)] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">Score trend</h2>
        <div className="flex items-center gap-1">
          {(["7D", "30D", "90D"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-[12px] font-medium px-2.5 py-1 rounded-md transition-colors ${
                range === r
                  ? "text-[var(--color-text-primary)] bg-[#F3F4F6]"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 96, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#F3F4F6" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#E5E7EB"
              tick={{ fill: "#A3A3A3", fontSize: 12, fontFamily: "Inter" }}
              tickLine={{ stroke: "#E5E7EB" }}
              minTickGap={24}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              stroke="#E5E7EB"
              tick={{ fill: "#A3A3A3", fontSize: 12, fontFamily: "Inter" }}
              tickLine={{ stroke: "#E5E7EB" }}
              width={32}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                padding: 8,
                fontSize: 13,
                fontFamily: "Inter",
                boxShadow: "none",
              }}
              labelStyle={{ display: "none" }}
              formatter={(value: number, _n, p) => [`${p.payload.date} · Score ${value}`, ""]}
              separator=""
            />
            <ReferenceLine
              y={70}
              stroke="#15803D"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: "Healthy threshold",
                position: "right",
                fill: "#A3A3A3",
                fontSize: 11,
                fontFamily: "Inter",
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#0A0A0A"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: "#0A0A0A" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Gauge({ score }: { score: number }) {
  const tier = tierFor(score);
  const r = 60;
  const c = 2 * Math.PI * r;

  const offset = useMotionValue(c);
  const num = useMotionValue(0);
  const display = useTransform(num, (v) => Math.round(v));

  useEffect(() => {
    const target = c - (Math.max(0, Math.min(100, score)) / 100) * c;
    const a1 = animate(offset, target, { duration: 0.8, ease: [0.22, 1, 0.36, 1] });
    const a2 = animate(num, score, { duration: 0.8, ease: [0.22, 1, 0.36, 1] });
    return () => {
      a1.stop();
      a2.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  return (
    <div className="relative" style={{ width: 140, height: 140 }}>
      <svg width={140} height={140} viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={70} cy={70} r={r} fill="none" stroke="#F3F4F6" strokeWidth={10} />
        <motion.circle
          cx={70}
          cy={70}
          r={r}
          fill="none"
          stroke={tier.color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-mono font-semibold text-[36px] leading-none"
          style={{ ...TNUM, color: tier.color }}
        >
          {display}
        </motion.span>
        <span className="mt-1 text-[12px] text-[var(--color-text-tertiary)]" style={TNUM}>
          / 100
        </span>
      </div>
    </div>
  );
}

function TargetCard({ t }: { t: ScoreTarget }) {
  const tier = tierFor(t.score);
  return (
    <div className="bg-surface border border-[var(--color-border-base)] rounded-lg p-6 flex flex-col items-center text-center">
      <Gauge score={t.score} />
      <div className="mt-4 text-[16px] font-medium text-[var(--color-text-primary)]">{t.name}</div>
      <div className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
        {t.role} · {t.company}
      </div>
      <div
        className="mt-4 inline-block text-[12px] font-medium rounded"
        style={{ background: tier.bg, color: tier.text, padding: "4px 10px" }}
      >
        {tier.label}
      </div>
      <div className="mt-4 pt-4 border-t border-[var(--color-border-base)] w-full text-[12px] text-[var(--color-text-tertiary)] leading-relaxed">
        <div>Weak: {t.weak}</div>
        <div>Strong: {t.strong}</div>
      </div>
    </div>
  );
}

function ScoresPage() {
  const [targets, setTargets] = useState<ScoreTarget[]>(mockTargets);

  useEffect(() => {
    async function loadScores() {
      const [{ data: targetRows }, { data: scoreRows }] = await Promise.all([
        supabase.from("targets").select("id,name,company,role"),
        supabase.from("scores").select("target_id,score"),
      ]);

      if (!targetRows?.length) return;

      const scoreByTarget = new Map<string, number>();
      for (const row of (scoreRows ?? []) as { target_id: string; score: number }[]) {
        scoreByTarget.set(row.target_id, row.score);
      }

      setTargets(
        (targetRows as { id: string; name: string; company: string; role: string }[]).map((t) => ({
          id: t.id,
          name: t.name,
          company: t.company,
          role: t.role,
          score: scoreByTarget.get(t.id) ?? 100,
          weak: "pending analysis",
          strong: "pending analysis",
        })),
      );
    }

    loadScores().catch(() => {
      /* keep mock scores */
    });

    const scoresSub = supabase
      .channel("scores-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "scores" }, (payload) => {
        const row = payload.new as { target_id?: string; score?: number };
        if (!row?.target_id || typeof row.score !== "number") return;
        setTargets((prev) => prev.map((t) => (t.id === row.target_id ? { ...t, score: row.score! } : t)));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(scoresSub);
    };
  }, []);

  return (
    <AppShell>
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">
            Scores
          </h1>
          <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">
            Aggregate human firewall health across {targets.length} employees.
          </p>
        </div>
        <div className="text-[13px] text-[var(--color-text-tertiary)]" style={TNUM}>
          Last updated 14:24
        </div>
      </header>

      <div className="my-6 border-t border-[var(--color-border-base)]" />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} s={s} />
        ))}
      </section>

      <section className="mt-6">
        <TrendCard />
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">By target</h2>
          <span className="text-[13px] text-[var(--color-text-tertiary)]">{targets.length} employees</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targets.map((t) => (
            <TargetCard key={t.id} t={t} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
