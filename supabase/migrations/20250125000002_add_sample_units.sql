-- Add sample units to the database
-- This ensures there are units available for maintenance requests

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
('502', 'Studio', 15000.00, 'occupied');

-- Add RLS policy to allow reading units table
CREATE POLICY "Allow reading units" 
ON public.units FOR SELECT 
TO authenticated;

-- Add some sample maintenance requests for testing
INSERT INTO public.maintenance_requests (tenant_id, unit_id, description, priority, status, created_date) VALUES
(1, 1, 'Leaky faucet in kitchen', 'medium', 'pending', NOW() - INTERVAL '2 days'),
(1, 1, 'Broken air conditioning', 'high', 'in_progress', NOW() - INTERVAL '1 day'),
(1, 1, 'Door lock not working properly', 'low', 'completed', NOW() - INTERVAL '5 days');

-- Update the maintenance request that was completed
UPDATE public.maintenance_requests 
SET resolved_date = NOW() - INTERVAL '3 days'
WHERE description = 'Door lock not working properly';
