
-- Create a storage bucket for course content
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-content', 'Course Content', true);

-- Set up bucket security policy
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'course-content');

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Authenticated users can upload" ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'course-content' AND auth.role() = 'authenticated'
  );

-- Allow users to update and delete their own objects
CREATE POLICY "Users can update their own objects" ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'course-content' AND auth.uid() = owner
  );

CREATE POLICY "Users can delete their own objects" ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'course-content' AND auth.uid() = owner
  );
