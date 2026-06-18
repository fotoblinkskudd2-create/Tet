# ALEX ALPHA TOTAL WAR
Brutal venture-, patent- og teknisk due diligence-dom over Alex sine prosjektspor.
Ingen pynt. Ingen "spennende mulighet". Det som er svakt er drept.

Scoring-modell brukt på alle prosjekter:
`Pain(0-20) + Buyer(0-15) + Speed(0-15) + Evidence(0-15) + Defensibility(0-10) + Margin(0-10) + Reuse(0-10) + Alex-fit(0-5) - Risk penalty(0-15) = Total/100`

---

## A. TOPP 10 PROSJEKTER (rangert)

| # | Prosjekt | Score | Dom |
|---|----------|-------|-----|
| 1 | LYTTEPOST (kommunal vannlekkasje) | 76 | PASS |
| 2 | MERD-MIK (akustisk varsling oppdrett) | 70 | PASS |
| 3 | ANBUDSRADAR | 68 | REWORK |
| 4 | GitHub Painkiller Radar (som betalt smertekartlegging) | 60 | REWORK |
| 5 | PicoPure BATCH-25 | 47 | REWORK |
| 6 | Patent White-Space Engine | 45 | REWORK |
| 7 | Proof Vault | 43 | REWORK |
| 8 | HVAL-PROP | 41 | REWORK |
| 9 | OpenClaw / Hermes Operator OS | 38 | REWORK |
| 10 | Clean-Room Drone V2 | 31 | REWORK (nesten KILL) |

Drept utenfor topp 10: **TEKSTKVERN** (score 27, se kill-liste).

---

## 1. LYTTEPOST

1. **Navn:** LYTTEPOST
2. **Problem:** Norske VA-verk taper i snitt 25-30 % av rentvannet sitt til lekkasjer (Norsk Vann-tall). Kommunene vet det, men har ikke kontinuerlig akustisk overvåking — kun stikkprøver og reaktiv graving etter klage.
3. **Kjøper:** Kommunal VA-avdeling / teknisk sjef i kommune, evt. interkommunale VA-selskap (IVAR, Glitre, VIV).
4. **Hvorfor kjøper faktisk betaler:** Lekkasje er en budsjettlinje de allerede rapporterer på til Norsk Vanns benchmarking (BedreVA). En leveranse som reduserer lekkasjeprosent gir direkte forsvarbar besparelse i investeringsplanen — det er ikke "nice to have", det er et tall politikerne spør om hvert år.
5. **Første salgbare leveranse:** "14-dagers lekkasjeprioriteringsrapport" — sensorer plassert på utvalgte kummer, akustisk datafangst, rapport med kart over sannsynlige lekkasjepunkter rangert etter volum/kostnad.
6. **Prisnivå:** 35 000 – 90 000 NOK per pilotrapport (avhengig av antall punkter), abonnement 8 000–20 000 NOK/mnd ved fast overvåking.
7. **Prototype innen 14 dager:** 3-5 DIY akustiske sensornoder (piezo/hydrofon + Raspberry Pi/ESP32), enkel FFT-basert lekkasjesignatur-deteksjon, manuell dataanalyse i Python — ikke automatisert ML ennå.
8. **Prototype innen 90 dager:** 15-20 noder, batteridrift + LoRaWAN-oppkobling, automatisk anomalivarsling, første reelle pilot med en kommune, validert mot faktisk gravefunn.
9. **Teknisk risiko:** Middels. Akustisk lekkasjedeteksjon er velkjent fysikk (brukt av Gutermann, Halma/Primayer m.fl.) — risikoen er signal/støy i urbant miljø og falske positiver, ikke prinsippet.
10. **IP-/patentrisiko:** Lav-middels. Selve metoden er ikke patenterbar (kjent teknikk siden 80-tallet), men spesifikk sensorplassering/algoritme for norske rørmaterialer (PE/PVC i frostutsatt grunn) kan gi en smal prosess-patent eller i alle fall driftshemmelighet.
11. **Markedsrisiko:** Lav. Markedet (kommune-VA) er regulert, budsjettert og ikke konjunkturutsatt. Risikoen er lang salgssyklus og anbudsplikt over terskelverdi.
12. **Konkurrenter:** Gutermann, Primayer/Halma, Aquarius Spectrum, Asplan Viak/Norconsult som rådgivere uten eget produkt. Ingen norsk lavkost-aktør med rask pilotmodell.
13. **Bevis som trengs:** Én reell kommune-pilot med dokumentert funn (faktisk lekkasje funnet og reparert), før/etter-lekkasjetall, kostnad per funn vs. tradisjonell metode.
14. **Første 10 kunder/kundetyper:** Små-mellomstore kommuner med kjent høyt lekkasjetall i Norsk Vann-rapporter (>25 %), interkommunale VA-selskap, VA-konsulentfirma som underleverandør av data.
15. **Første salgsasset:** Ett-sides "lekkasjekost-kalkulator" (kommunens eget tapstall i kr/år) + pilotrapport-mal med kart.
16. **100-dagers plan:** Dag 1-14: bygg 14-dagers-prototype og test på eget/lånt rørnett. Dag 15-40: identifiser 15 kommuner med verst lekkasjetall fra offentlig statistikk, send målrettet salgsbrev med kalkulator. Dag 41-70: lukk 1-2 betalte piloter. Dag 71-100: lever rapport, dokumenter funn som case.
17. **3-års plan:** År 1: 5-8 pilotrapporter, bygg case-bibliotek. År 2: gjør om til abonnementsmodell med fast sensorpark, ansett én tekniker. År 3: skaler til interkommunale selskaper og evt. eksport til Sverige/Danmark med samme VA-struktur.
18. **Hva som må drepes:** Trangen til å bygge en "plattform" eller dashboard før første pilot er solgt. Ingen app før kommune nr. 1 har betalt for rapport.
19. **PASS / REWORK / KILL:** **PASS**
20. **Total score:** Pain 18, Buyer 13, Speed 12, Evidence 10, Defensibility 7, Margin 7, Reuse 8, Alex-fit 5, Risk -4 → **76/100**

---

## 2. MERD-MIK

