# Tet — Hardwareselskaper

Et investor-pitch-nettsted for fem norske hardwareselskaper med dokumentert forretningsmodell og klar ROI.

## Selskaper

| Kode | Produkt | Pris | Modell |
|------|---------|------|--------|
| OTORO | Lekkasjejeger Pro | 180 000 kr | B2B · CAPEX |
| GRIP | Kirurg-Trener | 200 000 kr | B2B · Hardware |
| VARDE | Katastrofe-Mesh | 2 000 000 kr | B2G · System |
| TRYGG | Livsignal-Vakt | 800 kr/mnd | SaaS · Subscription |
| SVERM-VEVAR | Brannmann-Koffert | 1 200 000 kr | B2G · Hardware |

## Frontend

Next.js-basert pitch-site med interaktive ROI-kalkulatorer.

- `/` — Porteføljeoversikt med alle fem selskaper
- `/selskap/[slug]` — Dypdykk per selskap med problem, løsning, forretningsmodell, ROI-kalkulator og go-to-market-tidslinje

### Sider

```
frontend/src/pages/
  index.tsx           # Hoveddside — alle fem selskaper
  _app.tsx            # Global CSS reset
  selskap/[slug].tsx  # Individuell selskapside
  auth/login.tsx
  auth/signup.tsx
  profile/[id].tsx
```

---

## CLI-verktøy (app.py)

En liten kommandolinje-hjelper for matematikk, anagram og kreative prompter.

## Usage

Run the solver with your problem statement:

```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

Each response includes a playful banner, a concise answer, and encouraging bullet points whenever brainstorming is needed.

## Build creative prompts for iOS web

Use prompt mode when you want a ready-to-paste creative brief for photos, video, music, art, or poetry. The builder keeps instructions short and mobile-friendly for iOS web inputs:

```bash
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt --medium music "uplifting synthwave for launch video"
python app.py --prompt "poem about late-summer rain in the city"  # medium auto-detected
```

The prompt generator auto-detects mediums when possible and adds concise delivery notes for camera, composition, pacing, instrumentation, or poetic form.
