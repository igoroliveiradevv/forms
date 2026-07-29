import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useGlobalInsights, useFormInsights } from '@/hooks/useInsights';
import { useForms } from '@/hooks/useForms';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
  BarChart3,
  Download,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function Insights() {
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const { forms, isLoading: formsLoading } = useForms();
  const { data: globalInsights, isLoading: globalLoading } = useGlobalInsights();
  const { data: formInsights, isLoading: formLoading } = useFormInsights(selectedFormId);

  const isLoading = formsLoading || globalLoading || (selectedFormId && formLoading);

  const handleExportCSV = () => {
    if (!formInsights) return;

    const headers = ['Data', ...(formInsights.form.questions?.map((q) => 
      q.variable_name ? `${q.title} [${q.variable_name}]` : q.title
    ) || [])];
    
    const rows = formInsights.responses.map((response) => {
      const date = format(new Date(response.submitted_at), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      const answers = formInsights.form.questions?.map((question) => {
        const answer = response.answers?.find((a) => a.question_id === question.id);
        if (!answer) return '-';
        return answer.answer_text || answer.answer_options?.join(', ') || 
               answer.answer_number?.toString() || answer.answer_rating?.toString() || '-';
      }) || [];
      return [date, ...answers];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `insights_${formInsights.form.title || 'dados'}.csv`;
    link.click();
  };

  const handleExportJSON = () => {
    if (!formInsights) return;

    const data = formInsights.responses.map((response) => {
      const answers: Record<string, unknown> = {};
      formInsights.form.questions?.forEach((question) => {
        const answer = response.answers?.find((a) => a.question_id === question.id);
        const key = question.variable_name || question.title;
        if (answer) {
          answers[key] = answer.answer_text || answer.answer_options || 
                        answer.answer_number || answer.answer_rating;
        }
      });
      return { submitted_at: response.submitted_at, ...answers };
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `insights_${formInsights.form.title || 'dados'}.json`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Insights</h1>
            <p className="text-sm text-muted-foreground">
              Análise completa dos seus formulários e respostas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedFormId || 'all'}
              onValueChange={(value) => setSelectedFormId(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecionar formulário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os formulários</SelectItem>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Global Insights (when no form selected) */}
        {!isLoading && !selectedFormId && globalInsights && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Formulários
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalInsights.totalForms}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Respostas
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalInsights.totalResponses}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taxa de Conclusão
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalInsights.averageCompletionRate}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tempo Médio
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(globalInsights.averageResponseTime / 60)}m
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Responses Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Respostas ao Longo do Tempo</CardTitle>
                  <CardDescription>Últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  {globalInsights.responsesByPeriod.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={globalInsights.responsesByPeriod}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
                          className="text-xs"
                        />
                        <YAxis className="text-xs" />
                        <Tooltip
                          labelFormatter={(value) =>
                            format(new Date(value), "dd 'de' MMMM", { locale: ptBR })
                          }
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          name="Respostas"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Forms */}
              <Card>
                <CardHeader>
                  <CardTitle>Formulários Mais Respondidos</CardTitle>
                  <CardDescription>Ranking por número de respostas</CardDescription>
                </CardHeader>
                <CardContent>
                  {globalInsights.formsByResponses.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={globalInsights.formsByResponses.slice(0, 5)}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis
                          type="category"
                          dataKey="formTitle"
                          width={120}
                          className="text-xs"
                          tickFormatter={(value) =>
                            value.length > 15 ? value.slice(0, 15) + '...' : value
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar
                          dataKey="responseCount"
                          fill="hsl(var(--primary))"
                          name="Respostas"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      Nenhum formulário com respostas
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Form-Specific Insights */}
        {!isLoading && selectedFormId && formInsights && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Respostas
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formInsights.responses.length}</div>
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
                  <div className="text-2xl font-bold">
                    {formInsights.form.questions?.length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taxa de Conclusão
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formInsights.completionRate}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Variáveis
                  </CardTitle>
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formInsights.questionAnalytics.filter((q) => q.variableName).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
              <Button variant="outline" onClick={handleExportJSON}>
                <Download className="mr-2 h-4 w-4" />
                Exportar JSON
              </Button>
            </div>

            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="questions">Por Pergunta</TabsTrigger>
                <TabsTrigger value="variables">Variáveis</TabsTrigger>
                <TabsTrigger value="data">Dados</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Respostas ao Longo do Tempo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {formInsights.responseTimeline.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={formInsights.responseTimeline}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
                          />
                          <YAxis />
                          <Tooltip
                            labelFormatter={(value) =>
                              format(new Date(value), "dd 'de' MMMM", { locale: ptBR })
                            }
                            contentStyle={{
                              backgroundColor: 'hsl(var(--popover))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            name="Respostas"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        Nenhuma resposta ainda
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="questions" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {formInsights.questionAnalytics
                    .filter((q) => q.distribution && q.distribution.length > 0)
                    .map((question, index) => (
                      <Card key={question.questionId}>
                        <CardHeader>
                          <CardTitle className="text-base">{question.questionTitle}</CardTitle>
                          {question.variableName && (
                            <CardDescription>
                              Variável: <code className="text-primary">[[{question.variableName}]]</code>
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={question.distribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ label, percent }) =>
                                  `${label}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                              >
                                {question.distribution?.map((_, i) => (
                                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    ))}
                  {formInsights.questionAnalytics.filter(
                    (q) => q.distribution && q.distribution.length > 0
                  ).length === 0 && (
                    <Card className="lg:col-span-2">
                      <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
                        Nenhuma pergunta com opções de escolha
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="variables" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Variáveis Definidas</CardTitle>
                    <CardDescription>
                      Variáveis que podem ser reutilizadas em mensagens
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pergunta</TableHead>
                          <TableHead>Variável</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Respostas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formInsights.questionAnalytics
                          .filter((q) => q.variableName)
                          .map((q) => (
                            <TableRow key={q.questionId}>
                              <TableCell>{q.questionTitle}</TableCell>
                              <TableCell>
                                <code className="rounded bg-muted px-2 py-1 text-primary">
                                  [[{q.variableName}]]
                                </code>
                              </TableCell>
                              <TableCell className="capitalize">{q.questionType}</TableCell>
                              <TableCell className="text-right">{q.responseCount}</TableCell>
                            </TableRow>
                          ))}
                        {formInsights.questionAnalytics.filter((q) => q.variableName).length ===
                          0 && (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="h-24 text-center text-muted-foreground"
                            >
                              Nenhuma variável definida neste formulário
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Todas as Respostas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {formInsights.responses.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[150px]">Data</TableHead>
                              {formInsights.form.questions?.map((q) => (
                                <TableHead key={q.id}>
                                  {q.variable_name ? (
                                    <div>
                                      <span>{q.title}</span>
                                      <span className="ml-1 text-xs text-muted-foreground">
                                        [{q.variable_name}]
                                      </span>
                                    </div>
                                  ) : (
                                    q.title
                                  )}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {formInsights.responses.map((response) => (
                              <TableRow key={response.id}>
                                <TableCell className="font-medium">
                                  {format(new Date(response.submitted_at), "dd/MM/yyyy 'às' HH:mm", {
                                    locale: ptBR,
                                  })}
                                </TableCell>
                                {formInsights.form.questions?.map((question) => {
                                  const answer = response.answers?.find(
                                    (a) => a.question_id === question.id
                                  );
                                  return (
                                    <TableCell key={question.id}>
                                      {answer?.answer_text ||
                                        answer?.answer_options?.join(', ') ||
                                        answer?.answer_number ||
                                        answer?.answer_rating ||
                                        '-'}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                        Nenhuma resposta ainda
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Empty State */}
        {!isLoading && globalInsights?.totalForms === 0 && (
          <Card className="py-12 text-center">
            <CardContent>
              <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">Nenhum dado para exibir</h3>
              <p className="text-muted-foreground">
                Crie formulários e receba respostas para ver insights aqui.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
