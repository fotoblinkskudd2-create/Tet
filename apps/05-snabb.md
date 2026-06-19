# Snabb

Ekstremt rask produktivitetsapp for små daglige handlinger – gjort på under 60 sekunder.

## 1. Navneanalyse
«Snabb» = svensk for «rask». Skandinavisk, energisk, ett ord som *er* løftet (hastighet).
Kort, slående, lett å rope. Domene: `snabb.app` / `getsnabb.com`. Internasjonalt forståelig
i kontekst (jf. «snappy»). Risiko: generisk ord på svensk → varemerke må bygges på app-bruk,
ikke ordet alene.

## 2. Kjerneidé
En kommandolinje for hverdagen: åpne Snabb, skriv eller si hva du trenger («oppsummer denne
mailen», «lag en handleliste fra dette», «rydd tankene mine»), og en AI-agent fullfører
mikrooppgaven på sekunder. Optimalisert for hastighet over alt annet.

## 3. Målgruppe
Travle kunnskapsarbeidere, gründere, freelancere, studenter – folk med mange små oppgaver og
null tålmodighet. «Power users» som lever i tastatursnarveier og hater app-bytting. 25–45,
mobil + desktop.

## 4. Hovedproblem
De fleste AI-verktøy er chat-baserte og trege: du må åpne, formulere, vente, kopiere, lime.
For en 10-sekunders oppgave er det 2 minutters friksjon. Snabb gjør de hyppige mikro-
oppgavene til ett trykk / én kommando, uten å forlate flyten.

## 5. Killer feature
**Kommandopalett med snarveier (⌘K / widget):** ett tastetrykk åpner Snabb hvor som helst,
du velger eller skriver en kommando, og resultatet er ferdig og kopiert før du rekker å tenke.
Forhåndsdefinerte «recipes» (oppsummer/svar/planlegg/rydd) kjører på under 60 sekunder.

## 6. Fem kjernefunksjoner
1. Kommandopalett med hurtigkommandoer (⌘K, mobil-widget, deling).
2. AI-agent med ferdige «recipes» (oppsummer, omskriv, svar, planlegg, rydd tanker).
3. Egendefinerte snarveier (lagre din egen prompt som ett-trykks knapp).
4. Dashboard med historikk + gjenbruk av tidligere resultater.
5. Del-til-Snabb (iOS/Android share sheet, marker tekst → kjør kommando).

## 7. Tre premium-funksjoner
1. Ubegrensede kjøringer + raskere modell (`gpt-4o`).
2. Egne agenter/arbeidsflyter (kjed flere steg, lagre maler).
3. Integrasjoner (kalender, e-post, Notion) + lagre direkte ut.

## 8. Brukerflyt
Onboarding (3 eksempelkommandoer kjøres live) → hjem = kommandopalett → skriv/velg recipe →
resultat på sekunder, auto-kopiert → lagre som snarvei eller del. Daglig bruk via ⌘K eller
share sheet. Premium-prompt når daglig gratiskvote treffes.

## 9. MVP-stack
Next.js (PWA + desktop-vennlig ⌘K). Clerk auth. Supabase for snarveier/historikk. OpenAI
(`gpt-4o-mini` standard, `gpt-4o` premium) med strømming for opplevd hastighet. Stripe NOK.
Vercel edge for lav latens.

## 10. Database-tabeller
- `users` (id, clerk_id, created_at, plan)
- `recipes` (id, slug, name, prompt_template, system, is_default_bool)
- `user_shortcuts` (id, user_id, name, prompt_template, hotkey)
- `runs` (id, user_id, recipe_id, input, output, model, latency_ms, ts)
- `workflows` (id, user_id, steps_json) — premium
- `subscriptions` (id, user_id, stripe_customer_id, status, plan, period_end)

## 11. API-ruter
- `POST /api/run` – kjør recipe/kommando (streaming).
- `GET /api/recipes` / `POST /api/shortcut` / `GET /api/shortcuts`
- `GET /api/history`
- `POST /api/workflow/run` (premium)
- `POST /api/stripe/checkout` / `POST /api/stripe/webhook`

