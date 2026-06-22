"""Orakelet med tre stemmer — et lite konsept-smie.

Du ba om noe forferdelig, noe kjedelig og noe gøyalt — på én gang.
Så her er det: tre stemmer som er uenige om absolutt alt, tvunget til å
dele samme hode. Gi dem et frø (et ord, en følelse, en ting), og de
krangler seg fram til et konsept ingen av dem hadde funnet alene.

    Den Forferdelige ser sammenbruddet.   -> den gir innsatsen.
    Den Kjedelige ser regnearket.         -> den gir rammen.
    Den Gøyale ser leken.                 -> den gir gnisten.

Et konsept som er verdt noe trenger alle tre: noe som står på spill,
en form å helle det i, og en gnist som gjør det levende.

Bruk:
    python oracle.py "kaffe"
    python oracle.py "den siste bussen hjem"
    python oracle.py --kaos "tirsdag"      # samme frø, nytt resultat hver gang
    python oracle.py --rad 3 "ensomhet"    # tre konsepter på rad
"""
from __future__ import annotations

import argparse
import hashlib
import random
import textwrap
from dataclasses import dataclass, field
from typing import Iterable, List, Optional, Sequence


# --------------------------------------------------------------------------- #
#  De tre stemmene                                                            #
# --------------------------------------------------------------------------- #
# Hver stemme er et knippe fragmenter med en {fro}-luke. De er med vilje litt
# overdrevne — en stemme uten karakter er bare en setning.

@dataclass(frozen=True)
class Voice:
    """En enkelt stemme i orakelet."""

    name: str
    epithet: str
    glyph: str
    fragments: Sequence[str]

    def speak(self, fro: str, rng: random.Random) -> str:
        """La stemmen si én ting om frøet."""

        return rng.choice(list(self.fragments)).format(fro=fro)


DEN_FORFERDELIGE = Voice(
    name="Den Forferdelige",
    epithet="ser sammenbruddet i alt",
    glyph="🜨",
    fragments=(
        "Til slutt vil {fro} forlate oss, og ingen vil huske at det fantes.",
        "{fro} er allerede i ferd med å råtne mens vi later som vi ikke ser det.",
        "Det skremmende med {fro} er at det fungerer helt til det ikke gjør det.",
        "Tenk på all sorgen som ligger gjemt inni noe så uskyldig som {fro}.",
        "{fro} er en kveld som vet at den er den siste.",
        "Et sted finnes det en som mistet alt på grunn av {fro}.",
        "{fro} holder oss i hånden helt til klokka stopper.",
    ),
)

DEN_KJEDELIGE = Voice(
    name="Den Kjedelige",
    epithet="ser regnearket i alt",
    glyph="▦",
    fragments=(
        "{fro} kan deles inn i tre faser, hvorav den andre er unødvendig.",
        "Vi bør føre logg over {fro} i et delt regneark, kolonne C.",
        "{fro} krever skjema 7B og en kvittering arkivert i tre år.",
        "Per gjeldende retningslinjer skal {fro} håndteres mellom kl. 09 og 16.",
        "Den anbefalte porsjonsstørrelsen for {fro} er moderat og målbar.",
        "{fro} fungerer best når det er standardisert, dokumentert og litt grått.",
        "Husk å ta backup av {fro} før du gjør noe som helst med det.",
    ),
)

DEN_GOYALE = Voice(
    name="Den Gøyale",
    epithet="ser leken i alt",
    glyph="✺",
    fragments=(
        "Hva om {fro} egentlig var et lite dyr som later som?",
        "{fro}, men på rulleskøyter, og det regner konfetti.",
        "Vi gir {fro} en hatt og lar det holde en tale ingen forstår.",
        "Tenk om {fro} kunne kile deg når du minst venter det!",
        "{fro} er hemmelig forelsket i tirsdager og tør ikke si det.",
        "La oss snu {fro} opp ned og se hva som faller ut av lommene.",
        "{fro} synger best klokka tre om natta, falskt og lykkelig.",
    ),
)

VOICES = (DEN_FORFERDELIGE, DEN_KJEDELIGE, DEN_GOYALE)


# --------------------------------------------------------------------------- #
#  Synthesen                                                                  #
# --------------------------------------------------------------------------- #
# Et konsept er ikke gjennomsnittet av de tre stemmene. Det er kollisjonen.
# Rammen (kjedelig) gir form, gnisten (gøyal) gir liv, innsatsen (forferdelig)
# gir grunnen til at noen skulle bry seg.

_FORMS = (
    "et bordspill",
    "en app som ikke vil selge deg noe",
    "en stille ritual",
    "et postkort-abonnement",
    "en utstilling i et nedlagt lokale",
    "en samtale-automat",
    "et lite verksted",
    "en lommekalender",
    "en lydopptak-serie",
    "en gjeng som møtes uten grunn",
)

