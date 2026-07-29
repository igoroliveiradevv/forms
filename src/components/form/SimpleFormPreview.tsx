import { Form } from '@/types/form';
import { SimpleForm } from './SimpleForm';

interface SimpleFormPreviewProps {
  form: Form;
}

const NOOP_SUBMIT = async () => undefined;

export function SimpleFormPreview({ form }: SimpleFormPreviewProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <SimpleForm form={form} onSubmit={NOOP_SUBMIT} />
    </div>
  );
}
