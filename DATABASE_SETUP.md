# Database Setup Instructions

## 🚨 **IMPORTANT: Apply Database Migrations**

The tenant dashboard is showing 404 errors and loading issues because the database migrations haven't been applied yet. Follow these steps to set up your database:

### 📋 **Step 1: Access Supabase Dashboard**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `vciibfsxqdulxmfybxol`

### 📋 **Step 2: Apply Migrations**

Navigate to **SQL Editor** in your Supabase dashboard and run these migrations in order:

#### **Migration 1: Initial Database Schema**
```sql
-- Create units table first (no dependencies)
CREATE TABLE public.units (
  unit_id SERIAL PRIMARY KEY,
  unit_number VARCHAR(50) NOT NULL UNIQUE,
  unit_type VARCHAR(50) NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE public.tenants (
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
CREATE TABLE public.contracts (
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
CREATE TABLE public.payments (
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
CREATE TABLE public.notifications (
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
CREATE TABLE public.maintenance_requests (
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
CREATE INDEX idx_contracts_tenant_id ON public.contracts(tenant_id);
CREATE INDEX idx_contracts_unit_id ON public.contracts(unit_id);
CREATE INDEX idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX idx_payments_contract_id ON public.payments(contract_id);
CREATE INDEX idx_notifications_tenant_id ON public.notifications(tenant_id);
CREATE INDEX idx_maintenance_requests_tenant_id ON public.maintenance_requests(tenant_id);
CREATE INDEX idx_maintenance_requests_unit_id ON public.maintenance_requests(unit_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
```

#### **Migration 2: Add Branch and Auto Tenant Creation**
```sql
-- Add branch column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN branch VARCHAR(50),
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id
CREATE INDEX idx_tenants_user_id ON public.tenants(user_id);

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
```

#### **Migration 3: Add Emergency Contact and Occupation**
```sql
-- Add emergency contact and occupation columns to tenants table
ALTER TABLE public.tenants 
ADD COLUMN emergency_contact_name VARCHAR(100),
ADD COLUMN emergency_contact_phone VARCHAR(20),
ADD COLUMN emergency_contact_relationship VARCHAR(50),
ADD COLUMN occupation VARCHAR(100),
ADD COLUMN company VARCHAR(100);

-- Update the handle_new_user function to include new fields
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
  -- Extract user metadata
  user_role := NEW.raw_user_meta_data->>'role';
  user_branch := NEW.raw_user_meta_data->>'branch';
  user_name := NEW.raw_user_meta_data->>'name';
  user_phone := NEW.raw_user_meta_data->>'phone';
  emergency_contact_name := NEW.raw_user_meta_data->>'emergency_contact_name';
  emergency_contact_phone := NEW.raw_user_meta_data->>'emergency_contact_phone';
  emergency_contact_relationship := NEW.raw_user_meta_data->>'emergency_contact_relationship';
  occupation := NEW.raw_user_meta_data->>'occupation';
  company := NEW.raw_user_meta_data->>'company';

  -- Only create tenant record if role is 'tenant'
  IF user_role = 'tenant' THEN
    INSERT INTO public.tenants (
      user_id,
      first_name,
      last_name,
      email,
      contact_number,
      branch,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      occupation,
      company,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(SPLIT_PART(user_name, ' ', 1), ''),
      COALESCE(SPLIT_PART(user_name, ' ', 2), ''),
      NEW.email,
      user_phone,
      user_branch,
      emergency_contact_name,
      emergency_contact_phone,
      emergency_contact_relationship,
      occupation,
      company,
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### **Migration 4: Add Sample Data**
```sql
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
```

### 📋 **Step 3: Test the Application**

After applying all migrations:

1. **Refresh your application**
2. **Try signing up as a tenant** with the new form
3. **Check if the tenant dashboard loads properly**
4. **Test maintenance request submission**

### 🚨 **Troubleshooting**

If you still see issues:

1. **Check Supabase Logs**: Go to Logs in your Supabase dashboard
2. **Verify Tables**: Check if all tables were created in the Table Editor
3. **Test Authentication**: Make sure user signup works
4. **Check RLS Policies**: Verify Row Level Security policies are active

### 📞 **Need Help?**

If you encounter any issues:
1. Check the Supabase logs for error messages
2. Verify all migrations ran successfully
3. Test the database connection
4. Check if the tenant record was created after signup

---

**After applying these migrations, your tenant dashboard should work correctly!**
