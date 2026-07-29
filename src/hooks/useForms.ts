import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Form, Question, QuestionOption } from '@/types/form';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function useForms() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const formsQuery = useQuery({
    queryKey: ['forms', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: forms, error } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get response counts for each form
      const formsWithCounts = await Promise.all(
        (forms || []).map(async (form) => {
          const { count } = await supabase
            .from('responses')
            .select('*', { count: 'exact', head: true })
            .eq('form_id', form.id);
          
          return { ...form, response_count: count || 0 } as Form;
        })
      );

      return formsWithCounts;
    },
    enabled: !!user,
  });

  const createForm = useMutation({
    mutationFn: async ({ title, form_type }: { title?: string; form_type?: string } = {}) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('forms')
        .insert({ title: title || 'Novo Formulário', user_id: user.id, form_type: form_type || 'conversational' })
        .select()
        .single();

      if (error) throw error;
      return data as Form;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'Formulário criado com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar formulário', description: error.message, variant: 'destructive' });
    },
  });

  const updateForm = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Form> & { id: string }) => {
      const { data, error } = await supabase
        .from('forms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Form;
    },
    onSuccess: (updatedForm) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', updatedForm.id] });
    },
    onError: (error) => {
      toast({ title: 'Erro ao atualizar formulário', description: error.message, variant: 'destructive' });
    },
  });

  const deleteForm = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('forms').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({ title: 'Formulário excluído com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir formulário', description: error.message, variant: 'destructive' });
    },
  });

  return {
    forms: formsQuery.data || [],
    isLoading: formsQuery.isLoading,
    error: formsQuery.error,
    createForm,
    updateForm,
    deleteForm,
  };
}

export function useForm(formId: string | undefined) {
  const queryClient = useQueryClient();

  const formQuery = useQuery({
    queryKey: ['form', formId],
    queryFn: async () => {
      if (!formId) return null;

      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;

      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', formId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (questionsError) throw questionsError;

      // Get options for each question
      const questionsWithOptions = await Promise.all(
        (questions || []).map(async (question) => {
          const { data: options } = await supabase
            .from('question_options')
            .select('*')
            .eq('question_id', question.id)
            .order('order_index', { ascending: true });

          return { ...question, options: options || [] } as Question;
        })
      );

      return { 
        ...form, 
        questions: questionsWithOptions,
        // Ensure persona fields have defaults
        persona_name: form.persona_name || 'Assistente',
        persona_bubble_color: form.persona_bubble_color || '#f3f4f6',
        user_bubble_color: form.user_bubble_color || '#3b82f6',
        font_family: form.font_family || 'Inter',
        background_type: form.background_type || 'solid',
        background_gradient_start: form.background_gradient_start || '#ffffff',
        background_gradient_end: form.background_gradient_end || '#f3f4f6',
        background_gradient_direction: form.background_gradient_direction || 'to bottom',
      } as Form;
    },
    enabled: !!formId,
  });

  const addQuestion = useMutation({
    mutationFn: async (question: {
      form_id: string;
      type: Question['type'];
      title: string;
      description?: string;
      is_required?: boolean;
      order_index?: number;
      settings?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from('questions')
        .insert([{
          form_id: question.form_id,
          type: question.type,
          title: question.title,
          description: question.description,
          is_required: question.is_required ?? false,
          order_index: question.order_index ?? 0,
          settings: (question.settings ?? {}) as unknown as Record<string, never>,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
    },
  });

  const updateQuestion = useMutation({
    mutationFn: async ({ id, options, ...updates }: Partial<Question> & { id: string }) => {
      // Remove fields that shouldn't be sent to the database
      const dbUpdates: Record<string, unknown> = {};
      if (updates.form_id !== undefined) dbUpdates.form_id = updates.form_id;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.is_required !== undefined) dbUpdates.is_required = updates.is_required;
      if (updates.order_index !== undefined) dbUpdates.order_index = updates.order_index;
      if (updates.settings !== undefined) dbUpdates.settings = updates.settings;
      if (updates.variable_name !== undefined) dbUpdates.variable_name = updates.variable_name;

      const { data, error } = await supabase
        .from('questions')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase.from('questions').delete().eq('id', questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
    },
  });

  const reorderQuestions = useMutation({
    mutationFn: async (questions: { id: string; order_index: number }[]) => {
      const updates = questions.map(({ id, order_index }) =>
        supabase.from('questions').update({ order_index }).eq('id', id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
    },
  });

  const addQuestionOption = useMutation({
    mutationFn: async (option: Omit<QuestionOption, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('question_options')
        .insert(option)
        .select()
        .single();

      if (error) throw error;
      return data as QuestionOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
    },
  });

  const updateQuestionOption = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QuestionOption> & { id: string }) => {
      const { data, error } = await supabase
        .from('question_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as QuestionOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
    },
  });

  const deleteQuestionOption = useMutation({
    mutationFn: async (optionId: string) => {
      const { error } = await supabase.from('question_options').delete().eq('id', optionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
    },
  });

  return {
    form: formQuery.data,
    isLoading: formQuery.isLoading,
    error: formQuery.error,
    refetch: formQuery.refetch,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    addQuestionOption,
    updateQuestionOption,
    deleteQuestionOption,
  };
}
