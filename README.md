# Tet Problem Solver

A tiny, joyful command-line helper that solves small puzzles like arithmetic and classic anagrams. When it cannot solve a prompt directly, it offers upbeat brainstorming steps to keep the momentum going.

## Usage

Run the solver with your problem statement:

```bash
python app.py "2 + 3 * 4"
python app.py "Unscramble an anagram of listen"
python app.py "How do I get motivated for chores?"
```

Each response includes a playful banner, a concise answer, and encouraging bullet points whenever brainstorming is needed.

## Build creative prompts for iOS web

Use prompt mode when you want a ready-to-paste creative brief for photos, video, music, art, or poetry. The builder keeps instructions short and mobile-friendly for iOS web inputs:

```bash
python app.py --prompt --medium photo "misty forest boardwalk at dawn"
python app.py --prompt --medium music "uplifting synthwave for launch video"
python app.py --prompt "poem about late-summer rain in the city"  # medium auto-detected
```

The prompt generator auto-detects mediums when possible and adds concise delivery notes for camera, composition, pacing, instrumentation, or poetic form.

## 200 nye harde problemer for Claude Code (norsk)

(Norsk versjon – vibes coding for problemløsning)

Her er 200 utfordrende problemer på tvers av algoritmer, matematikk, AI, systemdesign og mer. Hvert problem er hardt av en grunn – og Claude Code kan knekke dem med presisjon.

---

### Algoritmer & kompleksitet (30)

1. Traveling Salesman med 1000 byer – Finn den korteste runden som besøker hver by nøyaktig én gang.
   - Hvorfor vanskelig: NP-hardt; 1000! mulige ruter. Trenger heuristikk som simulated annealing eller genetisk algoritme.
2. Boolsk tilfredsstillelse (3-SAT) med 10⁵ variabler – Er formelen oppfyllbar?
   - Hvorfor vanskelig: Eksponensiell worst-case; trenger CDCL-algoritme med læring.
3. Ryggsekk med 10⁴ gjenstander og kapasitet 10⁶ – Maksimer verdien uten å overskride vekt.
   - Hvorfor vanskelig: Pseudo-polynomisk DP er for stor; trenger branch-and-bound eller approksimasjon.
4. Fargelegging av 5000 noders graf med færrest mulig farger – Ingen naboer har samme farge.
   - Hvorfor vanskelig: NP-hardt; greedy gir ikke optimalt; trenger DSATUR eller branch-and-bound.
5. Maksimal klike i en graf med 2000 noder – Finn den største fullstendige delgrafen.
   - Hvorfor vanskelig: NP-hardt; branch-and-bound med fargeleggingsgrenser.
6. Vertex Cover i 10⁶ kanter graf – Finn minste sett noder som dekker alle kanter.
   - Hvorfor vanskelig: NP-hardt; trenger kernelisering og faste-parameter algoritmer.
7. Delmengdesum med 10⁵ heltall – Finn en delmengde som summerer til nøyaktig T.
   - Hvorfor vanskelig: NP-komplett; dynamisk programmering eksploderer.
8. Bøttepakking med 10⁴ gjenstander – Pakk i færrest mulig beholdere med kapasitet C.
   - Hvorfor vanskelig: NP-hardt; bin-packing er vanskelig å optimalisere eksakt.
9. Jobbscheduling med 20 jobber og 10 maskiner – Minimér makespan med presedensbetingelser.
   - Hvorfor vanskelig: Sterkt NP-hardt; kombinatorisk eksplosjon.
10. Kvadratisk tildelingsproblem for 30 fasiliteter – Plasser fasiliteter på lokasjoner for å minimere transportkostnad.
    - Hvorfor vanskelig: NP-hardt; parvis interaksjon gjør det ekstra vanskelig.
11. Maksimalt kutt i 1000 noders graf – Del nodene i to sett for å maksimere kanter på tvers.
    - Hvorfor vanskelig: NP-hardt; Goemans-Williamson SDP gir approksimasjon, men eksakt krever branch-and-bound.
12. Steiner-tre med 100 terminaler i graf med 10⁴ noder – Finn minimalt tre som forbinder terminalene.
    - Hvorfor vanskelig: NP-hardt; dynamisk programmering over delmengder.
13. Sett-dekning med 2000 sett og 1000 elementer – Finn minste samling sett som dekker alle elementer.
    - Hvorfor vanskelig: NP-hardt; greedy gir log-faktor approksimasjon, men eksakt krever branch.
14. 3D-matching i hypergraf – Finn en perfekt matchning i en 3-partitt hypergraf.
    - Hvorfor vanskelig: NP-komplett; generalisering av bipartitt matching.
