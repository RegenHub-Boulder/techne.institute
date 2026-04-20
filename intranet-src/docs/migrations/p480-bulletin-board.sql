-- P480: Intranet Bulletin Board
-- Target: hvbdpgkdcdskhpbdeeim (Techne Supabase project)
-- Run via: Supabase Dashboard → SQL Editor
-- Dependencies: participants table must exist

-- ============================================================
-- BULLETIN POSTS
-- ============================================================

CREATE TABLE IF NOT EXISTS bulletin_posts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  body         text,
  url          text,                          -- optional external link (Google Doc, etc.)
  post_type    text        NOT NULL DEFAULT 'announcement'
                           CHECK (post_type IN ('announcement', 'decision', 'document', 'event')),
  author_id    uuid        REFERENCES participants(id) ON DELETE SET NULL,
  is_pinned    boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bulletin_posts_created_idx  ON bulletin_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS bulletin_posts_pinned_idx   ON bulletin_posts(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS bulletin_posts_author_idx   ON bulletin_posts(author_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_bulletin_posts_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bulletin_posts_updated_at_trigger ON bulletin_posts;
CREATE TRIGGER bulletin_posts_updated_at_trigger
  BEFORE UPDATE ON bulletin_posts
  FOR EACH ROW EXECUTE FUNCTION update_bulletin_posts_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE bulletin_posts ENABLE ROW LEVEL SECURITY;

-- All authenticated members can read
CREATE POLICY "members_read_bulletin_posts"
  ON bulletin_posts FOR SELECT
  TO authenticated
  USING (true);

-- Only stewards (participant_type = 'steward') can insert
CREATE POLICY "stewards_insert_bulletin_posts"
  ON bulletin_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.auth_user_id = auth.uid()
        AND p.participant_type = 'steward'
    )
  );

-- Only stewards can update (pin/unpin, edit)
CREATE POLICY "stewards_update_bulletin_posts"
  ON bulletin_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.auth_user_id = auth.uid()
        AND p.participant_type = 'steward'
    )
  );

-- Only stewards can delete
CREATE POLICY "stewards_delete_bulletin_posts"
  ON bulletin_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants p
      WHERE p.auth_user_id = auth.uid()
        AND p.participant_type = 'steward'
    )
  );
