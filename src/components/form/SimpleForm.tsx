import { useState } from 'react';
import { Form, Question } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send, Star, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConversationAnswer } from '@/components/chat/useConversationalFlow';

interface SimpleFormProps {
  form: Form;
  onSubmit: (answers: ConversationAnswer[]) => Promise<void>;
}

type FieldValue = string | string[] | number | Date | undefined;

export function SimpleForm({ form, onSubmit }: SimpleFormProps) {
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const visibleQuestions = (form.questions || [])
    .filter((q) => q.type !== 'text_only' && q.type !== 'delay' && q.type !== 'end_form')
    .sort((a, b) => a.order_index - b.order_index || a.created_at.localeCompare(b.created_at));

  const setValue = (questionId: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const answers: ConversationAnswer[] = [];

    for (const question of visibleQuestions) {
      const value = values[question.id];
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        if (question.is_required) {
          setSubmitting(false);
          return;
        }
        continue;
      }

      const answer: ConversationAnswer = { question_id: question.id };

      if (typeof value === 'string') {
        if (question.type === 'single_choice' || question.type === 'dropdown') {
          answer.answer_options = [value];
        } else {
          answer.answer_text = value;
        }
      } else if (Array.isArray(value)) {
        const labels = question.options
          ?.filter((o) => value.includes(o.id))
          .map((o) => o.label) || value;
        answer.answer_options = labels as string[];
      } else if (value instanceof Date) {
        answer.answer_date = value.toISOString().split('T')[0];
      } else {
        if (question.type === 'rating') {
          answer.answer_rating = value;
        } else {
          answer.answer_number = value;
        }
      }

      answers.push(answer);
    }

    await onSubmit(answers);
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="py-12">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
            <h2 className="mb-2 text-2xl font-bold">Obrigado por responder!</h2>
            <p className="text-muted-foreground">Suas respostas foram enviadas com sucesso.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card className="mb-6 border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{form.title}</CardTitle>
            {form.description && (
              <p className="text-muted-foreground">{form.description}</p>
            )}
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {visibleQuestions.map((question, index) => (
            <Card key={question.id} id={`q-${question.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                  <CardTitle className="text-base font-medium">
                    {question.title}
                    {question.is_required && <span className="ml-1 text-destructive">*</span>}
                  </CardTitle>
                </div>
                {question.description && (
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <QuestionField
                  question={question}
                  value={values[question.id]}
                  onChange={(v) => setValue(question.id, v)}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={handleSubmit} disabled={submitting}>
            <Send className="mr-2 h-4 w-4" />
            {submitting ? 'Enviando...' : 'Enviar Respostas'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
}) {
  const [dateOpen, setDateOpen] = useState(false);
  const [rating, setRating] = useState<number>(typeof value === 'number' ? value : 0);

  switch (question.type) {
    case 'short_text':
    case 'email':
      return (
        <Input
          type={question.type === 'email' ? 'email' : 'text'}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.type === 'email' ? 'seu@email.com' : 'Digite sua resposta'}
        />
      );

    case 'long_text':
      return (
        <Textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite sua resposta"
          rows={3}
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite um número"
        />
      );

    case 'single_choice':
      return (
        <RadioGroup
          value={typeof value === 'string' ? value : ''}
          onValueChange={onChange}
        >
          {question.options?.map((option) => (
            <div key={option.id} className="flex items-center gap-3 rounded-lg border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
              <RadioGroupItem value={option.label} id={`${question.id}-${option.id}`} />
              <Label htmlFor={`${question.id}-${option.id}`} className="flex-1 cursor-pointer font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case 'multiple_choice':
      return (
        <div className="space-y-2">
          {(question.options || []).map((option) => {
            const checked = Array.isArray(value) && value.includes(option.id);
            return (
              <div key={option.id} className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                checked && "border-primary bg-primary/5"
              )}>
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => {
                    const arr = Array.isArray(value) ? [...value] : [];
                    const idx = arr.indexOf(option.id);
                    onChange(idx >= 0 ? arr.filter((id) => id !== option.id) : [...arr, option.id]);
                  }}
                  id={`${question.id}-${option.id}`}
                />
                <Label htmlFor={`${question.id}-${option.id}`} className="flex-1 cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      );

    case 'dropdown':
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onValueChange={onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {question.options?.map((option) => (
              <SelectItem key={option.id} value={option.label}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'date':
      return (
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value instanceof Date ? format(value, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover" align="start">
            <Calendar
              mode="single"
              selected={value instanceof Date ? value : undefined}
              onSelect={(d) => { onChange(d); setDateOpen(false); }}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      );

    case 'rating':
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => { setRating(star); onChange(star); }}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                )}
              />
            </button>
          ))}
        </div>
      );

    default:
      return null;
  }
}
