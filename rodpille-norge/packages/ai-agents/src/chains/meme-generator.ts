import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface MemeResult {
  topText: string
  bottomText: string
  overlayText?: string
  suggestedHashtags: string[]
  tweetText: string
}

// Meme templates
const MEME_TEMPLATES = {
  'LØGN': {
    style: 'stamp',
    color: '#ff0000',
    rotation: -15,
  },
  'VÅKN OPP': {
    style: 'banner',
    color: '#ff4444',
    rotation: 0,
  },
  'PROPAGANDA': {
    style: 'stamp',
    color: '#ff6600',
    rotation: 10,
  },
  'AVSLØRT': {
    style: 'banner',
    color: '#00ff00',
    rotation: -5,
  },
  'SENSURERT': {
    style: 'redacted',
    color: '#000000',
    rotation: 0,
  },
  'SVINDEL': {
    style: 'stamp',
    color: '#ff0066',
    rotation: -20,
  },
}

export class MemeGenerator {
  async generateMemeText(
    content: string,
    imageDescription?: string,
    targetEmotion: 'anger' | 'shock' | 'mockery' | 'awakening' = 'awakening'
  ): Promise<MemeResult> {
    const emotionPrompts: Record<string, string> = {
      anger: 'skape sinne og frustrasjon mot systemet',
      shock: 'sjokkere og vekke folk med fakta',
      mockery: 'håne og latterliggjøre politikere/media',
      awakening: 'vekke folk til å se sannheten',
    }

    const systemPrompt = `Du er en meme-tekst generator for RødPilleNorge.
Lag slagkraftige, korte tekster som skal ${emotionPrompts[targetEmotion]}.

Stilen skal være:
- Direkte og konfronterende
- Norsk slang OK
- CAPS for emphasis
- Korte, punchige setninger
- Hashtags som treffer

Svar som JSON:
{
  "topText": "Tekst øverst (maks 50 tegn)",
  "bottomText": "Tekst nederst (maks 50 tegn)",
  "overlayText": "LØGN|VÅKN OPP|PROPAGANDA|AVSLØRT|SENSURERT|SVINDEL",
  "suggestedHashtags": ["#tag1", "#tag2", "#tag3"],
  "tweetText": "Full tweet-tekst (maks 280 tegn)"
}`

    const userPrompt = `
INNHOLD Å LAGE MEME AV:
${content.substring(0, 1000)}

${imageDescription ? `BILDE BESKRIVELSE: ${imageDescription}` : ''}

Lag en meme som ${emotionPrompts[targetEmotion]}.
`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 500,
      })

      const result = JSON.parse(response.choices[0]?.message?.content || '{}')

      return {
        topText: result.topText || '',
        bottomText: result.bottomText || '',
        overlayText: result.overlayText || 'VÅKN OPP',
        suggestedHashtags: result.suggestedHashtags || ['#RødPilleNorge', '#VåknOpp'],
        tweetText: result.tweetText || '',
      }
    } catch (error) {
      console.error('Meme generation failed:', error)
      return {
        topText: 'SYSTEMET',
        bottomText: 'LYVER TIL DEG',
        overlayText: 'VÅKN OPP',
        suggestedHashtags: ['#RødPilleNorge', '#VåknOpp', '#Norge'],
        tweetText: 'Våkn opp Norge! 🔴 #RødPilleNorge',
      }
    }
  }

  // Get available overlay templates
  getTemplates(): typeof MEME_TEMPLATES {
    return MEME_TEMPLATES
  }

  // Generate share text for X (Twitter)
  generateShareText(title: string, tags: string[], url?: string): string {
    const hashtags = tags.slice(0, 3).map(t => `#${t.replace('#', '')}`).join(' ')
    const baseText = `${title} ${hashtags}`

    if (url) {
      const maxTitleLength = 280 - url.length - hashtags.length - 3
      const truncatedTitle = title.length > maxTitleLength
        ? title.substring(0, maxTitleLength - 3) + '...'
        : title
      return `${truncatedTitle} ${hashtags}\n${url}`
    }

    return baseText.substring(0, 280)
  }

  // Generate viral hooks
  generateViralHooks(topic: string): string[] {
    const templates = [
      `DET DE IKKE VIL AT DU SKAL VITE OM ${topic.toUpperCase()}`,
      `SJOKKERENDE: Sannheten om ${topic}`,
      `Hvorfor snakker ikke NRK om dette? ${topic}`,
      `${topic}: Løgnen som koster Norge milliarder`,
      `AVSLØRT: ${topic} - det fullstendige bildet`,
      `Folk våkner opp! ${topic} er bare begynnelsen`,
      `Eliten frykter at du finner ut dette om ${topic}`,
    ]
    return templates
  }
}
