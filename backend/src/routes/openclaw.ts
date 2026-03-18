import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClawField {
  label: string;
  value: string;
  required: boolean;
}

interface ClawSection {
  title: string;
  body: string;
  fields: ClawField[];
}

interface ClawDocument {
  id: string;
  docType: string;
  title: string;
  generatedOn: string;
  metadata: Record<string, string>;
  sections: ClawSection[];
}

interface DocTypeInfo {
  key: string;
  label: string;
  description: string;
  aliases: string[];
}

// ---------------------------------------------------------------------------
// Document type registry
// ---------------------------------------------------------------------------

const DOC_TYPES: Record<string, DocTypeInfo> = {
  contract: {
    key: 'contract',
    label: 'Freelance Contract',
    description: 'A professional service contract between a provider and client.',
    aliases: ['freelance', 'agreement', 'service agreement'],
  },
  sow: {
    key: 'sow',
    label: 'Statement of Work',
    description: 'A detailed scope document outlining deliverables, timelines, and acceptance criteria.',
    aliases: ['scope', 'statement', 'scope of work'],
  },
  brief: {
    key: 'brief',
    label: 'Project Brief',
    description: 'A concise project brief covering goals, stakeholders, and key milestones.',
    aliases: ['project', 'project plan', 'kickoff'],
  },
  nda: {
    key: 'nda',
    label: 'Non-Disclosure Agreement',
    description: 'A mutual or one-way confidentiality agreement to protect sensitive information.',
    aliases: ['confidentiality', 'confidential'],
  },
  invoice: {
    key: 'invoice',
    label: 'Invoice',
    description: 'A professional invoice for completed work with line items and payment terms.',
    aliases: ['bill', 'payment', 'billing'],
  },
  workflow: {
    key: 'workflow',
    label: 'Workflow Plan',
    description: 'A structured workflow plan with stages, owners, and checkpoints.',
    aliases: ['process', 'automation', 'pipeline', 'flow'],
  },
  proposal: {
    key: 'proposal',
    label: 'Project Proposal',
    description: 'A persuasive project proposal with problem statement, approach, timeline, and pricing.',
    aliases: ['pitch', 'bid', 'rfp response'],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function futureISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function detectDocType(text: string): string | null {
  const lowered = text.toLowerCase();
  for (const [key, info] of Object.entries(DOC_TYPES)) {
    if (lowered.includes(key) || lowered.includes(info.label.toLowerCase())) {
      return key;
    }
    for (const alias of info.aliases) {
      if (lowered.includes(alias)) {
        return key;
      }
    }
  }
  return null;
}

function extractProjectName(description: string): string {
  let cleaned = description.replace(/(?:generate|create|make|build|draft)\s+(?:a|an|the)?\s*/gi, '');
  cleaned = cleaned.replace(/\b(?:contract|sow|nda|invoice|brief|workflow|proposal)\b/gi, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim().replace(/\.$/, '');
  if (cleaned) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return '[Project Name]';
}

// ---------------------------------------------------------------------------
// Document builders
// ---------------------------------------------------------------------------

function buildContract(description: string, params: Record<string, string>): ClawDocument {
  const project = params.project || extractProjectName(description);
  return {
    id: uuid(),
    docType: 'Freelance Contract',
    title: `Service Agreement – ${project}`,
    generatedOn: todayISO(),
    metadata: { Status: 'Draft', Version: '1.0' },
    sections: [
      {
        title: 'Parties',
        body: 'This agreement is entered into between the following parties.',
        fields: [
          { label: 'Provider', value: params.provider || '[Your Name / Company]', required: true },
          { label: 'Client', value: params.client || '[Client Name]', required: true },
          { label: 'Effective Date', value: params.start_date || todayISO(), required: true },
        ],
      },
      {
        title: 'Scope of Services',
        body: params.scope || `Provider agrees to deliver professional services related to: ${project}.`,
        fields: [
          { label: 'Deliverables', value: params.deliverables || '[List key deliverables]', required: true },
          { label: 'Timeline', value: params.timeline || `${todayISO()} to ${futureISO(30)}`, required: true },
        ],
      },
      {
        title: 'Compensation',
        body: 'Client agrees to compensate Provider as follows.',
        fields: [
          { label: 'Total Amount', value: params.amount || '[Amount]', required: true },
          { label: 'Payment Schedule', value: params.payment_schedule || '50% upfront, 50% on completion', required: true },
          { label: 'Late Fee', value: params.late_fee || '1.5% per month on overdue balances', required: false },
        ],
      },
      {
        title: 'Intellectual Property',
        body: 'Upon full payment, all work product transfers to the Client. Provider retains portfolio rights.',
        fields: [],
      },
      {
        title: 'Termination',
        body: 'Either party may terminate with 14 days written notice. Client pays for completed work.',
        fields: [],
      },
    ],
  };
}

function buildWorkflow(description: string, params: Record<string, string>): ClawDocument {
  const project = params.project || extractProjectName(description);
  return {
    id: uuid(),
    docType: 'Workflow Plan',
    title: `Workflow Plan – ${project}`,
    generatedOn: todayISO(),
    metadata: { Status: 'Draft', 'Automation Level': params.automation || 'Semi-automated' },
    sections: [
      {
        title: 'Workflow Overview',
        body: `This workflow defines stages, responsibilities, and checkpoints for ${project}.`,
        fields: [],
      },
      {
        title: 'Stage 1 – Intake & Triage',
        body: 'New requests are captured, categorized, and assigned to the appropriate owner.',
        fields: [
          { label: 'Owner', value: params.s1_owner || '[Team / Person]', required: true },
          { label: 'SLA', value: params.s1_sla || 'Triage within 4 hours', required: true },
        ],
      },
      {
        title: 'Stage 2 – Execution',
        body: 'Work items are picked up and moved through the pipeline with daily updates.',
        fields: [
          { label: 'Owner', value: params.s2_owner || '[Team / Person]', required: true },
          { label: 'SLA', value: params.s2_sla || 'Completion within agreed timeline', required: true },
        ],
      },
      {
        title: 'Stage 3 – Review & QA',
        body: 'Completed work undergoes quality review against acceptance criteria.',
        fields: [
          { label: 'Owner', value: params.s3_owner || '[QA Lead]', required: true },
          { label: 'SLA', value: params.s3_sla || 'Review within 2 business days', required: true },
        ],
      },
      {
        title: 'Stage 4 – Delivery & Close',
        body: 'Approved work is delivered and the workflow item is closed.',
        fields: [
          { label: 'Owner', value: params.s4_owner || '[Project Manager]', required: true },
          { label: 'SLA', value: params.s4_sla || 'Delivery within 1 business day', required: true },
        ],
      },
    ],
  };
}

function buildInvoice(description: string, params: Record<string, string>): ClawDocument {
  const project = params.project || extractProjectName(description);
  return {
    id: uuid(),
    docType: 'Invoice',
    title: `Invoice – ${project}`,
    generatedOn: todayISO(),
    metadata: { Status: 'Unpaid', 'Invoice #': params.invoice_number || 'INV-001' },
    sections: [
      {
        title: 'From',
        body: '',
        fields: [
          { label: 'Provider', value: params.provider || '[Your Name / Company]', required: true },
          { label: 'Email', value: params.provider_email || '[your@email.com]', required: true },
        ],
      },
      {
        title: 'Bill To',
        body: '',
        fields: [
          { label: 'Client', value: params.client || '[Client Name]', required: true },
          { label: 'Email', value: params.client_email || '[client@email.com]', required: true },
        ],
      },
      {
        title: 'Invoice Details',
        body: '',
        fields: [
          { label: 'Invoice Date', value: params.invoice_date || todayISO(), required: true },
          { label: 'Due Date', value: params.due_date || futureISO(14), required: true },
          { label: 'Payment Terms', value: params.payment_terms || 'Net 14', required: true },
        ],
      },
      {
        title: 'Total',
        body: '',
        fields: [
          { label: 'Total Due', value: params.total || '[Amount]', required: true },
        ],
      },
    ],
  };
}

const BUILDERS: Record<string, (desc: string, params: Record<string, string>) => ClawDocument> = {
  contract: buildContract,
  workflow: buildWorkflow,
  invoice: buildInvoice,
  // Additional types return a generic template
};

function buildGenericDoc(docType: string, description: string, params: Record<string, string>): ClawDocument {
  const info = DOC_TYPES[docType];
  const project = params.project || extractProjectName(description);
  return {
    id: uuid(),
    docType: info?.label || docType,
    title: `${info?.label || docType} – ${project}`,
    generatedOn: todayISO(),
    metadata: { Status: 'Draft' },
    sections: [
      {
        title: 'Overview',
        body: `Generated ${info?.label || docType} for: ${project}`,
        fields: [
          { label: 'Project', value: project, required: true },
          { label: 'Date', value: todayISO(), required: true },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

const documents = new Map<string, ClawDocument>();

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const router = Router();

/** List available document types */
router.get('/types', (_req: Request, res: Response) => {
  const types = Object.values(DOC_TYPES).map(({ key, label, description }) => ({
    key,
    label,
    description,
  }));
  res.json(types);
});

/** Generate a new document */
router.post('/generate', (req: Request, res: Response) => {
  const { description, docType, params } = req.body || {};

  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'A description is required.' });
  }

  const resolvedType = docType || detectDocType(description);
  if (!resolvedType || !DOC_TYPES[resolvedType]) {
    return res.status(400).json({
      error: 'Could not determine document type. Include a keyword like "contract", "invoice", or "workflow".',
      availableTypes: Object.keys(DOC_TYPES),
    });
  }

  const builder = BUILDERS[resolvedType];
  const doc = builder
    ? builder(description, params || {})
    : buildGenericDoc(resolvedType, description, params || {});

  documents.set(doc.id, doc);
  res.status(201).json(doc);
});

/** Retrieve a generated document by ID */
router.get('/documents/:id', (req: Request, res: Response) => {
  const doc = documents.get(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json(doc);
});

/** List all generated documents */
router.get('/documents', (_req: Request, res: Response) => {
  const docs = [...documents.values()].map(({ id, docType, title, generatedOn }) => ({
    id,
    docType,
    title,
    generatedOn,
  }));
  res.json(docs);
});

export default router;
