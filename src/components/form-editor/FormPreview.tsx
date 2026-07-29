import { Form, Question } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FormPreviewProps {
  form: Form;
}

export function FormPreview({ form }: FormPreviewProps) {
  return (
    <div
      className="min-h-[400px] p-6"
      style={{
        backgroundColor: form.background_color,
        color: form.text_color,
      }}
    >
      {/* Logo */}
      {form.logo_url && (
        <div className="mb-6 flex justify-center">
          <img
            src={form.logo_url}
            alt="Logo"
            className="h-16 object-contain"
          />
        </div>
      )}

      {/* Title & Description */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{form.title}</h1>
        {form.description && (
          <p className="mt-2 opacity-80">{form.description}</p>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {form.questions?.map((question) => (
          <QuestionPreview
            key={question.id}
            question={question}
            buttonColor={form.button_color}
          />
        ))}
      </div>

      {/* Submit Button */}
      {form.questions && form.questions.length > 0 && (
        <div className="mt-8">
          <Button
            className="w-full"
            style={{ backgroundColor: form.button_color }}
          >
            Enviar Respostas
          </Button>
        </div>
      )}
    </div>
  );
}

interface QuestionPreviewProps {
  question: Question;
  buttonColor: string;
}

function QuestionPreview({ question, buttonColor }: QuestionPreviewProps) {
  const labelClasses = 'text-sm font-medium';

  return (
    <div className="space-y-2">
      <Label className={labelClasses}>
        {question.title}
        {question.is_required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {question.description && (
        <p className="text-sm opacity-70">{question.description}</p>
      )}

      {question.type === 'short_text' && (
        <Input placeholder="Sua resposta" disabled />
      )}

      {question.type === 'long_text' && (
        <Textarea placeholder="Sua resposta" disabled rows={4} />
      )}

      {question.type === 'number' && (
        <Input type="number" placeholder="0" disabled />
      )}

      {question.type === 'email' && (
        <Input type="email" placeholder="email@exemplo.com" disabled />
      )}

      {question.type === 'single_choice' && (
        <RadioGroup disabled>
          {question.options?.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {question.type === 'multiple_choice' && (
        <div className="space-y-2">
          {question.options?.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox id={option.id} disabled />
              <Label htmlFor={option.id} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      )}

      {question.type === 'dropdown' && (
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {question.options?.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {question.type === 'date' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Selecione uma data
            </Button>
          </PopoverTrigger>
        </Popover>
      )}

      {question.type === 'rating' && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              className="rounded p-1 transition-colors hover:bg-muted"
              disabled
            >
              <Star className="h-6 w-6" style={{ color: buttonColor }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
