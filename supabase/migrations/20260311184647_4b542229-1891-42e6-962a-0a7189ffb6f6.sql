
-- Fix forms SELECT policies: drop restrictive, create permissive
DROP POLICY IF EXISTS "Anyone can view active forms by slug" ON public.forms;
DROP POLICY IF EXISTS "Users can view their own forms" ON public.forms;

CREATE POLICY "Anyone can view active published forms" ON public.forms
  FOR SELECT TO public
  USING (is_active = true AND is_draft = false);

CREATE POLICY "Users can view their own forms" ON public.forms
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix forms mutation policies: drop restrictive, create permissive
DROP POLICY IF EXISTS "Users can insert their own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can update their own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can delete their own forms" ON public.forms;

CREATE POLICY "Users can insert their own forms" ON public.forms
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms" ON public.forms
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms" ON public.forms
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Fix questions SELECT policies
DROP POLICY IF EXISTS "Anyone can view questions of active forms" ON public.questions;
DROP POLICY IF EXISTS "Users can view questions of their forms" ON public.questions;

CREATE POLICY "Anyone can view questions of active forms" ON public.questions
  FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.is_active = true AND forms.is_draft = false
  ));

CREATE POLICY "Users can view questions of their forms" ON public.questions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()
  ));

-- Fix questions mutation policies
DROP POLICY IF EXISTS "Users can insert questions to their forms" ON public.questions;
DROP POLICY IF EXISTS "Users can update questions of their forms" ON public.questions;
DROP POLICY IF EXISTS "Users can delete questions of their forms" ON public.questions;

CREATE POLICY "Users can insert questions to their forms" ON public.questions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can update questions of their forms" ON public.questions
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete questions of their forms" ON public.questions
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM forms WHERE forms.id = questions.form_id AND forms.user_id = auth.uid()
  ));

-- Fix question_options SELECT policies
DROP POLICY IF EXISTS "Anyone can view options of active forms" ON public.question_options;
DROP POLICY IF EXISTS "Users can view options of their questions" ON public.question_options;

CREATE POLICY "Anyone can view options of active forms" ON public.question_options
  FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM questions JOIN forms ON forms.id = questions.form_id
    WHERE questions.id = question_options.question_id AND forms.is_active = true AND forms.is_draft = false
  ));

CREATE POLICY "Users can view options of their questions" ON public.question_options
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM questions JOIN forms ON forms.id = questions.form_id
    WHERE questions.id = question_options.question_id AND forms.user_id = auth.uid()
  ));

-- Fix question_options mutation policies
DROP POLICY IF EXISTS "Users can insert options to their questions" ON public.question_options;
DROP POLICY IF EXISTS "Users can update options of their questions" ON public.question_options;
DROP POLICY IF EXISTS "Users can delete options of their questions" ON public.question_options;

CREATE POLICY "Users can insert options to their questions" ON public.question_options
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM questions JOIN forms ON forms.id = questions.form_id
    WHERE questions.id = question_options.question_id AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can update options of their questions" ON public.question_options
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM questions JOIN forms ON forms.id = questions.form_id
    WHERE questions.id = question_options.question_id AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete options of their questions" ON public.question_options
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM questions JOIN forms ON forms.id = questions.form_id
    WHERE questions.id = question_options.question_id AND forms.user_id = auth.uid()
  ));

-- Fix responses policies
DROP POLICY IF EXISTS "Anyone can insert responses to active forms" ON public.responses;
DROP POLICY IF EXISTS "Users can view responses of their forms" ON public.responses;
DROP POLICY IF EXISTS "Users can delete responses of their forms" ON public.responses;

CREATE POLICY "Anyone can insert responses to active forms" ON public.responses
  FOR INSERT TO public
  WITH CHECK (EXISTS (
    SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.is_active = true AND forms.is_draft = false
  ));

CREATE POLICY "Users can view responses of their forms" ON public.responses
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete responses of their forms" ON public.responses
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM forms WHERE forms.id = responses.form_id AND forms.user_id = auth.uid()
  ));

-- Fix response_answers policies
DROP POLICY IF EXISTS "Anyone can insert answers to responses" ON public.response_answers;
DROP POLICY IF EXISTS "Users can view answers of their form responses" ON public.response_answers;

CREATE POLICY "Anyone can insert answers to responses" ON public.response_answers
  FOR INSERT TO public
  WITH CHECK (EXISTS (
    SELECT 1 FROM responses JOIN forms ON forms.id = responses.form_id
    WHERE responses.id = response_answers.response_id AND forms.is_active = true AND forms.is_draft = false
  ));

CREATE POLICY "Users can view answers of their form responses" ON public.response_answers
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM responses JOIN forms ON forms.id = responses.form_id
    WHERE responses.id = response_answers.response_id AND forms.user_id = auth.uid()
  ));

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
