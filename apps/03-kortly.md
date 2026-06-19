# Kortly

«TikTok for tekst» – en feed av smarte mikrotekster, mini-leksjoner, raske nyheter og refleksjoner.

## 1. Navneanalyse
«Kortly» = *kort* (norsk for «short/card») + «-ly» (engelsk app-suffiks, jf. Calmly/Feedly).
Dobbelbetydning: korte kort + kortfattet. Lekent, mykt, app-aktig. Domene: `kortly.app`.
Internasjonalt skalerbart (kan lese som «curt-ly»). Risiko: likner mange «-ly»-apper; sterk
visuell identitet kompenserer.

## 2. Kjerneidé
En vertikal sveipefeed der hvert «kort» er et bittelite stykke verdifullt tekstinnhold:
en innsikt, en mini-leksjon, en omskrevet nyhet, en refleksjon. AI personaliserer feeden mot
interessene dine, og du kan lagre, dele og be om «mer som dette». Doomscrolling, men du blir
faktisk litt smartere.

## 3. Målgruppe
16–35, mobil-innfødte som scroller mye, men har dårlig samvittighet for tom underholdning:
studenter, nysgjerrige unge voksne, «5-minutters-læring»-folk. Sterk for de som leste
Blinkist/Brilliant men droppet dem fordi det føltes som lekser.

## 4. Hovedproblem
Sosiale feeds er optimalisert for å sløse tid, ikke berike. Læringsapper føles som pliktarbeid.
Det finnes ingen feed som er like vanedannende som TikTok, men der hvert sveip gir reell verdi.
Kortly eier «produktiv scrolling».

## 5. Killer feature
**Uendelig personalisert tekstfeed med ett-trykks dybde:** sveip vertikalt gjennom kort;
trykk «utvid» på et hvilket som helst kort og AI utdyper det til en 200-ords mini-leksjon
umiddelbart. Tilpasses i sanntid av hva du dveler ved, lagrer og utvider.

## 6. Fem kjernefunksjoner
1. Personalisert vertikal tekstfeed (interesse-tagger + atferd).
2. AI-generering/omskriving av kort fra emner og kilder.
3. «Utvid»-handling: gjør kort til mini-leksjon on demand.
4. Lagre, samle i «stabler» (emnemapper) og del som bildekort.
5. Daglig «5 kort»-sammendrag (push) for vanedanning.

## 7. Tre premium-funksjoner
1. Ubegrenset «utvid» + dype temaspor (kuraterte serier).
2. Egne kilder: lim inn artikkel/PDF → få kort-versjon.
3. Annonsefri + offline-lagrede stabler + lydopplesning.

## 8. Brukerflyt
Onboarding (velg 5+ interesser) → feed åpnes umiddelbart → sveip/lagre/utvid → AI lærer →
daglig push «dine 5 kort» → del kort → premium-prompt når gratis «utvid»-kvote er brukt.

## 9. MVP-stack
Next.js (PWA, vertikal swipe-feed). Clerk auth. Supabase for innhold/interaksjoner +
`pgvector` for embeddings/anbefaling. OpenAI (`gpt-4o-mini` generering/utvidelse,
`text-embedding-3-small` for personalisering). Stripe i NOK. Vercel + cron for daglig
innholdsbatch.

## 10. Database-tabeller
- `users` (id, clerk_id, interest_tags[], created_at)
- `cards` (id, type, title, body, source_url, topic_tags[], embedding vector)
- `interactions` (id, user_id, card_id, action [view/save/expand/share/skip], dwell_ms, ts)
- `stacks` (id, user_id, name)
- `stack_cards` (stack_id, card_id)
- `expansions` (id, card_id, user_id, content, created_at)
- `subscriptions` (id, user_id, stripe_customer_id, status, plan)

## 11. API-ruter
- `GET /api/feed?cursor` – returnerer neste batch personaliserte kort.
- `POST /api/interaction` – logger handling (driver anbefaling).
- `POST /api/card/expand` – generer mini-leksjon.
- `POST /api/ingest` (premium) – lim inn kilde → kort.
- `POST /api/stack` / `GET /api/stack/[id]`
- `POST /api/stripe/checkout` / `POST /api/stripe/webhook`

