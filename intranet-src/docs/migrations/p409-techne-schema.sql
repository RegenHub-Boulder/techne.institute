-- P409: Techne Institute Schema — Treasury, Projects, Capital, Labor
-- Target: hvbdpgkdcdskhpbdeeim (Workshop / co-op.us Supabase project)
-- Run via: Supabase Dashboard → SQL Editor
-- Dependencies: participants table must exist (from P366/P367)

-- ============================================================
-- TREASURY
-- ============================================================

CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('checking', 'savings', 'money_market', 'credit')),
  balance numeric(12, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  external_provider text,           -- 'mercury', 'stripe', etc.
  external_account_id text,         -- provider-specific account ID for API sync
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid REFERENCES bank_accounts(id) ON DELETE CASCADE,
  date date NOT NULL,
  description text NOT NULL,
  amount numeric(12, 2) NOT NULL,    -- positive = credit, negative = debit
  category text NOT NULL CHECK (category IN ('income', 'expense', 'capital_call', 'distribution', 'transfer', 'other')),
  project_id uuid,                   -- optional link to project
  external_id text UNIQUE,           -- provider transaction ID for deduplication
  external_provider text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS transactions_external_id_idx ON transactions(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_bank_account_idx ON transactions(bank_account_id);

-- ============================================================
-- PROJECTS & VENTURES
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'project' CHECK (type IN ('project', 'venture')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  created_by uuid REFERENCES participants(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'contributor',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, participant_id)
);

CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CAPITAL ACCOUNTS
-- ============================================================

CREATE TABLE IF NOT EXISTS capital_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  membership_class int NOT NULL DEFAULT 1 CHECK (membership_class BETWEEN 1 AND 4),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(participant_id)
);

CREATE TABLE IF NOT EXISTS capital_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capital_account_id uuid NOT NULL REFERENCES capital_accounts(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (
    transaction_type IN ('initial', 'labor', 'capital', 'patronage', 'draw', 'adjustment')
  ),
  amount numeric(12, 2) NOT NULL,
  description text,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS capital_transactions_account_idx ON capital_transactions(capital_account_id);
CREATE INDEX IF NOT EXISTS capital_transactions_date_idx ON capital_transactions(effective_date DESC);

-- ============================================================
-- LABOR CONTRIBUTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS fmv_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  labor_type text NOT NULL UNIQUE,   -- 'governance', 'operations', 'project_work', 'community'
  hourly_rate numeric(8, 2) NOT NULL,
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text
);

CREATE TABLE IF NOT EXISTS labor_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id),
  date date NOT NULL,
  hours numeric(6, 2) NOT NULL CHECK (hours > 0),
  labor_type text NOT NULL CHECK (labor_type IN ('governance', 'operations', 'project_work', 'community')),
  hourly_rate numeric(8, 2) NOT NULL,
  fmv_total numeric(10, 2) GENERATED ALWAYS AS (hours * hourly_rate) STORED,
  description text,
  approved_by uuid REFERENCES participants(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS labor_participant_idx ON labor_contributions(participant_id);
CREATE INDEX IF NOT EXISTS labor_date_idx ON labor_contributions(date DESC);

-- ============================================================
-- SEED: FMV RATES (initial values)
-- ============================================================

INSERT INTO fmv_rates (labor_type, hourly_rate, notes) VALUES
  ('governance',    75.00, 'Board meetings, governance, legal, compliance'),
  ('operations',    65.00, 'Day-to-day operations, admin, finance'),
  ('project_work',  85.00, 'Client and product work, design, engineering'),
  ('community',     50.00, 'Events, outreach, community building')
ON CONFLICT (labor_type) DO NOTHING;

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fmv_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_contributions ENABLE ROW LEVEL SECURITY;

-- Helper: get participant id for current auth user
CREATE OR REPLACE FUNCTION current_participant_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT id FROM participants WHERE auth_user_id = auth.uid() LIMIT 1
$$;

-- Helper: check if current user is a steward
CREATE OR REPLACE FUNCTION is_steward()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM participants
    WHERE auth_user_id = auth.uid() AND participant_type = 'steward'
  )
$$;

-- Treasury: stewards only
CREATE POLICY "stewards_read_bank_accounts" ON bank_accounts
  FOR SELECT USING (is_steward());
CREATE POLICY "stewards_write_bank_accounts" ON bank_accounts
  FOR ALL USING (is_steward());

CREATE POLICY "stewards_read_transactions" ON transactions
  FOR SELECT USING (is_steward());
CREATE POLICY "stewards_write_transactions" ON transactions
  FOR ALL USING (is_steward());

-- Projects: all members read, stewards write
CREATE POLICY "members_read_projects" ON projects
  FOR SELECT USING (current_participant_id() IS NOT NULL);
CREATE POLICY "stewards_write_projects" ON projects
  FOR ALL USING (is_steward());

CREATE POLICY "members_read_project_participants" ON project_participants
  FOR SELECT USING (current_participant_id() IS NOT NULL);
CREATE POLICY "stewards_write_project_participants" ON project_participants
  FOR ALL USING (is_steward());

CREATE POLICY "members_read_milestones" ON project_milestones
  FOR SELECT USING (current_participant_id() IS NOT NULL);
CREATE POLICY "stewards_write_milestones" ON project_milestones
  FOR ALL USING (is_steward());

-- Capital: members see own, stewards see all
CREATE POLICY "members_read_own_capital" ON capital_accounts
  FOR SELECT USING (participant_id = current_participant_id() OR is_steward());
CREATE POLICY "stewards_write_capital" ON capital_accounts
  FOR ALL USING (is_steward());

CREATE POLICY "members_read_own_capital_txns" ON capital_transactions
  FOR SELECT USING (
    capital_account_id IN (
      SELECT id FROM capital_accounts WHERE participant_id = current_participant_id()
    ) OR is_steward()
  );
CREATE POLICY "stewards_write_capital_txns" ON capital_transactions
  FOR ALL USING (is_steward());

-- Labor: members read own + insert own, stewards read all
CREATE POLICY "members_read_own_labor" ON labor_contributions
  FOR SELECT USING (participant_id = current_participant_id() OR is_steward());
CREATE POLICY "members_insert_own_labor" ON labor_contributions
  FOR INSERT WITH CHECK (participant_id = current_participant_id());
CREATE POLICY "stewards_all_labor" ON labor_contributions
  FOR ALL USING (is_steward());

-- FMV rates: all authenticated members read
CREATE POLICY "members_read_fmv_rates" ON fmv_rates
  FOR SELECT USING (current_participant_id() IS NOT NULL);
CREATE POLICY "stewards_write_fmv_rates" ON fmv_rates
  FOR ALL USING (is_steward());
