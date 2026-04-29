"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";
import type { AgentNodeData } from "../../types/workflow";
import { AGENT_COLORS, MODEL_LABELS } from "../../types/workflow";
import styles from "./AgentNode.module.css";

const STATUS_ICONS = {
  idle: "○",
  running: "◌",
  done: "●",
  error: "✕",
};

export function AgentNodeComponent({ data, selected }: NodeProps<AgentNodeData>) {
  const color = AGENT_COLORS[data.type];
  const statusIcon = STATUS_ICONS[data.status ?? "idle"];

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ""}`}
      style={{ "--accent": color } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className={styles.handle} />

      <div className={styles.header}>
        <span className={styles.type} style={{ color }}>
          {data.type.toUpperCase()}
        </span>
        <span
          className={styles.status}
          style={{ color: data.status === "error" ? "#ef4444" : data.status === "done" ? "#22c55e" : "#6b7280" }}
        >
          {statusIcon}
        </span>
      </div>

      <div className={styles.label}>{data.label}</div>
      <div className={styles.model}>{MODEL_LABELS[data.model]}</div>

      {data.status === "done" && data.cost !== undefined && (
        <div className={styles.cost}>${data.cost.toFixed(4)}</div>
      )}

      {data.status === "running" && (
        <div className={styles.spinner}>processing...</div>
      )}

      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  );
}
