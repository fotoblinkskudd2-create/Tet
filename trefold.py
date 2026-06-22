"""
Trefold — en orakelmaskin med tre stemmer.

Konseptet er enkelt og litt frekt: ingen enkelt stemme er nok til å si noe
sant. Så vi ansetter tre elendige rådgivere i stedet.

    DEN FORFERDELIGE   ser bare katastrofen.
    DEN KJEDELIGE      ser bare prosedyren.
    DEN GØYALE         ser bare leken.

Hver for seg tar de feil. De er ensidige, urettferdige, ubrukelige.
Men Trefold lar dem krangle, og fletter restene sammen til SYNTESEN —
en setning ingen av dem ville sagt alene, men som alle tre eier en bit av.

Det fantastiske ligger ikke i noen av stemmene. Det ligger i miksen.

Bruk:

    python trefold.py "å sende den skumle eposten"
    python trefold.py --rolig "flytte til en ny by"
    python trefold.py --voices "lære seg å male"
"""
from __future__ import annotations

import argparse
import hashlib
import textwrap
from dataclasses import dataclass
from typing import Callable, List, Sequence


# --------------------------------------------------------------------------- #
# En liten, deterministisk tilfeldighet.
#
# Vi vil at det samme frøet alltid gir den samme spådommen — et orakel som
# ombestemmer seg er bare en papegøye. Så vi trekker "terninger" ut av en
# hash av selve frøet. Reproduserbart, men det føles levende.
# --------------------------------------------------------------------------- #
class Skjebne:
    """En strøm av forutsigbare terningkast hentet fra et tekstfrø."""

    def __init__(self, seed: str) -> None:
        digest = hashlib.sha256(seed.encode("utf-8")).digest()
        self._stream = list(digest)
        self._i = 0

    def _next_byte(self) -> int:
        if self._i >= len(self._stream):
            # Strekk strømmen ved å hashe den på nytt — aldri tom for skjebne.
            self._stream = list(hashlib.sha256(bytes(self._stream)).digest())
            self._i = 0
        value = self._stream[self._i]
        self._i += 1
        return value

    def pick(self, options: Sequence[str]) -> str:
        return options[self._next_byte() % len(options)]

    def chance(self, percent: int) -> bool:
        return (self._next_byte() % 100) < percent


# --------------------------------------------------------------------------- #
# De tre stemmene.
#
# En stemme er bare et navn, en farge og en funksjon som forvrenger frøet
# gjennom sin egen bessettelse.
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class Stemme:
    navn: str
    motto: str
    tal: Callable[[str, Skjebne], str]


def _den_forferdelige(seed: str, d: Skjebne) -> str:
    katastrofer = [
        "alt rakner, og det blir din feil",
        "ingen kommer til å tilgi deg for dette",
        "du har allerede mislyktes, du vet det bare ikke ennå",
        "det går galt på en helt ny måte denne gangen",
        "stillheten etterpå blir verre enn selve fallet",
    ]
    haner = [
        "Hør her:",
        "La meg ødelegge dagen din:",
        "Sannheten, uten silkehansker:",
        "Spar deg selv for håpet —",
    ]
    return f"{d.pick(haner)} {seed} betyr at {d.pick(katastrofer)}."


def _den_kjedelige(seed: str, d: Skjebne) -> str:
    prosedyrer = [
        "fyll ut skjema 3B og avvent behandling",
        "del det opp i syv punkter og nummerer dem",
        "sjekk om det finnes en retningslinje for akkurat dette",
        "book et møte for å avklare neste møte",
        "arkiver det under 'diverse' og gå videre",
    ]
    haner = [
        "Ifølge rutinen:",
        "Saksbehandlingsmessig:",
        "For ordens skyld:",
        "Vi noterer følgende:",
    ]
    return f"{d.pick(haner)} {seed} krever at du {d.pick(prosedyrer)}."


def _den_goyale(seed: str, d: Skjebne) -> str:
    paafunn = [
        "gjør det iført det dummeste antrekket du eier",
        "sett på musikk ingen voksne ville valgt",
        "lat som det er et spill og du allerede leder",
        "inviter kaoset inn og by det opp til dans",
        "gjør det feil med vilje, bare for å se hva som skjer",
    ]
    haner = [
        "Eller — hør på dette:",
        "Hva om vi bare:",
        "Kjedelig. Prøv heller å:",
        "Psst, hemmelig oppskrift:",
    ]
    return f"{d.pick(haner)} {seed}? {d.pick(paafunn).capitalize()}!"


