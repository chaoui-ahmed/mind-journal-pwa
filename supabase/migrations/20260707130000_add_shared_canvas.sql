CREATE TABLE shared_canvas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  drawing_data text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Active RLS
ALTER TABLE shared_canvas ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to insert drawings
CREATE POLICY "Users can create drawings" ON shared_canvas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to read drawings
CREATE POLICY "Users can view all drawings" ON shared_canvas
  FOR SELECT USING (auth.role() = 'authenticated');
