import { useState } from 'react';
import { Question, QUESTION_TYPE_LABELS, QuestionType, QuestionOption } from '@/types/form';
import { useForm } from '@/hooks/useForms';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DebouncedInput } from '@/components/ui/debounced-input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, GripVertical, Plus, Trash2, X, MessageSquare, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionEditorProps {
  question: Question;
  formId: string;
  index: number;
  onDelete: () => void;
}

export function QuestionEditor({ question, formId, index, onDelete }: QuestionEditorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { updateQuestion, addQuestionOption, updateQuestionOption, deleteQuestionOption } =
    useForm(formId);

  const needsOptions = ['single_choice', 'multiple_choice', 'dropdown'].includes(question.type);
  const isTextOnly = question.type === 'text_only';

  const handleAddOption = async () => {
    const orderIndex = question.options?.length || 0;
    await addQuestionOption.mutateAsync({
      question_id: question.id,
      label: `Opção ${orderIndex + 1}`,
      order_index: orderIndex,
    });
  };

  const handleUpdateOption = (optionId: string, label: string) => {
    updateQuestionOption.mutate({ id: optionId, label });
  };

  const handleDeleteOption = async (optionId: string) => {
    await deleteQuestionOption.mutateAsync(optionId);
  };

  return (
    <Card className="border shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center gap-3 p-4 hover:bg-muted/50">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              {isTextOnly ? (
                <MessageSquare className="h-4 w-4 text-primary" />
              ) : (
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{question.title}</span>
                {question.is_required && !isTextOnly && (
                  <Badge variant="secondary" className="text-xs">
                    Obrigatório
                  </Badge>
                )}
                {isTextOnly && (
                  <Badge variant="outline" className="text-xs">
                    Mensagem
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {QUESTION_TYPE_LABELS[question.type]}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="border-t pt-4">
            <div className="space-y-4">
              {/* Question Title */}
              <div className="space-y-2">
                <Label>{isTextOnly ? 'Texto da mensagem' : 'Título da pergunta'}</Label>
                <DebouncedInput
                  value={question.title}
                  onChange={(value) =>
                    updateQuestion.mutate({ id: question.id, title: value })
                  }
                  placeholder={isTextOnly ? 'Digite a mensagem da persona...' : 'Digite a pergunta'}
                />
              </div>

              {/* Question Description - hide for text_only */}
              {!isTextOnly && (
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <DebouncedInput
                    value={question.description || ''}
                    onChange={(value) =>
                      updateQuestion.mutate({ id: question.id, description: value })
                    }
                    placeholder="Adicione uma descrição"
                  />
                </div>
              )}

              {/* Question Type - hide for text_only */}
              {!isTextOnly && (
                <div className="space-y-2">
                  <Label>Tipo de campo</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) =>
                      updateQuestion.mutate({ id: question.id, type: value as QuestionType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {Object.entries(QUESTION_TYPE_LABELS).map(([type, label]) => (
                        <SelectItem key={type} value={type}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Options for selection types */}
              {needsOptions && (
                <div className="space-y-2">
                  <Label>Opções</Label>
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <DebouncedInput
                          value={option.label}
                          onChange={(value) => handleUpdateOption(option.id, value)}
                          placeholder={`Opção ${optIndex + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteOption(option.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddOption}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar opção
                    </Button>
                  </div>
                </div>
              )}

              {/* Required toggle - hide for text_only */}
              {!isTextOnly && (
                <div className="flex items-center justify-between">
                  <Label>Campo obrigatório</Label>
                  <Switch
                    checked={question.is_required}
                    onCheckedChange={(checked) =>
                      updateQuestion.mutate({ id: question.id, is_required: checked })
                    }
                  />
                </div>
              )}

              {/* Delete button */}
              <div className="flex justify-end pt-2">
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir {isTextOnly ? 'mensagem' : 'pergunta'}
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
