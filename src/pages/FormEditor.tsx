import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useForm } from '@/hooks/useForms';
import { useForms } from '@/hooks/useForms';
import { useFormContentDraft } from '@/hooks/useFormContentDraft';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Save,
  Eye,
  Copy,
  Plus,
  Palette,
  RotateCcw,
  BarChart3,
} from 'lucide-react';

import { ChatPreview } from '@/components/form-editor/ChatPreview';
import { SimpleFormPreview } from '@/components/form/SimpleFormPreview';
import { QUESTION_TYPE_LABELS, QuestionType, FormType } from '@/types/form';
import { supabase } from '@/integrations/supabase/client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableQuestionItem } from '@/components/form-editor/SortableQuestionItem';

export default function FormEditor() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { form, isLoading, refetch } = useForm(formId);
  const { updateForm } = useForms();
  const [isSaving, setIsSaving] = useState(false);

  // Use draft hook for local state management
  const {
    draft,
    hasUnsavedChanges,
    visibleQuestions,
    isVariableNameUsed,
    updateFormField,
    updateQuestion,
    addQuestion,
    deleteQuestion,
    reorderQuestions,
    addQuestionOption,
    updateQuestionOption,
    deleteQuestionOption,
    resetDraft,
    markAsSaved,
    getPreviewForm,
  } = useFormContentDraft(form);

  const formType: FormType = form?.form_type || 'conversational';
  const isSimple = formType === 'simple';

  const availableQuestionTypes = isSimple
    ? Object.entries(QUESTION_TYPE_LABELS).filter(
        ([type]) => !['text_only', 'delay', 'end_form'].includes(type)
      )
    : Object.entries(QUESTION_TYPE_LABELS);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = visibleQuestions.findIndex((q) => q.id === active.id);
    const newIndex = visibleQuestions.findIndex((q) => q.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = [...visibleQuestions];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);
    reorderQuestions(newOrder.map((q) => q.id));
  };

  // Warn user about unsaved changes when leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Save all changes to backend
  const handleSave = async () => {
    if (!form || !draft) return;
    setIsSaving(true);
    
    try {
      // 1. Update form fields
      await updateForm.mutateAsync({
        id: form.id,
        title: draft.title,
        description: draft.description,
        thank_you_message: draft.thank_you_message,
        is_active: draft.is_active,
        is_draft: false,
      });

      const normalizedActiveQuestions = draft.questions
        .filter((question) => !question.isDeleted)
        .sort((a, b) => a.order_index - b.order_index)
        .map((question, index) => ({ ...question, order_index: index }));

      const normalizedQuestionMap = new Map(
        normalizedActiveQuestions.map((question) => [question.id, question])
      );

      // 2. Process questions
      for (const originalQuestion of draft.questions) {
        if (originalQuestion.isDeleted) {
          if (!originalQuestion.id.startsWith('temp_')) {
            await supabase.from('questions').delete().eq('id', originalQuestion.id);
          }
          continue;
        }

        const question = normalizedQuestionMap.get(originalQuestion.id) ?? originalQuestion;

        if (question.isNew) {
          const { data: newQuestion, error: questionError } = await supabase
            .from('questions')
            .insert({
              form_id: form.id,
              type: question.type,
              title: question.title,
              description: question.description,
              is_required: question.is_required,
              order_index: question.order_index,
              variable_name: question.variable_name || null,
              settings: question.type === 'delay' ? { delay_seconds: question.delay_seconds ?? 2 } : {},
            })
            .select()
            .single();

          if (questionError) throw questionError;

          for (const option of question.options) {
            if (option.isDeleted) continue;
            await supabase.from('question_options').insert({
              question_id: newQuestion.id,
              label: option.label,
              order_index: option.order_index,
            });
          }
        } else {
          await supabase
            .from('questions')
            .update({
              type: question.type,
              title: question.title,
              description: question.description,
              is_required: question.is_required,
              order_index: question.order_index,
              variable_name: question.variable_name || null,
              settings: question.type === 'delay' ? { delay_seconds: question.delay_seconds ?? 2 } : {},
            })
            .eq('id', question.id);

          for (const option of question.options) {
            if (option.isDeleted) {
              if (!option.id.startsWith('temp_')) {
                await supabase.from('question_options').delete().eq('id', option.id);
              }
            } else if (option.isNew) {
              await supabase.from('question_options').insert({
                question_id: question.id,
                label: option.label,
                order_index: option.order_index,
              });
            } else {
              await supabase
                .from('question_options')
                .update({ label: option.label, order_index: option.order_index })
                .eq('id', option.id);
            }
          }
        }
      }

      const { data: freshForm } = await refetch();
      markAsSaved(freshForm ?? undefined);
      toast({ title: 'Formulário salvo com sucesso!' });
    } catch (error) {
      console.error('Error saving form:', error);
      toast({ title: 'Erro ao salvar formulário', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!form) return;
    const url = `${window.location.origin}/form/${form.slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado!' });
  };

  const handleAddQuestion = (type: QuestionType) => {
    addQuestion(type);
  };

  const handleGoToDesignEditor = () => {
    if (isSimple) return;
    if (hasUnsavedChanges) {
      const confirm = window.confirm('Você tem alterações não salvas. Deseja continuar sem salvar?');
      if (!confirm) return;
    }
    navigate(`/dashboard/forms/${formId}/design`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!form || !draft) {
    return (
      <DashboardLayout>
        <div className="py-12 text-center">
          <h2 className="text-xl font-semibold">Formulário não encontrado</h2>
          <Link to="/dashboard">
            <Button variant="link">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Get preview form with draft changes
  const previewForm = getPreviewForm();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (hasUnsavedChanges) {
                  const confirm = window.confirm('Você tem alterações não salvas. Deseja continuar sem salvar?');
                  if (!confirm) return;
                }
                navigate('/dashboard');
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{draft.title}</h1>
              <p className="text-sm text-muted-foreground">
                {form.is_draft ? 'Rascunho' : form.is_active ? 'Publicado' : 'Inativo'}
                {hasUnsavedChanges && (
                  <span className="ml-2 text-destructive">• Alterações não salvas</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasUnsavedChanges && (
              <Button variant="outline" onClick={resetDraft}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Descartar
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/dashboard/forms/${formId}/responses`)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Respostas
            </Button>
            {!isSimple && (
              <Button variant="outline" onClick={handleGoToDesignEditor}>
                <Palette className="mr-2 h-4 w-4" />
                Editar Design
              </Button>
            )}
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar Link
            </Button>
            {!form.is_draft && form.is_active && (
              <Button
                variant="outline"
                asChild
              >
                <a href={`/form/${form.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </a>
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Form Title & Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Formulário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={draft.title}
                    onChange={(e) => updateFormField('title', e.target.value)}
                    placeholder="Título do formulário"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mensagem Inicial (opcional)</Label>
                  <Textarea
                    value={draft.description || ''}
                    onChange={(e) => updateFormField('description', e.target.value)}
                    placeholder="Mensagem de boas-vindas que a persona irá enviar"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta mensagem será a primeira coisa que a persona diz
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isSimple ? 'Perguntas do Formulário' : 'Blocos da Conversa'}</CardTitle>
              </CardHeader>
              <CardContent>
                {visibleQuestions.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Nenhum{isSimple ? 'a pergunta' : ' bloco'} adicionado{isSimple ? '' : ' ainda'}.
                    <br />
                    {isSimple ? 'Adicione perguntas para criar seu formulário.' : 'Adicione mensagens e perguntas para criar a conversa.'}
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext
                      items={visibleQuestions.map((q) => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {visibleQuestions.map((question, index) => (
                          <SortableQuestionItem
                            key={question.id}
                            question={question}
                            index={index}
                            onUpdate={(updates) => updateQuestion(question.id, updates)}
                            onDelete={() => deleteQuestion(question.id)}
                            onAddOption={() => addQuestionOption(question.id)}
                            onUpdateOption={(optionId, label) =>
                              updateQuestionOption(question.id, optionId, label)
                            }
                            onDeleteOption={(optionId) =>
                              deleteQuestionOption(question.id, optionId)
                            }
                            isVariableNameUsed={(name) => isVariableNameUsed(name, question.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                <div className="mt-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar bloco
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-popover">
                      {availableQuestionTypes.map(([type, label]) => (
                        <DropdownMenuItem key={type} onClick={() => handleAddQuestion(type as QuestionType)}>
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Formulário Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que pessoas respondam ao formulário
                    </p>
                  </div>
                  <Switch
                    checked={draft.is_active}
                    onCheckedChange={(checked) => updateFormField('is_active', checked)}
                  />
                </div>

              </CardContent>
            </Card>

            {/* Bottom Save Button */}
            <div className="flex justify-end gap-2">
              {hasUnsavedChanges && (
                <Button variant="outline" onClick={resetDraft} size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Descartar Alterações
                </Button>
              )}
              <Button onClick={handleSave} disabled={isSaving} size="lg">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Formulário'}
              </Button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                <CardTitle className="text-lg">
                    {isSimple ? 'Pré-visualização' : 'Pré-visualização do Chat'}
                    {hasUnsavedChanges && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (preview com alterações não salvas)
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-auto rounded-b-lg">
                    {previewForm && (isSimple ? <SimpleFormPreview form={previewForm} /> : <ChatPreview form={previewForm} />)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
