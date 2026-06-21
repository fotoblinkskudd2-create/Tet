"""Number-flavoured solvers: base conversion, Roman numerals, number theory."""
from __future__ import annotations

import math
import re
from typing import List, Optional

from .core import Capability, Solution

# --------------------------------------------------------------------------- #
# Base conversion
# --------------------------------------------------------------------------- #
_BASE_WORDS = {
    "binary": 2,
    "bin": 2,
    "octal": 8,
    "oct": 8,
    "decimal": 10,
    "denary": 10,
    "hex": 16,
    "hexadecimal": 16,
}

_BASE_PREFIX = {"0x": 16, "0b": 2, "0o": 8}


def _to_base(value: int, base: int) -> str:
    if base == 10:
        return str(value)
    if value == 0:
        return "0"
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    sign = "-" if value < 0 else ""
    value = abs(value)
    out: List[str] = []
    while value:
        value, rem = divmod(value, base)
        out.append(digits[rem])
    prefix = {2: "0b", 8: "0o", 16: "0x"}.get(base, "")
    return sign + prefix + "".join(reversed(out))


def solve_base_conversion(problem: str) -> Optional[Solution]:
    lowered = problem.lower()
    if not any(word in lowered for word in _BASE_WORDS):
        return None

    # Find the target base ("... to binary", "hex of ...", "in octal").
    target = None
    for word, base in _BASE_WORDS.items():
        if re.search(rf"\b{word}\b", lowered):
            target = base
            break
    if target is None:
        return None

    # Extract the source value, honouring 0x/0b/0o prefixes.
    token_match = re.search(r"(0x[0-9a-f]+|0b[01]+|0o[0-7]+|-?\d+)", lowered)
    if not token_match:
        return None
    token = token_match.group(1)
    try:
        if token[:2] in _BASE_PREFIX:
            value = int(token, _BASE_PREFIX[token[:2]])
        else:
            value = int(token, 10)
    except ValueError:
        return None

    converted = _to_base(value, target)
    base_name = {2: "binary", 8: "octal", 10: "decimal", 16: "hexadecimal"}[target]
    answer = f"{token} in {base_name} is {converted} (decimal value {value})."
    details = [
        f"Binary: {_to_base(value, 2)}",
        f"Octal: {_to_base(value, 8)}",
        f"Decimal: {value}",
        f"Hex: {_to_base(value, 16)}",
    ]
    return Solution(kind="Base Conversion", answer=answer, details=details, tags=("numbers",))


