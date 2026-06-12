import { heuristicTriage } from './heuristics';
import { runLlmTriage } from './llm';
import type { GithubIssue, TriageResult } from './types';

const SECURITY_DETAIL_PATTERN = /(cve-\d{4}-\d+|exploit|poc|proof of concept|payload|sårbar versjon)/i;

/**
 * Safety net: even if the LLM (or heuristic) generates text containing
 * exploit-style details for a security-classified issue, strip it before it
 * can be surfaced as a "post publicly" suggestion. The dashboard additionally
 * blocks publishing security-classified comments without explicit override.
 */
function sanitizeSecurityText(text: string): string {
  if (!SECURITY_DETAIL_PATTERN.test(text)) return text;
  return (
    'This issue has been flagged as a potential security concern. Details have been withheld from this ' +
    'auto-generated response — please coordinate privately (e.g. security advisory) rather than discussing ' +
    'specifics in this public thread.'
  );
}

function applySecuritySafety(result: TriageResult): TriageResult {
  if (!result.isSecurity && result.category !== 'Security concern') return result;

  return {
    ...result,
    category: 'Security concern',
    isSecurity: true,
    priority: result.priority === 'P3 low' || result.priority === 'P2 normal' ? 'P1 important' : result.priority,
    suggestedAssigneeType: 'Security team',
    maintainerResponse: sanitizeSecurityText(result.maintainerResponse),
    reproductionRequest: result.reproductionRequest ? sanitizeSecurityText(result.reproductionRequest) : null,
    suggestedLabels: Array.from(new Set([...result.suggestedLabels, 'security'])),
  };
}

/**
 * Runs triage for a single issue: tries the configured LLM first, falling
 * back to the local heuristic engine if no LLM key is set or the call fails.
 * Returns the result plus which engine produced it.
 */
export async function triageIssue(
  issue: GithubIssue,
  candidates: { number: number; title: string }[]
): Promise<{ result: TriageResult; engine: 'llm' | 'heuristic' }> {
  try {
    const llmResult = await runLlmTriage(issue, candidates);
    if (llmResult) {
      return { result: applySecuritySafety(llmResult), engine: 'llm' };
    }
  } catch (err) {
    // Fall through to heuristic engine on any LLM failure (e.g. rate limit,
    // network error, malformed response).
    console.error(`LLM triage failed for #${issue.number}, falling back to heuristics:`, err);
  }

  return { result: applySecuritySafety(heuristicTriage(issue, candidates)), engine: 'heuristic' };
}