15. Eksakt dekning med 5000 delmengder – Finn en subkolleksjon som dekker hvert element nøyaktig én gang.
    - Hvorfor vanskelig: NP-komplett; Algorithm X med Dancing Links.
16. Lengste vei i en graf med 1000 noder – Finn den lengste enkle veien.
    - Hvorfor vanskelig: NP-hardt; motsatt av korteste vei, og mye vanskeligere.
17. Feedback Vertex Set i 5000 noders graf – Fjern færrest noder for å gjøre grafen asyklisk.
    - Hvorfor vanskelig: NP-hardt; kernelisering og branching.
18. Klike-dekning – Partisjoner nodene i færrest mulig kliker.
    - Hvorfor vanskelig: NP-hardt; komplement av graf farging.
19. Graf-isomorfi for to 2000 noders grafer – Er de strukturelt like?
    - Hvorfor vanskelig: Ikke kjent P eller NP; Weisfeiler-Lehman er praktisk, men eksakt er tungt.
20. Hamilton-syklus i 300 noders graf – Finn en syklus som besøker hver node én gang.
    - Hvorfor vanskelig: NP-komplett; DFS med pruning.
21. Korteste vei med negative sykluser – Detekter og håndter negative sykluser i en graf med 10⁵ kanter.
    - Hvorfor vanskelig: Bellman-Ford detekterer, men finne syklusen er vanskelig.
22. Maksimal flyt i 10⁶ noders nettverk – Bruk Dinic eller Push-Relabel for stor skala.
    - Hvorfor vanskelig: Ytelsesoptimalisering; håndtering av store grafer.
23. Minste snitt i urettet vektet graf – Globalt minste snitt (Stoer-Wagner).
    - Hvorfor vanskelig: Algoritmen krever fasevis sammenslåing.
24. Topologisk sortering av 10⁷ noder DAG – Kahn eller DFS.
    - Hvorfor vanskelig: Minnebruk; syklusdeteksjon.
25. Diameter av en graf med 10⁵ noder – Eksentrisitet for alle noder.
    - Hvorfor vanskelig: Trenger BFS fra alle noder, O(n²) tid.
26. Planaritetstest for 5000 noders graf – Er grafen planær?
    - Hvorfor vanskelig: Boyer-Myrvold algoritme er kompleks.
27. Maksimal matching i bipartitt graf med 10⁶ noder – Hopcroft-Karp.
    - Hvorfor vanskelig: Implementasjon av BFS/DFS lagvis.
28. Tildelingsproblem for 1000×1000 matrise – Hungarian algoritme.
    - Hvorfor vanskelig: O(n³) tid; implementasjon med potensialer.
29. Eulers krets i rettet graf med 10⁵ kanter – Hierholzer med stack.
    - Hvorfor vanskelig: Gradbetingelser; fjerning av kanter.
30. Transitiv lukking av 2000 noders graf – Warshall med bitsett-optimalisering.
    - Hvorfor vanskelig: O(n³) tid; minne for store grafer.

---

### Dynamisk programmering (25)

1. Lengste felles delsekvens av to 10⁶ tegn strenger – Hirschberg for plassbesparelse.
   - Hvorfor vanskelig: O(n²) tid; trenger divide-and-conquer for minne.
2. Redigeringsavstand (Levenshtein) for strenger på 10⁵ tegn – DP med rullerende array.
   - Hvorfor vanskelig: O(n²) tid; stor minnebruk.
3. Matrisekjede multiplikasjon med 500 matriser – Finn optimal parentisering.
   - Hvorfor vanskelig: O(n³) DP; finne faktisk rekkefølge.
4. Myntproblem med 10⁶ beløp og 200 mynttyper – Minimum antall mynter.
   - Hvorfor vanskelig: DP tabell stor; unbounded knapsack.
5. Lengste stigende delsekvens i array på 10⁷ elementer – Patience sorting O(n log n).
   - Hvorfor vanskelig: Binærsøk på haler; implementasjonsdetaljer.
6. Maksimal delsum i sirkulært array – Kombiner Kadane med minste delsum.
   - Hvorfor vanskelig: Håndtere wrapping; edge cases.
7. 0/1-ryggsekk med 20 000 gjenstander og kapasitet 500 000 – Romoptimalisering.
   - Hvorfor vanskelig: DP vektor plass; unngå gjenbruk.
8. Palindrom-partisjonering – minimer kutt for 10 000 tegn streng – O(n²) med prekomp.
   - Hvorfor vanskelig: Beregne palindromer raskt.
9. Orddeling – sjekk om streng kan deles i ord fra ordbok på 100 000 ord – DP med trie.
   - Hvorfor vanskelig: Unngå O(n²) ved å bruke trie.
