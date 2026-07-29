import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, Response, Question } from '@/types/form';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ResponseChartsProps {
  form: Form;
  responses: Response[];
}

const COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(142, 76%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(262, 83%, 58%)',
  'hsl(0, 84%, 60%)',
  'hsl(180, 70%, 45%)',
  'hsl(280, 60%, 55%)',
  'hsl(45, 90%, 55%)',
];

export function ResponseCharts({ form, responses }: ResponseChartsProps) {
  const chartableQuestions = form.questions?.filter((q) =>
    ['single_choice', 'multiple_choice', 'dropdown', 'rating'].includes(q.type)
  );

  if (!chartableQuestions || chartableQuestions.length === 0) {
    return (
      <Card className="py-12 text-center">
        <CardContent>
          <p className="text-muted-foreground">
            Adicione perguntas de seleção ou avaliação para visualizar gráficos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {chartableQuestions.map((question) => (
        <QuestionChart
          key={question.id}
          question={question}
          responses={responses}
        />
      ))}
    </div>
  );
}

interface QuestionChartProps {
  question: Question;
  responses: Response[];
}

function QuestionChart({ question, responses }: QuestionChartProps) {
  const getData = () => {
    if (question.type === 'rating') {
      const ratingCounts: Record<number, number> = {};
      responses.forEach((response) => {
        const answer = response.answers?.find(
          (a) => a.question_id === question.id
        );
        if (answer?.answer_rating) {
          ratingCounts[answer.answer_rating] =
            (ratingCounts[answer.answer_rating] || 0) + 1;
        }
      });

      return [1, 2, 3, 4, 5].map((rating) => ({
        name: `${rating} ⭐`,
        value: ratingCounts[rating] || 0,
      }));
    }

    // For choice-based questions
    const optionCounts: Record<string, number> = {};
    responses.forEach((response) => {
      const answer = response.answers?.find(
        (a) => a.question_id === question.id
      );
      if (answer?.answer_options) {
        answer.answer_options.forEach((optId) => {
          optionCounts[optId] = (optionCounts[optId] || 0) + 1;
        });
      } else if (answer?.answer_text) {
        optionCounts[answer.answer_text] =
          (optionCounts[answer.answer_text] || 0) + 1;
      }
    });

    return question.options?.map((option) => ({
      name: option.label,
      value: optionCounts[option.id] || 0,
    })) || [];
  };

  const data = getData();
  const totalResponses = data.reduce((sum, item) => sum + item.value, 0);

  if (totalResponses === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{question.title}</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhuma resposta ainda
        </CardContent>
      </Card>
    );
  }

  const isPieChart = question.type !== 'rating';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{question.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            {isPieChart ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(221, 83%, 53%)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
