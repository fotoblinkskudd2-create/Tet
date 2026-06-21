#!/bin/bash
echo "Benchmarking Claude vs Codex vs Hybrid..."

# Kjør samme oppgave på begge og sammenlign
time claude -p "Løs: $1" > claude.out
time codex exec "$1" > codex.out

echo "Claude tokens/bruk vs Codex (sjekk output)"
