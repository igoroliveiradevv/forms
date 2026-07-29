CREATE TYPE public.question_type AS ENUM ('short_text','long_text','number','email','single_choice','multiple_choice','dropdown','date','rating');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT, avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Novo Formulário',
  description TEXT,
  slug UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_draft BOOLEAN DEFAULT true NOT NULL,
  background_color TEXT DEFAULT '#ffffff',
  button_color TEXT DEFAULT '#1e40af',
  text_color TEXT DEFAULT '#1f2937',
  logo_url TEXT,
  theme TEXT DEFAULT 'corporate',
  thank_you_message TEXT DEFAULT 'Obrigado por responder!',
  persona_name TEXT DEFAULT 'Assistente',
  persona_avatar_url TEXT,
  user_bubble_color TEXT DEFAULT '#3b82f6',
  persona_bubble_color TEXT DEFAULT '#f3f4f6',
  font_family TEXT DEFAULT 'Inter',
  persona_description TEXT,
  background_type TEXT DEFAULT 'solid',
  background_gradient_start TEXT DEFAULT '#ffffff',
  background_gradient_end TEXT DEFAULT '#f3f4f6',
  background_gradient_direction TEXT DEFAULT 'to bottom',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  type public.question_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}',
  variable_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT variable_name_format CHECK (variable_name IS NULL OR variable_name ~ '^[a-zA-Z_][a-zA-Z0-9_]*$')
);

CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  session_id UUID DEFAULT gen_random_uuid(),
  submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  respondent_ip TEXT,
  respondent_user_agent TEXT
);

CREATE TABLE public.response_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES public.responses(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  answer_text TEXT,
  answer_options UUID[],
  answer_number NUMERIC,
  answer_date DATE,
  answer_rating INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_forms_user_id ON public.forms(user_id);
CREATE INDEX idx_forms_slug ON public.forms(slug);
CREATE INDEX idx_questions_form_id ON public.questions(form_id);
CREATE INDEX idx_question_options_question_id ON public.question_options(question_id);
CREATE INDEX idx_responses_form_id ON public.responses(form_id);
CREATE INDEX idx_response_answers_response_id ON public.response_answers(response_id);
CREATE INDEX idx_response_answers_question_id ON public.response_answers(question_id);
CREATE INDEX idx_questions_variable_name ON public.questions (form_id, variable_name) WHERE variable_name IS NOT NULL;
CREATE UNIQUE INDEX idx_questions_unique_variable_per_form ON public.questions (form_id, variable_name) WHERE variable_name IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forms TO authenticated;
GRANT SELECT ON public.forms TO anon;
GRANT ALL ON public.forms TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT SELECT ON public.questions TO anon;
GRANT ALL ON public.questions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_options TO authenticated;
GRANT SELECT ON public.question_options TO anon;
GRANT ALL ON public.question_options TO service_role;
GRANT SELECT, INSERT, DELETE ON public.responses TO authenticated;
GRANT INSERT ON public.responses TO anon;
GRANT ALL ON public.responses TO service_role;
GRANT SELECT, INSERT ON public.response_answers TO authenticated;
GRANT INSERT ON public.response_answers TO anon;
GRANT ALL ON public.response_answers TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active published forms" ON public.forms FOR SELECT TO public USING (is_active = true AND is_draft = false);
CREATE POLICY "Users can view their own forms" ON public.forms FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own forms" ON public.forms FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own forms" ON public.forms FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own forms" ON public.forms FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view questions of active forms" ON public.questions FOR SELECT TO public USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.is_active = true AND forms.is_draft = false));
CREATE POLICY "Users can view questions of their forms" ON public.questions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()));
CREATE POLICY "Users can insert questions to their forms" ON public.questions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()));
CREATE POLICY "Users can update questions of their forms" ON public.questions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()));
CREATE POLICY "Users can delete questions of their forms" ON public.questions FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()));

CREATE POLICY "Anyone can view options of active forms" ON public.question_options FOR SELECT TO public USING (EXISTS (SELECT 1 FROM questions JOIN forms ON forms.id = questions.form_id WHERE questions.id = question_options.question_id AND forms.is_active = true AND forms.is_draft = false));
CREATE POLICY "Users can view options of their questions" ON public.question_options FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM questions JOIN forms ON forms.id = questions.form_id WHERE questions.id = question_options.question_id AND forms.user_id = auth.uid()));
CREATE POLICY "Users can insert options to their questions" ON public.question_options FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM questions JOIN forms ON forms.id = questions.form_id WHERE questions.id = question_options.question_id AND forms.user_id = auth.uid()));
CREATE POLICY "Users can update options of their questions" ON public.question_options FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM questions JOIN forms ON forms.id = questions.form_id WHERE questions.id = question_options.question_id AND forms.user_id = auth.uid()));
CREATE POLICY "Users can delete options of their questions" ON public.question_options FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM questions JOIN forms ON forms.id = questions.form_id WHERE questions.id = question_options.question_id AND forms.user_id = auth.uid()));

CREATE POLICY "Anyone can insert responses to active forms" ON public.responses FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.is_active = true AND forms.is_draft = false));
CREATE POLICY "Users can view responses of their forms" ON public.responses FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.user_id = auth.uid()));
CREATE POLICY "Users can delete responses of their forms" ON public.responses FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.user_id = auth.uid()));

CREATE POLICY "Anyone can insert answers to responses" ON public.response_answers FOR INSERT TO public WITH CHECK (EXISTS (SELECT 1 FROM responses JOIN forms ON forms.id = responses.form_id WHERE responses.id = response_answers.response_id AND forms.is_active = true AND forms.is_draft = false));
CREATE POLICY "Users can view answers of their form responses" ON public.response_answers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM responses JOIN forms ON forms.id = responses.form_id WHERE responses.id = response_answers.response_id AND forms.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON public.forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can view persona avatars" ON storage.objects FOR SELECT USING (bucket_id = 'persona-avatars');
CREATE POLICY "Users can upload persona avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'persona-avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update persona avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'persona-avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete persona avatars" ON storage.objects FOR DELETE USING (bucket_id = 'persona-avatars' AND auth.uid() IS NOT NULL);