"""Demo: run the idea engine across three diverse domains."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from idea_engine import IdeaGenerator

DEMOS = [
    {
        "theme": "healthcare",
        "constraints": ["no app required", "low cost"],
        "trends": ["ambient AI", "longevity tech", "micro-communities"],
    },
    {
        "theme": "education",
        "constraints": ["offline first", "age 10-14"],
        "trends": ["spatial computing", "post-AGI workflows", "embodied computing"],
    },
    {
        "theme": "urban mobility",
        "constraints": [],
        "trends": ["de-growth economics", "climate anxiety", "neuroaesthetics"],
    },
]

SEP = "═" * 72


def main():
    print(f"\n{'━'*72}")
    print("  IDEA ENGINE — VIBE CODE DEMO")
    print(f"{'━'*72}\n")

    gen = IdeaGenerator(seed=42)

    for demo in DEMOS:
        print(f"\n{SEP}")
        print(f"  THEME: {demo['theme'].upper()}")
        if demo["constraints"]:
            print(f"  CONSTRAINTS: {', '.join(demo['constraints'])}")
        print(f"  TRENDS: {', '.join(demo['trends'])}")
        print(SEP)

        ideas = gen.generate(
            theme=demo["theme"],
            constraints=demo["constraints"],
            trends=demo["trends"],
            n=5,
        )

        for rank, idea in enumerate(ideas, 1):
            print(f"\n  [{rank}] {idea.title}")
            print(f"      {idea.description}")
            print(f"      → {idea.logic}")
            print(f"      USE CASE: {idea.use_case}")
            if idea.score:
                print(f"      SCORE: orig={idea.score.originality:.2f}  "
                      f"via={idea.score.viability:.2f}  "
                      f"surp={idea.score.surprise:.2f}  "
                      f"combined={idea.score.combined:.2f}")

    print(f"\n{SEP}")
    print("  Done. These ideas were generated using lateral thinking algorithms.")
    print("  Strategies: random association, analogical transfer, bisociation,")
    print("  SCAMPER, constraint inversion, worst-idea inversion, trend injection.")
    print(f"{SEP}\n")


if __name__ == "__main__":
    main()
