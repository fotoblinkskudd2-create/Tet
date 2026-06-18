import {
  ArrowRight,
  Check,
  Clock,
  Radio,
  Shield,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { PromptGenerator } from "@/components/prompt-generator";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CREATIVE_RECIPES, MEDIUMS } from "@/lib/prompt-engine";

const FEATURES = [
  {
    icon: Wand2,
    title: "Structured by default",
    body: "Every prompt ships with style, structure, platform fit and delivery notes — no blank-page paralysis.",
  },
  {
    icon: Radio,
    title: "Realtime community",
    body: "Shared prompts stream into a live feed the instant they're posted. Like and remix in real time.",
  },
  {
    icon: Zap,
    title: "Mobile-first output",
    body: "Short sentences, zero markdown, ready to paste into iOS web share sheets and chat inputs.",
  },
  {
    icon: Shield,
    title: "Secure by design",
    body: "Clerk auth + Supabase row-level security. Your library is yours; public is opt-in, always.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    tagline: "Everything you need to start shipping.",
    features: [
      "Unlimited prompt generation",
      "Save up to 50 prompts",
      "Share to the community feed",
      "Light & dark mode",
    ],
    cta: "Start free",
    href: "/sign-up",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    tagline: "For creators who live in the prompt.",
    features: [
      "Unlimited saved prompts",
      "Private collections",
      "Priority realtime sync",
      "Early access to new mediums",
    ],
    cta: "Go Pro",
    href: "/sign-up",
    highlight: true,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-aurora">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pt-24">
            <Badge variant="secondary" className="mx-auto mb-5">
              <Sparkles className="size-3" /> New · Realtime community feed
            </Badge>
            <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              A few words in.
              <br />
              <span className="text-gradient">A perfect prompt out.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground">
              Tet turns a quick idea into a structured, paste-ready brief for
              photo, video, music, art and poetry — in the time it takes to
              blink.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="gradient">
                <Link href="/sign-up">
                  Start free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#playground">Try it live</Link>
              </Button>
            </div>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3" /> No credit card · live in 4 minutes
            </p>
          </div>
        </section>

        {/* Live playground */}
        <section id="playground" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Try it right here — no signup
            </h2>
            <p className="mt-2 text-muted-foreground">
              This is the real engine. Type an idea and watch it take shape.
            </p>
          </div>
          <PromptGenerator canSave={false} />
        </section>

        {/* Mediums */}
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {MEDIUMS.map((m) => (
              <span
                key={m}
                className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm"
              >
                <span className="text-base">{CREATIVE_RECIPES[m].emoji}</span>
                {CREATIVE_RECIPES[m].title.replace(" prompt", "")}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Built to feel like magic
            </h2>
            <p className="mt-2 text-muted-foreground">
              Thoughtful defaults, real-time everywhere, and nothing in your way.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="h-full">
                <CardContent className="space-y-3 p-6">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Simple, honest pricing
            </h2>
            <p className="mt-2 text-muted-foreground">
              Start free forever. Upgrade only when you outgrow it.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlight
                    ? "relative border-primary/40 shadow-lg shadow-primary/10"
                    : ""
                }
              >
                {plan.highlight && (
                  <Badge className="absolute right-5 top-5">Most popular</Badge>
                )}
                <CardContent className="space-y-5 p-6">
                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.tagline}
                    </p>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="pb-1 text-sm text-muted-foreground">
                      /month
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <Check className="size-4 text-emerald-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full"
                    variant={plan.highlight ? "gradient" : "outline"}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <Card className="overflow-hidden border-primary/30 bg-aurora">
            <CardContent className="flex flex-col items-center gap-5 px-6 py-14 text-center">
              <h2 className="max-w-xl text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                Your next great idea is one sentence away.
              </h2>
              <Button asChild size="lg" variant="gradient">
                <Link href="/sign-up">
                  Create your free account <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
