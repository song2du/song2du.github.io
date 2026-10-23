"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoScenario } from "@/lib/demo-types";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, RestartIcon } from "./icons";
import { MessageBubble } from "./message-bubble";

// Time to read a message before the next one appears, at 1× speed.
function readingDelay(text: string) {
  return Math.min(3500, 800 + text.length * 22);
}

export function ReplayPlayer({ scenario }: { scenario: DemoScenario }) {
  const { participants, replay } = scenario;
  const [shown, setShown] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [showThoughts, setShowThoughts] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const done = shown >= replay.length;
  const isPlaying = playing && !done;
  const hasThoughts = replay.some((turn) => turn.thought);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => setShown((n) => n + 1), readingDelay(replay[shown - 1].text) / speed);
    return () => clearTimeout(timer);
  }, [isPlaying, shown, speed, replay]);

  // Follow the newest message inside the transcript without scrolling the page.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ top: list.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [shown, showThoughts]);

  function togglePlay() {
    if (isPlaying) return setPlaying(false);
    if (done) setShown(1);
    setPlaying(true);
  }

  function step(delta: number) {
    setPlaying(false);
    setShown((n) => Math.min(replay.length, Math.max(1, n + delta)));
  }

  return (
    <div>
      <div
        ref={listRef}
        aria-live="polite"
        className="flex h-[26rem] flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-5"
      >
        {replay.slice(0, shown).map((turn, i) => (
          <MessageBubble
            key={i}
            participant={participants.find((p) => p.id === turn.speaker)!}
            side={turn.speaker === participants[0].id ? "left" : "right"}
            text={turn.text}
            thought={showThoughts ? turn.thought : undefined}
            annotations={turn.annotations}
          />
        ))}
        {shown === 1 && !isPlaying && (
          <p className="m-auto text-sm text-faint">Press play to replay the conversation.</p>
        )}
      </div>

      <div className="h-0.5 bg-line">
        <div
          className="h-full bg-accent transition-[width] duration-300"
          style={{ width: `${(shown / replay.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1 px-2 py-2 sm:px-3">
        <ControlButton label="Restart" onClick={() => { setPlaying(false); setShown(1); }}>
          <RestartIcon />
        </ControlButton>
        <ControlButton label="Previous message" onClick={() => step(-1)} disabled={shown <= 1}>
          <PrevIcon />
        </ControlButton>
        <ControlButton label={isPlaying ? "Pause" : "Play"} onClick={togglePlay} primary>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </ControlButton>
        <ControlButton label="Next message" onClick={() => step(1)} disabled={done}>
          <NextIcon />
        </ControlButton>

        <span className="ml-1 text-xs tabular-nums text-muted">
          {shown} / {replay.length}
        </span>

        <div className="ml-auto flex items-center gap-1">
          {hasThoughts && (
            <button
              type="button"
              aria-pressed={showThoughts}
              onClick={() => setShowThoughts((v) => !v)}
              className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                showThoughts ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface hover:text-fg"
              }`}
            >
              Reasoning
            </button>
          )}
          <button
            type="button"
            onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
            className="w-10 rounded-md py-1.5 text-xs tabular-nums text-muted transition-colors hover:bg-surface hover:text-fg"
            aria-label={`Playback speed ${speed}×`}
          >
            {speed}×
          </button>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  primary,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid size-8 place-items-center rounded-md transition-colors disabled:opacity-30 ${
        primary ? "bg-fg text-bg hover:opacity-85" : "text-muted hover:bg-surface hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
