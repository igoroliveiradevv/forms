import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionEditorDraft } from './QuestionEditorDraft';
import { QuestionDraft } from '@/hooks/useFormContentDraft';

interface SortableQuestionItemProps {
  question: QuestionDraft;
  index: number;
  onUpdate: (updates: Partial<Omit<QuestionDraft, 'id' | 'options'>>) => void;
  onDelete: () => void;
  onAddOption: () => void;
  onUpdateOption: (optionId: string, label: string) => void;
  onDeleteOption: (optionId: string) => void;
  isVariableNameUsed?: (name: string) => boolean;
}

export function SortableQuestionItem({
  question,
  index,
  onUpdate,
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  isVariableNameUsed,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionEditorDraft
        question={question}
        index={index}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAddOption={onAddOption}
        onUpdateOption={onUpdateOption}
        onDeleteOption={onDeleteOption}
        isVariableNameUsed={isVariableNameUsed}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
