import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiversityGauge } from "@/components/shared/diversity-gauge";
import { BiasHeatmap } from "@/components/charts/bias-heatmap";
import type { HeatmapDataPoint } from "@/types";

const DEMO_DIVERSITY = {
  overallScore: 72.5,
  progressiveExposure: 42.3,
  conservativeExposure: 28.1,
  internationalExposure: 29.6,
  streakDays: 7,
};

const DEMO_READING_STATS = {
  storiesRead: 47,
  perspectivesExplored: 128,
  topCategory: "Politics",
  avgTimePerStory: "4.2 min",
};

const DEMO_HEATMAP: HeatmapDataPoint[] = [
  {
    region: "North America",
    lat: 40,
    lng: -100,
    count: 18,
    perspectiveBreakdown: { progressive: 8, conservative: 7, international: 3 },
  },
  {
    region: "Europe",
    lat: 50,
    lng: 10,
    count: 14,
    perspectiveBreakdown: { progressive: 5, conservative: 3, international: 6 },
  },
  {
    region: "Asia",
    lat: 35,
    lng: 105,
    count: 8,
    perspectiveBreakdown: { progressive: 2, conservative: 1, international: 5 },
  },
  {
    region: "Middle East",
    lat: 30,
    lng: 45,
    count: 4,
    perspectiveBreakdown: { progressive: 1, conservative: 1, international: 2 },
  },
  {
    region: "Africa",
    lat: 5,
    lng: 20,
    count: 3,
    perspectiveBreakdown: { progressive: 1, conservative: 0, international: 2 },
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your media diet and diversity score
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stories Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{DEMO_READING_STATS.storiesRead}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Perspectives Explored
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {DEMO_READING_STATS.perspectivesExplored}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {DEMO_READING_STATS.topCategory}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Read Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {DEMO_READING_STATS.avgTimePerStory}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Media Diet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <DiversityGauge
              overallScore={DEMO_DIVERSITY.overallScore}
              progressiveExposure={DEMO_DIVERSITY.progressiveExposure}
              conservativeExposure={DEMO_DIVERSITY.conservativeExposure}
              internationalExposure={DEMO_DIVERSITY.internationalExposure}
              streakDays={DEMO_DIVERSITY.streakDays}
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <BiasHeatmap data={DEMO_HEATMAP} />
        </div>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended to Broaden Your View</CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on your reading patterns, here are stories from perspectives
            you haven&apos;t explored recently
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="h-2 w-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">
                  Conservative Perspective: Supply-Side Solutions to Climate Policy
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You&apos;ve read 15% fewer conservative viewpoints this week
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">
                  International Perspective: How ASEAN Nations View Trade Tensions
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Expand your geographic diversity with non-Western viewpoints
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
