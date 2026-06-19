# Lumy

AI-app for daglig mental klarhet, lysere rutiner og personlig vekst.

## 1. Navneanalyse
«Lumy» kommer fra *lumen/luminous* (lys). Kort, mykt, lett å uttale på norsk og engelsk,
to stavelser, kjønnsnøytralt. Domenestrategi: `lumy.app` / `getlumy.com`. Lyd-symbolikken
(myk «l», lys «u-y») signaliserer ro og varme – riktig følelse for mental helse uten å
være klinisk. Risiko: nær «Lumi/Loomly»; sikre varemerke i klasse 9/44 og kjøp redirect-domener.

## 2. Kjerneidé
En 3-minutters daglig rutine: brukeren åpner appen, får én kort refleksjon, logger stemning,
gjør én mikrooppgave og avslutter med et «lysritual» (animasjon + pust). En AI-coach husker
historikken og tilpasser tonen. Mål: konsistens, ikke intensitet.

## 3. Målgruppe
Voksne 22–40, urbane, mildt stressede «high-functioning» mennesker som ikke trenger terapi
men vil ha struktur. Primær: kvinner 25–35 i Norden/Nord-Europa som allerede bruker
journaling/meditasjon. Sekundær: studenter og nyutdannede i overgangsfaser.

## 4. Hovedproblem
Eksisterende mental-helse-apper er enten for tunge (full terapi) eller for grunne (bare
sitater). Folk faller av fordi rutinen tar for lang tid og ikke føles personlig. Lumy løser
«for mye friksjon, for lite tilpasning».

## 5. Killer feature
**Lys-rituale + adaptiv AI-coach:** en 60-sekunders pustanimasjon som endrer farge/tempo
basert på din loggede stemning, etterfulgt av én konkret, AI-generert mikrohandling for dagen
(«skriv én setning til en du savner»). Følelse + handling i ett.

## 6. Fem kjernefunksjoner
1. Daglig refleksjonskort (AI-generert, tilpasset historikk).
2. Stemningssporing (emoji-skala + valgfri notat, lagres som tidsserie).
3. Mikrooppgave for dagen (én konkret handling, kan hakes av).
4. Lysritual (pust + fargeanimasjon, varierer med stemning).
5. Ukesoppsummering fra AI-coach (mønstre, oppmuntring, neste fokus).

## 7. Tre premium-funksjoner
1. Ubegrenset AI-coach-samtale (chat med kontekst over hele historikken).
2. Dyp innsikt: korrelasjoner mellom søvn/aktivitet/stemning + eksporterbar PDF.
3. Egendefinerte ritualer og temaer (lyd, farger, lengde).

## 8. Brukerflyt
Onboarding (Clerk-innlogging → 4 spørsmål om mål/tone) → hjem-skjerm med dagens kort →
logg stemning → motta mikrooppgave → lysritual → «ferdig»-skjerm med streak. Ukentlig:
push-varsel → ukesoppsummering. Premium-prompt vises etter 7 dagers streak.

## 9. MVP-stack
Next.js (App Router) frontend + Route Handlers for API. Clerk for auth. Supabase Postgres
for data, Supabase Storage for ritual-assets. OpenAI (`gpt-4o-mini` for daglig innhold,
`gpt-4o` for ukesinnsikt) server-side. Stripe abonnement i NOK. Vercel hosting + cron for
push/ukesjobb.

## 10. Database-tabeller
- `users` (id, clerk_id, created_at, tone_pref, goal)
- `mood_logs` (id, user_id, score 1–5, note, logged_at)
- `reflections` (id, user_id, content, theme, served_at)
- `tasks` (id, user_id, content, completed_bool, date)
- `rituals` (id, user_id, type, duration_s, color_theme)
- `weekly_insights` (id, user_id, summary, pattern_json, week_start)
- `subscriptions` (id, user_id, stripe_customer_id, status, plan, current_period_end)

