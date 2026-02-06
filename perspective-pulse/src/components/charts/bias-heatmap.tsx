"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HeatmapDataPoint } from "@/types";

interface BiasHeatmapProps {
  data: HeatmapDataPoint[];
}

interface RegionChartData {
  region: string;
  progressive: number;
  conservative: number;
  international: number;
  total: number;
}

export function BiasHeatmap({ data }: BiasHeatmapProps) {
  const chartData: RegionChartData[] = data.map((point) => ({
    region: point.region,
    progressive: point.perspectiveBreakdown.progressive,
    conservative: point.perspectiveBreakdown.conservative,
    international: point.perspectiveBreakdown.international,
    total: point.count,
  }));

  // Sort by total coverage descending
  chartData.sort((a, b) => b.total - a.total);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Geographic Coverage Bias</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribution of perspective types across regions
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="region"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="progressive"
                name="Progressive"
                stackId="a"
                fill="#3b82f6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="conservative"
                name="Conservative"
                stackId="a"
                fill="#ef4444"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="international"
                name="International"
                stackId="a"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Intensity grid */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Coverage Intensity</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {data.map((point) => {
              const intensity = Math.min(point.count / 10, 1);
              return (
                <div
                  key={point.region}
                  className="rounded-lg border p-3 text-center"
                  style={{
                    backgroundColor: `rgba(59, 130, 246, ${intensity * 0.2})`,
                  }}
                >
                  <p className="text-xs font-medium">{point.region}</p>
                  <p className="text-lg font-bold">{point.count}</p>
                  <p className="text-[10px] text-muted-foreground">articles</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
