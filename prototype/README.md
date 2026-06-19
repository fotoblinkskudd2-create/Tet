# ⚡ Vibe Zone – 5 mini-apper for ADHD-barn

En frittstående prototype (én HTML-fil, ingen installasjon) med 5 korte,
ADHD-vennlige aktiviteter. Bygget rundt korte oppgaver, umiddelbar belønning,
tydelige farger, lyd og vibrasjon. Fungerer offline i Safari/Chrome på mobil.

## Prøv den

Åpne `prototype/index.html` i en nettleser – eller på iPhone: åpne filen og
trykk **Del → Legg til på Hjem-skjerm** for full-skjerm app-følelse.

Lokal server (valgfritt):

```bash
cd prototype && python -m http.server 8000
# åpne http://localhost:8000
```

## De 5 superkreftene

1. **⏱️ Fokus-timer** – Velg 5/10/15 min. Visuell nedtelling, pip + vibrasjon når
   det er ferdig, og en stjerne i krukka som belønning.
2. **🪜 Én ting nå** – Skriv en stor, kjip oppgave; appen deler den i bittesmå,
   håndterbare steg du kan hake av ett om gangen.
3. **🫧 Pust deg rolig** – Pusteballong (inn 4s, hold 2s, ut 5s) for å roe ned ved
   overveldelse eller frustrasjon.
4. **⭐ Stjernekrukke** – Samle seire. Stjerner lagres lokalt og forsvinner aldri.
5. **🟢 Energiboost** – Raskt reaksjonsspill: trykk så fort du kan når feltet blir
   grønt. Brenner av energi og trener impulskontroll på ~20 sekunder.

## Designvalg for ADHD

- Korte økter og ÉN ting av gangen – lav terskel for å starte.
- Umiddelbar, tydelig feedback (lyd + haptikk + animasjon).
- Belønning hele tiden, aldri straff – «ingen rett eller galt».
- Fremgang lagres i `localStorage`, så det føles trygt å lukke og komme tilbake.
- Lyd kan slås av med knappen øverst til høyre.

> Prototype til uttesting – mål er å se hva barna faktisk liker, ikke å være ferdig.
