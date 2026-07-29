-- Create storage bucket for persona avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('persona-avatars', 'persona-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view persona avatars (they're public)
CREATE POLICY "Anyone can view persona avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'persona-avatars');

-- Users can upload avatars for their own forms
CREATE POLICY "Users can upload persona avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'persona-avatars' 
  AND auth.uid() IS NOT NULL
);

-- Users can update their uploaded avatars
CREATE POLICY "Users can update persona avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'persona-avatars' 
  AND auth.uid() IS NOT NULL
);

-- Users can delete their uploaded avatars
CREATE POLICY "Users can delete persona avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'persona-avatars' 
  AND auth.uid() IS NOT NULL
);