1. **Navn:** MERD-MIK
2. **Problem:** Rømming og predator-/nettskade i oppdrettsanlegg er en av de dyreste hendelsene i havbruk (bøter, fisketap, rapporteringsplikt til Fiskeridirektoratet). Dagens nettilstandskontroll er stort sett manuell dykker-/ROV-inspeksjon med lang responstid.
3. **Kjøper:** Drifts- og HMS-ansvarlig i oppdrettsselskap (Lerøy, Mowi, mindre regionale aktører), evt. teknologi-/utstyrsleverandør til havbruk som vil hvitelabel-integrere.
4. **Hvorfor kjøper faktisk betaler:** Én rømmingshendelse koster fra hundretusener til millioner i bot + fisk + rykte. Et tidlig-varslingssystem som reduserer responstid fra dager til minutter er et forsikringsargument, ikke et "innovasjons"-argument.
5. **Første salgbare leveranse:** "72-timers akustisk nettstatus-pilot" — hydrofon-rigg på 2-3 merder, baseline-lytting, rapport med avvik (nettskade-signatur, uvanlig fiskeadferd, predator-tilstedeværelse).
6. **Prisnivå:** 50 000-120 000 NOK pilot, deretter 10 000-25 000 NOK/mnd/anlegg ved fast drift.
7. **Prototype innen 14 dager:** Hydrofon + vanntett boks med ESP32/Raspberry Pi, enkel terskel-basert anomalideteksjon, testet i bøtte/kar — ikke i sjø.
8. **Prototype innen 90 dager:** Faktisk feltrigg på leid/lånt merd hos en velvillig oppdretter, batteri+solcelle, dataoverføring til land, første reelle avviksvarsel validert mot kamera/dykker.
9. **Teknisk risiko:** Middels-høy. Saltvann, biofouling, strøm og bakgrunnsstøy fra fôringsanlegg gjør signalbehandlingen vesentlig vanskeligere enn i VA-rør. Krever feltiterasjon, ikke bare labtest.
10. **IP-/patentrisiko:** Middels. Spesifikk akustisk signatur-klassifisering for nettskade/predator i merd-miljø er trolig patenterbar som en smal metodepatent — sjekk eksisterende patenter fra AKVA group, Scale AQ, SINTEF før du går videre.
11. **Markedsrisiko:** Lav-middels. Havbruk har penger og reguleringstrykk øker (krav om bedre rømmingssikring), men salgssyklus til de store er lang og krever referanser.
12. **Konkurrenter:** AKVA group, Scale AQ, SINTEF Ocean-prosjekter, kamerabaserte løsninger (fôringskontroll-firma som utvider til tilstandsovervåking). Ingen dominerende akustisk nisjeaktør ennå.
13. **Bevis som trengs:** Én feltpilot med faktisk dokumentert avviksdeteksjon som korrelerer med visuell/dykker-bekreftelse.
14. **Første 10 kunder/kundetyper:** Mellomstore regionale oppdrettsselskap (ikke de 3 største — for tung innkjøpsprosess), HMS-/teknologisjefer som allerede har hatt en rømmingshendelse siste 2 år (offentlig søkbart hos Fiskeridirektoratet).
15. **Første salgsasset:** Kostnadsregneark "hva kostet siste rømming/nettskade deg" + pilotforslag.
16. **100-dagers plan:** Dag 1-14: byggekarstest. Dag 15-45: finn 10 oppdrettere med nylig rømmingssak i offentlig register, kontakt direkte. Dag 46-90: én feltpilot på leid merd. Dag 91-100: dokumenter funn, bygg case.
17. **3-års plan:** År 1: 2-3 feltpiloter, valider mot SINTEF/akademisk samarbeid for kredibilitet. År 2: produktiser rigg, søk patent på klassifiseringsmetode. År 3: lisensier til AKVA/Scale AQ eller skaler egen montørtjeneste.
18. **Hva som må drepes:** Ambisjonen om å dekke "alt" (rømming + lakselus + fôring + vannkvalitet) i v1. Kun nettstatus + predator først.
19. **PASS / REWORK / KILL:** **PASS**
20. **Total score:** Pain 17, Buyer 13, Speed 10, Evidence 8, Defensibility 8, Margin 8, Reuse 7, Alex-fit 4, Risk -5 → **70/100**

---

## 3. ANBUDSRADAR

1. **Navn:** ANBUDSRADAR
2. **Problem:** SMB-er og mindre konsulentfirma går glipp av relevante offentlige anbud (Doffin/Mercell) fordi søkefunksjonene er dårlige og ingen har tid til å lese 50 nye utlysninger i uka.
3. **Kjøper:** Eier/daglig leder i ingeniør-/konsulent-/entreprenør-SMB (10-100 ansatte), evt. kommunale innkjøpsavdelinger som vil overvåke konkurrentbud.
4. **Hvorfor kjøper faktisk betaler:** Ett tapt anbud de aldri så er et reelt omsetningstap i hundretusenklassen. Betalingsviljen er reell, men lav per enhet — dette er et volumspill, ikke en høymarginsalg.
5. **Første salgbare leveranse:** Ukentlig AI-filtrert anbudsliste + auto-utkast til kvalifikasjonssvar for 3 utvalgte bransjer (VA, bygg, havbruk-leverandører).
6. **Prisnivå:** 990-3 000 NOK/mnd per bedrift (SaaS), evt. 15 000 NOK engangs for skreddersydd bransjeoppsett.
7. **Prototype innen 14 dager:** Scraper/API-kobling til Doffin, enkel nøkkelordfiltrering + GPT-oppsummering sendt på e-post til 2-3 testbedrifter.
8. **Prototype innen 90 dager:** Egen klassifiseringsmodell for bransjerelevans (ikke bare nøkkelord), enkel webdashboard, betalende beta-kunder.
9. **Teknisk risiko:** Lav. Rent software, ingen hardware, ingen ukjent fysikk.
10. **IP-/patentrisiko:** Ingen reell patentmulighet — dette er en SaaS-forretningsmodell, ikke en oppfinnelse.
11. **Markedsrisiko:** Middels-høy. Doffin/Mercell kan når som helst forbedre egen søkefunksjon og fjerne hele verdiforslaget over natten.
12. **Konkurrenter:** Mercell (eier mye av infrastrukturen selv), Visma, diverse små varslingstjenester. Lav byttekost for kunden gjør det enkelt å bli forbigått.
13. **Bevis som trengs:** Dokumentert treffrate — hvor mange relevante anbud fanget opp som kunden selv ville gått glipp av, sammenlignet med deres nåværende prosess.
14. **Første 10 kunder/kundetyper:** VA-/bygg-konsulentfirma uten egen anbudsavdeling, små entreprenører i kommuner Alex allerede har LYTTEPOST/MERD-MIK-kontakt med (kryssalg).
15. **Første salgsasset:** Gratis "anbud du gikk glipp av siste 90 dager"-rapport generert fra offentlig data, sendt direkte til prospektet.
16. **100-dagers plan:** Dag 1-14: bygg scraper+filter. Dag 15-30: kjør gratis missed-opportunity-rapport for 20 prospekter. Dag 31-70: konverter 5 til betalende. Dag 71-100: bygg dashboard, fjern e-post-MVP.
17. **3-års plan:** År 1: 30-50 betalende SMB. År 2: bygg bransjespesifikke moduler (havbruk, VA) der Alex har unik kontekst fra andre prosjekter. År 3: selg som vertikal add-on til andre verktøy, ikke stå-alene-vekst mot Mercell.
18. **Hva som må drepes:** Tanken om å konkurrere bredt mot Mercell. Kun vertikal nisje med ekte bransjekontekst overlever.
19. **PASS / REWORK / KILL:** **REWORK** — god kontantstrøm-motor, men ingen voll. Bygg kun som kryssalgskanal til de tyngre prosjektene, ikke som hovedsatsing.
20. **Total score:** Pain 14, Buyer 11, Speed 14, Evidence 9, Defensibility 4, Margin 6, Reuse 9, Alex-fit 4, Risk -3 → **68/100**

