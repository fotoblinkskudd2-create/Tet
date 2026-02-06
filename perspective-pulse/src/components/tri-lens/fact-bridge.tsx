"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FactBridgeProps {
  facts: string[];
  sourceCount: number;
}

export function FactBridge({ facts, sourceCount }: FactBridgeProps) {
  if (facts.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <CardTitle className="text-lg text-amber-900">
              Fact Bridge
            </CardTitle>
            <p className="text-xs text-amber-700">
              Consensus facts verified across {sourceCount} sources
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {facts.map((fact, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <p className="text-sm text-amber-900 leading-relaxed">{fact}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
