-- Migration: Add branch column to existing landlords table
-- Run this in your Supabase SQL Editor if you already have a landlords table

-- Add branch column to landlords table
ALTER TABLE public.landlords 
ADD COLUMN IF NOT EXISTS branch VARCHAR(50);

-- Update existing landlords with default branch (optional)
-- UPDATE public.landlords 
-- SET branch = 'sampaloc-manila' 
-- WHERE branch IS NULL;

-- Create index for branch column
CREATE INDEX IF NOT EXISTS idx_landlords_branch ON public.landlords(branch);

-- Add RLS policy for branch-based access (optional)
CREATE POLICY "Landlords can view same branch data" 
ON public.landlords FOR SELECT 
TO authenticated 
USING (
  branch IN (
    SELECT branch FROM public.landlords 
    WHERE user_id = auth.uid()
  )
);

-- Sample data update with branches
INSERT INTO public.landlords (first_name, last_name, email, contact_number, company_name, branch) VALUES
('John', 'Smith', 'john.smith@primeliving.com', '+63917123456', 'Prime Living Properties', 'sampaloc-manila'),
('Maria', 'Garcia', 'maria.garcia@primeliving.com', '+63917654321', 'Prime Living Properties', 'cainta-rizal'),
('Carlos', 'Santos', 'carlos.santos@primeliving.com', '+63917987654', 'Prime Living Properties', 'cubao-qc')
ON CONFLICT (email) DO NOTHING;