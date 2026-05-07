import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/synapse/AppShell";

export const Route = createFileRoute("/scores")({
  component: () => (
    <AppShell>
      <h1 className="text-[28px] font-semibold tracking-tight">Scores</h1>
      <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">
        Aggregate resilience scores will appear here.
      </p>
    </AppShell>
  ),
});