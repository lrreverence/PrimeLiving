-- Migration 3: Add emergency contact and occupation
-- Run this in your Supabase SQL Editor

-- Add emergency contact and occupation columns to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(50),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(100),
ADD COLUMN IF NOT EXISTS company VARCHAR(100);

-- Update the handle_new_user function to include new fields
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

  -- Only create tenant record if role is 'tenant'
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
