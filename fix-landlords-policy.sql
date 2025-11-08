-- Fix infinite recursion in landlords RLS policy
-- Run this in your Supabase SQL Editor

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Landlords can view same branch data" ON public.landlords;

-- Ensure we have the correct non-recursive policies
DROP POLICY IF EXISTS "Landlords can view their own data" ON public.landlords;
DROP POLICY IF EXISTS "Landlords can update their own data" ON public.landlords;
DROP POLICY IF EXISTS "Allow landlord creation" ON public.landlords;

-- Create the correct non-recursive policies
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

