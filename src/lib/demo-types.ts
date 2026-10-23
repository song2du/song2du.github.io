// Shape of a demo file in `src/content/demos/<id>.json`.
// Embed one in any MDX page with `<AgentDemo id="<id>" />`.

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export type Participant = {
  id: string;
  name: string;
  role?: string; // short label under the name, e.g. "Buyer agent"
};

export type ReplayTurn = {
  speaker: string; // participant id
  text: string;
  // The agent's private reasoning for this turn, revealed with "Show reasoning".
  thought?: string;
  // Small labels under the message, e.g. { "Offer": "₩140,000" }.
  annotations?: Record<string, string | number>;
};

export type LiveConfig = {
  agent: string; // participant id the model plays
  human: string; // participant id the visitor plays
  systemPrompt: string;
  humanBrief?: string; // instructions shown to the visitor before they start
  opening?: string; // fixed first message from the agent (costs nothing)
  model?: string; // defaults to DEFAULT_MODEL
  effort?: Effort; // defaults to DEFAULT_EFFORT
};

export type DemoScenario = {
  title: string;
  description?: string;
  // Shown above the replay, e.g. where the log came from.
  source?: string;
  participants: Participant[];
  replay: ReplayTurn[];
  live?: LiveConfig;
};

export const DEFAULT_MODEL = "claude-opus-5-5";
export const DEFAULT_EFFORT: Effort = "medium";
