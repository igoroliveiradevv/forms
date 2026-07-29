import { useState, useRef } from 'react';
import { Form } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FormDesignDraft } from '@/pages/FormDesignEditor';

interface IdentitySectionProps {
  form: Form;
  draft: FormDesignDraft;
  onUpdateDraft: (field: keyof FormDesignDraft, value: string) => void;
}

export function IdentitySection({ form, draft, onUpdateDraft }: IdentitySectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Use apenas JPG, PNG ou WebP',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 2MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) throw userErr || new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${form.id}-${Date.now()}.${fileExt}`;
      const filePath = `${userData.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('persona-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('persona-avatars')
        .getPublicUrl(filePath);

      onUpdateDraft('persona_avatar_url', publicUrl);
      
      toast({
        title: 'Avatar carregado!',
        description: 'Clique em Salvar para confirmar.',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar a imagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = () => {
    onUpdateDraft('persona_avatar_url', '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Identidade do Assistente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-dashed border-muted-foreground/30">
              <AvatarImage src={draft.persona_avatar_url} />
              <AvatarFallback className="bg-primary/10 text-2xl">
                {draft.persona_name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            {draft.persona_avatar_url && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleRemoveAvatar}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Fazer Upload
                </>
              )}
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          
          <p className="text-xs text-muted-foreground text-center">
            JPG, PNG ou WebP. Máximo 2MB.
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="persona_name">Nome do Assistente</Label>
          <Input
            id="persona_name"
            value={draft.persona_name || ''}
            onChange={(e) => onUpdateDraft('persona_name', e.target.value)}
            placeholder="Ex: Ana, Equipe Suporte"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="persona_description">Descrição (opcional)</Label>
          <Textarea
            id="persona_description"
            value={draft.persona_description || ''}
            onChange={(e) => onUpdateDraft('persona_description', e.target.value)}
            placeholder="Ex: Especialista em atendimento ao cliente"
            className="min-h-[80px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Uma breve descrição do assistente (apenas informativa)
          </p>
        </div>

        {/* Manual URL input as fallback */}
        <div className="space-y-2">
          <Label htmlFor="persona_avatar_url">Ou cole uma URL de imagem</Label>
          <Input
            id="persona_avatar_url"
            value={draft.persona_avatar_url || ''}
            onChange={(e) => onUpdateDraft('persona_avatar_url', e.target.value)}
            placeholder="https://exemplo.com/foto.jpg"
          />
        </div>
      </CardContent>
    </Card>
  );
}
