-- Realtime for campaigns/messages, tighter RLS, no storage.objects DDL.
-- storage.objects is owned by Supabase, not the SQL editor role (42501).
-- Run this in the SQL editor after V1/V2.

-- Fail visibly if Realtime is off; skip ADD TABLE when already a member.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE EXCEPTION 'Publication supabase_realtime is missing. Enable Database replication in Supabase Dashboard → Database → Replication.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'campaigns'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- Primary key identity is enough for DELETE old.id; skip REPLICA IDENTITY FULL.

GRANT SELECT, INSERT, UPDATE ON TABLE public.campaigns TO authenticated;
GRANT SELECT ON TABLE public.messages TO authenticated;

-- Campaigns: public list is published rows only; owners still see their own drafts/removed.
DROP POLICY IF EXISTS "Public can view active campaigns" ON public.campaigns;
CREATE POLICY "Public can view active campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (
  status IN ('ACTIVE', 'open')
  OR brand_id = auth.uid()
);

-- Profiles are marketplace-visible to signed-in users, not anon.
DROP POLICY IF EXISTS "Public users can view profiles" ON public.users;
CREATE POLICY "Authenticated can view profiles"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Stop clients from changing users.role (app auth uses this column).
CREATE OR REPLACE FUNCTION public.prevent_users_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND COALESCE(auth.role(), '') <> 'service_role' THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_users_role_escalation ON public.users;
CREATE TRIGGER trg_prevent_users_role_escalation
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.prevent_users_role_escalation();
