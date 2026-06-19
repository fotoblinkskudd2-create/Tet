"""Anagram Arena — a fast, replayable word game built on Tet's playful spirit.

Run a 60-second round: a pot of letters appears, and you type as many valid
words as you can. Longer words score more, and a clean streak builds a combo
multiplier. Pure standard library, so it runs anywhere and offline.

    python anagram_arena.py            # play a 60s round
    python anagram_arena.py --time 90  # longer round
    python anagram_arena.py --pot 9    # bigger letter pot

Core scoring and validation live in small, testable functions below.
"""
from __future__ import annotations

import argparse
import json
import os
import random
import time
from collections import Counter
from pathlib import Path
from typing import Iterable, List, Optional, Set, Tuple

HIGHSCORE_PATH = Path(__file__).with_name("anagram_highscore.json")

# A self-contained word list keeps the game offline-friendly. We expand it from
# the system dictionary when one is available (see _load_words).
_BUNDLED_WORDS: Tuple[str, ...] = (
    "able", "acid", "acorn", "actor", "alert", "alien", "alter", "angel", "angle",
    "anger", "argue", "arise", "armor", "aside", "audio", "aunt", "baker", "based",
    "beach", "beard", "beast", "began", "begin", "being", "below", "bench", "blade",
    "blame", "blank", "blast", "blaze", "blend", "blink", "blood", "board", "boast",
    "bonus", "boost", "booth", "bound", "brain", "brake", "brand", "brave", "bread",
    "break", "breed", "brick", "bride", "brief", "bring", "broad", "brown", "brush",
    "buddy", "build", "built", "cabin", "cable", "candy", "canoe", "cargo", "carry",
    "carve", "catch", "cause", "chain", "chair", "chalk", "chant", "charm", "chart",
    "chase", "cheap", "cheer", "chess", "chest", "chief", "child", "chord", "claim",
    "clean", "clear", "click", "cliff", "climb", "cloak", "clock", "close", "cloud",
    "coast", "coral", "couch", "could", "count", "court", "cover", "crack", "craft",
    "crane", "crash", "crate", "crawl", "crazy", "cream", "creek", "crest", "crime",
    "crisp", "cross", "crowd", "crown", "crust", "curve", "daily", "dance", "dealt",
    "death", "delay", "dense", "depth", "diary", "dirty", "ditch", "dozen", "draft",
    "drain", "drama", "drank", "dream", "dress", "dried", "drift", "drink", "drive",
    "eager", "eagle", "early", "earth", "eaten", "eight", "elbow", "elder", "elect",
    "enjoy", "enter", "entry", "equal", "error", "essay", "event", "every", "exact",
    "extra", "faith", "false", "fancy", "fault", "favor", "feast", "fence", "fever",
    "field", "fiery", "fight", "final", "first", "flame", "flash", "fleet", "flesh",
    "float", "flock", "flood", "floor", "flour", "fluid", "flush", "focus", "force",
    "forge", "forth", "found", "frame", "fresh", "fried", "front", "frost", "fruit",
    "ghost", "giant", "given", "glass", "gleam", "glide", "globe", "glory", "glove",
    "grace", "grade", "grain", "grand", "grant", "grape", "graph", "grasp", "grass",
    "grave", "great", "greed", "green", "greet", "grief", "grill", "grind", "groan",
    "group", "grove", "guard", "guess", "guest", "guide", "habit", "happy", "harsh",
    "haste", "haunt", "heart", "heavy", "hedge", "honey", "honor", "horse", "hotel",
    "house", "hover", "human", "humor", "ideal", "image", "index", "inner", "input",
    "irony", "issue", "ivory", "joint", "joker", "judge", "juice", "knife", "knock",
    "known", "label", "labor", "large", "laser", "later", "laugh", "layer", "learn",
    "lease", "least", "leave", "ledge", "lemon", "level", "light", "limit", "linen",
    "liver", "lobby", "local", "logic", "loose", "lower", "loyal", "lucky", "lunar",
    "lunch", "magic", "major", "maker", "mango", "march", "match", "metal", "meter",
    "midst", "might", "minor", "model", "moist", "money", "month", "moral", "motor",
    "mount", "mouse", "mouth", "movie", "music", "naked", "nerve", "never", "newly",
    "night", "noble", "noise", "north", "novel", "nurse", "ocean", "offer", "often",
    "olive", "onion", "order", "organ", "ought", "ounce", "outer", "owner", "paint",
    "panel", "panic", "paper", "party", "pasta", "patch", "pause", "peace", "pearl",
    "phase", "phone", "photo", "piano", "piece", "pilot", "pitch", "place", "plain",
    "plane", "plant", "plate", "plaza", "point", "porch", "pound", "power", "press",
    "price", "pride", "prime", "print", "prize", "proof", "proud", "prove", "pulse",
    "punch", "pupil", "purse", "queen", "quick", "quiet", "quite", "quote", "radar",
    "radio", "raise", "ranch", "range", "rapid", "ratio", "razor", "reach", "react",
    "ready", "realm", "rebel", "refer", "relax", "reply", "rider", "ridge", "rifle",
    "right", "rigid", "rinse", "risen", "river", "roast", "robot", "rocky", "round",
    "route", "royal", "ruler", "rural", "saint", "salad", "sauce", "scale", "scarf",
    "scene", "scent", "scope", "score", "scout", "seize", "sense", "serve", "seven",
    "shade", "shake", "shall", "shame", "shape", "share", "shark", "sharp", "sheep",
    "sheet", "shelf", "shell", "shift", "shine", "shirt", "shock", "shoot", "shore",
    "short", "shout", "siege", "sight", "silly", "since", "sixth", "skill", "skirt",
    "slate", "sleep", "slice", "slide", "slope", "small", "smart", "smile", "smoke",
    "snack", "snake", "sneak", "solid", "solve", "sound", "south", "space", "spare",
    "spark", "speak", "spear", "speed", "spell", "spend", "spice", "spike", "spill",
    "spine", "spite", "split", "spoke", "spoon", "sport", "spray", "stack", "staff",
    "stage", "stair", "stake", "stamp", "stand", "stare", "start", "state", "steam",
    "steel", "steep", "steer", "stern", "stick", "stiff", "still", "sting", "stock",
    "stone", "stool", "store", "storm", "story", "stove", "strap", "straw", "strip",
    "study", "stuff", "style", "sugar", "suite", "sunny", "super", "swamp", "swarm",
    "swear", "sweat", "sweep", "sweet", "swift", "swing", "sword", "syrup", "table",
    "taken", "taste", "teach", "tease", "thank", "theft", "their", "theme", "there",
    "thick", "thief", "thing", "think", "third", "thorn", "those", "three", "throw",
    "tiger", "tight", "title", "toast", "today", "token", "tooth", "topic", "torch",
    "total", "touch", "tough", "tower", "trace", "track", "trade", "trail", "train",
    "treat", "trend", "trial", "tribe", "trick", "troop", "trout", "truck", "truly",
    "trust", "truth", "tulip", "twice", "twist", "ultra", "uncle", "under", "union",
    "unite", "unity", "upper", "upset", "urban", "usage", "usual", "vague", "valid",
    "value", "vapor", "vault", "venue", "verse", "video", "villa", "virus", "visit",
    "vital", "vivid", "vocal", "voice", "voter", "wagon", "waist", "waste", "watch",
    "water", "weary", "weave", "wedge", "weird", "whale", "wheat", "wheel", "where",
    "which", "while", "white", "whole", "whose", "widen", "widow", "width", "witch",
    "woman", "world", "worry", "worse", "worst", "worth", "would", "wound", "wrist",
    "write", "wrong", "yacht", "yield", "young", "youth", "zebra",
    # short words help small pots feel alive
    "ace", "act", "age", "aid", "aim", "air", "ale", "ant", "ape", "arc", "are",
    "arm", "art", "ash", "ate", "bad", "bag", "ban", "bar", "bat", "bay", "bed",
    "bee", "bet", "bid", "big", "bin", "bit", "boa", "bog", "bow", "box", "boy",
    "bud", "bug", "bun", "bus", "but", "cab", "cap", "car", "cat", "cob", "cod",
    "cog", "cop", "cot", "cow", "cry", "cub", "cup", "cut", "dab", "dam", "day",
    "den", "dew", "dig", "dim", "dip", "doe", "dog", "dot", "dry", "dub", "due",
    "dug", "ear", "eat", "eel", "egg", "ego", "elf", "elk", "elm", "end", "era",
    "eve", "eye", "fan", "far", "fat", "fed", "fee", "few", "fig", "fin", "fir",
    "fit", "fix", "flu", "fly", "fog", "for", "fox", "fry", "fun", "fur", "gap",
    "gas", "gel", "gem", "get", "gig", "gin", "god", "got", "gum", "gun", "gut",
    "guy", "gym", "ham", "hat", "hay", "hen", "hid", "him", "hip", "his", "hit",
    "hog", "hop", "hot", "how", "hub", "hue", "hug", "hum", "hut", "ice", "icy",
    "ill", "ink", "inn", "ion", "ire", "ivy", "jam", "jar", "jaw", "jay", "jet",
    "job", "jog", "jot", "joy", "jug", "keg", "key", "kid", "kin", "kit", "lab",
    "lad", "lag", "lap", "law", "lay", "led", "leg", "let", "lid", "lie", "lip",
    "lit", "log", "lot", "low", "mad", "man", "map", "mat", "men", "mix", "mob",
    "mod", "mom", "mop", "mud", "mug", "nab", "nag", "nap", "net", "new", "nod",
    "nor", "not", "now", "nun", "nut", "oak", "oar", "oat", "odd", "ode", "off",
    "oil", "old", "one", "orb", "ore", "our", "out", "owl", "own", "pad", "pal",
    "pan", "pat", "paw", "pay", "pea", "pen", "pet", "pie", "pig", "pin", "pit",
    "ply", "pod", "pop", "pot", "pry", "pub", "pug", "pun", "pup", "put", "rag",
    "ram", "ran", "rap", "rat", "raw", "ray", "red", "rib", "rid", "rim", "rip",
    "rob", "rod", "rot", "row", "rub", "rug", "rum", "run", "rye", "sad", "sap",
    "sat", "saw", "say", "sea", "see", "set", "sew", "she", "shy", "sin", "sip",
    "sir", "sit", "six", "ski", "sky", "sly", "sob", "sod", "son", "sow", "soy",
    "spa", "spy", "sun", "tab", "tag", "tan", "tap", "tar", "tax", "tea", "ten",
    "the", "tie", "tin", "tip", "toe", "ton", "too", "top", "tow", "toy", "try",
    "tub", "tug", "two", "urn", "use", "van", "vat", "vet", "via", "vie", "vow",
    "wag", "war", "was", "wax", "way", "web", "wed", "wet", "who", "why", "wig",
    "win", "wit", "woe", "won", "wow", "yak", "yam", "yap", "yes", "yet", "you",
    "zap", "zip", "zoo",
)

