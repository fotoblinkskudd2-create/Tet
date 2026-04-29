import { claude, MODELS } from "./client";
import type Anthropic from "@anthropic-ai/sdk";

export type AgentType = "scout" | "processor" | "validator" | "finalizer";
export type ModelKey = keyof typeof MODELS;

export interface AgentNodeConfig {
  id: string;
  type: AgentType;
  prompt: string;
  model: ModelKey;
  temperature: number;
  maxTokens: number;
}

export interface AgentResult {
  agentId: string;
  output: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  cost: number;
}

const COST_PER_MTOK: Record<string, { input: number; output: number }> = {
  [MODELS.opus]: { input: 15, output: 75 },
  [MODELS.sonnet]: { input: 3, output: 15 },
  [MODELS.haiku]: { input: 0.25, output: 1.25 },
};

export async function runAgent(
  config: AgentNodeConfig,
  input: string,
  onStream?: (chunk: string) => void
): Promise<AgentResult> {
  const model = MODELS[config.model];
  const start = Date.now();

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: `${config.prompt}\n\nINPUT:\n${input}` },
  ];

  let output = "";
  let inputTokens = 0;
  let outputTokens = 0;

  if (onStream) {
    const stream = await claude.messages.create({
      model,
      max_tokens: config.maxTokens,
      messages,
      stream: true,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        output += event.delta.text;
        onStream(event.delta.text);
      }
      if (event.type === "message_delta" && event.usage) {
        outputTokens = event.usage.output_tokens;
      }
      if (event.type === "message_start" && event.message.usage) {
        inputTokens = event.message.usage.input_tokens;
      }
    }
  } else {
    const response = await claude.messages.create({
      model,
      max_tokens: config.maxTokens,
      messages,
    });
    output =
      response.content[0].type === "text" ? response.content[0].text : "";
    inputTokens = response.usage.input_tokens;
    outputTokens = response.usage.output_tokens;
  }

  const costs = COST_PER_MTOK[model] ?? { input: 0, output: 0 };
  const cost =
    (inputTokens / 1_000_000) * costs.input +
    (outputTokens / 1_000_000) * costs.output;

  return {
    agentId: config.id,
    output,
    inputTokens,
    outputTokens,
    durationMs: Date.now() - start,
    cost,
  };
}

export interface WorkflowEdge {
  from: string;
  to: string;
  condition?: string;
}

export interface WorkflowResult {
  steps: AgentResult[];
  finalOutput: string;
  totalCost: number;
  totalDurationMs: number;
}

export async function runWorkflow(
  nodes: AgentNodeConfig[],
  edges: WorkflowEdge[],
  initialInput: string,
  onStepComplete?: (result: AgentResult) => void
): Promise<WorkflowResult> {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const outputs = new Map<string, string>();
  const steps: AgentResult[] = [];

  const roots = nodes.filter(
    (n) => !edges.some((e) => e.to === n.id)
  );

  async function executeNode(nodeId: string, input: string): Promise<void> {
    const node = nodeMap.get(nodeId);
    if (!node || outputs.has(nodeId)) return;

    const result = await runAgent(node, input);
    outputs.set(nodeId, result.output);
    steps.push(result);
    onStepComplete?.(result);

    const nextEdges = edges.filter((e) => e.from === nodeId);
    const parallelNext = nextEdges.filter((e) => {
      const allPredecessors = edges
        .filter((edge) => edge.to === e.to)
        .map((edge) => edge.from);
      return allPredecessors.every((pred) => outputs.has(pred));
    });

    await Promise.all(
      parallelNext.map((edge) => {
        const nextInput = edges
          .filter((e) => e.to === edge.to)
          .map((e) => outputs.get(e.from) ?? "")
          .join("\n\n---\n\n");
        return executeNode(edge.to, nextInput);
      })
    );
  }

  await Promise.all(roots.map((r) => executeNode(r.id, initialInput)));

  const finalNode = nodes.find((n) => !edges.some((e) => e.from === n.id));
  const finalOutput = finalNode ? (outputs.get(finalNode.id) ?? "") : "";
  const totalCost = steps.reduce((sum, s) => sum + s.cost, 0);
  const totalDurationMs = steps.reduce((sum, s) => sum + s.durationMs, 0);

  return { steps, finalOutput, totalCost, totalDurationMs };
}
