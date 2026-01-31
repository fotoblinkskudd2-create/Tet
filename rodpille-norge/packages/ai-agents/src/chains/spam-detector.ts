import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface SpamResult {
  isSpam: boolean
  spamScore: number // 0-100
  spamType: 'none' | 'bot' | 'shill' | 'commercial' | 'harassment' | 'gibberish'
  confidence: number
  flags: string[]
  shouldFlag: boolean
  shouldShadowBan: boolean
}

export class SpamDetector {
  // Quick heuristic checks (no AI needed)
  private quickChecks(content: string, metadata?: {
    authorAge?: number // Account age in days
    postCount?: number
    consecutivePosts?: number
  }): Partial<SpamResult> {
    const flags: string[] = []
    let spamScore = 0

    // Check content patterns
    const lowerContent = content.toLowerCase()

    // URL spam
    const urlCount = (content.match(/https?:\/\//g) || []).length
    if (urlCount > 3) {
      flags.push('Mange URL-er')
      spamScore += 20
    }

    // Repetitive content
    const words = content.split(/\s+/)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()))
    if (words.length > 10 && uniqueWords.size < words.length * 0.5) {
      flags.push('Repetitivt innhold')
      spamScore += 15
    }

    // ALL CAPS
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
    if (capsRatio > 0.7 && content.length > 20) {
      flags.push('Mye CAPS')
      spamScore += 10
    }

    // Emoji spam
    const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length
    if (emojiCount > 10) {
      flags.push('Emoji-spam')
      spamScore += 15
    }

    // Commercial indicators
    const commercialKeywords = ['kjøp', 'salg', 'tilbud', 'gratis', 'rabatt', 'bestill', 'klikk her']
    for (const keyword of commercialKeywords) {
      if (lowerContent.includes(keyword)) {
        flags.push('Kommersiell indikator')
        spamScore += 10
        break
      }
    }

    // Shill detection (defending mainstream aggressively)
    const shillPhrases = [
      'konspirasjonsteoretiker',
      'sølvfoliehatt',
      'antivaxxer',
      'klimafornekter',
      'rasistisk å',
      'rapporter dette',
    ]
    for (const phrase of shillPhrases) {
      if (lowerContent.includes(phrase)) {
        flags.push('Mulig shill-oppførsel')
        spamScore += 20
        break
      }
    }

    // Account age checks
    if (metadata?.authorAge !== undefined && metadata.authorAge < 1) {
      flags.push('Ny konto')
      spamScore += 15
    }

    // Rapid posting
    if (metadata?.consecutivePosts !== undefined && metadata.consecutivePosts > 5) {
      flags.push('Mange poster på kort tid')
      spamScore += 20
    }

    // Very short or very long content
    if (content.length < 10) {
      flags.push('Veldig kort innhold')
      spamScore += 10
    } else if (content.length > 5000) {
      flags.push('Veldig langt innhold')
      spamScore += 5
    }

    return { flags, spamScore: Math.min(100, spamScore) }
  }

  async analyze(
    content: string,
    metadata?: {
      authorAge?: number
      postCount?: number
      consecutivePosts?: number
      isReply?: boolean
    }
  ): Promise<SpamResult> {
    // Run quick checks first
    const quickResult = this.quickChecks(content, metadata)

    // If quick checks are very conclusive, skip AI
    if (quickResult.spamScore! >= 60) {
      return {
        isSpam: true,
        spamScore: quickResult.spamScore!,
        spamType: this.determineSpamType(quickResult.flags!),
        confidence: 0.8,
        flags: quickResult.flags!,
        shouldFlag: true,
        shouldShadowBan: quickResult.spamScore! >= 80,
      }
    }

    if (quickResult.spamScore! <= 10 && content.length > 50) {
      return {
        isSpam: false,
        spamScore: quickResult.spamScore!,
        spamType: 'none',
        confidence: 0.9,
        flags: quickResult.flags!,
        shouldFlag: false,
        shouldShadowBan: false,
      }
    }

    // Use AI for borderline cases
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Du analyserer innhold for spam/trolling på en politisk plattform.
VIKTIG: Politisk kontroversielt innhold er IKKE spam. Kritikk av regjeringen, media eller innvandring er TILLATT.

Spam inkluderer:
- Bot-generert innhold
- Shills som angriper brukere personlig
- Kommersiell spam
- Trakassering og trusler
- Meningsløst/gibberish

Svar som JSON: {"isSpam": boolean, "spamType": "none|bot|shill|commercial|harassment|gibberish", "confidence": 0-1, "reasoning": "kort forklaring"}`
          },
          {
            role: 'user',
            content: `Analyser dette innholdet:\n\n"${content.substring(0, 1000)}"\n\nKontekst: ${metadata?.isReply ? 'Dette er en kommentar/svar' : 'Dette er en post'}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 300,
      })

      const aiResult = JSON.parse(response.choices[0]?.message?.content || '{}')

      const combinedScore = Math.round(
        (quickResult.spamScore! + (aiResult.isSpam ? 50 : 0)) / 2
      )

      return {
        isSpam: aiResult.isSpam || combinedScore >= 50,
        spamScore: combinedScore,
        spamType: aiResult.spamType || 'none',
        confidence: aiResult.confidence || 0.7,
        flags: quickResult.flags!,
        shouldFlag: combinedScore >= 40,
        shouldShadowBan: combinedScore >= 70,
      }
    } catch (error) {
      // Fall back to quick check results
      return {
        isSpam: quickResult.spamScore! >= 50,
        spamScore: quickResult.spamScore!,
        spamType: this.determineSpamType(quickResult.flags!),
        confidence: 0.5,
        flags: quickResult.flags!,
        shouldFlag: quickResult.spamScore! >= 40,
        shouldShadowBan: quickResult.spamScore! >= 70,
      }
    }
  }

  private determineSpamType(flags: string[]): SpamResult['spamType'] {
    if (flags.includes('Mulig shill-oppførsel')) return 'shill'
    if (flags.includes('Kommersiell indikator')) return 'commercial'
    if (flags.includes('Mange poster på kort tid') || flags.includes('Ny konto')) return 'bot'
    if (flags.includes('Repetitivt innhold')) return 'gibberish'
    return 'none'
  }

  // Batch analysis for moderation queue
  async analyzeMultiple(items: { id: string; content: string }[]): Promise<Map<string, SpamResult>> {
    const results = new Map<string, SpamResult>()

    await Promise.all(
      items.map(async item => {
        const result = await this.analyze(item.content)
        results.set(item.id, result)
      })
    )

    return results
  }
}
