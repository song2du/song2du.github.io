import Anthropic from "@anthropic-ai/sdk";
import type { Effort } from "./demo-types";

// Bring-your-own-key calls straight from the visitor's browser to api.anthropic.com.
// The site has no server, so the key never leaves the visitor's machine except to Anthropic.

export type ChatMessage = Anthropic.Beta.BetaMessageParam;

export type ChatResult =
  | { kind: "ok"; text: string; message: ChatMessage }
  | { kind: "refusal" }
  | { kind: "error"; message: string };

// The API requires the first message to come from the user. When the agent speaks
// first (a fixed `opening`), this marker stands in as the user's turn.
export const START_MARKER = "(The conversation begins.)";

export async function sendMessage(options: {
  apiKey: string;
  model: string;
  effort: Effort;
  system: string;
  messages: ChatMessage[];
}): Promise<ChatResult> {
  const client = new Anthropic({ apiKey: options.apiKey, dangerouslyAllowBrowser: true });
  try {
    const response = await client.beta.messages.create({
      model: options.model,
      max_tokens: 16000,
      system: options.system,
      messages: options.messages,
      output_config: { effort: options.effort },
      // If a safety classifier declines, Anthropic retries on its recommended fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    if (response.stop_reason === "refusal") return { kind: "refusal" };
    const text = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("\n")
      .trim();
    // Keep the full content (thinking blocks included) so the history stays append-only.
    return { kind: "ok", text, message: { role: "assistant", content: response.content } };
  } catch (error) {
    return { kind: "error", message: describeError(error) };
  }
}

function describeError(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) return "That API key was rejected. Check it and try again.";
  if (error instanceof Anthropic.PermissionDeniedError) return "This API key doesn't have access to the model.";
  if (error instanceof Anthropic.NotFoundError) return "Model not found. The demo's model setting may be outdated.";
  if (error instanceof Anthropic.RateLimitError) return "Rate limited by the API. Wait a moment and try again.";
  if (error instanceof Anthropic.BadRequestError) return `The API rejected the request: ${error.message}`;
  if (error instanceof Anthropic.APIConnectionError) return "Couldn't reach api.anthropic.com. Check your connection.";
  if (error instanceof Anthropic.APIError) return `API error (${error.status}): ${error.message}`;
  return "Something went wrong. Please try again.";
}
