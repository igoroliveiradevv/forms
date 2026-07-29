-- Add new columns for persona description and gradient background support
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS persona_description text,
ADD COLUMN IF NOT EXISTS background_type text DEFAULT 'solid',
ADD COLUMN IF NOT EXISTS background_gradient_start text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS background_gradient_end text DEFAULT '#f3f4f6',
ADD COLUMN IF NOT EXISTS background_gradient_direction text DEFAULT 'to bottom';