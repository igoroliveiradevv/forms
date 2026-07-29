import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  personaName?: string;
  personaAvatar?: string;
  bubbleColor?: string;
}

export function TypingIndicator({
  personaName = 'Assistente',
  personaAvatar,
  bubbleColor = '#f3f4f6',
}: TypingIndicatorProps) {
  return (
    <div className="flex items-start gap-2 animate-fade-in">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={personaAvatar} />
        <AvatarFallback className="bg-primary/10 text-xs">
          {personaName?.charAt(0) || 'A'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col">
        <span className="text-xs font-medium text-muted-foreground mb-1">
          {personaName} está digitando...
        </span>
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3"
          style={{ backgroundColor: bubbleColor }}
        >
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
