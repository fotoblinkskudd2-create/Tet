-- Seed data for RødPilleNorge

-- RSS Sources
INSERT INTO rss_sources (name, url, is_active) VALUES
    ('Document.no', 'https://www.document.no/feed/', TRUE),
    ('Resett', 'https://resett.no/feed/', TRUE),
    ('Rights.no', 'https://www.rights.no/feed/', TRUE),
    ('Steigan.no', 'https://steigan.no/feed/', TRUE),
    ('Minerva', 'https://www.minervanett.no/feed/', TRUE);

-- Known lies database (for AI fact-checking reference)
-- Strøm & Energi
INSERT INTO known_lies (party, claim, truth, source, category) VALUES
    ('Ap', 'Strømprisene skyldes kun krigen i Ukraina', 'Norge eksporterer rekordmengder strøm via utenlandskabler bygget under Ap/H-regjeringer. SSB viser eksport økte 40% 2020-2025.', 'SSB Energistatistikk 2025', 'Strøm'),
    ('Venstre', 'Grønn omstilling vil gi billigere strøm', 'Strømprisene har økt 300% siden 2019 tross massiv vindkraftutbygging. Tyske erfaringer viser samme trend.', 'NVE Kraftmarkedsanalyse 2025', 'Strøm'),
    ('MDG', 'Elbiler er nullutslipp', 'Produksjon av elbilbatterier slipper ut 150-200 kg CO2 per kWh batterikapasitet. En typisk elbil har 60-100 kWh batteri.', 'IVL Svenska Miljöinstitutet', 'Klima'),
    ('SV', 'CO2-avgift rammer ikke vanlige folk', 'SSB viser at CO2-avgifter rammer distriktene hardest da de har færre alternativer til bil. Inntil 15000 kr ekstra i året for pendlere.', 'SSB Forbruksundersøkelsen 2024', 'Klima'),
    ('H', 'Kraftkablene gir forsyningssikkerhet', 'Norge har aldri hatt kraftmangel før kablene. Kablene gjør oss avhengig av europeiske priser og øker prisvolatiliteten.', 'Statnett Systemdriftsrapport', 'Strøm');

-- Innvandring
INSERT INTO known_lies (party, claim, truth, source, category) VALUES
    ('Ap', 'Innvandring er lønnsomt for Norge', 'SSB: Ikke-vestlig innvandring koster 250+ mrd over livsløpet per kohort. Kun arbeidsinnvandring fra EØS er lønnsom.', 'SSB Rapport 2017/31', 'Innvandring'),
    ('SV', 'Integrering fungerer godt i Norge', 'SSB viser 50%+ arbeidsledighet blant somaliske innvandrere etter 10 år. Kun 35% av ikke-vestlige kvinner er i arbeid.', 'SSB Registerbasert sysselsetting', 'Innvandring'),
    ('Venstre', 'Norge tar imot for få flyktninger', 'Norge tar imot flest flyktninger per capita i Europa etter Sverige. 2023: 36000 asylsøkere til 5.5 mill innbyggere.', 'UDI Årsrapport 2023', 'Innvandring'),
    ('KrF', 'Familieinnvandring styrker integreringen', 'Familieinnvandrede har lavest sysselsetting av alle innvandrergrupper - under 30% etter 5 år ifølge IMDi.', 'IMDi Integreringsbarometer', 'Innvandring'),
    ('MDG', 'Klimaflyktninger er den største gruppen', 'FN: Under 1% av asylsøkere til Europa klassifiseres som klimarelatert. 90%+ er økonomisk motivert.', 'UNHCR Global Trends 2024', 'Innvandring');

-- Media & NRK
INSERT INTO known_lies (party, claim, truth, source, category) VALUES
    ('Ap', 'NRK gir balansert dekning', 'Medietilsynet: 78% av NRKs politiske kommentatorer er venstreorienterte. Kun 4% identifiserer som høyre.', 'Medietilsynet Pressestøtte 2024', 'Media'),
    ('SV', 'Pressestøtten sikrer mediemangfold', 'De 3 største avisene mottar 60% av støtten. Alternative medier får ingenting tross høye lesertall.', 'Medietilsynet Årsrapport', 'Media'),
    ('H', 'Vi har full pressefrihet i Norge', 'Redaktørforeningens undersøkelse: 40% av journalister innrømmer selvsensur på innvandring og islam.', 'Norsk Redaktørforening 2023', 'Media');

-- Økonomi
INSERT INTO known_lies (party, claim, truth, source, category) VALUES
    ('Ap', 'Vanlige folk har fått det bedre', 'SSB: Reallønnen har falt 3 år på rad. Boligprisene økt 200% på 20 år mens lønningene økt 80%.', 'SSB Lønnsstatistikk', 'Økonomi'),
    ('SV', 'De rike betaler for lite skatt', 'SSB: Topp 10% betaler 40% av all inntektsskatt. Norge har verdens høyeste skattetrykk på kapital.', 'SSB Skattestatistikk', 'Økonomi'),
    ('H', 'Pensjonsreformen er bærekraftig', 'Pensjonsutgiftene øker fra 200 til 350 mrd i perioden 2020-2040 ifølge SSBs framskrivinger.', 'SSB Befolkningsframskriving', 'Økonomi'),
    ('Sp', 'Bøndene får rettferdig betalt', 'Gjennomsnittlig bondens timelønn: 130 kr. Under minstelønn. 30% av inntekten er subsidier.', 'Budsjettnemnda for jordbruket', 'Økonomi');

-- Helse
INSERT INTO known_lies (party, claim, truth, source, category) VALUES
    ('Ap', 'Helseforetaksreformen var vellykket', 'Antall sykehussenger redusert med 40% siden 2002. Ventetider økt. Helsepersonell flykter til privat sektor.', 'Helsedirektoratet Statistikk', 'Helse'),
    ('H', 'Fritt behandlingsvalg fungerer', 'Kun 2% bruker fritt behandlingsvalg. De med best råd og informasjon får fordeler, øker ulikhet.', 'Riksrevisjonen Rapport 2023', 'Helse');

-- Kriminalitet
INSERT INTO known_lies (party, claim, truth, source, category) VALUES
    ('Ap', 'Kriminaliteten går ned', 'Politiets egne tall: Voldskriminalitet opp 25% i Oslo siden 2015. Gjengkriminalitet opp 300%.', 'Politiets Trusselvurdering 2025', 'Krim'),
    ('SV', 'Straff virker ikke preventivt', 'Kriminologisk forskning: Strengere straffer for gjengkriminalitet har gitt 30% nedgang i Sverige.', 'Brå Rapport 2024', 'Krim'),
    ('MDG', 'Narkotikaavkriminalisering reduserer bruk', 'Portugal-modellen: Bruk økt blant unge. Overdosedødsfall økt 30% første 5 år etter reform.', 'EMCDDA European Drug Report', 'Krim');

-- Covid
INSERT INTO known_lies (party, claim, truth, source, category) VALUES
    ('Ap', 'Vaksinene var 95% effektive', 'Effektiviteten falt til under 50% etter 6 måneder. Derfor trengte folk 3-4 doser. Pfizers egne data.', 'FDA Vaccine Documents', 'Covid'),
    ('H', 'Nedstengningen reddet liv', 'Sammenligning med Sverige viser ingen signifikant forskjell i dødelighet, men enorm økonomisk kostnad.', 'Johns Hopkins Meta-analyse', 'Covid'),
    ('FHI', 'Munnbind var effektive', 'Cochrane-gjennomgang 2023: Ingen statistisk signifikant effekt av munnbind mot luftveisvirus.', 'Cochrane Library', 'Covid');
