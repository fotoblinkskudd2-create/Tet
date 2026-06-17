#!/usr/bin/env python3
"""
Claude Code Integration Guide for OpenClaw
Ready-to-run workflows for your engineering, creative, and analytical projects
Copy sections directly into Claude Code for immediate execution
"""

import json
import os
import sys
from typing import Any

# Make sibling modules importable whether this file is run as a script
# (python claude_code_integration.py) or imported as part of the package.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ============================================================================
# WORKFLOW 1: ENGINEERING PARAMETER VALIDATION
# ============================================================================

def workflow_validate_subsea_component():
    """
    USE CASE: Quick validation of subsea mechanics parameters
    PROJECTS: AbyssLatch, VORTEX-LOCK, HYDROSPERRE
    TIME: < 1 minute
    """
    from openclaw_extensions import AbyssLatchScoutAgent, AbyssLatchProcessorAgent

    # Your component spec
    component_spec = {
        "pressure_rating_psi": 6000,
        "material": "Monel K-500",
        "bolt_count": 4,
        "bolt_diameter_mm": 12,
        "gasket_type": "dual-chamber",
        "flange_od_mm": 120,
        "expected_depth_meters": 1200
    }

    # Scout validates
    scout = AbyssLatchScoutAgent.validate_parameters(component_spec)

    # Quick decision
    if scout["constraints_met"]:
        print("✓ VALID: Proceed to processor phase")
        processor = AbyssLatchProcessorAgent.stress_analysis(scout)
        print(f"Safety factor: {processor['safety_factor']}")
        return {"status": "approved", "scout": scout, "processor": processor}
    else:
        print("✗ INVALID: Redesign required")
        return {"status": "rejected", "scout": scout}

# ============================================================================
# WORKFLOW 2: BIOMECHANICAL DESIGN VALIDATION
# ============================================================================

def workflow_validate_exosuit_fit():
    """
    USE CASE: Anatomical fit + mechanical validation
    PROJECT: SeneDrakt
    TIME: < 2 minutes
    """
    from openclaw_extensions import SeneDraktScoutAgent, SeneDraktProcessorAgent

    user_profile = {
        "user_height_cm": 182,
        "user_mass_kg": 82,
        "lift_assist_newtons": 100,
        "suit_material": "kevlar_nylon",
        "dual_spring_preload_newtons": 120
    }

    # Validate anatomy
    scout = SeneDraktScoutAgent.validate_anatomy(user_profile)
    print(f"Size recommendation: {scout['anthropometric_fit']['suit_size_recommendation']}")

    # Analyze mechanics
    processor = SeneDraktProcessorAgent.cam_profile_analysis(scout)
    print(f"Bistable transition time: {processor['stability_analysis']['snap_time_milliseconds']}ms")

    return {"scout": scout, "processor": processor}

# ============================================================================
# WORKFLOW 3: SONIC VISUALIZATION PIPELINE
# ============================================================================

def workflow_generate_sonic_art():
    """
    USE CASE: Audio → FFT → Visual rendering spec
    PROJECT: @MrArtjunkie Sonic Visualization
    TIME: < 3 minutes
    DELIVERABLE: JSON rendering specification for three.js
    """
    from openclaw_extensions import (
        SonicVisualizationScoutAgent,
        SonicVisualizationProcessorAgent,
        SonicVisualizationFinalizerAgent
    )

    audio_file_spec = {
        "sample_rate_hz": 44100,
        "duration_seconds": 90,
        "channels": 1,
        "bit_depth": 16
    }

    # Validate audio
    scout = SonicVisualizationScoutAgent.validate_audio_input(audio_file_spec)
    print(f"FFT resolution: {scout['frequency_resolution_hz']:.1f} Hz/bin")

    # FFT analysis
    processor = SonicVisualizationProcessorAgent.fft_analysis(scout)
    print("Frequency bands calculated")

    # Render specification
    finalizer = SonicVisualizationFinalizerAgent.render_specification(processor)

    # Save as JSON for three.js
    output_path = "sonic_visualization_spec.json"
    with open(output_path, "w") as f:
        json.dump(finalizer, f, indent=2)

    print(f"✓ Rendering spec saved → {output_path}")
    return finalizer

