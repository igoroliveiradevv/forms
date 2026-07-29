import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  BarChart3,
  Share2,
  Palette,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Timer,
  HelpCircle,
  Mail,
  Star,
  Calendar,
  ListChecks,
  Type,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Layers,
  UserCircle,
  PieChart,
  Download,
  Globe,
  Lock,
} from 'lucide-react';
import { QUESTION_TYPE_LABELS } from '@/types/form';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

function AnimatedSection({ children, className, animation = 'fade-in-up', delay = 0, ...props }: {
  children: React.ReactNode;
  className?: string;
  animation?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700',
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8',
        className
      )}
      style={{ transitionDelay: `${delay}ms`, transitionProperty: 'opacity, transform' }}
      {...props}
    >
      {children}
    </div>
  );
}

const features = [
  {
    icon: MessageSquare,
    title: 'Formulários Conversacionais',
    description: 'Crie formulários que simulam uma conversa real com atendente humano, aumentando o engajamento das respostas.',
  },
  {
    icon: Layers,
    title: '12 Tipos de Blocos',
    description: 'Texto curto, longo, número, e-mail, seleção única/múltipla, dropdown, data, avaliação, mensagem, delay e finalização.',
  },
  {
    icon: UserCircle,
    title: 'Persona Personalizável',
    description: 'Dê nome, avatar e personalidade ao seu assistente virtual. Cores, fontes e fundo totalmente customizáveis.',
  },
  {
    icon: PieChart,
    title: 'Analytics em Tempo Real',
    description: 'Acompanhe respostas com gráficos interativos, taxas de conclusão e tempo médio de resposta.',
  },
  {
    icon: Download,
    title: 'Exportação CSV/JSON',
    description: 'Exporte os dados coletados para sua ferramenta de análise favorita com apenas um clique.',
  },
  {
    icon: Globe,
    title: 'Compartilhamento por Link',
    description: 'Compartilhe seus formulários com um link único. Sem necessidade de cadastro para responder.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Crie seu Formulário',
    description: 'Monte o roteiro da conversa arrastando blocos de perguntas, mensagens e delays na ordem que desejar.',
  },
  {
    number: '02',
    title: 'Personalize a Experiência',
    description: 'Configure o nome, avatar e estilo visual da sua persona. Escolha cores, fontes e plano de fundo.',
  },
  {
    number: '03',
    title: 'Compartilhe e Colete',
    description: 'Publique seu formulário e compartilhe o link. Os respondentes interagem como em um chat real.',
  },
  {
    number: '04',
    title: 'Analise os Resultados',
    description: 'Visualize respostas em tempo real com gráficos, estatísticas e exporte os dados quando precisar.',
  },
];

const questionTypes = [
  { type: 'short_text' as const },
  { type: 'long_text' as const },
  { type: 'number' as const },
  { type: 'email' as const },
  { type: 'single_choice' as const },
  { type: 'multiple_choice' as const },
  { type: 'dropdown' as const },
  { type: 'date' as const },
  { type: 'rating' as const },
];

const typeIcons: Record<string, typeof Type> = {
  short_text: Type,
  long_text: Type,
  number: FileText,
  email: Mail,
  single_choice: ListChecks,
  multiple_choice: ListChecks,
  dropdown: ChevronRight,
  date: Calendar,
  rating: Star,
  delay: Timer,
  text_only: MessageSquare,
  end_form: CheckCircle2,
};

