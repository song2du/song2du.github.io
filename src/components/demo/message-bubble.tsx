import type { Participant } from "@/lib/demo-types";

export function MessageBubble({
  participant,
  side,
  text,
  thought,
  annotations,
}: {
  participant: Participant;
  side: "left" | "right";
  text: string;
  thought?: string;
  annotations?: Record<string, string | number>;
}) {
  const right = side === "right";
  return (
    <div className={`flex flex-col gap-1 ${right ? "items-end" : "items-start"}`}>
      <p className="px-1 text-xs text-muted">
        <span className="font-medium text-fg">{participant.name}</span>
        {participant.role && <span> · {participant.role}</span>}
      </p>
      {thought && (
        <p className="max-w-[85%] rounded-lg border border-dashed border-line px-3 py-2 text-xs leading-5 text-muted italic">
          {thought}
        </p>
      )}
      <p
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.94rem] leading-6 whitespace-pre-wrap ${
          right ? "rounded-tr-sm bg-accent-soft" : "rounded-tl-sm bg-surface"
        }`}
      >
        {text}
      </p>
      {annotations && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {Object.entries(annotations).map(([key, value]) => (
            <span key={key} className="rounded-full border border-line px-2 py-0.5 text-[0.7rem] text-muted">
              {key}: <span className="font-medium text-fg">{value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