# ============================================================================
# WORKFLOW 4: MARINE ENGINEERING QUICK CALC
# ============================================================================

def workflow_pressure_seal_analysis():
    """
    USE CASE: Rapid seal design validation
    PROJECTS: VORTEX-LOCK, AbyssLatch, MusselLock
    FORMULAS: Hertzian contact stress, hydrostatic pressure
    """

    def hertzian_contact_stress(pressure_psi: float, contact_radius_mm: float) -> float:
        """Simplified Hertzian stress calculation"""
        pressure_mpa = pressure_psi * 0.00689476
        # Simplified contact stress = K * (pressure / contact_radius)
        contact_stress_mpa = pressure_mpa * 1.5 / max(contact_radius_mm / 10, 0.1)
        return contact_stress_mpa

    def hydrostatic_load(depth_m: float, area_mm2: float) -> float:
        """Calculate hydrostatic force"""
        pressure_pa = (depth_m * 9.81 * 1025)  # seawater density
        area_m2 = area_mm2 / 1e6
        force_newtons = pressure_pa * area_m2
        return force_newtons

    # Example: VORTEX-LOCK at 1000m depth
    config = {
        "rated_pressure_psi": 10000,
        "depth_meters": 1000,
        "seal_contact_radius_mm": 8,
        "ptfe_carbon_contact_area_mm2": 500
    }

    contact_stress = hertzian_contact_stress(
        config["rated_pressure_psi"],
        config["seal_contact_radius_mm"]
    )

    hydrostatic_force = hydrostatic_load(
        config["depth_meters"],
        config["ptfe_carbon_contact_area_mm2"]
    )

    result = {
        "component": "VORTEX-LOCK_pressure_seal",
        "rated_pressure_psi": config["rated_pressure_psi"],
        "depth_meters": config["depth_meters"],
        "contact_stress_mpa": round(contact_stress, 2),
        "hydrostatic_force_newtons": round(hydrostatic_force, 0),
        "safety_assessment": {
            "ptfe_yield_mpa": 28,
            "carbon_yield_mpa": 60,
            "contact_stress_acceptable": contact_stress < 25,
            "status": "approved" if contact_stress < 25 else "requires_redesign"
        }
    }

    print(json.dumps(result, indent=2))
    return result

# ============================================================================
# WORKFLOW 5: BATCH PROMPT OPTIMIZATION
# ============================================================================

def workflow_optimize_norwegian_prompts():
    """
    USE CASE: Process and score your 166-prompt Norwegian AI kit
    PROJECT: Norwegian AI Prompt Suite
    OUTPUT: Ranked prompts by NSCVM score
    """

    # Your 166 prompts loaded here (example 3 shown)
    prompts = [
        {
            "id": "NOR_001",
            "title": "Bedriftsstrategi analysør",
            "content": "Du er en expert strategikonsulent...",
            "domain": "business",
            "complexity": "intermediate"
        },
        {
            "id": "NOR_025",
            "title": "Gonzo journalistikk generator",
            "content": "Skriv en gonzo-inspirert artikkel om...",
            "domain": "creative",
            "complexity": "high"
        },
        {
            "id": "NOR_042",
            "title": "Teknisk dokumentasjon transformer",
            "content": "Konverter denne tekniske spesifikasjonen...",
            "domain": "technical",
            "complexity": "intermediate"
        }
    ]

    def score_prompt(prompt: dict) -> dict:
        """Score prompt using NSCVM"""
        # Simple scoring logic
        norwegian_score = 0.9 if "norsk" in prompt["content"].lower() else 0.5
        strategic_score = {"business": 0.8, "creative": 0.6, "technical": 0.7}.get(
            prompt["domain"], 0.5
        )
        calculated_score = {"high": 0.9, "intermediate": 0.7, "low": 0.4}.get(
            prompt["complexity"], 0.5
        )
        velocity_score = 0.8  # AI prompts are fast
        multiplier = 1.5 if prompt["domain"] == "business" else 1.0

        nscvm_total = (norwegian_score + strategic_score + calculated_score + velocity_score) / 4
        nscvm_total *= multiplier

        return {
            "prompt_id": prompt["id"],
            "title": prompt["title"],
            "nscvm_score": round(nscvm_total, 2),
            "breakdown": {
                "norwegian": norwegian_score,
                "strategic": strategic_score,
                "calculated": calculated_score,
                "velocity": velocity_score,
                "multiplier": multiplier
            }
        }

    # Score all prompts
    scored = [score_prompt(p) for p in prompts]

    # Rank by score
    ranked = sorted(scored, key=lambda x: x["nscvm_score"], reverse=True)

    print("Top 5 highest-scoring prompts:")
    for i, p in enumerate(ranked[:5], 1):
        print(f"{i}. {p['title']} (score: {p['nscvm_score']})")

    return ranked

