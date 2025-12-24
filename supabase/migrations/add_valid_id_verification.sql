-- Add valid_id_verified column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS valid_id_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS valid_id_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS valid_id_verified_by INTEGER REFERENCES public.apartment_managers(apartment_manager_id) ON DELETE SET NULL;

-- Create index for verified status
CREATE INDEX IF NOT EXISTS idx_tenants_valid_id_verified ON public.tenants(valid_id_verified) WHERE valid_id_verified = TRUE;

-- Add comments
COMMENT ON COLUMN public.tenants.valid_id_verified IS 'Whether the valid ID has been verified by an apartment manager';
COMMENT ON COLUMN public.tenants.valid_id_verified_at IS 'Timestamp when the valid ID was verified';
COMMENT ON COLUMN public.tenants.valid_id_verified_by IS 'ID of the apartment manager who verified the valid ID';