---

## 4. GitHub Painkiller Radar

1. **Navn:** GitHub Painkiller Radar
2. **Problem:** Indie-utviklere og små SaaS-team vet ikke hvilke smerter i devtools/automation som er verdt nok til å bygge løsning for — de gjetter fra magefølelse, ikke data.
3. **Kjøper:** Indie hackers, små produktteam, mikro-VC/akseleratorer som screener idéer, evt. agenturer som selger MVP-utvikling og trenger valideringsdata til pitch.
4. **Hvorfor kjøper faktisk betaler:** En kjøper betaler ikke for "innsikt" generelt — de betaler for å unngå å bygge feil produkt i 3 måneder. Det er en forsikringspremie mot bortkastet byggetid.
5. **Første salgbare leveranse:** Et betalt "Top 20 GitHub Pain Clusters"-rapport for en spesifikk nisje (f.eks. CI/CD, data pipelines), med kundekvotering og estimert betalingsvilje.
6. **Prisnivå:** 1 500-5 000 NOK per rapport, evt. abonnement 500 NOK/mnd for løpende oppdatering.
7. **Prototype innen 14 dager:** Script som henter GitHub issues/discussions via API for 5-10 store repos, enkel klyngeanalyse (embeddings + clustering) på smerteord.
8. **Prototype innen 90 dager:** Automatisert pipeline for 50+ repos, kommersiell relevansscoring, første 5 betalende kunder for skreddersydde rapporter.
9. **Teknisk risiko:** Lav. Ren dataanalyse, ingen hardware, velkjente NLP-metoder.
10. **IP-/patentrisiko:** Ingen — metodikk er ikke patenterbar, verdien ligger i utførelse og distribusjon, ikke oppfinnelse.
11. **Markedsrisiko:** Middels-høy. Markedet for "idévalidering-as-a-service" er trendfølsomt og lett å kopiere — moaten er nesten null uten distribusjon.
12. **Konkurrenter:** IndieHackers-community-innsikt (gratis), diverse "build in public"-newsletter-skribenter, GummySearch (Reddit-variant). Lav barriere for konkurrenter.
13. **Bevis som trengs:** Minst én kunde som faktisk bygget noe basert på rapporten og fikk betalende brukere — uten det er det bare en spekulasjonsrapport.
14. **Første 10 kunder/kundetyper:** Indie hackers med eksisterende følgerskap (Twitter/X-utviklere), mikro-VC-analytikere, agenturer som selger "vi finner produktet for deg"-pakker.
15. **Første salgsasset:** Gratis 3-siders teaser-rapport med 5 smerteklynger, full rapport bak betalingsmur.
16. **100-dagers plan:** Dag 1-14: bygg pipeline for én nisje. Dag 15-30: lag teaser, post i 2-3 relevante community. Dag 31-70: selg 10-15 rapporter. Dag 71-100: bygg abonnement for løpende oppdatering.
17. **3-års plan:** År 1: etabler som lavmargin trafikkilde og leadmagnet for Alex sine andre prosjekter (viser teknisk kompetanse). År 2: spinn av til egen liten produktlinje hvis det bærer seg selv. År 3: vurder exit/lisensiering eller nedskaler til ren intern research-motor — ikke kjernevirksomhet uansett utfall.
18. **Hva som må drepes:** Illusjonen om at dette er en "plattform". Det er en rapportfabrikk med lav voll — behandle den som det.
19. **PASS / REWORK / KILL:** **REWORK** — solid kontantstrøm og bevisgenerator for Alex sin egen metode, men svak som selvstendig 5-årssatsing.
20. **Total score:** Pain 12, Buyer 9, Speed 13, Evidence 7, Defensibility 3, Margin 5, Reuse 9, Alex-fit 5, Risk -3 → **60/100**

---

## 5. PicoPure BATCH-25

1. **Navn:** PicoPure BATCH-25
2. **Problem:** Tilgang til rent drikkevann i akutte situasjoner (beredskap, hytte/fjell, mindre vannverk uten kapasitet) er avhengig av dyre eller upraktiske renseløsninger.
3. **Kjøper:** Kommunal beredskapsavdeling, Sivilforsvaret/frivillige beredskapsorganisasjoner, hyttefelt-/grunneierlag, evt. NGO for katastrofeberedskap.
4. **Hvorfor kjøper faktisk betaler:** Beredskap har øremerket budsjett og lovkrav (sivilbeskyttelsesloven) om en viss selvforsyningsgrad — det er ikke et "kanskje", det er et compliance-behov.
5. **Første salgbare leveranse:** Testet batch-enhet (BATCH-25 = 25 liter/time-klasse) med dokumentert renseeffekt mot et definert sett patogener/partikler, levert som demonstrasjonsenhet til én beredskapsaktør.
6. **Prisnivå:** 15 000-40 000 NOK per enhet, eller utleie/beredskapsavtale 5 000 NOK/år per stasjonert enhet.
7. **Prototype innen 14 dager:** Bordmodell med kjent filterteknologi (UF-membran/UV) i ny formfaktor — ikke ny renseteknologi, kun integrasjon og pakking.
8. **Prototype innen 90 dager:** Feltrigg testet av tredjepartslab på faktisk vannkvalitet (ikke kun rent springvann), dokumentert kapasitet og driftstid på batteri.
9. **Teknisk risiko:** Middels. Selve renseprinsippet er kjent — risikoen er å nå en kostnad/ytelse-kombinasjon som faktisk er bedre enn eksisterende feltrenseenheter (Sawyer, Lifestraw, Katadyn på det lave nivået, MSR/Grayl m.fl.).
10. **IP-/patentrisiko:** Middels-høy. Vannrensing er et tungt patentert felt med store aktører — sjekk grundig før noe markedsføres som "ny metode". Sannsynlig at verdien ligger i formfaktor/integrasjon, ikke i kjemien/membranen selv.
11. **Markedsrisiko:** Middels. Drikkevannsprodukter krever sertifisering (NSF/ANSI eller tilsvarende) for seriøst salg — dette er tid og penger før første krone kommer inn.
12. **Konkurrenter:** Lifestraw, Sawyer, Katadyn, Grayl, Berkey — etablerte merker med tillit. Alex har ingen merkevarefordel her ennå.
13. **Bevis som trengs:** Tredjeparts laboratorietest av renseeffekt (ikke egen påstand), pluss minst én reell beredskapsaktør som vil bruke enheten i øvelse.
14. **Første 10 kunder/kundetyper:** Kommunale beredskapskoordinatorer, Sivilforsvarets distriktskontor, store hyttefelt-/fjellstyrer uten kommunalt vann.
15. **Første salgsasset:** Uavhengig testrapport + kort beredskapsbrosjyre med pris per husstand/år.
16. **100-dagers plan:** Dag 1-20: bygg bordmodell. Dag 21-50: få tredjepartstest. Dag 51-80: demo for 3 beredskapsaktører. Dag 81-100: vurder om sertifiseringsvei er verdt videre investering.
17. **3-års plan:** År 1: bevis konsept med beredskapsnisje (lavere krav enn forbrukermarked). År 2: vurder sertifisering for bredere marked KUN hvis nisjen betaler. År 3: skaler produksjon eller lisensier formfaktor til etablert merke.
18. **Hva som må drepes:** Ambisjonen om å konkurrere mot Lifestraw/Sawyer på forbrukermarkedet før beredskapsnisjen har betalt for seg selv.
19. **PASS / REWORK / KILL:** **REWORK** — reelt problem, men sertifiserings- og merkevaretyngde gjør dette til et 2-3 års spor, ikke en snarvei.
20. **Total score:** Pain 15, Buyer 10, Speed 5, Evidence 6, Defensibility 6, Margin 7, Reuse 4, Alex-fit 3, Risk -9 → **47/100**

