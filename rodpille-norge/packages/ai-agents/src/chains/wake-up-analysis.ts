import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface WakeUpResult {
  targetPost: string
  personalizedMessage: string
  keyPoints: string[]
  suggestedSources: string[]
  redPillLevel: 'gentle' | 'moderate' | 'hardcore'
  tone: string
}

export class WakeUpAnalysis {
  /**
   * "Rist Våken" feature - generates a personalized AI analysis
   * to send to someone who posted something questionable
   */
  async generateWakeUpMessage(
    postContent: string,
    postAuthor: string,
    requestingUserContext?: string
  ): Promise<WakeUpResult> {
    const systemPrompt = `Du er en "Rød Pille"-veileder for RødPilleNorge.
Din oppgave er å skrive en personlig melding til noen som har delt noe som virker å være basert på
mainstream narrativ eller mangler kritisk analyse.

Meldingen skal:
1. Være respektfull men direkte
2. Stille gode spørsmål
3. Presentere alternative fakta
4. Linke til troverdige kilder
5. Ikke være nedlatende

Tilpass "rød pille-nivået":
- gentle: For folk som kanskje bare ikke har tenkt over det
- moderate: For folk som gjentar mainstream talking points
- hardcore: For folk som aktivt sprer propaganda

Svar som JSON:
{
  "targetPost": "Oppsummering av hva personen skrev",
  "personalizedMessage": "Din personlige melding til dem (200-400 ord)",
  "keyPoints": ["Hovedpunkt 1", "Hovedpunkt 2", ...],
  "suggestedSources": ["URL eller kildenavn 1", ...],
  "redPillLevel": "gentle|moderate|hardcore",
  "tone": "Beskrivelse av tonen i meldingen"
}`

    const userPrompt = `
INNLEGG SOM SKAL "VEKKES":
"${postContent}"

Forfatter: ${postAuthor}

${requestingUserContext ? `EKSTRA KONTEKST FRA DEN SOM BER OM ANALYSE:\n${requestingUserContext}` : ''}

Generer en "Rist Våken"-melding.
`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1500,
      })

      const result = JSON.parse(response.choices[0]?.message?.content || '{}')

      return {
        targetPost: result.targetPost || postContent.substring(0, 100),
        personalizedMessage: result.personalizedMessage || 'Kunne ikke generere melding',
        keyPoints: result.keyPoints || [],
        suggestedSources: result.suggestedSources || ['document.no', 'resett.no'],
        redPillLevel: result.redPillLevel || 'moderate',
        tone: result.tone || 'Saklig og nysgjerrig',
      }
    } catch (error) {
      console.error('Wake-up analysis failed:', error)
      return {
        targetPost: postContent.substring(0, 100),
        personalizedMessage: 'Hei! Har du tenkt over dette fra en annen vinkel?',
        keyPoints: ['Mainstream media gir ikke alltid hele bildet'],
        suggestedSources: ['document.no', 'resett.no', 'rights.no'],
        redPillLevel: 'gentle',
        tone: 'Standard',
      }
    }
  }

  /**
   * Quick analysis of content for "blue pill" indicators
   */
  async analyzeBluePillIndicators(content: string): Promise<{
    indicators: string[]
    score: number // 0-100, higher = more "blue pilled"
    suggestions: string[]
  }> {
    const bluePillPhrases = [
      { phrase: 'ekspertene sier', weight: 10 },
      { phrase: 'forskning viser', weight: 5 }, // Can be good or bad
      { phrase: 'ifølge nrk', weight: 15 },
      { phrase: 'myndighetene anbefaler', weight: 10 },
      { phrase: 'konspirasjonsteorier', weight: 20 },
      { phrase: 'faktasjekk', weight: 10 }, // Mainstream "fact checkers"
      { phrase: 'ekstremist', weight: 15 },
      { phrase: 'høyreekstrem', weight: 20 },
      { phrase: 'klimafornekter', weight: 15 },
      { phrase: 'hat', weight: 10 },
      { phrase: 'rasist', weight: 15 },
      { phrase: 'populist', weight: 10 },
      { phrase: 'vaksinemotstand', weight: 10 },
      { phrase: 'desinformasjon', weight: 15 },
      { phrase: 'tilliten til', weight: 5 },
    ]

    const lowerContent = content.toLowerCase()
    const foundIndicators: string[] = []
    let score = 0

    for (const { phrase, weight } of bluePillPhrases) {
      if (lowerContent.includes(phrase)) {
        foundIndicators.push(phrase)
        score += weight
      }
    }

    // Normalize score
    score = Math.min(100, score)

    const suggestions: string[] = []
    if (foundIndicators.includes('ekspertene sier')) {
      suggestions.push('Sjekk hvem disse "ekspertene" er og hvem som finansierer dem')
    }
    if (foundIndicators.includes('ifølge nrk')) {
      suggestions.push('Sammenlign med alternative kilder som Document.no')
    }
    if (foundIndicators.includes('konspirasjonsteorier')) {
      suggestions.push('Mange "konspirasjonsteorier" har vist seg å være sanne')
    }

    return {
      indicators: foundIndicators,
      score,
      suggestions,
    }
  }

  /**
   * Generate counter-arguments for common mainstream narratives
   */
  getCounterArguments(narrative: string): string[] {
    const counterArguments: Record<string, string[]> = {
      'innvandring er lønnsomt': [
        'SSB Rapport 2017/31 viser motsatt: Netto kostnad 250+ mrd per kohort',
        'Kun EØS-arbeidsinnvandring er lønnsom',
        'Spør: Hvorfor må vi ha "integrering" hvis det er så vellykket?',
      ],
      'strømprisene skyldes krigen': [
        'Prisene begynte å stige før krigen (2021)',
        'Norge eksporterer rekordmengder strøm',
        'Kablene ble bygget med vilje for å koble oss til EU-priser',
      ],
      'nrk er objektiv': [
        'Medietilsynet: 78% av journalister er venstreorienterte',
        'NRK får 6.8 mrd over statsbudsjettet',
        'Alternative medier får null støtte',
      ],
      'vaksinene var effektive': [
        'Effektiviteten falt til under 50% etter 6 måneder',
        'Pfizers egne dokumenter viser mange bivirkninger',
        'Cochrane 2023: Munnbind hadde ingen effekt',
      ],
    }

    const lowerNarrative = narrative.toLowerCase()
    for (const [key, args] of Object.entries(counterArguments)) {
      if (lowerNarrative.includes(key)) {
        return args
      }
    }

    return ['Be alltid om primærkilder', 'Sammenlign med alternative medier', 'Følg pengene']
  }
}
