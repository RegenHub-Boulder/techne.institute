-- P367: Capital Book Schema Migration
-- R2-B — Capital Book Backend
-- Applied: 2026-04-08 on hvbdpgkdcdskhpbdeeim

-- Add membership_class to participants (1=Labor, 2=Patron, 3=Community, 4=Investor)
ALTER TABLE participants ADD COLUMN IF NOT EXISTS membership_class integer
  CHECK (membership_class IN (1, 2, 3, 4));

-- capital_accounts: one row per participant, current balances
CREATE TABLE IF NOT EXISTS capital_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  book_balance numeric(14, 4) NOT NULL DEFAULT 0,
  tax_balance numeric(14, 4) NOT NULL DEFAULT 0,
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(participant_id)
);

ALTER TABLE capital_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY capital_accounts_member_select ON capital_accounts
  FOR SELECT TO authenticated
  USING (
    participant_id = (
      SELECT id FROM participants WHERE auth_user_id = auth.uid() LIMIT 1
    )
  );

CREATE POLICY capital_accounts_steward_select ON capital_accounts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE auth_user_id = auth.uid() AND participant_type = 'steward'
    )
  );

CREATE POLICY capital_accounts_service_all ON capital_accounts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- allocation_events: quarterly allocations per participant
CREATE TABLE IF NOT EXISTS allocation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('allocation', 'distribution', 'adjustment', 'correction')),
  quarter text NOT NULL, -- format: 2026-Q1
  components jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- components: { labor: numeric, revenue: numeric, capital: numeric, community: numeric }
  total_allocation numeric(14, 4) NOT NULL DEFAULT 0,
  book_capital_balance numeric(14, 4) NOT NULL DEFAULT 0,  -- running balance after this event
  tax_capital_balance numeric(14, 4) NOT NULL DEFAULT 0,   -- IRC 704(b) running balance
  qualified_vs_nonqualified jsonb,
  -- { qualified: numeric, nonqualified: numeric }
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE allocation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY allocation_events_member_select ON allocation_events
  FOR SELECT TO authenticated
  USING (
    participant_id = (
      SELECT id FROM participants WHERE auth_user_id = auth.uid() LIMIT 1
    )
  );

CREATE POLICY allocation_events_steward_select ON allocation_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE auth_user_id = auth.uid() AND participant_type = 'steward'
    )
  );

CREATE POLICY allocation_events_service_all ON allocation_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- distribution_history: cash and retained earnings distributions
CREATE TABLE IF NOT EXISTS distribution_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  distribution_date date NOT NULL,
  amount numeric(14, 4) NOT NULL,
  distribution_type text NOT NULL CHECK (distribution_type IN ('cash', 'retained')),
  quarter text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE distribution_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY distribution_history_member_select ON distribution_history
  FOR SELECT TO authenticated
  USING (
    participant_id = (
      SELECT id FROM participants WHERE auth_user_id = auth.uid() LIMIT 1
    )
  );

CREATE POLICY distribution_history_steward_select ON distribution_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE auth_user_id = auth.uid() AND participant_type = 'steward'
    )
  );

CREATE POLICY distribution_history_service_all ON distribution_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_allocation_events_participant ON allocation_events(participant_id);
CREATE INDEX IF NOT EXISTS idx_allocation_events_quarter ON allocation_events(quarter);
CREATE INDEX IF NOT EXISTS idx_distribution_history_participant ON distribution_history(participant_id);