---

## 6. Patent White-Space Engine

1. **Navn:** Patent White-Space Engine
2. **Problem:** Oppfinnere og små teknologibedrifter vet ikke hvor i patentlandskapet det faktisk er åpent rom — de søker patent på magefølelse og finner kollisjon først etter advokatregningen.
3. **Kjøper:** Uavhengige oppfinnere, små teknologi-/produktbedrifter, patentadvokater/IP-konsulenter som vil tilby raskere forhåndsscreening til sine klienter.
4. **Hvorfor kjøper faktisk betaler:** En feilslått patentsøknad (avslag pga. kollisjon) koster typisk 50 000-150 000 NOK i advokattid. En forhåndsscreening til en brøkdel av det er en lett solgt forsikring.
5. **Første salgbare leveranse:** Et white-space-notat for ett konkret teknisk domene (f.eks. akustisk leveranse-deteksjon i merder/rør) som kobler biologisk mekanisme + industriproblem + eksisterende patentfamilier, med en vurdering av åpent rom.
6. **Prisnivå:** 8 000-25 000 NOK per notat, evt. 2 000 NOK/mnd abonnement for løpende overvåking av et felt.
7. **Prototype innen 14 dager:** Manuell + AI-assistert søk i Espacenet/Google Patents for ett domene Alex allerede kjenner (f.eks. akustisk sensorikk), strukturert i et enkelt notat-format.
8. **Prototype innen 90 dager:** Halvautomatisert pipeline som kobler patentklasser (IPC/CPC) til fritekstsøk, testet på 3-5 domener, første betalende kunde utenfor Alex sitt eget nettverk.
9. **Teknisk risiko:** Lav-middels. Informasjonsinnhenting og syntese er løsbart med dagens verktøy — risikoen er kvalitet/pålitelighet, ikke teknisk gjennomførbarhet.
10. **IP-/patentrisiko:** Lav for Alex selv (det er et analyseverktøy, ikke en oppfinnelse), men juridisk ansvar hvis en kunde stoler blindt på notatet og søker patent som likevel kolliderer — må tydelig disclaimes som forhåndsscreening, ikke juridisk rådgivning.
11. **Markedsrisiko:** Middels. Nisjemarked, lang salgssyklus mot advokatfirma, men stabilt behov uavhengig av konjunktur.
12. **Konkurrenter:** Patentbyråer som gjør dette manuelt og dyrt, noen AI-patentsøk-startups internasjonalt (PatSnap, Innography/Clarivate). Ingen norsk lavkost-aktør for små oppfinnere.
13. **Bevis som trengs:** Ett notat som faktisk holdt vann — dvs. en reell patentsøknad senere ble godkjent eller bevisst omformulert basert på funnene.
14. **Første 10 kunder/kundetyper:** Uavhengige oppfinnere i Alex sitt eget nettverk (start med HVAL-PROP/MERD-MIK-domenet), små patentadvokatkontor utenfor de store byene.
15. **Første salgsasset:** Det første white-space-notatet Alex selv trengte til HVAL-PROP, anonymisert og brukt som eksempel/case.
16. **100-dagers plan:** Dag 1-20: lag notat for eget bruk (HVAL-PROP). Dag 21-50: tilbud notatet som tjeneste til 5 oppfinnere i nettverket. Dag 51-90: selg 2-3 betalte notater. Dag 91-100: vurder om dette skal være produkt eller forbli internt verktøy.
17. **3-års plan:** År 1: bevis med 5-10 betalte notater. År 2: bygg halvautomatisert pipeline, selg som abonnement til små patentkontor. År 3: behold som inntektsstrøm KUN hvis det ikke stjeler tid fra LYTTEPOST/MERD-MIK.
18. **Hva som må drepes:** Ambisjonen om å bli en generell "AI-patentplattform" som konkurrerer med Clarivate. Forbli smal og menneskenær.
19. **PASS / REWORK / KILL:** **REWORK** — bygg først for eget bruk (HVAL-PROP-patentet), selg som tjeneste kun som sidestrøm.
20. **Total score:** Pain 9, Buyer 6, Speed 8, Evidence 5, Defensibility 5, Margin 4, Reuse 8, Alex-fit 4, Risk -4 → **45/100**

---

## 7. Proof Vault

