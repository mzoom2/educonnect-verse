
-- Function to increment the view count of a course
CREATE OR REPLACE FUNCTION increment_view_count(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE courses 
  SET view_count = view_count + 1
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql;