_SYSTEM_DICTIONARIES = ("/usr/share/dict/words", "/usr/share/dict/american-english")


def _load_words() -> Set[str]:
    """Build the playable word set: bundled list plus a system dictionary if present."""

    words: Set[str] = {w for w in _BUNDLED_WORDS}
    for path in _SYSTEM_DICTIONARIES:
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as handle:
                for line in handle:
                    token = line.strip().lower()
                    # Keep plain alphabetic words; skip proper nouns and contractions.
                    if 3 <= len(token) <= 9 and token.isalpha() and token.islower():
                        words.add(token)
        except OSError:
            continue
    return words


def canonical(word: str) -> str:
    """Return the sorted-letter signature of a word (shared with Tet's anagram idea)."""

    return "".join(sorted(word.lower()))


def can_form_from_pot(word: str, pot: str) -> bool:
    """True if ``word`` can be spelled using only the letters available in ``pot``."""

    needed = Counter(word.lower())
    available = Counter(pot.lower())
    return all(available[letter] >= count for letter, count in needed.items())


def score_word(word: str) -> int:
    """Length-weighted score: longer words pay off sharply (3->9, 5->25, 7->49)."""

    return len(word) ** 2


def make_pot(words: Iterable[str], size: int, rng: Optional[random.Random] = None) -> str:
    """Build a shuffled letter pot guaranteed to contain at least one real word.

    We seed the pot from a real word of the requested size, so the round always
    has a solvable anchor and usually several shorter sub-words too.
    """

    rng = rng or random
    # Sort the pool so a given --seed always yields the same pot, regardless of
    # the word set's (process-dependent) iteration order.
    pool = sorted(w for w in words if len(w) == size)
    if not pool:
        # Fall back to the closest available length so the game never stalls.
        pool = sorted(words, key=lambda w: (abs(len(w) - size), w)) or ["arise"]
    seed = rng.choice(pool)
    letters = list(seed)
    rng.shuffle(letters)
    return "".join(letters)


