-- Migration: Add Super Admin Support
-- This migration adds RLS policies to allow super admins to access all data

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'super_admin' OR
    (auth.jwt() ->> 'user_metadata')::jsonb->>'uiRole' = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for tenants table to allow super admin access
DROP POLICY IF EXISTS "Super admins can view all tenants" ON public.tenants;
CREATE POLICY "Super admins can view all tenants"
ON public.tenants FOR SELECT
TO authenticated
USING (public.is_super_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can update all tenants" ON public.tenants;
CREATE POLICY "Super admins can update all tenants"
ON public.tenants FOR UPDATE
TO authenticated
USING (public.is_super_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can delete all tenants" ON public.tenants;
CREATE POLICY "Super admins can delete all tenants"
ON public.tenants FOR DELETE
TO authenticated
USING (public.is_super_admin() OR user_id = auth.uid());

-- Update RLS policies for landlords table to allow super admin access
DROP POLICY IF EXISTS "Super admins can view all landlords" ON public.landlords;
CREATE POLICY "Super admins can view all landlords"
ON public.landlords FOR SELECT
TO authenticated
USING (public.is_super_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can update all landlords" ON public.landlords;
CREATE POLICY "Super admins can update all landlords"
ON public.landlords FOR UPDATE
TO authenticated
USING (public.is_super_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Super admins can delete all landlords" ON public.landlords;
CREATE POLICY "Super admins can delete all landlords"
ON public.landlords FOR DELETE
TO authenticated
USING (public.is_super_admin() OR user_id = auth.uid());

-- Update RLS policies for units table to allow super admin access
DROP POLICY IF EXISTS "Super admins can view all units" ON public.units;
CREATE POLICY "Super admins can view all units"
ON public.units FOR SELECT
TO authenticated
USING (public.is_super_admin() OR landlord_id IN (
  SELECT landlord_id FROM public.landlords WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Super admins can update all units" ON public.units;
CREATE POLICY "Super admins can update all units"
ON public.units FOR UPDATE
TO authenticated
USING (public.is_super_admin() OR landlord_id IN (
  SELECT landlord_id FROM public.landlords WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Super admins can delete all units" ON public.units;
CREATE POLICY "Super admins can delete all units"
ON public.units FOR DELETE
TO authenticated
USING (public.is_super_admin() OR landlord_id IN (
  SELECT landlord_id FROM public.landlords WHERE user_id = auth.uid()
));

-- Update RLS policies for payments table to allow super admin access
DROP POLICY IF EXISTS "Super admins can view all payments" ON public.payments;
CREATE POLICY "Super admins can view all payments"
ON public.payments FOR SELECT
TO authenticated
USING (
  public.is_super_admin() OR 
  tenant_id IN (SELECT tenant_id FROM public.tenants WHERE user_id = auth.uid()) OR
  contract_id IN (
    SELECT c.contract_id FROM public.contracts c
    JOIN public.units u ON c.unit_id = u.unit_id
    JOIN public.landlords l ON u.landlord_id = l.landlord_id
    WHERE l.user_id = auth.uid()
  )
);

-- Update RLS policies for contracts table to allow super admin access
DROP POLICY IF EXISTS "Super admins can view all contracts" ON public.contracts;
CREATE POLICY "Super admins can view all contracts"
ON public.contracts FOR SELECT
TO authenticated
USING (
  public.is_super_admin() OR 
  tenant_id IN (SELECT tenant_id FROM public.tenants WHERE user_id = auth.uid()) OR
  unit_id IN (
    SELECT u.unit_id FROM public.units u
    JOIN public.landlords l ON u.landlord_id = l.landlord_id
    WHERE l.user_id = auth.uid()
  )
);

-- Update RLS policies for maintenance_requests table to allow super admin access
DROP POLICY IF EXISTS "Super admins can view all maintenance requests" ON public.maintenance_requests;
CREATE POLICY "Super admins can view all maintenance requests"
ON public.maintenance_requests FOR SELECT
TO authenticated
USING (
  public.is_super_admin() OR 
  tenant_id IN (SELECT tenant_id FROM public.tenants WHERE user_id = auth.uid()) OR
  unit_id IN (
    SELECT u.unit_id FROM public.units u
    JOIN public.landlords l ON u.landlord_id = l.landlord_id
    WHERE l.user_id = auth.uid()
  )
);

-- Update RLS policies for documents table to allow super admin access
DROP POLICY IF EXISTS "Super admins can view all documents" ON public.documents;
CREATE POLICY "Super admins can view all documents"
ON public.documents FOR SELECT
TO authenticated
USING (
  public.is_super_admin() OR 
  tenant_id IN (SELECT tenant_id FROM public.tenants WHERE user_id = auth.uid()) OR
  created_by IN (SELECT landlord_id FROM public.landlords WHERE user_id = auth.uid())
);

-- Update RLS policies for notifications table to allow super admin access
DROP POLICY IF EXISTS "Super admins can view all notifications" ON public.notifications;
CREATE POLICY "Super admins can view all notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (
  public.is_super_admin() OR 
  tenant_id IN (SELECT tenant_id FROM public.tenants WHERE user_id = auth.uid())
);

-- Note: To create a super admin user, you need to:
-- 1. Sign up a user normally
-- 2. Update their user metadata in Supabase Dashboard:
--    - Go to Authentication > Users
--    - Find the user
--    - Edit user metadata and add: {"role": "super_admin", "uiRole": "super_admin"}
-- 
-- Or use SQL:
-- UPDATE auth.users 
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "super_admin", "uiRole": "super_admin"}'::jsonb
-- WHERE email = 'admin@primeliving.com';

