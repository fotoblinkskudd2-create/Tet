# Max Verdi Scripts

Hjelpe-skript for en hybrid Claude Code + Codex workflow (spec-driven + TDD).

## Skript

| Skript | Beskrivelse | Bruk |
| --- | --- | --- |
| `hybrid-plan.sh` | Claude lager en spec-driven plan, Codex reviewer og forbedrer den. Output: `reviewed-plan.json`. | `./hybrid-plan.sh "Beskriv oppgaven din her"` |
| `max-execute.sh` | Kjører en fase fra planen med Claude, deretter adversarial review med Codex. | `./max-execute.sh phase1` |
| `value-benchmark.sh` | Kjører samme oppgave på Claude og Codex og sammenligner tid/output. | `./value-benchmark.sh "Løs denne oppgaven"` |

## Oppsett

Gjør skriptene kjørbare (allerede gjort i repoet):

```bash
chmod +x *.sh
```

## Krav

- `claude` CLI (Claude Code) på PATH
- `codex` CLI på PATH

## Workflow

1. **Plan:** `./hybrid-plan.sh "..."` → genererer `plan.json` og `reviewed-plan.json`
2. **Utfør:** `./max-execute.sh phase1` (gjenta per fase)
3. **Mål verdi:** `./value-benchmark.sh "..."` ved behov
