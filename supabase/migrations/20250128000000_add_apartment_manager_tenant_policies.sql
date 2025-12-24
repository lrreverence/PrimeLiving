-- Add RLS policies for apartment managers to manage tenants
-- This allows apartment managers to view and update tenant records (including valid ID uploads) for tenants in their branch

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Apartment managers can view tenants from same branch" ON public.tenants;
DROP POLICY IF EXISTS "Apartment managers can update tenants from same branch" ON public.tenants;

-- Allow apartment managers to view tenants from their branch
CREATE POLICY "Apartment managers can view tenants from same branch" 
ON public.tenants FOR SELECT 
TO authenticated 
USING (
  branch IN (
    SELECT branch FROM public.apartment_managers WHERE user_id = auth.uid()
  )
  OR user_id = auth.uid() -- Allow tenants to view their own data
  OR public.is_super_admin() -- Allow super admins
);

-- Allow apartment managers to update tenants from their branch
CREATE POLICY "Apartment managers can update tenants from same branch" 
ON public.tenants FOR UPDATE 
TO authenticated 
USING (
  branch IN (
    SELECT branch FROM public.apartment_managers WHERE user_id = auth.uid()
  )
  OR user_id = auth.uid() -- Allow tenants to update their own data
  OR public.is_super_admin() -- Allow super admins
)
WITH CHECK (
  branch IN (
    SELECT branch FROM public.apartment_managers WHERE user_id = auth.uid()
  )
  OR user_id = auth.uid() -- Allow tenants to update their own data
  OR public.is_super_admin() -- Allow super admins
);

