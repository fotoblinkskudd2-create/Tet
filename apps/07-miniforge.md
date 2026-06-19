# MiniForge

AI-drevet oppfinnerlab som gjør små idéer om til prototyper, MVP-planer, pitch-dokumenter og salgbare konsepter.

## 1. Navneanalyse
«MiniForge» = *mini* (små idéer, lave terskel) + *forge* (smie – der råstoff blir til verktøy).
Sterkt håndverk/maker-bilde: du smir idéen din. Engelsk, internasjonalt, B2B-troverdig.
Domene: `miniforge.io` / `miniforge.app`. Risiko: «Miniforge» finnes som Conda-distribusjon
(utvikler-publikum) – sjekk varemerke i klasse 9/42; vurder `miniforge.studio` som backup.

## 2. Kjerneidé
En prosjektbasert AI-lab: legg inn en rå idé, og spesialiserte AI-agenter (forsker, designer,
strateg, pitch-skriver) bygger steg for steg en komplett «prototypepakke» – konseptdok,
MVP-plan, markedsrapport, pitch-deck og eksport til PDF/DOCX. Fra serviett-skisse til
investorklar pakke på en kveld.

## 3. Målgruppe
Gründere, indie makers, produktledere, studenter i entreprenørskap, innovasjonsavdelinger og
konsulenter. 22–50, idérike men tids-/ressursfattige. B2B-tilt: akseleratorer, inkubatorer og
bedrifter som kjører idémyldring i skala.

## 4. Hovedproblem
Avstanden fra «jeg har en idé» til «noe jeg kan vise/selge» er enorm: research, validering,
planlegging, design, pitch – uker med arbeid eller dyre konsulenter. De fleste idéer dør i
gapet. MiniForge komprimerer hele kjeden til en strukturert AI-arbeidsflyt.

## 5. Killer feature
**Multi-agent «forge»-pipeline:** ett idé-input utløser en kjede av spesialiserte agenter som
hver leverer sin del (markedsanalyse → MVP-spec → wireframe-beskrivelse → pitch), bygd oppå
hverandre med delt kontekst, og samlet til én eksporterbar, sammenhengende pakke. Ikke én chat
– et helt team.

## 6. Fem kjernefunksjoner
1. Prosjektrom per idé (lagrer kontekst, versjoner, output).
2. Multi-agent pipeline (research, MVP-plan, design-brief, pitch, GTM).
3. Markedsrapport-generator (TAM/konkurrenter/risiko, med kilder).
4. Pitch-deck-bygger (struktur + tekst + talepunkter).
5. Eksport til PDF/DOCX (+ delbar nettlenke til pakken).

## 7. Tre premium-funksjoner
1. Ubegrensede prosjekter + premium-modell (`gpt-4o`) + dypere research.
2. Teamrom: samarbeid, kommentarer, roller, delt idébank.
3. Branding/white-label-eksport + egendefinerte agent-maler.

## 8. Brukerflyt
Onboarding (rolle + bransje) → «ny idé» → skriv 2–3 setninger → velg hvilke moduler (alle/
utvalg) → agentene kjører med synlig fremdrift → review/rediger hver seksjon → eksporter
PDF/DOCX eller del lenke. Premium-prompt etter første gratis prosjekt.

## 9. MVP-stack
Next.js. Clerk auth (+ org for team). Supabase for prosjekter/dokumenter/versjoner. OpenAI
(`gpt-4o` orkestrert i agent-pipeline via funksjonskall, `gpt-4o-mini` for delsteg). PDF/DOCX
via server-side render (React-PDF / docx). Stripe abonnement NOK. Vercel + bakgrunnsjobber
(Vercel cron / queue) for lange genereringer.

## 10. Database-tabeller
- `users` (id, clerk_id, role, industry, plan)
- `orgs` (id, name, owner_id) + `org_members` (org_id, user_id, role)
- `projects` (id, owner_id, org_id, title, idea_input, status)
- `artifacts` (id, project_id, type [market/mvp/design/pitch/gtm], content_md, version, created_at)
- `agent_runs` (id, project_id, agent, input, output, tokens, status, ts)
- `exports` (id, project_id, format, file_url, created_at)
- `subscriptions` (id, user_id/org_id, stripe_customer_id, status, plan, seats)

## 11. API-ruter
- `POST /api/project` – opprett prosjekt.
- `POST /api/project/[id]/forge` – kjør (valgte) agenter, streaming-fremdrift.
- `GET /api/project/[id]/artifacts` / `PATCH /api/artifact/[id]` (rediger).
- `POST /api/project/[id]/export?format=pdf|docx`
- `POST /api/org/invite` (team)
- `POST /api/stripe/checkout` / `POST /api/stripe/webhook`

