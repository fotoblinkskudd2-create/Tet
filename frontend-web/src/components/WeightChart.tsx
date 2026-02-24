"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface WeightEntry {
  date: string;
  weightKg: number;
}

interface WeightChartProps {
  entries: WeightEntry[];
  goalWeight?: number;
}

/** Line chart showing weight trend over time */
export default function WeightChart({ entries, goalWeight }: WeightChartProps) {
  const data = entries.map((e) => ({
    date: new Date(e.date).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
    }),
    vekt: e.weightKg,
  }));

  const weights = entries.map((e) => e.weightKg);
  const minW = Math.floor(Math.min(...weights, goalWeight || Infinity) - 2);
  const maxW = Math.ceil(Math.max(...weights) + 2);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis domain={[minW, maxW]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip
            formatter={(value: number) => [`${value} kg`, "Vekt"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
            }}
          />
          <Line
            type="monotone"
            dataKey="vekt"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#22c55e" }}
            activeDot={{ r: 5 }}
          />
          {goalWeight && (
            <ReferenceLine
              y={goalWeight}
              stroke="#f97316"
              strokeDasharray="5 5"
              label={{ value: `Mål: ${goalWeight} kg`, fill: "#f97316", fontSize: 12 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
