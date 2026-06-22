# Diagrammer – Biomimikk: insekter/dyr → dronedesign

Diagrammene under er skrevet i **Mermaid** og rendres automatisk på GitHub.

---

## Figur 1 — Den røde tråden: fra biologi til arkitektur

```mermaid
flowchart LR
    A["Del 1<br/>Insektmekanismer"] --> B["Del 2<br/>Drone-designprinsipper"]
    C["Del 3<br/>Dyrs kollektive strategier"] --> D["Del 4<br/>Algoritmer & arkitektur"]
    B --> D
    A --> C
    subgraph RT["Fire røde tråder"]
        T1["Asymmetri"]
        T2["Energiøkonomi"]
        T3["Sparsom sansing-handling"]
        T4["Desentralisert robusthet"]
    end
    A -.-> RT
    C -.-> RT
    RT -.-> D
```

---

## Figur 2 — Mekanisme → prinsipp → algoritme/implementering

```mermaid
flowchart TB
    subgraph BIO["Biologisk mekanisme"]
        b1["Bombardebille:<br/>pulset kjemisk effekt"]
        b2["Felle-kjeve-maur:<br/>latch / katapult"]
        b3["Insektsyn:<br/>optisk flyt"]
        b4["Maurferomon:<br/>stigmergi"]
        b5["Stim / murmurasjon:<br/>lokale naboregler"]
        b6["Vervet-alarmrop:<br/>referensielle signaler"]
        b7["Koloni-roller:<br/>arbeidsdeling"]
    end
    subgraph PRIN["Designprinsipp"]
        p1["Skill lagring fra utløsning"]
        p2["Effektforsterkning"]
        p3["Sparsom lavlatens sansing"]
        p4["Indirekte koordinering"]
        p5["Skalafri kollektiv atferd"]
        p6["Båndbreddesparsom melding"]
        p7["Dynamisk rolletildeling"]
    end
    subgraph TECH["Teknologi / algoritme"]
        t1["Superkondensator-burst + cruise"]
        t2["Elastisk hoppstart"]
        t3["Event-kamera + optisk flyt"]
        t4["Ant Colony Optimization"]
        t5["Boids / PSO"]
        t6["Typede hendelsesmeldinger"]
        t7["Auksjonsbasert oppgaveallokering"]
    end
    b1 --> p1 --> t1
    b2 --> p2 --> t2
    b3 --> p3 --> t3
    b4 --> p4 --> t4
    b5 --> p5 --> t5
    b6 --> p6 --> t6
    b7 --> p7 --> t7
```

---

## Figur 3 — Lagdelt autonomi-arkitektur (syntese, Del 4)

```mermaid
flowchart TB
    S["Sanselag<br/>optisk flyt · event-kamera · dedikerte trusselsensorer"]
    B["Beslutningslag<br/>reflekssløyfer + konsensus (boids/PSO) + abort/retrett-gren"]
    K["Koordineringslag<br/>stigmergi/ACO · topologisk naborangering · auksjonsroller · friend-or-foe"]
    E["Energilag<br/>burst vs. cruise · perching · energi som hard begrensning"]
    P["Systemegenskap<br/>ingen kritisk node · graceful degradation · asymmetrisk blindsone-bruk"]
    S --> B --> K
    E -.styrer.-> B
    E -.styrer.-> K
    K --> P
    B --> P
```

---

## Figur 4 — Desentralisert svermsløyfe (lokale regler → global atferd)

```mermaid
flowchart LR
    subgraph Agent["Enkeltagent (lokal sløyfe)"]
        sense["Sans naboer + miljø"] --> rule["Lokale regler:<br/>separasjon · tilpasning · samhold"]
        rule --> act["Handle: juster kurs/fart"]
        act --> sense
    end
    Agent --> Emergent["Emergent global atferd:<br/>flokk · områdedekning · confusion effect"]
    Emergent -.miljøsignal.-> Agent
```

---

## Figur 5 — Sansing-handling-sløyfe vs. latens (insekt-prinsipp)

```mermaid
sequenceDiagram
    participant M as Miljø/Trussel
    participant S as Sparsom sensor
    participant R as Refleks-sløyfe
    participant A as Aktuator
    M->>S: Stimulus (luftstrøm / ultralyd / optisk flyt)
    S->>R: Få, høyt avstemte signaler
    Note over R: Ingen tung beregning<br/>forhåndsprogrammert respons
    R->>A: Utløs unnamanøver
    A->>M: Sprang / dykk / kursendring
    Note over S,A: Mål: millisekund-latens,<br/>maks informasjon per nevron/sensor
```

---

## Figur 6 — Vurderingsmatrise (kvalitativ)

```mermaid
quadrantChart
    title Energieffektivitet vs. presisjon
    x-axis "Lav presisjon" --> "Høy presisjon"
    y-axis "Lav energieffektivitet" --> "Høy energieffektivitet"
    quadrant-1 "Ideelt"
    quadrant-2 "Sparsomt men upresist"
    quadrant-3 "Svakt"
    quadrant-4 "Presist men dyrt"
    "Heat-balling": [0.72, 0.88]
    "Juvelveps": [0.95, 0.82]
    "Felle-kjeve": [0.85, 0.55]
    "Bombardebille": [0.55, 0.6]
    "Kamuflasje/mimikk": [0.6, 0.78]
    "Optisk flyt-navigasjon": [0.65, 0.85]
    "Svermkoordinering": [0.6, 0.7]
```

> *Plasseringene er kvalitative ekspertvurderinger for illustrasjon, ikke målte data.*
