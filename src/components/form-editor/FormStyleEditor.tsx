import { Form } from '@/types/form';
import { useForms } from '@/hooks/useForms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { THEME_OPTIONS } from '@/types/form';

interface FormStyleEditorProps {
  form: Form;
}

export function FormStyleEditor({ form }: FormStyleEditorProps) {
  const { updateForm } = useForms();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Personalização Visual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-2">
          <Label>Tema</Label>
          <Select
            value={form.theme}
            onValueChange={(value) =>
              updateForm.mutate({ id: form.id, theme: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {THEME_OPTIONS.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  {theme.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label>Cor de Fundo</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={form.background_color}
              onChange={(e) =>
                updateForm.mutate({ id: form.id, background_color: e.target.value })
              }
              className="h-10 w-14 cursor-pointer p-1"
            />
            <Input
              value={form.background_color}
              onChange={(e) =>
                updateForm.mutate({ id: form.id, background_color: e.target.value })
              }
              placeholder="#ffffff"
              className="flex-1"
            />
          </div>
        </div>

        {/* Button Color */}
        <div className="space-y-2">
          <Label>Cor dos Botões</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={form.button_color}
              onChange={(e) =>
                updateForm.mutate({ id: form.id, button_color: e.target.value })
              }
              className="h-10 w-14 cursor-pointer p-1"
            />
            <Input
              value={form.button_color}
              onChange={(e) =>
                updateForm.mutate({ id: form.id, button_color: e.target.value })
              }
              placeholder="#1e40af"
              className="flex-1"
            />
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label>Cor do Texto</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={form.text_color}
              onChange={(e) =>
                updateForm.mutate({ id: form.id, text_color: e.target.value })
              }
              className="h-10 w-14 cursor-pointer p-1"
            />
            <Input
              value={form.text_color}
              onChange={(e) =>
                updateForm.mutate({ id: form.id, text_color: e.target.value })
              }
              placeholder="#1f2937"
              className="flex-1"
            />
          </div>
        </div>

        {/* Logo URL */}
        <div className="space-y-2">
          <Label>URL do Logo (opcional)</Label>
          <Input
            value={form.logo_url || ''}
            onChange={(e) =>
              updateForm.mutate({ id: form.id, logo_url: e.target.value || null })
            }
            placeholder="https://exemplo.com/logo.png"
          />
        </div>
      </CardContent>
    </Card>
  );
}
