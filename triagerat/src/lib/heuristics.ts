import type { AssigneeType, GithubIssue, IssueCategory, IssuePriority, TriageResult } from './types';

const SECURITY_KEYWORDS = [
  'security',
  'vulnerab',
  'exploit',
  'cve-',
  'rce',
  'remote code execution',
  'xss',
  'sql injection',
  'sqli',
  'csrf',
  'privilege escalation',
  'sårbar',
];

const BUG_KEYWORDS = ['bug', 'crash', 'error', 'feil', 'broken', 'exception', 'stack trace', 'traceback', 'fails', 'failing'];
const FEATURE_KEYWORDS = ['feature request', 'feature', 'would be nice', 'please add', 'enhancement', 'forslag', 'kan vi få'];
const QUESTION_KEYWORDS = ['how do i', 'how to', 'hvordan', 'is it possible', 'question', 'spørsmål', '?'];
const DUPLICATE_KEYWORDS = ['duplicate', 'duplikat', 'already reported', 'see #'];
const INVALID_KEYWORDS = ['spam', 'test issue', 'ignore this', 'not a real issue'];
const DOC_KEYWORDS = ['documentation', 'docs', 'readme', 'dokumentasjon', 'typo in docs'];

const CRITICAL_KEYWORDS = [
  'data loss',
  'production down',
  'cannot login',
  'crash on startup',
  'security',
  'vulnerab',
  'exploit',
  'all users',
  'down for everyone',
];

const HIGH_KEYWORDS = ['regression', 'crash', 'broken', 'major', 'blocks', 'urgent'];
const LOW_KEYWORDS = ['typo', 'cosmetic', 'minor', 'nit', 'small'];

function containsAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

function classifyCategory(text: string, labels: string[]): IssueCategory {
  if (labels.includes('security')) return 'Security concern';
  if (labels.includes('duplicate')) return 'Duplicate';
  if (labels.includes('documentation')) return 'Documentation';
  if (labels.includes('invalid') || labels.includes('wontfix')) return 'Invalid';
  if (labels.includes('question')) return 'Question';
  if (labels.includes('bug')) return 'Bug';
  if (labels.includes('enhancement') || labels.includes('feature')) return 'Feature';

  if (containsAny(text, SECURITY_KEYWORDS)) return 'Security concern';
  if (containsAny(text, INVALID_KEYWORDS)) return 'Invalid';
  if (containsAny(text, DUPLICATE_KEYWORDS)) return 'Duplicate';
  if (containsAny(text, DOC_KEYWORDS)) return 'Documentation';
  if (containsAny(text, FEATURE_KEYWORDS)) return 'Feature';
  if (containsAny(text, BUG_KEYWORDS)) {
    return hasReproSteps(text) ? 'Bug' : 'Needs reproduction';
  }
  if (containsAny(text, QUESTION_KEYWORDS)) return 'Question';

  return 'Needs reproduction';
}

function hasReproSteps(text: string): boolean {
  return /steps to reproduce|reproduksjon|repro steps|1\.\s|step 1/i.test(text);
}

function classifyPriority(text: string, category: IssueCategory): IssuePriority {
  if (category === 'Security concern') return 'P0 critical';
  if (containsAny(text, CRITICAL_KEYWORDS)) return 'P0 critical';
  if (containsAny(text, HIGH_KEYWORDS)) return 'P1 important';
  if (containsAny(text, LOW_KEYWORDS)) return 'P3 low';
  if (category === 'Bug') return 'P2 normal';
  if (category === 'Documentation' || category === 'Question') return 'P3 low';
  return 'P2 normal';
}

function suggestLabels(category: IssueCategory, priority: IssuePriority): string[] {
  const labelMap: Record<IssueCategory, string> = {
    Bug: 'bug',
    Feature: 'enhancement',
    Question: 'question',
    Duplicate: 'duplicate',
    Invalid: 'invalid',
    'Needs reproduction': 'needs-reproduction',
    'Security concern': 'security',
    Documentation: 'documentation',
  };

  const priorityLabelMap: Record<IssuePriority, string> = {
    'P0 critical': 'priority-p0',
    'P1 important': 'priority-p1',
    'P2 normal': 'priority-p2',
    'P3 low': 'priority-p3',
  };

  return [labelMap[category], priorityLabelMap[priority]];
}

