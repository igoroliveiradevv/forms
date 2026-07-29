import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  isPersona: boolean;
  personaName?: string;
  personaAvatar?: string;
  personaBubbleColor?: string;
  userBubbleColor?: string;
  textColor?: string;
  animate?: boolean;
}

// Calculate contrasting text color for better readability
const getContrastColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1f2937' : '#ffffff';
};

export function ChatMessage({
  content,
  isPersona,
  personaName = 'Assistente',
  personaAvatar,
  personaBubbleColor = '#f3f4f6',
  userBubbleColor = '#3b82f6',
  textColor = '#1f2937',
  animate = false,
}: ChatMessageProps) {
  const personaBubbleTextColor = getContrastColor(personaBubbleColor);
  const userBubbleTextColor = getContrastColor(userBubbleColor);

  return (
    <div
      className={cn(
        'flex gap-2',
        isPersona ? 'items-start' : 'items-end justify-end',
        animate && 'animate-fade-in'
      )}
    >
      {isPersona && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={personaAvatar} />
          <AvatarFallback className="bg-primary/10 text-xs">
            {personaName?.charAt(0) || 'A'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn('flex flex-col max-w-[75%]', !isPersona && 'items-end')}>
        {isPersona && (
          <span 
            className="text-xs font-medium mb-1"
            style={{ color: textColor }}
          >
            {personaName}
          </span>
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-2 shadow-sm',
            isPersona ? 'rounded-tl-sm' : 'rounded-tr-sm'
          )}
          style={{
            backgroundColor: isPersona ? personaBubbleColor : userBubbleColor,
          }}
        >
          <p
            className="text-sm whitespace-pre-wrap"
            style={{ color: isPersona ? personaBubbleTextColor : userBubbleTextColor }}
          >
            {content}
          </p>
        </div>
      </div>
      
      {!isPersona && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-muted">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
