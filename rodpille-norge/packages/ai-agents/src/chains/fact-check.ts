import OpenAI from 'openai'
import { z } from 'zod'
import { SourceScraper, ScrapedContent } from '../agents/source-scraper'
import { SSBDataFetcher } from '../agents/ssb-fetcher'
import { KnownLiesChecker, LieMatch } from '../agents/lies-checker'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Result schema
export const FactCheckResultSchema = z.object({
  lieScore: z.number().min(0).max(100),
  summary: z.string(),
  claims: z.array(z.object({
    claim: z.string(),
    verdict: z.enum(['true', 'false', 'misleading', 'unverifiable']),
    explanation: z.string(),
    sources: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  })),
  aiReasoning: z.string(),
  knownLieMatches: z.array(z.object({
    party: z.string(),
    claim: z.string(),
    truth: z.string(),
    source: z.string(),
  })),
  officialDataContradictions: z.array(z.object({
    officialClaim: z.string(),
    realData: z.string(),
    source: z.string(),
  })),
  propagandaIndicators: z.array(z.string()),
  redPillFactor: z.number().min(1).max(3), // Multiplier for controversial content
})

export type FactCheckResult = z.infer<typeof FactCheckResultSchema>

export class FactCheckChain {
  private scraper: SourceScraper
  private ssbFetcher: SSBDataFetcher
  private liesChecker: KnownLiesChecker

  constructor() {
    this.scraper = new SourceScraper()
    this.ssbFetcher = new SSBDataFetcher()
    this.liesChecker = new KnownLiesChecker()
  }

  async analyze(sourceUrl: string, postContent: string): Promise<FactCheckResult> {
    // Agent 1: Scrape and summarize source
    console.log('[Agent 1] Scraping source...')
    const scrapedContent = await this.scraper.scrape(sourceUrl)

    // Agent 2: Cross-check against official data and known lies
    console.log('[Agent 2] Cross-checking data...')
    const [ssbData, knownLies] = await Promise.all([
      this.ssbFetcher.findRelevantData(scrapedContent.text),
      this.liesChecker.findMatches(scrapedContent.text),
    ])

    // Agent 3: AI analysis and scoring
    console.log('[Agent 3] AI analysis...')
    const aiAnalysis = await this.performAIAnalysis(
      sourceUrl,
      postContent,
      scrapedContent,
      ssbData,
      knownLies
    )

    return aiAnalysis
  }

  private async performAIAnalysis(
    sourceUrl: string,
    postContent: string,
    scrapedContent: ScrapedContent,
    ssbData: { topic: string; data: string; source: string }[],
    knownLies: LieMatch[]
  ): Promise<FactCheckResult> {
    const systemPrompt = `Du er en norsk faktasjekker for RødPilleNorge-plattformen.
Din oppgave er å analysere innhold kritisk og avdekke løgner, propaganda og villedende informasjon.

Du skal:
1. Identifisere påstander i teksten
2. Verifisere mot offisielle data (SSB, FHI, osv)
3. Sjekke mot kjente politiske løgner
4. Gi en løgn-score fra 0-100 (høy = mye løgn/villedning)
5. Identifisere propaganda-indikatorer (emosjonelt språk, utelatelser, cherry-picking)

Vær KRITISK mot:
- NRK og mainstream media påstander
- Regjeringens uttalelser
- EU/NATO propaganda
- Klimaalarmisme uten data
- Innvandringspropaganda

Svar alltid på norsk. Vær saklig men direkte. Ikke sensurer sannheten.`

    const userPrompt = `
KILDE URL: ${sourceUrl}

BRUKERENS POST:
${postContent}

SKRAPET INNHOLD FRA KILDEN:
${scrapedContent.text.substring(0, 4000)}

RELEVANT SSB-DATA:
${ssbData.map(d => `- ${d.topic}: ${d.data} (Kilde: ${d.source})`).join('\n')}

MATCHENDE KJENTE LØGNER:
${knownLies.map(l => `- Parti: ${l.party}, Påstand: "${l.claim}", Sannhet: "${l.truth}"`).join('\n')}

Analyser dette innholdet og gi en detaljert faktasjekk. Returner JSON i følgende format:
{
  "lieScore": <0-100>,
  "summary": "<kort oppsummering av analysen>",
  "claims": [
    {
      "claim": "<påstand funnet i teksten>",
      "verdict": "<true|false|misleading|unverifiable>",
      "explanation": "<forklaring>",
      "sources": ["<kilde1>", "<kilde2>"],
      "confidence": <0-1>
    }
  ],
  "aiReasoning": "<din resonnering>",
  "knownLieMatches": [<matching lies>],
  "officialDataContradictions": [
    {
      "officialClaim": "<hva offisielle kilder sier>",
      "realData": "<hva data faktisk viser>",
      "source": "<kilde>"
    }
  ],
  "propagandaIndicators": ["<indikator1>", "<indikator2>"],
  "redPillFactor": <1-3>
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    try {
      const parsed = JSON.parse(content)
      return FactCheckResultSchema.parse(parsed)
    } catch (error) {
      // Return a default result if parsing fails
      return {
        lieScore: 50,
        summary: 'Kunne ikke fullføre analyse',
        claims: [],
        aiReasoning: 'Analyse feilet - manuell gjennomgang anbefales',
        knownLieMatches: knownLies.map(l => ({
          party: l.party,
          claim: l.claim,
          truth: l.truth,
          source: l.source,
        })),
        officialDataContradictions: [],
        propagandaIndicators: [],
        redPillFactor: 1,
      }
    }
  }

  // Quick check without full scraping (for comments etc)
  async quickCheck(text: string): Promise<{ lieScore: number; flags: string[] }> {
    const knownLies = await this.liesChecker.findMatches(text)

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Du er en faktasjekker. Gi en rask løgn-score (0-100) og liste over røde flagg. Svar som JSON: {"lieScore": number, "flags": string[]}',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return { lieScore: 0, flags: [] }
    }

    try {
      const parsed = JSON.parse(content)
      // Add flags for known lie matches
      const lieFlags = knownLies.map(l => `Matcher kjent løgn fra ${l.party}`)
      return {
        lieScore: parsed.lieScore || 0,
        flags: [...(parsed.flags || []), ...lieFlags],
      }
    } catch {
      return { lieScore: 0, flags: [] }
    }
  }
}
