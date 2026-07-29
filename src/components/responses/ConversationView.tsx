import { Form, Response, Question } from '@/types/form';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationViewProps {
  form: Form;
  response: Response;
}

export function ConversationView({ form, response }: ConversationViewProps) {
  const questions = form.questions || [];

  const getAnswerDisplay = (question: Question): string | null => {
    const answer = response.answers?.find((a) => a.question_id === question.id);
    if (!answer) return null;

    switch (question.type) {
      case 'short_text':
      case 'long_text':
      case 'email':
        return answer.answer_text || null;
      case 'number':
        return answer.answer_number?.toString() || null;
      case 'date':
        return answer.answer_date
          ? format(new Date(answer.answer_date), 'dd/MM/yyyy', { locale: ptBR })
          : null;
      case 'rating':
        return answer.answer_rating ? '⭐'.repeat(answer.answer_rating) : null;
      case 'single_choice':
      case 'multiple_choice':
      case 'dropdown':
        if (answer.answer_options?.length) {
          return answer.answer_options.join(', ');
        }
        return answer.answer_text || null;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={form.persona_avatar_url} />
              <AvatarFallback className="bg-primary/10 text-xs">
                {form.persona_name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">{form.persona_name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {format(new Date(response.submitted_at), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {/* Welcome message */}
            {form.description && (
              <ChatMessage
                content={form.description}
                isPersona
                personaName={form.persona_name}
                personaAvatar={form.persona_avatar_url}
                personaBubbleColor={form.persona_bubble_color}
                textColor={form.text_color}
              />
            )}

            {/* Questions and answers */}
            {questions.map((question) => {
              const answerDisplay = getAnswerDisplay(question);

              return (
                <div key={question.id} className="space-y-3">
                  {/* Persona's question/message */}
                  <ChatMessage
                    content={question.title}
                    isPersona
                    personaName={form.persona_name}
                    personaAvatar={form.persona_avatar_url}
                    personaBubbleColor={form.persona_bubble_color}
                    textColor={form.text_color}
                  />

                  {/* User's answer (only if not text_only) */}
                  {question.type !== 'text_only' && answerDisplay && (
                    <ChatMessage
                      content={answerDisplay}
                      isPersona={false}
                      userBubbleColor={form.user_bubble_color}
                    />
                  )}
                </div>
              );
            })}

            {/* Thank you message */}
            <ChatMessage
              content={form.thank_you_message || 'Obrigado por responder!'}
              isPersona
              personaName={form.persona_name}
              personaAvatar={form.persona_avatar_url}
              personaBubbleColor={form.persona_bubble_color}
              textColor={form.text_color}
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