# --------------------------------------------------------------------------- #
# Roman numerals
# --------------------------------------------------------------------------- #
_ROMAN_TABLE = (
    (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
    (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
    (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
)
_ROMAN_VALUES = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
_ROMAN_RE = re.compile(r"\b(?=[MDCLXVI])(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b")


def _int_to_roman(value: int) -> str:
    out: List[str] = []
    for amount, symbol in _ROMAN_TABLE:
        count, value = divmod(value, amount)
        out.append(symbol * count)
    return "".join(out)


def _roman_to_int(text: str) -> int:
    total = 0
    prev = 0
    for char in reversed(text.upper()):
        cur = _ROMAN_VALUES[char]
        total += -cur if cur < prev else cur
        prev = cur
    return total


# Words that the solver should treat as conversion intent for Roman numerals.
_ROMAN_INTENT = ("roman", "to number", "to decimal", "to arabic", "in arabic",
                 "convert", "what is", "value of", "equals", "decode")


def solve_roman(problem: str) -> Optional[Solution]:
    lowered = problem.lower()

    # Direction 1: "roman numeral for N" -> render N as a Roman numeral.
    number_match = re.search(r"\b(\d{1,4})\b", problem)
    if "roman" in lowered and number_match:
        value = int(number_match.group(1))
        if 1 <= value <= 3999:
            roman = _int_to_roman(value)
            return Solution(
                kind="Roman Numeral",
                answer=f"{value} as a Roman numeral is {roman}.",
                details=["Romans had no zero and capped clean notation at 3999 (MMMCMXCIX)."],
                tags=("numbers",),
            )

    # Direction 2: decode a Roman token to an integer.  Require explicit intent
    # and a token of length >= 2 so the pronoun "I" and stray words don't fire.
    if not any(marker in lowered for marker in _ROMAN_INTENT):
        return None
    for token in re.findall(r"\b[MDCLXVI]{2,15}\b", problem.upper()):
        if _ROMAN_RE.fullmatch(token):
            value = _roman_to_int(token)
            return Solution(
                kind="Roman Numeral",
                answer=f"The Roman numeral {token} equals {value}.",
                details=[f"Round trip check: {value} -> {_int_to_roman(value)}"],
                tags=("numbers",),
            )
    return None


# --------------------------------------------------------------------------- #
# Number theory: primality, factorisation, gcd/lcm
# --------------------------------------------------------------------------- #
def _is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0:
        return False
    for d in range(3, math.isqrt(n) + 1, 2):
        if n % d == 0:
            return False
    return True


def _prime_factors(n: int) -> List[int]:
    factors: List[int] = []
    n = abs(n)
    while n % 2 == 0:
        factors.append(2)
        n //= 2
    d = 3
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 2
    if n > 1:
        factors.append(n)
    return factors


def _format_factorisation(factors: List[int]) -> str:
    if not factors:
        return "1"
    counts: List[str] = []
    for value in sorted(set(factors)):
        power = factors.count(value)
        counts.append(f"{value}^{power}" if power > 1 else str(value))
    return " × ".join(counts)


def solve_number_theory(problem: str) -> Optional[Solution]:
    lowered = problem.lower()

    # gcd / lcm of two numbers
    pair = re.search(r"\b(gcd|lcm|greatest common|least common)\b", lowered)
    if pair:
        nums = [int(x) for x in re.findall(r"-?\d+", problem)]
        if len(nums) >= 2:
            a, b = nums[0], nums[1]
            if "lcm" in lowered or "least common" in lowered:
                value = math.lcm(a, b)
                return Solution(
                    kind="Number Theory",
                    answer=f"The least common multiple of {a} and {b} is {value}.",
                    details=[f"gcd({a}, {b}) = {math.gcd(a, b)}; lcm = a·b / gcd."],
                    tags=("numbers",),
                )
            value = math.gcd(a, b)
            return Solution(
                kind="Number Theory",
                answer=f"The greatest common divisor of {a} and {b} is {value}.",
                details=[f"lcm({a}, {b}) = {math.lcm(a, b)}."],
                tags=("numbers",),
            )

    # primality test
    if "prime" in lowered:
        num_match = re.search(r"-?\d+", problem)
        if num_match and ("is" in lowered or "prime?" in lowered or "check" in lowered):
            n = int(num_match.group())
            verdict = "is prime" if _is_prime(n) else "is not prime"
            details = []
            if not _is_prime(n) and n > 1:
                details.append(f"Prime factorisation: {_format_factorisation(_prime_factors(n))}")
            return Solution(
                kind="Number Theory",
                answer=f"{n} {verdict}.",
                details=details or ["A prime has exactly two divisors: 1 and itself."],
                tags=("numbers",),
            )

    # factorisation
    if re.search(r"\b(factor|factori[sz]e|factorisation|factorization)\b", lowered):
        num_match = re.search(r"-?\d+", problem)
        if num_match:
            n = int(num_match.group())
            if abs(n) > 1:
                factors = _prime_factors(n)
                return Solution(
                    kind="Number Theory",
                    answer=f"{n} = {_format_factorisation(factors)}.",
                    details=[f"Flat list of prime factors: {', '.join(map(str, factors))}"],
                    tags=("numbers",),
                )
    return None


BASE_CAPABILITY = Capability(
    name="base-conversion",
    summary="Convert integers between binary, octal, decimal and hexadecimal.",
    examples=("255 in binary", "convert 0xff to decimal", "hex of 4096"),
    solve=solve_base_conversion,
    priority=200,
)

ROMAN_CAPABILITY = Capability(
    name="roman-numerals",
    summary="Translate numbers to Roman numerals and back.",
    examples=("roman numeral for 2024", "what is MMXXIV"),
    solve=solve_roman,
    priority=210,
)

NUMBER_THEORY_CAPABILITY = Capability(
    name="number-theory",
    summary="Primality tests, prime factorisation, gcd and lcm.",
    examples=("is 97 prime", "factorize 360", "gcd of 48 and 60"),
    solve=solve_number_theory,
    priority=190,
)
