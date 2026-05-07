import { Link, useRouterState } from "@tanstack/react-router";
import { Settings, Users, Activity, BarChart3 } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Targets", icon: Users },
  { to: "/live", label: "Live Feed", icon: Activity },
  { to: "/scores", label: "Scores", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex bg-canvas">
      <aside className="w-[220px] shrink-0 bg-surface border-r border-[var(--color-border-base)] flex flex-col min-h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-danger)]" />
            <span className="text-[16px] font-semibold text-[var(--color-text-primary)]">Synapse</span>
          </div>
          <div className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">Red team operations</div>
        </div>

        <nav className="px-3 mt-2 flex flex-col gap-0.5">
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-2 h-9 px-3 rounded-md text-[14px] transition-colors ${
                  active
                    ? "text-[var(--color-text-primary)] bg-[#F5F5F5]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[#F5F5F5]"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[var(--color-danger)]" />
                )}
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--color-border-base)] p-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#F3F4F6] text-[var(--color-text-secondary)] text-[11px] flex items-center justify-center">
            Y
          </div>
          <span className="text-[13px] text-[var(--color-text-primary)] flex-1">You</span>
          <Settings size={14} className="text-[var(--color-text-tertiary)]" />
        </div>
      </aside>

      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}