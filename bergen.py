"""
Bergen Dream Orchestrator
=========================

A deterministic, *massive* creative generator for Bergen-themed days.

Where the older flow typed prompts by hand and left placeholders like
"the remaining 49 are variations", this module actually generates every
item: a full weather-aware day plan, the complete set of video prompts,
the complete set of image prompts, a batch of Norwegian Bergen poems, and
a list of concrete inventions with next steps.

Everything is seeded from the date (or an explicit seed), so a given day
produces a stable, reproducible run while still feeling varied. Nothing is
truncated; ``--count`` controls exactly how many unique items you get.
"""
from __future__ import annotations

import hashlib
import itertools
import textwrap
from dataclasses import dataclass, field
from datetime import date
from typing import Dict, List, Optional, Sequence, Tuple


# ---------------------------------------------------------------------------
# Deterministic randomness
# ---------------------------------------------------------------------------
#
# We avoid the global ``random`` module so that orchestrator runs never depend
# on import order or other callers. A tiny seeded PRNG keeps output fully
# reproducible from a single seed string.


class _Rng:
    """A small, dependency-free, deterministic PRNG (xorshift-style)."""

    def __init__(self, seed: str) -> None:
        digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
        # Seed must be non-zero for xorshift to escape the zero fixed point.
        self._state = int(digest[:16], 16) or 0x9E3779B97F4A7C15

    def _next(self) -> int:
        x = self._state & 0xFFFFFFFFFFFFFFFF
        x ^= (x << 13) & 0xFFFFFFFFFFFFFFFF
        x ^= x >> 7
        x ^= (x << 17) & 0xFFFFFFFFFFFFFFFF
        self._state = x
        return x

    def randint(self, low: int, high: int) -> int:
        """Return an int in ``[low, high]`` inclusive."""

        if high <= low:
            return low
        span = high - low + 1
        return low + self._next() % span

    def choice(self, items: Sequence):
        return items[self._next() % len(items)]

    def shuffled(self, items: Sequence) -> List:
        """Return a deterministically shuffled copy (Fisher-Yates)."""

        pool = list(items)
        for i in range(len(pool) - 1, 0, -1):
            j = self._next() % (i + 1)
            pool[i], pool[j] = pool[j], pool[i]
        return pool


# ---------------------------------------------------------------------------
# Weather model
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class Weather:
    """A Bergen weather archetype and the creative mood it invites."""

    key: str
    label: str
    temp_c: Tuple[int, int]
    mood: str
    indoor_bias: float  # 0.0 (go outside) .. 1.0 (deep indoor focus)


_WEATHER: Dict[str, Weather] = {
    "regnbyger": Weather("regnbyger", "Regnbyger", (11, 15), "fokusert og skapende", 0.75),
    "osregn": Weather("osregn", "Øsregn fra grå himmel", (9, 13), "innadvendt og dyp", 0.95),
    "t" + "ake": Weather("take", "Tåke over fjellene", (8, 12), "drømmende og mystisk", 0.7),
    "opphold": Weather("opphold", "Opphold mellom bygene", (12, 16), "rastløs og nysgjerrig", 0.45),
    "sol": Weather("sol", "Klar sol over fjorden", (16, 22), "lett og ekspansiv", 0.2),
    "vind": Weather("vind", "Frisk vestavind", (10, 14), "energisk og rå", 0.5),
}


def resolve_weather(rng: _Rng, weather_key: Optional[str]) -> Weather:
    """Return a Weather, honouring an explicit key or picking one for the day."""

    if weather_key:
        key = weather_key.lower().strip()
        if key in _WEATHER:
            return _WEATHER[key]
        raise ValueError(
            f"Unknown weather '{weather_key}'. Choose from: {', '.join(sorted(_WEATHER))}."
        )
    # Bergen is rainy far more often than not; weight the pool accordingly.
    weighted = (
        ["regnbyger"] * 4
        + ["osregn"] * 3
        + ["take"] * 2
        + ["opphold"] * 2
        + ["vind"] * 2
        + ["sol"] * 1
    )
    return _WEATHER[rng.choice(weighted)]


# ---------------------------------------------------------------------------
# Day plan
# ---------------------------------------------------------------------------


