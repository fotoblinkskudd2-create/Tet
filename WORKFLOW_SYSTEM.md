# Multidisiplinært arbeidsflyt-system

Et integrert system for å drive design, kunst, aksjeanalyse/verdiinvestering,
jakt, musikk- og videoskaping og skriving i parallelle, gjentakende sykluser
uten at noe felt blir neglisjert. Systemet har tre lag — daglig, ukentlig og
månedlig — og en praktisk CLI (`python app.py --workflow`) som gjør planen
kjørbar i stedet for bare en idé på papir.

## 1. Prinsippet: ett hoveddyp om dagen, alle felt rører hver uke

Med syv disipliner og syv dager i uken får hvert felt **én dedikert
dypdykk-dag** (2-4 timer sammenhengende arbeid) pluss en kort daglig
forskningsvane (20-45 minutter) som holder de andre feltene varme resten av
uken. Søndag er limet: design får sin dag, og samtidig oppsummeres og
planlegges hele uken.

```
Mandag    -> Aksjer & verdiinvestering   (dypdykk + daglig markedsrutine)
Tirsdag   -> Kunst                       (atelierøkt + research)
Onsdag    -> Musikk                      (studiotid + research)
Torsdag   -> Video                       (produksjon/redigering + research)
Fredag    -> Forfatter & skriving        (skriveøkt + research)
Lørdag    -> Jakt                        (feltdag/forberedelse + research)
Søndag    -> Design + ukentlig review    (designarbeid + tverrfaglig sync)
```

Kjør `python app.py --workflow --day <dag>` for dagens plan, eller
`python app.py --workflow` for dagens dato automatisk. `--week` gir hele
ukesoversikten, `--monthly` gir den månedlige synteserunden.

## 2. Daglig struktur (forslag til timeplan)

| Tid           | Blokk                          | Innhold |
|---------------|----------------------------------|---------|
| 06:30-07:00   | Mikro-research (alle dager)      | 20-30 min på dagens hoved-disiplin, se research-rutiner nedenfor |
| 07:00-09:30   | Dypdykk-blokk                    | Dagens hoveddisiplin: produksjon, analyse eller feltarbeid |
| Dagtid         | Jobb/forpliktelser                | (fleksibelt rundt egen kalender) |
| 17:00-17:20   | Loggføring                        | 3 linjer: hva ble gjort, hva ble lært, én tverrfaglig idé |
| 20:00-20:30   | Lett påfyll i et "off-felt"       | Lytt/les/se noe i en annen disiplin enn dagens — holder feltene varme |

Loggføringen er den viktigste vanen: tre linjer per dag er nok til at
søndagens review har noe konkret å jobbe med, og at tverrfaglige idéer ikke
forsvinner.

## 3. Research-prosess per disiplin

### Aksjer & verdiinvestering (mandag, daglig morgenrutine)
- Sjekk kvartalsrapporter og innsidehandel for overvåkningslisten.
- Les én årsrapport eller analytikernotat i dybden per uke.
- Oppdater verdivurdering (DCF/multipler) for én kandidat.
- Skann makro- og sektornyheter relevante for porteføljen.
- **Verktøy:** RSS/nyhetsvarsler for porteføljeselskaper, et enkelt regneark
  eller Notion-database for overvåkningsliste og verdivurderinger.

### Kunst (tirsdag)
- Bla gjennom 2-3 kunstplattformer/gallerier for trender.
- Lagre 5 visuelle referanser i et moodboard.
- Studer én kunstners teknikk i 10-15 minutter.
- **Verktøy:** Et delt moodboard (Pinterest/Are.na/lokal mappe) som også
  brukes av musikk- og videoprosjektene for paletter og stemning.

### Musikk (onsdag)
- Lytt aktivt til 2 nye artister utenfor komfortsonen.
- Analyser produksjonsteknikken i én favorittlåt.
- Research samples/plugins som matcher ukens stemning.
- **Verktøy:** En "idébank"-spilleliste eller voice-memo-mappe for raske
  melodiideer fanget gjennom uken.

### Video (torsdag)
- Se 2 referansevideoer for klipperytme og fargegrading.
- Research kamera-/objektiv-/VFX-trender.
- Bygg en shotlist/storyboard for neste opptak.
- **Verktøy:** Delt shotlist-mal, temp-track-mappe som henter lyd fra
  onsdagens musikksesjon.

