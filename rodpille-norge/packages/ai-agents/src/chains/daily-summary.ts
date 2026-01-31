import OpenAI from 'openai'
import Parser from 'rss-parser'
import { SourceScraper } from '../agents/source-scraper'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const parser = new Parser()

export interface NewsItem {
  title: string
  link: string
  source: string
  pubDate?: string
  content?: string
}

export interface SummaryResult {
  date: string
  headline: string
  mainStories: {
    title: string
    summary: string
    lieScore: number
    source: string
    link: string
    redPillTake: string
  }[]
  propagandaAlert: string[]
  hiddenStories: string[]
  recommendation: string
}

// RSS sources for alternative news
const RSS_SOURCES = [
  { name: 'Document.no', url: 'https://www.document.no/feed/' },
  { name: 'Resett', url: 'https://resett.no/feed/' },
  { name: 'Rights.no', url: 'https://www.rights.no/feed/' },
  { name: 'Steigan.no', url: 'https://steigan.no/feed/' },
]

// Mainstream sources (for comparison/fact-check)
const MAINSTREAM_SOURCES = [
  { name: 'NRK', url: 'https://www.nrk.no/toppsaker.rss' },
  { name: 'VG', url: 'https://www.vg.no/rss/feed' },
  { name: 'Dagbladet', url: 'https://www.dagbladet.no/rss' },
]

export class DailySummary {
  private scraper: SourceScraper

  constructor() {
    this.scraper = new SourceScraper()
  }

  async fetchRSSFeeds(sources: { name: string; url: string }[]): Promise<NewsItem[]> {
    const items: NewsItem[] = []

    for (const source of sources) {
      try {
        const feed = await parser.parseURL(source.url)
        const feedItems = (feed.items || []).slice(0, 10).map(item => ({
          title: item.title || 'Ukjent tittel',
          link: item.link || '',
          source: source.name,
          pubDate: item.pubDate,
          content: item.contentSnippet || item.content,
        }))
        items.push(...feedItems)
      } catch (error) {
        console.error(`Failed to fetch ${source.name}:`, error)
      }
    }

    return items
  }

  async generateDailySummary(): Promise<SummaryResult> {
    // Fetch from alternative sources
    const altNews = await this.fetchRSSFeeds(RSS_SOURCES)

    // Fetch from mainstream (for comparison)
    const mainNews = await this.fetchRSSFeeds(MAINSTREAM_SOURCES)

    const systemPrompt = `Du er RødPilleNorge's daglige nyhetsanalytiker.
Din oppgave er å:
1. Oppsummere viktige nyheter fra alternative kilder
2. Identifisere propaganda i mainstream media
3. Finne historier som mainstream IKKE dekker
4. Gi en rød pille-vurdering av hver sak

Vær kritisk, saklig og direkte. Fokuser på fakta og avvik mellom alternative og mainstream narrativ.

Svar som JSON med følgende struktur:
{
  "date": "YYYY-MM-DD",
  "headline": "Dagens viktigste avsløring i én setning",
  "mainStories": [
    {
      "title": "Tittel",
      "summary": "2-3 setninger oppsummering",
      "lieScore": 0-100,
      "source": "Kildenavn",
      "link": "URL",
      "redPillTake": "Hva mainstream ikke forteller deg"
    }
  ],
  "propagandaAlert": ["Propaganda-påstand 1 fra mainstream", ...],
  "hiddenStories": ["Historie mainstream ignorerer 1", ...],
  "recommendation": "Hva leseren bør gjøre/lese/dele"
}`

    const userPrompt = `
ALTERNATIVE NYHETER (siste 24 timer):
${altNews.slice(0, 15).map(n => `- ${n.source}: ${n.title}\n  ${n.link}`).join('\n')}

MAINSTREAM NYHETER (for sammenligning):
${mainNews.slice(0, 10).map(n => `- ${n.source}: ${n.title}`).join('\n')}

Analyser dette og lag dagens rød pille-oppsummering.
`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 2000,
      })

      const result = JSON.parse(response.choices[0]?.message?.content || '{}')

      return {
        date: result.date || new Date().toISOString().split('T')[0],
        headline: result.headline || 'Ingen spesielle avsløringer i dag',
        mainStories: result.mainStories || [],
        propagandaAlert: result.propagandaAlert || [],
        hiddenStories: result.hiddenStories || [],
        recommendation: result.recommendation || 'Les alternative kilder og del sannheten',
      }
    } catch (error) {
      console.error('Daily summary generation failed:', error)
      return {
        date: new Date().toISOString().split('T')[0],
        headline: 'Kunne ikke generere oppsummering',
        mainStories: [],
        propagandaAlert: [],
        hiddenStories: [],
        recommendation: 'Sjekk Document.no, Resett og Rights.no for dagens nyheter',
      }
    }
  }

  // Get just the headlines for a quick view
  async getHeadlines(): Promise<NewsItem[]> {
    return this.fetchRSSFeeds(RSS_SOURCES)
  }

  // Get mainstream headlines for comparison
  async getMainstreamHeadlines(): Promise<NewsItem[]> {
    return this.fetchRSSFeeds(MAINSTREAM_SOURCES)
  }
}