@dataclass
class PlanBlock:
    start: str
    end: str
    title: str
    note: str


def build_day_plan(rng: _Rng, weather: Weather) -> List[PlanBlock]:
    """Build a time-blocked creative day that adapts to the weather mood."""

    deep_first = weather.indoor_bias >= 0.6
    outdoor_window = (
        "kort uteøkt for foto-referanser langs Bryggen"
        if weather.indoor_bias < 0.5
        else "kort lufting under tak — hent kaffe, observer regnet"
    )

    blocks = [
        PlanBlock("07:00", "09:00", "Morgenrytme",
                  "Kaffe, nyhetsgjennomgang og én rask poesi-skisse."),
        PlanBlock("09:00", "12:00",
                  "Dyp prompt-produksjon" if deep_first else "Idé-sprint",
                  "Generer hovedbatchen med video- og bilde-prompts uten avbrudd."),
        PlanBlock("12:00", "13:00", "Lunsj + refleksjon",
                  f"Spis, og {outdoor_window}."),
        PlanBlock("13:00", "16:00", "Poesi og raffinering",
                  "Skriv dikt og finpuss de sterkeste kunst-promptene."),
        PlanBlock("16:00", "18:00", "Implementering / test",
                  "Kjør de beste promptene, vurder output, noter forbedringer."),
        PlanBlock("18:00", "", "Kvelds-evaluering",
                  "Oppsummer dagen og legg en kort plan for i morgen."),
    ]
    return blocks


# ---------------------------------------------------------------------------
# Prompt component banks
# ---------------------------------------------------------------------------

# Each "axis" is a list of fragments. The generator walks the cartesian
# product of the axes, shuffles it deterministically, and pulls unique
# combinations — so 50 video prompts are 50 genuinely different prompts.

_VIDEO_SCENES = [
    "a cinematic drone push over the rain-soaked fjords outside Bergen",
    "a fishing trawler battling grey swells in the North Sea at first light",
    "an offshore oil platform wreathed in mist, cranes turning slowly",
    "the wooden Hanseatic wharf of Bryggen glistening after a downpour",
    "the Fløibanen funicular climbing through low cloud above the city",
    "a lone inventor in a rooftop workshop overlooking the seven mountains",
    "a swarm of weatherproof inspection drones threading between fjord cliffs",
    "neon-lit cobblestone streets of a near-future cyber-Bergen",
    "a salmon farm's circular pens seen from above through drifting fog",
    "rain hammering the glass of a modular 'Rain-Hub' home office",
    "the Bergen harbour front waking up as ferries exhale steam",
    "a poet walking the Mount Ulriken ridge while verses appear in the air",
]

_VIDEO_TIME = [
    "at misty dawn", "in the blue hour", "under heavy overcast noon",
    "as a storm front rolls in", "at rain-streaked dusk", "deep in foggy twilight",
]

_VIDEO_CAMERA = [
    "slow aerial reveal", "low gliding dolly across the water", "orbiting crane move",
    "handheld intimate follow", "static locked-off wide that lets motion fill the frame",
    "fast FPV-drone descent", "tilt up from reflection to skyline",
]

_VIDEO_STYLE = [
    "Nordic cyber-noir", "photoreal documentary", "painterly Romantic-era oil look",
    "high-contrast moody cinematic", "dreamlike surrealism", "grounded gritty realism",
]

_VIDEO_FINISH = [
    "4K, slow motion, Hans Zimmer-inspired score",
    "anamorphic flares, 24fps, sparse ambient sound design",
    "rich teal-and-amber grade, deep shadows, low droning score",
    "natural light, subtle film grain, diegetic rain and gulls",
    "volumetric god-rays, 60fps for smooth motion, swelling strings",
]

_IMAGE_SUBJECTS = [
    "a rain-slick Bergen street at dusk, cobblestones mirroring fjord lights",
    "the Bryggen wharf reflected in a flooded gutter, neon signs above",
    "a weatherproof drone perched on a mossy fjord cliff",
    "a modular Rain-Hub home capturing rainwater into glowing turbines",
    "an oil platform reimagined as a vertical garden in the North Sea",
    "a lone figure with an umbrella sketching an invention by lamplight",
    "the seven mountains of Bergen under a ceiling of bruised storm clouds",
    "a surreal map of the energy crisis rendered as a fjord of liquid gold",
    "fishing boats lashed together in a harbour during a gale",
    "a hydroponic greenhouse fed by funnelled Bergen rain",
    "Fløibanen's red carriage emerging from fog like a lantern",
    "a Norse-futurist poet-machine carving verse into wet granite",
]

