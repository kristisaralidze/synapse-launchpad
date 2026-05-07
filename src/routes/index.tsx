import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/synapse/AppShell";
import { LaunchModal } from "@/components/synapse/LaunchModal";
import type { Target } from "@/lib/synapse/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Targets — Synapse" },
      { name: "description", content: "Select an employee to simulate a personalized adversary engagement." },
    ],
  }),
  component: TargetsPage,
});

const initialTargets: Target[] = [
  { id: "t-001", name: "Jasper Gräfe", email: "jasper.graefe@celonis.com", company: "Celonis", role: "Customer Success Manager", score: 84, scoreLabel: "Vulnerable" },
  { id: "t-002", name: "Anna Weber", email: "anna.weber@celonis.com", company: "Celonis", role: "Engineering Lead", score: 71, scoreLabel: "Strong" },
  { id: "t-003", name: "Marc Lindqvist", email: "marc.lindqvist@celonis.com", company: "Celonis", role: "Sales Director", score: 52, scoreLabel: "Moderate" },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function scoreColor(label: Target["scoreLabel"]) {
  if (label === "Strong") return "var(--color-score-good)";
  if (label === "Moderate") return "var(--color-score-warn)";
  return "var(--color-score-bad)";
}

function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>(initialTargets);
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "" });
  const [launchTarget, setLaunchTarget] = useState<Target | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    const t: Target = {
      id: `t-${Math.random().toString(36).slice(2, 8)}`,
      ...form,
      score: 65,
      scoreLabel: "Moderate",
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
          className="mt-3 bg-surface border border-[var(--color-border-base)] rounded-lg p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { key: "name", label: "Full name", placeholder: "Jane Doe" },
              { key: "email", label: "Email", placeholder: "jane@company.com", mono: true },
              { key: "company", label: "Company", placeholder: "Acme Inc" },
              { key: "role", label: "Role", placeholder: "Product Manager" },
            ].map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label className="text-[12px] text-[var(--color-text-secondary)]">{f.label}</label>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className={`h-10 rounded-md border border-[var(--color-border-base)] bg-surface px-3 text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-strong)] ${
                    f.mono ? "font-mono text-[14px]" : ""
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              className="h-9 px-4 rounded-md bg-[#0A0A0A] text-white text-[14px] font-medium hover:bg-black/85"
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

              <div className="w-20 flex flex-col items-start">
                <span className="text-[11px] text-[var(--color-text-tertiary)]">Score</span>
                <span
                  className="font-mono text-[22px] font-semibold leading-none mt-0.5"
                  style={{ color: scoreColor(t.scoreLabel) }}
                >
                  {t.score}
                </span>
                <span className="text-[11px] text-[var(--color-text-tertiary)] mt-1">{t.scoreLabel}</span>
              </div>

              <button
                onClick={() => setLaunchTarget(t)}
                className="h-9 px-4 rounded-md bg-[var(--color-danger)] text-white text-[14px] font-medium hover:bg-[var(--color-danger-hover)]"
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
