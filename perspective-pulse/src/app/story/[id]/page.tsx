import { TriLensView } from "@/components/tri-lens/tri-lens-view";
import { FactBridge } from "@/components/tri-lens/fact-bridge";
import { BiasHeatmap } from "@/components/charts/bias-heatmap";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Perspective, HeatmapDataPoint } from "@/types";

// Demo data for the story detail view
const DEMO_PERSPECTIVES: Perspective[] = [
  {
    id: "p1",
    storyId: "demo-1",
    type: "PROGRESSIVE",
    headline: "Climate Summit Delivers Landmark Win for Environmental Justice",
    body: "The global climate summit has produced what many environmental advocates are calling a watershed moment for climate policy. The agreement establishes legally binding carbon reduction targets that hold both developed and developing nations accountable.\n\nProgressive analysts emphasize that the accord includes critical provisions for climate justice, ensuring that developing nations receive financial support to transition away from fossil fuels without sacrificing economic growth. The deal also strengthens protections for indigenous communities disproportionately affected by climate change.",
    sourceName: "The Guardian",
    sourceUrl: "https://theguardian.com",
    sourceRegion: "UK",
    biasScore: -0.45,
    sentimentScore: 0.6,
    keyArguments: [
      "Climate justice provisions protect vulnerable nations",
      "Binding targets represent unprecedented international cooperation",
      "Financial mechanisms support equitable green transition",
      "Indigenous rights embedded in the agreement framework",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p2",
    storyId: "demo-1",
    type: "CONSERVATIVE",
    headline: "Climate Deal Raises Questions About Economic Impact and Sovereignty",
    body: "While the climate agreement has been widely reported as a diplomatic achievement, fiscal conservatives and industry leaders have raised concerns about the economic implications of binding carbon targets. The accord requires significant restructuring of energy sectors in developed nations.\n\nCritics argue that the agreement places disproportionate financial burden on developed economies while granting extended timelines to emerging industrial powers. Business groups warn that without careful implementation, the targets could lead to job losses in traditional energy sectors and increased energy costs for consumers.",
    sourceName: "Wall Street Journal",
    sourceUrl: "https://wsj.com",
    sourceRegion: "US",
    biasScore: 0.4,
    sentimentScore: -0.2,
    keyArguments: [
      "Economic burden falls disproportionately on developed nations",
      "Energy sector restructuring threatens existing jobs",
      "Emerging economies receive preferential treatment timelines",
      "Consumer energy costs likely to increase during transition",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p3",
    storyId: "demo-1",
    type: "INTERNATIONAL",
    headline: "Historic Climate Accord Sets New Framework for Global Cooperation",
    body: "The international community has achieved a significant diplomatic milestone with the finalization of the climate accord. The agreement represents years of complex negotiations balancing the interests of 195 nations with varying levels of economic development and environmental impact.\n\nAnalysts note that the accord's success lies in its tiered approach, which acknowledges different national circumstances while maintaining a unified global temperature target. The verification mechanisms built into the agreement are considered more robust than any previous international environmental treaty.",
    sourceName: "Reuters",
    sourceUrl: "https://reuters.com",
    sourceRegion: "Global",
    biasScore: 0.05,
    sentimentScore: 0.3,
    keyArguments: [
      "Tiered approach balances diverse national circumstances",
      "Verification mechanisms strengthen accountability",
      "Diplomatic achievement spanning 195 nations",
      "Builds on previous framework with stronger enforcement",
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const DEMO_FACTS = [
  "195 nations signed the agreement at the climate summit",
  "The accord sets a target to limit global warming to 1.5 degrees Celsius above pre-industrial levels",
  "Developed nations committed to a collective $100 billion annual climate finance package",
  "Binding carbon reduction targets begin in 2027 with five-year review cycles",
  "The agreement includes a loss-and-damage fund for climate-vulnerable nations",
];

const DEMO_HEATMAP_DATA: HeatmapDataPoint[] = [
  {
    region: "North America",
    lat: 40,
    lng: -100,
    count: 24,
    perspectiveBreakdown: { progressive: 10, conservative: 9, international: 5 },
  },
  {
    region: "Europe",
    lat: 50,
    lng: 10,
    count: 18,
    perspectiveBreakdown: { progressive: 7, conservative: 4, international: 7 },
  },
  {
    region: "Asia",
    lat: 35,
    lng: 105,
    count: 12,
    perspectiveBreakdown: { progressive: 2, conservative: 2, international: 8 },
  },
  {
    region: "Middle East",
    lat: 30,
    lng: 45,
    count: 6,
    perspectiveBreakdown: { progressive: 1, conservative: 1, international: 4 },
  },
  {
    region: "South America",
    lat: -15,
    lng: -60,
    count: 4,
    perspectiveBreakdown: { progressive: 1, conservative: 0, international: 3 },
  },
  {
    region: "Africa",
    lat: 5,
    lng: 20,
    count: 3,
    perspectiveBreakdown: { progressive: 1, conservative: 0, international: 2 },
  },
  {
    region: "Oceania",
    lat: -25,
    lng: 135,
    count: 5,
    perspectiveBreakdown: { progressive: 2, conservative: 1, international: 2 },
  },
];

interface StoryPageProps {
  params: { id: string };
}

export default function StoryPage({ params }: StoryPageProps) {
  const story = {
    id: params.id,
    title: "Global Climate Summit Reaches Historic Agreement on Carbon Emissions",
    summary:
      "World leaders gathered to finalize a landmark climate accord that sets binding targets for carbon reduction across both developed and developing nations.",
    category: "Environment",
    region: "Global",
    publishedAt: new Date(),
    sourceCount: 12,
  };

  return (
    <div className="space-y-8">
      {/* Story header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{story.category}</Badge>
          <span className="text-sm text-muted-foreground">{story.region}</span>
          <span className="text-sm text-muted-foreground">
            {formatDate(story.publishedAt)}
          </span>
          <span className="text-sm text-muted-foreground ml-auto">
            {story.sourceCount} sources analyzed
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {story.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {story.summary}
        </p>
      </div>

      {/* Fact Bridge - consensus facts */}
      <FactBridge facts={DEMO_FACTS} sourceCount={story.sourceCount} />

      {/* Tri-Lens View - 3-column perspectives */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Three Perspectives</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Compare how different viewpoints frame this story
        </p>
        <TriLensView perspectives={DEMO_PERSPECTIVES} />
      </div>

      {/* Bias Heatmap */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Coverage Analysis</h2>
        <BiasHeatmap data={DEMO_HEATMAP_DATA} />
      </div>
    </div>
  );
}