_IMAGE_STYLE = [
    "cyber-noir, intricate detail, dramatic lighting, cinematic composition, 8k",
    "Midjourney-style hyper-detailed render, volumetric fog, golden rim light",
    "Flux photoreal, shallow depth of field, muted Nordic palette",
    "matte concept-art painting, textured brushwork, atmospheric depth",
    "surrealist collage, geopolitical symbolism, bold negative space",
    "long-exposure photography look, rain streaks, reflective wet surfaces",
]

_IMAGE_AR = ["--ar 16:9", "--ar 3:2", "--ar 4:5", "--ar 21:9", "--ar 1:1"]
_IMAGE_VERSION = ["--v 6", "--v 6.1", "--style raw --v 6", "--q 2 --v 6"]


# ---------------------------------------------------------------------------
# Prompt generation
# ---------------------------------------------------------------------------


def _unique_combos(rng: _Rng, axes: Sequence[Sequence[str]], count: int) -> List[Tuple[str, ...]]:
    """Return ``count`` unique tuples drawn from the cartesian product of axes.

    The product is generated lazily-then-shuffled so we get spread-out,
    non-repeating combinations. If ``count`` exceeds the product size we
    return everything available (still unique).
    """

    product = list(itertools.product(*axes))
    shuffled = rng.shuffled(product)
    return shuffled[: min(count, len(shuffled))]


def generate_video_prompts(rng: _Rng, count: int) -> List[str]:
    combos = _unique_combos(
        rng,
        (_VIDEO_SCENES, _VIDEO_TIME, _VIDEO_CAMERA, _VIDEO_STYLE, _VIDEO_FINISH),
        count,
    )
    prompts = []
    for scene, time, camera, style, finish in combos:
        prompts.append(
            f"{camera.capitalize()} of {scene} {time}, {style} style, {finish}."
        )
    return prompts


def generate_image_prompts(rng: _Rng, count: int) -> List[str]:
    combos = _unique_combos(
        rng,
        (_IMAGE_SUBJECTS, _IMAGE_STYLE, _IMAGE_AR, _IMAGE_VERSION),
        count,
    )
    prompts = []
    for subject, style, ar, version in combos:
        prompts.append(f"{subject.capitalize()}, {style} {ar} {version}")
    return prompts


# ---------------------------------------------------------------------------
# Poetry
# ---------------------------------------------------------------------------

_POEM_OPENINGS = [
    "Regnet hamrer på taket i Bergen,",
    "Tåka legger seg mykt over Fløyen,",
    "Vinden river i kaiene ved Bryggen,",
    "Fjorden ligger blank som et sovende speil,",
    "Lyset bryter tregt gjennom grå morgen,",
]

_POEM_MIDDLE = [
    "oljeprisene stiger som bølger i Nordsjøen.",
    "droner danser stille i den våte tåken.",
    "vi samler kraft av vannet som faller.",
    "byen puster langsomt mellom syv fjell.",
    "tanker gror der ingen sol har vært.",
    "hver dråpe bærer en halvferdig oppfinnelse.",
]

_POEM_TURNS = [
    "Vestlandets hjerte banker tregt,",
    "Men under regnet våkner noe nytt,",
    "Og midt i gråværet finnes en gnist,",
    "Vi drømmer videre, ueffen og rå,",
    "Likevel reiser oppfinnsomheten seg,",
]

_POEM_CLOSINGS = [
    "men oppfinnsomheten sover aldri.",
    "og dagen blir til noe vi kan skape.",
    "som lyser opp den lange høstkvelden.",
    "til regnet selv blir vår motor.",
    "for her gir vi aldri opp.",
]


