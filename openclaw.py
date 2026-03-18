"""
OpenClaw – A smart workflow and document generator for professional work.

Generates structured, ready-to-use documents: contracts, statements of work,
project briefs, NDAs, invoices, and workflow plans.  Each document type follows
a proven template enriched with sensible defaults so you can go from a one-line
idea to a polished draft in seconds.
"""
from __future__ import annotations

import re
import textwrap
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Any, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# Core data structures
# ---------------------------------------------------------------------------

@dataclass
class ClawField:
    """A single field inside a generated document."""

    label: str
    value: str
    required: bool = True


@dataclass
class ClawSection:
    """A titled block of content in a generated document."""

    title: str
    body: str
    fields: List[ClawField] = field(default_factory=list)

    def render(self, width: int = 72) -> str:
        lines = [f"## {self.title}", ""]
        if self.body:
            lines.append(textwrap.fill(self.body, width=width))
            lines.append("")
        for f in self.fields:
            marker = "*" if f.required else " "
            lines.append(f"  [{marker}] {f.label}: {f.value}")
        return "\n".join(lines)


@dataclass
class ClawDocument:
    """A complete generated OpenClaw document."""

    doc_type: str
    title: str
    sections: List[ClawSection]
    metadata: Dict[str, str] = field(default_factory=dict)
    generated_on: str = field(default_factory=lambda: date.today().isoformat())

    def render(self) -> str:
        header = [
            f"# {self.title}",
            f"Document type: {self.doc_type}",
            f"Generated: {self.generated_on}",
        ]
        for k, v in self.metadata.items():
            header.append(f"{k}: {v}")
        header.append("=" * 72)
        body = "\n\n".join(section.render() for section in self.sections)
        return "\n".join(header) + "\n\n" + body + "\n"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "doc_type": self.doc_type,
            "title": self.title,
            "generated_on": self.generated_on,
            "metadata": self.metadata,
            "sections": [
                {
                    "title": s.title,
                    "body": s.body,
                    "fields": [
                        {"label": f.label, "value": f.value, "required": f.required}
                        for f in s.fields
                    ],
                }
                for s in self.sections
            ],
        }


# ---------------------------------------------------------------------------
# Document type registry
# ---------------------------------------------------------------------------

DOC_TYPES: Dict[str, Dict[str, Any]] = {
    "contract": {
        "label": "Freelance Contract",
        "aliases": ("freelance", "agreement", "service agreement"),
        "description": "A professional service contract between a provider and client.",
    },
    "sow": {
        "label": "Statement of Work",
        "aliases": ("scope", "statement", "scope of work"),
        "description": "A detailed scope document outlining deliverables, timelines, and acceptance criteria.",
    },
    "brief": {
        "label": "Project Brief",
        "aliases": ("project brief", "project plan", "kickoff"),
        "description": "A concise project brief covering goals, stakeholders, and key milestones.",
    },
    "nda": {
        "label": "Non-Disclosure Agreement",
        "aliases": ("confidentiality", "confidential"),
        "description": "A mutual or one-way confidentiality agreement to protect sensitive information.",
    },
    "invoice": {
        "label": "Invoice",
        "aliases": ("bill", "payment", "billing"),
        "description": "A professional invoice for completed work with line items and payment terms.",
    },
    "workflow": {
        "label": "Workflow Plan",
        "aliases": ("process", "automation", "pipeline", "flow"),
        "description": "A structured workflow plan with stages, owners, and checkpoints.",
    },
    "proposal": {
        "label": "Project Proposal",
        "aliases": ("pitch", "bid", "rfp response"),
        "description": "A persuasive project proposal with problem statement, approach, timeline, and pricing.",
    },
}

# Reverse lookup from aliases
_ALIAS_MAP: Dict[str, str] = {}
for _key, _info in DOC_TYPES.items():
    _ALIAS_MAP[_key] = _key
    _ALIAS_MAP[_info["label"].lower()] = _key
    for _alias in _info["aliases"]:
        _ALIAS_MAP[_alias] = _key


# ---------------------------------------------------------------------------
# Smart defaults
# ---------------------------------------------------------------------------

def _today() -> str:
    return date.today().isoformat()


def _future(days: int) -> str:
    return (date.today() + timedelta(days=days)).isoformat()


