import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useForm } from '@/hooks/useForms';
import { useResponses } from '@/hooks/useResponses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  ArrowLeft,
  Download,
  Trash2,
  BarChart3,
  FileText,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { Response, Question, QUESTION_TYPE_LABELS, FormType } from '@/types/form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ResponseCharts } from '@/components/responses/ResponseCharts';
import { ConversationView } from '@/components/responses/ConversationView';
import { ResponseCard } from '@/components/responses/ResponseCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FormResponses() {
  const { formId } = useParams<{ formId: string }>();
  const { form, isLoading: formLoading } = useForm(formId);
  const { responses, isLoading: responsesLoading, deleteResponse, responseCount } =
    useResponses(formId);
  const [responseToDelete, setResponseToDelete] = useState<Response | null>(null);
  const isSimple = form?.form_type === 'simple';
  const [activeTab, setActiveTab] = useState(isSimple ? 'responses' : 'conversations');

  const isLoading = formLoading || responsesLoading;

  const handleDeleteResponse = async () => {
    if (responseToDelete) {
      await deleteResponse.mutateAsync(responseToDelete.id);
      setResponseToDelete(null);
    }
  };

  const handleExportCSV = () => {
    if (!form || !responses.length) return;

    const headers = ['Data', ...(form.questions?.map((q) => q.title) || [])];
    const rows = responses.map((response) => {
      const date = format(new Date(response.submitted_at), 'dd/MM/yyyy HH:mm', {
        locale: ptBR,
      });
      const answers = form.questions?.map((question) => {
        const answer = response.answers?.find((a) => a.question_id === question.id);
        return getAnswerValue(answer, question);
      }) || [];
      return [date, ...answers];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${form.title}_respostas.csv`;
    link.click();
  };

  const handleExportJSON = () => {
    if (!form || !responses.length) return;

    const data = responses.map((response) => {
      const answers: Record<string, unknown> = {};
      form.questions?.forEach((question) => {
        const answer = response.answers?.find((a) => a.question_id === question.id);
        answers[question.title] = getAnswerValue(answer, question);
      });
      return {
        submitted_at: response.submitted_at,
        ...answers,
      };
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${form.title}_respostas.json`;
    link.click();
  };

  const getAnswerValue = (answer: Response['answers'] extends (infer T)[] ? T : never | undefined, question: Question): string => {
    if (!answer) return '-';

    switch (question.type) {
      case 'short_text':
      case 'long_text':
      case 'email':
        return answer.answer_text || '-';
      case 'number':
        return answer.answer_number?.toString() || '-';
      case 'date':
        return answer.answer_date
          ? format(new Date(answer.answer_date), 'dd/MM/yyyy', { locale: ptBR })
          : '-';
      case 'rating':
        return answer.answer_rating?.toString() || '-';
      case 'single_choice':
      case 'multiple_choice':
      case 'dropdown':
        if (answer.answer_options?.length) {
          return answer.answer_options.join(', ');
        }
        return answer.answer_text || '-';
      case 'text_only':
        return '-';
      default:
        return '-';
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{form.title}</h1>
              <p className="text-sm text-muted-foreground">
                {responseCount} {responseCount === 1 ? 'resposta' : 'respostas'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={responses.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleExportJSON}
              disabled={responses.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Respostas
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responseCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Perguntas
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{form.questions?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Última Resposta
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {responses.length > 0
                  ? format(new Date(responses[0].submitted_at), 'dd/MM', {
                      locale: ptBR,
                    })
                  : '-'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {isSimple ? (
              <TabsTrigger value="responses">
                <FileText className="mr-2 h-4 w-4" />
                Respostas
              </TabsTrigger>
            ) : (
              <TabsTrigger value="conversations">
                <MessageCircle className="mr-2 h-4 w-4" />
                Conversas
              </TabsTrigger>
            )}
            <TabsTrigger value="table">
              <FileText className="mr-2 h-4 w-4" />
              Tabela
            </TabsTrigger>
            <TabsTrigger value="charts">
              <BarChart3 className="mr-2 h-4 w-4" />
              Gráficos
            </TabsTrigger>
          </TabsList>

          {isSimple ? (
            <TabsContent value="responses" className="mt-6">
              {responses.length === 0 ? (
                <Card className="py-12 text-center">
                  <CardContent>
                    <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-medium">
                      Nenhuma resposta ainda
                    </h3>
                    <p className="text-muted-foreground">
                      Compartilhe o link do formulário para começar a receber respostas.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {responses.map((response) => (
                    <ResponseCard
                      key={response.id}
                      form={form}
                      response={response}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ) : (
            <TabsContent value="conversations" className="mt-6">
              {responses.length === 0 ? (
                <Card className="py-12 text-center">
                  <CardContent>
                    <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-medium">
                      Nenhuma conversa ainda
                    </h3>
                    <p className="text-muted-foreground">
                      Compartilhe o link do formulário para começar a receber
                      respostas.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {responses.map((response) => (
                    <ConversationView
                      key={response.id}
                      form={form}
                      response={response}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="table" className="mt-6">
            {responses.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-medium">
                    Nenhuma resposta ainda
                  </h3>
                  <p className="text-muted-foreground">
                    Compartilhe o link do formulário para começar a receber
                    respostas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Data</TableHead>
                        {form.questions?.map((question) => (
                          <TableHead key={question.id}>
                            {question.title}
                          </TableHead>
                        ))}
                        <TableHead className="w-[80px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map((response) => (
                        <TableRow key={response.id}>
                          <TableCell className="font-medium">
                            {format(
                              new Date(response.submitted_at),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR }
                            )}
                          </TableCell>
                          {form.questions?.map((question) => {
                            const answer = response.answers?.find(
                              (a) => a.question_id === question.id
                            );
                            return (
                              <TableCell key={question.id}>
                                {getAnswerValue(answer, question)}
                              </TableCell>
                            );
                          })}
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setResponseToDelete(response)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="charts" className="mt-6">
            <ResponseCharts form={form} responses={responses} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!responseToDelete}
        onOpenChange={() => setResponseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir resposta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A resposta será permanentemente
              excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteResponse}
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
