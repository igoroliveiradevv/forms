import { useState, useCallback, useEffect, useRef } from 'react';
import { Form, Question, QuestionType } from '@/types/form';

// Content fields that can be edited in the form editor
export interface FormContentDraft {
  title: string;
  description?: string;
  thank_you_message: string;
  is_active: boolean;
  questions: QuestionDraft[];
}

export interface QuestionDraft {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  is_required: boolean;
  order_index: number;
  options: QuestionOptionDraft[];
  variable_name?: string;
  // Delay-specific: seconds to wait
  delay_seconds?: number;
  // Track if this is a new question (not yet in DB)
  isNew?: boolean;
  // Track if deleted (for soft delete before save)
  isDeleted?: boolean;
}

export interface QuestionOptionDraft {
  id: string;
  label: string;
  order_index: number;
  // Track if new/deleted
  isNew?: boolean;
  isDeleted?: boolean;
}

// Generate a temporary ID for new items
function generateTempId() {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extract content fields from form
function getContentFromForm(form: Form): FormContentDraft {
  return {
    title: form.title,
    description: form.description,
    thank_you_message: form.thank_you_message || 'Obrigado por responder!',
    is_active: form.is_active,
    questions: (form.questions || []).map((q) => ({
      id: q.id,
      type: q.type,
      title: q.title,
      description: q.description,
      is_required: q.is_required,
      order_index: q.order_index,
      variable_name: q.variable_name,
      delay_seconds: q.type === 'delay' ? ((q.settings as any)?.delay_seconds ?? 2) : undefined,
      options: (q.options || []).map((o) => ({
        id: o.id,
        label: o.label,
        order_index: o.order_index,
      })),
    })),
  };
}

// Validate variable name format
export function isValidVariableName(name: string): boolean {
  if (!name) return true; // Empty is valid (no variable)
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

export function useFormContentDraft(form: Form | null | undefined) {
  const [draft, setDraft] = useState<FormContentDraft | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initializedFormId = useRef<string | null>(null);

  const syncWithForm = useCallback((nextForm: Form) => {
    setDraft(getContentFromForm(nextForm));
    initializedFormId.current = nextForm.id;
    setHasUnsavedChanges(false);
  }, []);

  // Initialize draft from form when loaded (only once per form)
  useEffect(() => {
    if (form && initializedFormId.current !== form.id) {
      syncWithForm(form);
    }
  }, [form, syncWithForm]);

  // Update form-level field
  const updateFormField = useCallback(<K extends keyof FormContentDraft>(
    field: K,
    value: FormContentDraft[K]
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Update a question field
  const updateQuestion = useCallback((
    questionId: string,
    updates: Partial<Omit<QuestionDraft, 'id' | 'options'>>
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q
        ),
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Add a new question
  const addQuestion = useCallback((type: QuestionType) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const existingQuestions = prev.questions.filter((q) => !q.isDeleted);
      const newQuestion: QuestionDraft = {
        id: generateTempId(),
        type,
        title: type === 'text_only' ? 'Mensagem da persona...' 
             : type === 'delay' ? 'Delay'
             : type === 'end_form' ? 'Finalizar Formulário'
             : 'Nova pergunta',
        is_required: false,
        order_index: existingQuestions.length,
        options: [],
        delay_seconds: type === 'delay' ? 2 : undefined,
        isNew: true,
      };
      return {
        ...prev,
        questions: [...prev.questions, newQuestion],
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Mark a question as deleted (soft delete)
  const deleteQuestion = useCallback((questionId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, isDeleted: true } : q
        ),
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Add option to a question
  const addQuestionOption = useCallback((questionId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id !== questionId) return q;
          const existingOptions = q.options.filter((o) => !o.isDeleted);
          const newOption: QuestionOptionDraft = {
            id: generateTempId(),
            label: `Opção ${existingOptions.length + 1}`,
            order_index: existingOptions.length,
            isNew: true,
          };
          return { ...q, options: [...q.options, newOption] };
        }),
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Update an option
  const updateQuestionOption = useCallback((
    questionId: string,
    optionId: string,
    label: string
  ) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id !== questionId) return q;
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optionId ? { ...o, label } : o
            ),
          };
        }),
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Delete an option (soft delete)
  const deleteQuestionOption = useCallback((questionId: string, optionId: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) => {
          if (q.id !== questionId) return q;
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optionId ? { ...o, isDeleted: true } : o
            ),
          };
        }),
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Reorder questions by providing new ordered list of IDs
  const reorderQuestions = useCallback((orderedIds: string[]) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) => {
          const newIndex = orderedIds.indexOf(q.id);
          if (newIndex === -1) return q; // deleted questions keep their index
          return { ...q, order_index: newIndex };
        }),
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Reset draft to saved form state
  const resetDraft = useCallback(() => {
    if (form) {
      syncWithForm(form);
    }
  }, [form, syncWithForm]);

  const markAsSaved = useCallback((savedForm?: Form) => {
    if (savedForm) {
      syncWithForm(savedForm);
      return;
    }
    setHasUnsavedChanges(false);
  }, [syncWithForm]);

  // Get visible questions (excluding deleted)
  const visibleQuestions = (draft?.questions.filter((q) => !q.isDeleted) || [])
    .sort((a, b) => a.order_index - b.order_index);

  // Get all used variable names (for validation)
  const usedVariableNames = visibleQuestions
    .filter((q) => q.variable_name)
    .map((q) => ({ questionId: q.id, variableName: q.variable_name! }));

  // Check if a variable name is already used by another question
  const isVariableNameUsed = useCallback((name: string, excludeQuestionId: string): boolean => {
    if (!name) return false;
    return usedVariableNames.some(
      (v) => v.variableName === name && v.questionId !== excludeQuestionId
    );
  }, [usedVariableNames]);

  // Create a preview-ready form object that merges original form with draft
  const getPreviewForm = useCallback((): Form | null => {
    if (!form || !draft) return form;

    const previewQuestions: Question[] = visibleQuestions.map((q) => ({
      id: q.id,
      form_id: form.id,
      type: q.type,
      title: q.title,
      description: q.description,
      is_required: q.is_required,
      order_index: q.order_index,
      variable_name: q.variable_name,
      settings: q.type === 'delay' ? { delay_seconds: q.delay_seconds ?? 2 } : {},
      created_at: '',
      updated_at: '',
      options: q.options
        .filter((o) => !o.isDeleted)
        .map((o) => ({
          id: o.id,
          question_id: q.id,
          label: o.label,
          order_index: o.order_index,
          created_at: '',
        })),
    }));

    return {
      ...form,
      title: draft.title,
      description: draft.description,
      thank_you_message: draft.thank_you_message,
      is_active: draft.is_active,
      questions: previewQuestions,
    };
  }, [form, draft, visibleQuestions]);

  return {
    draft,
    hasUnsavedChanges,
    visibleQuestions,
    usedVariableNames,
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
    syncWithForm,
    getPreviewForm,
  };
}
