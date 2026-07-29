-- Enum para tipos de perguntas
CREATE TYPE public.question_type AS ENUM (
  'short_text',
  'long_text',
  'number',
  'email',
  'single_choice',
  'multiple_choice',
  'dropdown',
  'date',
  'rating'
);

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de formulários
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de perguntas
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  type public.question_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de opções para perguntas de seleção
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de respostas (uma entrada por submissão)
CREATE TABLE public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  respondent_ip TEXT,
  respondent_user_agent TEXT
);

-- Tabela de respostas individuais por pergunta
CREATE TABLE public.response_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES public.responses(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  answer_text TEXT,
  answer_options UUID[],
  answer_number NUMERIC,
  answer_date DATE,
  answer_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Índices para melhor performance
CREATE INDEX idx_forms_user_id ON public.forms(user_id);
CREATE INDEX idx_forms_slug ON public.forms(slug);
CREATE INDEX idx_questions_form_id ON public.questions(form_id);
CREATE INDEX idx_question_options_question_id ON public.question_options(question_id);
CREATE INDEX idx_responses_form_id ON public.responses(form_id);
CREATE INDEX idx_response_answers_response_id ON public.response_answers(response_id);
CREATE INDEX idx_response_answers_question_id ON public.response_answers(question_id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_answers ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies para forms
CREATE POLICY "Users can view their own forms"
  ON public.forms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active forms by slug"
  ON public.forms FOR SELECT
  USING (is_active = true AND is_draft = false);

CREATE POLICY "Users can insert their own forms"
  ON public.forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms"
  ON public.forms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms"
  ON public.forms FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para questions
CREATE POLICY "Users can view questions of their forms"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = questions.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view questions of active forms"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = questions.form_id
      AND forms.is_active = true
      AND forms.is_draft = false
    )
  );

CREATE POLICY "Users can insert questions to their forms"
  ON public.questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = questions.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questions of their forms"
  ON public.questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = questions.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions of their forms"
  ON public.questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = questions.form_id
      AND forms.user_id = auth.uid()
    )
  );

-- Policies para question_options
CREATE POLICY "Users can view options of their questions"
  ON public.question_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.questions
      JOIN public.forms ON forms.id = questions.form_id
      WHERE questions.id = question_options.question_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view options of active forms"
  ON public.question_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.questions
      JOIN public.forms ON forms.id = questions.form_id
      WHERE questions.id = question_options.question_id
      AND forms.is_active = true
      AND forms.is_draft = false
    )
  );

CREATE POLICY "Users can insert options to their questions"
  ON public.question_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions
      JOIN public.forms ON forms.id = questions.form_id
      WHERE questions.id = question_options.question_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update options of their questions"
  ON public.question_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.questions
      JOIN public.forms ON forms.id = questions.form_id
      WHERE questions.id = question_options.question_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete options of their questions"
  ON public.question_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.questions
      JOIN public.forms ON forms.id = questions.form_id
      WHERE questions.id = question_options.question_id
      AND forms.user_id = auth.uid()
    )
  );

-- Policies para responses (qualquer pessoa pode submeter respostas a formulários ativos)
CREATE POLICY "Anyone can insert responses to active forms"
  ON public.responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = responses.form_id
      AND forms.is_active = true
      AND forms.is_draft = false
    )
  );

CREATE POLICY "Users can view responses of their forms"
  ON public.responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = responses.form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete responses of their forms"
  ON public.responses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = responses.form_id
      AND forms.user_id = auth.uid()
    )
  );

-- Policies para response_answers
CREATE POLICY "Anyone can insert answers to responses"
  ON public.response_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.responses
      JOIN public.forms ON forms.id = responses.form_id
      WHERE responses.id = response_answers.response_id
      AND forms.is_active = true
      AND forms.is_draft = false
    )
  );

CREATE POLICY "Users can view answers of their form responses"
  ON public.response_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.responses
      JOIN public.forms ON forms.id = responses.form_id
      WHERE responses.id = response_answers.response_id
      AND forms.user_id = auth.uid()
    )
  );

-- Trigger para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();