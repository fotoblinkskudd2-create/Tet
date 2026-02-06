import { StoryCard } from "@/components/shared/story-card";
import { Badge } from "@/components/ui/badge";
import type { StoryCardData, PerspectiveType } from "@/types";

// Demo data for initial rendering
const DEMO_STORIES: StoryCardData[] = [
  {
    id: "demo-1",
    title: "Global Climate Summit Reaches Historic Agreement on Carbon Emissions",
    slug: "global-climate-summit-historic-agreement",
    summary:
      "World leaders gathered to finalize a landmark climate accord that sets binding targets for carbon reduction across both developed and developing nations.",
    imageUrl: null,
    category: "Environment",
    region: "Global",
    publishedAt: new Date(),
    sourceCount: 12,
    perspectiveTypes: ["PROGRESSIVE", "CONSERVATIVE", "INTERNATIONAL"] as PerspectiveType[],
  },
  {
    id: "demo-2",
    title: "Federal Reserve Signals Policy Shift Amid Inflation Concerns",
    slug: "federal-reserve-policy-shift-inflation",
    summary:
      "The Federal Reserve indicated a change in monetary policy direction as inflation data shows mixed signals across key economic sectors.",
    imageUrl: null,
    category: "Economy",
    region: "US",
    publishedAt: new Date(Date.now() - 3600000),
    sourceCount: 8,
    perspectiveTypes: ["PROGRESSIVE", "CONSERVATIVE"] as PerspectiveType[],
  },
  {
    id: "demo-3",
    title: "Tech Giants Face New Antitrust Regulations in European Union",
    slug: "tech-giants-antitrust-eu",
    summary:
      "The European Commission unveiled sweeping new regulations targeting major technology companies, focusing on data privacy and market competition.",
    imageUrl: null,
    category: "Technology",
    region: "Europe",
    publishedAt: new Date(Date.now() - 7200000),
    sourceCount: 15,
    perspectiveTypes: ["PROGRESSIVE", "CONSERVATIVE", "INTERNATIONAL"] as PerspectiveType[],
  },
  {
    id: "demo-4",
    title: "Healthcare Reform Bill Advances Through Congressional Committee",
    slug: "healthcare-reform-bill-committee",
    summary:
      "A bipartisan healthcare bill cleared a key committee vote, proposing changes to prescription drug pricing and insurance coverage mandates.",
    imageUrl: null,
    category: "Health",
    region: "US",
    publishedAt: new Date(Date.now() - 14400000),
    sourceCount: 6,
    perspectiveTypes: ["PROGRESSIVE", "CONSERVATIVE"] as PerspectiveType[],
  },
  {
    id: "demo-5",
    title: "International Space Station Hosts Breakthrough Scientific Experiments",
    slug: "iss-breakthrough-experiments",
    summary:
      "A new series of microgravity experiments aboard the ISS shows promise for advancing medical treatments and materials science on Earth.",
    imageUrl: null,
    category: "Science",
    region: "Global",
    publishedAt: new Date(Date.now() - 28800000),
    sourceCount: 9,
    perspectiveTypes: ["INTERNATIONAL"] as PerspectiveType[],
  },
  {
    id: "demo-6",
    title: "Immigration Policy Debate Intensifies as Border Numbers Rise",
    slug: "immigration-policy-border-debate",
    summary:
      "New border crossing statistics fuel heated debate between lawmakers on both sides of the aisle about the direction of immigration reform.",
    imageUrl: null,
    category: "Politics",
    region: "US",
    publishedAt: new Date(Date.now() - 43200000),
    sourceCount: 18,
    perspectiveTypes: ["PROGRESSIVE", "CONSERVATIVE", "INTERNATIONAL"] as PerspectiveType[],
  },
];

const CATEGORIES = [
  "All",
  "Politics",
  "Economy",
  "Technology",
  "Health",
  "Environment",
  "Science",
  "World",
  "Culture",
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          See Every Side of the Story
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          PerspectivePulse breaks your filter bubble by presenting news from
          progressive, conservative, and international viewpoints — powered by AI
          analysis.
        </p>
      </section>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap justify-center">
        {CATEGORIES.map((category) => (
          <Badge
            key={category}
            variant={category === "All" ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Perspective legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span>Progressive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span>Conservative</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span>International</span>
        </div>
      </div>

      {/* Story grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_STORIES.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
