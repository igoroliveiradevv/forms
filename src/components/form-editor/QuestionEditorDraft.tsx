import { useState } from 'react';
import { QUESTION_TYPE_LABELS, QuestionType } from '@/types/form';
import { QuestionDraft, isValidVariableName } from '@/hooks/useFormContentDraft';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { ChevronDown, GripVertical, Plus, Trash2, X, MessageSquare, HelpCircle, Variable, Timer, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionEditorDraftProps {
  question: QuestionDraft;
  index: number;
  onUpdate: (updates: Partial<Omit<QuestionDraft, 'id' | 'options'>>) => void;
  onDelete: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionId: string, label: string) => void;
  onDeleteOption: (optionId: string) => void;
  isVariableNameUsed?: (name: string) => boolean;
  dragHandleProps?: Record<string, unknown>;
}

export function QuestionEditorDraft({
  question,
  index: _index,
  onUpdate,
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  isVariableNameUsed,
  dragHandleProps,
}: QuestionEditorDraftProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [variableError, setVariableError] = useState<string | null>(null);

  const needsOptions = ['single_choice', 'multiple_choice', 'dropdown'].includes(question.type);
  const isTextOnly = question.type === 'text_only';
  const isDelay = question.type === 'delay';
  const isEndForm = question.type === 'end_form';
  const isSpecialBlock = isTextOnly || isDelay || isEndForm;
  const canHaveVariable = !isSpecialBlock;

  // Get visible options (excluding deleted)
  const visibleOptions = question.options.filter((o) => !o.isDeleted);

  const handleVariableNameChange = (value: string) => {
    const trimmedValue = value.trim().toLowerCase().replace(/\s+/g, '_');
    
    // Validate format
    if (trimmedValue && !isValidVariableName(trimmedValue)) {
      setVariableError('Use apenas letras, números e underscore. Deve começar com letra ou underscore.');
      return;
    }

    // Check for duplicates
    if (trimmedValue && isVariableNameUsed?.(trimmedValue)) {
      setVariableError('Esta variável já está sendo usada por outra pergunta.');
      return;
    }

    setVariableError(null);
    onUpdate({ variable_name: trimmedValue || undefined });
  };

  return (
    <Card className="border shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center gap-3 p-4 hover:bg-muted/50">
            <div
              {...(dragHandleProps || {})}
              className="cursor-grab active:cursor-grabbing touch-none"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              {isTextOnly ? (
                <MessageSquare className="h-4 w-4 text-primary" />
              ) : isDelay ? (
                <Timer className="h-4 w-4 text-orange-500" />
              ) : isEndForm ? (
                <Flag className="h-4 w-4 text-green-600" />
              ) : (
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">
                  {isDelay
                    ? `Delay: ${question.delay_seconds ?? 2}s`
                    : isEndForm
                    ? question.title || 'Finalizar Formulário'
                    : question.title}
                </span>
                {question.is_required && !isSpecialBlock && (
                  <Badge variant="secondary" className="text-xs">
                    Obrigatório
                  </Badge>
                )}
                {isTextOnly && (
                  <Badge variant="outline" className="text-xs">
                    Mensagem
                  </Badge>
                )}
                {isDelay && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                    Delay
                  </Badge>
                )}
                {isEndForm && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    Finalização
                  </Badge>
                )}
                {question.variable_name && (
                  <Badge variant="default" className="text-xs font-mono">
                    [[{question.variable_name}]]
                  </Badge>
                )}
                {question.isNew && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Novo
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
              {/* Delay block settings */}
              {isDelay && (
                <div className="space-y-2">
                  <Label>Tempo de espera (segundos)</Label>
                  <Input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={question.delay_seconds ?? 2}
                    onChange={(e) => onUpdate({ delay_seconds: parseFloat(e.target.value) || 2 })}
                    placeholder="2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo 0.5s, máximo 10s. Simula o tempo de digitação.
                  </p>
                </div>
              )}

              {/* End form block settings */}
              {isEndForm && (
                <div className="space-y-2">
                  <Label>Mensagem final (opcional)</Label>
                  <Input
                    value={question.title === 'Finalizar Formulário' ? '' : question.title}
                    onChange={(e) => onUpdate({ title: e.target.value || 'Finalizar Formulário' })}
                    placeholder="Obrigado por responder!"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se vazia, usará a mensagem de agradecimento padrão do formulário.
                  </p>
                </div>
              )}

              {/* Question Title */}
              {!isDelay && !isEndForm && (
                <div className="space-y-2">
                  <Label>{isTextOnly ? 'Texto da mensagem' : 'Título da pergunta'}</Label>
                  <Input
                    value={question.title}
                    onChange={(e) => onUpdate({ title: e.target.value })}
                    placeholder={isTextOnly ? 'Digite a mensagem da persona...' : 'Digite a pergunta'}
                  />
                </div>
              )}

              {/* Question Description - hide for text_only, delay, end_form */}
              {!isSpecialBlock && (
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={question.description || ''}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Adicione uma descrição"
                  />
                </div>
              )}

              {/* Question Type - hide for special blocks */}
              {!isSpecialBlock && (
                <div className="space-y-2">
                  <Label>Tipo de campo</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value) => onUpdate({ type: value as QuestionType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {Object.entries(QUESTION_TYPE_LABELS)
                        .filter(([type]) => !['delay', 'end_form'].includes(type))
                        .map(([type, label]) => (
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
                    {visibleOptions.map((option, optIndex) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Input
                          value={option.label}
                          onChange={(e) => onUpdateOption(option.id, e.target.value)}
                          placeholder={`Opção ${optIndex + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteOption(option.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddOption}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar opção
                    </Button>
                  </div>
                </div>
              )}

              {/* Variable Name - only for questions that can capture data */}
              {canHaveVariable && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Variable className="h-4 w-4 text-muted-foreground" />
                    <Label>Salvar resposta em variável (opcional)</Label>
                  </div>
                  <Input
                    value={question.variable_name || ''}
                    onChange={(e) => handleVariableNameChange(e.target.value)}
                    placeholder="Ex: nome, email, cidade"
                    className={cn(variableError && 'border-destructive')}
                  />
                  {variableError ? (
                    <p className="text-xs text-destructive">{variableError}</p>
                  ) : question.variable_name ? (
                    <p className="text-xs text-muted-foreground">
                      Use <code className="rounded bg-muted px-1 text-primary">[[{question.variable_name}]]</code> em mensagens para inserir esta resposta
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Apenas letras, números e underscore. Sem espaços.
                    </p>
                  )}
                </div>
              )}

              {/* Required toggle - hide for special blocks */}
              {!isSpecialBlock && (
                <div className="flex items-center justify-between">
                  <Label>Campo obrigatório</Label>
                  <Switch
                    checked={question.is_required}
                    onCheckedChange={(checked) => onUpdate({ is_required: checked })}
                  />
                </div>
              )}

              {/* Delete button */}
              <div className="flex justify-end pt-2">
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir {isTextOnly ? 'mensagem' : isDelay ? 'delay' : isEndForm ? 'finalização' : 'pergunta'}
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
