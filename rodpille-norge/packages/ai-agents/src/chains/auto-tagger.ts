import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TagResult {
  tags: string[]
  suggestedTitle?: string
  contentType: 'news' | 'opinion' | 'analysis' | 'meme' | 'video' | 'other'
  controversialScore: number // 1-10
}

// Predefined tag categories
const TAG_CATEGORIES = {
  topics: [
    'Strømtyveri',
    'NRKPropaganda',
    'InnvandringKostnader',
    'Elitekorrupsjon',
    'Klimabløff',
    'Skattehelvete',
    'Helsekrise',
    'GjengKrim',
    'MediaLøgn',
    'EUDiktatur',
    'NATOKrig',
    'CovidLøgn',
    'SensorurNorge',
    'PolitikerLønn',
    'DistriktsDød',
  ],
  parties: [
    'ApLøgn',
    'HøyreSvindel',
    'SVUtopi',
    'MDGGalskap',
    'VenstreSvikt',
    'SpFiasko',
    'FrpNå',
    'RødtKommunisme',
    'KrFHykleri',
  ],
  actions: [
    'VåknOpp',
    'DelDette',
    'Skandale',
    'Avslørt',
    'Sensurert',
    'MåSes',
    'Urovekkende',
    'Sjokkerende',
  ],
}

export class ContentTagger {
  async analyze(content: string, title?: string, sourceUrl?: string): Promise<TagResult> {
    const systemPrompt = `Du er en innholdstagger for RødPilleNorge.
Din oppgave er å analysere innhold og foreslå relevante tagger.

TILGJENGELIGE TAGGER:
Temaer: ${TAG_CATEGORIES.topics.join(', ')}
Partier: ${TAG_CATEGORIES.parties.join(', ')}
Handlinger: ${TAG_CATEGORIES.actions.join(', ')}

Velg 3-7 mest relevante tagger. Prioriter spesifikke tagger over generelle.
Gi også en kontroversialitetsscore (1-10) basert på hvor mye innholdet utfordrer mainstream narrativ.

Svar som JSON:
{
  "tags": ["tag1", "tag2", ...],
  "suggestedTitle": "Foreslått tittel hvis ingen gitt",
  "contentType": "news|opinion|analysis|meme|video|other",
  "controversialScore": 1-10
}`

    const userPrompt = `
${title ? `TITTEL: ${title}` : ''}
${sourceUrl ? `KILDE: ${sourceUrl}` : ''}

INNHOLD:
${content.substring(0, 3000)}
`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 500,
      })

      const result = JSON.parse(response.choices[0]?.message?.content || '{}')

      // Validate tags against allowed list
      const allTags = [
        ...TAG_CATEGORIES.topics,
        ...TAG_CATEGORIES.parties,
        ...TAG_CATEGORIES.actions,
      ]
      const validTags = (result.tags || []).filter((tag: string) =>
        allTags.includes(tag) || tag.startsWith('#')
      )

      return {
        tags: validTags.length > 0 ? validTags : ['Generelt'],
        suggestedTitle: result.suggestedTitle,
        contentType: result.contentType || 'other',
        controversialScore: Math.min(10, Math.max(1, result.controversialScore || 5)),
      }
    } catch (error) {
      console.error('Auto-tagging failed:', error)
      return {
        tags: ['Generelt'],
        contentType: 'other',
        controversialScore: 5,
      }
    }
  }

  // Quick tag suggestion based on keywords (no AI)
  quickTag(text: string): string[] {
    const lowerText = text.toLowerCase()
    const tags: string[] = []

    const keywordMap: Record<string, string> = {
      'strøm': 'Strømtyveri',
      'energi': 'Strømtyveri',
      'kraft': 'Strømtyveri',
      'nrk': 'NRKPropaganda',
      'innvandr': 'InnvandringKostnader',
      'asyl': 'InnvandringKostnader',
      'flyktning': 'InnvandringKostnader',
      'korrupsjon': 'Elitekorrupsjon',
      'klima': 'Klimabløff',
      'co2': 'Klimabløff',
      'skatt': 'Skattehelvete',
      'avgift': 'Skattehelvete',
      'sykehus': 'Helsekrise',
      'helse': 'Helsekrise',
      'gjeng': 'GjengKrim',
      'vold': 'GjengKrim',
      'krim': 'GjengKrim',
      'media': 'MediaLøgn',
      'presse': 'MediaLøgn',
      'eu': 'EUDiktatur',
      'nato': 'NATOKrig',
      'covid': 'CovidLøgn',
      'vaksine': 'CovidLøgn',
      'sensur': 'SensorurNorge',
      'politiker': 'PolitikerLønn',
      'distrikt': 'DistriktsDød',
    }

    for (const [keyword, tag] of Object.entries(keywordMap)) {
      if (lowerText.includes(keyword) && !tags.includes(tag)) {
        tags.push(tag)
      }
    }

    // Party mentions
    const partyKeywords: Record<string, string> = {
      'arbeiderpartiet': 'ApLøgn',
      'ap ': 'ApLøgn',
      'høyre': 'HøyreSvindel',
      'sv ': 'SVUtopi',
      'mdg': 'MDGGalskap',
      'venstre': 'VenstreSvikt',
      'senterpartiet': 'SpFiasko',
      'sp ': 'SpFiasko',
      'frp': 'FrpNå',
      'rødt': 'RødtKommunisme',
      'krf': 'KrFHykleri',
    }

    for (const [keyword, tag] of Object.entries(partyKeywords)) {
      if (lowerText.includes(keyword) && !tags.includes(tag)) {
        tags.push(tag)
      }
    }

    return tags.slice(0, 7) // Max 7 tags
  }

  // Get all available tags
  getAllTags(): typeof TAG_CATEGORIES {
    return TAG_CATEGORIES
  }
}
