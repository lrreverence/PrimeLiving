-- Safe Migration Script - Handles existing policies and tables
-- Run this in your Supabase SQL Editor

-- 1. Create tables if they don't exist (with all columns)
CREATE TABLE IF NOT EXISTS public.units (
  unit_id SERIAL PRIMARY KEY,
  unit_number VARCHAR(50) NOT NULL UNIQUE,
  unit_type VARCHAR(50) NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to tenants table if they don't exist
DO $$ 
BEGIN
    -- Add branch column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'branch') THEN
        ALTER TABLE public.tenants ADD COLUMN branch VARCHAR(50);
    END IF;
    
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'user_id') THEN
        ALTER TABLE public.tenants ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add emergency contact columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE public.tenants ADD COLUMN emergency_contact_name VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE public.tenants ADD COLUMN emergency_contact_phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'emergency_contact_relationship') THEN
        ALTER TABLE public.tenants ADD COLUMN emergency_contact_relationship VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'occupation') THEN
        ALTER TABLE public.tenants ADD COLUMN occupation VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'company') THEN
        ALTER TABLE public.tenants ADD COLUMN company VARCHAR(100);
    END IF;
END $$;

-- Create other tables if they don't exist
CREATE TABLE IF NOT EXISTS public.contracts (
  contract_id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
  unit_id INTEGER NOT NULL REFERENCES public.units(unit_id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  terms TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  payment_id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
  contract_id INTEGER NOT NULL REFERENCES public.contracts(contract_id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_mode VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  notification_id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  sent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  request_id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES public.tenants(tenant_id) ON DELETE CASCADE,
  unit_id INTEGER NOT NULL REFERENCES public.units(unit_id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON public.tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_id ON public.contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_unit_id ON public.contracts(unit_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON public.payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON public.notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tenant_id ON public.maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_unit_id ON public.maintenance_requests(unit_id);

-- 3. Enable Row Level Security (safe to run multiple times)
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies and recreate them (safe approach)
DROP POLICY IF EXISTS "Allow reading units" ON public.units;
DROP POLICY IF EXISTS "Tenants can view their own data" ON public.tenants;
DROP POLICY IF EXISTS "Tenants can update their own data" ON public.tenants;
DROP POLICY IF EXISTS "Allow tenant creation" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Users can create maintenance requests" ON public.maintenance_requests;

-- 5. Create all policies
CREATE POLICY "Allow reading units" ON public.units FOR SELECT TO authenticated;

CREATE POLICY "Tenants can view their own data" ON public.tenants FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Tenants can update their own data" ON public.tenants FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Allow tenant creation" ON public.tenants FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own contracts" ON public.contracts FOR SELECT TO authenticated USING (tenant_id IN (SELECT tenant_id FROM public.tenants WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT TO authenticated USING (tenant_id IN (SELECT tenant_id FROM public.tenants WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (tenant_id IN (SELECT tenant_id FROM public.tenants WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING (tenant_id IN (SELECT tenant_id FROM public.tenants WHERE user_id = auth.uid()));
CREATE POLICY "Users can view their own maintenance requests" ON public.maintenance_requests FOR SELECT TO authenticated USING (tenant_id IN (SELECT tenant_id FROM public.tenants WHERE user_id = auth.uid()));
CREATE POLICY "Users can create maintenance requests" ON public.maintenance_requests FOR INSERT TO authenticated WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.tenants WHERE user_id = auth.uid()));

-- 6. Create or replace the function
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
  user_role := NEW.raw_user_meta_data->>'role';
  user_branch := NEW.raw_user_meta_data->>'branch';
  user_name := NEW.raw_user_meta_data->>'name';
  user_phone := NEW.raw_user_meta_data->>'phone';
  emergency_contact_name := NEW.raw_user_meta_data->>'emergency_contact_name';
  emergency_contact_phone := NEW.raw_user_meta_data->>'emergency_contact_phone';
  emergency_contact_relationship := NEW.raw_user_meta_data->>'emergency_contact_relationship';
  occupation := NEW.raw_user_meta_data->>'occupation';
  company := NEW.raw_user_meta_data->>'company';

  IF user_role = 'tenant' THEN
    INSERT INTO public.tenants (
      user_id, first_name, last_name, email, contact_number, branch,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
      occupation, company, created_at, updated_at
    ) VALUES (
      NEW.id,
      COALESCE(SPLIT_PART(user_name, ' ', 1), ''),
      COALESCE(SPLIT_PART(user_name, ' ', 2), ''),
      NEW.email, user_phone, user_branch,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
      occupation, company, NOW(), NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Add sample data (only if not exists)
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
