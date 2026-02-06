"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { perspectiveColor, perspectiveLabel } from "@/lib/utils";
import type { Perspective } from "@/types";

interface PerspectiveColumnProps {
  perspective: Perspective | undefined;
  type: "PROGRESSIVE" | "CONSERVATIVE" | "INTERNATIONAL";
}

export function PerspectiveColumn({
  perspective,
  type,
}: PerspectiveColumnProps) {
  const colorClasses = perspectiveColor(type);
  const label = perspectiveLabel(type);

  if (!perspective) {
    return (
      <Card className={`border-2 border-dashed opacity-60 ${colorClasses}`}>
        <CardHeader>
          <CardTitle className="text-lg">{label} View</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No {label.toLowerCase()} perspective available for this story yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-l-4 ${colorClasses}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge
            variant={
              type === "PROGRESSIVE"
                ? "progressive"
                : type === "CONSERVATIVE"
                  ? "conservative"
                  : "international"
            }
          >
            {label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Bias: {perspective.biasScore > 0 ? "+" : ""}
            {perspective.biasScore.toFixed(2)}
          </span>
        </div>
        <CardTitle className="text-base leading-snug">
          {perspective.headline}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {perspective.sourceName} ({perspective.sourceRegion})
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm leading-relaxed whitespace-pre-line">
          {perspective.body}
        </div>

        {perspective.keyArguments.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Key Arguments
            </h4>
            <ul className="space-y-1">
              {perspective.keyArguments.map((arg, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                >
                  <span className="mt-1 h-1 w-1 rounded-full bg-current flex-shrink-0" />
                  {arg}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>
            Sentiment:{" "}
            {perspective.sentimentScore > 0
              ? "Positive"
              : perspective.sentimentScore < 0
                ? "Negative"
                : "Neutral"}{" "}
            ({perspective.sentimentScore.toFixed(2)})
          </span>
          <a
            href={perspective.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Read source
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
