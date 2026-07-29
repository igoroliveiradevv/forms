
DROP POLICY IF EXISTS "Users can update persona avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete persona avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload persona avatars" ON storage.objects;

CREATE POLICY "Users can upload own persona avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'persona-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own persona avatars"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'persona-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'persona-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own persona avatars"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'persona-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
