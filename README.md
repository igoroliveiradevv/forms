# NexaForm

Plataforma completa para criar, compartilhar e analisar formulários online com design conversacional.

## Funcionalidades

- **Editor de Formulários**: Crie formulários com perguntas de diversos tipos (texto, múltipla escolha, data, etc.)
- **Design Conversacional**: Formulários com aparência de chat, com persona personalizável
- **Personalização Visual**: Cores, fontes, estilos de balão, gradientes de fundo
- **Compartilhamento**: Link público para coleta de respostas
- **Dashboard**: Acompanhe respostas em tempo real com gráficos e análises
- **Autenticação**: Cadastro e login de usuários

## Tecnologias

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (autenticação, banco de dados, storage)
- [React Router](https://reactrouter.com/)
- [Recharts](https://recharts.org/)
- [TanStack React Query](https://tanstack.com/query/)

## Pré-requisitos

- Node.js 18+
- npm ou bun
- Conta no Supabase (gratuita)

## Configuração do Ambiente

### 1. Clone o repositório

```sh
git clone <URL_DO_REPOSITORIO>
cd forms
```

### 2. Configure o Supabase

Crie um projeto no [Supabase](https://supabase.com) e obtenha a URL e a chave anônima (publishable key).

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sua_chave_aqui
```

### 4. Execute as migrations

No diretório `supabase/`, execute as migrations SQL na ordem cronológica usando o painel do Supabase (SQL Editor) ou a CLI do Supabase:

```sh
supabase migration up
```

### 5. Instale as dependências

```sh
npm install
```

### 6. Inicie o servidor de desenvolvimento

```sh
npm run dev
```

O projeto estará disponível em `http://localhost:8080`.

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run preview` | Pré-visualiza o build de produção |
| `npm run lint` | Executa ESLint |
| `npm test` | Executa testes com Vitest |

## Estrutura do Projeto

```
src/
├── components/       # Componentes React
│   ├── chat/         # Componentes do formulário conversacional
│   ├── dashboard/    # Layout do dashboard
│   ├── form/         # Componentes de formulário simples
│   ├── form-editor/  # Editor de formulários (perguntas, estilo, persona)
│   ├── responses/    # Visualização de respostas
│   └── ui/           # Componentes shadcn/ui
├── contexts/         # Contextos React (AuthContext)
├── hooks/            # Hooks customizados
├── integrations/     # Integrações (Supabase client)
├── lib/              # Utilitários
├── pages/            # Páginas da aplicação
├── test/             # Testes
└── types/            # Definições TypeScript
```

## Banco de Dados

O projeto utiliza Supabase com as seguintes tabelas:

- **profiles**: Perfis de usuário
- **forms**: Formulários criados
- **questions**: Perguntas de cada formulário
- **question_options**: Opções de perguntas (múltipla escolha)
- **responses**: Respostas recebidas
- **response_answers**: Respostas individuais por pergunta

Storage buckets:
- **persona-avatars**: Avatares personalizados das personas