10. Eggkasting – 100 egg og 10 000 etasjer – Finn kritisk etasje med færrest kast.
    - Hvorfor vanskelig: DP med binærsøk-optimalisering.
11. Maksimal profitt ved jobbscheduling – 10⁵ jobber med start, slutt, profitt – Sorter og binærsøk.
    - Hvorfor vanskelig: DP med binærsøk; håndtere overlapp.
12. Wildcard-matching (? og *) på strenger 5000 tegn – DP med backtracking.
    - Hvorfor vanskelig: Stjerne håndtering; greedy for *.
13. Regulære uttrykk (., *) – full match – DP med memoization.
    - Hvorfor vanskelig: Komplekse overganger; rekursjon.
14. Tekstjustering med minst mulig ujevnhet – DP over ord.
    - Hvorfor vanskelig: Straffefunksjon; linjeskift.
15. Burst Balloons – maks mynter for 500 ballonger – O(n³) divide-and-conquer DP.
    - Hvorfor vanskelig: Rekkefølge; DP over intervall.
16. Dungeon Game – minimum starthelse – DP fra exit.
    - Hvorfor vanskelig: Håndtere negative helseverdier.
17. Dekodingsmåter med * (wildcard) – Telle måter å dekode tallstreng med *.
    - Hvorfor vanskelig: Modulo; komplekse overganger.
18. Minimum banesum i 2000×2000 rutenett med hindre – DP med romoptimalisering.
    - Hvorfor vanskelig: Hindringer; kun ned og høyre.
19. Største rektangel i histogram – 10⁶ søyler – Monoton stack.
    - Hvorfor vanskelig: Håndtere like høyder; stack-operasjoner.
20. Antall binære søketrær med n noder – n=10⁵ – Catalan modulo.
    - Hvorfor vanskelig: Stort n; modulo; DP unødvendig, formel.
21. Største kvadrat av 1-ere i binær 5000×5000 matrise – DP med side lengde.
    - Hvorfor vanskelig: Matrisestørrelse; minne.
22. Kakao-drink (minimum helse for å nå mål) – Variant av Dungeon Game.
    - Hvorfor vanskelig: To-dimensjonal DP.
23. Regn ut antall måter å nå (m,n) fra (0,0) med hindre – DP med kombinatorikk.
    - Hvorfor vanskelig: Modulo; store tall.
24. Største produkt-delarray for 10⁶ tall (med negative) – Kadane med min/max.
    - Hvorfor vanskelig: Håndtere null og negative.
25. Kappestang i biter for maksimal pris – 10⁵ lengder – DP for unbounded.
    - Hvorfor vanskelig: Optimal deling.

---

### Grafter & nettverk (20)

1. Finn alle broer i 2·10⁶ kanters graf – DFS med low-link.
   - Hvorfor vanskelig: Rekursjonsdybde; store grafer.
2. Detekter negative sykluser i 10⁵ kanters graf – Bellman-Ford med tidlig stopp.
   - Hvorfor vanskelig: Finne syklusen, ikke bare detektere.
3. Maksimal flyt (Dinic) i 10⁶ noders graf – Nivågraf; blokkerende flyt.
   - Hvorfor vanskelig: Ytelse; skalering.
4. Sterkt sammenhengende komponenter i 10⁷ noders digraf – Kosaraju eller Tarjan.
   - Hvorfor vanskelig: To passeringer; stack-dybde.
5. Sjekk om graf er bipartitt – 2·10⁶ noder – BFS farging.
   - Hvorfor vanskelig: Håndtere store sammenhengende komponenter.
6. Minimalt spenntre (Kruskal) med 10⁶ kanter – Sortering; union-find.
   - Hvorfor vanskelig: Sorteringsytelse; union-find optimalisering.
7. Alle-par korteste vei (Floyd-Warshall) for 2000 noder – O(n³) tid/plass.
   - Hvorfor vanskelig: Minnebruk 4M; optimaliser med vektorer.
8. Topologisk sortering av 10⁷ DAG-noder – Kahn med kø.
   - Hvorfor vanskelig: Syklusdeteksjon; parallellisering.
9. Graf-diameter eksakt – BFS fra alle noder for 10⁵ noder – O(n²) tid.
   - Hvorfor vanskelig: Umulig for store; trenger approksimasjon.
10. Minste snitt i urettet graf (Stoer-Wagner) for 10⁴ noder – Fase-algoritme.
    - Hvorfor vanskelig: Sammenslåing av noder; implementasjon.
11. PageRank på 10⁷ noder med teleportering – Sparse matrise-vektor multiplikasjon.
    - Hvorfor vanskelig: Konvergens; damping faktor.