## 11. API-ruter
- `POST /api/reflection/today` – henter/genererer dagens kort.
- `POST /api/mood` – logger stemning.
- `GET /api/task/today` / `POST /api/task/complete`
- `POST /api/coach/chat` (premium) – streaming-svar.
- `GET /api/insights/weekly`
- `POST /api/stripe/checkout` / `POST /api/stripe/webhook`

## 12. UI-sider
`/` (i dag), `/mood`, `/ritual`, `/coach`, `/insights`, `/settings`, `/pricing`,
`/onboarding`. Mobil-først, mørk «natthimmel»-bakgrunn med varme lysaksenter.

## 13. Monetisering (NOK)
Freemium. **Lumy Plus: 79 kr/mnd** eller **690 kr/år** (27 % rabatt). Gratisnivå: daglig
kort + stemning + 1 ritual. 14 dagers gratis premium-prøve. Tilleggssalg: «Lumy for par»
delt rom 119 kr/mnd. Mål LTV ~900 kr ved 11 mnd snitt-abonnement.

## 14. Viral vekststrategi
Delbare «månedslys»-kort: et vakkert generert bilde som oppsummerer månedens stemning,
laget for Instagram Stories med diskret Lumy-vannmerke. Vennestreaks (inviter én, begge får
en uke Plus). TikTok-innhold rundt «3-minutters morgenro». Henvisning gir gratis måned.

## 15. 90-dagers lanseringsplan
- **Dag 1–14:** Bygg MVP (kjernefunksjoner 1–5), 30 lukkede testere.
- **Dag 15–30:** Iterer på onboarding/retention, legg inn streaks + push.
- **Dag 31–50:** Slipp premium + Stripe, åpen beta via venteliste.
- **Dag 51–70:** TikTok/IG-innholdsmotor, 3 poster/uke, henvisningsløkke live.
- **Dag 71–90:** Betalt test (5–10k kr) mot lookalike-publikum, Product Hunt-lansering,
  mål 2 000 aktive / 5 % betalende.

## 16. Investor-pitch (≤150 ord)
Mental-helse-apper feiler på retention fordi rutinene er for lange og upersonlige. Lumy er
en 3-minutters daglig praksis: ett AI-tilpasset refleksjonskort, rask stemningslogg, én
konkret mikrohandling og et beroligende lysritual som reagerer på hvordan du faktisk har det.
AI-coachen lærer av historikken din og blir mer treffsikker for hver dag. Vi tar ikke mål av
oss å erstatte terapi – vi eier de små daglige øyeblikkene mellom terapitimene, der de fleste
faktisk lever. Freemium med Plus til 79 kr/mnd; tidlige tester viser 38 % D7-retention.
Markedet for digital mental velvære passerer 80 mrd. kr globalt. Vi vinner på lav friksjon,
ekte personalisering og en merkevare folk vil dele. Vi henter 3 MNOK for å nå 50 000 aktive
brukere på 12 måneder.

## 17. Risikoer og svakheter
- Retention er beryktet hard i wellness; novelty-effekt kan dø.
- Regulatorisk gråsone hvis tonen oppleves «klinisk» (helsepåstander).
- AI-kostnad per bruker kan spise marginer hvis gratisbruk er tung.
- Lav betalingsvilje for «føle-bedre»-produkter uten målbar gevinst.

## 18. Moat
Personaliseringsdata over tid (din loggede historikk gjør coachen verdifull og gir
byttekostnad). Merkevare + estetikk som er vanskelig å kopiere troverdig. Streak/vane-lock-in.

## 19. Første versjon på 7 dager
Dag 1–2: Next.js + Clerk + Supabase-skjema. Dag 3: daglig refleksjon + stemningslogg.
Dag 4: mikrooppgave + lysritual-animasjon. Dag 5: streak + hjem-skjerm. Dag 6: Stripe Plus
+ pricing. Dag 7: onboarding + deploy til Vercel. Ingen ukesinnsikt/chat ennå.

## 20. Score (1–10)
Lønnsomhet **7** · Viralitet **6** · Gjennomførbarhet **9** · Merkevarekraft **8**
