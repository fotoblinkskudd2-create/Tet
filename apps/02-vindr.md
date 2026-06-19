# Vindr

Poetisk reise-app som foreslår spontane mikro-eventyr basert på vær, tid, budsjett, humør og lokasjon.

## 1. Navneanalyse
«Vindr» = *vind* + nordisk «-r»-endelse (jf. Tindr-mønsteret, men ikke dating). Antyder
bevegelse, frihet, det å la vinden bestemme. Kort, skandinavisk, internasjonalt uttalbart.
Domene: `vindr.app` / `vindr.travel`. Risiko: «swipe»-assosiasjon fra Tinder – vi bruker det
bevisst (swipe på eventyr) heller enn å unngå det. Sikre varemerke klasse 39/9.

## 2. Kjerneidé
I stedet for å planlegge en reise, åpner du Vindr og får 3 forslag til et lite eventyr
*akkurat nå eller i helgen*: en rute, et sted, en stemning – formulert som en kort poetisk
oppfordring. AI vekter vær, klokkeslett, budsjett, humør og hvor du er.

## 3. Målgruppe
Nysgjerrige 20–45 i og rundt byer, «micro-adventurers» som har fri tid men mangler idéer:
par på date-jakt, soloreisende, folk lei av de samme stedene. Sterkest i Norden der vær +
natur + spontanitet henger tett sammen.

## 4. Hovedproblem
«Beslutningstretthet for fritid»: folk har tid og lyst, men ender på sofaen fordi det er for
mye jobb å finne på noe som passer været/humøret/lommeboka. Google Maps er funksjonell, ikke
inspirerende. Vindr fjerner friksjonen og legger til magi.

## 5. Killer feature
**«Send meg ut»-knappen:** ett trykk → AI leser sanntidsvær + tid + din profil og leverer ett
ferdig mikro-eventyr med poetisk tekst, kart-rute, estimert tid og kostnad. Swipe for nytt
forslag. Null planlegging.

## 6. Fem kjernefunksjoner
1. Sanntids eventyrforslag (vær- og lokasjonsdrevet AI).
2. Swipe-grensesnitt for å bla/forkaste/lagre forslag.
3. Kartrute med åpne-i-Maps og estimert tid/kostnad.
4. Humør- og budsjettfilter (rolig/aktiv/billig/spontant).
5. Lagrede eventyr + dagbok med bilder etter turen.

## 7. Tre premium-funksjoner
1. Flerdagers «poetiske reiseruter» (helgetur generert ende-til-ende).
2. Eksklusive kuraterte stedslister + lokale skjulte perler.
3. Værvarslet planlegging: «de neste 3 fine timene»-varsler.

## 8. Brukerflyt
Onboarding (interesser, budsjett, transportmiddel) → hjem med «Send meg ut» → 3 forslag →
swipe/velg → kartvisning + poetisk brief → «jeg drar» → etter turen: legg til bilde/notat →
delt eller lagret. Premium-prompt etter 3. genererte eventyr.

## 9. MVP-stack
Next.js + Mapbox/MapLibre for kart. Clerk auth. Supabase for profiler/lagrede eventyr +
PostGIS for geospørringer. OpenWeather/Yr-API for vær. OpenAI (`gpt-4o-mini`) for poetiske
forslag, med strukturert JSON-output (sted, rute, tone). Stripe i NOK. Vercel.

## 10. Database-tabeller
- `users` (id, clerk_id, interests_json, budget_pref, transport_pref, home_geo)
- `adventures` (id, user_id, title, poem, geo_start, geo_end, est_minutes, est_cost_nok, weather_snapshot, created_at)
- `saved_adventures` (id, user_id, adventure_id, status)
- `journal_entries` (id, adventure_id, note, photo_url, rating)
- `places` (id, name, geo, category, hidden_gem_bool, source)
- `subscriptions` (id, user_id, stripe_customer_id, status, plan)

