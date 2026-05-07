import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import type { Target } from "@/lib/synapse/types";

const SCENARIOS = [
  "Conference Followup",
  "Invoice",
  "IT Reset",
  "Manager Request",
  "Vendor Message",
] as const;

export function LaunchModal({
  target,
  open,
  onOpenChange,
}: {
  target: Target | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [scenario, setScenario] = useState<string>("Conference Followup");
  const [demoMode, setDemoMode] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!target) return null;

  async function handleLaunch() {
    const apiUrl = "https://hackathon-plum-seven.vercel.app";
    if (!target) return;
    setSubmitting(true);
    try {
      let campaignId: string | undefined;
      try {
        const res = await fetch(apiUrl + "/api/campaign/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target_id: target.id, scenario, demo_mode: demoMode }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          campaignId = data?.data?.campaign?.id ?? data?.campaign_id;
        }
      } catch { /* mock fallback */ }
      if (!campaignId) campaignId = `mock-${Date.now()}`;
      onOpenChange(false);
      navigate({ to: "/live/$campaignId", params: { campaignId } });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/40" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-7 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.12)" }}
        >
          <DialogPrimitive.Title className="text-[19px] font-semibold leading-tight text-[var(--color-text-primary)]">
            Launch engagement against {target.name}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
            The agent will research, craft a personalized lure, and adapt in real time.
          </DialogPrimitive.Description>

          <div className="mt-6 flex flex-col gap-1.5">
            <label className="text-[12px] text-[var(--color-text-secondary)]">Scenario</label>
            <Select value={scenario} onValueChange={setScenario}>
              <SelectTrigger className="h-10 text-[15px] bg-surface border-[var(--color-border-base)] rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCENARIOS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <label className="text-[14px] text-[var(--color-text-primary)]">Demo mode</label>
              <Switch checked={demoMode} onCheckedChange={setDemoMode} />
            </div>
            <p className="mt-1.5 text-[12px] text-[var(--color-text-tertiary)]">
              Use cached OSINT and a pre-scripted path. Recommended for rehearsals.
            </p>
          </div>

          <div className="mt-7 flex items-center justify-between">
            <button
              onClick={() => onOpenChange(false)}
              className="h-9 px-3 text-[14px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Cancel
            </button>
            <button
              onClick={handleLaunch}
              disabled={submitting}
              className="h-9 px-4 rounded-md text-[14px] font-medium text-white bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)] disabled:opacity-60"
            >
              {submitting ? "Launching…" : "Launch attack"}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}