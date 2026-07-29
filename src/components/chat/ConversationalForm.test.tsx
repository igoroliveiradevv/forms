import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Form, Question } from '@/types/form';
import { ConversationalForm } from './ConversationalForm';

const baseQuestion = {
  form_id: 'form-1',
  is_required: false,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
} satisfies Pick<Question, 'form_id' | 'is_required' | 'created_at' | 'updated_at'>;

function createQuestion(overrides: Partial<Question> & Pick<Question, 'id' | 'type' | 'title' | 'order_index'>): Question {
  return {
    ...baseQuestion,
    description: undefined,
    settings: {},
    options: [],
    ...overrides,
  };
}

function createForm(questions: Question[]): Form {
  return {
    id: 'form-1',
    user_id: 'user-1',
    title: 'Fluxo de teste',
    description: 'Olá! Vamos começar.',
    slug: 'fluxo-de-teste',
    is_active: true,
    is_draft: false,
    background_color: '#ffffff',
    button_color: '#1e40af',
    text_color: '#1f2937',
    theme: 'corporate',
    thank_you_message: 'Obrigado por responder!',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    questions,
    persona_name: 'Assistente',
    user_bubble_color: '#3b82f6',
    persona_bubble_color: '#f3f4f6',
    font_family: 'Inter',
    background_type: 'solid',
    form_type: 'conversational',
  };
}

describe('ConversationalForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('executa o fluxo em ordem com múltiplos delays e só finaliza no bloco final', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const form = createForm([
      createQuestion({ id: 'q1', type: 'short_text', title: 'Qual o seu nome?', order_index: 0, variable_name: 'nome' }),
      createQuestion({ id: 'q-delay-1', type: 'delay', title: 'Delay', order_index: 1, settings: { delay_seconds: 2 } }),
      createQuestion({ id: 'q-text', type: 'text_only', title: 'Olá [[nome]]', order_index: 2 }),
      createQuestion({ id: 'q-delay-2', type: 'delay', title: 'Delay', order_index: 3, settings: { delay_seconds: 1 } }),
      createQuestion({ id: 'q2', type: 'email', title: 'Qual o seu e-mail?', order_index: 4 }),
      createQuestion({ id: 'q-end', type: 'end_form', title: 'Finalizar Formulário', order_index: 5 }),
    ]);

    const view = render(<ConversationalForm form={form} onSubmit={onSubmit} embedded />);

    expect(await view.findByText('Qual o seu nome?')).toBeInTheDocument();

    const nameInput = view.getByPlaceholderText('Digite sua resposta') as HTMLInputElement;
    nameInput.focus();
    nameInput.value = 'Igor';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    nameInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));

    expect(onSubmit).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1999);
    });
    expect(view.queryByText('Olá Igor')).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(view.getByText('Olá Igor')).toBeInTheDocument();
    expect(view.queryByText('Qual o seu e-mail?')).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(999);
    });
    expect(view.queryByText('Qual o seu e-mail?')).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    const emailInput = view.getByPlaceholderText('Digite seu e-mail') as HTMLInputElement;
    emailInput.focus();
    emailInput.value = 'igor@example.com';
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    emailInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith([
      { question_id: 'q1', answer_text: 'Igor' },
      { question_id: 'q2', answer_text: 'igor@example.com' },
    ]);
    expect(await view.findByText('Obrigado por responder!')).toBeInTheDocument();
  });

  it('usa finalização de fallback apenas ao chegar no último bloco', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const form = createForm([
      createQuestion({ id: 'q1', type: 'short_text', title: 'Qual o seu nome?', order_index: 0 }),
    ]);

    const view = render(<ConversationalForm form={form} onSubmit={onSubmit} embedded conversationKey="fallback" />);

    const nameInput = (await view.findByPlaceholderText('Digite sua resposta')) as HTMLInputElement;
    nameInput.focus();
    nameInput.value = 'Maria';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    nameInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith([{ question_id: 'q1', answer_text: 'Maria' }]);
  });
});