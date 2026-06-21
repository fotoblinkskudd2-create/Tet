#!/bin/bash
# Bruk etter plan: ./max-execute.sh phase1

PHASE="$1"

claude -p "Utfør fase: $PHASE basert på denne planen" --input reviewed-plan.json

# Auto-review med Codex
codex exec "Gjør adversarial review av endringene. Fiks bugs og optimaliser."
