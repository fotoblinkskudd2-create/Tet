export interface ArgumentAnalysis {
  score: number; // 1-10
  fallacies: string[];
  summary: string;
}

export async function analyzeArgument(
  claimTitle: string,
  claimDescription: string,
  argumentContent: string,
  side: 'pro' | 'con'
): Promise<ArgumentAnalysis> {
  // This would call Claude API or other LLM
  // For now, we'll use a mock implementation

  const prompt = `Du er en logikkdommer som analyserer argumenter i en debatt.

Påstand: "${claimTitle}"
Kontekst: ${claimDescription}

Argument (${side === 'pro' ? 'FOR' : 'MOT'}):
${argumentContent}

Analyser dette argumentet og gi:
1. Score (1-10) basert på logisk styrke og relevans
2. Liste over eventuelle logiske feilslutninger (strawman, ad hominem, slippery slope, cherry picking, false dichotomy, etc.)
3. En kort oppsummering (1-2 setninger) om argumentets styrker og svakheter

Svar i JSON-format:
{
  "score": <number>,
  "fallacies": [<list of strings>],
  "summary": "<string>"
}`;

  try {
    // In production, this would call an actual LLM API
    // For now, return a mock response
    const response = await mockAIAnalysis(argumentContent);
    return response;
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      score: 5,
      fallacies: [],
      summary: 'Kunne ikke analysere argument',
    };
  }
}

// Mock AI analysis for development
async function mockAIAnalysis(content: string): Promise<ArgumentAnalysis> {
  // Simple heuristics for demo purposes
  const score = Math.min(10, Math.max(1, Math.floor(content.length / 50) + 3));

  const fallacies: string[] = [];
  if (content.toLowerCase().includes('alltid') || content.toLowerCase().includes('aldri')) {
    fallacies.push('Absolutt påstand');
  }
  if (content.toLowerCase().includes('idiot') || content.toLowerCase().includes('dum')) {
    fallacies.push('Ad hominem');
  }

  const summary = `Argumentet scorer ${score}/10. ${
    fallacies.length > 0
      ? `Mulige logiske feil: ${fallacies.join(', ')}.`
      : 'Ingen åpenbare logiske feil funnet.'
  }`;

  return { score, fallacies, summary };
}

export async function analyzeClaimArguments(claimId: number) {
  // This would analyze all arguments for a claim and update their AI scores
  // Can be triggered when new arguments are added or periodically
}
