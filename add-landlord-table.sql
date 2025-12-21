-- Migration: Add landlord table and related functionality
-- Run this in your Supabase SQL Editor

-- Create landlords table
CREATE TABLE IF NOT EXISTS public.landlords (
  landlord_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contact_number VARCHAR(20),
  company_name VARCHAR(200),
  branch VARCHAR(50),
  address TEXT,
  tax_id VARCHAR(50),
  bank_account VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add landlord_id to units table (optional - for multi-landlord support)
ALTER TABLE public.units 
ADD COLUMN IF NOT EXISTS landlord_id INTEGER REFERENCES public.landlords(landlord_id) ON DELETE SET NULL;

-- Add landlord_id to contracts table (optional - for tracking which landlord owns the contract)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS landlord_id INTEGER REFERENCES public.landlords(landlord_id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_landlords_user_id ON public.landlords(user_id);
CREATE INDEX IF NOT EXISTS idx_units_landlord_id ON public.units(landlord_id);
CREATE INDEX IF NOT EXISTS idx_contracts_landlord_id ON public.contracts(landlord_id);

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

-- Update RLS policies for units to include landlord access
CREATE POLICY "Landlords can view their own units" 
ON public.units FOR SELECT 
TO authenticated 
USING (
  landlord_id IN (
    SELECT landlord_id FROM public.landlords 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Landlords can manage their own units" 
ON public.units FOR ALL 
TO authenticated 
USING (
  landlord_id IN (
    SELECT landlord_id FROM public.landlords 
    WHERE user_id = auth.uid()
  )
);

-- Update RLS policies for contracts to include landlord access
CREATE POLICY "Landlords can view their own contracts" 
ON public.contracts FOR SELECT 
TO authenticated 
USING (
  landlord_id IN (
    SELECT landlord_id FROM public.landlords 
    WHERE user_id = auth.uid()
  )
);

-- Update the handle_new_user function to support landlord creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_branch TEXT;
  user_name TEXT;
  user_phone TEXT;
  emergency_contact_name TEXT;
  emergency_contact_phone TEXT;
  emergency_contact_relationship TEXT;
  occupation TEXT;
  company TEXT;
BEGIN
  -- Extract user metadata
  user_role := NEW.raw_user_meta_data->>'role';
  user_branch := NEW.raw_user_meta_data->>'branch';
  user_name := NEW.raw_user_meta_data->>'name';
  user_phone := NEW.raw_user_meta_data->>'phone';
  emergency_contact_name := NEW.raw_user_meta_data->>'emergency_contact_name';
  emergency_contact_phone := NEW.raw_user_meta_data->>'emergency_contact_phone';
  emergency_contact_relationship := NEW.raw_user_meta_data->>'emergency_contact_relationship';
  occupation := NEW.raw_user_meta_data->>'occupation';
  company := NEW.raw_user_meta_data->>'company';

  -- Create tenant record if role is 'tenant'
  IF user_role = 'tenant' THEN
    INSERT INTO public.tenants (
      user_id,
      first_name,
      last_name,
      email,
      contact_number,
      branch,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      occupation,
      company,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(SPLIT_PART(user_name, ' ', 1), ''),
      COALESCE(SPLIT_PART(user_name, ' ', 2), ''),
      NEW.email,
      user_phone,
      user_branch,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      occupation,
      company,
      NOW(),
      NOW()
    );
  END IF;

  -- Create landlord record if role is 'landlord' (includes apartment managers)
  IF user_role = 'landlord' THEN
    INSERT INTO public.landlords (
      user_id,
      first_name,
      last_name,
      email,
      contact_number,
      company_name,
      branch,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(SPLIT_PART(user_name, ' ', 1), ''),
      COALESCE(SPLIT_PART(user_name, ' ', 2), ''),
      NEW.email,
      user_phone,
      COALESCE(company, 'Prime Living Properties'),
      user_branch,
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample landlord data (optional)
-- INSERT INTO public.landlords (first_name, last_name, email, contact_number, company_name, branch) VALUES
-- ('John', 'Smith', 'john.smith@primeliving.com', '+63917123456', 'Prime Living Properties', 'sampaloc-manila'),
-- ('Maria', 'Garcia', 'maria.garcia@primeliving.com', '+63917654321', 'Prime Living Properties', 'cainta-rizal'),
-- ('Carlos', 'Santos', 'carlos.santos@primeliving.com', '+63917987654', 'Prime Living Properties', 'cubao-qc')
-- ON CONFLICT (email) DO NOTHING;