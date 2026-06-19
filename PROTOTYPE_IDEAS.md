# Prototype-idéer: Gøy og engasjerende interaktivt innhold

Tre konkrete idéer som bygger videre på den lekne ånden i **Tet Problem Solver** –
små, glade verktøy med en uventet vri. Alle er gjennomførbare med beskjedne ressurser.

---

## Idé 1

<idea_name>Anagram Arena</idea_name>

<description>
Et lynraskt sanntids-anagramduellspill i terminalen (og senere på web) hvor du
kjemper mot klokka – eller en venn – om å stokke om bokstaver til ekte ord.
Bygger direkte på anagram-motoren som allerede finnes i Tet, men gjør den om fra
et verktøy til et spill med poeng, combo-streker og en stigende vanskelighetskurve.
</description>

<target_audience>
Ordglade folk, pendlere som vil ha en 2-minutters hjernetrim, og lærere som
trenger en gøy språkøvelse for elever (10 år og oppover).
</target_audience>

<core_mechanics>
Spillet kaster ut en bokstavsalat; du skriver så mange gyldige ord som mulig før
tiden renner ut. Lange ord gir eksponentielt flere poeng, og å løse uten å bomme
bygger en "combo-glød" som dobler poengsummen. Det gøye ligger i flow-følelsen:
korte runder, umiddelbar belønningslyd/tekst, og en highscore som frister til
"én runde til".
</core_mechanics>

<implementation>
1. Gjenbruk anagram-/ordlogikken fra `app.py` som validerings-backend.
2. Legg til en ordliste (f.eks. norsk + engelsk fra åpne kilder som `dwyl/english-words`).
3. Bygg runde-loop i Python med `time` for nedtelling og `rich` for fargerik TUI.
4. Lagre highscore i en enkel JSON-fil.
5. Senere: pakk om til web med Flask + en liten vanilla-JS-frontend (repoet har allerede `frontend/` og `backend/`).
</implementation>

<timeline>
Spillbar terminal-prototype: 1–2 dager. Web-versjon: +2–3 dager.
</timeline>

<fun_factor>
Korte, intense runder utløser "bare én gang til"-effekten. Combo-mekanikken og
highscore gir tydelig mestring og konkurranse, og siden ordene er ekte lærer du
faktisk noe mens du spiller.
</fun_factor>

---

## Idé 2

<idea_name>Mood Mixtape</idea_name>

<description>
En interaktiv "humør-til-kreativt-prompt"-maskin som tar en følelse eller et øyeblikk
du skriver inn og spytter ut en ferdig, copy-paste-klar kreativ brief – for foto,
musikk, eller dikt. Den utvider Tets eksisterende `--prompt`-modus til en leken,
samtaledrevet opplevelse med tilfeldige "vri-kort" som gjør hvert resultat overraskende.
</description>

<target_audience>
Hobbyskapere, content-folk, og alle med skrivesperre som trenger en gnist – spesielt
de som lager innhold på mobil (iOS web), slik Tet allerede sikter mot.
</target_audience>

<core_mechanics>
Du skriver et stikkord ("nostalgisk søndag"), velger medium, og maskinen bygger en
strukturert brief. En "Shuffle"-knapp kaster inn et tilfeldig kreativt tvist
(uvanlig kameravinkel, et instrument du ikke valgte, en poetisk form). Det gøye er
serendipiteten – du blir gladelig overrasket og inspirert i stedet for å stirre på
et blankt ark.
</core_mechanics>

<implementation>
1. Bygg videre på prompt-generatoren i `app.py` (`--prompt --medium ...`).
2. Lag kuraterte "vri-kort"-tabeller per medium (kamera, instrumentering, diktform).
3. Wrap i en liten Flask-app med ett tekstfelt og to knapper ("Lag" / "Shuffle").
4. Mobilvennlig CSS (store knapper, ett-kolonne-layout) for iOS web.
5. "Kopier"-knapp som legger briefen rett på utklippstavla.
</implementation>

<timeline>
CLI-utvidelse: 0,5 dag. Mobilvennlig web-prototype: 1,5–2 dager.
</timeline>

<fun_factor>
Tilfeldighetselementet gjør verktøyet til en lekekamerat, ikke et skjema. Hver
trykk gir et nytt, delbart resultat – lavt friksjon, høy "wow", og umiddelbar nytte.
</fun_factor>

---

