import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Palette } from 'lucide-react';
import { ColorInput } from '@/components/ui/color-input';
import { FormDesignDraft } from '@/pages/FormDesignEditor';

interface BackgroundSectionProps {
  draft: FormDesignDraft;
  onUpdateDraft: (field: keyof FormDesignDraft, value: string) => void;
}

const GRADIENT_DIRECTIONS = [
  { value: 'to bottom', label: 'Vertical (↓)' },
  { value: 'to top', label: 'Vertical (↑)' },
  { value: 'to right', label: 'Horizontal (→)' },
  { value: 'to left', label: 'Horizontal (←)' },
  { value: 'to bottom right', label: 'Diagonal (↘)' },
  { value: 'to bottom left', label: 'Diagonal (↙)' },
  { value: 'to top right', label: 'Diagonal (↗)' },
  { value: 'to top left', label: 'Diagonal (↖)' },
];

export function BackgroundSection({ draft, onUpdateDraft }: BackgroundSectionProps) {
  const backgroundType = draft.background_type || 'solid';

  const getPreviewBackground = () => {
    if (backgroundType === 'gradient') {
      return `linear-gradient(${draft.background_gradient_direction || 'to bottom'}, ${draft.background_gradient_start || '#ffffff'}, ${draft.background_gradient_end || '#f3f4f6'})`;
    }
    return draft.background_color || '#ffffff';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Estilo do Fundo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Background Type Selection */}
        <div className="space-y-3">
          <Label>Tipo de Fundo</Label>
          <RadioGroup
            value={backgroundType}
            onValueChange={(value) => onUpdateDraft('background_type', value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="solid" id="solid" />
              <Label htmlFor="solid" className="cursor-pointer">Cor Sólida</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gradient" id="gradient" />
              <Label htmlFor="gradient" className="cursor-pointer">Gradiente</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Solid Color */}
        {backgroundType === 'solid' && (
          <ColorInput
            label="Cor de Fundo"
            value={draft.background_color || '#ffffff'}
            onChange={(value) => onUpdateDraft('background_color', value)}
            showConfirmButton
            onConfirm={(value) => onUpdateDraft('background_color', value)}
            placeholder="#ffffff"
          />
        )}

        {/* Gradient Options */}
        {backgroundType === 'gradient' && (
          <div className="space-y-4">
            {/* Gradient Start Color */}
            <ColorInput
              label="Cor Inicial"
              value={draft.background_gradient_start || '#ffffff'}
              onChange={(value) => onUpdateDraft('background_gradient_start', value)}
              showConfirmButton
              onConfirm={(value) => onUpdateDraft('background_gradient_start', value)}
              placeholder="#ffffff"
            />

            {/* Gradient End Color */}
            <ColorInput
              label="Cor Final"
              value={draft.background_gradient_end || '#f3f4f6'}
              onChange={(value) => onUpdateDraft('background_gradient_end', value)}
              showConfirmButton
              onConfirm={(value) => onUpdateDraft('background_gradient_end', value)}
              placeholder="#f3f4f6"
            />

            {/* Gradient Direction */}
            <div className="space-y-2">
              <Label>Direção do Gradiente</Label>
              <Select
                value={draft.background_gradient_direction || 'to bottom'}
                onValueChange={(value) => onUpdateDraft('background_gradient_direction', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {GRADIENT_DIRECTIONS.map((dir) => (
                    <SelectItem key={dir.value} value={dir.value}>
                      {dir.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="space-y-2">
          <Label>Pré-visualização</Label>
          <div
            className="h-24 rounded-lg border shadow-inner"
            style={{ background: getPreviewBackground() }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
