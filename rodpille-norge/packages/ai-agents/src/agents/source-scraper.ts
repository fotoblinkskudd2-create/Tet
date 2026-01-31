import * as cheerio from 'cheerio'

export interface ScrapedContent {
  url: string
  title: string
  text: string
  author?: string
  publishDate?: string
  images: string[]
  domain: string
  isPaywalled: boolean
}

export class SourceScraper {
  private knownPaywallDomains = [
    'aftenposten.no',
    'dn.no',
    'e24.no',
    'bt.no',
    'nettavisen.no',
  ]

  private trustedDomains = [
    'document.no',
    'resett.no',
    'rights.no',
    'steigan.no',
    'ssb.no',
    'fhi.no',
    'regjeringen.no',
  ]

  async scrape(url: string): Promise<ScrapedContent> {
    try {
      const domain = new URL(url).hostname.replace('www.', '')

      // Check for paywall
      const isPaywalled = this.knownPaywallDomains.some(d => domain.includes(d))

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RodPilleBot/1.0; +https://rodpillenorge.no/bot)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'no,nb,nn,en',
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // Remove unwanted elements
      $('script, style, nav, header, footer, aside, .ad, .advertisement, .cookie-banner').remove()

      // Extract title
      const title = $('h1').first().text().trim() ||
        $('meta[property="og:title"]').attr('content') ||
        $('title').text().trim() ||
        'Ukjent tittel'

      // Extract main content
      let text = ''

      // Try common article selectors
      const articleSelectors = [
        'article',
        '.article-content',
        '.post-content',
        '.entry-content',
        '.story-body',
        'main',
        '[role="main"]',
      ]

      for (const selector of articleSelectors) {
        const content = $(selector).first()
        if (content.length) {
          text = content.text().trim()
          break
        }
      }

      // Fallback to body
      if (!text) {
        text = $('body').text().trim()
      }

      // Clean up whitespace
      text = text.replace(/\s+/g, ' ').trim()

      // Extract author
      const author = $('[rel="author"]').text().trim() ||
        $('meta[name="author"]').attr('content') ||
        $('.author').first().text().trim() ||
        undefined

      // Extract publish date
      const publishDate = $('time').attr('datetime') ||
        $('meta[property="article:published_time"]').attr('content') ||
        undefined

      // Extract images
      const images: string[] = []
      $('article img, .article-content img, main img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src')
        if (src && !src.includes('avatar') && !src.includes('logo')) {
          images.push(src.startsWith('http') ? src : new URL(src, url).href)
        }
      })

      return {
        url,
        title,
        text: text.substring(0, 10000), // Limit text length
        author,
        publishDate,
        images: images.slice(0, 5),
        domain,
        isPaywalled,
      }
    } catch (error) {
      console.error('Scraping failed:', error)
      return {
        url,
        title: 'Kunne ikke laste innhold',
        text: '',
        images: [],
        domain: new URL(url).hostname,
        isPaywalled: false,
      }
    }
  }

  // Batch scrape multiple URLs
  async scrapeMultiple(urls: string[]): Promise<ScrapedContent[]> {
    return Promise.all(urls.map(url => this.scrape(url)))
  }

  // Check if domain is trusted
  isTrusted(url: string): boolean {
    try {
      const domain = new URL(url).hostname.replace('www.', '')
      return this.trustedDomains.some(d => domain.includes(d))
    } catch {
      return false
    }
  }

  // Get domain trust level
  getTrustLevel(url: string): 'high' | 'medium' | 'low' | 'unknown' {
    try {
      const domain = new URL(url).hostname.replace('www.', '')

      if (this.trustedDomains.some(d => domain.includes(d))) {
        return 'high'
      }

      // Official sources
      if (domain.endsWith('.no') && (
        domain.includes('regjeringen') ||
        domain.includes('stortinget') ||
        domain.includes('ssb') ||
        domain.includes('fhi')
      )) {
        return 'medium' // Official but potentially biased
      }

      // Mainstream media (known for bias)
      if (['nrk.no', 'vg.no', 'dagbladet.no', 'tv2.no'].some(d => domain.includes(d))) {
        return 'low'
      }

      return 'unknown'
    } catch {
      return 'unknown'
    }
  }
}