### Forfatter & skriving (fredag)
- Les 20-30 sider i en bok innenfor eller utenfor egen genre.
- Research et faktaspørsmål/miljø som dukket opp i manuset.
- Følg én forfatter/litteraturtidsskrift for samtidsdebatt.
- **Verktøy:** Et løpende "materialdokument" der observasjoner fra jakt,
  marked og kunst limes inn råtekst, klare til å bli scener eller bilder.

### Jakt (lørdag)
- Sjekk vær, vind og månefase for jaktterrenget.
- Følg viltrapporter/fellingsstatistikk og forvaltningsnytt.
- Les om en jaktteknikk, art eller utstyrstest.
- **Verktøy:** Feltlogg (app eller notatbok) for spor, lys og lydobservasjoner
  — rå sanselig materiale til kunst, musikk og skriving.

### Design (søndag, formiddag)
- Skann designtrender (typografi, produktlanseringer, portfolioer).
- **Verktøy:** Samme moodboard-system som kunst, men med fokus på
  UI/grafisk/produkt-referanser.

## 4. Den integrerte arbeidsflyten

```
            ┌───────────────────────────────────────────────┐
            │              SØNDAG: REVIEW + DESIGN             │
            │  Samler ukens logger -> velger 1-2 tverrfaglige  │
            │  idéer -> setter neste ukes 3 prioriteringer     │
            └───────────────────────────────────────────────┘
                        ▲                          │
                        │                          ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │   JAKT      │──▶│  SKRIVING   │──▶│   AKSJER    │
   │ (lørdag)    │   │  (fredag)   │   │  (mandag)   │
   │ sanseinntrykk│   │ tekst/karakter│  │ narrativer  │
   └─────────────┘   └─────────────┘   └─────────────┘
                        ▲                          │
                        │                          ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │   VIDEO     │◀──│   MUSIKK    │◀──│   KUNST     │
   │ (torsdag)   │   │  (onsdag)   │   │  (tirsdag)  │
   │ visuell stil│   │ lyd/motiv   │   │ palett/mood │
   └─────────────┘   └─────────────┘   └─────────────┘
```

Idéer flyter med klokken: kunstens palett farger musikkens albumcover og
videoens fargegrading; videoens visuelle stil blir scenebeskrivelser i
manuset; skrivingens tekstutkast blir sangtekster; jaktens sanseinntrykk
gir materiale til skriving, kunst og lyddesign; markedets bedriftshistorier
gir dramaturgi til skriving. Søndagens review er navet som fanger opp disse
koblingene bevisst, i stedet for å la dem skje tilfeldig.

## 5. Månedlig syntese

Siste helg i måneden, i tillegg til den vanlige søndagsrutinen, kjøres en
større gjennomgang (`python app.py --monthly`):

1. Porteføljegjennomgang: rebalanser, sjekk avkastning mot caset for hver
   posisjon, luk ut investeringer der avhandlingen ikke holder lenger.
2. Kunstarkiv: samle månedens beste arbeid i en portefølje-mappe.
3. Musikk/video: status på pågående verk, sett en konkret utgivelsesdato.
4. Manusframdrift: tell ord/sider, juster neste måneds skrivemål.
5. Jaktsesong og forvaltning: oppdater feltloggen, sjekk sesonger/kvoter.
6. Tverrfaglig idébank: velg 1-2 idéer fra ukentlige notater å utvikle videre.
7. Sett tre fokusmål per disiplin for neste måned.

## 6. Praktisk implementering

- **CLI-verktøy (i dette repoet):** `app.py` har nå et `--workflow`-system
  (`--workflow [--day <dag>]`, `--week`, `--monthly`) som gir deg dagens,
  ukens eller månedens plan direkte i terminalen eller som en iOS
  Shortcuts/widget-snutt.
- **Loggføring:** ett delt dokument (Notion/Obsidian/tekstfil) med en seksjon
  per disiplin og en daglig 3-linjers logg.
- **Moodboard:** ett delt visuelt arkiv som kunst, design, musikk og video
  alle henter fra og bidrar til.
- **Materialdokument:** ett løpende dokument der jakt-, marked- og
  kunstobservasjoner limes inn som råtekst for skriving og sangtekster.
- **Ukentlig review (søndag):** 30-45 minutter for å lese ukens logger, velge
  tverrfaglige idéer, og sette neste ukes tre prioriteringer per felt.
