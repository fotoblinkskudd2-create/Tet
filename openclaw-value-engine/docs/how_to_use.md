# Brukermanual — OpenClaw Value Engine

## 1. Forberedelser

```bash
cd openclaw-value-engine
pip install pytest   # valgfritt, kun nødvendig for å kjøre tester
```

Ingen andre avhengigheter er nødvendig — alt kjøres med standard Python 3.

## 2. Format på input-filer

Hver idé er en seksjon i en Markdown-fil under `/inputs/`. Seksjonen starter
med en overskrift og har deretter `Felt: verdi`-linjer:

```markdown
## Idea: <kort, gjenkjennelig navn>
Kategori: <fri tekst, f.eks. vannlekkasje, drone/SAR, GitHub-verdi>
Problem: <hva er problemet, i én eller to setninger>
Hvem betaler: <konkret rolle/aktør, ikke "alle" eller "markedet">
Første salgbare leveranse: <konkret, leverbar ting innen kort tid>
Teknisk vanskelighet: <heltall 1-10>
Markedsverdi: <heltall 1-10>
Byggbarhet: <heltall 1-10>
Dokumentasjonsverdi: <heltall 1-10>
Risiko: <heltall 1-10>
```

Du kan ha flere idéer i samme fil, og flere filer i `/inputs/` samtidig.
Alle `.md`-filer i mappen leses og slås sammen.

### Obligatoriske felt

Disse må alltid fylles ut, ellers stopper systemet med en feilmelding som
sier nøyaktig hvilken idé og hvilket felt som mangler:

- `Kategori`
- `Problem`
- `Hvem betaler`
- `Første salgbare leveranse`
- `Teknisk vanskelighet` (1-10)
- `Markedsverdi` (1-10)
- `Byggbarhet` (1-10)
- `Dokumentasjonsverdi` (1-10)
- `Risiko` (1-10)

Systemet later **aldri** som et manglende felt er utfylt — det stopper og
ber deg fylle det ut.

## 3. Kjøre hele pipelinen

```bash
python3 -m src.report
```

Dette gjør tre ting:

1. Parser alle `.md`-filer i `/inputs/`.
2. Beregner score, anbefaling og forklaring for hver idé.
3. Skriver `outputs/value_report.md`, `outputs/value_report.json` og
   `outputs/dashboard.html`.

## 4. Lese resultatet

- **`value_report.md`** — rangert liste øverst, deretter full detalj per
  idé med forklart score og en konkret 24-timers handling.
- **`value_report.json`** — samme informasjon strukturert, inkludert
  `category_counts` og `recommendation_counts` for rask oversikt.
- **`dashboard.html`** — åpne i nettleseren. Klikk på kolonneoverskrifter
  for å sortere, bruk søkefeltet for å filtrere på navn/kategori/betaler.
  Filen er helt frittstående (data er bakt inn), så den fungerer uten
  server eller internettforbindelse.

## 5. Tolke score og anbefaling

| Score | Anbefaling | Betyr |
|---|---|---|
| 70-100 | PASS | Verdt å bygge/selge nå |
| 40-69 | REWORK | Idé har potensial, men leveranse/risiko/marked må skjerpes før du satser tid |
| 0-39 | BLOCK | Ikke verdt å prioritere nå med dagens forutsetninger |

Hver idé har et `explanation`-felt som viser nøyaktig hvor mange poeng hver
av de fem faktorene bidro med, slik at en score alltid kan etterprøves og
diskuteres — ikke en svart boks.

## 6. Legge til egne idéer

1. Lag en ny fil i `/inputs/`, f.eks. `mine_ideer.md`.
2. Skriv én eller flere `## Idea: ...`-seksjoner som beskrevet over.
3. Kjør `python3 -m src.report` på nytt.
4. Se oppdatert rangering i `outputs/`.

## 7. Kjøre testene

```bash
python3 -m pytest tests/ -q
```

Testene dekker parsing (gyldig input, manglende felt, ugyldige tall),
scoring (grenseverdier, forklaring, sortering) og rapportgenerering
(ingen tomme seksjoner, alle filer skrives).
