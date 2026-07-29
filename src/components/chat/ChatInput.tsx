import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Send, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Question } from '@/types/form';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  question: Question;
  onSubmit: (value: string | string[] | number | Date) => void;
  buttonColor?: string;
  disabled?: boolean;
}

export function ChatInput({ question, onSubmit, buttonColor = '#3b82f6', disabled }: ChatInputProps) {
  const [value, setValue] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [rating, setRating] = useState<number>(0);

  const handleSubmit = () => {
    if (disabled) return;

    switch (question.type) {
      case 'single_choice':
      case 'dropdown':
        if (value) onSubmit(value);
        break;
      case 'multiple_choice':
        if (selectedOptions.length > 0) onSubmit(selectedOptions);
        break;
      case 'date':
        if (selectedDate) onSubmit(selectedDate);
        break;
      case 'rating':
        if (rating > 0) onSubmit(rating);
        break;
      case 'number':
        if (value) onSubmit(parseFloat(value));
        break;
      default:
        if (value.trim()) onSubmit(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  // Short text or email
  if (question.type === 'short_text' || question.type === 'email') {
    return (
      <div className="flex gap-2">
        <Input
          type={question.type === 'email' ? 'email' : 'text'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={question.type === 'email' ? 'Digite seu e-mail' : 'Digite sua resposta'}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          style={{ backgroundColor: buttonColor }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Long text
  if (question.type === 'long_text') {
    return (
      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Digite sua resposta"
          disabled={disabled}
          rows={3}
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="w-full"
          style={{ backgroundColor: buttonColor }}
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar
        </Button>
      </div>
    );
  }

  // Number
  if (question.type === 'number') {
    return (
      <div className="flex gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite um número"
          disabled={disabled}
          className="flex-1"
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !value}
          style={{ backgroundColor: buttonColor }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Single choice
  if (question.type === 'single_choice') {
    return (
      <div className="space-y-3">
        <RadioGroup value={value} onValueChange={setValue}>
          <div className="flex flex-wrap gap-2">
            {question.options?.map((option) => (
              <Label
                key={option.id}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-colors',
                  value === option.label
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted'
                )}
              >
                <RadioGroupItem value={option.label} className="sr-only" />
                {option.label}
              </Label>
            ))}
          </div>
        </RadioGroup>
        <Button
          onClick={handleSubmit}
          disabled={disabled || !value}
          className="w-full"
          style={{ backgroundColor: buttonColor }}
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar
        </Button>
      </div>
    );
  }

  // Multiple choice
  if (question.type === 'multiple_choice') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {question.options?.map((option) => (
            <Label
              key={option.id}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-colors',
                selectedOptions.includes(option.id)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              )}
            >
              <Checkbox
                checked={selectedOptions.includes(option.id)}
                onCheckedChange={() => toggleOption(option.id)}
                className="sr-only"
              />
              {option.label}
            </Label>
          ))}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={disabled || selectedOptions.length === 0}
          className="w-full"
          style={{ backgroundColor: buttonColor }}
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar
        </Button>
      </div>
    );
  }

  // Dropdown
  if (question.type === 'dropdown') {
    return (
      <div className="flex gap-2">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {question.options?.map((option) => (
              <SelectItem key={option.id} value={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleSubmit}
          disabled={disabled || !value}
          style={{ backgroundColor: buttonColor }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Date
  if (question.type === 'date') {
    return (
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex-1 justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
        <Button
          onClick={handleSubmit}
          disabled={disabled || !selectedDate}
          style={{ backgroundColor: buttonColor }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Rating
  if (question.type === 'rating') {
    return (
      <div className="space-y-3">
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
              disabled={disabled}
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
        <Button
          onClick={handleSubmit}
          disabled={disabled || rating === 0}
          className="w-full"
          style={{ backgroundColor: buttonColor }}
        >
          <Send className="mr-2 h-4 w-4" />
          Enviar
        </Button>
      </div>
    );
  }

  return null;
}
