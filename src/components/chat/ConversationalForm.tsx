import { useEffect, useRef } from 'react';
import { Form } from '@/types/form';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConversationAnswer, useConversationalFlow } from './useConversationalFlow';

const NON_INTERACTIVE_TYPES = new Set(['text_only', 'delay', 'end_form']);

interface ConversationalFormProps {
  form: Form;
  onSubmit: (answers: ConversationAnswer[]) => Promise<void>;
  isSubmitting?: boolean;
  embedded?: boolean;
  conversationKey?: string;
  initialTypingDelayMs?: number;
}

export function ConversationalForm({
  form,
  onSubmit,
  isSubmitting,
  embedded = false,
  conversationKey,
  initialTypingDelayMs,
}: ConversationalFormProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, currentQuestion, isTyping, isCompleted, handleAnswer } = useConversationalFlow({
    form,
    onSubmit,
    conversationKey: conversationKey ?? form.id,
    initialTypingDelayMs,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [currentQuestion, isCompleted, isTyping, messages]);

  const getBackgroundStyle = () => {
    if (form.background_type === 'gradient') {
      return `linear-gradient(${form.background_gradient_direction || 'to bottom'}, ${form.background_gradient_start || '#ffffff'}, ${form.background_gradient_end || '#f3f4f6'})`;
    }
    return form.background_color || '#ffffff';
  };

  return (
    <div
      className={cn('flex h-full flex-col', embedded ? 'min-h-[480px]' : 'min-h-screen')}
      style={{
        background: getBackgroundStyle(),
        fontFamily: form.font_family,
      }}
    >
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Avatar className="h-10 w-10">
            <AvatarImage src={form.persona_avatar_url} />
            <AvatarFallback className="bg-primary/10">
              {form.persona_name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold" style={{ color: form.text_color }}>
              {form.persona_name || 'Assistente'}
            </h1>
            <p className="text-xs text-muted-foreground">{form.title}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              isPersona={message.isPersona}
              personaName={form.persona_name}
              personaAvatar={form.persona_avatar_url}
              personaBubbleColor={form.persona_bubble_color}
              userBubbleColor={form.user_bubble_color}
              textColor={form.text_color}
              animate
            />
          ))}

          {isTyping && (
            <TypingIndicator
              personaName={form.persona_name}
              personaAvatar={form.persona_avatar_url}
              bubbleColor={form.persona_bubble_color}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {!isCompleted && currentQuestion && !NON_INTERACTIVE_TYPES.has(currentQuestion.type) && (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t p-4">
          <div className="max-w-2xl mx-auto">
            <ChatInput
              question={currentQuestion}
              onSubmit={handleAnswer}
              buttonColor={form.button_color}
              disabled={isTyping || isSubmitting}
            />
            {currentQuestion.is_required && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                * Campo obrigatório
              </p>
            )}
          </div>
        </div>
      )}

      {isCompleted && !isTyping && (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t p-6">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3" style={{ color: form.button_color }} />
            <p className="text-muted-foreground">Suas respostas foram enviadas com sucesso!</p>
          </div>
        </div>
      )}
    </div>
  );
}
