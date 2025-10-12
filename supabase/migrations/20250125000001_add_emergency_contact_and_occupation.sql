-- Add emergency contact and occupation columns to tenants table
ALTER TABLE public.tenants 
ADD COLUMN emergency_contact_name VARCHAR(100),
ADD COLUMN emergency_contact_phone VARCHAR(20),
ADD COLUMN emergency_contact_relationship VARCHAR(50),
ADD COLUMN occupation VARCHAR(100),
ADD COLUMN company VARCHAR(100);

-- Create indexes for better performance
CREATE INDEX idx_tenants_emergency_contact ON public.tenants(emergency_contact_phone);
CREATE INDEX idx_tenants_occupation ON public.tenants(occupation);

-- Update the handle_new_user function to include the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_branch TEXT;
  user_name TEXT;
  user_phone TEXT;
  user_emergency_name TEXT;
  user_emergency_phone TEXT;
  user_emergency_relationship TEXT;
  user_occupation TEXT;
  user_company TEXT;
BEGIN
  -- Extract user metadata
  user_role := NEW.raw_user_meta_data->>'role';
  user_branch := NEW.raw_user_meta_data->>'branch';
  user_name := NEW.raw_user_meta_data->>'name';
  user_phone := NEW.raw_user_meta_data->>'phone';
  user_emergency_name := NEW.raw_user_meta_data->>'emergency_contact_name';
  user_emergency_phone := NEW.raw_user_meta_data->>'emergency_contact_phone';
  user_emergency_relationship := NEW.raw_user_meta_data->>'emergency_contact_relationship';
  user_occupation := NEW.raw_user_meta_data->>'occupation';
  user_company := NEW.raw_user_meta_data->>'company';

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
      user_emergency_name,
      user_emergency_phone,
      user_emergency_relationship,
      user_occupation,
      user_company,
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
