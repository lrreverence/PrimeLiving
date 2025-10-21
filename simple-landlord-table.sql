-- Simple landlord table creation
-- Run this in your Supabase SQL Editor if you just need a basic landlord table

-- Create landlords table
CREATE TABLE IF NOT EXISTS public.landlords (
  landlord_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contact_number VARCHAR(20),
  company_name VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_landlords_user_id ON public.landlords(user_id);

-- Enable Row Level Security
ALTER TABLE public.landlords ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for landlords
CREATE POLICY "Landlords can view their own data" 
ON public.landlords FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Landlords can update their own data" 
ON public.landlords FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Allow landlord creation" 
ON public.landlords FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Sample landlord data (optional)
INSERT INTO public.landlords (first_name, last_name, email, contact_number, company_name) VALUES
('John', 'Smith', 'john.smith@primeliving.com', '+63917123456', 'Prime Living Properties'),
('Maria', 'Garcia', 'maria.garcia@primeliving.com', '+63917654321', 'Prime Living Properties')
ON CONFLICT (email) DO NOTHING;