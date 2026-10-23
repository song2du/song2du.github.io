"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { sendMessage, START_MARKER, type ChatMessage } from "@/lib/anthropic-browser";
import { DEFAULT_EFFORT, DEFAULT_MODEL, type DemoScenario, type LiveConfig } from "@/lib/demo-types";
import { MessageBubble } from "./message-bubble";
import { useApiKey } from "./use-api-key";

type Line = { speaker: string; text: string };

function initialState(live: LiveConfig): { lines: Line[]; history: ChatMessage[] } {
  if (!live.opening) return { lines: [], history: [] };
  return {
    lines: [{ speaker: live.agent, text: live.opening }],
    history: [
      { role: "user", content: START_MARKER },
      { role: "assistant", content: live.opening },
    ],
  };
}

export function LiveChat({ scenario, live }: { scenario: DemoScenario; live: LiveConfig }) {
  const [apiKey, setApiKey] = useApiKey();
  const agent = scenario.participants.find((p) => p.id === live.agent)!;
  const human = scenario.participants.find((p) => p.id === live.human)!;
  const model = live.model ?? DEFAULT_MODEL;

  if (!apiKey) return <KeyForm agentName={agent.name} humanName={human.name} model={model} onSubmit={setApiKey} />;
  return <Conversation key={apiKey} apiKey={apiKey} scenario={scenario} live={live} onForgetKey={() => setApiKey(null)} />;
}

function Conversation({
  apiKey,
  scenario,
  live,
  onForgetKey,
}: {
  apiKey: string;
  scenario: DemoScenario;
  live: LiveConfig;
  onForgetKey: () => void;
}) {
  const [{ lines, history }, setChat] = useState(() => initialState(live));
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const model = live.model ?? DEFAULT_MODEL;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, pending]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    setChat((chat) => ({ ...chat, lines: [...chat.lines, { speaker: live.human, text }] }));
    setInput("");
    setError(null);
    setPending(true);

    const result = await sendMessage({
      apiKey,
      model,
      effort: live.effort ?? DEFAULT_EFFORT,
      system: live.systemPrompt,
      messages: [...history, userMessage],
    });
    setPending(false);

    if (result.kind === "ok") {
      setChat((chat) => ({
        lines: [...chat.lines, { speaker: live.agent, text: result.text }],
        history: [...history, userMessage, result.message],
      }));
      return;
    }
    // Nothing was added to the API history, so put the message back for another try.
    setChat((chat) => ({ ...chat, lines: chat.lines.slice(0, -1) }));
    setInput(text);
    setError(result.kind === "refusal" ? "The model declined to respond to that message. Try rephrasing it." : result.message);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Ignore Enter while a Korean/Japanese IME is still composing a character.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <div>
      {live.humanBrief && (
        <div className="border-b border-line bg-surface px-4 py-3 text-sm leading-6 sm:px-5">
          <span className="font-medium">Your role: </span>
          <span className="text-muted">{live.humanBrief}</span>
        </div>
      )}

      <div ref={listRef} aria-live="polite" className="flex h-[22rem] flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-5">
        {lines.length === 0 && (
          <p className="m-auto text-sm text-muted">Send the first message to start.</p>
        )}
        {lines.map((line, i) => (
          <MessageBubble
            key={i}
            participant={scenario.participants.find((p) => p.id === line.speaker)!}
            side={line.speaker === live.human ? "right" : "left"}
            text={line.text}
          />
        ))}
        {pending && <p className="animate-pulse px-1 text-sm text-muted">Thinking…</p>}
      </div>

      {error && <p className="px-4 pb-2 text-sm text-danger sm:px-5">{error}</p>}

      <form onSubmit={send} className="flex items-end gap-2 border-t border-line p-2 sm:p-3">
        <label htmlFor="live-chat-input" className="sr-only">
          Message
        </label>
        <textarea
          id="live-chat-input"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your message…"
          className="max-h-32 min-h-10 flex-1 resize-y rounded-lg border border-line bg-bg px-3 py-2 text-[0.94rem] leading-6 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="h-10 rounded-lg bg-fg px-4 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-30"
        >
          Send
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-3 text-xs text-muted sm:px-5">
        <span>
          Model: <code>{model}</code>, billed to your key
        </span>
        <span className="ml-auto flex gap-3">
          <button
            type="button"
            className="hover:text-fg disabled:opacity-40"
            disabled={pending}
            onClick={() => {
              setChat(initialState(live));
              setError(null);
            }}
          >
            Reset
          </button>
          <button type="button" className="hover:text-fg" onClick={onForgetKey}>
            Forget key
          </button>
        </span>
      </div>
    </div>
  );
}

function KeyForm({
  agentName,
  humanName,
  model,
  onSubmit,
}: {
  agentName: string;
  humanName: string;
  model: string;
  onSubmit: (key: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      className="flex flex-col gap-4 px-4 py-6 sm:px-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <div className="text-sm leading-6">
        <p className="font-medium">
          Play the {humanName} against the {agentName}.
        </p>
        <p className="text-muted">
          The live demo runs on your own Anthropic API key (<code>{model}</code>).
        </p>
      </div>

      <div className="flex gap-2">
        <label htmlFor="api-key" className="sr-only">
          Anthropic API key
        </label>
        <input
          id="api-key"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="sk-ant-…"
          className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 font-mono text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="h-10 rounded-lg bg-fg px-4 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-30"
        >
          Start
        </button>
      </div>

      <ul className="list-disc space-y-1 pl-5 text-xs leading-5 text-muted">
        <li>This site has no server. Your key goes straight from your browser to api.anthropic.com.</li>
        <li>It is kept only in this tab and is cleared when you close it.</li>
        <li>
          Don&apos;t have one?{" "}
          <a className="underline underline-offset-2 hover:text-fg" href="https://console.anthropic.com/" target="_blank" rel="noreferrer">
            Create a key in the Anthropic Console
          </a>
          .
        </li>
      </ul>
    </form>
  );
}