1. **Navn:** Proof Vault
2. **Problem:** Alex sitter med screenshots, workflow-bilder, prototypebilder og testdata spredt rundt uten struktur — bevis som kunne solgt et prosjekt blir aldri brukt fordi det ikke er organisert som bevis.
3. **Kjøper:** Internt verktøy for Alex selv først. Sekundær ekstern kjøper: andre soloprodusenter/oppfinnere som trenger samme struktur for egne pitcher.
4. **Hvorfor kjøper faktisk betaler:** Eksternt: en grunder betaler for å spare tid på å lage investor-/kundedekk fra rotete bevismateriale. Internt (Alex selv): dette er ikke noe noen betaler Alex for — det er en multiplikator på alle andre prosjekters salgsevne.
5. **Første salgbare leveranse (internt):** Et strukturert sett "proof cards" for LYTTEPOST og MERD-MIK brukt direkte i de første salgsbrevene/pilotforslagene.
6. **Prisnivå:** Ikke eget produkt i utgangspunktet — verdien realiseres som høyere konverteringsrate på andre prosjekters salg. Hvis eksternalisert: 500-1500 NOK/mnd SaaS for små team.
7. **Prototype innen 14 dager:** Manuell mappe-/malstruktur (Notion/Markdown) for proof cards med de 10-15 feltene som er definert, fylt ut for eksisterende bilder/screenshots.
8. **Prototype innen 90 dager:** Halvautomatisert pipeline (OCR + klassifisering + kort-generering) brukt aktivt i minst to pågående salgsprosesser (LYTTEPOST, MERD-MIK).
9. **Teknisk risiko:** Lav. Dette er organisering + lett AI-klassifisering, ingen ny teknologi.
10. **IP-/patentrisiko:** Ingen — det er en intern prosess/verktøy.
11. **Markedsrisiko:** Høy hvis det forsøkes solgt eksternt for tidlig — det finnes ingen ekte ekstern kjøper bevist ennå, kun en hypotese.
12. **Konkurrenter:** Notion-maler, Canva, generelle pitch-deck-byggere. Ingen direkte konkurrent på "bevis-til-salgsasset"-nisjen, men også ingen bevist betalingsvilje.
13. **Bevis som trengs:** Dokumentert tidsbesparelse og/eller høyere konverteringsrate i LYTTEPOST/MERD-MIK-salg som faktisk kan tilskrives strukturerte proof cards.
14. **Første 10 kunder/kundetyper:** Ingen ekstern kunde i fase 1 — Alex selv er eneste "kunde". Eksternt først etter intern bevisførsel: solo-oppfinnere/indie-grundere i samme posisjon som Alex.
15. **Første salgsasset:** Selve proof-card-malen, brukt som "show don't tell" i LYTTEPOST-salgsbrevet.
16. **100-dagers plan:** Dag 1-14: bygg manuell mal, fyll ut for eksisterende materiale. Dag 15-50: bruk aktivt i LYTTEPOST/MERD-MIK-salg. Dag 51-100: mål om det faktisk økte svarrate/møterate — hvis ja, vurder lett automatisering.
17. **3-års plan:** År 1: rendyrk som internt multiplikatorverktøy. År 2: vurder ekstern pilot med 2-3 andre solo-grundere KUN hvis intern effekt er bevist. År 3: behold internt eller selg som lite sidevektøy — aldri hovedsatsing.
18. **Hva som må drepes:** Hele tanken om "10 workflow-diagrammer og 100 proof cards" som mål i seg selv. Målet er høyere salgskonvertering på LYTTEPOST/MERD-MIK, ikke et stort bibliotek.
19. **PASS / REWORK / KILL:** **REWORK** — verdifullt som internt verktøy, drep enhver plan om å selge det eksternt før det har bevist effekt internt.
20. **Total score:** Pain 7, Buyer 5, Speed 9, Evidence 4, Defensibility 3, Margin 3, Reuse 9, Alex-fit 5, Risk -2 → **43/100**

---

## 8. HVAL-PROP

1. **Navn:** HVAL-PROP
2. **Problem:** Lavfrekvent støy/vibrasjon fra propeller/rotorer skaper problemer i tre ulike markeder samtidig: marin fauna-forstyrrelse (fartøy nær oppdrett/sjødyr), dronestøy (akseptanse for sivil dronebruk over folk), og slitasje/vibrasjonsskade.
3. **Kjøper:** Avhenger av endelig retning — mest realistisk: dronefabrikanter/integratorer som vil ha mer stillegående sivile produkter, evt. mindre fartøy/elbåt-aktører.
4. **Hvorfor kjøper faktisk betaler:** Støyreduksjon er en målbar spesifikasjon kunden kan vise til i egen anbudsdokumentasjon (kommunale støykrav, dyrevelferdshensyn nær oppdrett). Det er ikke "kult", det er en kravspesifikasjon de må krysse av.
5. **Første salgbare leveranse:** Et testet rotorblad/-design med dokumentert dB-reduksjon mot en standard referanseprop, levert som dataark + fysisk testenhet til en potensiell integrator.
6. **Prisnivå:** Lisensiering per produksjonsenhet (typisk 5-15 % royalty) eller engangs IP-lisens 200 000-1 000 000 NOK avhengig av eksklusivitet — dette er en IP-spilling, ikke en enhetssalgs-spilling.
7. **Prototype innen 14 dager:** 3D-printet bladgeometri basert på kjente lavstøy-prinsipper (vingetipp-serrations, variabel pitch-fordeling), testet med enkel dB-måler mot referanseprop på testrigg.
8. **Prototype innen 90 dager:** Iterert geometri med faktisk akustisk måling i kontrollert miljø (ikke bare mobil-app-dB-måler), sammenlignet kvantitativt mot minst to kommersielle referanseprodukter.
9. **Teknisk risiko:** Høy. Akustikk/aerodynamikk-optimalisering krever ekte iterasjon, simuleringskompetanse (CFD) eller dyr fysisk testing for å komme forbi "litt bedre i et anekdotisk forsøk".
10. **IP-/patentrisiko:** Middels-høy, men også høyeste *verdi* i hele lista hvis det lykkes — propellakustikk er tungt forskningsfelt (NASA, universiteter, droneindustrien selv), så nyhetsgrad må dokumenteres grundig før søknad. Dette er kandidaten med faktisk patenterbar kjerneteknologi.
11. **Markedsrisiko:** Middels. Dronefabrikanter er konservative på å bytte rotor-leverandør uten lang valideringsperiode.
12. **Konkurrenter:** DJI (egen R&D), akademiske lavstøy-rotorprosjekter, noen spesialiserte droneprop-leverandører (T-Motor m.fl.). Ingen liten aktør har slått gjennom på ren akustikk-differensiering.
13. **Bevis som trengs:** Kvantifisert, uavhengig verifiserbar dB-måling i kontrollert miljø — ikke telefon-app-målinger. Dette er den enkelt høyeste bevisbøyen i hele lista.
14. **Første 10 kunder/kundetyper:** Ikke sluttkunder — dette er B2B2B: små/mellomstore dronefabrikanter, propellprodusenter for elbåt/RC-markedet som vil differensiere på støy.
15. **Første salgsasset:** Dataark med før/etter-dB-kurve + 3D-printet demoblad sendt fysisk til 5 potensielle integrator-kontakter.
16. **100-dagers plan:** Dag 1-20: bygg og test første geometri. Dag 21-60: iterer minst 3 ganger med ordentlig dB-måling. Dag 61-90: skriv white-space-notat (se prosjekt 6) for å sjekke patenterbarhet før noe vises eksternt. Dag 91-100: vis dataark til 3-5 målrettede integrator-kontakter under NDA.
17. **3-års plan:** År 1: bevis akustisk fordel + vurder patentsøknad. År 2: lisensieringssamtaler med 2-3 integratorer, evt. samarbeid med Clean-Room Drone V2 som showcase. År 3: royalty-inntekt fra lisensiering, IKKE egen masseproduksjon.
18. **Hva som må drepes:** Ambisjonen om å bygge og selge egne droner med denne rotoren før IP-en er sikret og uavhengig validert. Bygg patentet, ikke fabrikken.
19. **PASS / REWORK / KILL:** **REWORK** — høyest IP-potensial i hele lista, men krever bevisdisiplin før noe annet skjer. Patenter først, kommersialiser senere.
20. **Total score:** Pain 10, Buyer 8, Speed 4, Evidence 5, Defensibility 9, Margin 6, Reuse 5, Alex-fit 4, Risk -10 → **41/100**

