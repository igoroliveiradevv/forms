import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  BarChart3, 
  ExternalLink, 
  MoreVertical,
  Pencil,
  Palette,
  Trash2,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useForms } from '@/hooks/useForms';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Form, FormType } from '@/types/form';
import { MessageSquare, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const formTypeOptions: { type: FormType; title: string; description: string; icon: typeof MessageSquare }[] = [
  {
    type: 'conversational',
    title: 'Formulário com Persona',
    description: 'Experiência de chat com persona personalizável, delays inteligentes e blocos especiais. Ideal para engajamento.',
    icon: MessageSquare,
  },
  {
    type: 'simple',
    title: 'Formulário Simples',
    description: 'Layout tradicional com todas as perguntas visíveis de uma vez. Estilo Google Forms, direto e objetivo.',
    icon: FileText,
  },
];

export default function Dashboard() {
  const { forms, isLoading, createForm, deleteForm, updateForm } = useForms();
  const navigate = useNavigate();
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [showTypeDialog, setShowTypeDialog] = useState(false);

  const handleCreateForm = async (formType: FormType) => {
    setShowTypeDialog(false);
    const result = await createForm.mutateAsync({ form_type: formType });
    if (result) {
      navigate(`/dashboard/forms/${result.id}/edit`);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/form/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado para a área de transferência!' });
  };

  const handleToggleActive = async (form: Form) => {
    await updateForm.mutateAsync({
      id: form.id,
      is_active: !form.is_active,
    });
    toast({ 
      title: form.is_active ? 'Formulário desativado' : 'Formulário ativado' 
    });
  };

  const handleDeleteForm = async () => {
    if (formToDelete) {
      await deleteForm.mutateAsync(formToDelete.id);
      setFormToDelete(null);
    }
  };

  const totalResponses = forms.reduce((acc, form) => acc + (form.response_count || 0), 0);
  const activeForms = forms.filter((f) => f.is_active && !f.is_draft).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Gerencie seus formulários e visualize as respostas
            </p>
          </div>
          <Button onClick={() => setShowTypeDialog(true)} disabled={createForm.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Formulário
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Formulários
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Formulários Ativos
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeForms}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Respostas
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResponses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Forms List */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Seus Formulários</h2>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : forms.length === 0 ? (
            <Card className="py-12 text-center">
              <CardContent>
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">Nenhum formulário ainda</h3>
                <p className="mb-4 text-muted-foreground">
                  Crie seu primeiro formulário para começar a coletar respostas
                </p>
                <Button onClick={() => setShowTypeDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Formulário
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {forms.map((form) => (
                <Card key={form.id} className="group relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-8">
                        <CardTitle className="line-clamp-1 text-lg">
                          {form.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {form.description || 'Sem descrição'}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/forms/${form.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar formulário
                            </Link>
                          </DropdownMenuItem>
                          {form.form_type !== 'simple' && (
                            <DropdownMenuItem asChild>
                              <Link to={`/dashboard/forms/${form.id}/design`}>
                                <Palette className="mr-2 h-4 w-4" />
                                Editar design
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/forms/${form.id}/responses`}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Ver Respostas
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(form.slug)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar Link
                          </DropdownMenuItem>
                          {!form.is_draft && (
                            <DropdownMenuItem asChild>
                              <a 
                                href={`/form/${form.slug}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Visualizar
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleActive(form)}>
                            {form.is_active ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setFormToDelete(form)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex gap-2 pt-2">
                      {form.form_type === 'simple' ? (
                        <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">Simples</Badge>
                      ) : (
                        <Badge variant="outline" className="border-primary/30 text-primary">Persona</Badge>
                      )}
                      {form.is_draft && (
                        <Badge variant="secondary">Rascunho</Badge>
                      )}
                      {!form.is_active && !form.is_draft && (
                        <Badge variant="outline">Inativo</Badge>
                      )}
                      {form.is_active && !form.is_draft && (
                        <Badge className="bg-success text-success-foreground">Ativo</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{form.response_count || 0} respostas</span>
                      <span>
                        {new Date(form.updated_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Form Type Dialog */}
      <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Novo Formulário</DialogTitle>
            <DialogDescription>
              Escolha o tipo de formulário que deseja criar:
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {formTypeOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handleCreateForm(option.type)}
                className={cn(
                  "group flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:shadow-md",
                  createForm.isPending && "pointer-events-none opacity-60"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                  <option.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold">{option.title}</span>
                    {option.type === 'conversational' && (
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!formToDelete} onOpenChange={() => setFormToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir formulário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O formulário "{formToDelete?.title}" 
              e todas as suas respostas serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteForm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
