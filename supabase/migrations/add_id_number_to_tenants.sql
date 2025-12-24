-- Add id_number column to tenants table to store the ID document number
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS id_number VARCHAR(100);

-- Create index for id_number
CREATE INDEX IF NOT EXISTS idx_tenants_id_number ON public.tenants(id_number) WHERE id_number IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.tenants.id_number IS 'The ID document number (e.g., passport number, driver license number, national ID number)';

