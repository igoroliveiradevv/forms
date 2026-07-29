import { Form, FONT_OPTIONS } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { IdentitySection } from './persona/IdentitySection';
import { BackgroundSection } from './persona/BackgroundSection';
import { MessageStyleSection } from './persona/MessageStyleSection';
import { RotateCcw, Type } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FormDesignDraft } from '@/pages/FormDesignEditor';

interface PersonaEditorProps {
  form: Form;
  draft: FormDesignDraft;
  onUpdateDraft: (field: keyof FormDesignDraft, value: string) => void;
  onUpdateDraftMultiple: (updates: Partial<FormDesignDraft>) => void;
}

const DEFAULT_VALUES: FormDesignDraft = {
  persona_name: 'Assistente',
  persona_avatar_url: undefined,
  persona_description: undefined,
  persona_bubble_color: '#f3f4f6',
  user_bubble_color: '#3b82f6',
  text_color: '#1f2937',
  background_color: '#ffffff',
  background_type: 'solid',
  background_gradient_start: '#ffffff',
  background_gradient_end: '#f3f4f6',
  background_gradient_direction: 'to bottom',
  font_family: 'Inter',
};

export function PersonaEditor({ form, draft, onUpdateDraft, onUpdateDraftMultiple }: PersonaEditorProps) {
  const handleResetToDefaults = () => {
    onUpdateDraftMultiple(DEFAULT_VALUES);
    toast({
      title: 'Configurações restauradas',
      description: 'Todas as configurações de estilo foram restauradas ao padrão.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetToDefaults}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar Padrão
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['identity', 'background', 'messages', 'typography']} className="space-y-4">
        {/* Identity Section */}
        <AccordionItem value="identity" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Identidade do Assistente</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <IdentitySection 
              form={form} 
              draft={draft}
              onUpdateDraft={onUpdateDraft}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Background Section */}
        <AccordionItem value="background" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Estilo do Fundo</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <BackgroundSection 
              draft={draft}
              onUpdateDraft={onUpdateDraft}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Message Style Section */}
        <AccordionItem value="messages" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Estilo das Mensagens</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <MessageStyleSection 
              draft={draft}
              onUpdateDraft={onUpdateDraft}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Typography Section */}
        <AccordionItem value="typography" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Tipografia</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Fonte do Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Família de Fonte</Label>
                  <Select
                    value={draft.font_family || 'Inter'}
                    onValueChange={(value) => onUpdateDraft('font_family', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    A fonte será aplicada em todo o chat conversacional
                  </p>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
