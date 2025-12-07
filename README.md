# ⚔️ DebattDome

AI-drevet gladiatorarena for argumentasjon - der logikk vinner over føleri.

## 🎯 Konsept

DebattDome er en strukturert debattplattform der:
- Brukere legger inn påstander
- Andre argumenterer FOR eller MOT
- AI analyserer hvert argument for logiske feilslutninger
- De beste argumentene stiger til topps
- Debattanter får rating basert på AI-analyse

## ✨ Features

### MVP (Implementert)
- ✅ Autentisering (registrering/innlogging med JWT)
- ✅ Opprett påstander (claims)
- ✅ Argumenter FOR/MOT i to kolonner
- ✅ AI-dommer som analyserer argumenter:
  - Gir score 1-10
  - Oppdager logiske feilslutninger
  - Lager oppsummering
- ✅ Voting system (opp/ned stemmer)
- ✅ Leaderboard:
  - Beste debattanter (etter AI-score)
  - Mest kontroversielle påstander

## 🛠 Tech Stack

- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT + bcrypt
- **AI**: Modulær design (kan koble til Claude/GPT)

## 📦 Installasjon

```bash
# Installer dependencies
npm install

# Start dev server
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000)

## 🗄 Database Schema

```sql
users
  - id (PK)
  - email (unique)
  - username (unique)
  - password_hash
  - rating (default: 1000)

claims
  - id (PK)
  - user_id (FK)
  - title
  - description
  - tags

arguments
  - id (PK)
  - claim_id (FK)
  - user_id (FK)
  - side ('pro' | 'con')
  - content
  - source_url
  - ai_score (1-10)
  - fallacies (JSON)
  - ai_summary

votes
  - id (PK)
  - argument_id (FK)
  - user_id (FK)
  - value (+1 | -1)
```

## 🤖 AI Integration

AI-analyse er implementert i `lib/ai-judge.ts`. For å koble til en ekte LLM:

1. Erstatt `mockAIAnalysis()` med API-kall til Claude/GPT
2. Legg til API-nøkkel i `.env`:

```bash
ANTHROPIC_API_KEY=your_key_here
# eller
OPENAI_API_KEY=your_key_here
```

3. Implementer kall i `analyzeArgument()` funksjonen

### Eksempel prompt-struktur:

```
Du er en logikkdommer som analyserer argumenter i en debatt.

Påstand: "..."
Kontekst: ...

Argument (FOR/MOT):
...

Analyser og gi:
1. Score (1-10)
2. Logiske feilslutninger
3. Kort oppsummering
```

## 🎨 Design Filosofi

- **Mørkt tema**: Gladiatorarena-estetikk
- **Rødt som primærfarge**: Aggresivt, fokusert
- **To-kolonners layout**: FOR vs MOT tydelig separert
- **AI-badges**: Synlig analyse på hvert argument
- **Minimal chrome**: Fokus på innhold, ikke distraksjoner

## 🚀 Neste Steg

### Kort sikt
- [ ] Koble til ekte LLM API
- [ ] Profil-sider for brukere
- [ ] Filtrer påstander etter tags
- [ ] Notifikasjoner

### Lang sikt
- [ ] AI vs AI battles
- [ ] Automatisk fact-checking med kilder
- [ ] Debatt-turneringer
- [ ] Export debates til PDF/markdown
- [ ] Webhooks for nye argumenter

## 📝 Lisens

MIT

---

**Bygget for å renske debatten, én logisk feil om gangen.**
