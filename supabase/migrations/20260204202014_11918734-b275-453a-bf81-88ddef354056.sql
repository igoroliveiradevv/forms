-- Add variable_name column to questions table for the variables system
ALTER TABLE public.questions ADD COLUMN variable_name text;

-- Add index for faster lookups by variable name within a form
CREATE INDEX idx_questions_variable_name ON public.questions (form_id, variable_name) WHERE variable_name IS NOT NULL;

-- Add a check constraint to ensure variable names follow the pattern (letters, numbers, underscores only)
ALTER TABLE public.questions ADD CONSTRAINT variable_name_format CHECK (
  variable_name IS NULL OR variable_name ~ '^[a-zA-Z_][a-zA-Z0-9_]*$'
);

-- Create a unique constraint to ensure variable names are unique within a form
CREATE UNIQUE INDEX idx_questions_unique_variable_per_form ON public.questions (form_id, variable_name) WHERE variable_name IS NOT NULL;