function assigneeType(category: IssueCategory): AssigneeType {
  switch (category) {
    case 'Security concern':
      return 'Security team';
    case 'Documentation':
      return 'Docs team';
    case 'Bug':
    case 'Needs reproduction':
      return 'Backend maintainer';
    case 'Feature':
    case 'Question':
      return 'Product / maintainer';
    default:
      return 'Triage volunteer';
  }
}

function maintainerResponse(category: IssueCategory, issue: GithubIssue, isSecurity: boolean): string {
  const author = issue.user?.login ? `@${issue.user.login}` : 'there';

  if (isSecurity) {
    return (
      `Hi ${author}, thanks for the report. We take security issues seriously and will follow up ` +
      `privately — please do not share additional exploit details or affected versions in this public thread. ` +
      `A maintainer will reach out to coordinate a private disclosure channel.`
    );
  }

  switch (category) {
    case 'Bug':
    case 'Needs reproduction':
      return `Hi ${author}, thanks for reporting this! We'll take a look. If you can share more details (see reproduction request below), that will help us investigate faster.`;
    case 'Feature':
      return `Hi ${author}, thanks for the suggestion! We'll review this feature request and discuss feasibility with the maintainers.`;
    case 'Question':
      return `Hi ${author}, thanks for the question. We'll get back to you with an answer, or feel free to check the documentation/discussions in the meantime.`;
    case 'Duplicate':
      return `Hi ${author}, thanks for the report. This looks like it may already be tracked in another issue — we'll link it below for visibility.`;
    case 'Documentation':
      return `Hi ${author}, thanks for flagging this documentation issue. We'll review and update the docs accordingly.`;
    case 'Invalid':
      return `Hi ${author}, thanks for opening this. It doesn't look actionable as-is — let us know if you can provide more context, otherwise we may close it.`;
    default:
      return `Hi ${author}, thanks for the report. A maintainer will triage this shortly.`;
  }
}

function reproductionRequest(category: IssueCategory, text: string): string | null {
  if (category !== 'Bug' && category !== 'Needs reproduction') return null;
  if (hasReproSteps(text)) return null;

  return (
    'Could you help us reproduce this issue? Please include:\n' +
    '- Steps to reproduce (1, 2, 3...)\n' +
    '- Expected vs. actual behavior\n' +
    '- Environment details (OS, browser/runtime version, app version)\n' +
    '- Any relevant logs, error messages, or screenshots'
  );
}

function jaccardSimilarity(a: string, b: string): number {
  const tokensA = new Set(a.toLowerCase().match(/[a-z0-9]+/g) || []);
  const tokensB = new Set(b.toLowerCase().match(/[a-z0-9]+/g) || []);
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection += 1;
  }
  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function findDuplicate(
  issue: GithubIssue,
  candidates: { number: number; title: string }[]
): TriageResult['duplicateOf'] {
  let best: { number: number; title: string; score: number } | null = null;

  for (const candidate of candidates) {
    if (candidate.number === issue.number) continue;
    const score = jaccardSimilarity(issue.title, candidate.title);
    if (score > 0.4 && (!best || score > best.score)) {
      best = { ...candidate, score };
    }
  }

  if (!best) return null;
  return { issueNumber: best.number, title: best.title, confidence: Math.round(best.score * 100) / 100 };
}

/**
 * Keyword/rule based triage used when no LLM API key is configured. Produces
 * the same TriageResult shape so the rest of the app is provider-agnostic.
 */
export function heuristicTriage(issue: GithubIssue, candidates: { number: number; title: string }[]): TriageResult {
  const text = `${issue.title}\n${issue.body || ''}`.toLowerCase();
  const labels = issue.labels.map((l) => l.name.toLowerCase());

  let category = classifyCategory(text, labels);

  const duplicateOf = findDuplicate(issue, candidates);
  if (duplicateOf && duplicateOf.confidence >= 0.6) {
    category = 'Duplicate';
  }

  const isSecurity = category === 'Security concern';
  const priority = classifyPriority(text, category);

  return {
    category,
    priority,
    isSecurity,
    suggestedLabels: suggestLabels(category, priority),
    maintainerResponse: maintainerResponse(category, issue, isSecurity),
    reproductionRequest: reproductionRequest(category, text),
    duplicateOf: category === 'Duplicate' ? duplicateOf : duplicateOf && duplicateOf.confidence >= 0.4 ? duplicateOf : null,
    suggestedAssigneeType: assigneeType(category),
    rationale: `Heuristisk klassifisering basert på nøkkelord og eksisterende labels (${labels.join(', ') || 'ingen'}).`,
  };
}