---

## 9. OpenClaw / Hermes Operator OS

1. **Navn:** OpenClaw / Hermes Operator OS
2. **Problem:** Alex kjører mange parallelle agent-drevne prosjekter uten ett samlet system for input → bevis → produkt → kunde → patent → salg. Kaos koster tapt oppfølging og dobbeltarbeid.
3. **Kjøper:** Alex selv, i fase 1. Ingen ekstern kjøper er bevist.
4. **Hvorfor kjøper faktisk betaler:** Internt er ikke "betaling" relevant — verdien er tid spart og prosjekter som ikke dør av mangel på oppfølging. Eksternt (hypotetisk senere): andre solo-operatører med mange parallelle prosjekter kunne betale for samme struktur, men det er ubevist.
5. **Første salgbare leveranse:** Ingen ekstern leveranse i fase 1 — den interne leveransen er et fungerende board-system (Input/Pain/Proof/Product/Customer/Patent/Prototype/Sales/Kill-log/Asset vault) som faktisk brukes daglig på LYTTEPOST og MERD-MIK.
6. **Prisnivå:** Ikke relevant i fase 1. Hvis eksternalisert senere: 200-800 NOK/mnd per solo-bruker SaaS.
7. **Prototype innen 14 dager:** Enkelt Notion/Airtable-board med de 10 kolonnene, manuelt oppdatert for LYTTEPOST og MERD-MIK.
8. **Prototype innen 90 dager:** Lett automatisering — agent som flytter kort basert på status, ukentlig auto-generert review-sammendrag, brukt aktivt på minst 3 prosjekter.
9. **Teknisk risiko:** Lav. Dette er prosess- og integrasjonsarbeid, ikke ny teknologi.
10. **IP-/patentrisiko:** Ingen.
11. **Markedsrisiko:** Irrelevant i fase 1 (ingen ekstern marked testet). Hvis eksternalisert: høy, fordi "personal operating system"-kategorien er full av Notion-maler og produktivitetsverktøy med lav betalingsvilje.
12. **Konkurrenter (hvis eksternalisert):** Notion, Linear, Trello, utallige "second brain"-maler. Ekstremt mettet kategori.
13. **Bevis som trengs:** Dokumentert at boardet faktisk endret utfall — et prosjekt som ble drept tidligere enn det ellers ville blitt, eller en kunde som ble fulgt opp som ellers ville falt mellom stolene.
14. **Første 10 kunder/kundetyper:** Ingen i fase 1. Skal IKKE jages eksternt før intern nytte er bevist over minst 90 dager.
15. **Første salgsasset:** Ingen ekstern salgsasset skal bygges nå. Internt: et skjermbilde av boardet som dokumentasjon i andre prosjekters "hvordan vi jobber"-seksjon (kan styrke tillit i pitcher for LYTTEPOST/MERD-MIK).
16. **100-dagers plan:** Dag 1-7: sett opp enkelt board manuelt. Dag 8-100: bruk det disiplinert på LYTTEPOST og MERD-MIK, ingen bygging utover det som faktisk trengs for de to prosjektene.
17. **3-års plan:** År 1: rendyrk som internt nervesystem for de 2-3 aktive prosjektene. År 2: vurder lett automatisering KUN hvis manuell bruk har vist seg uunnværlig. År 3: eksternalisering er valgfritt sidespor, ikke et mål i seg selv.
18. **Hva som må drepes:** Hele "25 agentroller og eksportmaler"-ambisjonen fra dag 1. Det er infrastruktur-teater hvis ingen ekte prosjekt bruker det daglig først.
19. **PASS / REWORK / KILL:** **REWORK** — bygg minimalt, bruk det, eksternaliser aldri før det har båret minst to andre prosjekter i reell drift.
20. **Total score:** Pain 6, Buyer 4, Speed 7, Evidence 3, Defensibility 4, Margin 2, Reuse 10, Alex-fit 5, Risk -3 → **38/100**

---

## 10. Clean-Room Drone V2

