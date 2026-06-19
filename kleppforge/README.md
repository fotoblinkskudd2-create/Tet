# KLEPPFORGE Command Center v0

En stram, mørk, industriell webdemo som gjør rotete ideer om til **produktkort,
rapportstruktur, salgsargumenter og utvikleroppgaver** — for fem konkrete spor.

Dette er navet i KLEPPFORGE 3.0 (Proof-to-Product Engine). Ikke brainstorm. Ikke
pynt. Ikke generisk AI-wrapper. Maskinen som produserer salgbar verdi igjen og igjen.

## Hva dette er

Fem produktspor med ferdig mockdata:

1. **AI-kostnadskutt Audit** — finn AI-abonnement folk kaster penger på.
2. **GitHub Painkiller Radar** — repo-rapport med konkrete fikser og produktvinkler.
3. **DOCX Report Factory** — input inn, ferdig rapport ut (ryggraden).
4. **TEKSTKVERN** — rotete tekst → klar/hard/juridisk/kort, med stemmen intakt.
5. **Lyttepost Vann** — vannrisiko-rapport for borettslag og bygg.

For hvert spor får du: produktkort, rapportstruktur, 10 Codex/Claude-tickets,
salgssett (pitch, e-post, innvendinger, kundetyper) og PASS/REWORK/BLOCK-dom.

## Seksjoner

- **Dashboard** — dagens toppspor, antall PASS/REWORK/BLOCK, neste handling, neste 24 timer.
- **Idea Inbox** — alle spor med verdi-score og risiko-score. Klikk for å velge.
- **Product Card** — navn, problem, kjøper, MVP, første leveranse, pris, 7-dagers plan.
- **Report Builder** — sammendrag, problem, observasjoner, tiltak, økonomisk verdi, neste steg.
- **Codex Tickets** — 10 konkrete utvikleroppgaver for valgt spor.
- **Sales Kit** — kort pitch, e-post (kopierbar), innvendinger + svar, kundetyper.
- **Daily Judgment** — hva er verdifullt, hva er pynt, hva bygges neste + dom for hele porteføljen.

### KILL FLUFF

Knappen øverst til høyre skjuler alt som ikke er direkte handling/verdi
(hvorfor-prosa, pynt-felt, kundetyper, notater). Igjen står bare det som selger
eller bygger.

## Hvordan starte

Ingen bygg, ingen avhengigheter, ingen backend. Bare statiske filer.

```bash
# Alternativ 1: åpne direkte
open kleppforge/index.html        # macOS
xdg-open kleppforge/index.html    # Linux

# Alternativ 2: enkel lokal server (anbefalt for utklipp-til-tavle)
cd kleppforge
python3 -m http.server 8000
# → http://localhost:8000
```

Fungerer på mobil/iPad — UI-et er responsivt.

## Filstruktur

```
kleppforge/
├── index.html   # skall: header, KILL FLUFF, faner, footer
├── styles.css   # mørkt/industrielt tema, responsivt
├── app.js       # vanilla JS: state, ruting, rendering av alle seksjoner
├── data.js      # all mockdata (5 spor) — eneste fil du må redigere for nytt innhold
└── README.md
```

## Hvordan utvide

- **Nytt spor:** legg til ett objekt i `KLEPPFORGE_DATA.ideas` i `data.js`. Fyll
  alle felt (`product_card`, `report`, `tickets` (10 stk), `sales`, `daily`).
  Ingen tomme felt — mangler du fakta, skriv beste antakelse og merk `(antakelse)`.
- **Dagens toppspor:** sett `meta.today_focus` til en `id`.
- **Ny seksjon/fane:** legg til i `TABS` og `VIEWS` i `app.js`.

Dataformatet matcher JSON-strukturen i KLEPPFORGE-spec (seksjon 16).

## Neste 10 utviklingssteg

1. DOCX-eksport av Report Builder (kobles til DOCX Report Factory).
2. Intake-skjema som skriver et nytt idé-objekt automatisk.
3. Persistens i `localStorage` (rediger score/dom uten å miste det).
4. Filter/sortering i Idea Inbox (etter verdi, risiko, dom).
5. "Direktør"-visning som rangerer topp 5 brutalt.
6. Skeptiker-pass: vis tre største risikoer per spor.
7. Eksport av Sales Kit til e-postkladd / utklippstavle (delvis: e-post er kopierbar).
8. Prompt-pakke per spor (bilde/video/voiceover) som egen fane.
9. Daglig sjekkliste-modul (dato, energi, mål, dom).
10. Enkel backend først når salget krever lagring — ikke før.

## Regler (fra KLEPPFORGE-spec)

- Norsk. Null fluff. Ingen tomme felt. Ingen "lag en app"-svada.
- Hardware (sensor/drone/ROV): ikke bygg før proof og kunde er tydelig.
- Drone/ROV: sivil, clean-room, trygg, lovlig.
- Alt skal ende i handling.
