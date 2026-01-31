// Known Lies Checker - matches content against database of known political lies

export interface LieMatch {
  party: string
  claim: string
  truth: string
  source: string
  category: string
  matchScore: number
  matchedText: string
}

export interface KnownLie {
  party: string
  claim: string
  truth: string
  source: string
  category: string
  keywords: string[]
}

export class KnownLiesChecker {
  // In-memory database of known lies with keywords for matching
  private knownLies: KnownLie[] = [
    // Strøm
    {
      party: 'Ap',
      claim: 'Strømprisene skyldes kun krigen i Ukraina',
      truth: 'Norge eksporterer rekordmengder strøm via utenlandskabler. SSB viser eksport økte 40% 2020-2025.',
      source: 'SSB Energistatistikk 2025',
      category: 'Strøm',
      keywords: ['strømpris', 'ukraina', 'krigen', 'energikrise'],
    },
    {
      party: 'Venstre',
      claim: 'Grønn omstilling vil gi billigere strøm',
      truth: 'Strømprisene har økt 300% siden 2019 tross massiv vindkraftutbygging.',
      source: 'NVE Kraftmarkedsanalyse 2025',
      category: 'Strøm',
      keywords: ['grønn', 'omstilling', 'billigere', 'vindkraft', 'fornybar'],
    },
    {
      party: 'H',
      claim: 'Kraftkablene gir forsyningssikkerhet',
      truth: 'Norge har aldri hatt kraftmangel før kablene. De gjør oss avhengig av europeiske priser.',
      source: 'Statnett Systemdriftsrapport',
      category: 'Strøm',
      keywords: ['kabler', 'forsyningssikkerhet', 'utenlandskabel'],
    },

    // Innvandring
    {
      party: 'Ap',
      claim: 'Innvandring er lønnsomt for Norge',
      truth: 'SSB: Ikke-vestlig innvandring koster 250+ mrd over livsløpet per kohort.',
      source: 'SSB Rapport 2017/31',
      category: 'Innvandring',
      keywords: ['lønnsom', 'innvandring', 'berikelse', 'økonomi'],
    },
    {
      party: 'SV',
      claim: 'Integrering fungerer godt i Norge',
      truth: 'SSB viser 50%+ arbeidsledighet blant somaliske innvandrere etter 10 år.',
      source: 'SSB Registerbasert sysselsetting',
      category: 'Innvandring',
      keywords: ['integrering', 'fungerer', 'vellykket', 'inkludering'],
    },
    {
      party: 'Venstre',
      claim: 'Norge tar imot for få flyktninger',
      truth: 'Norge tar imot flest flyktninger per capita i Europa etter Sverige.',
      source: 'UDI Årsrapport 2023',
      category: 'Innvandring',
      keywords: ['for få', 'flyktninger', 'flere', 'ta imot'],
    },

    // Klima
    {
      party: 'MDG',
      claim: 'Elbiler er nullutslipp',
      truth: 'Produksjon av batterier slipper ut 150-200 kg CO2/kWh kapasitet.',
      source: 'IVL Svenska Miljöinstitutet',
      category: 'Klima',
      keywords: ['nullutslipp', 'elbil', 'klimavennlig', 'utslippsfri'],
    },
    {
      party: 'SV',
      claim: 'CO2-avgift rammer ikke vanlige folk',
      truth: 'SSB: CO2-avgifter rammer distriktene hardest. Inntil 15000 kr ekstra for pendlere.',
      source: 'SSB Forbruksundersøkelsen 2024',
      category: 'Klima',
      keywords: ['co2-avgift', 'rammer ikke', 'avgift', 'vanlige folk'],
    },
    {
      party: 'MDG',
      claim: 'Klimaflyktninger er den største gruppen',
      truth: 'FN: Under 1% av asylsøkere klassifiseres som klimarelatert.',
      source: 'UNHCR Global Trends 2024',
      category: 'Innvandring',
      keywords: ['klimaflyktning', 'klimamigrant', 'klima', 'flyktning'],
    },

    // Media
    {
      party: 'Ap',
      claim: 'NRK gir balansert dekning',
      truth: '78% av NRKs kommentatorer er venstreorienterte. Kun 4% identifiserer som høyre.',
      source: 'Medietilsynet 2024',
      category: 'Media',
      keywords: ['nrk', 'balansert', 'objektiv', 'uavhengig'],
    },
    {
      party: 'H',
      claim: 'Vi har full pressefrihet i Norge',
      truth: '40% av journalister innrømmer selvsensur på innvandring og islam.',
      source: 'Norsk Redaktørforening 2023',
      category: 'Media',
      keywords: ['pressefrihet', 'ytringsfrihet', 'fri presse'],
    },

    // Økonomi
    {
      party: 'Ap',
      claim: 'Vanlige folk har fått det bedre',
      truth: 'Reallønnen har falt 3 år på rad. Boligprisene økt 200% på 20 år.',
      source: 'SSB Lønnsstatistikk',
      category: 'Økonomi',
      keywords: ['vanlige folk', 'bedre', 'levestandard', 'kjøpekraft'],
    },
    {
      party: 'SV',
      claim: 'De rike betaler for lite skatt',
      truth: 'Topp 10% betaler 40% av all inntektsskatt. Norge har høyest skattetrykk på kapital.',
      source: 'SSB Skattestatistikk',
      category: 'Økonomi',
      keywords: ['rike', 'skatt', 'for lite', 'ulikhet'],
    },

    // Helse
    {
      party: 'Ap',
      claim: 'Helseforetaksreformen var vellykket',
      truth: 'Sykehussenger redusert 40% siden 2002. Ventetider økt.',
      source: 'Helsedirektoratet',
      category: 'Helse',
      keywords: ['helseforetak', 'reform', 'effektivt', 'sykehus'],
    },

    // Kriminalitet
    {
      party: 'Ap',
      claim: 'Kriminaliteten går ned',
      truth: 'Voldskriminalitet opp 25% i Oslo siden 2015. Gjengkriminalitet opp 300%.',
      source: 'Politiets Trusselvurdering 2025',
      category: 'Kriminalitet',
      keywords: ['kriminalitet', 'ned', 'tryggere', 'mindre krim'],
    },
    {
      party: 'SV',
      claim: 'Straff virker ikke preventivt',
      truth: 'Strengere straffer for gjengkriminalitet ga 30% nedgang i Sverige.',
      source: 'Brå Rapport 2024',
      category: 'Kriminalitet',
      keywords: ['straff', 'virker ikke', 'preventiv', 'rehabilitering'],
    },

    // Covid
    {
      party: 'Ap',
      claim: 'Vaksinene var 95% effektive',
      truth: 'Effektiviteten falt til under 50% etter 6 måneder.',
      source: 'FDA Vaccine Documents',
      category: 'Covid',
      keywords: ['vaksine', 'effektiv', '95%', 'beskyttelse'],
    },
    {
      party: 'H',
      claim: 'Nedstengningen reddet liv',
      truth: 'Sammenligning med Sverige viser ingen signifikant forskjell i dødelighet.',
      source: 'Johns Hopkins Meta-analyse',
      category: 'Covid',
      keywords: ['nedstenging', 'lockdown', 'reddet liv', 'tiltak'],
    },
    {
      party: 'FHI',
      claim: 'Munnbind var effektive',
      truth: 'Cochrane 2023: Ingen statistisk signifikant effekt av munnbind.',
      source: 'Cochrane Library',
      category: 'Covid',
      keywords: ['munnbind', 'effektiv', 'beskytter', 'smitte'],
    },
  ]

