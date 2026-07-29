import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useForm, useForms } from '@/hooks/useForms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Copy, Eye, Save } from 'lucide-react';
import { PersonaEditor } from '@/components/form-editor/PersonaEditor';
import { ChatPreview } from '@/components/form-editor/ChatPreview';
import { Form } from '@/types/form';

// Design-related fields that can be edited
export interface FormDesignDraft {
  persona_name: string;
  persona_description?: string;
  persona_avatar_url?: string;
  persona_bubble_color: string;
  user_bubble_color: string;
  text_color: string;
  font_family: string;
  background_type: 'solid' | 'gradient';
  background_color: string;
  background_gradient_start?: string;
  background_gradient_end?: string;
  background_gradient_direction?: string;
}

// Extract design fields from form
function getDesignFromForm(form: Form): FormDesignDraft {
  return {
    persona_name: form.persona_name || 'Assistente',
    persona_description: form.persona_description,
    persona_avatar_url: form.persona_avatar_url,
    persona_bubble_color: form.persona_bubble_color || '#f3f4f6',
    user_bubble_color: form.user_bubble_color || '#3b82f6',
    text_color: form.text_color || '#1f2937',
    font_family: form.font_family || 'Inter',
    background_type: form.background_type || 'solid',
    background_color: form.background_color || '#ffffff',
    background_gradient_start: form.background_gradient_start,
    background_gradient_end: form.background_gradient_end,
    background_gradient_direction: form.background_gradient_direction,
  };
}

export default function FormDesignEditor() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { form, isLoading } = useForm(formId);
  const { updateForm } = useForms();
  const [isSaving, setIsSaving] = useState(false);
  
  // Draft state for preview - isolated from persisted data
  const [draft, setDraft] = useState<FormDesignDraft | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize draft from form when loaded
  useEffect(() => {
    if (form && !draft) {
      setDraft(getDesignFromForm(form));
    }
  }, [form, draft]);

  // Update a single field in the draft
  const updateDraft = useCallback((field: keyof FormDesignDraft, value: string) => {
    setDraft(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Update multiple fields at once
  const updateDraftMultiple = useCallback((updates: Partial<FormDesignDraft>) => {
    setDraft(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Reset draft to saved form state
  const resetDraft = useCallback(() => {
    if (form) {
      setDraft(getDesignFromForm(form));
      setHasUnsavedChanges(false);
    }
  }, [form]);

  // Save draft to database
  const handleSave = async () => {
    if (!form || !draft) return;
    setIsSaving(true);
    try {
      await updateForm.mutateAsync({
        id: form.id,
        ...draft,
      });
      setHasUnsavedChanges(false);
      toast({ title: 'Design salvo com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao salvar design', variant: 'destructive' });
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

  const handleGoToContentEditor = () => {
    navigate(`/dashboard/forms/${formId}/edit`);
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

  if (!form) {
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

  if (form.form_type === 'simple') {
    navigate(`/dashboard/forms/${formId}/edit`, { replace: true });
    return null;
  }

  // Create a merged form object for preview (form data + draft overrides)
  const previewForm: Form = draft ? { ...form, ...draft } : form;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{form.title}</h1>
              <p className="text-sm text-muted-foreground">
                Edição de Design
                {hasUnsavedChanges && (
                  <span className="ml-2 text-warning">• Alterações não salvas</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasUnsavedChanges && (
              <Button variant="outline" onClick={resetDraft}>
                Descartar
              </Button>
            )}
            <Button variant="outline" onClick={handleGoToContentEditor}>
              Editar Conteúdo
            </Button>
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar Link
            </Button>
            {!form.is_draft && form.is_active && (
              <Button variant="outline" asChild>
                <a href={`/form/${form.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </a>
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Design Editor */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editor Panel */}
          <div className="space-y-6">
            {draft && (
              <PersonaEditor 
                form={form}
                draft={draft}
                onUpdateDraft={updateDraft}
                onUpdateDraftMultiple={updateDraftMultiple}
              />
            )}
            
            {/* Bottom Save Button */}
            <div className="flex justify-end gap-2">
              {hasUnsavedChanges && (
                <Button variant="outline" onClick={resetDraft} size="lg">
                  Descartar Alterações
                </Button>
              )}
              <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges} size="lg">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Design'}
              </Button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Pré-visualização do Chat
                    {hasUnsavedChanges && (
                      <span className="ml-2 text-xs font-normal text-warning">
                        (preview com alterações não salvas)
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-auto rounded-b-lg">
                    <ChatPreview form={previewForm} />
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
