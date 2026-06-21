#!/bin/bash
# Usage: ./hybrid-plan.sh "Beskriv oppgaven din her"

TASK="$1"

echo "=== Claude Code: Generer detaljert plan ==="
claude -p "
Du er en senior engineering lead. Lag en spec-driven plan for oppgaven: $TASK
Inkluder:
- Arkitektur
- TDD-struktur (tester først)
- Risikoer og edge cases
- Del opp i atomic steps
Output kun JSON med nøkler: phases, tests, risks
" > plan.json

echo "=== Codex: Review og forbedre plan ==="
codex exec "Review this plan for gaps, efficiency and autonomy. Suggest improvements and output updated JSON." --input plan.json > reviewed-plan.json

echo "Plan klar! Se reviewed-plan.json"
