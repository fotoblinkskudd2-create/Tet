"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./KnowledgeGraph.module.css";

interface NoteNode {
  id: string;
  title: string | null;
  summary: string | null;
  entities: { text: string; type: string }[];
}

const TYPE_COLORS: Record<string, string> = {
  person: "#f472b6",
  concept: "#a78bfa",
  place: "#34d399",
  book: "#fbbf24",
  event: "#60a5fa",
  idea: "#f97316",
};

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "note" | string;
  radius: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

function buildGraph(notes: NoteNode[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const entityIndex = new Map<string, string>();

  // Note nodes
  notes.forEach((note, i) => {
    const angle = (i / notes.length) * Math.PI * 2;
    const r = 200;
    nodes.push({
      id: note.id,
      label: (note.title ?? note.summary ?? "Note").slice(0, 30),
      x: 400 + Math.cos(angle) * r,
      y: 300 + Math.sin(angle) * r,
      type: "note",
      radius: 12,
    });

    note.entities.forEach((e) => {
      const key = `${e.type}:${e.text.toLowerCase()}`;
      if (!entityIndex.has(key)) {
        const ex = 400 + (Math.random() - 0.5) * 500;
        const ey = 300 + (Math.random() - 0.5) * 400;
        const eId = `entity-${key}`;
        entityIndex.set(key, eId);
        nodes.push({
          id: eId,
          label: e.text,
          x: ex,
          y: ey,
          type: e.type,
          radius: 7,
        });
      }
      edges.push({ source: note.id, target: entityIndex.get(key)! });
    });
  });

  return { nodes, edges };
}

export default function KnowledgeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((notes: NoteNode[]) => {
        const { nodes, edges } = buildGraph(notes);
        nodesRef.current = nodes;
        edgesRef.current = edges;
        draw(nodes, edges);
      });
  }, []);

  function draw(nodes: GraphNode[], edges: GraphEdge[], highlight?: string) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = "#0c0c14";
    ctx.fillRect(0, 0, W, H);

    // Edges
    edges.forEach((e) => {
      const src = nodes.find((n) => n.id === e.source);
      const tgt = nodes.find((n) => n.id === e.target);
      if (!src || !tgt) return;
      ctx.beginPath();
      ctx.strokeStyle = highlight === src.id ? "#a78bfa44" : "#1e1e3244";
      ctx.lineWidth = highlight === src.id ? 1.5 : 0.5;
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);
      ctx.stroke();
    });

    // Nodes
    nodes.forEach((n) => {
      const color = n.type === "note" ? "#6e4fff" : (TYPE_COLORS[n.type] ?? "#6b7280");
      const isHighlighted = highlight === n.id;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius + (isHighlighted ? 3 : 0), 0, Math.PI * 2);
      ctx.fillStyle = isHighlighted ? color : color + "aa";
      ctx.fill();

      if (isHighlighted || n.type === "note") {
        ctx.fillStyle = "#d4d4f0";
        ctx.font = `${n.type === "note" ? 11 : 9}px sans-serif`;
        ctx.fillText(n.label, n.x + n.radius + 4, n.y + 4);
      }
    });
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const hit = nodesRef.current.find((n) => {
      const dx = n.x - mx;
      const dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
    });

    setSelected(hit ?? null);
    draw(nodesRef.current, edgesRef.current, hit?.id);
  }

  return (
    <div className={styles.wrapper}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className={styles.canvas}
        onClick={handleClick}
      />
      {selected && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipType}>{selected.type}</div>
          <div className={styles.tooltipLabel}>{selected.label}</div>
        </div>
      )}
      {nodesRef.current.length === 0 && (
        <div className={styles.empty}>
          No notes yet. <a href="/write">Add your first note →</a>
        </div>
      )}
    </div>
  );
}
