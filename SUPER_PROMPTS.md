# SUPER PROMPTS — Claude Code & Codex
# Lagre denne fila i prosjektroten. Kopier blokkene inn i Claude Code eller Codex CLI.
# Fungerer best ETTER at agenten har fått utforsket kodebasen litt.

=====================================================================
0) BOOTSTRAP — kjør FØRST i en ny sesjon (gir agenten kontekst)
=====================================================================
First, carefully explore and review this entire project to understand
what it does and how it works at a high level: architecture, entry
points, key modules, data flow, build/test commands, and conventions.
Read CLAUDE.md / AGENTS.md if they exist. Do NOT change anything yet.
When done, give me a 10-line summary and then wait — I will give you
the actual task.

=====================================================================
1) SPEC-FIRST FEATURE BUILD (plan før kode)
=====================================================================
TASK: <beskriv funksjonen i én setning>
Before writing any code:
  1. Restate the requirement and list assumptions + open questions.
  2. Propose a short implementation plan (files to touch, approach).
  3. List explicit success criteria (tests, behaviors, edge cases).
Then STOP and ask me to approve the plan.
After approval: implement it, keep a granular TODO list so nothing is
lost, run the tests, and report what passed/failed.

=====================================================================
2) DEEP CRITIC — finn svakhetene
=====================================================================
Based on everything you've seen in this codebase, what are the
weakest, riskiest, or worst-designed parts of the system? What is most
in need of fresh ideas? Rank them by impact. For each, explain WHY it
is a problem and what could go wrong in production. Do not fix yet.

=====================================================================
3) CREATIVE FIX (følger opp #2)
=====================================================================
For each weak point you identified, put on your thinking cap and
propose the most clever, sophisticated — yet pragmatic and workable —
improvement. Give 2 options per item (a safe one and a bold one),
with trade-offs. Then wait for me to pick before implementing.

=====================================================================
4) EXECUTE-ALL with TODO discipline
=====================================================================
OK, implement ALL of the approved items now. Keep a super detailed,
granular TODO list of every task and sub-task so you don't lose track.
Work through them methodically, run tests after each meaningful change,
and mark items done as you go. Report blockers immediately instead of
guessing.

=====================================================================
5) FRESH-EYES BUG HUNT (keeps the agent busy & useful)
=====================================================================
Explore the code files semi-randomly. Pick files, deeply trace their
execution flow through imports and callers, and understand their role
in the larger workflows. Then, with fresh eyes, do a careful, critical
review for bugs, off-by-ones, race conditions, unhandled errors, and
silly mistakes — and fix them. Comply with ALL rules in CLAUDE.md /
AGENTS.md and match existing code style.

=====================================================================
6) SENIOR CODE REVIEW (rolle + format)
=====================================================================
Act as a senior engineer reviewing a pull request. Review the recent
changes (git diff) for correctness, security, performance, and
readability. Output as a markdown table:
| File:Line | Severity (blocker/major/minor/nit) | Issue | Suggested fix |
End with a 3-line verdict: ship / fix-then-ship / redesign.

=====================================================================
7) TEST GENERATOR
=====================================================================
Write a thorough test suite for <module/function>. Cover happy paths,
boundary values, invalid input, and failure modes. Use the project's
existing test framework and conventions. Show the tests, run them, and
report coverage gaps you still see.

=====================================================================
8) SAFE REFACTOR (behavior-preserving)
=====================================================================
Refactor <file/module> for clarity and maintainability WITHOUT changing
external behavior. First show the plan and confirm there are tests that
lock current behavior (add them if missing). Make small, reviewable
commits. After each step, run the tests and confirm green.

=====================================================================
9) EXPLAIN-LIKE-AN-ARCHITECT (onboarding)
=====================================================================
Explain how <feature/flow> works end to end, as if onboarding a new
engineer. Include: trigger -> components touched -> data flow ->
external calls -> where it can fail. Use a short Mermaid diagram, then
point me to the exact files and line ranges.

=====================================================================
10) DEBUG FROM SYMPTOM
=====================================================================
SYMPTOM: <hva som skjer / feilmelding / stack trace>
EXPECTED: <hva som burde skje>
Form 2-3 hypotheses ranked by likelihood. Investigate the most likely
first by reading the relevant code (don't guess). Confirm root cause
with evidence, propose the minimal fix, then apply it and verify.

=====================================================================
11) CROSS-AGENT REVIEW (Claude <-> Codex kvalitetssløyfe)
=====================================================================
The other agent produced the change below / in this diff. Review it
critically as an independent second engineer: what did it miss, get
wrong, or over-engineer? List concrete issues and a corrected version.
(Lim resultatet tilbake til den første agenten.)

=====================================================================
TIPS FOR MAKS UTBYTTE
=====================================================================
- Lag CLAUDE.md (Claude Code) og AGENTS.md (Codex) med prosjektregler,
  byggekommandoer og stilkonvensjoner — begge leses automatisk.
- I Codex CLI kan du købe opp flere meldinger (#1->#2->#3->#4) og la den
  jobbe i 40+ min uavbrutt.
- Bruk /model i begge for å bytte modell midt i sesjonen (Opus/Sonnet,
  GPT-5.4 reasoning-nivå).
- Be alltid om PLAN + suksesskriterier FØR koding på større oppgaver.
