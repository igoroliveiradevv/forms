import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import { ColorInput } from '@/components/ui/color-input';
import { FormDesignDraft } from '@/pages/FormDesignEditor';

interface MessageStyleSectionProps {
  draft: FormDesignDraft;
  onUpdateDraft: (field: keyof FormDesignDraft, value: string) => void;
}

export function MessageStyleSection({ draft, onUpdateDraft }: MessageStyleSectionProps) {
  // Calculate contrasting text color
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1f2937' : '#ffffff';
  };

  const getPreviewBackground = () => {
    if (draft.background_type === 'gradient') {
      return `linear-gradient(${draft.background_gradient_direction || 'to bottom'}, ${draft.background_gradient_start || '#ffffff'}, ${draft.background_gradient_end || '#f3f4f6'})`;
    }
    return draft.background_color || '#ffffff';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Estilo das Mensagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Persona Bubble Color */}
        <ColorInput
          label="Cor do Balão do Assistente"
          value={draft.persona_bubble_color || '#f3f4f6'}
          onChange={(value) => onUpdateDraft('persona_bubble_color', value)}
          showConfirmButton
          onConfirm={(value) => onUpdateDraft('persona_bubble_color', value)}
          placeholder="#f3f4f6"
        />

        {/* User Bubble Color */}
        <ColorInput
          label="Cor do Balão do Usuário"
          value={draft.user_bubble_color || '#3b82f6'}
          onChange={(value) => onUpdateDraft('user_bubble_color', value)}
          showConfirmButton
          onConfirm={(value) => onUpdateDraft('user_bubble_color', value)}
          placeholder="#3b82f6"
        />

        {/* Text Color */}
        <ColorInput
          label="Cor do Texto (Geral)"
          value={draft.text_color || '#1f2937'}
          onChange={(value) => onUpdateDraft('text_color', value)}
          showConfirmButton
          onConfirm={(value) => onUpdateDraft('text_color', value)}
          placeholder="#1f2937"
        />

        {/* Live Preview */}
        <div className="space-y-2">
          <Label>Pré-visualização em Tempo Real</Label>
          <div
            className="rounded-lg p-4 space-y-3 border"
            style={{
              background: getPreviewBackground(),
              fontFamily: draft.font_family,
            }}
          >
            {/* Persona Message */}
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={draft.persona_avatar_url} />
                <AvatarFallback className="bg-primary/10 text-xs">
                  {draft.persona_name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: draft.text_color }}>
                  {draft.persona_name || 'Assistente'}
                </p>
                <div
                  className="rounded-lg px-3 py-2 max-w-xs shadow-sm"
                  style={{ 
                    backgroundColor: draft.persona_bubble_color,
                    color: getContrastColor(draft.persona_bubble_color || '#f3f4f6'),
                  }}
                >
                  <p className="text-sm">
                    Olá! Como posso ajudá-lo hoje?
                  </p>
                </div>
              </div>
            </div>

            {/* User Message */}
            <div className="flex justify-end">
              <div
                className="rounded-lg px-3 py-2 max-w-xs shadow-sm"
                style={{ 
                  backgroundColor: draft.user_bubble_color,
                  color: getContrastColor(draft.user_bubble_color || '#3b82f6'),
                }}
              >
                <p className="text-sm">
                  Olá! Gostaria de mais informações.
                </p>
              </div>
            </div>

            {/* Another Persona Message */}
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={draft.persona_avatar_url} />
                <AvatarFallback className="bg-primary/10 text-xs">
                  {draft.persona_name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div
                className="rounded-lg px-3 py-2 max-w-xs shadow-sm"
                style={{ 
                  backgroundColor: draft.persona_bubble_color,
                  color: getContrastColor(draft.persona_bubble_color || '#f3f4f6'),
                }}
              >
                <p className="text-sm">
                  Claro! Por favor, me diga seu nome.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contrast Warning */}
        <p className="text-xs text-muted-foreground">
          💡 O texto dos balões se ajusta automaticamente para garantir boa legibilidade
        </p>
      </CardContent>
    </Card>
  );
}