12. Artikulasjonspunkter i 10⁶ noders graf – DFS med low.
    - Hvorfor vanskelig: Rot-spesialtilfelle.
13. Planaritetstest (Boyer-Myrvold) – For 5000 noder.
    - Hvorfor vanskelig: Svært kompleks algoritme; embed.
14. Maksimal matching i generell graf (Blossom-algoritme) – For 1000 noder.
    - Hvorfor vanskelig: Blomster-kontraksjon; implementasjonsdetaljer.
15. Tildelingsproblem (Hungarian) for 2000×2000 – O(n³).
    - Hvorfor vanskelig: Numerisk stabilitet; potensialer.
16. Eulers krets i urettet graf – Hierholzer med iterativ stack.
    - Hvorfor vanskelig: Grad-telling; fjerning av kanter.
17. Transitiv lukking for 5000 noder med bitsett – Bruk 64-bit ord.
    - Hvorfor vanskelig: Minne og tid.
18. Maksimal uavhengig mengde i tre – DP – Enkelt for tre, men for generell graf NP-hardt.
    - Hvorfor vanskelig: For tre er det DP, men treet må være stort (10⁶).
19. Grafkjerne for likhet mellom to grafer – R-convolution.
    - Hvorfor vanskelig: Isomorfi-delproblemet.
20. Minimum vertex cover i bipartitt graf (König) – Kombiner matching.
    - Hvorfor vanskelig: Konstruksjon av cover fra matching.

---

### Strengalgoritmer (15)

1. KMP for mønster i 10⁸ tegn tekst – Lineær tid, men implementasjonsfeil.
   - Hvorfor vanskelig: Feilfunksjon; kanttilfeller.
2. Suffiks-tre for 10⁷ streng (Ukkonen) – Online konstruksjon; suffiks-linker.
   - Hvorfor vanskelig: Aktivt punkt; regel 3.
3. Lengste palindrom (Manacher) – 10⁶ tegn – Lineær; symmetri.
   - Hvorfor vanskelig: Indeksering; senterutvidelse.
4. Korteste palindrom ved å legge til foran – KMP på reversert.
   - Hvorfor vanskelig: Forstå KMP for palindrom-søk.
5. Z-funksjon for mønstersøk – Z-array; intervall-basert.
   - Hvorfor vanskelig: Rullende vinduer.
6. Rabin-Karp med rullende hash for 10⁵ mønstre – Collisjon; modulus valg.
   - Hvorfor vanskelig: Hash-kollisjon; garanti.
7. Aho-Corasick for 10⁴ mønstre – Automat; failure-link; output-link.
   - Hvorfor vanskelig: Bygging av automaten; kompleksitet.
8. Burrows-Wheeler transform for kompresjon – Sortering av rotasjoner.
   - Hvorfor vanskelig: Invers transform; indeksering.
9. Levenshtein-automat for approksimativt søk – Konstruksjon av automaten.
   - Hvorfor vanskelig: Tilstander; overganger.
10. Lengste felles delstreng for to 10⁶ strenger – Suffiks-array + LCP.
    - Hvorfor vanskelig: Suffiks-array konstruksjon; LCP.
11. Anagram-sjekk for Unicode-strenger – Normalisering; store tegnsett.
    - Hvorfor vanskelig: Unicode; casing.
12. Minste rotasjon av streng (Booth) – Lineær; duval.
    - Hvorfor vanskelig: Implementasjon av algoritmen.
13. Kjøretidsenkoding (RLE) for binærfiler – Effektiv I/O.
    - Hvorfor vanskelig: Binære data; streaming.
14. Stavekontroll med Levenshtein og ordbok – BK-tre eller automata.
    - Hvorfor vanskelig: Bygging av indeks; søk med toleranse.
15. Plagiatdeteksjon med MinHash – Shingling; Jaccard.
    - Hvorfor vanskelig: Velge shingle-størrelse; hash-funksjoner.

---

### Tallteori & kryptografi (20)

1. RSA med 4096-bit nøkler – Generering av store primtall; modulær eksponentiering.
   - Hvorfor vanskelig: Store tall; Miller-Rabin; Kinesisk restteorem for dekryptering.
2. Primitiv rot modulo 100-sifret primtall – Faktorisering av p-1.
   - Hvorfor vanskelig: Finne faktorer; teste kandidater.
3. Diskret Fourier-transform over endelige legemer (NTT) – Finne primitive enhetsrøtter.
   - Hvorfor vanskelig: Modulær aritmetikk; bit-reversering.
4. Miller-Rabin for 2048-bit tall – Deterministiske baser; eksponentiering.
   - Hvorfor vanskelig: Korrekt valg av baser; tid.
