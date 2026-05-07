import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/synapse/AppShell";

export const Route = createFileRoute("/live/$campaignId")({
  component: LiveCampaign,
});

function LiveCampaign() {
  const { campaignId } = Route.useParams();
  return (
    <AppShell>
      <h1 className="text-[28px] font-semibold tracking-tight">Live Feed</h1>
      <p className="mt-2 text-[14px] text-[var(--color-text-secondary)]">
        Engagement <span className="font-mono text-[13px]">{campaignId}</span> in progress. Detailed
        feed lands in the next iteration.
      </p>
    </AppShell>
  );
}