-- Migration 2: Add branch and auto tenant creation
-- Run this in your Supabase SQL Editor

-- Add branch column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS branch VARCHAR(50),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON public.tenants(user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_branch TEXT;
  user_name TEXT;
  user_phone TEXT;
BEGIN
  -- Extract user metadata
  user_role := NEW.raw_user_meta_data->>'role';
  user_branch := NEW.raw_user_meta_data->>'branch';
  user_name := NEW.raw_user_meta_data->>'name';
  user_phone := NEW.raw_user_meta_data->>'phone';

  -- Only create tenant record if role is 'tenant'
  IF user_role = 'tenant' THEN
    INSERT INTO public.tenants (
      user_id,
      first_name,
      last_name,
      email,
      contact_number,
      branch,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(SPLIT_PART(user_name, ' ', 1), ''),
      COALESCE(SPLIT_PART(user_name, ' ', 2), ''),
      NEW.email,
      user_phone,
      user_branch,
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create tenant record on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to use user_id instead of email matching
DROP POLICY IF EXISTS "Tenants can view their own data" ON public.tenants;
DROP POLICY IF EXISTS "Tenants can update their own data" ON public.tenants;

-- Create new RLS policies using user_id
CREATE POLICY "Tenants can view their own data" 
ON public.tenants FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Tenants can update their own data" 
ON public.tenants FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

-- Allow tenants to insert their own data (for the trigger)
CREATE POLICY "Allow tenant creation" 
ON public.tenants FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Update other RLS policies to use the new user_id relationship
DROP POLICY IF EXISTS "Users can view their own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Users can create maintenance requests" ON public.maintenance_requests;

-- Create updated RLS policies for contracts
CREATE POLICY "Users can view their own contracts" 
ON public.contracts FOR SELECT 
TO authenticated 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenants 
    WHERE user_id = auth.uid()
  )
);

-- Create updated RLS policies for payments
CREATE POLICY "Users can view their own payments" 
ON public.payments FOR SELECT 
TO authenticated 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenants 
    WHERE user_id = auth.uid()
  )
);

-- Create updated RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
TO authenticated 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenants 
    WHERE user_id = auth.uid()
  )
);

-- Create updated RLS policies for maintenance requests
CREATE POLICY "Users can view their own maintenance requests" 
ON public.maintenance_requests FOR SELECT 
TO authenticated 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create maintenance requests" 
ON public.maintenance_requests FOR INSERT 
TO authenticated 
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.tenants 
    WHERE user_id = auth.uid()
  )
);