5. Kvadratisk såld for faktorisering av 300-bit tall – Glatthet; lineær algebra over GF(2).
   - Hvorfor vanskelig: Implementasjon av såld; matriseløsning.
6. Binær GCD for 10 000-sifrede tall – Unngå divisjon; bruk skift.
   - Hvorfor vanskelig: Implementasjon med store tall.
7. Tonelli-Shanks for kvadratrøtter modulo primtall – Håndtering av odde primtall.
   - Hvorfor vanskelig: Finne non-residue; algoritmesteg.
8. Elliptisk kurve punktmultiplikasjon (secp256k1) – Projektive koordinater; skalarmultiplikasjon.
   - Hvorfor vanskelig: Dobbelt og add; unngå inversjon.
9. Diffie-Hellman med 2048-bit primtall – Generering av sikre primtall; eksponentiering.
   - Hvorfor vanskelig: Primtallsgenerering; sikkerhet.
10. Legendre-symbol for store tall – Kvadratisk resiprositet; faktorisering.
    - Hvorfor vanskelig: Håndtering av negative; algoritme.
11. Generering av tilfeldig stort primtall – Entropi; Miller-Rabin.
    - Hvorfor vanskelig: Tid; sikkerhet.
12. Kinesisk restteorem for 100 kongruenser – Garner's algoritme; håndtering av ikke-koprime.
    - Hvorfor vanskelig: Sammensatte modulus.
13. Bryt Cæsar-chiffer med frekvensanalyse – For store tekster er det enkelt; for små er det vanskelig.
    - Hvorfor vanskelig: Kort tekst; støy.
14. AKS primalitetstest – Teoretisk interessant; praktisk treg.
    - Hvorfor vanskelig: Polynomtid, men store konstanter; komplekse lemma.
15. Subset Sum for kryptoanalyse (liten tetthet) – Lattice-reduksjon.
    - Hvorfor vanskelig: Forstå LLL-algoritmen.
16. SHA-256 fra bunnen av – Bitvis operasjoner; padding; endianness.
    - Hvorfor vanskelig: Presis implementasjon; testvektorer.
17. Birthday attack på 40-bit hash – Finne kollisjon.
    - Hvorfor vanskelig: Minne vs tid; Pollard rho.
18. Merkle-Hellman knapsack (ødelagt) – Implementere, forstå trapdoor.
    - Hvorfor vanskelig: Modular multiplikasjon; superøkende sekvens.
19. Orden av element i endelig legeme – Faktorisering av q-1.
    - Hvorfor vanskelig: Store tall; faktorisering.
20. Irredusible polynomer over GF(2) av grad 20 – Ekshaustiv generering; faktorisering.
    - Hvorfor vanskelig: Mange polynomer; tester.

---

### Optimering & søk (20)

1. Blandet heltallsprogram (MILP) med 500 variabler – Branch-and-bound; cut.
   - Hvorfor vanskelig: Eksplosjon; numerisk stabilitet.
2. Simplex-algoritme for 2000 variabler – Pivot-regler; degenerasjon.
   - Hvorfor vanskelig: Numerisk presisjon; sykling.
3. Globalt minimum for Rastrigin-funksjon i 20D – Mange lokale minima; trenger genetisk algoritme eller simulert temperering.
   - Hvorfor vanskelig: Høy dimensjon; søk.
4. Markowitz-portefølje med 500 aksjer – Kvadratisk programmering; kovariansmatrise.
   - Hvorfor vanskelig: Estimering; betingelser.
5. TSP med 500 byer – branch-and-cut – Subtour-eliminasjon; cut.
   - Hvorfor vanskelig: LP-relaksasjon; cut-generering.
6. NN-arkitektur for CIFAR-10 med < 1M param – Søk; trening; regularisering.
   - Hvorfor vanskelig: Hyperparameter-rom; tid.
7. Partikkelsverm for 50D funksjon – Parametre; konvergens.
   - Hvorfor vanskelig: Justering av vektorer.
8. Korteste vei med negative vekter (Bellman-Ford) – Tidlig stopp; deteksjon.
   - Hvorfor vanskelig: Finne syklus.
9. N-Queens for N=2000 (én løsning) – Heuristisk lokal-søk; ikke tilbakesporing.
   - Hvorfor vanskelig: Min/Max konflikter; algoritme.
10. Backprop i dypt nettverk – Kjederegelen; automatisk differensiering.
    - Hvorfor vanskelig: Gradienter; numerisk stabilitet.
11. Genetisk algoritme for TSP med 500 byer – Crossover (PMX); mutasjon; seleksjon.
    - Hvorfor vanskelig: Konvergens; mangfold.
