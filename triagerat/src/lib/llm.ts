import type { GithubIssue, TriageResult } from './types';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

const CATEGORIES = [
  'Bug',
  'Feature',
  'Question',
  'Duplicate',
  'Invalid',
  'Needs reproduction',
  'Security concern',
  'Documentation',
] as const;

const PRIORITIES = ['P0 critical', 'P1 important', 'P2 normal', 'P3 low'] as const;

const ASSIGNEE_TYPES = [
  'Security team',
  'Backend maintainer',
  'Frontend maintainer',
  'Docs team',
  'Triage volunteer',
  'Product / maintainer',
] as const;

function buildPrompt(issue: GithubIssue, candidates: { number: number; title: string }[]): string {
  const candidateList = candidates
    .slice(0, 30)
    .map((c) => `#${c.number}: ${c.title}`)
    .join('\n');

  return `Du er TriageRat, en assistent som hjelper maintainere med å triagere GitHub issues.

Analyser issuet under og svar KUN med ett JSON-objekt (ingen markdown, ingen forklaring utenfor JSON) med disse feltene:
{
  "category": one of ${JSON.stringify(CATEGORIES)},
  "priority": one of ${JSON.stringify(PRIORITIES)},
  "isSecurity": boolean,
  "suggestedLabels": string[] (kebab-case GitHub labels, maks 4),
  "maintainerResponse": string (kort, vennlig utkast til svar fra maintainer, på norsk eller engelsk basert på issuets språk),
  "reproductionRequest": string | null (be om reproduksjonssteg KUN hvis kategori er "Bug" eller "Needs reproduction" og issuet mangler steg-for-steg),
  "duplicateOf": { "issueNumber": number, "confidence": number (0-1) } | null,
  "suggestedAssigneeType": one of ${JSON.stringify(ASSIGNEE_TYPES)},
  "rationale": string (1-2 setninger som forklarer klassifiseringen)
}

VIKTIGE REGLER:
- Hvis kategori er "Security concern", IKKE inkluder konkrete utnyttelsesdetaljer (exploit-detaljer, PoC, sårbare versjoner) i "maintainerResponse" eller "reproductionRequest" — disse feltene blir potensielt postet offentlig. Henvis i stedet til at maintainere bør håndtere saken privat (f.eks. via security advisory / privat e-post).
- "duplicateOf" skal kun settes hvis du finner et åpent issue under som tydelig beskriver samme problem. Sett confidence lavt (<0.5) hvis du er usikker, og sett feltet til null hvis ingen god kandidat finnes.
- Foreslå aldri å lukke issuet — du gir kun forslag, ingen handlinger blir utført automatisk.

Issue #${issue.number}
Title: ${issue.title}
Author: ${issue.user?.login ?? 'unknown'}
Eksisterende labels: ${issue.labels.map((l) => l.name).join(', ') || '(ingen)'}
Body:
${(issue.body || '(tom)').slice(0, 4000)}

Andre åpne issues i repoet (for duplikat-sjekk):
${candidateList || '(ingen andre åpne issues)'}
`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('LLM-svar inneholdt ikke JSON');
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

function coerce<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/**
 * Calls the configured LLM to triage a single issue. Returns null if no LLM
 * API key is configured, so callers can fall back to the heuristic engine.
 */
export async function runLlmTriage(
  issue: GithubIssue,
  candidates: { number: number; title: string }[]
): Promise<TriageResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildPrompt(issue, candidates) }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LLM API-feil (${res.status}): ${body}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? '';
  const parsed = extractJson(text) as Record<string, unknown>;

  const duplicateOfRaw = parsed.duplicateOf as { issueNumber?: number; confidence?: number } | null | undefined;
  let duplicateOf: TriageResult['duplicateOf'] = null;
  if (duplicateOfRaw && typeof duplicateOfRaw.issueNumber === 'number') {
    const match = candidates.find((c) => c.number === duplicateOfRaw.issueNumber);
    if (match) {
      duplicateOf = {
        issueNumber: match.number,
        title: match.title,
        confidence: typeof duplicateOfRaw.confidence === 'number' ? duplicateOfRaw.confidence : 0.5,
      };
    }
  }

  return {
    category: coerce(parsed.category, CATEGORIES, 'Needs reproduction'),
    priority: coerce(parsed.priority, PRIORITIES, 'P2 normal'),
    isSecurity: Boolean(parsed.isSecurity),
    suggestedLabels: Array.isArray(parsed.suggestedLabels)
      ? (parsed.suggestedLabels as unknown[]).filter((l): l is string => typeof l === 'string').slice(0, 4)
      : [],
    maintainerResponse: typeof parsed.maintainerResponse === 'string' ? parsed.maintainerResponse : '',
    reproductionRequest: typeof parsed.reproductionRequest === 'string' ? parsed.reproductionRequest : null,
    duplicateOf,
    suggestedAssigneeType: coerce(parsed.suggestedAssigneeType, ASSIGNEE_TYPES, 'Triage volunteer'),
    rationale: typeof parsed.rationale === 'string' ? parsed.rationale : '',
  };
}