## 12. UI-sider
`/` (kommandopalett-dashboard), `/history`, `/shortcuts`, `/workflows`, `/settings`,
`/pricing`, `/onboarding`. Estetikk: minimalistisk, mørk, tastatur-først, monospace-aksenter,
føles som et utviklerverktøy.

## 13. Monetisering (NOK)
Freemium: 15 kjøringer/dag, standardmodell. **Snabb Pro: 99 kr/mnd / 890 kr/år.** **Teams:
149 kr/bruker/mnd** (delte snarveier/arbeidsflyter). Høyere pris rettferdiggjort av spart tid;
klar ROI-historie («spar 30 min/dag»).

## 14. Viral vekststrategi
«Se hvor raskt»-innhold: TikTok/X-demoer av en oppgave gjort på 4 sekunder. Delbare snarveier
(del din egen recipe via lenke → mottaker må ha Snabb). Innebygd «Laget med Snabb»-fotnote ved
deling. Build-in-public på X. Teams-spredning innenfra bedrifter.

## 15. 90-dagers lanseringsplan
- **Dag 1–14:** MVP (palett + 8 default recipes + streaming), 30 power-testere.
- **Dag 15–30:** Egne snarveier + historikk + share sheet, mål latens <2s opplevd.
- **Dag 31–50:** Pro + Stripe, build-in-public-lansering på X.
- **Dag 51–70:** TikTok/X-hastighetsdemoer, delbare snarveis-lenker, Product Hunt.
- **Dag 71–90:** Teams-plan + 2 integrasjoner, mål 15 000 brukere / 6 % betalende.

## 16. Investor-pitch (≤150 ord)
AI-verktøy lover hastighet, men leverer friksjon: åpne en chat, formuler, vent, kopier, lim –
to minutter for en ti-sekunders oppgave. Snabb er en kommandolinje for hverdagen. Ett
tastetrykk åpner den hvor som helst, du velger en ferdig «recipe» – oppsummer, svar, planlegg,
rydd tankene – og resultatet er ferdig og kopiert før du rekker å tenke. Vi vinner de hyppige
mikro-oppgavene power users gjør hundre ganger om dagen, der hastighet er hele verdien. Klar
ROI: spar 30 minutter daglig. Pro til 99 kr/mnd og Teams til 149 kr/bruker gir sterk
betalingsvilje fordi tid er penger. Delbare snarveier og «se hvor raskt»-demoer driver vekst.
Produktivitets-AI er et raskt voksende milliardmarked, men ingen eier «raskest». Vi gjør det.
Vi henter 4 MNOK for å nå 100 000 brukere og lansere Teams.

## 17. Risikoer og svakheter
- Plattformrisiko: OpenAI/Apple kan bake samme funksjon inn nativt (Siri/ChatGPT-snarveier).
- Lav byttekostnad for enkle kommandoer → må eie arbeidsflyter for å holde på brukere.
- Hastighetsløftet avhenger av modell-latens vi ikke fullt kontrollerer.
- «Nice-to-have»-fare: må bevise målbar tidsbesparelse.

## 18. Moat
Egendefinerte snarveier + arbeidsflyter + integrasjoner skaper personlig byttekostnad. Teams-
delte recipes gir nettverkseffekt i bedrifter. Hastighets-optimalisert UX (⌘K-vane) er hard
å matche som ettertanke.

## 19. Første versjon på 7 dager
Dag 1–2: Next.js + Clerk + Supabase + ⌘K-palett. Dag 3: 8 default recipes + streaming-run.
Dag 4: historikk + auto-kopier. Dag 5: egne snarveier. Dag 6: Stripe Pro + kvotegrense. Dag 7:
onboarding + deploy. Arbeidsflyter/integrasjoner/share sheet senere.

## 20. Score (1–10)
Lønnsomhet **8** · Viralitet **7** · Gjennomførbarhet **9** · Merkevarekraft **7**
