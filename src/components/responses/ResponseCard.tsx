import { Form, Response, Question } from '@/types/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponseCardProps {
  form: Form;
  response: Response;
}

function getResponseValue(question: Question, response: Response): string | null {
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
}

export function ResponseCard({ form, response }: ResponseCardProps) {
  const questions = (form.questions || []).filter(
    (q) => q.type !== 'text_only' && q.type !== 'delay' && q.type !== 'end_form'
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">
              {format(new Date(response.submitted_at), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            #{response.id.slice(0, 8)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-5">
            {questions.map((question, index) => {
              const value = getResponseValue(question, response);
              return (
                <div key={question.id}>
                  <div className="mb-1.5 flex items-start gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}.
                    </span>
                    <Label className="text-sm font-medium leading-5">
                      {question.title}
                      {question.is_required && <span className="ml-0.5 text-destructive">*</span>}
                    </Label>
                  </div>
                  {question.description && (
                    <p className="mb-1.5 text-xs text-muted-foreground ml-6">
                      {question.description}
                    </p>
                  )}
                  <div className={cn(
                    "ml-6 rounded-lg border px-3 py-2 text-sm",
                    value ? "bg-muted/30" : "bg-muted/10 text-muted-foreground italic"
                  )}>
                    {value || 'Sem resposta'}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