## Idé 3

<idea_name>Math Boss Battle</idea_name>

<description>
Et tekstbasert rollespill der du beseirer fargerike "monstre" ved å løse
regnestykker – jo raskere og riktigere, desto mer skade. Det gjør Tets
aritmetikk-løser om til et eventyr med nivåer, helsestolper og latterlige bosser
som "Brøk-Drage" og "Prosent-Spøkelset".
</description>

<target_audience>
Barn og unge (8–14) som øver hoderegning, foreldre/lærere som vil ha mengdetrening
forkledd som spill, og nostalgiske voksne som digger retro-tekst-RPG.
</target_audience>

<core_mechanics>
Hver kamp er en serie regnestykker; riktig svar gir angrep, feil lar monsteret slå
tilbake. Vanskelighetsgraden skaleres med nivå, og bosser har "spesialangrep"
(tidspress, lengre uttrykk). Det gøye er fortellingen + progresjon: du grinder ikke
gangetabellen, du redder kongeriket.
</core_mechanics>

<implementation>
1. Gjenbruk den trygge aritmetikk-evalueringen fra `app.py` til å generere og sjekke svar.
2. Lag en monster-/boss-datastruktur (HP, navn, ASCII-art, oppgavetype).
3. Bygg kamp-loop med `rich` for helsestolper, farger og animert tekst i terminalen.
4. Lagre fremgang (nivå, beseirede bosser) i JSON.
5. Senere: web-port med enkle sprites og lyd.
</implementation>

<timeline>
Spillbar terminal-prototype med 1 boss: 2 dager. Fullt nivåsystem: +3–4 dager.
</timeline>

<fun_factor>
Fortelling og progresjon forvandler kjedelig drilling til et eventyr. ASCII-monstre
og absurde boss-navn gir humor, og helsestolpene gir spenning til hvert regnestykke.
</fun_factor>

---

# Anbefaling: **Anagram Arena**

Anagram Arena er den beste første prototypen fordi den gir mest moro per investert
time: motoren finnes allerede i Tet, reglene forklarer seg selv på 5 sekunder, og
den treffer både konkurranse- og læringslyst. Lav risiko, høy gjenspillingsverdi.

## Konkrete første steg
1. **Isolér ordmotoren:** trekk anagram-/ordvalideringen ut av `app.py` til en egen
   funksjon `is_valid_word(word)` som spillet kan kalle.
2. **Skaff en ordliste:** last ned en åpen norsk + engelsk ordliste, last inn i et
   `set` for O(1)-oppslag.
3. **Bygg kjerne-loopen:** generer en bokstavpott (7–9 bokstaver), start 60-sekunders
   nedtelling, ta imot ord, valider, gi poeng.
4. **Poeng + combo:** lengde-vektet score, combo-multiplikator ved feilfrie svar.
5. **Highscore:** skriv beste resultat til `highscore.json` og vis det ved oppstart.

## Ressurser som trengs
- Python 3 (allerede i bruk i repoet).
- `rich`-biblioteket for fargerik terminal-UI (`pip install rich`).
- En åpen ordliste (f.eks. `dwyl/english-words`, NB Ordbanken for norsk).
- ~1–2 dager utviklingstid for en spillbar prototype.

## Potensielle utfordringer og løsninger
| Utfordring | Løsning |
|---|---|
| Ordlister inneholder rare/forkortede ord | Filtrer på lengde (≥3) og fjern egennavn/forkortelser ved innlasting |
| Norsk + engelsk blandet føles inkonsekvent | La spilleren velge språk ved oppstart; én ordliste per økt |
| Nedtelling blokkerer input i terminalen | Bruk en non-blocking input-tråd eller `prompt_toolkit` for sanntidsklokke |
| Juks ved å lime inn lange ord | Krev at hver bokstav finnes i potten med riktig antall |

## Mulige utvidelser etter første prototype
- **Web-versjon** med Flask-backend (gjenbruk `backend/`) og delbar highscore.
- **Daglig pott:** alle får samme bokstaver per dag, à la Wordle, for delbare resultater.
- **Multiplayer-duell:** to spillere, samme pott, høyest poeng vinner.
- **Bonus-mekanikker:** sjeldne bokstaver gir multiplikator, "tema-runder" (kun dyr/mat).
- **Hint-system** som låner den oppmuntrende brainstorm-tonen fra Tet når du står fast.
