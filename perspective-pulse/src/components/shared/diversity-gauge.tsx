"use client";

import { Progress } from "@/components/ui/progress";
import { scoreToGrade } from "@/lib/utils";

interface DiversityGaugeProps {
  overallScore: number;
  progressiveExposure: number;
  conservativeExposure: number;
  internationalExposure: number;
  streakDays: number;
}

export function DiversityGauge({
  overallScore,
  progressiveExposure,
  conservativeExposure,
  internationalExposure,
  streakDays,
}: DiversityGaugeProps) {
  const grade = scoreToGrade(overallScore);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            Diversity Score
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{grade}</span>
            <span className="text-lg text-muted-foreground">
              {overallScore.toFixed(1)}
            </span>
          </div>
        </div>
        {streakDays > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="text-2xl font-bold">{streakDays}d</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-blue-600 font-medium">Progressive</span>
            <span>{progressiveExposure.toFixed(1)}%</span>
          </div>
          <Progress
            value={progressiveExposure}
            className="h-2"
            indicatorClassName="bg-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-red-600 font-medium">Conservative</span>
            <span>{conservativeExposure.toFixed(1)}%</span>
          </div>
          <Progress
            value={conservativeExposure}
            className="h-2"
            indicatorClassName="bg-red-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-emerald-600 font-medium">International</span>
            <span>{internationalExposure.toFixed(1)}%</span>
          </div>
          <Progress
            value={internationalExposure}
            className="h-2"
            indicatorClassName="bg-emerald-500"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        A balanced reader engages equally with all perspectives
      </p>
    </div>
  );
}