## 11. API-ruter
- `POST /api/adventure/generate` – tar geo+vær+filter, returnerer 3 forslag.
- `POST /api/adventure/save` / `GET /api/adventure/saved`
- `POST /api/journal` – legg til bilde/notat.
- `GET /api/weather?lat&lng` – proxy mot værkilde.
- `POST /api/stripe/checkout` / `POST /api/stripe/webhook`

## 12. UI-sider
`/` (Send meg ut), `/explore` (swipe), `/adventure/[id]` (kart+poem), `/saved`, `/journal`,
`/settings`, `/pricing`, `/onboarding`. Estetikk: fullskjerms naturfoto, serif-typografi,
mye luft.

## 13. Monetisering (NOK)
Freemium: 3 gratis genereringer/dag. **Vindr Pro: 89 kr/mnd / 790 kr/år.** Engangskjøp:
kuraterte by-pakker (49 kr stk, f.eks. «Bergen i regn», «Oslo etter mørkets frembrudd»).
Senere: affiliate på billetter/kafé/utstyr (10–15 % provisjon).

## 14. Viral vekststrategi
Delbare eventyrkort: vakkert generert bilde + poetisk linje + «Vindr sendte meg hit». Perfekt
for IG/TikTok. Par-modus («dere to fikk dette eventyret»). UGC: brukernes dagbokbilder blir
delbare før/etter-kort. Lokalt: samarbeid med mikro-influencere per by.

## 15. 90-dagers lanseringsplan
- **Dag 1–14:** MVP (generering + kart + swipe), én by (Oslo) seedet med data.
- **Dag 15–30:** Lagring + dagbok + delbare kort, 50 testere.
- **Dag 31–50:** Pro + Stripe, utvid til Bergen/Stavanger/København.
- **Dag 51–70:** TikTok-motor («AI sendte meg på blinddate med byen»), influencer-seeding.
- **Dag 71–90:** Product Hunt + App Store-prep (PWA→native senere), mål 10 000 nedlastinger.

## 16. Investor-pitch (≤150 ord)
Folk har fritid og reiselyst, men bruker den på sofaen fordi det er for mye jobb å finne på
noe som passer været, tiden og lommeboka. Vindr fjerner all planlegging: ett trykk, og AI-en
vår leser sanntidsvær, klokka og smaken din og sender deg ut på et ferdig mikro-eventyr –
med rute, tidsbruk, kostnad og en poetisk oppfordring som faktisk får deg til å reise deg.
Det er Tinder-enkelt og føles som magi. Hvert eventyr blir et delbart, vakkert kort som
markedsfører oss gratis. Freemium med Pro til 89 kr/mnd, pluss affiliate på billetter og
opplevelser. Vi starter hyperlokalt i Norden, der vær og spontanitet henger sammen, og
ekspanderer by for by. Reiseinspirasjon er et titalls-milliard-marked uten en dedikert
spontanitets-aktør. Vi henter 4 MNOK for 8 byer og 100 000 brukere.

## 17. Risikoer og svakheter
- Sesong- og værbasert bruk (lav aktivitet i lange regnperioder, ironisk nok).
- Innholdskaldstart: må seede gode steder per by manuelt først.
- Lavere bruksfrekvens enn daglige apper → høyere CAC-press.
- Kvalitet på AI-forslag avgjør alt; dårlige forslag dreper tilliten raskt.

## 18. Moat
Geospatiell + vær-tilpasset forslagsmotor finjustert på faktisk «jeg dro»-data. Kuraterte
skjulte perler per by (manuelt + UGC) blir et innholdsfortrinn. Merkevare/estetikk.

## 19. Første versjon på 7 dager
Dag 1–2: Next.js + Mapbox + Clerk + vær-proxy. Dag 3: generering (én by hardseedet).
Dag 4: swipe-UI + kartvisning. Dag 5: lagring + delbart kort. Dag 6: Stripe Pro. Dag 7:
onboarding + deploy. Ingen dagbok/flerdagsruter ennå.

## 20. Score (1–10)
Lønnsomhet **6** · Viralitet **8** · Gjennomførbarhet **7** · Merkevarekraft **9**