const stats = [
  { value: '12', label: 'Tipos de blocos' },
  { value: '100%', label: 'Gratuito' },
  { value: 'Ilimitado', label: 'Formulários' },
  { value: 'Tempo Real', label: 'Análises' },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">NexaForm</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#funcionalidades" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Como Funciona
            </a>
            <a href="#tipos" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Tipos de Blocos
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button>
                Criar Conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-card px-4 pb-6 pt-4 md:hidden">
            <nav className="mb-6 flex flex-col gap-3">
              <a href="#funcionalidades" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Funcionalidades</a>
              <a href="#como-funciona" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Como Funciona</a>
              <a href="#tipos" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Tipos de Blocos</a>
            </nav>
            <div className="flex flex-col gap-2">
              <Link to="/login">
                <Button variant="outline" className="w-full">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button className="w-full">Criar Conta Grátis</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.15),transparent_50%)]" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="animate-fade-in-down">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Plataforma de Formulários Conversacionais
              </Badge>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl/none animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
              Formulários que{' '}
              <span className="text-gradient">conversam</span>
              {' '}com seus clientes
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              Crie formulários no formato de chat com persona personalizável, 
              delays inteligentes e análises em tempo real. 
              A forma mais natural e envolvente de coletar respostas.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: '0.45s', animationFillMode: 'both' }}>
              <Link to="/register">
                <Button size="lg" className="w-full gap-2 sm:w-auto group">
                  Começar Gratuitamente
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Ver Demonstração
                </Button>
              </Link>
            </div>

            {/* Hero Mockup */}
            <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
              <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-2xl transition-shadow duration-500 hover:shadow-3xl">
                <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <div className="h-3 w-3 rounded-full bg-warning" />
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span className="ml-3 text-xs text-muted-foreground">NexaForm - Preview do Chat</span>
                </div>
                <div className="flex gap-4 p-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-3 opacity-0 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">A</div>
                      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-left">
                        <p className="text-sm font-medium text-muted-foreground">Assistente</p>
                        <p className="text-sm">Olá! Vou fazer algumas perguntas para conhecer você melhor.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 justify-end opacity-0 animate-fade-in" style={{ animationDelay: '1.5s', animationFillMode: 'both' }}>
                      <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-left">
                        <p className="text-sm text-primary-foreground">Olá! Tudo bem?</p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs">U</div>
                    </div>
                    <div className="flex items-start gap-3 opacity-0 animate-fade-in" style={{ animationDelay: '2s', animationFillMode: 'both' }}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">A</div>
                      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5 text-left">
                        <p className="text-sm font-medium text-muted-foreground">Assistente</p>
                        <p className="text-sm">Qual o seu nome?</p>
                      </div>
                    </div>
                    <div className="h-10 rounded-lg border bg-background p-2">
                      <div className="h-full w-2/3 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="hidden w-48 flex-col gap-2 rounded-lg bg-muted/30 p-3 sm:flex opacity-0 animate-fade-in" style={{ animationDelay: '2.2s', animationFillMode: 'both' }}>
                    <div className="flex items-center gap-2 border-b pb-2 text-xs font-medium text-muted-foreground">
                      <BarChart3 className="h-3.5 w-3.5" />
                      Respostas em tempo real
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>João Silva</span>
                        <span className="text-muted-foreground">2 min atrás</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Maria Santos</span>
                        <span className="text-muted-foreground">5 min atrás</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Pedro Costa</span>
                        <span className="text-muted-foreground">8 min atrás</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 lg:py-28">
        <div className="container">
          <AnimatedSection>
            <div className="mb-14 text-center">
              <Badge variant="outline" className="mb-4">Funcionalidades</Badge>
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Tudo que você precisa para criar formulários incríveis</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Uma plataforma completa com ferramentas profissionais para criar, personalizar e analisar formulários conversacionais.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 100}>
                <Card className="group border-0 bg-card shadow-corporate transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:shadow-lg">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="border-t bg-muted/30 py-20 lg:py-28">
        <div className="container">
          <AnimatedSection>
            <div className="mb-14 text-center">
              <Badge variant="outline" className="mb-4">Como Funciona</Badge>
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Crie seu formulário em 4 passos</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Do roteiro à análise de resultados, o NexaForm simplifica todo o processo.
              </p>
            </div>
          </AnimatedSection>
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute left-8 top-0 hidden h-full w-px bg-border md:block animate-fade-in" />
            <div className="space-y-12">
              {steps.map((step, i) => (
                <AnimatedSection key={step.number} delay={i * 150} animation="slide-in-from-left">
                  <div className="relative flex flex-col gap-4 md:flex-row md:gap-8">
                    <div className="flex items-center gap-4 md:flex-col md:items-start">
                      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-md transition-all duration-300 hover:scale-110 hover:shadow-xl">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Question Types */}
      <section id="tipos" className="py-20 lg:py-28">
        <div className="container">
          <AnimatedSection>
            <div className="mb-14 text-center">
              <Badge variant="outline" className="mb-4">Tipos de Blocos</Badge>
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">12 tipos de blocos para sua conversa</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                De perguntas simples a blocos especiais como delays e finalização, monte o fluxo perfeito.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...questionTypes, { type: 'delay' as const }, { type: 'text_only' as const }, { type: 'end_form' as const }].map(({ type }, i) => {
              const Icon = typeIcons[type] || HelpCircle;
              const isSpecial = ['delay', 'text_only', 'end_form'].includes(type);
              return (
                <AnimatedSection key={type} delay={i * 60}>
                  <div className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                    isSpecial
                      ? "border-primary/20 bg-gradient-to-r from-primary/5 to-accent/10"
                      : "bg-card hover:bg-muted/50"
                  )}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-200 group-hover:scale-110">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{QUESTION_TYPE_LABELS[type]}</span>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t bg-muted/30 py-20 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <AnimatedSection animation="slide-in-from-left">
                <Badge variant="outline" className="mb-4">Vantagens</Badge>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
                  Por que escolher o NexaForm?
                </h2>
                <p className="mb-8 text-muted-foreground leading-relaxed">
                  Uma plataforma completa pensada para profissionais que valorizam 
                  simplicidade, engajamento e resultados.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Formulários ilimitados',
                    'Respostas ilimitadas',
                    '12 tipos de blocos',
                    'Persona personalizável',
                    'Delays inteligentes',
                    'Variáveis nas mensagens',
                    'Gráficos e estatísticas',
                    'Exportação CSV/JSON',
                    'Compartilhamento por link',
                    'Design responsivo',
                    'Sem necessidade de cadastro para responder',
                    'Atualizações gratuitas',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2.5 group">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-success transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
              <AnimatedSection animation="slide-in-from-right" delay={100}>
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/20 p-1 transition-all duration-500 hover:shadow-xl">
                  <div className="rounded-xl bg-card p-6 shadow-lg">
                    <div className="mb-5 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <MessageSquare className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Preview ao Vivo</div>
                        <div className="text-xs text-muted-foreground">Veja as alterações em tempo real</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">A</div>
                        <div className="rounded-xl rounded-tl-sm bg-muted px-3 py-2">
                          <p className="text-xs">Qual seu nome?</p>
                        </div>
                      </div>
                      <div className="h-8 rounded-lg border bg-background" />
                      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">A</div>
                          <div>
                            <div className="text-xs font-medium">Persona</div>
                            <div className="text-[10px] text-muted-foreground">Nome, avatar e estilo</div>
                          </div>
                        </div>
                        <Palette className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(262_83%_58%/0.3),transparent_50%)]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-72 w-72 animate-spin-slow rounded-full border border-primary-foreground/20" />
          <div className="absolute -right-20 -bottom-20 h-96 w-96 animate-spin-slow rounded-full border border-primary-foreground/10" style={{ animationDirection: 'reverse' }} />
        </div>
        <div className="container relative text-center">
          <AnimatedSection>
            <Badge variant="secondary" className="mb-6 border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Comece agora, é gratuito
            </Badge>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
              Pronto para criar seu primeiro formulário conversacional?
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="mx-auto mb-10 max-w-2xl text-primary-foreground/80">
              Não precisa de cartão de crédito. Crie sua conta gratuita e comece a construir formulários incríveis em minutos.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="w-full gap-2 sm:w-auto group">
                  Criar Conta Grátis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full border-primary-foreground/20 text-primary-foreground transition-all duration-200 hover:bg-primary-foreground/10 hover:scale-105 sm:w-auto">
                  Já tenho uma conta
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <MessageSquare className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">NexaForm</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Formulários conversacionais que engajam e convertem. A forma mais natural de coletar respostas.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#funcionalidades" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Funcionalidades</a></li>
                <li><a href="#como-funciona" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Como Funciona</a></li>
                <li><a href="#tipos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Tipos de Blocos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Recursos</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Entrar</Link></li>
                <li><Link to="/register" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Criar Conta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Segurança</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  Dados criptografados
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  Autenticação segura
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  Disponibilidade global
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NexaForm. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
