import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/synapse/AppShell";

export const Route = createFileRoute("/live/")({
  component: () => (
    <AppShell>
      <h1 className="text-[28px] font-semibold tracking-tight">Live Feed</h1>
      <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">
        No active engagement. Launch one from Targets.
      </p>
    </AppShell>
  ),
});