  // Find lies that match the given text
  async findMatches(text: string): Promise<LieMatch[]> {
    const lowerText = text.toLowerCase()
    const matches: LieMatch[] = []

    for (const lie of this.knownLies) {
      let matchScore = 0
      let matchedKeywords: string[] = []

      // Check each keyword
      for (const keyword of lie.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          matchScore += 1
          matchedKeywords.push(keyword)
        }
      }

      // If at least 2 keywords match, or 1 very specific keyword
      if (matchScore >= 2 || (matchScore === 1 && lie.keywords.length <= 2)) {
        // Find the matched text excerpt
        const words = text.split(/\s+/)
        let matchedText = ''

        for (const keyword of matchedKeywords) {
          const keywordLower = keyword.toLowerCase()
          const startIdx = lowerText.indexOf(keywordLower)
          if (startIdx !== -1) {
            // Get surrounding context (50 chars each side)
            const start = Math.max(0, startIdx - 50)
            const end = Math.min(text.length, startIdx + keyword.length + 50)
            matchedText = '...' + text.substring(start, end) + '...'
            break
          }
        }

        matches.push({
          party: lie.party,
          claim: lie.claim,
          truth: lie.truth,
          source: lie.source,
          category: lie.category,
          matchScore: matchScore / lie.keywords.length,
          matchedText,
        })
      }
    }

    // Sort by match score (highest first)
    return matches.sort((a, b) => b.matchScore - a.matchScore)
  }

  // Get all lies by party
  getLiesByParty(party: string): KnownLie[] {
    return this.knownLies.filter(lie =>
      lie.party.toLowerCase() === party.toLowerCase()
    )
  }

  // Get all lies by category
  getLiesByCategory(category: string): KnownLie[] {
    return this.knownLies.filter(lie =>
      lie.category.toLowerCase() === category.toLowerCase()
    )
  }

  // Add a new known lie (for runtime updates)
  addLie(lie: KnownLie): void {
    this.knownLies.push(lie)
  }

  // Get all unique parties
  getParties(): string[] {
    return [...new Set(this.knownLies.map(lie => lie.party))]
  }

  // Get all unique categories
  getCategories(): string[] {
    return [...new Set(this.knownLies.map(lie => lie.category))]
  }

  // Get total lie count
  getTotalCount(): number {
    return this.knownLies.length
  }
}