VOICES: List[Stemme] = [
    Stemme("DEN FORFERDELIGE", "ser bare katastrofen", _den_forferdelige),
    Stemme("DEN KJEDELIGE", "ser bare prosedyren", _den_kjedelige),
    Stemme("DEN GØYALE", "ser bare leken", _den_goyale),
]


# --------------------------------------------------------------------------- #
# Syntesen.
#
# Vi plukker ett ord fra hver stemme og tvinger dem til å holde hender.
# Resultatet er sjelden glatt — det er nettopp det som gjør det levende.
# --------------------------------------------------------------------------- #
_STOPP = {
    "og", "i", "å", "at", "det", "du", "deg", "selv", "en", "et", "som",
    "for", "av", "på", "den", "de", "er", "har", "blir", "betyr", "krever",
    "hør", "her", "meg", "la", "ifølge", "eller", "bare", "hva", "om", "vi",
    "psst", "kjedelig", "prøv", "heller", "til", "med", "ny", "denne", "gangen",
    "din", "din.", "dette", "dette.", "dette:", "dette?", "alt", "ingen",
}


def _nøkkelord(setning: str, d: Skjebne) -> str:
    ord = [w.strip(".,:;!?—-'\"").lower() for w in setning.split()]
    kandidater = [w for w in ord if len(w) > 3 and w not in _STOPP]
    if not kandidater:
        kandidater = [w for w in ord if w] or ["noe"]
    return d.pick(kandidater)


def syntese(seed: str, utsagn: Sequence[str], d: Skjebne) -> str:
    forf, kjed, goy = (_nøkkelord(s, d) for s in utsagn)

    maler = [
        "Mellom {forf} og {goy} står {kjed} og holder døra åpen.",
        "Det fantastiske er {goy} bygget av {forf} og signert med {kjed}.",
        "Frykt {forf}, tål {kjed}, men gå dit {goy} peker.",
        "Du trodde det handlet om {forf}. Det handlet alltid om {goy}.",
        "Ta {kjed}, riv av etiketten, og gjør det til {goy}.",
        "{forf} er prisen. {goy} er grunnen. {kjed} er bare veien.",
    ]
    setning = d.pick(maler).format(
        forf=forf.upper(), kjed=kjed.upper(), goy=goy.upper()
    )
    return setning[0].upper() + setning[1:]


# --------------------------------------------------------------------------- #
# Fremvisning.
# --------------------------------------------------------------------------- #
def _wrap(text: str, indent: str = "   ") -> str:
    return textwrap.fill(
        text, width=72, initial_indent=indent, subsequent_indent=indent
    )


def orakel(seed: str, vis_stemmer: bool = True) -> str:
    seed = seed.strip()
    if not seed:
        return "Orakelet trenger et frø. Gi det et håp eller en frykt."

    d = Skjebne(seed)
    utsagn = [voice.tal(seed, d) for voice in VOICES]

    linjer: List[str] = []
    linjer.append("")
    linjer.append(f"  ◇ TREFOLD spør om: {seed}")
    linjer.append("  " + "─" * 68)

    if vis_stemmer:
        for voice, sagt in zip(VOICES, utsagn):
            linjer.append("")
            linjer.append(f"  ▸ {voice.navn}  ({voice.motto})")
            linjer.append(_wrap(sagt))
        linjer.append("")
        linjer.append("  " + "─" * 68)

    linjer.append("")
    linjer.append("  ✦ SYNTESEN")
    linjer.append(_wrap(syntese(seed, utsagn, d)))
    linjer.append("")
    return "\n".join(linjer)


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="trefold",
        description="Tre elendige rådgivere. Én uventet sannhet.",
    )
    parser.add_argument(
        "seed",
        nargs="+",
        help="Det du grubler på — en frykt, et håp, en avgjørelse.",
    )
    parser.add_argument(
        "--rolig",
        action="store_true",
        help="Hopp over kranglingen, gi meg bare syntesen.",
    )
    parser.add_argument(
        "--voices",
        action="store_true",
        help="(Standard) Vis alle tre stemmene før syntesen.",
    )
    args = parser.parse_args(argv)

    seed = " ".join(args.seed)
    vis = not args.rolig
    print(orakel(seed, vis_stemmer=vis))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
