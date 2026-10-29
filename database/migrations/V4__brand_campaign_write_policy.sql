-- Keep direct Supabase campaign writes restricted to registered brand accounts.
DROP POLICY IF EXISTS "Brands can insert campaigns" ON public.campaigns;
CREATE POLICY "Brands can insert campaigns"
ON public.campaigns
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = brand_id
  AND EXISTS (
    SELECT 1
    FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'BRAND'
  )
);