1. **Navn:** Clean-Room Drone V2 (sivil SAR/inspeksjon)
2. **Problem:** Søk-og-redning, kraftlinje- og bygningsinspeksjon i Norge er fortsatt dyrt og personellavhengig der droner kunne dekket mer med lavere risiko og kostnad.
3. **Kjøper:** Brann- og redningsvesen, kraftselskap (nettinspeksjon), kommunal bygningskontroll, evt. forsikringsselskap for skadeinspeksjon.
4. **Hvorfor kjøper faktisk betaler:** Inspeksjonsoppdrag er allerede budsjettert og kjøpes i dag fra konsulenter/helikopter — droneinspeksjon er en direkte kostnadsreduksjon kunden kan dokumentere i eget budsjett.
5. **Første salgbare leveranse:** Ikke en drone — en *inspeksjonstjeneste* (Alex flyr, leverer rapport) for én avgrenset oppgave (f.eks. kraftlinjeseksjon eller bygningstak), DJI-utstyr i starten, ikke egenutviklet plattform.
6. **Prisnivå:** 5 000-20 000 NOK per inspeksjonsoppdrag i starten (tjeneste), langt senere evt. utstyrslisensiering hvis HVAL-PROP gir reell differensiering.
7. **Prototype innen 14 dager:** Ingen "prototype" trengs i klassisk forstand — dette krever dronesertifisering (droneoperatørbevis, A1/A2/A3 eller spesifikk kategori) og forsikring før noe kan selges lovlig.
8. **Prototype innen 90 dager:** Fullført sertifisering, første betalte inspeksjonsoppdrag levert med standard kommersiell drone — ingen egen hardware ennå.
9. **Teknisk risiko:** Lav i tjenestefasen (kjent COTS-utstyr), høy hvis/når egen rotor-/plattformutvikling (HVAL-PROP) kobles inn.
10. **IP-/patentrisiko:** Lav i tjenestefasen. Eksplisitt forbudt å bevege seg mot militær/taktisk bruk eller målidentifikasjon mot mennesker — dette skal forbli en rendyrket sivil inspeksjons-/SAR-tjeneste.
11. **Markedsrisiko:** Høy. DJI og etablerte inspeksjonsfirma dominerer, og uten egen plattformfordel (fra HVAL-PROP) er dette en lavmargin tjenestevirksomhet med svak voll.
12. **Konkurrenter:** Etablerte droneinspeksjonsfirma, kraftselskapenes egne droneteam, DJI Enterprise-økosystemet generelt.
13. **Bevis som trengs:** Fullført sertifisering + minst ett betalt oppdrag med dokumentert kostnadsbesparelse vs. tradisjonell metode (helikopter/klatrer).
14. **Første 10 kunder/kundetyper:** Lokale kraftselskap med kjent inspeksjonsbehov, kommunal bygningskontroll, brannvesen for øvelsessamarbeid (ikke nødvendigvis betalt først).
15. **Første salgsasset:** Eksempelrapport fra en selvfinansiert demo-inspeksjon (f.eks. eget tak/nærliggende bygning) som viser rapportformat og bildekvalitet.
16. **100-dagers plan:** Dag 1-40: fullfør sertifisering og forsikring. Dag 41-70: gjør 1-2 gratis/lavkost demo-inspeksjoner for referanse. Dag 71-100: selg første betalte oppdrag.
17. **3-års plan:** År 1: ren tjenestevirksomhet med COTS-utstyr, bygg referanseliste. År 2: vurder om HVAL-PROP-rotor er klar til å gi faktisk differensiering — kun da invester i egen plattform. År 3: enten nisje-tjenesteleverandør med god referanseportefølje, eller lisensgiver av rotor-IP til etablerte droneprodusenter.
18. **Hva som må drepes:** All snakk om egenutviklet droneplattform før sertifisering, forsikring og første 5 betalte tjenesteoppdrag er i boks. Også: enhver bevegelse mot militær/taktisk vinkling skal drepes umiddelbart — det er uttrykkelig utenfor scope og øker juridisk/etisk risiko uten å øke verdien for de sivile kjøperne som er identifisert.
19. **PASS / REWORK / KILL:** **REWORK (nesten KILL)** — reelt marked, men ingen voll uten HVAL-PROP, og kapital-/sertifiseringstyngde gjør dette til det tregeste sporet i topp 10. Skal ikke prioriteres før de to øverste prosjektene har egen kontantstrøm.
20. **Total score:** Pain 11, Buyer 7, Speed 3, Evidence 4, Defensibility 4, Margin 5, Reuse 5, Alex-fit 3, Risk -11 → **31/100**

---

## B. KILL-LISTE over dårlige spor

| Spor | Hvorfor det er drept |
|------|----------------------|
| **TEKSTKVERN** (generisk B2C-app for ADHD/dysleksi-skriving) | Score 27/100. Markedet er mettet (Grammarly, Lingdys, Google Read&Write, innebygde OS-funksjoner), betalingsviljen hos enkeltpersoner er lav, og Alex har ingen distribusjonsfordel mot de store. Ingen reell voll. |
| **TEKSTKVERN som ren B2C-abonnementsapp** | Samme svakhet som over forsterket — uten en institusjonell kjøper (NAV, PPT-tjeneste, skole) er dette en hobbyapp, ikke en virksomhet. |
| **GitHub Painkiller Radar som åpen kildekode-prosjekt** | Hvis det gis bort gratis for "synlighet" forsvinner hele inntektsmuligheten og det blir tidsbruk uten avkastning. |
| **Clean-Room Drone V2 med militær/taktisk vinkling** | Eksplisitt forbudt i oppdraget og drept her permanent — øker juridisk og etisk risiko og passer ikke buyer-profilen (sivile inspeksjons-/SAR-kjøpere) som er identifisert. |
| **HVAL-PROP som rent forskningsprosjekt uten kommersialiseringsplan** | Hvis det forblir et "interessant ingeniørprosjekt" uten patentsøknad og uten identifisert lisensieringskjøper, brenner det kun tid og penger uten å bygge verdi som kan selges eller forsvares. |
| **Operator OS som ekstern SaaS fra dag 1** | Mettet kategori (Notion/Linear/Trello), ingen bevist ekstern kjøper, og det stjeler byggetid fra de to prosjektene som faktisk har kjøpere (LYTTEPOST, MERD-MIK). |
| **Patent White-Space Engine som "AI-patentplattform" i konkurranse med Clarivate/PatSnap** | Alex har ikke kapital eller datatilgang til å konkurrere på den skalaen. Som smalt notat-verktøy for egne og nærliggende behov er det levedyktig — som plattform er det dødt. |
| **Proof Vault som eksternt produkt før intern effekt er bevist** | Ingen ekstern kjøper er identifisert, kun en hypotese. Bygging av eksportmaler og 100 proof cards uten bevist intern nytte er ren coin-brenning. |
| **ANBUDSRADAR som bred konkurrent til Mercell/Doffin** | Mercell kan endre egen søkefunksjon over natten og fjerne hele verdiforslaget. Kun levedyktig som smal vertikal kryssalgskanal, ikke som hovedsatsing. |
| **PicoPure BATCH-25 mot forbrukermarkedet (Lifestraw/Sawyer-konkurranse)** | Ingen merkevarefordel, tung sertifiseringsbyrde. Kun levedyktig i beredskapsnisje med lavere krav i første omgang. |

---

## C. 100-DAGERS BRUTAL GJENNOMFØRINGSPLAN (samlet, tvers prosjekter)

**Dag 1-14:**
Bygg LYTTEPOST 14-dagers-prototype og MERD-MIK karstest parallelt. Ingen andre prosjekter rører kode eller hardware i denne perioden. Skriv første white-space-notat for HVAL-PROP-domenet til eget bruk (ikke eksternt).

**Dag 15-30:**
Identifiser 15 kommuner (LYTTEPOST) og 10 oppdrettsselskap (MERD-MIK) fra offentlig data (Norsk Vann-statistikk, Fiskeridirektoratets rømmingsregister). Send målrettede salgsbrev med kalkulator/kostnadsark. Sett opp enkelt internt board (Operator OS-light) for å spore alt dette — manuelt, ingen automatisering.

