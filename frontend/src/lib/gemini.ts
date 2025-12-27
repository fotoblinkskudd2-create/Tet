import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')

export interface NewsAnalysis {
  verdict: 'truthful' | 'misleading' | 'false' | 'unknown'
  confidence: number
  biasDetected: string[]
  sources: string[]
  ownership: string
  summary: string
  warnings: string[]
}

export async function analyzeNews(articleText: string, source: string): Promise<NewsAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `
Analyser denne nyhetsartikkelen kritisk og brutalt ærlig. Jeg vil ha fullstendig objektiv analyse.

Kilde: ${source}
Artikkel:
${articleText}

Gi meg følgende informasjon i JSON-format:
{
  "verdict": "truthful | misleading | false | unknown",
  "confidence": 0-100,
  "biasDetected": ["list av bias funnet"],
  "sources": ["troverdige kilder som bekrefter/motsier"],
  "ownership": "hvem eier mediet, økonomiske interesser",
  "summary": "kort oppsummering av hva som er sant/usant",
  "warnings": ["advarsler om manipulasjon, utelatelser, etc"]
}

Vær kompromissløs. Avdekk alt.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }

    const analysis: NewsAnalysis = JSON.parse(jsonMatch[0])
    return analysis

  } catch (error) {
    console.error('Gemini analysis failed:', error)
    return {
      verdict: 'unknown',
      confidence: 0,
      biasDetected: ['Analyse feilet - sjekk API-nøkkel'],
      sources: [],
      ownership: 'Ukjent',
      summary: 'Kunne ikke analysere artikkelen. Sjekk API-tilkobling.',
      warnings: ['API-feil']
    }
  }
}

export async function askGemini(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Gemini query failed:', error)
    return 'Kunne ikke få svar fra AI. Sjekk API-nøkkel i .env filen.'
  }
}

export async function getDebtStrategy(
  totalDebt: number,
  monthlyPayment: number,
  debts: Array<{ name: string; amount: number; rate: number }>
): Promise<string> {
  const prompt = `
Jeg har følgende gjeldssituasjon:
- Total gjeld: ${totalDebt} kr
- Månedlig betaling tilgjengelig: ${monthlyPayment} kr
- Individuelle gjeld:
${debts.map(d => `  - ${d.name}: ${d.amount} kr @ ${d.rate}% rente`).join('\n')}

Gi meg en brutal, ærlig analyse:
1. Hvor ille er situasjonen? (ingen bullshit)
2. Hva er raskeste vei ut? (snowball vs avalanche)
3. Konkret handlingsplan for neste 6 måneder
4. Hvor mye av livet mitt kaster jeg bort på renter?

Vær direkte. Ingen sukkerspinn.
`

  return askGemini(prompt)
}
