-- Migration 4: Add sample data
-- Run this in your Supabase SQL Editor

-- Add sample units to the database
INSERT INTO public.units (unit_number, unit_type, monthly_rent, status) VALUES
('101', 'Studio', 15000.00, 'available'),
('102', 'Studio', 15000.00, 'available'),
('201', '1 Bedroom', 20000.00, 'available'),
('202', '1 Bedroom', 20000.00, 'available'),
('301', '2 Bedroom', 25000.00, 'available'),
('302', '2 Bedroom', 25000.00, 'available'),
('401', 'Studio', 15000.00, 'occupied'),
('402', '1 Bedroom', 20000.00, 'occupied'),
('501', '2 Bedroom', 25000.00, 'occupied'),
('502', 'Studio', 15000.00, 'occupied')
ON CONFLICT (unit_number) DO NOTHING;

-- Add RLS policy to allow reading units table
CREATE POLICY "Allow reading units" 
ON public.units FOR SELECT 
TO authenticated;

-- Add some sample maintenance requests for testing (only if tenant_id 1 exists)
INSERT INTO public.maintenance_requests (tenant_id, unit_id, description, priority, status, created_date) 
SELECT 1, 1, 'Leaky faucet in kitchen', 'medium', 'pending', NOW() - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM public.tenants WHERE tenant_id = 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.maintenance_requests (tenant_id, unit_id, description, priority, status, created_date) 
SELECT 1, 1, 'Broken air conditioning', 'high', 'in_progress', NOW() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM public.tenants WHERE tenant_id = 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.maintenance_requests (tenant_id, unit_id, description, priority, status, created_date) 
SELECT 1, 1, 'Door lock not working properly', 'low', 'completed', NOW() - INTERVAL '5 days'
WHERE EXISTS (SELECT 1 FROM public.tenants WHERE tenant_id = 1)
ON CONFLICT DO NOTHING;

-- Update the maintenance request that was completed
UPDATE public.maintenance_requests 
SET resolved_date = NOW() - INTERVAL '3 days'
WHERE description = 'Door lock not working properly' AND resolved_date IS NULL;
