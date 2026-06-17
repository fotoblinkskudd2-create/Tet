# OpenClaw Value Engine

Tar inn rå ideer fra Markdown-filer og gjør dem om til rangerte, forklarbare
kroneoppgaver: hvem betaler, hva er første salgbare leveranse, hvor stor er
risikoen, og hva bør du gjøre i løpet av de neste 24 timene.

Ingen kalender, ingen Gmail, ingen bash-leveranse — bare en lokal
parser + scoring-motor + rapportgenerator du kan kjøre fra terminalen.

## Hva systemet gjør

1. Leser idéer fra `/inputs/*.md` (format: `## Idea: <navn>` + `Felt: verdi`-linjer).
2. Validerer at hver idé har alle obligatoriske felt — **ingen idé kan mangle
   "hvem betaler" eller "første salgbare leveranse"**. Mangler noe, stopper
   systemet med en tydelig feilmelding i stedet for å late som alt er OK.
3. Beregner en forklarbar score 0–100 per idé basert på fem vektede faktorer.
4. Gir en anbefaling: **PASS** (≥70), **REWORK** (40–69) eller **BLOCK** (<40).
5. Skriver ut:
   - `/outputs/value_report.md` — rangert liste + full forklaring per idé
   - `/outputs/value_report.json` — samme data strukturert for videre bruk
   - `/outputs/dashboard.html` — enkel, sorterbar/filtrerbar HTML-dashboard
     uten backend (åpne filen direkte i nettleseren)

## Scoringsmodell

| Faktor | Vekt | Retning |
|---|---|---|
| Markedsverdi | 30 | Høyere er bedre |
| Byggbarhet | 25 | Høyere er bedre |
| Dokumentasjonsverdi | 15 | Høyere er bedre |
| Teknisk vanskelighet | 15 | Lavere er bedre (inverteres) |
| Risiko | 15 | Lavere er bedre (inverteres) |

Hver faktor er 1–10. Score regnes ut som en vektet sum, og hver komponent
vises i `explanation`-feltet slik at en score alltid kan etterprøves manuelt.
Se `/docs/how_to_use.md` for detaljer og terskler.

## Kjøre systemet

```bash
cd openclaw-value-engine
pip install pytest   # kun for å kjøre testene
python3 -m src.report
```

Dette leser alt i `/inputs/`, skriver til `/outputs/`, og skriver ut antall
idéer som ble skåret. Åpne `outputs/dashboard.html` i en nettleser for å
sortere/filtrere interaktivt.

## Kjøre testene

```bash
python3 -m pytest tests/ -q
```

## Mappestruktur

```
openclaw-value-engine/
  README.md
  src/
    parser.py      # leser og validerer markdown-idéer
    scorer.py       # scoring-motor med forklarbare komponenter
    report.py       # bygger Markdown- og JSON-rapport, kjører hele pipelinen
    dashboard.py    # genererer den statiske HTML-dashboarden
  inputs/
    sample_ideas.md # 30 eksempelidéer, 3 per kategori, 10 kategorier
  outputs/
    value_report.md
    value_report.json
    dashboard.html
  docs/
    how_to_use.md
  tests/
    test_parser.py
    test_scoring.py
    test_report.py
```

## Legge til egne idéer

Legg en ny `.md`-fil i `/inputs/` med samme format som `sample_ideas.md`.
Kjør `python3 -m src.report` på nytt — alle filer i `/inputs/` leses samlet.

## Begrensninger

- Scoringsmodellen er en enkel, gjennomsiktig heuristikk — ikke en
  markedsanalyse eller finansiell prognose. Tallene 1–10 per idé er
  vurderinger du selv setter inn, ikke noe systemet "vet".
- Systemet gjør ingen påstander om patenterbarhet, markedsstørrelse eller
  garantert inntekt for noen av idéene.
