import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Form, Question } from '@/types/form';

export function usePublicForm(slug: string | undefined) {
  return useQuery({
    queryKey: ['public-form', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .eq('is_draft', false)
        .maybeSingle();

      if (formError) throw formError;
      if (!form) return null;

      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', form.id)
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
    enabled: !!slug,
  });
}