def generate_poems(rng: _Rng, count: int) -> List[Tuple[str, str]]:
    """Return ``count`` (title, body) Bergen poems with varied composition."""

    titles = [
        "Regn & Energi", "Tåkedikt", "Vestavind", "Speilet Fjord",
        "Grå Morgen", "Dråpenes Maskin", "Syv Fjell", "Halvferdig Lys",
    ]
    poems: List[Tuple[str, str]] = []
    for i in range(count):
        # Vary stanza length so poems do not feel stamped from one mould.
        midlines = rng.randint(1, 2)
        lines = [rng.choice(_POEM_OPENINGS)]
        for _ in range(midlines):
            lines.append(rng.choice(_POEM_MIDDLE))
        lines.append(rng.choice(_POEM_TURNS))
        lines.append(rng.choice(_POEM_CLOSINGS))
        title = titles[i % len(titles)]
        poems.append((title, "\n".join(lines)))
    return poems


# ---------------------------------------------------------------------------
# Inventions
# ---------------------------------------------------------------------------


@dataclass
class Invention:
    name: str
    description: str
    benefit: str
    next_step: str


_INVENTIONS: List[Invention] = [
    Invention(
        "Regn-Energi Hub",
        "Modulært hjemmesystem som fanger regnvann til både mikrovannkraft og hydroponics.",
        "Reduserer strømregning og matkostnader på Vestlandet.",
        "Skisser en prototype med tank, turbin og dyrkehyller.",
    ),
    Invention(
        "Geo-Poesi AI",
        "Verktøy som gjør dagens nyheter og vær om til bergenske dikt automatisk.",
        "Gir daglig kulturell refleksjon med lokal stemme.",
        "Definer datakilder (vær-API + nyhets-RSS) og en diktmal.",
    ),
    Invention(
        "Fjord-Drone Flåte",
        "Værbestandige inspeksjonsdroner for kystfiske og oljeplattformer.",
        "Tryggere og billigere inspeksjon i hardt vestlandsvær.",
        "Spesifiser nyttelast, rekkevidde og ladestasjon på plattform.",
    ),
    Invention(
        "Tåke-Navigasjon",
        "Sensorpakke som hjelper båter å manøvrere trygt i tett fjordtåke.",
        "Færre uhell i dårlig sikt langs kysten.",
        "Kartlegg eksisterende radar/LIDAR og finn en nisje.",
    ),
    Invention(
        "Bryggen Mikronett",
        "Lokalt energinett som balanserer sol, regn-kraft og batteri for bydelen.",
        "Mer robust strøm under stormer og pr-stopp.",
        "Lag en enkel energiflyt-modell for ett kvartal.",
    ),
    Invention(
        "Regn-Klang Instrument",
        "Tak-sensorer som gjør fallende regn om til generativ musikk.",
        "Forvandler typisk bergensvær til en kreativ ressurs.",
        "Bygg en prototype med piezo-sensorer og en synth-mapping.",
    ),
]


def select_inventions(rng: _Rng, count: int) -> List[Invention]:
    return rng.shuffled(_INVENTIONS)[: min(count, len(_INVENTIONS))]


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------


@dataclass
class BergenRun:
    run_date: date
    weather: Weather
    plan: List[PlanBlock]
    video_prompts: List[str]
    image_prompts: List[str]
    poems: List[Tuple[str, str]]
    inventions: List[Invention]
    dreams: List[str] = field(default_factory=list)


_DREAMS = [
    "En værbestandig drone-flåte for kystfiske og olje-inspeksjon i Vestland.",
    "Personlig AI-poet som skriver bergenske dikt basert på dagens vær og nyheter.",
    "Modulært 'Regn-Hub' hjemmekontor med integrert energiproduksjon fra regnvann.",
    "Kunstinstallasjon som visualiserer energi-krisen gjennom nordisk poesi.",
    "En hel dag med prompt-produksjon som leder til en ny skill eller agent.",
    "Et mikronett som gjør Bergens regn til pålitelig lokal strøm.",
]


