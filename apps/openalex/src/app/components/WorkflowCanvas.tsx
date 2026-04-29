"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import { AgentNodeComponent } from "./AgentNode";
import type { AgentNodeData, WorkflowDefinition } from "../../types/workflow";
import { TEMPLATE_WORKFLOWS } from "../../types/workflow";
import styles from "./WorkflowCanvas.module.css";

const NODE_TYPES = { agentNode: AgentNodeComponent };

const DEFAULT_WORKFLOW = TEMPLATE_WORKFLOWS[0].def;

export default function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(DEFAULT_WORKFLOW.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_WORKFLOW.edges);
  const [input, setInput] = useState("Explain the impact of the U-864 mercury wreck on Norwegian fishing.");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState<number | null>(null);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  async function runWorkflow() {
    setRunning(true);
    setOutput(null);

    // Mark all nodes as running
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, status: "running" as const, output: undefined } }))
    );

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes: nodes.map((n) => ({
            id: n.id,
            ...n.data,
          })),
          edges: edges.map((e) => ({ from: e.source, to: e.target })),
          input,
        }),
      });

      const data = await res.json();

      // Update nodes with results
      const stepMap = new Map(data.steps?.map((s: { agentId: string; cost: number; durationMs: number; output: string }) => [s.agentId, s]));
      setNodes((nds) =>
        nds.map((n) => {
          const step = stepMap.get(n.id) as { cost: number; durationMs: number; output: string } | undefined;
          return {
            ...n,
            data: {
              ...n.data,
              status: step ? ("done" as const) : ("idle" as const),
              cost: step?.cost,
              durationMs: step?.durationMs,
              output: step?.output,
            },
          };
        })
      );

      setOutput(data.finalOutput);
      setTotalCost(data.totalCost);
    } catch {
      setNodes((nds) =>
        nds.map((n) => ({ ...n, data: { ...n.data, status: "error" as const } }))
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.appName}>OPENALEX</div>
        <div className={styles.controls}>
          <input
            className={styles.inputBox}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Workflow input..."
          />
          <button
            className={`${styles.runBtn} ${running ? styles.running : ""}`}
            onClick={runWorkflow}
            disabled={running}
          >
            {running ? "RUNNING..." : "▶ RUN"}
          </button>
          {totalCost !== null && (
            <span className={styles.costLabel}>
              COST: ${totalCost.toFixed(4)}
            </span>
          )}
        </div>
      </div>

      <div className={styles.canvas}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={NODE_TYPES}
          fitView
          style={{ background: "#0e0e10" }}
        >
          <Background color="#1a1a1e" gap={24} />
          <Controls style={{ background: "#161618", border: "1px solid #2a2a2e" }} />
          <MiniMap
            style={{ background: "#0e0e10", border: "1px solid #2a2a2e" }}
            nodeColor={(n) => {
              const d = n.data as AgentNodeData;
              return d.status === "done" ? "#22c55e" : d.status === "running" ? "#7c6aff" : "#2a2a2e";
            }}
          />
        </ReactFlow>
      </div>

      {output && (
        <div className={styles.outputPanel}>
          <div className={styles.outputLabel}>FINAL OUTPUT</div>
          <pre className={styles.outputText}>{output}</pre>
        </div>
      )}
    </div>
  );
}
