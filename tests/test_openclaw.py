from openclaw import concrete_tasks as tasks
from openclaw import claude_code_integration as integration
from openclaw.openclaw_extensions import (
    AbyssLatchFinalizerAgent,
    AbyssLatchProcessorAgent,
    AbyssLatchScoutAgent,
    SeneDraktFinalizerAgent,
    SeneDraktProcessorAgent,
    SeneDraktScoutAgent,
    SonicVisualizationFinalizerAgent,
    SonicVisualizationProcessorAgent,
    SonicVisualizationScoutAgent,
    run_abysslatch_workflow,
)


def test_abysslatch_scout_to_finalizer_pipeline():
    config = {
        "pressure_rating_psi": 6000,
        "material": "Monel K-500",
        "bolt_count": 4,
        "bolt_diameter_mm": 12,
        "gasket_type": "dual-chamber",
        "flange_od_mm": 120,
        "expected_depth_meters": 1000,
    }
    scout = AbyssLatchScoutAgent.validate_parameters(config)
    assert scout["constraints_met"] is True

    processor = AbyssLatchProcessorAgent.stress_analysis(scout)
    assert processor["safety_factor"] > 0

    finalizer = AbyssLatchFinalizerAgent.generate_specs(processor)
    assert finalizer["decision"] == "approve_for_prototype_manufacturing"


def test_run_abysslatch_workflow_returns_all_stages():
    result = run_abysslatch_workflow()
    assert set(result) == {"scout", "processor", "finalizer"}


def test_senedrakt_scout_to_processor_pipeline():
    profile = {
        "user_height_cm": 182,
        "user_mass_kg": 82,
        "lift_assist_newtons": 100,
        "suit_material": "kevlar_nylon",
        "dual_spring_preload_newtons": 120,
    }
    scout = SeneDraktScoutAgent.validate_anatomy(profile)
    processor = SeneDraktProcessorAgent.cam_profile_analysis(scout)
    finalizer = SeneDraktFinalizerAgent.generate_decision(processor)

    assert scout["mechanical_parameters"]["lift_assist_newtons"] == 100
    assert processor["cam_mechanism"]["peak_contact_force_newtons"] == 220
    assert finalizer["manufacturing_readiness"] == "prototype_to_beta"


def test_sonic_visualization_pipeline_produces_render_spec():
    audio_spec = {
        "sample_rate_hz": 44100,
        "duration_seconds": 90,
        "channels": 1,
        "bit_depth": 16,
    }
    scout = SonicVisualizationScoutAgent.validate_audio_input(audio_spec)
    processor = SonicVisualizationProcessorAgent.fft_analysis(scout)
    finalizer = SonicVisualizationFinalizerAgent.render_specification(processor)

    assert scout["nyquist_frequency_hz"] == 22050
    assert finalizer["render_engine"] == "threejs_webgl"


def test_task_1_abysslatch_gasket_seating_flags_low_preload():
    result = tasks.task_1_abysslatch_gasket_seating()
    # Seating pressure from the configured bolt preload falls short of the
    # 6000 psi rated system pressure, so a redesign is recommended.
    assert result["recommendation"] == "REDESIGN_REQUIRED"
    assert result["safety_margin_factor"] < 1.8


def test_task_2_senedrakt_snap_load_is_stable():
    result = tasks.task_2_senedrakt_snap_load()
    assert result["status"] == "STABLE"
    assert result["snap_force_newtons"] > 0


def test_task_3_dr2_rotor_stall_margin_is_safe():
    result = tasks.task_3_dr2_rotor_stall_margin()
    assert result["status"] == "SAFE_MARGIN"
    assert result["stall_margin_deg"] > 2.0


def test_task_4_vortexlock_ptfe_stress_flags_overstress():
    result = tasks.task_4_vortexlock_ptfe_stress()
    # At 10,000 psi the PTFE contact stress exceeds its yield strength.
    assert result["status"] == "OVERSTRESS"


def test_task_5_lyttepost_leak_localization_exceeds_target():
    result = tasks.task_5_lyttepost_leak_localization()
    assert result["status"] == "EXCEEDS_TARGET"
    assert result["calculated_localization_error_m"] > 0


def test_task_6_sonic_fft_to_color_ready_for_rendering():
    result = tasks.task_6_sonic_fft_to_color()
    assert result["status"] == "READY_FOR_RENDERING"
    assert len(result["color_bands"]) == 7


def test_task_7_u864_mercury_spread_estimates_area():
    result = tasks.task_7_u864_mercury_spread()
    assert result["spread_model"]["estimated_contaminated_area_m2"] > 0


def test_workflow_validate_subsea_component_is_approved():
    result = integration.workflow_validate_subsea_component()
    assert result["status"] == "approved"


def test_workflow_validate_exosuit_fit_returns_scout_and_processor():
    result = integration.workflow_validate_exosuit_fit()
    assert "scout" in result and "processor" in result


def test_workflow_pressure_seal_analysis_flags_redesign():
    result = integration.workflow_pressure_seal_analysis()
    # 10,000 psi at 1000m exceeds the acceptable PTFE/carbon contact stress.
    assert result["safety_assessment"]["status"] == "requires_redesign"


def test_workflow_optimize_norwegian_prompts_ranks_by_score():
    ranked = integration.workflow_optimize_norwegian_prompts()
    scores = [p["nscvm_score"] for p in ranked]
    assert scores == sorted(scores, reverse=True)


def test_workflow_generate_dyplader_spec_has_expected_fields(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    spec = integration.workflow_generate_dyplader_spec()
    assert spec["system_name"] == "DYPLADER"
    assert spec["operating_depth_meters"] == 600


def test_workflow_generate_sonic_art_has_render_engine(tmp_path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    spec = integration.workflow_generate_sonic_art()
    assert spec["render_engine"] == "threejs_webgl"
