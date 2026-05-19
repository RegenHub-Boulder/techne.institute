-- ============================================================
-- CIS Phase 01 — Agent & Agreement
-- Target: gxyeobogqfubgzklmxwt (CIS / Intranet Supabase project)
-- PRD: §06 Information Model, §07 Identity & Access, §08 Core Modules (Phase 01)
-- CROPS targets: CR=02 O=03 P=02 S=02
-- Run via: Supabase Dashboard → SQL Editor
-- Author: Nou (Techne Studio)
-- Date: 2026-05-19
-- ============================================================

-- ── Enable extensions ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── AUDIT LOG (S=02 — structural from day one) ─────────────────
-- Every table mutation lands here before any interface renders it.
-- Enforces principle 09: "what happened, when, and why."
CREATE TABLE IF NOT EXISTS audit_log (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name    text        NOT NULL,
  record_id     uuid        NOT NULL,
  operation     text        NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  actor_id      uuid,                          -- NULL for system/unauthenticated
  actor_role    text,
  prior_value   jsonb,
  new_value     jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_log_table_record_idx ON audit_log(table_name, record_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_actor_idx ON audit_log(actor_id, created_at DESC);

-- ── AGENTS (REA primitive: Agent) ──────────────────────────────
-- §06: "natural and legal persons"
-- Privacy P=02: email and tax_identifier restricted at RLS level.
CREATE TABLE IF NOT EXISTS agents (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name     text        NOT NULL,
  legal_name       text,
  agent_type       text        NOT NULL DEFAULT 'person'
                               CHECK (agent_type IN ('person', 'organization', 'agent_system')),
  email            text        UNIQUE,           -- restricted: member + admin only (§18.1)
  tax_identifier   text,                         -- restricted: admin only; encrypted at rest
  ethereum_address text,                         -- public: supports ERC-8004 attestation
  avatar_url       text,
  bio              text,
  timezone         text        DEFAULT 'America/Denver',
  is_active        boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS agents_type_idx ON agents(agent_type, is_active);
CREATE INDEX IF NOT EXISTS agents_eth_idx ON agents(ethereum_address) WHERE ethereum_address IS NOT NULL;

-- ── MEMBERSHIPS (REA: Agent + Agreement) ───────────────────────
-- §1.1–1.4: membership classes, good standing, state machine.
-- State machine: applicant → active → (suspended | withdrawn | terminated)
CREATE TABLE IF NOT EXISTS memberships (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         uuid        NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  membership_class text        NOT NULL CHECK (membership_class IN ('patron', 'investor')),
  status           text        NOT NULL DEFAULT 'applicant'
                               CHECK (status IN (
                                 'applicant',      -- §1.4: application received
                                 'active',         -- §1.4: admitted, stock purchased, agreements signed
                                 'suspended',      -- §1.10.1: rights suspended, clock running
                                 'withdrawn',      -- §1.9: fourteen-day notice, voluntary exit
                                 'terminated'      -- §1.10.2: board finding, three-quarters vote
                               )),
  effective_date   date        NOT NULL DEFAULT CURRENT_DATE,
  bylaw_ref        text        DEFAULT '§1.1',
  notes            text,
  -- Suspension tracking (S=02: clock enforced at data layer, not interface)
  suspended_at     timestamptz,
  suspension_reason text,
  -- Withdrawal / termination
  exit_date        date,
  exit_type        text        CHECK (exit_type IN ('withdrawal', 'termination')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(agent_id)  -- one membership record per agent (class changes tracked via audit_log)
);
CREATE INDEX IF NOT EXISTS memberships_status_idx ON memberships(status, effective_date);
CREATE INDEX IF NOT EXISTS memberships_class_idx ON memberships(membership_class, status);

-- ── STOCK LEDGER (REA: Resource) ───────────────────────────────
-- §1.13: Patron Stock and Preferred Stock.
-- Conservation law: one Patron share per Patron Member (enforced below).
CREATE TABLE IF NOT EXISTS stock_ledger (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         uuid        NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  stock_class      text        NOT NULL CHECK (stock_class IN ('patron', 'preferred')),
  shares           integer     NOT NULL DEFAULT 1 CHECK (shares > 0),
  par_value        numeric(10,2) NOT NULL DEFAULT 100.00,
  issue_date       date        NOT NULL DEFAULT CURRENT_DATE,
  certificate_ref  text        UNIQUE,          -- e.g. "PS-0001"
  bylaw_ref        text        DEFAULT '§1.13',
  -- Redemption / transfer back
  redeemed_at      date,
  redemption_price numeric(10,2),
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
-- Conservation: one Patron share per member (§1.13: "one share per Patron Member")
CREATE UNIQUE INDEX IF NOT EXISTS stock_ledger_one_patron_per_agent
  ON stock_ledger(agent_id)
  WHERE stock_class = 'patron' AND redeemed_at IS NULL;

CREATE INDEX IF NOT EXISTS stock_ledger_agent_idx ON stock_ledger(agent_id, stock_class);

-- ── AGREEMENTS (REA: Agreement) ────────────────────────────────
-- §1.2.8, §1.3.4, §XVI: bylaws, policies, membership agreements, contracts.
-- O=03 target: bylaws and governing documents are public artifacts.
CREATE TABLE IF NOT EXISTS agreements (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text        NOT NULL,
  agreement_type   text        NOT NULL CHECK (agreement_type IN (
                                 'bylaws',             -- Articles + Bylaws
                                 'articles',           -- Articles of Organization
                                 'policy',             -- Board-adopted policy
                                 'membership_agreement',-- §1.2.8 / §1.3.4 member MA
                                 'service_contract',   -- external service agreement
                                 'grant_agreement',    -- EE grant and sibling grants
                                 'hub_membership',     -- Hub Membership Agreement
                                 'investor_document',  -- preferred stock / investor docs
                                 'mou',                -- memorandum of understanding
                                 'other'
                               )),
  version          text,                          -- semver or date-based, e.g. "v1.0" or "2026-02-06"
  effective_date   date,
  expiry_date      date,
  bylaw_ref        text,                          -- e.g. "§1.2.8"
  is_public        boolean     NOT NULL DEFAULT false,   -- O=03: governs member-accessible vs. admin-only
  canonical_url    text,                          -- link to authoritative document
  storage_path     text,                          -- internal storage path if hosted
  description      text,
  status           text        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('draft', 'active', 'superseded', 'archived')),
  superseded_by    uuid        REFERENCES agreements(id),
  -- For member-specific agreements, link to the relevant agent
  agent_id         uuid        REFERENCES agents(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS agreements_type_status_idx ON agreements(agreement_type, status, effective_date DESC);
CREATE INDEX IF NOT EXISTS agreements_public_idx ON agreements(is_public, agreement_type) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS agreements_agent_idx ON agreements(agent_id) WHERE agent_id IS NOT NULL;

-- ── SIGNATURES (REA: Event) ────────────────────────────────────
-- §1.4: agreement signature events. Immutable once recorded.
CREATE TABLE IF NOT EXISTS signatures (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id     uuid        NOT NULL REFERENCES agreements(id) ON DELETE RESTRICT,
  agent_id         uuid        NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  signed_at        timestamptz NOT NULL DEFAULT now(),
  signature_method text        NOT NULL DEFAULT 'docusign'
                               CHECK (signature_method IN (
                                 'docusign', 'hellosign', 'wet_ink', 'email_consent',
                                 'on_chain', 'other'
                               )),
  signature_ref    text,       -- external envelope/document ID
  ip_address       inet,       -- privacy: admin-only, not exposed to members
  bylaw_ref        text        DEFAULT '§1.4',
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  -- Signatures are immutable. No UPDATE or DELETE.
  UNIQUE(agreement_id, agent_id)  -- one signature per agent per agreement version
);
CREATE INDEX IF NOT EXISTS signatures_agent_idx ON signatures(agent_id, signed_at DESC);
CREATE INDEX IF NOT EXISTS signatures_agreement_idx ON signatures(agreement_id, signed_at DESC);

-- ── AUDIT TRIGGERS ─────────────────────────────────────────────
-- S=02: every state change is an event row with actor, timestamp, prior value.
CREATE OR REPLACE FUNCTION cis_audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log(table_name, record_id, operation, prior_value, new_value)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_agents') THEN
    CREATE TRIGGER audit_agents AFTER INSERT OR UPDATE OR DELETE ON agents
      FOR EACH ROW EXECUTE FUNCTION cis_audit_trigger_fn();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_memberships') THEN
    CREATE TRIGGER audit_memberships AFTER INSERT OR UPDATE OR DELETE ON memberships
      FOR EACH ROW EXECUTE FUNCTION cis_audit_trigger_fn();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_stock_ledger') THEN
    CREATE TRIGGER audit_stock_ledger AFTER INSERT OR UPDATE OR DELETE ON stock_ledger
      FOR EACH ROW EXECUTE FUNCTION cis_audit_trigger_fn();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_agreements') THEN
    CREATE TRIGGER audit_agreements AFTER INSERT OR UPDATE OR DELETE ON agreements
      FOR EACH ROW EXECUTE FUNCTION cis_audit_trigger_fn();
  END IF;
  -- Signatures do not get an UPDATE/DELETE trigger; they are immutable by design.
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_signatures') THEN
    CREATE TRIGGER audit_signatures AFTER INSERT ON signatures
      FOR EACH ROW EXECUTE FUNCTION cis_audit_trigger_fn();
  END IF;
END $$;

-- ── UPDATED_AT TRIGGER ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION cis_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_agents') THEN
    CREATE TRIGGER set_updated_agents BEFORE UPDATE ON agents
      FOR EACH ROW EXECUTE FUNCTION cis_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_memberships') THEN
    CREATE TRIGGER set_updated_memberships BEFORE UPDATE ON memberships
      FOR EACH ROW EXECUTE FUNCTION cis_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_stock_ledger') THEN
    CREATE TRIGGER set_updated_stock_ledger BEFORE UPDATE ON stock_ledger
      FOR EACH ROW EXECUTE FUNCTION cis_set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_agreements') THEN
    CREATE TRIGGER set_updated_agreements BEFORE UPDATE ON agreements
      FOR EACH ROW EXECUTE FUNCTION cis_set_updated_at();
  END IF;
END $$;

-- ── ROW-LEVEL SECURITY (P=02) ──────────────────────────────────
-- Privacy is a property of the record, not the screen. (Principle 06)
-- Phase 01: RLS enabled; anon role gets read access to public-safe columns.
-- Sensitive columns (email, tax_identifier, ip_address) are hidden by column grants.

ALTER TABLE agents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships     ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger    ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log       ENABLE ROW LEVEL SECURITY;

-- Agents: anon can see display_name, agent_type, ethereum_address, is_active.
-- Email and tax_identifier handled by column grants (not exposed to anon).
CREATE POLICY IF NOT EXISTS "agents_anon_read" ON agents
  FOR SELECT TO anon
  USING (is_active = true);

-- Memberships: anon can see membership_class and status (aggregate governance view).
-- §18.1: membership list is available to members on request.
CREATE POLICY IF NOT EXISTS "memberships_anon_read" ON memberships
  FOR SELECT TO anon
  USING (status = 'active');

-- Stock ledger: anon can see share class counts (aggregate only).
CREATE POLICY IF NOT EXISTS "stock_ledger_anon_read" ON stock_ledger
  FOR SELECT TO anon
  USING (redeemed_at IS NULL);

-- Agreements: anon can see is_public agreements (bylaws, articles, policies).
-- Member agreements are hidden from anon.
CREATE POLICY IF NOT EXISTS "agreements_anon_public_read" ON agreements
  FOR SELECT TO anon
  USING (is_public = true AND status = 'active');

-- Signatures: not visible to anon.
-- (Phase 01: no anon policy. Members see their own via authenticated role in Phase 02.)

-- Audit log: not visible to anon. Admin only.

-- ── DERIVED VIEWS ──────────────────────────────────────────────
-- Pure functions of the event log. Consistent, auditable, defensible.

-- active_members: the member register for governance use (§2.9, §2.7)
CREATE OR REPLACE VIEW active_members AS
SELECT
  a.id,
  a.display_name,
  a.legal_name,
  a.ethereum_address,
  a.avatar_url,
  m.membership_class,
  m.status,
  m.effective_date AS member_since,
  sl.certificate_ref AS stock_certificate,
  sl.shares,
  sl.par_value,
  sl.issue_date AS stock_issue_date
FROM agents a
JOIN memberships m ON m.agent_id = a.id
LEFT JOIN stock_ledger sl ON sl.agent_id = a.id AND sl.stock_class = 'patron' AND sl.redeemed_at IS NULL
WHERE a.is_active = true AND m.status = 'active';

-- governing_documents: public-facing agreement registry
CREATE OR REPLACE VIEW governing_documents AS
SELECT
  id,
  title,
  agreement_type,
  version,
  effective_date,
  expiry_date,
  bylaw_ref,
  canonical_url,
  description,
  status,
  superseded_by
FROM agreements
WHERE is_public = true AND status IN ('active', 'superseded')
ORDER BY agreement_type, effective_date DESC;

-- ── EXPORT PATHS (CR=02 — documented chokepoint) ───────────────
-- Every table has an export path. Run these as postgres role to export.
--
-- COPY (SELECT * FROM agents)      TO '/tmp/agents_export.csv'      CSV HEADER;
-- COPY (SELECT * FROM memberships) TO '/tmp/memberships_export.csv' CSV HEADER;
-- COPY (SELECT * FROM stock_ledger)TO '/tmp/stock_ledger_export.csv'CSV HEADER;
-- COPY (SELECT * FROM agreements)  TO '/tmp/agreements_export.csv'  CSV HEADER;
-- COPY (SELECT * FROM signatures)  TO '/tmp/signatures_export.csv'  CSV HEADER;
-- COPY (SELECT * FROM audit_log)   TO '/tmp/audit_log_export.csv'   CSV HEADER;
--
-- Supabase table editor also supports CSV/JSON export per table.
-- Backup should survive loss of any single vendor. (CR pathway Phase 01)

-- ── SEED: FOUNDING AGREEMENTS (O=03 — governing docs are public) ─
-- Insert known governing documents. canonical_url will be updated when docs are hosted.
INSERT INTO agreements (title, agreement_type, version, effective_date, bylaw_ref, is_public, description, status)
VALUES
  ('Articles of Organization — RegenHub, LCA',
   'articles', '2026-02-06', '2026-02-06', '§I', true,
   'Colorado public benefit LCA filing. Filed February 6, 2026. Colorado Secretary of State.', 'active'),
  ('Bylaws — RegenHub, LCA',
   'bylaws', 'v1.0', '2026-04-23', '§I–§XVII', true,
   'Governing bylaws adopted by organizer consent, April 23, 2026. Nineteen articles. Subchapter K election. Colorado LCA.', 'active'),
  ('Ethereum Everywhere Grant Agreement',
   'grant_agreement', '2026', '2026-05-22', NULL, false,
   'EE grant covering Hub Operations Phase 01 at the Boulder Ethereum Community Hub. RegenHub, LCA as grantee.', 'active')
ON CONFLICT DO NOTHING;

-- ── COMPLETION ─────────────────────────────────────────────────
-- Schema delivers:
--   agents          — REA Agent primitive, §06
--   memberships     — lifecycle state machine, §1.4/§1.9/§1.10
--   stock_ledger    — §1.13, conservation enforced at schema
--   agreements      — §XVI, versioned, public/private split
--   signatures      — §1.4 events, immutable
--   audit_log       — S=02, structural from day one
--   audit triggers  — every table mutation recorded
--   RLS policies    — P=02, anon sees only what bylaws permit
--   active_members  — derived view, pure function of event log
--   governing_documents — public-facing agreement registry
--   Export paths    — documented, CR=02
--   Seed data       — founding agreements seeded for O=03 target
