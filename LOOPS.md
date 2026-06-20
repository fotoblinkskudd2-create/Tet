# The Ten Loops 🔁

> "Nobody writes prompts anymore. The new job is to write and handle loops."
> — Jensen Huang, NVIDIA (2026)

A loop is not a prompt. A prompt asks once and hopes. A **loop** sets a goal,
runs an attempt, **checks its own work**, and keeps going until a clear
done-condition is met. You stop writing instructions and start designing the
machine that writes them for you.

This framework adapts that idea to **this project** — the joyful Tet problem
solver (`app.py`: math, anagrams, creative prompts, panic support,
brainstorming). Each loop is written to be pasted into an agent — **Claude
Code, Codex, or any open agent** — and left to run.

## How to read a loop

Every loop has the same four moving parts:

- **Goal** — the one joyful sentence that says what "done" looks like.
- **Loop** — the steps the agent repeats, automatically, without you.
- **Check** — how the agent grades its own output each pass (the part most
  people forget — a loop without a check is just a slow prompt).
- **Stop** — the exact condition that ends the loop, so it never spins forever.

Keep it mobile-first: short lines, no fancy symbols, ready to paste from iOS
web. Tools are not failure — let the loop do the boring rounds.

---

## Loop 1 — The Test-Green Loop 🟢

**Goal:** Every solver in `app.py` stays covered and the suite is green.

**Loop:**
1. Run `pytest -q`.
2. Read the first failure only.
3. Fix the smallest cause.
4. Re-run.

**Check:** Did the failure count go down without breaking a passing test?

**Stop:** All tests pass twice in a row.

---

## Loop 2 — The New-Solver Loop ✨

**Goal:** Add a new kind of solver (like `_solve_math`) that slots into
`solve_problem`'s solver tuple.

**Loop:**
1. Write a failing test that describes the new solver's happy path.
2. Add the solver function returning a `Solution` (or `None` to pass).
3. Register it in the `solve_problem` solver chain.
4. Run the suite.

**Check:** Does the new solver fire only on its own inputs and stay out of the
way otherwise?

**Stop:** Test goes green and no other solver's test regresses.

---

## Loop 3 — The Anagram-Library Loop 🔤

**Goal:** Grow `_ANAGRAM_LIBRARY` without duplicates or broken sorts.

**Loop:**
1. Pick a word; compute `"".join(sorted(word))`.
2. Add every real anagram you can find as a tuple value.
3. Add a test asserting the buddies come back.
4. Re-run.

**Check:** Does the canonical key match for every word in the group?

**Stop:** Suite green and the new group returns its full buddy list.

---

## Loop 4 — The Creative-Prompt Polish Loop 🎨

**Goal:** Each medium in `_CREATIVE_RECIPES` produces a clean, paste-ready brief.

**Loop:**
1. Run `python app.py --prompt --medium <medium> "<seed>"`.
2. Read the output as if pasting into an iOS web field.
3. Trim any sentence over one breath; remove markdown symbols.
4. Re-run.

**Check:** Two-to-three short sentences, no special characters, medium auto-
detect still works when `--medium auto`?

**Stop:** Output reads cleanly on mobile for all five mediums.

---

## Loop 5 — The Safe-Math Loop ➗

**Goal:** `_safe_math_eval` evaluates real arithmetic and refuses anything else.

**Loop:**
1. Throw an expression at it (`2 + 3 * 4`, then `__import__('os')`).
2. Confirm valid math returns a number and unsafe input raises `ValueError`.
3. If a hole appears, tighten the allowed-ops whitelist.
4. Re-run with the attack again.

**Check:** Numbers compute; names, calls, and attributes are rejected.

**Stop:** A small attack list all raises, and the math list all computes.

---

## Loop 6 — The Panic-Protocol Review Loop 🫂

**Goal:** `_solve_panic_support` stays calm, practical, and safe.

**Loop:**
1. Trigger it with each marker (`panic`, `angst`, `kan ikke puste`...).
2. Re-read the details as a person mid-surge would.
3. Keep grounding → breathing → reality-check ordering intact.
4. Confirm the emergency-line guidance is unmissable.

**Check:** Is every step actionable in under a minute, and is the
escalation advice still present and clear?

**Stop:** All markers fire and the safety line is never buried.

---

## Loop 7 — The README-Truth Loop 📖

**Goal:** `README.md` examples actually run and produce what they claim.

**Loop:**
1. Copy each command from the README.
2. Run it exactly as written.
3. Compare real output to the description.
4. Fix the doc or the code so they agree.

**Check:** Does every documented command exit 0 and match its promise?

**Stop:** Every README example runs and tells the truth.

---

## Loop 8 — The Brainstorm-Fallback Loop 💡

**Goal:** When no solver matches, `_brainstorm_steps` still leaves the user with
momentum.

**Loop:**
1. Feed an unsolvable prompt.
2. Confirm the fallback fires and stays encouraging.
3. Ask: are the four steps still bite-sized and joyful?
4. Tune wording, re-run.

**Check:** Does the fallback name the goal, list facts, split the work, and
point at the easiest first step?

**Stop:** Output ends with a clear, doable first action.

---

## Loop 9 — The Refactor-Safety Loop 🧹

**Goal:** Improve the code's shape without changing behavior.

**Loop:**
1. Snapshot current outputs for a fixed list of prompts.
2. Make one small refactor.
3. Re-run the same prompts; diff against the snapshot.
4. Keep the change only if the diff is empty.

**Check:** Same inputs, byte-identical outputs?

**Stop:** Refactor lands with tests green and zero output drift.

---

## Loop 10 — The Self-Improving Loop ♾️

**Goal:** The loops themselves get sharper over time.

**Loop:**
1. After any task, ask: which loop above did I actually use?
2. Note where it was vague or spun too long.
3. Edit that loop's Check or Stop to be more exact.
4. Commit the sharper loop.

**Check:** Is the weakest loop's stop-condition now measurable?

**Stop:** Every loop has a Check and a Stop you could verify blindfolded.

---

## Running these with an agent

- **Claude Code:** paste a loop, say "run this loop until Stop, show me only the
  diff." Let it iterate; review the final diff.
- **Codex:** give it the Goal and Check; ask it to keep editing until the Check
  passes the test suite.
- **Any open agent:** the four parts (Goal / Loop / Check / Stop) are the whole
  contract — hand it those and step back.

The shift: you used to write the answer. Now you write the loop that finds it,
and you handle the loop. 🔁