def evaluate_guess(
    guess: str, pot: str, words: Set[str], already_found: Set[str]
) -> Tuple[bool, str]:
    """Validate a guess, returning (accepted, reason)."""

    guess = guess.strip().lower()
    if len(guess) < 3:
        return False, "Too short — need at least 3 letters."
    if guess in already_found:
        return False, "Already found that one!"
    if not can_form_from_pot(guess, pot):
        return False, "Uses letters that aren't in the pot."
    if guess not in words:
        return False, "Not in the word list."
    return True, "valid"


def load_highscore(path: Path = HIGHSCORE_PATH) -> int:
    try:
        return int(json.loads(path.read_text())["best"])
    except (OSError, ValueError, KeyError, TypeError):
        return 0


def save_highscore(score: int, path: Path = HIGHSCORE_PATH) -> None:
    try:
        path.write_text(json.dumps({"best": int(score)}))
    except OSError:
        pass


def _time_left(deadline: float) -> float:
    return max(0.0, deadline - time.monotonic())


def play_round(duration: float, pot_size: int, rng: Optional[random.Random] = None) -> int:
    """Run one interactive round and return the score."""

    words = _load_words()
    pot = make_pot(words, pot_size, rng=rng)
    found: Set[str] = set()
    score = 0
    combo = 1
    best = load_highscore()

    print("\n✨ ANAGRAM ARENA ✨")
    print(f"Best ever: {best}")
    print(f"\nYou have {int(duration)}s. Make words (3+ letters) from these:\n")
    print(f"    {'  '.join(pot.upper())}\n")
    print("Type a word and press Enter. Empty line ends early.\n")

    deadline = time.monotonic() + duration
    while _time_left(deadline) > 0:
        try:
            guess = input(f"[{int(_time_left(deadline)):>2}s | {score} pts | x{combo}] > ")
        except (EOFError, KeyboardInterrupt):
            break
        if _time_left(deadline) <= 0:
            print("⏰ Time! (submitted too late)")
            break
        if not guess.strip():
            break

        accepted, reason = evaluate_guess(guess, pot, words, found)
        if accepted:
            word = guess.strip().lower()
            found.add(word)
            gained = score_word(word) * combo
            score += gained
            print(f"  ✅ +{gained}  ({word}, x{combo})")
            combo += 1
        else:
            print(f"  ❌ {reason}")
            combo = 1

    print(f"\n🏁 Round over! Score: {score}  |  Words found: {len(found)}")
    if found:
        print("   Found: " + ", ".join(sorted(found)))
    if score > best:
        print(f"🎉 NEW HIGH SCORE! (was {best})")
        save_highscore(score)
    return score


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Anagram Arena — a fast word duel against the clock.")
    parser.add_argument("--time", type=float, default=60.0, help="Round length in seconds (default 60).")
    parser.add_argument("--pot", type=int, default=7, help="Number of letters in the pot (default 7).")
    parser.add_argument("--seed", type=int, default=None, help="Random seed for a repeatable pot.")
    return parser


def main(argv: Optional[List[str]] = None) -> int:
    args = _build_parser().parse_args(argv)
    rng = random.Random(args.seed) if args.seed is not None else None
    play_round(duration=max(5.0, args.time), pot_size=max(3, args.pot), rng=rng)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