12. Grid-søk for SVM (C, gamma) med 10⁵ kombinasjoner – Kryssvalidering; parallellisering.
    - Hvorfor vanskelig: Tid; ressurser.
13. Sudoku-løser med AC-3 og MRV – Constraint propagation; backtracking.
    - Hvorfor vanskelig: Implementasjon av AC-3.
14. Maksimum likelihood for GMM (EM) – E-step (ansvar); M-step (oppdatering).
    - Hvorfor vanskelig: Konvergens; initiering.
15. Kalman-filter for objekttracking – Prediksjon; oppdatering; kovarians.
    - Hvorfor vanskelig: Matriser; tuning.
16. XOR-problem med nevralt nett (backprop) – Ikke lineært separabel; trenger skjult lag.
    - Hvorfor vanskelig: Aktiveringsfunksjon; læringsrate.
17. Bayesiansk inferens med MCMC – Forslag; burn-in; konvergensdiagnostikk.
    - Hvorfor vanskelig: Tuning; tid.
18. Hyperband for hyperparameter-optimering – Tidlig stopp; ressursallokering.
    - Hvorfor vanskelig: Implementasjon; brakett.
19. Nærmeste nabo i 100D (kd-tre) – Dimensjonalitetens forbannelse; approksimasjon.
    - Hvorfor vanskelig: Bygging; søk.
20. 15-puzzle med IDA* og Manhattan* – Transposisjonstabell; heuristikk.
    - Hvorfor vanskelig: Minne; optimalitet.

---

### Maskinlæring & dataanalyse (25)

1. Lineær regresjon med SGD på 10⁷ samples – Skalering; læringsrate; konvergens.
   - Hvorfor vanskelig: Feature scaling; stoppkriterie.
2. K-means fra bunnen av på 10⁶ punkter – Initialisering (k-means++); tomme klynger.
   - Hvorfor vanskelig: Konvergens; lokal minima.
3. Beslutningstre (CART) med beskjæring – Splitt-kriterier; håndtering av manglende data.
   - Hvorfor vanskelig: Overfitting; kompleksitet.
4. Random Forest med 100 trær – Bagging; feature sampling; parallellisering.
   - Hvorfor vanskelig: Trening; prediksjon.
5. CNN for MNIST med kun numpy – Convolution; backprop; pooling.
   - Hvorfor vanskelig: Implementasjon av konvolusjon; padding.
6. PCA via SVD – Sentrering; valg av komponenter.
   - Hvorfor vanskelig: Numerisk stabilitet; stor matrise.
7. Rekommandasjonssystem med matrix factorisering (ALS) – Alternating least squares; implicit feedback.
   - Hvorfor vanskelig: Sparsity; regularisering.
8. Anomalideteksjon i tidsserier (ARIMA) – Sesong; differensiering; parameterestimering.
   - Hvorfor vanskelig: Modellvalg; stasjonaritet.
9. SVM med kjernetrick (SMO) – QP; SMO-algoritme.
   - Hvorfor vanskelig: Valg av α; bias; toleranse.
10. Word2vec (skip-gram) med negativ sampling – Hierarkisk softmax; effektivitet.
    - Hvorfor vanskelig: Implementasjon; treningstid.
11. Hidden Markov Model (HMM) for POS-tagging – Forward-backward; Viterbi; Baum-Welch.
    - Hvorfor vanskelig: Sannsynligheter; underflow.
12. Transformer-chatbot fra bunnen av – Multi-head attention; positional encoding; trening.
    - Hvorfor vanskelig: Kompleksitet; ressurser.
13. Sentimentanalyse på 10⁶ tweets (logistisk regresjon) – Preprosessering; TF-IDF.
    - Hvorfor vanskelig: Tekstrensing; feature-engineering.
14. t-SNE for 20 000 høy-dimensjonale punkter – Barnes-Hut; gradient.
    - Hvorfor vanskelig: Tid; perplexitet.
15. Gaussisk prosessregresjon (RBF-kjerne) – Matriseinversjon; hyperparameter-læring.
    - Hvorfor vanskelig: O(n³); numerisk stabilitet.
16. Q-learning for grid-world – Epsilon-greedy; konvergens.
    - Hvorfor vanskelig: Diskretisering; belønning.
17. Kryssvalidering for modellvalg – Stratifisert folding; parallell.
    - Hvorfor vanskelig: Riktig deling; bias.
18. Neural style transfer (Gatys) – Innhold og stil-tap; optimalisering.
    - Hvorfor vanskelig: Gram-matrise; L-BFGS.
19. Isolation Forest for outlier-deteksjon – Tilfeldig partisjonering; scoring.
    - Hvorfor vanskelig: Bygging av trær; dybde.
