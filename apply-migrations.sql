-- Migration 1: Create initial database schema
-- Run this in your Supabase SQL Editor

-- Create units table first (no dependencies)
CREATE TABLE IF NOT EXISTS public.units (
  unit_id SERIAL PRIMARY KEY,
  unit_number VARCHAR(50) NOT NULL UNIQUE,
  unit_type VARCHAR(50) NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  tenant_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20),
  email VARCHAR(255) NOT NULL UNIQUE,
  move_in_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contracts table (depends on tenants and units)
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

-- Create payments table (depends on tenants and contracts)
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

-- Create notifications table (depends on tenants)
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

-- Create maintenance_requests table (depends on tenants and units)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contracts_tenant_id ON public.contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_unit_id ON public.contracts(unit_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON public.payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON public.notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tenant_id ON public.maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_unit_id ON public.maintenance_requests(unit_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
