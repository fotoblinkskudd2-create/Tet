# 🔥 Brutal Ærlighet Chatbot 🔥

En chat-app der Claude alltid svarer 100% brutalt ærlig og uten filter.

## Konsept

Dette er en chatbot som **skjærer gjennom bullshit**. Den bruker Claude AI med en spesialtilpasset prompt som gjør at den svarer nådeløst ærlig og sardonisk - som en venn som bryr seg nok til å si den harde sannheten.

### Features

- ✅ **Brutal ærlighet** - Ingen filter, ingen sukkerbelegging
- 🔥 **Neon-rødt design** - Aggressivt visuelt uttrykk
- 💨 **Sigarettrøyk-animasjoner** - Stemningsskapende effekter
- 🎯 **Sardonisk tone** - Humor og ironi for å understreke sannheten
- 🇳🇴 **Norsk språk** - Alle svar på norsk

## Oppsett

### 1. Få en Anthropic API-nøkkel

Gå til [Anthropic Console](https://console.anthropic.com/) og opprett en API-nøkkel.

### 2. Sett miljøvariabel

Opprett en `.env.local` fil i `/home/user/Tet/frontend/` mappen:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 3. Start applikasjonen

```bash
# Installer avhengigheter (hvis nødvendig)
cd /home/user/Tet/frontend
npm install

# Start utviklingsserver
npm run dev
```

### 4. Åpne chatboten

Naviger til: `http://localhost:3000/brutal-honesty`

## Bruk

1. **Skriv inn problemet ditt** - Del hemmeligheter, problemer, eller spørsmål
2. **Få brutal sannhet** - Claude svarer uten filter
3. **Håndter sannheten** - Det kan gjøre vondt, men det er poenget

## System Prompt

Chatboten bruker følgende system prompt:

```
Du er en nådeløs, sardonisk venn som sier sannheten uansett hvor vond den er.

Dine egenskaper:
- Du er brutalt ærlig og holder ikke tilbake
- Du kutter gjennom bullshit og selvbedrag
- Du er sardonisk og sarkastisk, men alltid med et poeng
- Du sier det folk trenger å høre, ikke det de vil høre
- Du er direkte og til punkt uten å sukkerbelegge
- Du bruker humor og ironi for å understreke sannheten
- Du er som en venn som bryr seg nok til å si den harde sannheten

Svar alltid på norsk. Vær konsis og kraftfull. Gå rett på sak.
```

## Teknisk Arkitektur

### Frontend
- **Framework**: Next.js (Pages Router)
- **Fil**: `/frontend/src/pages/brutal-honesty.tsx`
- **Design**: Inline CSS med neon-rødt tema og sigarettrøyk-animasjoner
- **State Management**: React useState hooks

### Backend
- **API Route**: `/frontend/src/pages/api/brutal-chat.ts`
- **AI Model**: Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
- **API**: Anthropic Messages API
- **Max Tokens**: 1024

## Designelementer

### Fargepalett
- Primær: Neon Rød (`#ff0000`, `#ff3333`)
- Bakgrunn: Sort (`#000`)
- Skygger: Rød glød med opacity

### Animasjoner
- Stigende sigarettrøyk med blur-effekt
- Fade-in for meldinger
- Hover-effekter på knapper
- Pulserende neon-effekt

### Typografi
- Store, fete titler med text-shadow
- Neon-rød tekst for AI-svar
- Hvit tekst for brukerinnlegg

## Sikkerhet

⚠️ **Viktig**: Ikke commit API-nøkkelen din til git. Bruk alltid miljøvariabler.

## Utvidelsesmuligheter

- [ ] Legg til chat-historikk lagring
- [ ] Implementer brukerautentisering
- [ ] Legg til flere visuelleffekter (flammer, etc.)
- [ ] Lag delebare brutal-sannhet snippets
- [ ] Voice input/output for ekstra drama

## Disclaimers

Dette er en **eksperimentell chatbot** designet for underholdning og selvinnsikt. Svar kan være provoserende og ubehagelige - det er poenget. Bruk med selvironi og sunt vett.

---

**Laget med Claude Code** 🔥
