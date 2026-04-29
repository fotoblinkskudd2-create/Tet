import { NextRequest, NextResponse } from "next/server";
import { runWorkflow, type AgentNodeConfig, type WorkflowEdge } from "@five-apps/ai";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nodes, edges, input } = body as {
    nodes: AgentNodeConfig[];
    edges: WorkflowEdge[];
    input: string;
  };

  if (!nodes?.length || !input) {
    return NextResponse.json({ error: "nodes and input required" }, { status: 400 });
  }

  if (input.length > 5000) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const result = await runWorkflow(nodes, edges, input);
  return NextResponse.json(result);
}
