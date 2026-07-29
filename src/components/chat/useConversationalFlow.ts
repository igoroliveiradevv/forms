import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Form, Question } from '@/types/form';

export interface ConversationMessage {
  id: string;
  content: string;
  isPersona: boolean;
  questionId?: string;
}

export interface ConversationAnswer {
  question_id: string;
  answer_text?: string;
  answer_options?: string[];
  answer_number?: number;
  answer_date?: string;
  answer_rating?: number;
}

interface UseConversationalFlowOptions {
  form: Form;
  onSubmit: (answers: ConversationAnswer[]) => Promise<void>;
  conversationKey: string;
  initialTypingDelayMs?: number;
}

const DEFAULT_THANK_YOU_MESSAGE = 'Obrigado por responder!';
const DEFAULT_END_BLOCK_TITLE = 'Finalizar Formulário';
const MIN_DELAY_SECONDS = 0.5;
const MAX_DELAY_SECONDS = 10;

export function sortConversationQuestions(questions: Question[] = []) {
  return [...questions].sort((a, b) => {
    if (a.order_index !== b.order_index) return a.order_index - b.order_index;
    return a.created_at.localeCompare(b.created_at);
  });
}

export function getDelayDurationMs(question: Question) {
  const settings = question.settings as Record<string, unknown> | null;
  const rawDelay = Number(settings?.delay_seconds ?? 2);
  const safeDelaySeconds = Number.isFinite(rawDelay)
    ? Math.min(Math.max(rawDelay, MIN_DELAY_SECONDS), MAX_DELAY_SECONDS)
    : 2;

  return safeDelaySeconds * 1000;
}

function getCustomEndMessage(question: Question) {
  const title = question.title?.trim();
  return title && title !== DEFAULT_END_BLOCK_TITLE ? title : undefined;
}

function createMessage(content: string, isPersona: boolean, questionId?: string): ConversationMessage {
  return {
    id: crypto.randomUUID(),
    content,
    isPersona,
    questionId,
  };
}

