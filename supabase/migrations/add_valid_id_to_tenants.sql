-- Add valid_id_url column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN valid_id_url TEXT,
ADD COLUMN valid_id_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Create index for valid_id_url
CREATE INDEX idx_tenants_valid_id ON public.tenants(valid_id_url) WHERE valid_id_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.tenants.valid_id_url IS 'URL to the uploaded valid ID document stored in Supabase Storage';
COMMENT ON COLUMN public.tenants.valid_id_uploaded_at IS 'Timestamp when the valid ID was uploaded';

