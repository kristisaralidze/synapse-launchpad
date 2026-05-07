import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/synapse/AppShell";
import { LaunchModal } from "@/components/synapse/LaunchModal";
import { scoreColor, scoreLabel, type Target } from "@/lib/synapse/types";
import { API_BASE } from "@/lib/synapse/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Targets — Synapse" },
      { name: "description", content: "Select an employee to simulate a personalized adversary engagement." },
    ],
  }),
  component: TargetsPage,
});

const FALLBACK_TARGETS: Target[] = [
  { id: "t-001", name: "Jasper Gräfe", email: "jasper.graefe@celonis.com", company: "Celonis", role: "Customer Success Manager" },
  { id: "t-002", name: "Anna Weber", email: "anna.weber@celonis.com", company: "Celonis", role: "Engineering Lead" },
  { id: "t-003", name: "Marc Lindqvist", email: "marc.lindqvist@celonis.com", company: "Celonis", role: "Sales Director" },
];

const FALLBACK_SCORES: Record<string, number> = {
  "t-001": 84,
  "t-002": 71,
  "t-003": 52,
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>(FALLBACK_TARGETS);
  const [scores, setScores] = useState<Record<string, number>>(FALLBACK_SCORES);
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "" });
  const [launchTarget, setLaunchTarget] = useState<Target | null>(null);

  useEffect(() => {
    if (!API_BASE) return;
    fetch(`${API_BASE}/api/targets`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.data?.length) return;
        const fetched: Target[] = data.data;
        setTargets(fetched);
        // fetch scores for each target
        Promise.all(
          fetched.map((t) =>
            fetch(`${API_BASE}/api/scores/${t.id}`)
              .then((r) => r.ok ? r.json() : null)
              .then((s) => s?.data?.score != null ? [t.id, s.data.score] as [string, number] : null)
              .catch(() => null)
          )
        ).then((results) => {
          const scoreMap: Record<string, number> = {};
          for (const r of results) {
            if (r) scoreMap[r[0]] = r[1];
          }
          if (Object.keys(scoreMap).length > 0) setScores(scoreMap);
        });
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    const t: Target = {
      id: `t-${Math.random().toString(36).slice(2, 8)}`,
      ...form,
    };
    setTargets((prev) => [...prev, t]);
    setForm({ name: "", email: "", company: "", role: "" });
  }

  return (
    <AppShell>
      <header>
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">
          Targets
        </h1>
        <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">
          Select an employee to simulate a personalized adversary engagement.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">Add a target</h2>
        <form
          onSubmit={handleAdd}
          className="mt-3 bg-surface border border-[var(--color-border-base)] rounded-lg px-5 py-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
            {[
              { key: "name", label: "Full name", placeholder: "Jane Doe" },
              { key: "email", label: "Email", placeholder: "jane@company.com", mono: true },
              { key: "company", label: "Company", placeholder: "Acme Inc" },
              { key: "role", label: "Role", placeholder: "Product Manager" },
            ].map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[12px] text-[var(--color-text-secondary)]">{f.label}</label>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className={`h-10 w-full rounded-md border border-[var(--color-border-base)] bg-surface px-3 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-strong)] ${
                    f.mono ? "font-mono text-[14px]" : ""
                  }`}
                />
              </div>
            ))}
            <button
              type="submit"
              className="h-10 px-4 rounded-md bg-[#0A0A0A] text-white text-[14px] font-medium hover:bg-black/85"
            >
              Add target
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[16px] font-semibold text-[var(--color-text-primary)]">Active targets</h2>
          <span className="text-[13px] text-[var(--color-text-tertiary)]">{targets.length}</span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {targets.map((t) => (
            <div
              key={t.id}
              className="bg-surface border border-[var(--color-border-base)] rounded-lg px-5 py-5 flex items-center gap-5 transition-colors hover:border-[var(--color-border-strong)]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[14px] text-[var(--color-text-secondary)]">
                {initials(t.name)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium text-[var(--color-text-primary)]">{t.name}</div>
                <div className="text-[13px] text-[var(--color-text-secondary)]">
                  {t.role} · {t.company}
                </div>
              </div>

              {(() => {
                const s = scores[t.id] ?? 65;
                return (
                  <div className="w-16 flex flex-col items-end shrink-0 tabular-nums">
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">Score</span>
                    <span
                      className="font-mono text-[22px] font-semibold leading-none mt-0.5 tabular-nums"
                      style={{ color: scoreColor(s), fontVariantNumeric: "tabular-nums" }}
                    >
                      {s}
                    </span>
                    <span className="text-[11px] text-[var(--color-text-tertiary)] mt-1">{scoreLabel(s)}</span>
                  </div>
                );
              })()}

              <button
                onClick={() => setLaunchTarget(t)}
                className="h-9 px-4 rounded-md bg-surface border border-[var(--color-danger)] text-[var(--color-danger)] text-[14px] font-medium transition-colors hover:bg-[var(--color-danger)] hover:text-white"
              >
                Launch attack
              </button>
            </div>
          ))}
        </div>
      </section>

      <LaunchModal
        target={launchTarget}
        open={!!launchTarget}
        onOpenChange={(v) => !v && setLaunchTarget(null)}
      />
    </AppShell>
  );
}