20. Gradient boosting (XGBoost-aktig) – Newton-boosting; regularisering; beskjæring.
    - Hvorfor vanskelig: Andre-deriverte; tree learning.
21. K-nærmeste naboer for 10⁶ punkter med indeks – KD-tre eller ball-tre.
    - Hvorfor vanskelig: Bygging; søk.
22. Naiv Bayes for tekstklassifisering – Smoothing; log-space.
    - Hvorfor vanskelig: Underflow; feature-uavhengighet.
23. Autoencoder for dimensjonsreduksjon – Bottleneck; rekonstruksjon.
    - Hvorfor vanskelig: Trening; regularisering.
24. GAN for bildegenerering (MNIST) – Generator; diskriminator; Nash-likevekt.
    - Hvorfor vanskelig: Mode collapse; trening.
25. LSTM for prediksjon av tidsserier – Glemmeport; inputport; backprop through time.
    - Hvorfor vanskelig: Gradienteksplosjon; sekvenslengde.

---

### Systemdesign & konkurranse (15)

1. Design en LRU-cache med O(1) get/put og trådsikkerhet – HashMap + dobbeltlenket liste; låsing.
   - Hvorfor vanskelig: Trådsikkerhet; samtidighet.
2. Implementer en rate limiter (token bucket) for 10⁵ requests/sekund – Atomære operasjoner; glidende vindu.
   - Hvorfor vanskelig: Nøyaktighet; ytelse.
3. Bygg en enkel database med B-tree lagring og SQL-subset – B-tree implementasjon; parsing; transaksjoner.
   - Hvorfor vanskelig: Lagring; indeksering; concurrency.
4. Lastbalanserer med helsesjekk og consistent hashing – Distribuerte systemer; feilhåndtering.
   - Hvorfor vanskelig: Node-fjerning; replikering.
5. HTTP-server fra bunnen av (GET, POST, filer) – Sockets; parsing; threading.
   - Hvorfor vanskelig: Protokoll; ytelse; sikkerhet.
6. DNS-resolver fra scratch – Pakkeserialisering; rekursjon; caching.
   - Hvorfor vanskelig: UDP/TCP; tidsavbrudd.
7. Concurrent web crawler med politeness og deduplisering – Trådpool; robots.txt; URL-filtrering.
   - Hvorfor vanskelig: Respekt for nettsteder; unngå duplikater.
8. Blokkjede-prototype (proof-of-work, transaksjoner) – Hashing; Merkle-tre; konsensus.
   - Hvorfor vanskelig: Sikkerhet; validering.
9. Passordhvelv med AES-kryptering – Nøkkelavledning (PBKDF2); sikker lagring.
   - Hvorfor vanskelig: Kryptografi; UI.
10. Rendring av 3D-scene med ray tracing – Vektormatematikk; refleksjoner; ytelse.
    - Hvorfor vanskelig: Rekursjon; optimalisering.
11. Fysikkmotor for 2D stive legemer (kollisjon) – Separerende akse; impuls.
    - Hvorfor vanskelig: Kollisjonsdeteksjon; stabling.
12. Tetris i terminal med curses – Rotasjon; kollisjon; scoring.
    - Hvorfor vanskelig: Terminal-grafikk; input.
13. Kalkulator med parenteser og presedens (shunting yard) – Operatorprioritet; funksjoner.
    - Hvorfor vanskelig: Parsing; evaluering.
14. Git-lignende versjonskontroll (commit, diff, branch) – Content-adresserbar lagring; merge.
    - Hvorfor vanskelig: Trestruktur; algoritmer for diff.
15. Rubiks kube-løser (Kociemba to-fase) – Gruppe-teori; tabeller; koordinater.
    - Hvorfor vanskelig: Forberegning; mønsterdatabaser.

---

### Diverse harde problemer (30)

1. Simulering av flokk (boids) med 10 000 enheter – Nabo-søk; oppførsel.
   - Hvorfor vanskelig: Ytelse; romlig indeksering.
2. Implementer en grep-klone med regex-støtte – NFA-simulering; fil I/O.
   - Hvorfor vanskelig: Effektivitet; store filer.
3. Lag en kompilator for et enkelt språk – Lexer; parser (rekursiv descent); kodegenerering.
   - Hvorfor vanskelig: AST; symboltabell; feilhåndtering.
4. Bygg en enkel søkemotor med indeksering av 10⁵ dokumenter – Invertert indeks; TF-IDF; ranking.
   - Hvorfor vanskelig: Tokenisering; minne; søk.
5. Implementer et distribuert tellesystem (f.eks. consistent counter) – Raft/Paxos; konsensus.
   - Hvorfor vanskelig: Feiltoleranse; ledervalg.
