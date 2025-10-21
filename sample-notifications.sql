-- Sample notifications for testing
-- Run this in your Supabase SQL Editor after ensuring you have tenant data

-- Insert sample notifications (only if tenant_id 1 exists)
INSERT INTO public.notifications (tenant_id, notification_type, message, sent_date, status) 
SELECT 1, 'payment', 'Your rent payment for December 2024 is due in 3 days. Please settle your payment to avoid late charges.', NOW() - INTERVAL '1 day', 'unread'
WHERE EXISTS (SELECT 1 FROM public.tenants WHERE tenant_id = 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.notifications (tenant_id, notification_type, message, sent_date, status) 
SELECT 1, 'maintenance', 'Your kitchen sink repair has been completed. The technician has fixed the leak and tested the system.', NOW() - INTERVAL '2 days', 'read'
WHERE EXISTS (SELECT 1 FROM public.tenants WHERE tenant_id = 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.notifications (tenant_id, notification_type, message, sent_date, status) 
SELECT 1, 'general', 'Scheduled water system maintenance on December 15, 2024 from 10 AM to 2 PM. Water supply will be temporarily interrupted.', NOW() - INTERVAL '3 days', 'read'
WHERE EXISTS (SELECT 1 FROM public.tenants WHERE tenant_id = 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.notifications (tenant_id, notification_type, message, sent_date, status) 
SELECT 1, 'payment', 'Your payment of ₱15,000 for November 2024 has been successfully processed. Thank you for your prompt payment.', NOW() - INTERVAL '5 days', 'read'
WHERE EXISTS (SELECT 1 FROM public.tenants WHERE tenant_id = 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.notifications (tenant_id, notification_type, message, sent_date, status) 
SELECT 1, 'emergency', 'Emergency electrical work required tonight from 10 PM to 6 AM. Power will be temporarily shut off in affected areas.', NOW() - INTERVAL '7 days', 'read'
WHERE EXISTS (SELECT 1 FROM public.tenants WHERE tenant_id = 1)
ON CONFLICT DO NOTHING;

INSERT INTO public.notifications (tenant_id, notification_type, message, sent_date, status) 
SELECT 1, 'maintenance', 'Your air conditioning maintenance request has been received and assigned to our technician. Expected completion: 2-3 business days.', NOW() - INTERVAL '1 hour', 'unread'
WHERE EXISTS (SELECT 1 FROM public.tenants WHERE tenant_id = 1)
ON CONFLICT DO NOTHING;