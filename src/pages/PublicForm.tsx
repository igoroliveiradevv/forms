import { useParams } from 'react-router-dom';
import { usePublicForm } from '@/hooks/usePublicForm';
import { useSubmitResponse } from '@/hooks/useResponses';
import { ConversationalForm } from '@/components/chat/ConversationalForm';
import { SimpleForm } from '@/components/form/SimpleForm';
import { Skeleton } from '@/components/ui/skeleton';
import { XCircle } from 'lucide-react';
import { useCallback, useRef } from 'react';

export default function PublicForm() {
  const { slug } = useParams<{ slug: string }>();
  const { data: form, isLoading, error } = usePublicForm(slug);
  const submitResponse = useSubmitResponse();

  const formRef = useRef(form);
  formRef.current = form;

  const submitRef = useRef(submitResponse);
  submitRef.current = submitResponse;

  const handleSubmit = useCallback(async (answers: Array<{
    question_id: string;
    answer_text?: string;
    answer_options?: string[];
    answer_number?: number;
    answer_date?: string;
    answer_rating?: number;
  }>) => {
    const currentForm = formRef.current;
    if (!currentForm) return;

    await submitRef.current.mutateAsync({
      formId: currentForm.id,
      answers,
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <XCircle className="mb-4 h-16 w-16 text-destructive" />
        <h1 className="mb-2 text-2xl font-bold">Formulário não encontrado</h1>
        <p className="text-muted-foreground">
          Este formulário não existe ou foi desativado.
        </p>
      </div>
    );
  }

  if (form.form_type === 'simple') {
    return (
      <SimpleForm
        form={form}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <ConversationalForm
      form={form}
      onSubmit={handleSubmit}
      isSubmitting={submitResponse.isPending}
    />
  );
}