6. Lag en stavekontroll med BK-tre – Bygging; søk med Levenshtein.
   - Hvorfor vanskelig: Trestruktur; redigeringsavstand.
7. Skriv en neural nettverk som spiller Atari-spill (DQN) – Experience replay; target network; CNN.
   - Hvorfor vanskelig: Stabilitet; hyperparametre.
8. Bygg en peer-to-peer chat (uten sentral server) – NAT-traversal; UDP hole punching.
   - Hvorfor vanskelig: Nettverksprogrammering; pålitelighet.
9. Implementer en enkel virtuell maskin (bytecode interpreter) – Stack-basert; instruksjoner.
   - Hvorfor vanskelig: Design; effektivitet.
10. Lag en auto-differentieringsmotor (Autograd) – Computational graph; backward pass.
    - Hvorfor vanskelig: Gradienter; minne.
11. Bygg et sanntids operativsystem (kernel) for Raspberry Pi – Interrupts; scheduling; minne.
    - Hvorfor vanskelig: Maskinvare; feilsøking.
12. Implementer TLS 1.3 håndshake – Kryptografi; protokoll.
    - Hvorfor vanskelig: Standarder; sikkerhet.
13. Lag en bildegjenkjenningstjeneste med CNN og gRPC – Modell; server; protobuf.
    - Hvorfor vanskelig: Integrasjon; ytelse.
14. Bygg en anbefalingsmotor for filmer med collaborative filtering – Matrix factorization; ALS.
    - Hvorfor vanskelig: Sparsity; skalering.
15. Implementer en Merkle-patricia-trie for blockchain – Datastruktur; hashing.
    - Hvorfor vanskelig: Kompleksitet; optimalisering.
16. Lag en stabil differensieringsalgoritme for numerisk optimalisering – Numerisk vs. analytisk.
    - Hvorfor vanskelig: Presisjon; stabilitet.
17. Bygg et automatisk tegneprogram som genererer kunst med GAN – Trening; sampling.
    - Hvorfor vanskelig: Mode collapse; kvalitet.
18. Implementer en distribuert lås med ZooKeeper-lignende funksjonalitet – Konsensus; ephemere noder.
    - Hvorfor vanskelig: Feiltoleranse; synkronisering.
19. Lag en tekstgenerator med GPT-2 arkitektur (mindre skala) – Transformer; trening; sampling.
    - Hvorfor vanskelig: Ressurser; koding.
20. Bygg en enkel databasespørringsoptimalisering (query planner) – Kostnadsmodell; join rekkefølge.
    - Hvorfor vanskelig: Heuristikker; statistikk.
21. Implementer en probabilistisk grafisk modell (f.eks. Bayes-nett) – Inferens; læring.
    - Hvorfor vanskelig: Kompleksitet; approksimasjon.
22. Lag en face recognition pipeline med eigenfaces – PCA; avstand.
    - Hvorfor vanskelig: Bildehåndtering; variasjon.
23. Bygg en tidsrekkedatabase (TSDB) med kompresjon – Gorilla-kompresjon; indeksering.
    - Hvorfor vanskelig: Ytelse; lesing/skriving.
24. Implementer et regelbasert ekspertsystem med fram-chaining – Produksjonsregler; konfliktoppløsning.
    - Hvorfor vanskelig: Skalerbarhet; kompleksitet.
25. Lag en proof-of-stake konsensusmekanisme – Validering; myntinnskudd.
    - Hvorfor vanskelig: Sikkerhet; incentiver.
26. Bygg en bildegjenkjenning med SIFT og RANSAC – Feature extraction; matching.
    - Hvorfor vanskelig: Geometri; robusthet.
27. Implementer en API-ratebegrenser med Redis – Distribuert teller; atomiske operasjoner.
    - Hvorfor vanskelig: Konsistens; ytelse.
28. Lag en ETL-pipeline for store datamengder (MapReduce-lignende) – Distribuert prosessering; feilhåndtering.
    - Hvorfor vanskelig: Partisjonering; shuffling.
29. Bygg et anbefalingssystem for nyheter med domenetilpasning – Transfer learning; fine-tuning.
    - Hvorfor vanskelig: Datakvalitet; relevans.
30. Implementer en kvantemekanisk simulering (Schrödinger-ligningen) for 2 partikler – Numeriske metoder; komplekse tall.
    - Hvorfor vanskelig: Diskretisering; stabilitet.

---

Disse 200 problemene tester grensen for hva som er mulig å løse med kode. Claude Code er designet for å takle akkurat slike utfordringer – med presis algoritmisk tenkning, effektiv implementasjon og dyp forståelse av kompleksitet.

