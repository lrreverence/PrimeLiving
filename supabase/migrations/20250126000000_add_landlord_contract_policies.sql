-- Add RLS policies for landlords/caretakers to manage contracts
-- This allows caretakers to update contracts (unit assignments, dates, status) for tenants in their branch

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Landlords can view contracts from same branch" ON public.contracts;
DROP POLICY IF EXISTS "Landlords can update contracts from same branch" ON public.contracts;
DROP POLICY IF EXISTS "Landlords can insert contracts for same branch" ON public.contracts;

-- Allow landlords/caretakers to view contracts for tenants in their branch
CREATE POLICY "Landlords can view contracts from same branch" 
ON public.contracts FOR SELECT 
TO authenticated 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenants 
    WHERE branch IN (
      SELECT branch FROM public.landlords WHERE user_id = auth.uid()
    )
  )
);

-- Allow landlords/caretakers to update contracts for tenants in their branch
CREATE POLICY "Landlords can update contracts from same branch" 
ON public.contracts FOR UPDATE 
TO authenticated 
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.tenants 
    WHERE branch IN (
      SELECT branch FROM public.landlords WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.tenants 
    WHERE branch IN (
      SELECT branch FROM public.landlords WHERE user_id = auth.uid()
    )
  )
);

-- Allow landlords/caretakers to insert contracts for tenants in their branch
CREATE POLICY "Landlords can insert contracts for same branch" 
ON public.contracts FOR INSERT 
TO authenticated 
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.tenants 
    WHERE branch IN (
      SELECT branch FROM public.landlords WHERE user_id = auth.uid()
    )
  )
);
