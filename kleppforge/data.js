/*
 * KLEPPFORGE Command Center v0 — mockdata
 * Norsk. Null fluff. Ingen tomme felt.
 * Antakelser er merket med "(antakelse)" der tall/fakta ikke er verifisert.
 */

const KLEPPFORGE_DATA = {
  meta: {
    operator: "Alex Klepp",
    version: "v0",
    today_focus: "ai-audit",
    next_action_now:
      "Send 10 AI-audit e-poster til småbedrifter i Bergen/Vestland. Mål: 2 svar.",
    next_24h: [
      "Ferdigstill eksempelrapport for AI-kostnadskutt Audit (3–5 sider).",
      "Lag prisside med Mini / Full / Drift.",
      "Send 10 outreach-e-poster (AI-audit).",
      "Lag 1 GitHub Pain Report på et offentlig repo som demo.",
      "Skriv 3 kundecaser for Lyttepost Vann.",
    ],
  },

  ideas: [
    {
      id: "ai-audit",
      name: "AI-kostnadskutt Audit",
      problem:
        "Småbedrifter og skapere betaler for mange AI-verktøy uten klar arbeidsflyt. Resultatet er overlapp, ubrukte abonnement og manuelt arbeid.",
      buyer: "Småbedrifter, gründere, konsulenter, markedsførere, skapere",
      user: "Daglig leder eller en som faktisk gjør jobben i en liten bedrift",
      first_deliverable:
        "DOCX/PDF-audit med kutt-liste, behold-liste, automatiser-liste og ny 30-dagers arbeidsflyt",
      mvp: "Spørreskjema + rapportmal + regneark + anbefalingsmotor (prompt) + eksempelrapport",
      price_range: "990–9 900 NOK",
      value_score: 92,
      risk_score: 18,
      judgment: "PASS",
      why_wins:
        "Klart problem, rask levering (24 t), ingen kode nødvendig, og kunden betaler allerede for AI — du viser dem bare hvor pengene lekker.",
      product_card: {
        name: "AI-kostnadskutt Audit",
        mvp: "Skjema → regneark → rapportmal → eksempelrapport. Null kode.",
        first_sellable: "Mini-audit: 3–5 siders DOCX/PDF levert på 24 timer.",
        price_levels: [
          "Mini-audit: 990–1 990 kr",
          "Full audit: 4 900–9 900 kr",
          "Månedlig AI-driftsoppsett: 2 500–7 500 kr/mnd",
        ],
        first_test: "Send til 10 småbedrifter, mål 2 svar og 1 betalt mini-audit.",
        plan_7_days: [
          "Dag 1: Bygg skjema + rapportmal + eksempelrapport.",
          "Dag 2: Lag prisside og 10 outreach-e-poster.",
          "Dag 3: Send e-poster, logg svar.",
          "Dag 4: Lever første mini-audit (betalt eller gratis pilot).",
          "Dag 5: Be om tilbakemelding, stram rapportmalen.",
          "Dag 6: Pakk Full-audit-tilbud.",
          "Dag 7: Tilby månedlig drift til pilotkunden.",
        ],
      },
      report: {
        summary:
          "Bedriften bruker flere AI-verktøy uten samlet strategi. Audit avdekker overlapp, ubrukte abonnement og oppgaver som bør automatiseres. Estimert besparelse og en konkret 30-dagers arbeidsflyt følger.",
        problem:
          "AI-verktøy er kjøpt stykkevis. Ingen eier helheten. Overlappende funksjoner betales dobbelt, og arbeidet er fortsatt manuelt.",
        observations: [
          "Verktøyoversikt: alle aktive AI-abonnement og hva de koster.",
          "Overlapp: funksjoner dekket av to eller flere verktøy.",
          "Lav bruk: abonnement med få eller ingen aktive brukere.",
          "Manuelle oppgaver som kan automatiseres med eksisterende verktøy.",
        ],
        recommended_actions: [
          "Kutt 1–3 overlappende eller ubrukte abonnement.",
          "Behold kjerneverktøyene og samle dem i én arbeidsflyt.",
          "Automatiser 2–3 gjentakende oppgaver.",
          "Innfør en enkel 30-dagers rutine med ansvarlig eier.",
        ],
        economic_value:
          "Typisk kutt: 500–3 000 kr/mnd i abonnement + spart tid (antakelse, justeres per kunde). Audit betaler seg ofte inn på 1–2 måneder.",
        next_steps: [
          "Bestill Full-audit eller månedlig drift.",
          "Sett opp 30-dagers arbeidsflyt med eier og målepunkter.",
        ],
      },
      tickets: [
        "Lag intake-skjema (10–15 spørsmål) om dagens AI-verktøy og kostnader.",
        "Bygg regneark som summerer kostnad, bruk og overlapp.",
        "Lag DOCX-rapportmal med 8 faste seksjoner.",
        "Skriv anbefalingsmotor som prompt (kutt/behold/automatiser).",
        "Lag eksempelrapport på fiktiv bedrift.",
        "Lag prisside (Mini/Full/Drift).",
        "Skriv 10 outreach-e-poster med variasjon.",
        "Lag enkel logg for svar og konvertering.",
        "Lag sjekkliste for 24-timers levering.",
        "Skriv onboarding for månedlig drift.",
      ],
      sales: {
        pitch_short:
          "Jeg finner AI-abonnementene dere kaster penger på, og gir dere en arbeidsflyt som faktisk sparer tid.",
        email:
          "Emne: Betaler dere for AI-verktøy dere ikke bruker skikkelig?\n\nHei,\n\nMange småbedrifter betaler for flere AI-verktøy uten tydelig system. Resultatet er overlapp, unødvendige abonnement og arbeidsflyt som fortsatt er manuell.\n\nJeg tilbyr en enkel AI-kostnadskutt Audit. Dere får en kort rapport som viser hva som bør beholdes, hva som bør kuttes, hvor dere har overlapp, hvilke oppgaver som kan automatiseres, og en konkret 30-dagers arbeidsflyt.\n\nMålet er enkelt: mindre AI-kaos, lavere kostnader og mer faktisk nytte.\n\nKan jeg sende en kort oversikt?\n\nMvh\nAlex",
        linkedin:
          "De fleste småbedrifter har AI-buffet, men jobber fortsatt som om de spiser kald lapskaus med gaffel. Jeg lager en kort audit som viser hva som kuttes, hva som beholdes og hva som automatiseres. Mindre kaos, lavere kost.",
        objections: [
          {
            q: "Vi har ikke så mange verktøy.",
            a: "Da blir audit raskt og billig — og du får en ren arbeidsflyt uansett.",
          },
          {
            q: "Vi kan gjøre dette selv.",
            a: "Dere kan, men gjør det ikke. Audit tar 24 timer og betaler seg på 1–2 mnd.",
          },
          {
            q: "Er dette bare en rapport?",
            a: "Nei. Dere får en konkret 30-dagers arbeidsflyt med eier og målepunkter.",
          },
        ],
        buyer_types: [
          "Lokal regnskapsfører",
          "Markedsbyrå (2–10 ansatte)",
          "Solo-konsulent",
          "Nettbutikk",
          "Eiendomsmegler-kontor",
          "Arkitektkontor",
          "Frilans-skaper",
          "Advokatkontor (lite)",
          "Treningssenter-kjede (lokal)",
          "Håndverksbedrift med kontorledd",
        ],
      },
      daily: {
        valuable: "Eksempelrapport + prisside + 10 sendte e-poster.",
        fluff: "Logo, navnediskusjon, fancy dashboard.",
        build_next: "Full-audit-mal og månedlig driftsrutine.",
      },
    },

    {
      id: "github-radar",
      name: "GitHub Painkiller Radar",
      problem:
        "GitHub-repoer har åpne issues, svak dokumentasjon og ubrukte produktmuligheter. God kode taper brukere på dårlig onboarding.",
      buyer: "Indiehackers, utviklere, open-source maintainere, små SaaS-team, byråer",
      user: "Maintainer eller teknisk gründer som vil ha flere brukere/inntekt",
      first_deliverable:
        "Repo Pain Report: smerter i issues, README-svakheter, 5 konkrete forbedringer, produktmuligheter og en Claude/Codex-prompt for første fix",
      mvp: "Manuell repo-analyse + rapportmal + outreach. Ikke bygg crawler før rapporten beviser verdi.",
      price_range: "1 500–7 500 NOK",
      value_score: 89,
      risk_score: 22,
      judgment: "PASS",
      why_wins:
        "Kombinerer AI, kode, research og produktisering — passer Alex sine styrker. Byggbart med Codex/Claude nå, og demoen kan lages på et hvilket som helst offentlig repo.",
      product_card: {
        name: "GitHub Painkiller Radar",
        mvp: "Manuell analyse av ett repo → rapportmal → outreach. Crawler senere.",
        first_sellable: "Repo Pain Report for ett repo, levert på 24–48 timer.",
        price_levels: [
          "Enkel repo-rapport: 1 500–3 000 kr",
          "Dyp rapport + dev-tickets: 4 000–7 500 kr",
          "Månedlig radar (flere repoer): pris etter avtale (antakelse)",
        ],
        first_test: "Lag 1 gratis demo-rapport på et populært repo, bruk som outreach-agn.",
        plan_7_days: [
          "Dag 1: Lag rapportmal + analyseprompt.",
          "Dag 2: Lag eksempelrapport på offentlig repo.",
          "Dag 3: Skriv 10 outreach-meldinger.",
          "Dag 4: Send til 10 maintainere/indiehackers.",
          "Dag 5: Lever første betalte rapport.",
          "Dag 6: Pakk dyp rapport med dev-tickets.",
          "Dag 7: Tilby månedlig radar.",
        ],
      },
      report: {
        summary:
          "Repoet har god kjerne, men taper brukere på onboarding, README og issue-struktur. Rapporten peker på de største friksjonene og gir 5 konkrete forbedringer pluss en produkt-/SaaS-vinkel.",
        problem:
          "Brukere møter friksjon før de får verdi: uklar README, manglende eksempler, åpne issues uten struktur. Resultatet er frafall og lav adopsjon.",
        observations: [
          "Issue-mønstre: gjentakende spørsmål som peker på manglende docs.",
          "README-svakheter: uklart hva, for hvem, hvordan starte.",
          "Onboarding-friksjon: ingen quickstart eller eksempel.",
          "Produktmuligheter: nisjefunksjon som kan pakkes som betalt tjeneste.",
        ],
        recommended_actions: [
          "Skriv om README: hva, hvem, quickstart på 60 sekunder.",
          "Legg til kjørbart eksempel og FAQ fra issues.",
          "Merk og lukk/standardiser de 10 mest gjentakende issuene.",
          "Vurder betalt variant av mest etterspurte funksjon.",
        ],
        economic_value:
          "Bedre onboarding = flere brukere og mindre supporttid (antakelse). For SaaS kan én produktvinkel bli reell inntektslinje.",
        next_steps: [
          "Bestill dyp rapport med ferdige dev-tickets.",
          "Implementer README + quickstart som første fix.",
        ],
      },
      tickets: [
        "Lag analyseprompt som leser repo-metadata, README og issues.",
        "Lag rapportmal med 8 faste seksjoner.",
        "Lag scoringsystem for friksjon (README, onboarding, issues).",
        "Lag eksempelrapport på offentlig repo.",
        "Skriv README-fix-mal (hva/hvem/quickstart).",
        "Lag FAQ-generator fra issue-tekst.",
        "Skriv 10 outreach-meldinger til maintainere.",
        "Lag mal for 5 konkrete forbedringer + produktvinkel.",
        "Lag prisside (enkel/dyp/månedlig).",
        "Skriv masterprompt for første fix (Claude Code/Codex).",
      ],
      sales: {
        pitch_short:
          "Jeg leser repoet ditt som en ny bruker og gir deg 5 konkrete fikser som gir flere brukere — pluss en mulig betalt produktvinkel.",
        email:
          "Emne: Jeg fant noen konkrete forbedringsmuligheter i repoet deres\n\nHei,\n\nJeg jobber med et system som analyserer GitHub-repoer og finner praktiske forbedringer innen dokumentasjon, issues, onboarding og produktmuligheter.\n\nMange repoer har god kode, men taper brukere fordi README, eksempler eller issue-struktur gjør prosjektet tyngre å forstå enn nødvendig.\n\nJeg tilbyr en kort GitHub Pain Report med største brukerfriksjoner, README-forbedringer, issue-mønstre, konkrete dev-tickets og mulige produkt-/SaaS-vinkler.\n\nKan jeg sende et eksempel på rapportformatet?\n\nMvh\nAlex",
        linkedin:
          "GitHub er fullt av god kode som taper brukere på dårlig README. Jeg lager korte Pain Reports: 5 konkrete fikser + en mulig produktvinkel. Skitten kobberledning i kjelleren — fortsatt verdi.",
        objections: [
          {
            q: "Vi kjenner repoet vårt best.",
            a: "Nettopp derfor ser dere ikke friksjonen en ny bruker møter. Jeg leser det utenfra.",
          },
          {
            q: "Vi har ikke budsjett.",
            a: "Start med en enkel rapport. Hvis den ikke gir verdi, betaler du ikke for den neste.",
          },
          {
            q: "Er dette bare AI-slop?",
            a: "Nei. Hver forbedring er konkret og knyttet til en faktisk issue eller README-linje.",
          },
        ],
        buyer_types: [
          "Indiehacker med 1 SaaS",
          "OSS-maintainer med mange issues",
          "Lite dev-team uten teknisk skribent",
          "Byrå som leverer til startups",
          "Bootstrappet B2B-SaaS",
          "DevTool-startup",
          "Hackathon-prosjekt som vil bli produkt",
          "Konsulent som selger videre",
          "API-first selskap",
          "No-code-verktøy med GitHub-integrasjon",
        ],
      },
      daily: {
        valuable: "Rapportmal + 1 eksempelrapport + analyseprompt.",
        fluff: "Crawler, dashboard, automatisering for tidlig.",
        build_next: "Dyp rapport med ferdige dev-tickets.",
      },
    },

    {
      id: "docx-factory",
      name: "DOCX Report Factory",
      problem:
        "Folk har research, prompts og ideer, men mangler ferdige rapporter. De vil ha noe som føles ferdig og tungt — ikke chat-boble-slaps.",
      buyer: "Konsulenter, gründere, oppfinnere, researchere, advokater, småbedrifter",
      user: "Den som må levere et dokument fort og vil at det skal se ferdig ut",
      first_deliverable: "Ferdig DOCX bygget fra ett strukturert input",
      mvp: "Promptsystem + rapportmal + eksportstruktur",
      price_range: "990–4 900 NOK",
      value_score: 87,
      risk_score: 12,
      judgment: "PASS",
      why_wins:
        "Lavest risiko av alle. Dette er ryggraden i hele systemet — alle de andre sporene leverer til slutt en DOCX. Bygg motoren én gang, bruk overalt.",
      product_card: {
        name: "DOCX Report Factory",
        mvp: "One-Input Report Factory: tema + målgruppe + lengde + stil → DOCX.",
        first_sellable: "Ferdig DOCX-rapport levert på 24–72 timer.",
        price_levels: [
          "Enkel rapport: 990–1 900 kr",
          "Strukturert rapport med plan/salgsdel: 2 500–4 900 kr",
          "Mal-lisens til gjenbruk: pris etter avtale (antakelse)",
        ],
        first_test: "Bruk på deg selv først: lever 3 ekte rapporter til de andre sporene.",
        plan_7_days: [
          "Dag 1: Bygg input-skjema og rapportmal.",
          "Dag 2: Lag promptsystem som fyller malen.",
          "Dag 3: Lag DOCX-eksport (mal → fil).",
          "Dag 4: Lever 3 interne rapporter (audit, github, vann).",
          "Dag 5: Lag stil-varianter (saklig, hard, pitch).",
          "Dag 6: Lag salgsside.",
          "Dag 7: Selg én ekstern rapport.",
        ],
      },
      report: {
        summary:
          "Et input-til-DOCX-system som gjør notater, research og prompts om til en ferdig, strukturert rapport. Samme motor brukes på tvers av alle KLEPPFORGE-spor.",
        problem:
          "Innholdet finnes, men formatet mangler. Folk leverer rotete tekst der de trengte et dokument som ser ferdig ut.",
        observations: [
          "Input er ofte ustrukturert (notater, chat, lenker).",
          "Mottakere forventer fast struktur: sammendrag, analyse, plan.",
          "Manuell formatering stjeler timer per rapport.",
          "Stil må kunne variere: saklig, hard, pitch.",
        ],
        recommended_actions: [
          "Standardiser én rapportmal med 8–10 seksjoner.",
          "Bygg promptsystem som fyller malen fra input.",
          "Lag stil-varianter som bytter tone uten å endre struktur.",
          "Automatiser DOCX-eksport.",
        ],
        economic_value:
          "Sparer 2–4 timer per rapport (antakelse). Som motor under de andre sporene multipliserer den all leveranse.",
        next_steps: [
          "Koble motoren til AI-audit og GitHub-radar som standard eksport.",
          "Tilby mal-lisens til konsulenter.",
        ],
      },
      tickets: [
        "Lag input-skjema (tema, målgruppe, lengde, stil, bruk, kilder).",
        "Definer rapportmal med 8–10 faste seksjoner.",
        "Bygg promptsystem som fyller malen fra input.",
        "Lag DOCX-eksport fra mal.",
        "Lag 3 stil-varianter (saklig/hard/pitch).",
        "Lag sammendrag-generator (maks 10 linjer).",
        "Lag produktkort-seksjon.",
        "Lag risiko-seksjon med antakelser merket.",
        "Lag salgsside.",
        "Skriv README med bruk og utvidelse.",
      ],
      sales: {
        pitch_short:
          "Send meg notatene dine, få tilbake en ferdig rapport som ser ut som noen brukte en uke på den.",
        email:
          "Emne: Ferdig rapport fra notatene dine — på 1–3 dager\n\nHei,\n\nHar du research, notater eller ideer som burde vært en ferdig rapport, men aldri blir det?\n\nJeg tilbyr DOCX Report Factory: du sender input (tema, målgruppe, lengde, stil), og får tilbake en ferdig DOCX med sammendrag, analyse, prioritering, plan og salgsdel.\n\nFerdig format, ingen chat-boble-slaps.\n\nKan jeg lage en kort prøverapport?\n\nMvh\nAlex",
        linkedin:
          "Du vil ikke ha 'AI-tekst'. Du vil ha et dokument som føles ferdig, tungt og brukbart. DOCX Report Factory: input inn, ferdig rapport ut.",
        objections: [
          {
            q: "Jeg kan skrive selv.",
            a: "Du kan, men du gjør det ikke. Her får du ferdig dokument på 1–3 dager.",
          },
          {
            q: "Blir det generisk?",
            a: "Nei. Strukturen er fast, men innholdet bygges fra ditt input og din stil.",
          },
          {
            q: "Hvorfor DOCX og ikke PDF?",
            a: "Du får begge. DOCX fordi du skal kunne redigere videre selv.",
          },
        ],
        buyer_types: [
          "Solo-konsulent",
          "Oppfinner med mange notater",
          "Researcher/analytiker",
          "Lite advokatkontor",
          "Gründer som skal pitche",
          "Markedsfører med kampanjeplaner",
          "Byrå som leverer rapporter",
          "Student/akademiker",
          "Prosjektleder",
          "Styremedlem i borettslag",
        ],
      },
      daily: {
        valuable: "Fungerende mal + promptsystem + DOCX-eksport.",
        fluff: "Temavelger, fonter, 20 stil-varianter.",
        build_next: "Koble motoren inn under audit- og github-sporet.",
      },
    },

    {
      id: "tekstkvern",
      name: "TEKSTKVERN",
      problem:
        "Rotete, emosjonell eller tung tekst må gjøres klar, hard, juridisk saklig eller enkel — uten å miste stemmen.",
      buyer:
        "Privatpersoner, studenter, ADHD/dysleksi-brukere, folk i NAV/helse/klagesaker",
      user: "Noen med kaos i hodet, for mye å si og dårlig system",
      first_deliverable: "Tekstforbedring i flere moduser (rydd, hard, juridisk, kort, e-post)",
      mvp: "Promptbasert tekstmotor med modusvalg",
      price_range: "99–499 NOK/mnd eller per tekst",
      value_score: 82,
      risk_score: 20,
      judgment: "PASS",
      why_wins:
        "Født av ekte irritasjon, nært Alex sin egen bruk. Vinkelen er hardere enn 'forenkle tekst': den beholder stemmen og finner hva mottaker faktisk må gjøre.",
      product_card: {
        name: "TEKSTKVERN",
        mvp: "Promptmotor med moduser: rydd / hard / juridisk / kort / e-post / punktliste.",
        first_sellable: "Teksttransformator (web eller tjeneste) med 5–6 moduser.",
        price_levels: [
          "Per tekst: 99–199 kr",
          "Abonnement: 99–499 kr/mnd",
          "Tjeneste (ferdig brev/klage): pris etter avtale (antakelse)",
        ],
        first_test: "Gi 10 personer gratis tilgang, mål om de bruker den to ganger.",
        plan_7_days: [
          "Dag 1: Definer 6 moduser og deres prompts.",
          "Dag 2: Bygg enkel input/output-flate.",
          "Dag 3: Test på ekte klage-/NAV-/helsetekster.",
          "Dag 4: Legg til 'hva må mottaker gjøre'-uttrekk.",
          "Dag 5: Legg til svakhets-finner.",
          "Dag 6: Lag prisside.",
          "Dag 7: Del med 10 testbrukere.",
        ],
      },
      report: {
        summary:
          "En tekstmotor som rydder rotete tekst uten å fjerne stemmen, og leverer flere ferdige versjoner: hard, juridisk saklig, kort og e-post. Den peker også på svakheter og hva mottaker faktisk må gjøre.",
        problem:
          "Folk skriver emosjonelt og ustrukturert i situasjoner som krever klarhet: klager, NAV, helse, juridiske henvendelser. Budskapet drukner.",
        observations: [
          "Teksten er for lang og følelsesstyrt for formålet.",
          "Mottakers handling er uklar.",
          "Brukeren vil beholde sin stemme, ikke bli robot.",
          "Ulike mottakere krever ulik tone (saklig vs. Facebook).",
        ],
        recommended_actions: [
          "Tilby 6 moduser som bytter tone uten å miste innhold.",
          "Trekk alltid ut 'hva må mottaker gjøre'.",
          "Marker svakheter i argumentasjonen.",
          "Behold brukerens stemme som standard.",
        ],
        economic_value:
          "Sparer brukeren tid og bortkastede henvendelser; øker sjansen for at klager/brev faktisk fører fram (antakelse).",
        next_steps: [
          "Lanser som enkel web-tjeneste med 6 moduser.",
          "Tilby ferdig-brev-tjeneste for vanskelige saker.",
        ],
      },
      tickets: [
        "Definer 6 moduser med tydelige prompts.",
        "Lag input/output-flate (lim inn, velg modus, få resultat).",
        "Lag 'behold stemmen'-instruksjon som standard.",
        "Lag 'hva må mottaker gjøre'-uttrekk.",
        "Lag svakhets-finner.",
        "Lag kortversjon-modus (maks N ord).",
        "Lag juridisk-saklig-modus.",
        "Lag e-post- og Facebook-modus.",
        "Lag prisside (per tekst / abonnement).",
        "Skriv README + personvernnote (sensitiv tekst).",
      ],
      sales: {
        pitch_short:
          "Lim inn det rotete du skrev. Få tilbake en klar, hard eller saklig versjon — med stemmen din intakt.",
        email:
          "Emne: Få det du prøver å si — klart og ferdig\n\nHei,\n\nSkriver du noen ganger langt og følelsesstyrt når du egentlig trenger en kort, klar versjon? Klage, NAV-brev, helsesvar, henvendelse?\n\nTEKSTKVERN gjør rotete tekst om til flere ferdige versjoner: ryddet, hard, juridisk saklig, kort og e-post — uten å fjerne stemmen din. Den peker også på hva mottaker faktisk må gjøre.\n\nVil du teste den gratis på én tekst?\n\nMvh\nAlex",
        linkedin:
          "Tekstkvern for folk med kaos i hodet og for mye å si. Behold stemmen, dropp rotet. Rydd, hard, juridisk, kort — én tekst, flere ferdige versjoner.",
        objections: [
          {
            q: "Finnes det ikke tusen sånne?",
            a: "Jo, men de fjerner stemmen din. Denne beholder den og finner hva mottaker må gjøre.",
          },
          {
            q: "Er teksten min trygg?",
            a: "Personvern er innebygd; sensitiv tekst behandles ikke lenger enn nødvendig.",
          },
          {
            q: "Jeg skriver greit selv.",
            a: "Da bruk den når du er sliten eller sint — det er da teksten blir lengst.",
          },
        ],
        buyer_types: [
          "Person i klagesak",
          "Bruker i NAV-/helse-prosess",
          "Student med skriveangst",
          "ADHD-/dysleksi-bruker",
          "Forelder som skriver til skole/kommune",
          "Småbedrift med kundeklager",
          "Tillitsvalgt",
          "Frilanser som skriver tilbud",
          "Innvandrer som lærer norsk byråkrati",
          "Borettslagsstyre som skriver til beboere",
        ],
      },
      daily: {
        valuable: "6 fungerende moduser + 'hva må mottaker gjøre'-uttrekk.",
        fluff: "Konto, profiler, gamification.",
        build_next: "Ferdig-brev-tjeneste for vanskelige saker.",
      },
    },

    {
      id: "lyttepost-vann",
      name: "Lyttepost Vann",
      problem:
        "Vannskader oppdages for sent i borettslag, bygg og tekniske rom. Litt fukt, litt lukt, ingen ansvar — så kommer regningen.",
      buyer: "Borettslag, sameier, eiendomsforvaltere, små næringsbygg, driftsselskaper",
      user: "Styreleder eller driftsansvarlig som vil unngå dyre overraskelser",
      first_deliverable: "Vannrisiko-rapport for bygg + forslag til sensoroppsett (ikke sensor først)",
      mvp: "Dashboard med mockdata + rapportmal + 3 kundecaser + salgsside",
      price_range: "2 500–19 900 NOK",
      value_score: 78,
      risk_score: 35,
      judgment: "PASS",
      why_wins:
        "Sterkt lokalt Bergen/Vestland-spor med ekte smerte og betalende kjøpere. Men: start med rapport, ikke hardware — ellers går du i myra med støvlene fulle av optimisme.",
      product_card: {
        name: "Lyttepost Vann",
        mvp: "Vannrisiko-rapport + dashboard-mockup. Sensorpakke kommer senere.",
        first_sellable: "Vannrisiko-rapport for ett bygg, levert på 3–7 dager.",
        price_levels: [
          "Vannrisiko-rapport: 2 500–6 000 kr",
          "Rapport + pilotforslag: 6 000–19 900 kr",
          "Sensorpilot (senere): pris etter avtale (antakelse)",
        ],
        first_test: "Lever 1 gratis pilotrapport til ett borettslag, bruk som referanse.",
        plan_7_days: [
          "Dag 1: Lag produktkort + rapportmal.",
          "Dag 2: Lag dashboard-wireframe med mockdata.",
          "Dag 3: Skriv 3 kundecaser.",
          "Dag 4: Lag salgsside + 1-siders oversikt.",
          "Dag 5: Send til 10 borettslag/forvaltere.",
          "Dag 6: Lever første pilotrapport.",
          "Dag 7: Tilby pilot med sensorforslag.",
        ],
      },
      report: {
        summary:
          "En praktisk vannrisiko-rapport som kartlegger risikosoner, fuktindikatorer og tiltak før skaden blir dyr. Den gir styret et tidlig beslutningsgrunnlag og et forslag til sensoroppsett — ikke en erstatning for fagkontroll.",
        problem:
          "Vannskader starter lenge før de synes. Ansvar pulveriseres, ingen handler, og regningen kommer når veggen åpnes.",
        observations: [
          "Risikosoner: bad, kjøkken, tekniske rom, kjeller, rør-gjennomføringer.",
          "Fuktindikatorer: lukt, misfarging, kondens, tidligere skader.",
          "Manglende rutine for tidlig varsling.",
          "Uklar ansvarsfordeling mellom beboer, styre og forvalter.",
        ],
        recommended_actions: [
          "Prioritert tiltaksliste per risikosone.",
          "Enkel sjekkliste for jevnlig egenkontroll.",
          "Forslag til sensoroppsett i høyrisikosoner.",
          "Dokumentasjon og ansvarskart til styret.",
        ],
        economic_value:
          "Én unngått større vannskade kan spare titusener til hundretusener (antakelse). Rapporten er billig forsikring mot dyr overraskelse.",
        next_steps: [
          "Bestill pilot med sensorforslag i 1–2 høyrisikosoner.",
          "Etabler egenkontroll-rutine med ansvarlig.",
        ],
      },
      tickets: [
        "Lag rapportmal med risikosoner og tiltaksliste.",
        "Lag dashboard-wireframe med mockdata (soner + status).",
        "Lag fuktindikator-sjekkliste.",
        "Lag prioriteringslogikk (rød/gul/grønn).",
        "Skriv 3 kundecaser (borettslag, sameie, næringsbygg).",
        "Lag 1-siders salgsoversikt.",
        "Lag salgsside.",
        "Lag sensorforslag-mal (uten å bygge hardware).",
        "Lag ansvarskart-mal for styret.",
        "Skriv README + tydelig 'ikke fagkontroll'-forbehold.",
      ],
      sales: {
        pitch_short:
          "Jeg gir styret et tidlig beslutningsgrunnlag for vannrisiko — før litt fukt blir en dyr regning.",
        email:
          "Emne: Tidlig varsling av fukt og vannrisiko i bygg\n\nHei,\n\nVannskader starter ofte lenge før skaden er synlig. Litt fukt. Litt lukt. Små avvik. Så kommer regningen.\n\nJeg utvikler Lyttepost Vann, et enkelt rapport- og overvåkingskonsept for borettslag, sameier og små bygg. Første leveranse er en praktisk vannrisiko-rapport: risikosoner, enkel vurdering, forslag til tiltak, sensor-/overvåkingsplan og dokumentasjon for styret.\n\nDette er ikke en erstatning for fagkontroll, men et tidlig beslutningsgrunnlag før problemene blir dyre.\n\nKan jeg sende en kort 1-sides oversikt?\n\nMvh\nAlex",
        linkedin:
          "Typisk norsk skadeforløp: litt fukt → ingen ansvar → veggen åpnes → alle later som de er overrasket. Lyttepost Vann gir styret et tidlig beslutningsgrunnlag før regningen kommer.",
        objections: [
          {
            q: "Vi har forsikring.",
            a: "Forsikring betaler etter skaden. Dette hjelper dere unngå egenandel og oppussingskaos.",
          },
          {
            q: "Er ikke dette en fagkontroll?",
            a: "Nei, og det sier rapporten tydelig. Det er et tidlig beslutningsgrunnlag før dere bestiller fag.",
          },
          {
            q: "Trenger vi sensorer?",
            a: "Ikke for å begynne. Rapporten kommer først; sensorforslag er valgfritt neste steg.",
          },
        ],
        buyer_types: [
          "Borettslagsstyre",
          "Sameie",
          "Eiendomsforvalter",
          "Lite næringsbygg",
          "Driftsselskap",
          "Kommunalt bygg",
          "Huseier med utleie",
          "Boligbyggelag (lokalt)",
          "Vaktmestertjeneste",
          "Takstmann som vil utvide tilbud",
        ],
      },
      daily: {
        valuable: "Rapportmal + dashboard-wireframe + 3 caser.",
        fluff: "Fysisk sensor, app-konto, sanntidsgrafer.",
        build_next: "Pilotforslag med sensoroppsett for ett bygg.",
      },
    },
  ],
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = KLEPPFORGE_DATA;
}
