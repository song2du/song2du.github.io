import { getDemo } from "@/lib/content";
import { AgentDemoClient } from "./agent-demo-client";

// Used from MDX as <AgentDemo id="sample-negotiation" />.
// Reads src/content/demos/<id>.json at build time.
export async function AgentDemo({ id }: { id: string }) {
  const scenario = await getDemo(id);
  return <AgentDemoClient scenario={scenario} />;
}
