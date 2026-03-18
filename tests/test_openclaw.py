"""Comprehensive tests for the OpenClaw smart document generator."""

import json

import openclaw


# ---------------------------------------------------------------------------
# Detection tests
# ---------------------------------------------------------------------------


class TestDetectDocType:
    def test_detects_contract_keyword(self):
        assert openclaw.detect_doc_type("I need a freelance contract") == "contract"

    def test_detects_sow_keyword(self):
        assert openclaw.detect_doc_type("create a statement of work") == "sow"

    def test_detects_scope_alias(self):
        assert openclaw.detect_doc_type("draft a scope of work for the project") == "sow"

    def test_detects_nda_keyword(self):
        assert openclaw.detect_doc_type("NDA for partnership discussions") == "nda"

    def test_detects_invoice_keyword(self):
        assert openclaw.detect_doc_type("invoice for web development") == "invoice"

    def test_detects_workflow_keyword(self):
        assert openclaw.detect_doc_type("build a workflow for onboarding") == "workflow"

    def test_detects_proposal_keyword(self):
        assert openclaw.detect_doc_type("project proposal for mobile app") == "proposal"

    def test_detects_brief_keyword(self):
        assert openclaw.detect_doc_type("write a project brief") == "brief"

    def test_returns_none_for_unknown(self):
        assert openclaw.detect_doc_type("random unrelated text") is None

    def test_case_insensitive(self):
        assert openclaw.detect_doc_type("INVOICE for design work") == "invoice"


# ---------------------------------------------------------------------------
# List types
# ---------------------------------------------------------------------------


class TestListDocTypes:
    def test_returns_all_seven_types(self):
        types = openclaw.list_doc_types()
        assert len(types) == 7

    def test_each_type_has_required_keys(self):
        for dt in openclaw.list_doc_types():
            assert "key" in dt
            assert "label" in dt
            assert "description" in dt


# ---------------------------------------------------------------------------
# Generation – contract
# ---------------------------------------------------------------------------


class TestGenerateContract:
    def test_generates_contract_from_keyword(self):
        doc = openclaw.generate("Create a contract for web development")
        assert doc.doc_type == "Freelance Contract"
        assert "Service Agreement" in doc.title

    def test_contract_has_required_sections(self):
        doc = openclaw.generate("contract for app development")
        section_titles = [s.title for s in doc.sections]
        assert "Parties" in section_titles
        assert "Compensation" in section_titles
        assert "Signatures" in section_titles

    def test_contract_with_params(self):
        doc = openclaw.generate(
            "contract for design work",
            params={"client": "Acme Corp", "provider": "Jane Doe", "amount": "$5,000"},
        )
        parties_section = next(s for s in doc.sections if s.title == "Parties")
        client_field = next(f for f in parties_section.fields if f.label == "Client")
        assert client_field.value == "Acme Corp"

    def test_contract_explicit_type(self):
        doc = openclaw.generate("design work for ACME", doc_type="contract")
        assert doc.doc_type == "Freelance Contract"


# ---------------------------------------------------------------------------
# Generation – SOW
# ---------------------------------------------------------------------------


class TestGenerateSOW:
    def test_generates_sow(self):
        doc = openclaw.generate("statement of work for API integration")
        assert doc.doc_type == "Statement of Work"
        assert "SOW" in doc.title

    def test_sow_has_milestones_section(self):
        doc = openclaw.generate("sow for backend rewrite")
        section_titles = [s.title for s in doc.sections]
        assert "Timeline & Milestones" in section_titles

    def test_sow_has_acceptance_criteria(self):
        doc = openclaw.generate("scope of work for testing")
        section_titles = [s.title for s in doc.sections]
        assert "Acceptance Criteria" in section_titles


# ---------------------------------------------------------------------------
# Generation – brief
# ---------------------------------------------------------------------------


class TestGenerateBrief:
    def test_generates_brief(self):
        doc = openclaw.generate("project brief for new mobile app")
        assert doc.doc_type == "Project Brief"

    def test_brief_has_risk_section(self):
        doc = openclaw.generate("brief for platform migration")
        section_titles = [s.title for s in doc.sections]
        assert "Risks & Mitigations" in section_titles


# ---------------------------------------------------------------------------
# Generation – NDA
# ---------------------------------------------------------------------------


class TestGenerateNDA:
    def test_generates_nda(self):
        doc = openclaw.generate("NDA for business discussions")
        assert doc.doc_type == "Non-Disclosure Agreement"
        assert "Non-Disclosure" in doc.title

    def test_nda_has_obligations(self):
        doc = openclaw.generate("confidentiality agreement")
        section_titles = [s.title for s in doc.sections]
        assert "Obligations" in section_titles

    def test_nda_has_exclusions(self):
        doc = openclaw.generate("NDA for partnership")
        section_titles = [s.title for s in doc.sections]
        assert "Exclusions" in section_titles


