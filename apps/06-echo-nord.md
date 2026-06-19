# Echo Nord

Lyd- og historie-app: nordiske fortellinger, lokale myter og AI-genererte lydvandringer knyttet til landskap.

## 1. Navneanalyse
«Echo Nord» = ekko (gjenklang, stemmer fra fortiden) + Nord (geografisk + identitet). To ord,
men cinematisk og premium – føles som en merkevare, ikke en utility. Domene: `echonord.com` /
`echonord.app`. Engelsk-nordisk miks gir internasjonal rekkevidde + lokal forankring. Sterk
visuell/lydlig identitet mulig.

## 2. Kjerneidé
Stedsbaserte lydopplevelser: du går gjennom et landskap, en by eller langs en fjord, og appen
spiller AI-fortalte historier, myter og minner knyttet til akkurat det stedet – utløst av GPS.
Som en personlig forteller som kjenner hver stein.

## 3. Målgruppe
Primær: turister og opplevelsesreisende i Norden (kulturnysgjerrige 30–60, ofte med god
betalingsvilje). Sekundær: lokale historieinteresserte, turgåere, skoleklasser. Tertiær:
diaspora-nordboere som vil koble seg til røttene.

## 4. Hovedproblem
Nordisk historie og myter er rike, men utilgjengelige: spredt i bøker, museer og skilt ingen
leser. Turister går forbi steder med dype historier uten å vite det. Tradisjonelle audioguider
er stive, dyre å produsere og dekker bare noen få attraksjoner.

## 5. Killer feature
**GPS-utløst AI-lydvandring:** appen vet hvor du er, og en AI-forteller med naturlig stemme
forteller stedets historie idet du nærmer deg – sømløst, uten å trykke. Stemme, lengde og tema
tilpasses (myte/historie/natur), og dekningen er uendelig fordi historiene genereres, ikke
forhåndsinnspilles per punkt.

## 6. Fem kjernefunksjoner
1. Kart med stedspunkter + GPS-utløst avspilling.
2. AI-forteller (tekstgenerering + stemmesyntese) for hvert punkt.
3. Tematiske lydvandringer (myter, vikinger, natur, krigshistorie).
4. Offline-nedlasting av vandringer for områder uten dekning.
5. Lydspiller med bakgrunns-soundscape (vind, hav) for stemning.

## 7. Tre premium-funksjoner
1. Ubegrensede vandringer + premium-stemmer + flere språk.
2. Kuraterte signaturvandringer laget med lokale historikere/forfattere.
3. «Lag din egen»: generer en personlig lydvandring for et valgt område/tur.

## 8. Brukerflyt
Onboarding (språk, interesser, stemmevalg) → kart viser vandringer i nærheten → velg/last ned
→ start → gå, og historier spiller automatisk via GPS → lagre favoritter / del rute. Offline-
modus for fjellturer. Premium-prompt etter første gratis vandring.

## 9. MVP-stack
Next.js (PWA med Geolocation + bakgrunnslyd) — native wrapper (Capacitor) for bedre GPS senere.
Clerk auth. Supabase + PostGIS + Storage for lydfiler. OpenAI (`gpt-4o` for fortelling) +
TTS (OpenAI TTS / ElevenLabs) for stemme, generert og cachet per punkt. Stripe NOK. Vercel.

## 10. Database-tabeller
- `users` (id, clerk_id, lang, voice_pref, interests[])
- `walks` (id, title, area_geo, theme, distance_m, est_minutes, premium_bool)
- `points` (id, walk_id, geo, trigger_radius_m, order)
- `narrations` (id, point_id, lang, voice, text, audio_url, source_refs)
- `downloads` (id, user_id, walk_id, downloaded_at)
- `favorites` (id, user_id, walk_id)
- `subscriptions` (id, user_id, stripe_customer_id, status, plan)

## 11. API-ruter
- `GET /api/walks?lat&lng&radius` – vandringer i nærheten.
- `GET /api/walk/[id]` – punkter + metadata.
- `POST /api/narration` – generer/hent (cachet) lyd for et punkt.
- `POST /api/walk/custom` (premium) – generer personlig vandring.
- `GET /api/download/[walkId]` – pakke for offline.
- `POST /api/stripe/checkout` / `POST /api/stripe/webhook`

