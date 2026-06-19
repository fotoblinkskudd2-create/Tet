# Bergly

Lokal Bergen-app: vær, arrangementer, turforslag, lokale historier, småbedrifter, kultur, matsteder og skjulte perler.

## 1. Navneanalyse
«Bergly» = *Berg(en)* + «-ly». Umiddelbart stedsforankret, varmt, app-aktig. «Berg» gir også
fjell-assosiasjon (Bergen = «mellom de syv fjell»). Domene: `bergly.no` / `bergly.app`.
Skalerbar modell: «-ly» kan gjenbrukes per by (Oslly, Tronly) hvis konseptet funker. Sikre
.no tidlig.

## 2. Kjerneidé
Én app som vet alt om hva som skjer i Bergen *nå*, tilpasset været (det regner alltid),
humøret, budsjettet og bydelen din. I stedet for ti faner gir Bergly daglige konkrete forslag:
«Det regner i Sandviken – her er tre tørre ting å gjøre innen 1 km.»

## 3. Målgruppe
Bergensere 20–50 (innbyggere først, ikke turister): nyinnflyttede, studenter (UiB/HVL),
barnefamilier som trenger helgeidéer, og lokale som vil støtte småbedrifter. Sekundært:
tilreisende som vil oppleve byen «som en lokal».

## 4. Hovedproblem
Lokal info er spredt utover Facebook-grupper, kommunesider, Visit Bergen og avis-kalendere –
ingenting er personlig eller værbevisst. Folk ender med å gjøre det samme om igjen. Bergly
samler og kuraterer alt på ett sted, filtrert på regn og humør.

## 5. Killer feature
**Værbasert daglig «hva nå»-forslag:** AI kombinerer Yr-varsel + tid + din bydel + budsjett
og leverer 3 konkrete ting å gjøre i dag, med avstand, pris og en lokal historie knyttet til
stedet. «Regnvær-modus» foreslår automatisk innendørs.

## 6. Fem kjernefunksjoner
1. Værbevisst daglig forslagsfeed (innendørs/utendørs vekting).
2. Arrangementskalender (konserter, marked, kultur) med filter.
3. Turforslag (fjellturer + byvandringer, gradert etter vær/form).
4. Lokale historier/skjulte perler knyttet til kart-punkter.
5. Småbedrift- og matstedskatalog med bydelsfilter.

## 7. Tre premium-funksjoner
1. Bergly Lokal: eksklusive perler + tidlig tilgang til arrangementer/tilbud.
2. Familie- og gruppeplanlegger (felles lister, barnevennlig filter).
3. Værvarslet planlegging: «de neste tørre timene»-varsel + ukesplan.

## 8. Brukerflyt
Onboarding (bydel, interesser, budsjett) → hjem med «I dag i Bergen» (værtilpasset) → trykk
forslag → detalj med kart + historie + åpningstider → lagre/del → arrangementsfane for helga.
Push hver morgen med dagens vær + 3 forslag.

## 9. MVP-stack
Next.js + Mapbox. Clerk auth. Supabase + PostGIS for steder/arrangementer/geofiltre. Yr/MET
API for vær. OpenAI (`gpt-4o-mini`) for daglig kuratering + historiefortelling. Stripe NOK.
Vercel + cron (morgenbatch + arrangementsynk).

## 10. Database-tabeller
- `users` (id, clerk_id, district, interests[], budget_pref)
- `places` (id, name, geo, category, district, price_level, indoor_bool, hidden_gem_bool, hours_json)
- `events` (id, title, venue_geo, start_at, end_at, category, price_nok, source)
- `stories` (id, place_id, title, body, era)
- `trails` (id, name, geo_path, difficulty, weather_suit)
- `suggestions_log` (id, user_id, date, place_ids[], weather_snapshot)
- `subscriptions` (id, user_id, stripe_customer_id, status, plan)