# ---------------------------------------------------------------------------
# Generation – invoice
# ---------------------------------------------------------------------------


class TestGenerateInvoice:
    def test_generates_invoice(self):
        doc = openclaw.generate("invoice for consulting work")
        assert doc.doc_type == "Invoice"

    def test_invoice_extracts_amount(self):
        doc = openclaw.generate("invoice for $3,500 worth of design work")
        total_section = next(s for s in doc.sections if s.title == "Total")
        total_field = next(f for f in total_section.fields if f.label == "Total Due")
        assert "$3,500" in total_field.value

    def test_invoice_has_line_items(self):
        doc = openclaw.generate("invoice for dev work")
        section_titles = [s.title for s in doc.sections]
        assert "Line Items" in section_titles


# ---------------------------------------------------------------------------
# Generation – workflow
# ---------------------------------------------------------------------------


class TestGenerateWorkflow:
    def test_generates_workflow(self):
        doc = openclaw.generate("workflow for content publishing")
        assert doc.doc_type == "Workflow Plan"

    def test_workflow_has_four_stages(self):
        doc = openclaw.generate("workflow for customer onboarding")
        stage_sections = [s for s in doc.sections if s.title.startswith("Stage")]
        assert len(stage_sections) == 4

    def test_workflow_has_automation_section(self):
        doc = openclaw.generate("process for bug triage")
        section_titles = [s.title for s in doc.sections]
        assert "Automation Opportunities" in section_titles


# ---------------------------------------------------------------------------
# Generation – proposal
# ---------------------------------------------------------------------------


class TestGenerateProposal:
    def test_generates_proposal(self):
        doc = openclaw.generate("proposal for e-commerce platform")
        assert doc.doc_type == "Project Proposal"
        assert "Proposal" in doc.title

    def test_proposal_has_timeline(self):
        doc = openclaw.generate("proposal for redesign")
        section_titles = [s.title for s in doc.sections]
        assert "Timeline" in section_titles

    def test_proposal_has_why_us(self):
        doc = openclaw.generate("pitch for new client project")
        section_titles = [s.title for s in doc.sections]
        assert "Why Us" in section_titles


# ---------------------------------------------------------------------------
# Rendering and serialization
# ---------------------------------------------------------------------------


class TestRendering:
    def test_render_produces_readable_text(self):
        doc = openclaw.generate("contract for web dev")
        rendered = doc.render()
        assert "Service Agreement" in rendered
        assert "Parties" in rendered
        assert "========" in rendered

    def test_to_dict_is_valid_json(self):
        doc = openclaw.generate("invoice for design")
        data = doc.to_dict()
        serialized = json.dumps(data)
        parsed = json.loads(serialized)
        assert parsed["doc_type"] == "Invoice"
        assert isinstance(parsed["sections"], list)

    def test_section_render_includes_fields(self):
        section = openclaw.ClawSection(
            title="Test",
            body="Body text.",
            fields=[openclaw.ClawField("Name", "Alice", required=True)],
        )
        rendered = section.render()
        assert "Name: Alice" in rendered
        assert "[*]" in rendered


# ---------------------------------------------------------------------------
# Error handling
# ---------------------------------------------------------------------------


class TestErrorHandling:
    def test_empty_description_raises(self):
        try:
            openclaw.generate("")
            assert False, "Expected ValueError"
        except ValueError as e:
            assert "description" in str(e).lower()

    def test_whitespace_description_raises(self):
        try:
            openclaw.generate("   ")
            assert False, "Expected ValueError"
        except ValueError as e:
            assert "description" in str(e).lower()

    def test_undetectable_type_raises(self):
        try:
            openclaw.generate("something random without keywords")
            assert False, "Expected ValueError"
        except ValueError as e:
            assert "available types" in str(e).lower()

    def test_explicit_type_overrides_detection(self):
        doc = openclaw.generate("random text without keywords", doc_type="invoice")
        assert doc.doc_type == "Invoice"


# ---------------------------------------------------------------------------
# CLI integration (via app.py)
# ---------------------------------------------------------------------------


class TestCLIIntegration:
    def test_claw_flag_generates_document(self):
        import app
        # Should exit with 0 and produce output
        result = app.main(["--claw", "create a contract for consulting"])
        assert result == 0

    def test_claw_list_flag(self):
        import app
        result = app.main(["--claw-list"])
        assert result == 0

    def test_claw_json_flag(self):
        import app
        result = app.main(["--claw", "--claw-json", "invoice for $1000 design work"])
        assert result == 0

    def test_claw_with_explicit_type(self):
        import app
        result = app.main(["--claw", "--doc-type", "nda", "partnership discussions"])
        assert result == 0

    def test_claw_with_params(self):
        import app
        result = app.main([
            "--claw",
            "--claw-param", "client=Acme Corp",
            "--claw-param", "amount=$10,000",
            "contract for web development",
        ])
        assert result == 0