## 12. UI-sider
`/` (kart), `/walk/[id]`, `/player`, `/downloads`, `/favorites`, `/settings`, `/pricing`,
`/onboarding`. Estetikk: cinematisk, mørkt, nordisk natur-foto, store typografiske titler,
lydbølge-visualisering.

## 13. Monetisering (NOK)
Freemium: 1 gratis vandring. **Echo Nord Pass: 119 kr/mnd / 990 kr/år.** Engangskjøp per
by/region (99 kr, f.eks. «Bergen & fjordene»). B2B: turistkontorer/destinasjonsselskaper
lisensierer kuratert innhold (årsavtaler). Affiliate på turer/overnatting.

## 14. Viral vekststrategi
Cinematisk delbart innhold: TikTok/Reels med vakker natur + AI-forteller-klipp («denne fjorden
har en 1000 år gammel historie»). Samarbeid med reiselivs-influencere og Visit-organisasjoner.
QR-koder på fysiske turiststeder. Diaspora-markedsføring i nordiske miljøer i USA/Canada.

## 15. 90-dagers lanseringsplan
- **Dag 1–14:** MVP (kart + GPS-trigger + generert lyd), 2 signaturvandringer (Bergen, Oslo).
- **Dag 15–30:** Offline + soundscape + 5 vandringer, 50 testere på faktiske turer.
- **Dag 31–50:** Pass + Stripe, kuraterte vandringer med 1 lokal historiker.
- **Dag 51–70:** Reels-motor + influencer-samarbeid, første turistkontor-pilot.
- **Dag 71–90:** 10+ vandringer i 4 regioner, mål 20 000 nedlastinger / B2B-pilotinntekt.

## 16. Investor-pitch (≤150 ord)
Norden er full av historier – myter, vikinger, fjorder med tusen års fortid – men de er låst i
bøker og skilt ingen leser. Echo Nord forvandler ethvert landskap til en levende lydvandring:
mens du går, forteller en AI-stemme stedets historie automatisk via GPS, uten et eneste trykk.
Fordi historiene genereres og ikke forhåndsinnspilles per punkt, kan vi dekke uendelig mange
steder til en brøkdel av kostnaden for tradisjonelle audioguider. Vi tjener på reisende med høy
betalingsvilje (Pass til 119 kr/mnd, regionkjøp), og på destinasjonsselskaper som lisensierer
kuratert innhold. Cinematisk, delbart innhold gir organisk vekst i et reiseliv som sulter etter
autentiske, dype opplevelser. Vi bygger en merkevare, ikke en utility – og en katalog som blir
en moat. Vi starter i Norge, utvider til hele Norden, og henter 5 MNOK for innhold,
stemme-IP og 50 vandringer.

## 17. Risikoer og svakheter
- Faktarisiko: AI-fortalt historie må verifiseres, ellers undergraves tilliten/kulturansvaret.
- Tyngste produkt å bygge (GPS-trigger, bakgrunnslyd, offline, TTS-kost) → høyest teknisk risiko.
- Sesong- og turistavhengig bruk; lokal hverdagsbruk er usikker.
- TTS/generering kan bli dyrt; må caches aggressivt.

## 18. Moat
Kuratert + verifisert historiekatalog (kulturell troverdighet er vanskelig å kopiere raskt).
B2B-relasjoner med destinasjonsselskaper. Stemme-/merkevareidentitet. Geodata + innhold som
nettverk vokser med dekning.

## 19. Første versjon på 7 dager
Dag 1–2: Next.js PWA + Geolocation + Clerk + Supabase/PostGIS. Dag 3: kart + 1 vandring med
punkter. Dag 4: AI-tekst + TTS (cachet) + spiller. Dag 5: GPS-utløsning + soundscape. Dag 6:
Stripe Pass. Dag 7: onboarding + deploy. Offline/custom/native senere.

## 20. Score (1–10)
Lønnsomhet **6** · Viralitet **7** · Gjennomførbarhet **6** · Merkevarekraft **9**