def orchestrate(
    run_date: Optional[date] = None,
    *,
    seed: Optional[str] = None,
    weather_key: Optional[str] = None,
    video_count: int = 50,
    image_count: int = 60,
    poem_count: int = 6,
    invention_count: int = 6,
    dream_count: int = 5,
) -> BergenRun:
    """Produce a complete, reproducible Bergen creative run.

    The seed defaults to the ISO date, so the same day yields the same run.
    Pass an explicit ``seed`` to fork an alternate version of the same day.
    """

    run_date = run_date or date.today()
    seed = seed or f"bergen-{run_date.isoformat()}"
    rng = _Rng(seed)

    weather = resolve_weather(rng, weather_key)
    plan = build_day_plan(rng, weather)
    dreams = rng.shuffled(_DREAMS)[: min(dream_count, len(_DREAMS))]

    return BergenRun(
        run_date=run_date,
        weather=weather,
        plan=plan,
        video_prompts=generate_video_prompts(rng, video_count),
        image_prompts=generate_image_prompts(rng, image_count),
        poems=generate_poems(rng, poem_count),
        inventions=select_inventions(rng, invention_count),
        dreams=dreams,
    )


# ---------------------------------------------------------------------------
# Rendering
# ---------------------------------------------------------------------------


def _norwegian_weekday(d: date) -> str:
    days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"]
    return days[d.weekday()]


def render_run(run: BergenRun, *, section: str = "all") -> str:
    """Render a BergenRun to Markdown. ``section`` can narrow the output."""

    out: List[str] = []
    w = run.weather

    def want(name: str) -> bool:
        return section in ("all", name)

    if want("header") or section == "all":
        out.append(f"# 🌧️ Bergen Drømme-Orchestrator — {_norwegian_weekday(run.run_date)} "
                   f"{run.run_date.day}. {run.run_date.strftime('%B')} {run.run_date.year}")
        out.append("")
        out.append(f"**Vær:** {w.label}, {w.temp_c[0]}–{w.temp_c[1]}°C. "
                   f"Stemning: {w.mood}.")
        out.append("")

    if want("dreams"):
        out.append("## Drømmer & scenarier")
        for i, d in enumerate(run.dreams, 1):
            out.append(f"{i}. {d}")
        out.append("")

    if want("plan"):
        out.append("## Kreativ dagsplan")
        for b in run.plan:
            window = f"{b.start}–{b.end}" if b.end else f"{b.start}–"
            out.append(f"- **{window}** · {b.title}: {b.note}")
        out.append("")

    if want("video"):
        out.append(f"## {len(run.video_prompts)} video-prompts")
        for i, p in enumerate(run.video_prompts, 1):
            out.append(f"{i}. {p}")
        out.append("")

    if want("image"):
        out.append(f"## {len(run.image_prompts)} bilde-prompts")
        for i, p in enumerate(run.image_prompts, 1):
            out.append(f"{i}. {p}")
        out.append("")

    if want("poems"):
        out.append("## Dikt & poesi")
        for title, body in run.poems:
            out.append(f"### {title}")
            out.append("")
            for line in body.split("\n"):
                out.append(f"> {line}")
            out.append("")

    if want("inventions"):
        out.append("## Oppfinnelser")
        for i, inv in enumerate(run.inventions, 1):
            out.append(f"{i}. **{inv.name}** — {inv.description}")
            out.append(f"   - Nytte: {inv.benefit}")
            out.append(f"   - Neste steg: {inv.next_step}")
        out.append("")

    if section == "all":
        out.append("## Neste steg")
        out.append("- Kjør de sterkeste video-/bilde-promptene i din generator.")
        out.append("- Velg én oppfinnelse og ta første konkrete steg i dag.")
        out.append("- Reseed med en annen `--seed` for en alternativ versjon av dagen.")

    return "\n".join(out).rstrip() + "\n"


def render_summary(run: BergenRun) -> str:
    """A compact one-screen summary, handy for mobile / iOS web."""

    w = run.weather
    lines = [
        f"🌧️ Bergen {run.run_date.isoformat()} — {w.label}, {w.temp_c[0]}–{w.temp_c[1]}°C ({w.mood}).",
        f"• {len(run.video_prompts)} video-prompts, {len(run.image_prompts)} bilde-prompts.",
        f"• {len(run.poems)} dikt, {len(run.inventions)} oppfinnelser.",
        "Topp video: " + textwrap.shorten(run.video_prompts[0], width=140, placeholder=" …"),
        "Topp bilde: " + textwrap.shorten(run.image_prompts[0], width=140, placeholder=" …"),
    ]
    return "\n".join(lines)