## 12. UI-sider
`/` (feed, fullskjerm vertikal), `/card/[id]`, `/stacks`, `/stack/[id]`, `/search`,
`/settings`, `/pricing`, `/onboarding`. Estetikk: rene typografiske kort, ett kort per
skjerm, subtile farger per emne.

## 13. Monetisering (NOK)
Freemium: full feed gratis, 5 «utvid»/dag. **Kortly Plus: 59 kr/mnd / 490 kr/år.** Senere:
sponsede kort (tydelig merket, native) og B2B «Kortly for Teams» (læringskort til ansatte,
129 kr/bruker/mnd). Lav pris bevisst for volum + viralitet.

## 14. Viral vekststrategi
Hvert kort er et ferdig delbart bilde (vakker typografi + Kortly-merke) – delt på IG/X/TikTok
driver direkte oppdagelse. «Stabler» kan deles offentlig som mini-kurs. Henvisning: del en
stabel, få en uke Plus. Innholdsmotoren mater også egne sosiale kontoer automatisk.

## 15. 90-dagers lanseringsplan
- **Dag 1–14:** Feed + generering + sveip-UI, seede 1 000 kort i 8 emner.
- **Dag 15–30:** Personalisering (embeddings) + «utvid» + lagring, 100 testere.
- **Dag 31–50:** Plus + Stripe, delbare kort live.
- **Dag 51–70:** Auto-poste topp-kort til egne TikTok/IG-kontoer, henvisningsløkke.
- **Dag 71–90:** Skaler innhold (auto-batch), Product Hunt, mål 25 000 brukere / 4 % Plus.

## 16. Investor-pitch (≤150 ord)
Folk scroller fem timer om dagen og føler seg dummere etterpå. Kortly er like vanedannende
som TikTok, men hvert sveip gir et bittelite stykke ekte verdi: en innsikt, en mini-leksjon,
en smartere nyhet. AI-en personaliserer feeden i sanntid, og ett trykk utvider hvilket som
helst kort til en full mini-leksjon. Vi treffer den enorme gruppen som vil slutte å sløse tid
men ikke orker en læringsapp som føles som lekser. Hvert kort er et ferdig delbart bilde, så
veksten er innebygd. Freemium til 59 kr/mnd, pluss B2B-læring og native sponsede kort.
Innholdet er AI-generert, så marginalkostnaden per bruker er minimal og katalogen vokser av
seg selv. Mikrolæring + kortform-innhold er to milliardmarkeder som ennå ikke har smeltet
sammen. Vi henter 3,5 MNOK for 100 000 brukere på 12 måneder.

## 17. Risikoer og svakheter
- Innholdskvalitet/faktasjekk: AI-generert «kunnskap» kan være feil → tillitsrisiko.
- Opphavsrett ved omskriving av nyheter (må bruke egne formuleringer/kilder forsiktig).
- Plattform-avhengighet for distribusjon (algoritmeendringer).
- «Utvid»-kostnad kan eksplodere ved tung gratisbruk.

## 18. Moat
Personaliseringsmodellen + interaksjonsdata (din feed blir bedre jo mer du bruker den).
Kvalitetskuratert + verifisert kortkatalog. Delings-løkken gir lav CAC og nettverkseffekt
rundt offentlige stabler.

## 19. Første versjon på 7 dager
Dag 1–2: Next.js + Clerk + Supabase + 200 hardseede kort. Dag 3: vertikal swipe-feed.
Dag 4: «utvid» + lagring. Dag 5: enkel personalisering (tag-basert). Dag 6: Stripe Plus +
delbart kort-bilde. Dag 7: onboarding + deploy. Embeddings/ingest senere.

## 20. Score (1–10)
Lønnsomhet **7** · Viralitet **9** · Gjennomførbarhet **8** · Merkevarekraft **7**
