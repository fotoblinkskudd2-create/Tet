"""Word-play and text-inspection solvers: anagrams plus everyday utilities."""
from __future__ import annotations

import re
from typing import Dict, List, Optional, Tuple

from .core import Capability, Solution

# --------------------------------------------------------------------------- #
# Anagrams (curated, deterministic library)
# --------------------------------------------------------------------------- #
_ANAGRAM_LIBRARY: Dict[str, Tuple[str, ...]] = {
    "listen": ("silent", "enlist", "tinsel"),
    "evil": ("vile", "veil", "live"),
    "angel": ("glean", "angle"),
    "stressed": ("desserts",),
    "save": ("vase",),
    "earth": ("heart", "hater"),
    "night": ("thing",),
    "below": ("elbow", "bowel"),
    "study": ("dusty",),
    "cat": ("act",),
}


def solve_anagram(problem: str) -> Optional[Solution]:
    pattern = re.compile(r"(?:anagram of|unscramble)\s+([A-Za-z]+)")
    match = pattern.search(problem.lower())
    if not match:
        return None

    target = match.group(1)
    canonical = "".join(sorted(target))
    candidates: List[str] = []
    for source, words in _ANAGRAM_LIBRARY.items():
        if canonical == "".join(sorted(source)) and source != target:
            candidates.extend(words)
        elif canonical == "".join(sorted(source)):
            candidates.extend(w for w in words if w != target)
    if not candidates:
        answer = f"I could not find a perfect match, but '{canonical}' looks like a fun jumble!"
    else:
        answer = f"Possible anagram buddies for '{target}': {', '.join(candidates)}"
    details = ["Try speaking the options out loud—sometimes the silliest sounds win!"]
    return Solution(kind="Anagram", answer=answer, details=details, tags=("wordplay",))


# --------------------------------------------------------------------------- #
# Everyday text utilities
# --------------------------------------------------------------------------- #
def _payload_after(problem: str, *markers: str) -> str:
    """Return the text following the first matched marker phrase."""

    lowered = problem.lower()
    for marker in markers:
        idx = lowered.find(marker)
        if idx != -1:
            return problem[idx + len(marker):].strip(" :\"'")
    return ""


def solve_text(problem: str) -> Optional[Solution]:
    lowered = problem.lower()

    if "palindrome" in lowered:
        word = _payload_after(problem, "is ", "palindrome")
        token = re.sub(r"[^a-z0-9]", "", word.lower()) or re.sub(
            r"[^a-z0-9]", "", lowered.replace("palindrome", "")
        )
        # Prefer the explicit word between "is" and "a palindrome".
        m = re.search(r"is\s+(.+?)\s+a?\s*palindrome", lowered)
        if m:
            token = re.sub(r"[^a-z0-9]", "", m.group(1))
        if token:
            verdict = "is a palindrome" if token == token[::-1] else "is not a palindrome"
            return Solution(
                kind="Text",
                answer=f"'{token}' {verdict}.",
                details=[f"Reversed: '{token[::-1]}'."],
                tags=("wordplay",),
            )

    if "reverse" in lowered:
        payload = _payload_after(problem, "reverse")
        if payload:
            return Solution(
                kind="Text",
                answer=f"Reversed: {payload[::-1]}",
                details=[f"Word order reversed: {' '.join(payload.split()[::-1])}"],
                tags=("text",),
            )

    if re.search(r"\b(word count|count words|how many words)\b", lowered):
        payload = _payload_after(problem, "count words in", "word count of", "word count", "words in")
        if payload:
            words = payload.split()
            return Solution(
                kind="Text",
                answer=f"That text has {len(words)} words and {len(payload)} characters.",
                details=[f"Unique words: {len(set(w.lower() for w in words))}."],
                tags=("text",),
            )

    if re.search(r"\b(count characters|character count|how many characters|count letters)\b", lowered):
        payload = _payload_after(problem, "count characters in", "character count of", "count letters in")
        if payload:
            letters = sum(c.isalpha() for c in payload)
            return Solution(
                kind="Text",
                answer=f"That text has {len(payload)} characters ({letters} letters).",
                details=[f"Without spaces: {len(payload.replace(' ', ''))} characters."],
                tags=("text",),
            )

    if "count vowels" in lowered or "how many vowels" in lowered:
        payload = _payload_after(problem, "count vowels in", "vowels in")
        if payload:
            vowels = sum(c in "aeiou" for c in payload.lower())
            return Solution(
                kind="Text",
                answer=f"There are {vowels} vowels in that text.",
                details=[f"Consonants: {sum(c.isalpha() and c.lower() not in 'aeiou' for c in payload)}."],
                tags=("text",),
            )

    if "uppercase" in lowered or "upper case" in lowered:
        payload = _payload_after(problem, "uppercase", "upper case")
        if payload:
            return Solution(kind="Text", answer=payload.upper(), tags=("text",))

    if "lowercase" in lowered or "lower case" in lowered:
        payload = _payload_after(problem, "lowercase", "lower case")
        if payload:
            return Solution(kind="Text", answer=payload.lower(), tags=("text",))

    return None


ANAGRAM_CAPABILITY = Capability(
    name="anagram",
    summary="Find anagrams for a word from a curated library.",
    examples=("anagram of listen", "unscramble earth"),
    solve=solve_anagram,
    priority=130,
)

TEXT_CAPABILITY = Capability(
    name="text",
    summary="Reverse text, check palindromes, and count words/characters/vowels.",
    examples=("reverse hello world", "is racecar a palindrome", "count words in the quick brown fox"),
    solve=solve_text,
    priority=120,
)
