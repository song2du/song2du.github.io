"use client";

import { useState } from "react";
import type { DemoScenario } from "@/lib/demo-types";
import { LiveChat } from "./live-chat";
import { ReplayPlayer } from "./replay-player";

type Tab = "replay" | "live";

export function AgentDemoClient({ scenario }: { scenario: DemoScenario }) {
  const [tab, setTab] = useState<Tab>("replay");
  const tabs: { id: Tab; label: string }[] = [
    { id: "replay", label: "Replay" },
    ...(scenario.live ? [{ id: "live" as const, label: "Try it live" }] : []),
  ];

  return (
    <section className="not-prose my-8 overflow-hidden rounded-xl border border-line bg-bg">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 pt-4 sm:px-5">
        <div className="min-w-0 pb-3">
          <p className="text-xs font-medium tracking-wide text-accent uppercase">Interactive demo</p>
          <h3 className="mt-0.5 font-semibold">{scenario.title}</h3>
          {scenario.description && <p className="mt-1 text-sm leading-6 text-muted">{scenario.description}</p>}
        </div>
        {tabs.length > 1 && (
          <div role="tablist" aria-label="Demo mode" className="flex gap-1 self-end">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px border-b-2 px-3 pb-2.5 text-sm transition-colors ${
                  tab === t.id ? "border-fg font-medium text-fg" : "border-transparent text-muted hover:text-fg"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {tab === "replay" && scenario.source && (
        <p className="border-b border-line px-4 py-2 text-xs text-muted sm:px-5">{scenario.source}</p>
      )}

      {/* Both panels stay mounted so switching tabs keeps the live conversation. */}
      <div role="tabpanel" hidden={tab !== "replay"}>
        <ReplayPlayer scenario={scenario} />
      </div>
      {scenario.live && (
        <div role="tabpanel" hidden={tab !== "live"}>
          <LiveChat scenario={scenario} live={scenario.live} />
        </div>
      )}
    </section>
  );
}
