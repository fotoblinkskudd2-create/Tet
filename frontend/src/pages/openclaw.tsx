import { useState } from 'react';

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

interface DocType {
  key: string;
  label: string;
  description: string;
}

const DOC_TYPES: DocType[] = [
  { key: 'contract', label: 'Freelance Contract', description: 'Professional service contract' },
  { key: 'sow', label: 'Statement of Work', description: 'Scope, deliverables, and timelines' },
  { key: 'brief', label: 'Project Brief', description: 'Goals, stakeholders, and milestones' },
  { key: 'nda', label: 'Non-Disclosure Agreement', description: 'Confidentiality protection' },
  { key: 'invoice', label: 'Invoice', description: 'Billing for completed work' },
  { key: 'workflow', label: 'Workflow Plan', description: 'Stages, owners, and checkpoints' },
  { key: 'proposal', label: 'Project Proposal', description: 'Problem, approach, and pricing' },
];

function SectionView({ section }: { section: ClawSection }) {
  return (
    <div className="claw-section">
      <h3>{section.title}</h3>
      {section.body && <p className="section-body">{section.body}</p>}
      {section.fields.length > 0 && (
        <div className="section-fields">
          {section.fields.map((field, i) => (
            <div key={i} className="field-row">
              <span className="field-label">
                {field.required ? '*' : ' '} {field.label}:
              </span>
              <span className="field-value">{field.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentView({ document }: { document: ClawDocument }) {
  return (
    <div className="claw-document">
      <div className="doc-header">
        <h2>{document.title}</h2>
        <div className="doc-meta">
          <span>Type: {document.docType}</span>
          <span>Generated: {document.generatedOn}</span>
          {Object.entries(document.metadata).map(([key, value]) => (
            <span key={key}>{key}: {value}</span>
          ))}
        </div>
      </div>
      <div className="doc-body">
        {document.sections.map((section, i) => (
          <SectionView key={i} section={section} />
        ))}
      </div>
    </div>
  );
}

export default function OpenClawPage() {
  const [description, setDescription] = useState('');
  const [docType, setDocType] = useState('auto');
  const [document, setDocument] = useState<ClawDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe the document you need.');
      return;
    }

    setLoading(true);
    setError(null);
    setDocument(null);

    try {
      const response = await fetch('/api/openclaw/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          docType: docType === 'auto' ? undefined : docType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate document');
      }

      const doc = (await response.json()) as ClawDocument;
      setDocument(doc);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="openclaw-page">
      <header className="page-header">
        <h1>OpenClaw Generator</h1>
        <p>Smart document generation for professional work</p>
      </header>

      <section className="generator-form">
        <div className="form-group">
          <label htmlFor="doc-type">Document Type</label>
          <select
            id="doc-type"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            <option value="auto">Auto-detect from description</option>
            {DOC_TYPES.map((dt) => (
              <option key={dt.key} value={dt.key}>
                {dt.label} – {dt.description}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Describe what you need</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 'Create a freelance contract for web development with Acme Corp for $5,000'"
            rows={4}
          />
        </div>

        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Document'}
        </button>
      </section>

      {error && <p className="error">{error}</p>}

      {document && <DocumentView document={document} />}

      <section className="doc-types-grid">
        <h2>Available Document Types</h2>
        <div className="types-grid">
          {DOC_TYPES.map((dt) => (
            <div
              key={dt.key}
              className="type-card"
              onClick={() => setDocType(dt.key)}
            >
              <h3>{dt.label}</h3>
              <p>{dt.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
