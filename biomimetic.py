"""Biomimetic product factory.

Turns the OpenClaw idea list into structured, build-ready prototype specs.

Each idea couples a biological mechanism to a subsea / arctic engineering
problem. ``build_prototype`` expands an idea into a concrete development plan:
subsystems, a phased build path, and measurable acceptance criteria pulled from
the Grovjobb Navigator technical requirements.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass(frozen=True)
class Idea:
    """A single biomimetic product concept."""

    name: str
    organism: str
    mechanism: str
    problem: str
    solution: List[str]
    applications: List[str]
    target_specs: List[str]
    subsystems: List[str]


@dataclass
class PrototypeSpec:
    """A build-ready prototype plan expanded from an :class:`Idea`."""

    idea: Idea
    phases: List[str] = field(default_factory=list)
    bill_of_materials: List[str] = field(default_factory=list)
    acceptance_criteria: List[str] = field(default_factory=list)
    risks: List[str] = field(default_factory=list)

    def format(self) -> str:
        """Render the prototype plan as a readable engineering brief."""

        lines: List[str] = []
        lines.append(f"🧬 {self.idea.name} — prototype brief")
        lines.append(f"Bionics: {self.idea.organism} → {self.idea.mechanism}")
        lines.append(f"Problem: {self.idea.problem}")
        lines.append("")
        lines.append("Solution principles:")
        lines.extend(f"  - {item}" for item in self.idea.solution)
        lines.append("")
        lines.append("Subsystems:")
        lines.extend(f"  - {item}" for item in self.bill_of_materials)
        lines.append("")
        lines.append("Build phases:")
        lines.extend(f"  {idx}. {step}" for idx, step in enumerate(self.phases, 1))
        lines.append("")
        lines.append("Acceptance criteria:")
        lines.extend(f"  [ ] {item}" for item in self.acceptance_criteria)
        lines.append("")
        lines.append("Key risks:")
        lines.extend(f"  ! {item}" for item in self.risks)
        lines.append("")
        lines.append("Applications: " + ", ".join(self.idea.applications))
        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Catalog: the 10 biomimetic product ideas, with technical targets mirrored
# from the Grovjobb Navigator raw requirement list.
# ---------------------------------------------------------------------------
CATALOG: List[Idea] = [
    Idea(
        name="IsKlo",
        organism="Gecko toe pads",
        mechanism="Van der Waals micro-setae + capillary vacuum adhesion",
        problem="Grip on slick, ice-coated subsea steel.",
        solution=[
            "Gecko micro-structured contact pad for dry adhesion.",
            "Capillary vacuum cups for wet, submerged grip.",
            "Hydrophobic top coat to shed brine and ice film.",
        ],
        applications=["ROV tooling", "arctic maintenance", "offshore lifting gear"],
        target_specs=[
            "Hold-to-weight ratio >= 2.8 (mirrors TWR_Kolibri target).",
            "Adhesion retained on -20..40 C iced surface.",
            "Release/re-grip cycle < 10 s.",
        ],
        subsystems=[
            "Micro-setae pad array (moldable elastomer)",
            "Capillary vacuum cup ring",
            "Hydrophobic / icephobic surface coating",
            "Compliant backing + load sensor",
        ],
    ),
    Idea(
        name="KavitasjonsSkjold",
        organism="Shark skin denticles",
        mechanism="Riblet boundary-layer control + graded elastomer damping",
        problem="Erosion from propeller and pump cavitation.",
        solution=[
            "Sharkskin lamellae to delay cavitation onset.",
            "Elastomer gradient to absorb implosion energy.",
            "Pressure-relief micro-channels to vent collapse loads.",
        ],
        applications=["marine drivetrains", "thrusters", "high-speed pumps"],
        target_specs=[
            "Survive cavitation pressure P_cav >= 1.8 MPa (Hval-Prop onset).",
            "Operate above onset stress: sigma > onset.",
            "Improve thrust-per-watt vs bare blade.",
        ],
        subsystems=[
            "Riblet denticle skin (sacrificial layer)",
            "Graded elastomer damping substrate",
            "Pressure-relief micro-channel network",
            "Erosion witness coupons for inspection",
        ],
    ),
    Idea(
        name="BoreClaw",
        organism="Reindeer hoof",
        mechanism="Splaying segmented toes with self-clearing cleats",
        problem="Sloppy mechanical grip under sea ice and slush.",
        solution=[
            "Reindeer-hoof geometry that spreads under load.",
            "Segmented toe for conforming contact.",
            "Self-clearing flutes to shed slush and grit.",
        ],
        applications=["arctic lift", "subsea manipulators", "site handling"],
        target_specs=[
            "Hold > 2x design load before slip.",
            "Slush/grit jam rate < 1%.",
            "Conform to +/- surface irregularity without re-tooling.",
        ],
        subsystems=[
            "Splaying segmented toe linkage",
            "Self-clearing cleat flutes",
            "Compliant inter-toe membrane",
            "Pre-load spring + slip sensor",
        ],
    ),
    Idea(
        name="FrostLatch",
        organism="Bimetal thermal actuators",
        mechanism="Temperature-driven bistable latch with icephobic texture",
        problem="Locking mechanisms freezing shut in cold and salt.",
        solution=[
            "Bimetal actuation that works without external power.",
            "Antiferromagnetic detent for a defined locked state.",
            "Icephobic micro-topography on sealing faces.",
        ],
        applications=["door/hatch systems", "subsea covers", "emergency mechanics"],
        target_specs=[
            "Latch / unlatch < 10 s (Vortex-Lock target).",
            "Hold > 2x design load.",
            "Actuate across -20..40 C (delta L = alpha*L*delta T).",
        ],
        subsystems=[
            "Bimetal / thermospring actuator",
            "Antiferromagnetic detent",
            "Icephobic sealing face",
            "Manual override + position switch",
        ],
    ),
    Idea(
        name="MusselSeal",
        organism="Blue mussel byssus (DOPA adhesive proteins)",
        mechanism="Wet-cure adhesive analog + viscoelastic self-healing interface",
        problem="Sealing against vibration, salt, pressure and biofouling.",
        solution=[
            "Mussel-protein analog adhesive that cures wet.",
            "Viscoelastic interface layer to track vibration.",
            "Self-healing micro-fill to reseal small breaches.",
        ],
        applications=["flanges", "valves", "cable penetrators", "subsea housings"],
        target_specs=[
            "Biofouling < 10% coverage over 30 days (Merd-Mik target).",
            "Permeation reduced ~90%; retain > 95% (H2 barrier target).",
            "Seal under pressure P = rho*g*h at rated depth.",
        ],
        subsystems=[
            "Wet-cure adhesive primer",
            "Viscoelastic gasket layer",
            "Self-healing micro-capsule fill",
            "Anti-fouling surface treatment",
        ],
    ),
    Idea(
        name="KrillPump",
        organism="Krill pleopod metachronal swimming",
        mechanism="Pulsing metachronal channel with vortex steering",
        problem="Low-efficiency fluid transport at high viscosity with particles.",
        solution=[
            "Krill-inspired pulsing channel geometry.",
            "Vortex steering to keep particles entrained.",
            "Anti-clog ribs to prevent blockage.",
        ],
        applications=["slurry", "brine", "subsea chemical injection", "process pumping"],
        target_specs=[
            "Maintain flow with particle-laden, high-viscosity media.",
            "Clog/blockage rate minimized vs straight-bore pump.",
            "Efficiency gain measured against baseline impeller.",
        ],
        subsystems=[
            "Metachronal pulsing vane stack",
            "Vortex-steering channel geometry",
            "Anti-clog rib inserts",
            "Flow + differential-pressure sensing",
        ],
    ),
    Idea(
        name="WalrusWinch",
        organism="Tendon / ligament energy storage",
        mechanism="Elastic energy buffer with torque-limited clutch",
        problem="Heavy loads with jerk, shock and dynamic sea motion.",
        solution=[
            "Tendon/ligament model to store and release energy.",
            "Elastic energy buffer to absorb shock loads.",
            "Torque-limited clutch to cap peak loads.",
        ],
        applications=["mooring", "lifting", "cranes", "arctic installation"],
        target_specs=[
            "Cap peak load via clutch before structural limit.",
            "Damp dynamic sea-motion shock (snap loads).",
            "Cycle life without elastic fade > target.",
        ],
        subsystems=[
            "Elastic tendon buffer element",
            "Torque-limited clutch",
            "Shock-load damper",
            "Load + slip telemetry",
        ],
    ),
    Idea(
        name="ArcticFin",
        organism="Fish fin rays (lepidotrichia)",
        mechanism="Anisotropic fiber lay-up with passive trim correction",
        problem="Stiff structural drag on hulls and subsea modules.",
        solution=[
            "Fish-fin architecture for compliant control surfaces.",
            "Anisotropic fiber to tune bend vs twist.",
            "Passive trim correction without actuators.",
        ],
        applications=["AUV/ROV", "energy efficiency", "hydrodynamic fairings"],
        target_specs=[
            "Reduce drag vs rigid fairing baseline.",
            "Passive trim hold across speed range.",
            "Fatigue life under cyclic flow loading > target.",
        ],
        subsystems=[
            "Anisotropic fin-ray laminate",
            "Compliant trailing edge",
            "Passive trim spline",
            "Strain monitoring tell-tales",
        ],
    ),
    Idea(
        name="BarnacleCut",
        organism="Shrimp / crab claw cutting edge",
        mechanism="Micro-toothed edge with resonant descaling",
        problem="Removing hard growth without substrate damage.",
        solution=[
            "Shrimp/crab-claw edge geometry.",
            "Micro-chopper teeth for shear cutting.",
            "Resonance-driven descaling to pop growth free.",
        ],
        applications=["hull maintenance", "subsea cleaning tools", "inspection"],
        target_specs=[
            "Fracture growth: K_I > K_IC at the bond line.",
            "Substrate jam/scarring < 1%.",
            "Clear growth without removing coating.",
        ],
        subsystems=[
            "Micro-toothed cutting edge",
            "Resonant descaling driver",
            "Depth-limited stand-off guard",
            "Debris capture shroud",
        ],
    ),
    Idea(
        name="SealSpine",
        organism="Sea-snake vertebral column",
        mechanism="Variable-stiffness spiral with pressure-distributing segments",
        problem="Cable and hose fatigue in tight bends and cold.",
        solution=[
            "Sea-snake spiral for graceful bend support.",
            "Variable stiffness along the run.",
            "Pressure-distributing segments to spread bend stress.",
        ],
        applications=["umbilicals", "high-pressure hoses", "arctic mobile hydraulics"],
        target_specs=[
            "Enforce bend radius R > R_min everywhere.",
            "Distribute crush/abrasion load (hard-shell shield).",
            "Survive cold-bend fatigue cycles > target.",
        ],
        subsystems=[
            "Segmented spiral spine",
            "Variable-stiffness core",
            "Pressure-distributing collars",
            "Abrasion hard-shell sleeve",
        ],
    ),
]

_CATALOG_BY_KEY = {idea.name.lower(): idea for idea in CATALOG}


def list_ideas() -> List[Idea]:
    """Return the full catalog of biomimetic ideas."""

    return list(CATALOG)


def get_idea(name: str) -> Optional[Idea]:
    """Look up an idea by name (case-insensitive, partial match allowed)."""

    if not name:
        return None
    key = name.strip().lower()
    if key in _CATALOG_BY_KEY:
        return _CATALOG_BY_KEY[key]
    matches = [idea for k, idea in _CATALOG_BY_KEY.items() if key in k]
    if len(matches) == 1:
        return matches[0]
    return None


def build_prototype(idea: Idea) -> PrototypeSpec:
    """Expand an :class:`Idea` into a phased, testable prototype plan."""

    phases = [
        f"Concept lock: freeze the {idea.organism.lower()} mechanism and define "
        "the interface envelope.",
        "Bench model: 3D-print / mock the contact geometry and validate the "
        "core principle dry.",
        "Wet rig: test in tank/brine under representative pressure and "
        "temperature.",
        "Subsea trial: instrument an integrated unit and run against the "
        "acceptance criteria.",
        "Field pilot: deploy on a live ROV/asset with telemetry and witness "
        "inspection.",
    ]

    acceptance_criteria = list(idea.target_specs)
    acceptance_criteria.append(
        "Survive 30-day soak with no loss of function (corrosion / fouling check)."
    )

    risks = [
        "Material behavior at -20 C may diverge from bench (cold embrittlement).",
        "Biofouling and biofilm can degrade the active surface over time.",
        "Scaling the micro-geometry to production tolerance is unproven.",
    ]

    return PrototypeSpec(
        idea=idea,
        phases=phases,
        bill_of_materials=list(idea.subsystems),
        acceptance_criteria=acceptance_criteria,
        risks=risks,
    )


def build_all_prototypes() -> List[PrototypeSpec]:
    """Expand every catalog idea into a prototype plan."""

    return [build_prototype(idea) for idea in CATALOG]