_TURNS = (
    "men ingen får lov til å vinne",
    "der reglene endrer seg når noen ler",
    "som bare virker hvis du gjør det for noen andre",
    "og slutten er alltid litt for tidlig",
    "der den kjedeligste deltakeren får siste ord",
    "som forsvinner hvis du prøver å eie det",
    "og du må gi det videre innen sju dager",
    "der feil er den eneste måten å gjøre det riktig på",
)


@dataclass
class Concept:
    """Resultatet av at tre uenige stemmer blir tvunget til enighet."""

    fro: str
    title: str
    pitch: str
    stake: str
    frame: str
    spark: str
    voices: List[str] = field(default_factory=list)

    def render(self) -> str:
        """Tegn konseptet for terminalen."""

        line = "─" * 58
        wrapped_pitch = textwrap.fill(self.pitch, width=58)
        chorus = "\n".join(
            f"   {voice}" for voice in self.voices
        )
        return "\n".join(
            (
                "",
                f"  ✦  {self.title.upper()}",
                f"  {line}",
                "",
                textwrap.indent(wrapped_pitch, "  "),
                "",
                f"  {line}",
                "  Koret kranglet seg fram slik:",
                "",
                chorus,
                "",
            )
        )


def _seed_rng(fro: str, chaos: bool) -> random.Random:
    """Lag en tilfeldighetsgenerator.

    Uten kaos er den deterministisk: samme frø gir alltid samme konsept.
    Det gjør magien reproduserbar — du kan dele et frø og få samme svar.
    Med kaos slipper vi tøylene helt.
    """

    if chaos:
        return random.Random()
    digest = hashlib.sha256(fro.strip().lower().encode("utf-8")).hexdigest()
    return random.Random(int(digest, 16))


def _title_for(fro: str, rng: random.Random) -> str:
    moods = (
        "Det stille",
        "Den lille",
        "Det siste",
        "Det første",
        "Den hemmelige",
        "Det utålmodige",
        "Den ærlige",
    )
    return f"{rng.choice(moods)} {fro.strip().lower()}-klubben"


def forge_concept(fro: str, chaos: bool = False) -> Concept:
    """Smi et konsept ut av ett frø og tre uenige stemmer."""

    if not fro or not fro.strip():
        raise ValueError("Gi meg et frø — et ord, en ting, en følelse å begynne med.")

    cleaned = fro.strip().rstrip(".")
    rng = _seed_rng(cleaned, chaos)

    voice_lines = [
        f"{v.glyph}  {v.name} ({v.epithet}):\n      «{v.speak(cleaned, rng)}»"
        for v in VOICES
    ]

    stake = DEN_FORFERDELIGE.speak(cleaned, rng)
    frame = rng.choice(_FORMS)
    turn = rng.choice(_TURNS)
    spark = DEN_GOYALE.speak(cleaned, rng)

    pitch = (
        f"Et konsept: {frame} om «{cleaned}», {turn}. "
        f"Det fungerer fordi noe står på spill — {stake.lower()} "
        f"Og det lever fordi det aldri tar seg selv helt seriøst: {spark.lower()}"
    )

    return Concept(
        fro=cleaned,
        title=_title_for(cleaned, rng),
        pitch=pitch,
        stake=stake,
        frame=frame,
        spark=spark,
        voices=voice_lines,
    )


# --------------------------------------------------------------------------- #
#  CLI                                                                         #
# --------------------------------------------------------------------------- #
def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Orakelet med tre stemmer: smir konsepter ut av kollisjonen mellom "
            "Den Forferdelige, Den Kjedelige og Den Gøyale."
        ),
    )
    parser.add_argument(
        "--kaos",
        action="store_true",
        help="Slipp tøylene: samme frø gir nytt resultat hver gang.",
    )
    parser.add_argument(
        "--rad",
        type=int,
        default=1,
        metavar="N",
        help="Smi N konsepter på rad (bruk gjerne med --kaos).",
    )
    parser.add_argument(
        "fro",
        nargs=argparse.REMAINDER,
        help="Frøet å smi rundt. Ett ord eller en hel liten setning.",
    )
    return parser


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(list(argv) if argv is not None else None)

    if not args.fro:
        parser.print_help()
        print("\n  Tips: python oracle.py \"den siste bussen hjem\"")
        return 0

    fro = " ".join(args.fro)
    count = max(1, args.rad)

    print("\n  ✦ ✦ ✦  ORAKELET MED TRE STEMMER  ✦ ✦ ✦")
    for i in range(count):
        # Med kaos vil hver runde avvike; uten kaos varierer vi frøet litt
        # så --rad fortsatt gir ulike (men reproduserbare) konsepter.
        seed = fro if (args.kaos or count == 1) else f"{fro} #{i + 1}"
        concept = forge_concept(seed, chaos=args.kaos)
        print(concept.render())

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
