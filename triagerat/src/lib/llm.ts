import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { GithubIssue } from "./github";
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, type LlmTriageResult } from "./types";

const ASSIGNEE_TYPES = [
  "Maintainer",
  "Core team",
  "Community contributor",
  "Security team",
  "Documentation team",
  "Unassigned",
] as const;

const TriageSchema = z.object({
  category: z.enum(ISSUE_CATEGORIES as [string, ...string[]]),
  priority: z.enum(ISSUE_PRIORITIES as [string, ...string[]]),
  is_security: z.boolean(),
  suggested_labels: z.array(z.string()),
  maintainer_response: z.string(),
  reproduction_request: z.string().nullable(),
  duplicate_of: z.number().int().nullable(),
  duplicate_confidence: z.number().min(0).max(1).nullable(),
  suggested_assignee_type: z.enum(ASSIGNEE_TYPES),
  rationale: z.string(),
});

const TRIAGE_TOOL_NAME = "submit_triage";

const TRIAGE_TOOL: Anthropic.Tool = {
  name: TRIAGE_TOOL_NAME,
  description: "Submit the triage classification and drafted responses for this issue.",
  input_schema: {
    type: "object",
    properties: {
      category: { type: "string", enum: ISSUE_CATEGORIES },
      priority: { type: "string", enum: ISSUE_PRIORITIES },
      is_security: { type: "boolean" },
      suggested_labels: { type: "array", items: { type: "string" } },
      maintainer_response: { type: "string" },
      reproduction_request: { type: ["string", "null"] },
      duplicate_of: { type: ["integer", "null"] },
      duplicate_confidence: { type: ["number", "null"] },
      suggested_assignee_type: { type: "string", enum: ASSIGNEE_TYPES },
      rationale: { type: "string" },
    },
    required: [
      "category",
      "priority",
      "is_security",
      "suggested_labels",
      "maintainer_response",
      "reproduction_request",
      "duplicate_of",
      "duplicate_confidence",
      "suggested_assignee_type",
      "rationale",
    ],
  },
};

const DEFAULT_MODEL = "claude-opus-4-8";

interface TriageTargetIssue {
  number: number;
  title: string;
  body: string | null;
  labels: string[];
  author: string | null;
}

const SYSTEM_PROMPT = `You are TriageRat, an assistant that triages GitHub issues for maintainers.

For the given issue, classify it and draft helpful response text by calling the submit_triage tool. Follow these rules:

- category must be exactly one of: Bug, Feature, Question, Duplicate, Invalid, Needs reproduction, Security concern, Documentation.
- priority must be exactly one of: P0 (critical - security, data loss, crash, broken core flow), P1 (important - significant bug or high-value feature), P2 (normal - everyday bug/feature), P3 (low - minor/cosmetic/nice-to-have).
- is_security must be true if the issue describes a vulnerability, exploit, credential leak, or any security-sensitive information. When true, the maintainer_response MUST NOT restate exploit details, proof-of-concept code, or sensitive data - instead it should thank the reporter privately and ask them to use a private security disclosure channel.
- suggested_labels: short kebab-case or simple GitHub label strings (e.g. "bug", "needs-reproduction", "priority-p1").
- maintainer_response: a friendly, concise draft reply a maintainer could post as-is (or edit) on the issue.
- reproduction_request: if the issue lacks enough information to reproduce, draft a polite message asking for specific missing details (steps, environment, versions, logs). If reproduction info is already sufficient, set this to null.
- duplicate_of: if the issue appears to duplicate one of the "other open issues" provided, set this to that issue's number; otherwise null.
- duplicate_confidence: a number from 0 to 1 indicating confidence in the duplicate match, or null if duplicate_of is null.
- suggested_assignee_type: one of Maintainer, Core team, Community contributor, Security team, Documentation team, Unassigned - whichever team would most likely own this issue.
- rationale: a short (1-3 sentence) internal note explaining your classification, for the maintainer only (never posted publicly).

Always respond by calling submit_triage exactly once - no other commentary.`;

function buildUserPrompt(issue: TriageTargetIssue, otherOpenIssues: TriageTargetIssue[]): string {
  const otherIssuesText = otherOpenIssues
    .slice(0, 30)
    .map((other) => `#${other.number}: ${other.title}`)
    .join("\n");

  return [
    `Issue #${issue.number}: ${issue.title}`,
    `Author: ${issue.author ?? "unknown"}`,
    `Existing labels: ${issue.labels.length > 0 ? issue.labels.join(", ") : "(none)"}`,
    "",
    "Body:",
    issue.body && issue.body.trim() ? issue.body : "(no description provided)",
    "",
    "Other open issues in this repo (for duplicate detection):",
    otherIssuesText || "(none)",
  ].join("\n");
}

/**
 * Run AI triage for a single issue. This is read-only with respect to GitHub -
 * it never writes anything, it only returns suggested classification/content.
 */
export async function triageIssue(
  issue: TriageTargetIssue,
  otherOpenIssues: TriageTargetIssue[],
  apiKey: string
): Promise<LlmTriageResult> {
  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(issue, otherOpenIssues),
      },
    ],
    tools: [TRIAGE_TOOL],
    tool_choice: { type: "tool", name: TRIAGE_TOOL_NAME },
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === TRIAGE_TOOL_NAME
  );

  if (!toolUse) {
    throw new Error(`Triage LLM call did not return a submit_triage tool call for issue #${issue.number}.`);
  }

  return TriageSchema.parse(toolUse.input) as LlmTriageResult;
}

export function toTriageTarget(issue: GithubIssue): TriageTargetIssue {
  return {
    number: issue.number,
    title: issue.title,
    body: issue.body,
    labels: issue.labels,
    author: issue.user,
  };
}
