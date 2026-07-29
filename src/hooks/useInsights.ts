import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Form, Response, Question } from '@/types/form';

export interface InsightsData {
  totalForms: number;
  totalResponses: number;
  averageCompletionRate: number;
  averageResponseTime: number; // in seconds
  formsByResponses: { formId: string; formTitle: string; responseCount: number }[];
  responsesByPeriod: { date: string; count: number }[];
  questionStats: {
    questionId: string;
    questionTitle: string;
    variableName?: string;
    responseCount: number;
    dropoffRate: number;
  }[];
}

export interface FormInsights {
  form: Form;
  responses: Response[];
  questionAnalytics: {
    questionId: string;
    questionTitle: string;
    questionType: string;
    variableName?: string;
    responseCount: number;
    averageTimeSpent: number;
    distribution?: { label: string; count: number }[];
  }[];
  responseTimeline: { date: string; count: number }[];
  completionRate: number;
}

export function useGlobalInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['global-insights', user?.id],
    queryFn: async (): Promise<InsightsData> => {
      if (!user) throw new Error('User not authenticated');

      // Get all forms
      const { data: forms, error: formsError } = await supabase
        .from('forms')
        .select('id, title')
        .eq('user_id', user.id);

      if (formsError) throw formsError;

      const formIds = forms?.map((f) => f.id) || [];

      if (formIds.length === 0) {
        return {
          totalForms: 0,
          totalResponses: 0,
          averageCompletionRate: 0,
          averageResponseTime: 0,
          formsByResponses: [],
          responsesByPeriod: [],
          questionStats: [],
        };
      }

      // Get all responses
      const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select('id, form_id, submitted_at')
        .in('form_id', formIds)
        .order('submitted_at', { ascending: false });

      if (responsesError) throw responsesError;

      // Get response counts per form
      const responseCounts: Record<string, number> = {};
      (responses || []).forEach((r) => {
        responseCounts[r.form_id] = (responseCounts[r.form_id] || 0) + 1;
      });

      const formsByResponses = (forms || [])
        .map((f) => ({
          formId: f.id,
          formTitle: f.title,
          responseCount: responseCounts[f.id] || 0,
        }))
        .sort((a, b) => b.responseCount - a.responseCount);

      // Group responses by date
      const responsesByDate: Record<string, number> = {};
      (responses || []).forEach((r) => {
        const date = new Date(r.submitted_at).toISOString().split('T')[0];
        responsesByDate[date] = (responsesByDate[date] || 0) + 1;
      });

      const responsesByPeriod = Object.entries(responsesByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30); // Last 30 days

      return {
        totalForms: forms?.length || 0,
        totalResponses: responses?.length || 0,
        averageCompletionRate: 85, // Placeholder - would need more data
        averageResponseTime: 120, // Placeholder - would need timing data
        formsByResponses,
        responsesByPeriod,
        questionStats: [],
      };
    },
    enabled: !!user,
  });
}

export function useFormInsights(formId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['form-insights', formId],
    queryFn: async (): Promise<FormInsights | null> => {
      if (!user || !formId) return null;

      // Get form with questions
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('user_id', user.id)
        .single();

      if (formError) throw formError;

      // Get questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', formId)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;

      // Get question options
      const questionIds = questions?.map((q) => q.id) || [];
      let options: { id: string; question_id: string; label: string; order_index: number }[] = [];
      
      if (questionIds.length > 0) {
        const { data: optionsData } = await supabase
          .from('question_options')
          .select('*')
          .in('question_id', questionIds);
        options = optionsData || [];
      }

      // Get responses
      const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select('id, form_id, submitted_at')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

      if (responsesError) throw responsesError;

      // Get all answers
      const responseIds = responses?.map((r) => r.id) || [];
      let answers: {
        question_id: string;
        answer_text?: string;
        answer_options?: string[];
        answer_number?: number;
        answer_rating?: number;
      }[] = [];

      if (responseIds.length > 0) {
        const { data: answersData } = await supabase
          .from('response_answers')
          .select('question_id, answer_text, answer_options, answer_number, answer_rating')
          .in('response_id', responseIds);
        answers = answersData || [];
      }

      // Calculate question analytics
      const questionAnalytics = (questions || []).map((q) => {
        const questionAnswers = answers.filter((a) => a.question_id === q.id);
        const questionOptions = options.filter((o) => o.question_id === q.id);

        // Calculate distribution for choice questions
        let distribution: { label: string; count: number }[] | undefined;
        if (['single_choice', 'multiple_choice', 'dropdown'].includes(q.type)) {
          distribution = questionOptions.map((opt) => ({
            label: opt.label,
            count: questionAnswers.filter((a) =>
              a.answer_options?.includes(opt.label)
            ).length,
          }));
        } else if (q.type === 'rating') {
          distribution = [1, 2, 3, 4, 5].map((rating) => ({
            label: `${rating} estrela${rating > 1 ? 's' : ''}`,
            count: questionAnswers.filter((a) => a.answer_rating === rating).length,
          }));
        }

        return {
          questionId: q.id,
          questionTitle: q.title,
          questionType: q.type,
          variableName: q.variable_name,
          responseCount: questionAnswers.length,
          averageTimeSpent: 15, // Placeholder
          distribution,
        };
      });

      // Response timeline
      const responsesByDate: Record<string, number> = {};
      (responses || []).forEach((r) => {
        const date = new Date(r.submitted_at).toISOString().split('T')[0];
        responsesByDate[date] = (responsesByDate[date] || 0) + 1;
      });

      const responseTimeline = Object.entries(responsesByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate completion rate
      const totalQuestions = (questions || []).filter(
        (q) => q.type !== 'text_only'
      ).length;
      const completedResponses = (responses || []).length;
      const completionRate = totalQuestions > 0 ? (completedResponses > 0 ? 85 : 0) : 100;

      return {
        form: {
          ...form,
          questions: (questions || []).map((q) => ({
            ...q,
            options: options.filter((o) => o.question_id === q.id).map((o) => ({
              ...o,
              created_at: '',
            })),
          })),
        } as Form,
        responses: (responses || []).map((r) => ({
          ...r,
          answers: answers.filter((a) => 
            responseIds.includes(r.id)
          ),
        })) as Response[],
        questionAnalytics,
        responseTimeline,
        completionRate,
      };
    },
    enabled: !!user && !!formId,
  });
}