def _extract_parties(description: str) -> Tuple[str, str]:
    """Try to extract party names from a description string."""
    for_pattern = re.compile(r"(?:for|with|between)\s+([A-Z][\w\s&.]+?)(?:\s+and\s+([A-Z][\w\s&.]+))?(?:\s*[,.]|$)", re.IGNORECASE)
    match = for_pattern.search(description)
    if match:
        client = match.group(1).strip()
        provider = match.group(2).strip() if match.group(2) else "[Your Name / Company]"
        return provider, client
    return "[Your Name / Company]", "[Client Name]"


def _extract_amount(description: str) -> str:
    """Try to extract a monetary amount from the description."""
    amount_pattern = re.compile(r"\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|EUR|GBP|NOK|SEK|DKK)")
    match = amount_pattern.search(description)
    return match.group(0) if match else "[Amount]"


def _extract_project_name(description: str) -> str:
    """Derive a project name from the description."""
    cleaned = re.sub(r"(?:generate|create|make|build|draft)\s+(?:a|an|the)?\s*", "", description, flags=re.IGNORECASE)
    cleaned = re.sub(r"\b(?:contract|sow|nda|invoice|brief|workflow|proposal)\b", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s+", " ", cleaned).strip().rstrip(".")
    if cleaned:
        return cleaned.title()
    return "[Project Name]"


# ---------------------------------------------------------------------------
# Document builders
# ---------------------------------------------------------------------------

def _build_contract(description: str, params: Dict[str, str]) -> ClawDocument:
    provider, client = _extract_parties(description)
    project = _extract_project_name(description)
    amount = _extract_amount(description)

    return ClawDocument(
        doc_type="Freelance Contract",
        title=f"Service Agreement – {params.get('project', project)}",
        metadata={"Status": "Draft", "Version": "1.0"},
        sections=[
            ClawSection(
                title="Parties",
                body="This agreement is entered into between the following parties.",
                fields=[
                    ClawField("Provider", params.get("provider", provider)),
                    ClawField("Client", params.get("client", client)),
                    ClawField("Effective Date", params.get("start_date", _today())),
                ],
            ),
            ClawSection(
                title="Scope of Services",
                body=params.get("scope", f"Provider agrees to deliver professional services related to: {project}. "
                     "The specific deliverables, timelines, and acceptance criteria are detailed below."),
                fields=[
                    ClawField("Project Name", params.get("project", project)),
                    ClawField("Deliverables", params.get("deliverables", "[List key deliverables]")),
                    ClawField("Timeline", params.get("timeline", f"{_today()} to {_future(30)}")),
                ],
            ),
            ClawSection(
                title="Compensation",
                body="Client agrees to compensate Provider as follows.",
                fields=[
                    ClawField("Total Amount", params.get("amount", amount)),
                    ClawField("Payment Schedule", params.get("payment_schedule", "50% upfront, 50% on completion")),
                    ClawField("Payment Method", params.get("payment_method", "Bank transfer within 14 days of invoice")),
                    ClawField("Late Fee", params.get("late_fee", "1.5% per month on overdue balances")),
                ],
            ),
            ClawSection(
                title="Intellectual Property",
                body="Upon full payment, all work product and intellectual property created under this "
                     "agreement shall transfer to the Client. Provider retains the right to display "
                     "non-confidential work in their portfolio.",
            ),
            ClawSection(
                title="Termination",
                body="Either party may terminate this agreement with 14 days written notice. "
                     "Client shall pay for all work completed up to the termination date.",
                fields=[
                    ClawField("Notice Period", params.get("notice_period", "14 days"), required=False),
                ],
            ),
            ClawSection(
                title="Signatures",
                body="",
                fields=[
                    ClawField("Provider Signature", "________________________  Date: ___________"),
                    ClawField("Client Signature", "________________________  Date: ___________"),
                ],
            ),
        ],
    )


def _build_sow(description: str, params: Dict[str, str]) -> ClawDocument:
    provider, client = _extract_parties(description)
    project = _extract_project_name(description)

    return ClawDocument(
        doc_type="Statement of Work",
        title=f"SOW – {params.get('project', project)}",
        metadata={"Status": "Draft", "Version": "1.0"},
        sections=[
            ClawSection(
                title="Overview",
                body=params.get("overview",
                    f"This Statement of Work defines the scope, deliverables, and timeline for "
                    f"{project}. It serves as the authoritative reference for project execution."),
                fields=[
                    ClawField("Project Name", params.get("project", project)),
                    ClawField("Client", params.get("client", client)),
                    ClawField("Provider", params.get("provider", provider)),
                ],
            ),
            ClawSection(
                title="Objectives",
                body=params.get("objectives",
                    "1. Define clear deliverables with measurable acceptance criteria.\n"
                    "2. Establish realistic milestones and checkpoints.\n"
                    "3. Align stakeholder expectations on scope boundaries."),
            ),
            ClawSection(
                title="Deliverables",
                body="",
                fields=[
                    ClawField("Deliverable 1", params.get("d1", "[Primary deliverable and acceptance criteria]")),
                    ClawField("Deliverable 2", params.get("d2", "[Secondary deliverable and acceptance criteria]")),
                    ClawField("Deliverable 3", params.get("d3", "[Additional deliverable]"), required=False),
                ],
            ),
            ClawSection(
                title="Timeline & Milestones",
                body="",
                fields=[
                    ClawField("Start Date", params.get("start_date", _today())),
                    ClawField("Milestone 1", params.get("m1", f"Requirements sign-off – {_future(7)}")),
                    ClawField("Milestone 2", params.get("m2", f"First draft / prototype – {_future(21)}")),
                    ClawField("Final Delivery", params.get("end_date", _future(30))),
                ],
            ),
            ClawSection(
                title="Assumptions & Constraints",
                body=params.get("assumptions",
                    "- Client provides timely feedback within 3 business days.\n"
                    "- Scope changes require a written change request and may affect timeline.\n"
                    "- Provider has access to all necessary tools, accounts, and documentation."),
            ),
            ClawSection(
                title="Acceptance Criteria",
                body=params.get("acceptance",
                    "Each deliverable is considered accepted when the client provides written "
                    "approval or does not raise issues within 5 business days of delivery."),
            ),
        ],
    )


def _build_brief(description: str, params: Dict[str, str]) -> ClawDocument:
    project = _extract_project_name(description)

    return ClawDocument(
        doc_type="Project Brief",
        title=f"Project Brief – {params.get('project', project)}",
        metadata={"Status": "Draft", "Priority": params.get("priority", "Medium")},
        sections=[
            ClawSection(
                title="Project Overview",
                body=params.get("overview",
                    f"This brief outlines the goals, approach, and key milestones for {project}."),
                fields=[
                    ClawField("Project Name", params.get("project", project)),
                    ClawField("Owner", params.get("owner", "[Project Owner]")),
                    ClawField("Target Launch", params.get("target_date", _future(30))),
                ],
            ),
            ClawSection(
                title="Problem Statement",
                body=params.get("problem",
                    "[Describe the core problem this project solves. Be specific about who is "
                    "affected and the current impact.]"),
            ),
            ClawSection(
                title="Goals & Success Metrics",
                body=params.get("goals",
                    "1. [Primary goal with measurable outcome]\n"
                    "2. [Secondary goal with measurable outcome]\n"
                    "3. [Stretch goal]"),
            ),
            ClawSection(
                title="Stakeholders",
                body="",
                fields=[
                    ClawField("Decision Maker", params.get("decision_maker", "[Name]")),
                    ClawField("Technical Lead", params.get("tech_lead", "[Name]")),
                    ClawField("Key Stakeholders", params.get("stakeholders", "[Names / teams]")),
                ],
            ),
            ClawSection(
                title="Milestones",
                body="",
                fields=[
                    ClawField("Phase 1 – Discovery", params.get("phase1", f"Complete by {_future(7)}")),
                    ClawField("Phase 2 – Build", params.get("phase2", f"Complete by {_future(21)}")),
                    ClawField("Phase 3 – Launch", params.get("phase3", f"Complete by {_future(30)}")),
                ],
            ),
            ClawSection(
                title="Risks & Mitigations",
                body=params.get("risks",
                    "| Risk | Likelihood | Impact | Mitigation |\n"
                    "| ---- | ---------- | ------ | ---------- |\n"
                    "| Scope creep | Medium | High | Strict change-request process |\n"
                    "| Resource availability | Low | Medium | Cross-train team members |"),
            ),
        ],
    )


def _build_nda(description: str, params: Dict[str, str]) -> ClawDocument:
    provider, client = _extract_parties(description)

    return ClawDocument(
        doc_type="Non-Disclosure Agreement",
        title="Mutual Non-Disclosure Agreement",
        metadata={"Status": "Draft", "Type": params.get("nda_type", "Mutual")},
        sections=[
            ClawSection(
                title="Parties",
                body="This Non-Disclosure Agreement is entered into by and between the following parties.",
                fields=[
                    ClawField("Party A (Discloser)", params.get("party_a", provider)),
                    ClawField("Party B (Receiver)", params.get("party_b", client)),
                    ClawField("Effective Date", params.get("effective_date", _today())),
                ],
            ),
            ClawSection(
                title="Definition of Confidential Information",
                body=params.get("definition",
                    "Confidential Information includes all non-public technical, business, financial, "
                    "or strategic information disclosed by either party, whether orally, in writing, "
                    "or through demonstration. This includes but is not limited to: trade secrets, "
                    "source code, algorithms, customer lists, business plans, pricing, and product roadmaps."),
            ),
            ClawSection(
                title="Obligations",
                body="The receiving party agrees to:\n"
                     "1. Hold all Confidential Information in strict confidence.\n"
                     "2. Not disclose it to third parties without prior written consent.\n"
                     "3. Use it only for the purpose of evaluating or pursuing a business relationship.\n"
                     "4. Protect it with the same degree of care used for their own confidential information.",
            ),
            ClawSection(
                title="Exclusions",
                body="Confidential Information does not include information that:\n"
                     "- Is or becomes publicly available through no fault of the receiving party.\n"
                     "- Was known to the receiving party before disclosure.\n"
                     "- Is independently developed without use of the Confidential Information.\n"
                     "- Is disclosed with the prior written approval of the disclosing party.",
            ),
            ClawSection(
                title="Term",
                body="",
                fields=[
                    ClawField("Duration", params.get("duration", "2 years from the Effective Date")),
                    ClawField("Survival Period", params.get("survival", "Obligations survive 3 years after termination")),
                ],
            ),
            ClawSection(
                title="Signatures",
                body="",
                fields=[
                    ClawField("Party A Signature", "________________________  Date: ___________"),
                    ClawField("Party B Signature", "________________________  Date: ___________"),
                ],
            ),
        ],
    )


def _build_invoice(description: str, params: Dict[str, str]) -> ClawDocument:
    provider, client = _extract_parties(description)
    amount = _extract_amount(description)
    project = _extract_project_name(description)

    return ClawDocument(
        doc_type="Invoice",
        title=f"Invoice – {params.get('project', project)}",
        metadata={"Status": "Unpaid", "Invoice #": params.get("invoice_number", "INV-001")},
        sections=[
            ClawSection(
                title="From",
                body="",
                fields=[
                    ClawField("Provider", params.get("provider", provider)),
                    ClawField("Email", params.get("provider_email", "[your@email.com]")),
                    ClawField("Address", params.get("provider_address", "[Your address]")),
                ],
            ),
            ClawSection(
                title="Bill To",
                body="",
                fields=[
                    ClawField("Client", params.get("client", client)),
                    ClawField("Email", params.get("client_email", "[client@email.com]")),
                    ClawField("Address", params.get("client_address", "[Client address]")),
                ],
            ),
            ClawSection(
                title="Invoice Details",
                body="",
                fields=[
                    ClawField("Invoice Date", params.get("invoice_date", _today())),
                    ClawField("Due Date", params.get("due_date", _future(14))),
                    ClawField("Payment Terms", params.get("payment_terms", "Net 14")),
                ],
            ),
            ClawSection(
                title="Line Items",
                body="| # | Description | Qty | Rate | Amount |\n"
                     "| - | ----------- | --- | ---- | ------ |\n"
                     f"| 1 | {params.get('item1', project)} | {params.get('qty1', '1')} | {params.get('rate1', amount)} | {params.get('amount1', amount)} |\n"
                     f"| 2 | {params.get('item2', '[Additional service]')} | {params.get('qty2', '-')} | {params.get('rate2', '-')} | {params.get('amount2', '-')} |",
            ),
            ClawSection(
                title="Total",
                body="",
                fields=[
                    ClawField("Subtotal", params.get("subtotal", amount)),
                    ClawField("Tax", params.get("tax", "[0.00]")),
                    ClawField("Total Due", params.get("total", amount)),
                ],
            ),
            ClawSection(
                title="Payment Instructions",
                body=params.get("payment_instructions",
                    "Please remit payment via bank transfer to the account details provided separately. "
                    "Reference this invoice number in your payment description."),
            ),
        ],
    )


def _build_workflow(description: str, params: Dict[str, str]) -> ClawDocument:
    project = _extract_project_name(description)

    return ClawDocument(
        doc_type="Workflow Plan",
        title=f"Workflow Plan – {params.get('project', project)}",
        metadata={"Status": "Draft", "Automation Level": params.get("automation", "Semi-automated")},
        sections=[
            ClawSection(
                title="Workflow Overview",
                body=params.get("overview",
                    f"This workflow plan defines the stages, responsibilities, and checkpoints for "
                    f"{project}. It is designed to minimize manual handoffs and keep work flowing "
                    f"efficiently."),
            ),
            ClawSection(
                title="Stage 1 – Intake & Triage",
                body=params.get("stage1",
                    "New requests are captured and categorized. Each item receives a priority "
                    "label and is assigned to the appropriate owner."),
                fields=[
                    ClawField("Owner", params.get("s1_owner", "[Team / Person]")),
                    ClawField("SLA", params.get("s1_sla", "Triage within 4 hours")),
                    ClawField("Checkpoint", params.get("s1_check", "All items categorized and assigned")),
                ],
            ),
            ClawSection(
                title="Stage 2 – Execution",
                body=params.get("stage2",
                    "Assigned work items are picked up, worked on, and moved through the pipeline. "
                    "Daily standups and async updates keep the team aligned."),
                fields=[
                    ClawField("Owner", params.get("s2_owner", "[Team / Person]")),
                    ClawField("SLA", params.get("s2_sla", "Completion within agreed timeline")),
                    ClawField("Checkpoint", params.get("s2_check", "Work reviewed and approved by peer")),
                ],
            ),
            ClawSection(
                title="Stage 3 – Review & QA",
                body=params.get("stage3",
                    "Completed work undergoes quality review against acceptance criteria. "
                    "Feedback is logged and addressed before sign-off."),
                fields=[
                    ClawField("Owner", params.get("s3_owner", "[QA Lead / Reviewer]")),
                    ClawField("SLA", params.get("s3_sla", "Review within 2 business days")),
                    ClawField("Checkpoint", params.get("s3_check", "All acceptance criteria met")),
                ],
            ),
            ClawSection(
                title="Stage 4 – Delivery & Close",
                body=params.get("stage4",
                    "Approved work is delivered to the client or deployed. The workflow item is "
                    "closed and metrics are captured for continuous improvement."),
                fields=[
                    ClawField("Owner", params.get("s4_owner", "[Project Manager]")),
                    ClawField("SLA", params.get("s4_sla", "Delivery within 1 business day of approval")),
                    ClawField("Checkpoint", params.get("s4_check", "Client acknowledgement received")),
                ],
            ),
            ClawSection(
                title="Automation Opportunities",
                body=params.get("automation_notes",
                    "- Auto-assign based on category tags and team capacity.\n"
                    "- Trigger notifications on stage transitions.\n"
                    "- Auto-escalate items approaching SLA deadlines.\n"
                    "- Generate weekly summary reports from closed items."),
            ),
        ],
    )


def _build_proposal(description: str, params: Dict[str, str]) -> ClawDocument:
    provider, client = _extract_parties(description)
    project = _extract_project_name(description)
    amount = _extract_amount(description)

    return ClawDocument(
        doc_type="Project Proposal",
        title=f"Proposal – {params.get('project', project)}",
        metadata={"Status": "Draft", "Version": "1.0"},
        sections=[
            ClawSection(
                title="Executive Summary",
                body=params.get("summary",
                    f"We propose to deliver {project} for {client}. This proposal outlines our "
                    f"understanding of the challenge, our approach, the projected timeline, and "
                    f"investment required."),
                fields=[
                    ClawField("Prepared By", params.get("provider", provider)),
                    ClawField("Prepared For", params.get("client", client)),
                    ClawField("Date", params.get("date", _today())),
                ],
            ),
            ClawSection(
                title="Problem Statement",
                body=params.get("problem",
                    "[Describe the client's challenge or opportunity in 2-3 sentences. "
                    "Show understanding of their context and urgency.]"),
            ),
            ClawSection(
                title="Proposed Approach",
                body=params.get("approach",
                    "1. **Discovery** – Deep-dive into requirements and constraints.\n"
                    "2. **Design** – Create solution architecture and get stakeholder buy-in.\n"
                    "3. **Build** – Iterative development with weekly demos.\n"
                    "4. **Launch** – Staged rollout with monitoring and support."),
            ),
            ClawSection(
                title="Timeline",
                body="",
                fields=[
                    ClawField("Phase 1 – Discovery", params.get("p1", f"{_today()} to {_future(7)}")),
                    ClawField("Phase 2 – Design", params.get("p2", f"{_future(8)} to {_future(14)}")),
                    ClawField("Phase 3 – Build", params.get("p3", f"{_future(15)} to {_future(35)}")),
                    ClawField("Phase 4 – Launch", params.get("p4", f"{_future(36)} to {_future(42)}")),
                ],
            ),
            ClawSection(
                title="Investment",
                body="",
                fields=[
                    ClawField("Total Investment", params.get("amount", amount)),
                    ClawField("Payment Structure", params.get("payment", "30% on signing, 40% at midpoint, 30% on delivery")),
                ],
            ),
            ClawSection(
                title="Why Us",
                body=params.get("differentiators",
                    "- Proven track record with similar projects.\n"
                    "- Transparent communication and weekly progress reports.\n"
                    "- Fixed-scope pricing with a satisfaction guarantee."),
            ),
            ClawSection(
                title="Next Steps",
                body=params.get("next_steps",
                    "1. Review this proposal and share questions.\n"
                    "2. Schedule a 30-minute alignment call.\n"
                    "3. Sign the agreement and kick off discovery."),
            ),
        ],
    )


# ---------------------------------------------------------------------------
# Builder registry
# ---------------------------------------------------------------------------

_BUILDERS: Dict[str, Any] = {
    "contract": _build_contract,
    "sow": _build_sow,
    "brief": _build_brief,
    "nda": _build_nda,
    "invoice": _build_invoice,
    "workflow": _build_workflow,
    "proposal": _build_proposal,
}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def detect_doc_type(text: str) -> Optional[str]:
    """Detect the document type from free-form text.

    Prefers longer (more specific) alias matches to avoid false positives
    like "project" matching "brief" when "project proposal" was intended.
    """
    lowered = text.lower()
    # Sort aliases longest-first so "project proposal" beats "project"
    candidates = sorted(_ALIAS_MAP.items(), key=lambda kv: len(kv[0]), reverse=True)
    for alias, doc_type in candidates:
        if alias in lowered:
            return doc_type
    return None


def list_doc_types() -> List[Dict[str, str]]:
    """Return available document types with descriptions."""
    return [
        {"key": key, "label": info["label"], "description": info["description"]}
        for key, info in DOC_TYPES.items()
    ]


def generate(
    description: str,
    doc_type: Optional[str] = None,
    params: Optional[Dict[str, str]] = None,
) -> ClawDocument:
    """Generate a smart document from a description.

    Args:
        description: A free-form description of what you need.
        doc_type: Explicit document type key.  Auto-detected if omitted.
        params: Optional overrides for template fields.

    Returns:
        A fully formed ClawDocument ready to render or serialize.

    Raises:
        ValueError: When the document type cannot be determined.
    """
    if not description or not description.strip():
        raise ValueError("Please provide a description of the document you need.")

    resolved_type = doc_type or detect_doc_type(description)
    if not resolved_type or resolved_type not in _BUILDERS:
        available = ", ".join(DOC_TYPES.keys())
        raise ValueError(
            f"Could not determine document type from your description. "
            f"Available types: {available}. "
            f"Try including a keyword like 'contract', 'invoice', or 'workflow' in your description."
        )

    builder = _BUILDERS[resolved_type]
    return builder(description, params or {})
