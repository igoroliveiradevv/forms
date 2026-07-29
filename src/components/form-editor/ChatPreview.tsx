import { useMemo } from 'react';
import { Form } from '@/types/form';
import { ConversationalForm } from '@/components/chat/ConversationalForm';

interface ChatPreviewProps {
  form: Form;
}

const NOOP_SUBMIT = async () => undefined;

export function ChatPreview({ form }: ChatPreviewProps) {
  const conversationKey = useMemo(
    () =>
      JSON.stringify({
        title: form.title,
        description: form.description,
        thank_you_message: form.thank_you_message,
        persona_name: form.persona_name,
        questions: (form.questions || []).map((question) => ({
          id: question.id,
          type: question.type,
          title: question.title,
          description: question.description,
          order_index: question.order_index,
          variable_name: question.variable_name,
          settings: question.settings,
          options: (question.options || []).map((option) => ({
            id: option.id,
            label: option.label,
            order_index: option.order_index,
          })),
        })),
      }),
    [form]
  );

  return (
    <div className="overflow-hidden rounded-lg border">
      <ConversationalForm
        form={form}
        onSubmit={NOOP_SUBMIT}
        embedded
        conversationKey={conversationKey}
        initialTypingDelayMs={0}
      />
    </div>
  );
}
