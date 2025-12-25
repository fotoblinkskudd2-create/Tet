# Tet - Multi-Purpose Creative Suite

## 🌙 Neon Dream Journal

En vakker, neonfarget dagbok-app med AI-drevet drømmetolkning!

### ✨ Funksjoner

- **Neon-design**: Cyberpunk-inspirert grensesnitt med neonfarger og glitch-effekter
- **Mørk/lys modus**: Veksle mellom mørk og lys modus med én klikk
- **AI-drømmetolkning**: Send drømmene dine til Claude (Anthropic) for poetisk, surrealistisk tolkning
- **LocalStorage**: Alle drømmer lagres lokalt i nettleseren
- **Tilfeldige bilder**: AI-genererte bilder (via placeholder) for hver drømmetolkning
- **Glitch-animasjoner**: Cyberpunk-stil animasjoner og effekter

### 🚀 Kom i gang

#### 1. Installer avhengigheter

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 2. Konfigurer miljøvariabler

Kopier `.env.example` til `.env` og legg til din Anthropic API-nøkkel:

```bash
cp .env.example .env
```

Rediger `.env` og legg til:
```
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

#### 3. Start serverne

```bash
# Start backend (i backend-mappen)
cd backend
npm run dev

# Start frontend (i en ny terminal, i frontend-mappen)
cd frontend
npm run dev
```

#### 4. Åpne appen

Gå til `http://localhost:3000/dreams` i nettleseren din!

### 📝 Hvordan bruke

1. **Skriv en drøm**: Legg til tittel og beskrivelse av drømmen din
2. **Lagre**: Klikk "Lagre Drøm" for å lagre den lokalt
3. **Tolk**: Klikk "Tolk Drømmen" for å få en AI-generert, poetisk tolkning fra Claude
4. **Utforsk**: Se gjennom alle drømmene dine og deres tolkninger

---

## 🧩 Tet Problem Solver

A tiny, joyful command-line helper that solves small puzzles like arithmetic and classic anagrams. When it cannot solve a prompt directly, it offers upbeat brainstorming steps to keep the momentum going.

### Usage

Run the solver with your problem statement:

```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

Each response includes a playful banner, a concise answer, and encouraging bullet points whenever brainstorming is needed.