## 11. API-ruter
- `GET /api/today?district` – værtilpassede dagsforslag.
- `GET /api/events?from&to&category`
- `GET /api/trails?weather` / `GET /api/places?category&district`
- `GET /api/story/[placeId]`
- `POST /api/save` / `GET /api/saved`
- `POST /api/stripe/checkout` / `POST /api/stripe/webhook`

## 12. UI-sider
`/` (I dag), `/events`, `/trails`, `/places`, `/place/[id]`, `/map`, `/saved`, `/settings`,
`/pricing`, `/onboarding`. Estetikk: bergensk – grått/regn-blått med varme aksenter, foto av
byen, koselig men ryddig.

## 13. Monetisering (NOK)
Freemium. **Bergly Lokal: 49 kr/mnd / 390 kr/år** (bevisst lav, lokal lojalitet). B2B:
småbedrifter/arrangører betaler for fremhevet plassering og tilbud (fra 299 kr/mnd). Affiliate
på billetter. Senere lisensiering av «-ly»-malen til andre byer.

## 14. Viral vekststrategi
Hyperlokal: Facebook-grupper (Spotted Bergen o.l.), studentkanaler, samarbeid med lokale
mikro-influencere og kafeer (QR-plakat: «Finn skjulte perler – Bergly»). Delbare «Bergen i
dag»-kort. Ukentlig «det skjer i helga»-nyhetsbrev. Henvisningsbonus + bedrift-medvind.

## 15. 90-dagers lanseringsplan
- **Dag 1–14:** MVP (I dag + events + steder), seede 300 steder + arrangementsynk for Bergen.
- **Dag 15–30:** Historier + turer + vær-logikk, 100 lokale testere.
- **Dag 31–50:** Lokal-premium + B2B-fremheving, første 10 bedriftskunder.
- **Dag 51–70:** Lokal PR (BA/BT), influencer- og kafé-samarbeid, ukesnyhetsbrev.
- **Dag 71–90:** Mål 8 000 aktive bergensere; valider B2B-inntekt før vurdert by-2.

## 16. Investor-pitch (≤150 ord)
All lokal info i Bergen ligger spredt på Facebook-grupper, kommunesider og avis-kalendere –
ingenting er personlig, og ingenting tar hensyn til at det regner annenhver dag. Bergly samler
alt: arrangementer, turer, matsteder, småbedrifter og skjulte perler, og leverer tre konkrete
forslag hver morgen tilpasset været, humøret, budsjettet og bydelen din. Vi starter
hyperlokalt og eier én by skikkelig før vi skalerer – «-ly»-modellen kan kopieres by for by.
Inntekt fra både lokal premium til 49 kr/mnd og B2B der småbedrifter og arrangører betaler for
synlighet til engasjerte lokale. Det er et to-sidig nettverk med sterk by-lojalitet og en
naturlig moat: jo flere lokale data og bedrifter, desto bedre forslag. Vi henter 2,5 MNOK for
å bevise modellen i Bergen og forberede tre nye byer.

## 17. Risikoer og svakheter
- Skaleringsspørsmål: én by gir begrenset TAM; modellen må bevises kopierbar.
- Datainnsamling/-vedlikehold per by er arbeidskrevende (arrangementer, åpningstider).
- To-sidig marked: må ha både brukere og bedrifter for å gi verdi (kaldstart).
- Konkurranse fra Facebook-grupper som er «gratis nok».

## 18. Moat
Lokal datadybde + kuraterte skjulte perler er vanskelig å replikere. B2B-relasjoner med lokale
bedrifter gir distribusjon og inntekt. By-lojalitet og merkevare («bergensernes app»).

## 19. Første versjon på 7 dager
Dag 1–2: Next.js + Mapbox + Clerk + Supabase, seede 100 steder. Dag 3: vær-proxy + «I dag»-
forslag. Dag 4: arrangementsliste + kart. Dag 5: steder/turer + lagring. Dag 6: Stripe Lokal +
B2B-fremhev-flagg. Dag 7: onboarding + deploy. Historier/familieplanlegger senere.

## 20. Score (1–10)
Lønnsomhet **6** · Viralitet **7** · Gjennomførbarhet **8** · Merkevarekraft **8**
