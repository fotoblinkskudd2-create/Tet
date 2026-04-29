export type AgentType = "scout" | "processor" | "validator" | "finalizer";
export type ModelKey = "opus" | "sonnet" | "haiku";

export interface AgentNodeData {
  label: string;
  type: AgentType;
  prompt: string;
  model: ModelKey;
  temperature: number;
  maxTokens: number;
  status?: "idle" | "running" | "done" | "error";
  output?: string;
  cost?: number;
  durationMs?: number;
}

export interface WorkflowDefinition {
  nodes: import("@xyflow/react").Node<AgentNodeData>[];
  edges: import("@xyflow/react").Edge[];
}

export const AGENT_COLORS: Record<AgentType, string> = {
  scout: "#7c6aff",
  processor: "#22c55e",
  validator: "#f59e0b",
  finalizer: "#ef4444",
};

export const MODEL_LABELS: Record<ModelKey, string> = {
  opus: "Opus 4.7",
  sonnet: "Sonnet 4.6",
  haiku: "Haiku 4.5",
};

export const TEMPLATE_WORKFLOWS: { name: string; def: WorkflowDefinition }[] = [
  {
    name: "Research Pipeline",
    def: {
      nodes: [
        {
          id: "scout",
          type: "agentNode",
          position: { x: 100, y: 200 },
          data: {
            label: "Scout",
            type: "scout",
            prompt: "Search and gather information about the topic. Return a structured list of key facts.",
            model: "haiku",
            temperature: 0.3,
            maxTokens: 1024,
          },
        },
        {
          id: "processor1",
          type: "agentNode",
          position: { x: 400, y: 100 },
          data: {
            label: "Processor A",
            type: "processor",
            prompt: "Analyze the first half of the gathered facts. Find patterns and insights.",
            model: "sonnet",
            temperature: 0.5,
            maxTokens: 2048,
          },
        },
        {
          id: "processor2",
          type: "agentNode",
          position: { x: 400, y: 300 },
          data: {
            label: "Processor B",
            type: "processor",
            prompt: "Analyze the second half of the gathered facts. Find contradictions and gaps.",
            model: "sonnet",
            temperature: 0.5,
            maxTokens: 2048,
          },
        },
        {
          id: "validator",
          type: "agentNode",
          position: { x: 700, y: 200 },
          data: {
            label: "Validator",
            type: "validator",
            prompt: "Cross-check the two analyses for consistency. Flag any contradictions.",
            model: "sonnet",
            temperature: 0.2,
            maxTokens: 1024,
          },
        },
        {
          id: "finalizer",
          type: "agentNode",
          position: { x: 1000, y: 200 },
          data: {
            label: "Finalizer",
            type: "finalizer",
            prompt: "Synthesize all findings into a comprehensive, well-structured report.",
            model: "opus",
            temperature: 0.7,
            maxTokens: 4096,
          },
        },
      ],
      edges: [
        { id: "e1", source: "scout", target: "processor1" },
        { id: "e2", source: "scout", target: "processor2" },
        { id: "e3", source: "processor1", target: "validator" },
        { id: "e4", source: "processor2", target: "validator" },
        { id: "e5", source: "validator", target: "finalizer" },
      ],
    },
  },
];
