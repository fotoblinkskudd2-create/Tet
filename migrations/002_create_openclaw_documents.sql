-- OpenClaw documents table for persisting generated smart documents.

CREATE TABLE IF NOT EXISTS openclaw_documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    doc_type    VARCHAR(64)  NOT NULL,
    title       VARCHAR(512) NOT NULL,
    description TEXT         NOT NULL DEFAULT '',
    content     JSONB        NOT NULL DEFAULT '{}'::jsonb,
    metadata    JSONB        NOT NULL DEFAULT '{}'::jsonb,
    status      VARCHAR(32)  NOT NULL DEFAULT 'draft',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_openclaw_documents_user_id
    ON openclaw_documents (user_id);

-- Index for filtering by document type
CREATE INDEX IF NOT EXISTS idx_openclaw_documents_doc_type
    ON openclaw_documents (doc_type);

-- Index for status filtering (draft, final, archived)
CREATE INDEX IF NOT EXISTS idx_openclaw_documents_status
    ON openclaw_documents (status);

-- Auto-update updated_at on row modification
CREATE OR REPLACE TRIGGER set_openclaw_documents_updated_at
    BEFORE UPDATE ON openclaw_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