export function useConversationalFlow({ form, onSubmit, conversationKey, initialTypingDelayMs = 3000 }: UseConversationalFlowOptions) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = useMemo(() => sortConversationQuestions(form.questions || []), [form.questions]);
  const currentQuestion = currentQuestionIndex !== null ? questions[currentQuestionIndex] : undefined;

  const executionIdRef = useRef(0);
  const waitTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);
  const answersRef = useRef<ConversationAnswer[]>([]);
  const variablesRef = useRef<Record<string, string>>({});
  const currentQuestionIndexRef = useRef<number | null>(null);
  const lastInteractiveQuestionIndexRef = useRef<number | null>(null);
  const isSubmittingRef = useRef(false);
  const isAdvancingRef = useRef(false);
  const isCompletedRef = useRef(false);
  const questionsRef = useRef(questions);
  const descriptionRef = useRef(form.description);
  const thankYouMessageRef = useRef(form.thank_you_message);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    descriptionRef.current = form.description;
  }, [form.description]);

  useEffect(() => {
    thankYouMessageRef.current = form.thank_you_message;
  }, [form.thank_you_message]);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);

  const clearWait = useCallback(() => {
    if (waitTimeoutRef.current !== null) {
      window.clearTimeout(waitTimeoutRef.current);
      waitTimeoutRef.current = null;
    }
  }, []);

  const isActiveRun = useCallback((runId: number) => {
    return isMountedRef.current && executionIdRef.current === runId;
  }, []);

  const wait = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        clearWait();
        waitTimeoutRef.current = window.setTimeout(() => {
          waitTimeoutRef.current = null;
          resolve();
        }, ms);
      }),
    [clearWait]
  );

  const replaceVariables = useCallback((text: string) => {
    return text.replace(/\[\[(\w+)\]\]/g, (match, variableName) => {
      const value = variablesRef.current[variableName];
      return value !== undefined ? value : match;
    });
  }, []);

  const addPersonaMessage = useCallback((content: string, questionId?: string) => {
    setMessages((prev) => [...prev, createMessage(content, true, questionId)]);
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, createMessage(content, false)]);
  }, []);

  const setActiveQuestionIndex = useCallback((index: number | null) => {
    currentQuestionIndexRef.current = index;

    if (index !== null) {
      lastInteractiveQuestionIndexRef.current = index;
    }

    setCurrentQuestionIndex(index);
  }, []);

  const resetConversation = useCallback(() => {
    executionIdRef.current += 1;
    clearWait();
    answersRef.current = [];
    variablesRef.current = {};
    currentQuestionIndexRef.current = null;
    lastInteractiveQuestionIndexRef.current = null;
    isSubmittingRef.current = false;
    isAdvancingRef.current = false;
    isCompletedRef.current = false;
    setMessages([]);
    setCurrentQuestionIndex(null);
    setIsTyping(false);
    setIsCompleted(false);
  }, [clearWait]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      executionIdRef.current += 1;
      clearWait();
    };
  }, [clearWait]);

  const finalizeConversation = useCallback(
    async (runId: number, submittedAnswers: ConversationAnswer[], customMessage?: string) => {
      if (!isActiveRun(runId) || isSubmittingRef.current || isCompletedRef.current) return;

      isSubmittingRef.current = true;
      setActiveQuestionIndex(null);

      if (isActiveRun(runId)) {
        setIsTyping(false);
      }

      try {
        await onSubmit(submittedAnswers);

        if (!isActiveRun(runId)) return;

        isCompletedRef.current = true;
        setIsCompleted(true);
        addPersonaMessage(
          replaceVariables(customMessage || thankYouMessageRef.current || DEFAULT_THANK_YOU_MESSAGE)
        );
      } catch {
        if (!isActiveRun(runId)) return;

        isCompletedRef.current = false;
        setIsCompleted(false);
        addPersonaMessage('Ocorreu um erro ao enviar suas respostas. Por favor, tente novamente.');

        const fallbackIndex = lastInteractiveQuestionIndexRef.current;
        if (fallbackIndex !== null) {
          setActiveQuestionIndex(fallbackIndex);
        }
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [addPersonaMessage, isActiveRun, onSubmit, replaceVariables, setActiveQuestionIndex]
  );

  const runFromIndex = useCallback(
    async (
      startIndex: number,
      runId: number,
      submittedAnswers: ConversationAnswer[] = answersRef.current
    ) => {
      if (isAdvancingRef.current || !isActiveRun(runId)) return;

      isAdvancingRef.current = true;

      try {
        let nextIndex = startIndex;
        const orderedQuestions = questionsRef.current;

        while (isActiveRun(runId) && nextIndex < orderedQuestions.length) {
          const question = orderedQuestions[nextIndex];

          if (question.type === 'delay') {
            setActiveQuestionIndex(null);
            setIsTyping(true);
            await wait(getDelayDurationMs(question));

            if (!isActiveRun(runId)) return;

            setIsTyping(false);
            nextIndex += 1;
            continue;
          }

          if (question.type === 'text_only') {
            setActiveQuestionIndex(null);
            addPersonaMessage(replaceVariables(question.title), question.id);

            if (question.description) {
              addPersonaMessage(replaceVariables(question.description));
            }

            nextIndex += 1;
            continue;
          }

          if (question.type === 'end_form') {
            await finalizeConversation(runId, submittedAnswers, getCustomEndMessage(question));
            return;
          }

          addPersonaMessage(replaceVariables(question.title), question.id);

          if (question.description) {
            addPersonaMessage(replaceVariables(question.description));
          }

          if (!isActiveRun(runId)) return;

          setActiveQuestionIndex(nextIndex);
          return;
        }

        if (isActiveRun(runId)) {
          await finalizeConversation(runId, submittedAnswers);
        }
      } finally {
        if (!isSubmittingRef.current) {
          isAdvancingRef.current = false;
        }
      }
    },
    [addPersonaMessage, finalizeConversation, isActiveRun, replaceVariables, setActiveQuestionIndex, wait]
  );

  useEffect(() => {
    resetConversation();

    const runId = executionIdRef.current;
    const startConversation = async () => {
      if (initialTypingDelayMs > 0) {
        setIsTyping(true);
        await wait(initialTypingDelayMs);

        if (!isActiveRun(runId)) return;

        setIsTyping(false);
      }

      const initialMessage = descriptionRef.current?.trim();
      if (initialMessage) {
        addPersonaMessage(replaceVariables(initialMessage));
      }

      if (questionsRef.current.length > 0) {
        await runFromIndex(0, runId, answersRef.current);
      }
    };

    void startConversation();
  }, [addPersonaMessage, conversationKey, initialTypingDelayMs, isActiveRun, replaceVariables, resetConversation, runFromIndex, wait]);

  const handleAnswer = useCallback(
    async (value: string | string[] | number | Date) => {
      if (isAdvancingRef.current || isSubmittingRef.current || isCompletedRef.current) return;

      const activeIndex = currentQuestionIndexRef.current;
      const activeQuestion = activeIndex !== null ? questionsRef.current[activeIndex] : undefined;
      if (!activeQuestion) return;

      let displayValue = '';
      const answer: ConversationAnswer = { question_id: activeQuestion.id };

      if (typeof value === 'string') {
        displayValue = value;
        if (activeQuestion.type === 'single_choice' || activeQuestion.type === 'dropdown') {
          answer.answer_options = [value];
        } else {
          answer.answer_text = value;
        }
      } else if (Array.isArray(value)) {
        const labels = activeQuestion.options
          ?.filter((option) => value.includes(option.id))
          .map((option) => option.label) || value;
        displayValue = labels.join(', ');
        answer.answer_options = labels as string[];
      } else if (value instanceof Date) {
        displayValue = value.toLocaleDateString('pt-BR');
        answer.answer_date = value.toISOString().split('T')[0];
      } else {
        displayValue = activeQuestion.type === 'rating' ? '⭐'.repeat(value) : value.toString();
        if (activeQuestion.type === 'rating') {
          answer.answer_rating = value;
        } else {
          answer.answer_number = value;
        }
      }

      if (activeQuestion.variable_name) {
        variablesRef.current = {
          ...variablesRef.current,
          [activeQuestion.variable_name]: displayValue,
        };
      }

      const nextAnswers = [...answersRef.current, answer];
      answersRef.current = nextAnswers;
      addUserMessage(displayValue);
      setActiveQuestionIndex(null);
      await runFromIndex(activeIndex + 1, executionIdRef.current, nextAnswers);
    },
    [addUserMessage, runFromIndex, setActiveQuestionIndex]
  );

  return {
    messages,
    currentQuestion,
    isTyping,
    isCompleted,
    handleAnswer,
  };
}