## 12. UI-sider
`/` (dashboard/prosjekter), `/project/[id]` (forge-arbeidsbord m/seksjoner), `/project/new`,
`/templates`, `/team`, `/settings`, `/pricing`, `/onboarding`. Estetikk: profesjonell,
verktøy-aktig, «smie»-aksent (varm orange på mørk), tydelig agent-fremdrift.

## 13. Monetisering (NOK)
Freemium: 1 gratis prosjekt, vannmerket eksport. **MiniForge Pro: 199 kr/mnd / 1 790 kr/år.**
**Teams: 349 kr/sete/mnd.** Engangs: «ekspresspakke» kjøp (149 kr) uten abonnement. B2B-tilt:
akseleratorer/inkubatorer på årsavtaler. Høyest pris av de syv – klar forretningsverdi.

## 14. Viral vekststrategi
Delbare offentlige pakke-lenker («se hva MiniForge laget av idéen min på 10 min») driver
direkte påmelding. Build-in-public + «idé → pitch på 10 min»-demoer på X/LinkedIn/TikTok.
Maler/agent-deling i et community. Partnerskap med akseleratorer og gründermiljøer.
Henvisning: del en pakke, få en måned Pro.

## 15. 90-dagers lanseringsplan
- **Dag 1–14:** MVP (prosjektrom + 3 kjerneagenter: research/MVP/pitch + PDF-eksport), 30 testere.
- **Dag 15–30:** Full pipeline (5 moduler) + redigering + delbar lenke.
- **Dag 31–50:** Pro/Teams + Stripe + DOCX, LinkedIn/X-lansering.
- **Dag 51–70:** Demo-innholdsmotor, akselerator-partnerskap, maler-community.
- **Dag 71–90:** Mål 12 000 brukere / 8 % betalende + 2 B2B-avtaler; bygg agent-mal-marked.

## 16. Investor-pitch (≤150 ord)
Alle har idéer; nesten ingen klarer å gjøre dem til noe man kan vise eller selge. Veien fra
innfall til investorklar pakke er ukevis med research, planlegging, design og pitch – eller
dyre konsulenter – og der dør de fleste idéer. MiniForge er en AI-oppfinnerlab: skriv idéen i
to setninger, og et team av spesialiserte agenter bygger en komplett prototypepakke –
markedsrapport, MVP-plan, design-brief og pitch-deck – sammenhengende og eksporterbar til
PDF/DOCX på minutter. Ikke en chat, men en hel arbeidsflyt. Vi treffer makers, gründere og
innovasjonsteam med tydelig betalingsvilje: Pro til 199 kr/mnd, Teams til 349 kr/sete, pluss
B2B-avtaler med akseleratorer. Hver delte pakke markedsfører oss. Mens andre selger AI-chat,
selger vi ferdige resultater. Marked for innovasjon/produktverktøy er milliardstort og
modent for AI-disrupsjon. Vi henter 5 MNOK for full pipeline, team-funksjoner og 100 000
brukere.

## 17. Risikoer og svakheter
- Output-kvalitet må være «god nok å vise» – generisk AI-slop dreper verdien.
- Høy token-kostnad per prosjekt → marginpress, må styres med modellmiks/caching.
- «Engangsbruk»-fare: brukere lager én pakke og slutter (lav frekvens) → trenger team/abonnement-stickiness.
- Konkurranse fra generelle AI-verktøy (ChatGPT + maler) som er «gratis nok».

## 18. Moat
Orkestrert multi-agent-pipeline + domenespesifikke maler er ikke-trivielt å replikere godt.
Prosjekt-/idébank-data og teamsamarbeid gir byttekostnad. B2B-avtaler og agent-mal-marked gir
nettverkseffekt og distribusjon.

## 19. Første versjon på 7 dager
Dag 1–2: Next.js + Clerk + Supabase + prosjektrom. Dag 3: 3 agenter (research/MVP/pitch) med
delt kontekst. Dag 4: forge-arbeidsbord + redigerbare seksjoner. Dag 5: PDF-eksport. Dag 6:
Stripe Pro + vannmerke på gratis. Dag 7: onboarding + delbar lenke + deploy. DOCX/team senere.

## 20. Score (1–10)
Lønnsomhet **8** · Viralitet **6** · Gjennomførbarhet **7** · Merkevarekraft **8**
