import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Response, ResponseAnswer } from '@/types/form';
import { toast } from '@/hooks/use-toast';

export function useResponses(formId: string | undefined) {
  const queryClient = useQueryClient();

  const responsesQuery = useQuery({
    queryKey: ['responses', formId],
    queryFn: async () => {
      if (!formId) return [];

      const { data: responses, error } = await supabase
        .from('responses')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Get answers for each response
      const responsesWithAnswers = await Promise.all(
        (responses || []).map(async (response) => {
          const { data: answers } = await supabase
            .from('response_answers')
            .select('*')
            .eq('response_id', response.id);

          return { ...response, answers: answers || [] } as Response;
        })
      );

      return responsesWithAnswers;
    },
    enabled: !!formId,
  });

  const deleteResponse = useMutation({
    mutationFn: async (responseId: string) => {
      const { error } = await supabase.from('responses').delete().eq('id', responseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses', formId] });
      toast({ title: 'Resposta excluída com sucesso!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao excluir resposta', description: error.message, variant: 'destructive' });
    },
  });

  return {
    responses: responsesQuery.data || [],
    isLoading: responsesQuery.isLoading,
    error: responsesQuery.error,
    deleteResponse,
    responseCount: responsesQuery.data?.length || 0,
  };
}

export function useSubmitResponse() {
  return useMutation({
    mutationFn: async ({
      formId,
      answers,
    }: {
      formId: string;
      answers: Omit<ResponseAnswer, 'id' | 'response_id' | 'created_at'>[];
    }) => {
      const responseId = crypto.randomUUID();
      const submittedAt = new Date().toISOString();

      const { error: responseError } = await supabase
        .from('responses')
        .insert({
          id: responseId,
          form_id: formId,
          submitted_at: submittedAt,
        });

      if (responseError) throw responseError;

      if (answers.length > 0) {
        const answersWithResponseId = answers.map((answer) => ({
          ...answer,
          response_id: responseId,
        }));

        const { error: answersError } = await supabase
          .from('response_answers')
          .insert(answersWithResponseId);

        if (answersError) throw answersError;
      }

      return {
        id: responseId,
        form_id: formId,
        submitted_at: submittedAt,
        respondent_user_agent: null,
      } as Response;
    },
  });
}
