"use client";

import { PerspectiveColumn } from "./perspective-column";
import type { Perspective } from "@/types";

interface TriLensViewProps {
  perspectives: Perspective[];
}

export function TriLensView({ perspectives }: TriLensViewProps) {
  const progressive = perspectives.find((p) => p.type === "PROGRESSIVE");
  const conservative = perspectives.find((p) => p.type === "CONSERVATIVE");
  const international = perspectives.find((p) => p.type === "INTERNATIONAL");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <PerspectiveColumn perspective={progressive} type="PROGRESSIVE" />
      <PerspectiveColumn perspective={conservative} type="CONSERVATIVE" />
      <PerspectiveColumn perspective={international} type="INTERNATIONAL" />
    </div>
  );
}