**Dag 31-50:**
Følg opp svar, lukk minst 1 LYTTEPOST-pilot og initier MERD-MIK-feltrigg-planlegging med en velvillig oppdretter. Start ANBUDSRADAR-MVP som kryssalgskanal mot de samme kommune-/SMB-kontaktene — ikke som eget hovedspor.

**Dag 51-70:**
Lever LYTTEPOST-pilotrapport. Bygg og test MERD-MIK feltrigg på leid merd. Kjør GitHub Painkiller Radar-rapport for én nisje og selg 3-5 stykker som lavmargin kontantstrøm parallelt.

**Dag 71-90:**
Dokumenter LYTTEPOST- og MERD-MIK-funn som case (Proof Vault-kort manuelt). Send disse case-ene aktivt til neste runde prospekter. Vurder om sertifiseringsvei for PicoPure BATCH-25 er verdt videre investering basert på beredskapsaktørenes faktiske respons.

**Dag 91-100:**
Brutal gjennomgang: drep eller reduser alt som ikke har en betalende kunde eller en konkret testdato i kalenderen. Lås neste 90-dagers fokus til de 2-3 prosjektene med faktisk inntekt eller signert pilot.

---

## D. FØRSTE 30 OPPGAVER

1. Bygg LYTTEPOST 14-dagers sensorprototype (3-5 noder)
2. Test prototype på eget/lånt rørnett, logg falske positiver
3. Hent Norsk Vann-/BedreVA-lekkasjestatistikk for alle norske kommuner
4. Ranger 15 kommuner etter høyest lekkasjeprosent
5. Bygg lekkasjekost-kalkulator (ett-sider, kommunens eget tapstall)
6. Skriv og send 15 målrettede salgsbrev til kommune-VA
7. Bygg MERD-MIK hydrofonrigg i kar/bøtte
8. Test enkel terskelbasert anomalideteksjon på kjente lydsignaturer
9. Hent Fiskeridirektoratets rømmings-/avviksregister, finn 10 relevante oppdrettsselskap
10. Bygg kostnadsregneark "hva kostet siste rømming deg"
11. Send direkte kontakt til 10 oppdrettsselskap med dokumentert nylig hendelse
12. Sett opp enkelt manuelt board (Notion/Airtable) for prosjektsporing
13. Lukk minst 1 LYTTEPOST-pilotavtale (signert, betalt)
14. Finn velvillig oppdretter for MERD-MIK feltrigg-tillatelse
15. Bygg LoRaWAN/batteri-oppgradering for LYTTEPOST-noder
16. Lever LYTTEPOST 14-dagers pilotrapport med kart
17. Bygg feltrigg for MERD-MIK med batteri+solcelle
18. Kjør MERD-MIK feltpilot, valider mot kamera/dykker
19. Skriv white-space-notat for HVAL-PROP til eget bruk
20. Bygg ANBUDSRADAR scraper mot Doffin for 2-3 bransjer
21. Send gratis "anbud du gikk glipp av"-rapport til 20 prospekter
22. Konverter minst 5 ANBUDSRADAR-prospekter til betalende
23. Bygg GitHub Painkiller Radar-pipeline for én nisje (CI/CD eller data pipelines)
24. Kjør og selg 3-5 GitHub Painkiller-rapporter
25. Dokumenter LYTTEPOST- og MERD-MIK-funn som strukturerte proof-cards (manuelt)
26. Bygg 3D-printet HVAL-PROP-blad og test mot referanseprop med dB-måler
27. Iterer HVAL-PROP-geometri minst 3 ganger med faktisk måling
28. Undersøk droneoperatørsertifisering (A1/A2/A3) for Clean-Room Drone V2-tjenesten — kun research, ingen investering ennå
29. Vurder PicoPure BATCH-25 bordmodell og research tredjeparts testlab-kostnad
30. Kjør 100-dagers brutal gjennomgang: drep alt uten betalende kunde eller signert pilot

---

## E. FØRSTE 10 SALGBARE ASSETS

1. LYTTEPOST lekkasjekost-kalkulator (ett-sider per kommune)
2. LYTTEPOST 14-dagers pilotrapport-mal (med kart)
3. MERD-MIK kostnadsregneark "hva kostet siste rømming deg"
4. MERD-MIK 72-timers nettstatus-pilotforslag
5. ANBUDSRADAR gratis "anbud du gikk glipp av siste 90 dager"-rapport
6. GitHub Painkiller Radar gratis 3-siders teaser + betalt fullrapport
7. HVAL-PROP dataark med før/etter-dB-kurve
8. Patent White-Space-notat (HVAL-PROP-domenet, anonymisert som eksempel)
9. PicoPure BATCH-25 uavhengig testrapport + beredskapsbrosjyre
10. Clean-Room Drone V2 eksempel-inspeksjonsrapport fra selvfinansiert demo

---

## F. Hvilket prosjekt bør bygges først?
**LYTTEPOST.** Lavest teknisk risiko av de to toppscorerne, raskeste vei til en uavhengig verifiserbar pilot (gravefunn er et binært, udiskutabelt bevis), og et marked (kommunal VA) som er budsjettert og ikke konjunkturutsatt. MERD-MIK bygges parallelt, men LYTTEPOST er ledende fordi vannrørmiljøet er enklere å validere i enn saltvann/biofouling.

## G. Hvilket prosjekt bør selges først?
**GitHub Painkiller Radar.** Ingen hardware, ingen regulatorisk hindring, ingen sertifisering — kan faktureres innen dager, ikke uker. Brukes som kontantstrøm og som bevis på Alex sin analysemetodikk mens LYTTEPOST/MERD-MIK fortsatt bygger feltbevis.

## H. Hvilket prosjekt bør patenteres først?
**HVAL-PROP.** Det er det eneste sporet med reell, forskningsbasert patenterbar kjerne (akustikk/aerodynamikk-geometri) og høyest mulig lisensieringsverdi hvis det lykkes. Patentsøknad skal komme FØR noe vises eksternt til integratorer.

## I. Hvilket prosjekt bør ikke røres før mer bevis finnes?
**Clean-Room Drone V2.** Lavest score i topp 10 (31/100), avhenger direkte av at HVAL-PROP først beviser akustisk fordel, krever sertifisering/forsikring/kapital før første krone, og konkurrerer mot DJI uten egen voll i mellomtiden. Rør det ikke før HVAL-PROP har et validert dB-tall og LYTTEPOST/MERD-MIK gir egen kontantstrøm til å finansiere det.