# ============================================================================
# WORKFLOW 6: AUTONOMOUS SUBSEA DOCK SPECIFICATION
# ============================================================================

def workflow_generate_dyplader_spec():
    """
    USE CASE: Generate technical spec for DYPLADER autonomous charging dock
    PROJECT: DYPLADER
    OUTPUT: Structured JSON specification
    """

    spec = {
        "system_name": "DYPLADER",
        "function": "Autonomous subsea charging dock",
        "operating_depth_meters": 600,
        "rated_pressure_psi": 900,

        "charging_interfaces": {
            "connector_type": "high_pressure_contact",
            "power_rating_watts": 5000,
            "voltage": "48V_DC",
            "contact_material": "silver_plated_copper",
            "sealing": "dual_lip_pressure_activated"
        },

        "structural_specs": {
            "housing_material": "duplex_stainless_2507",
            "overall_length_mm": 800,
            "overall_width_mm": 600,
            "overall_height_mm": 1200,
            "dry_weight_kg": 450,
            "payload_capacity_kg": 200
        },

        "navigation_systems": {
            "positioning": "ultra_short_baseline_usbl",
            "accuracy_meters": 2,
            "communication": "acoustic_modem_9.6_kbps",
            "power_beacon": "strobing_led_yellow"
        },

        "autonomy_specs": {
            "mission_duration_days": 30,
            "battery_type": "LiFePO4_sealed_cells",
            "battery_capacity_kwh": 8,
            "charging_cycles_before_maintenance": 500
        },

        "deployment_readiness": {
            "prototype_stage": "phase_2_field_testing",
            "estimated_delivery_months": 18,
            "cost_estimate_usd": 250000,
            "critical_path_items": [
                "pressure_connector_qualification",
                "acoustic_modem_integration",
                "fatigue_testing_500_cycles"
            ]
        }
    }

    print(json.dumps(spec, indent=2))

    output_path = "DYPLADER_specification.json"
    with open(output_path, "w") as f:
        json.dump(spec, f, indent=2)

    print(f"✓ Spec saved → {output_path}")
    return spec

# ============================================================================
# QUICK START: COPY-PASTE TEMPLATES
# ============================================================================

def template_new_engineering_analysis(component_name: str, parameters: dict):
    """
    TEMPLATE: Add your own component analysis
    Copy this structure for new projects
    """
    print(f"\n=== {component_name.upper()} ANALYSIS ===")
    print("Input parameters:")
    print(json.dumps(parameters, indent=2))

    # Scout phase
    print("\n→ SCOUT: Validation")
    # Add your validation logic

    # Processor phase
    print("→ PROCESSOR: Analysis")
    # Add your analysis logic

    # Finalizer phase
    print("→ FINALIZER: Decision")
    # Add your decision logic

    return {"status": "template_ready"}

# ============================================================================
# MAIN: RUN IN CLAUDE CODE
# ============================================================================

if __name__ == "__main__":
    print("🔧 OpenClaw Integration Guide\n")
    print("Available workflows:\n")
    print("1. workflow_validate_subsea_component() → AbyssLatch validation")
    print("2. workflow_validate_exosuit_fit() → SeneDrakt anatomy check")
    print("3. workflow_generate_sonic_art() → FFT visualization")
    print("4. workflow_pressure_seal_analysis() → VORTEX-LOCK calcs")
    print("5. workflow_optimize_norwegian_prompts() → Prompt ranking")
    print("6. workflow_generate_dyplader_spec() → Charging dock spec\n")

    # Run example
    print("→ Running: workflow_pressure_seal_analysis()\n")
    result = workflow_pressure_seal_analysis()

    print("\n✓ Done. Use any workflow above in your projects.")
