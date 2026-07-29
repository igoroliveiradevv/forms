-- Add persona fields to forms table
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS persona_name text DEFAULT 'Assistente',
ADD COLUMN IF NOT EXISTS persona_avatar_url text,
ADD COLUMN IF NOT EXISTS user_bubble_color text DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS persona_bubble_color text DEFAULT '#f3f4f6',
ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Inter';

-- Add new question type for text-only messages (persona messages without input)
ALTER TYPE public.question_type ADD VALUE IF NOT EXISTS 'text_only';

-- Add session_id to responses for tracking conversation sessions
ALTER TABLE public.responses
ADD COLUMN IF NOT EXISTS session_id uuid DEFAULT gen_random_uuid();