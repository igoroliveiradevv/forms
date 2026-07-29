import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm?: (value: string) => void;
  placeholder?: string;
  className?: string;
  showConfirmButton?: boolean;
  label?: string;
}

// Convert RGB string to HEX
function rgbToHex(rgb: string): string | null {
  // Match rgb(r, g, b) or r,g,b or r g b formats
  const rgbMatch = rgb.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  const simpleMatch = rgb.match(/^\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*$/);
  
  const match = rgbMatch || simpleMatch;
  if (!match) return null;
  
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  
  if (r > 255 || g > 255 || b > 255) return null;
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

// Validate HEX color
function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

// Normalize HEX (expand 3-char to 6-char)
function normalizeHex(hex: string): string {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`.toUpperCase();
  }
  return hex.toUpperCase();
}

// Parse and validate color input
function parseColorInput(input: string): string | null {
  const trimmed = input.trim();
  
  // Check if it's a valid HEX
  if (trimmed.startsWith('#')) {
    if (isValidHex(trimmed)) {
      return normalizeHex(trimmed);
    }
    return null;
  }
  
  // Try to parse as RGB
  const hexFromRgb = rgbToHex(trimmed);
  if (hexFromRgb) {
    return hexFromRgb;
  }
  
  // Try adding # prefix if it looks like hex without #
  if (/^[A-Fa-f0-9]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }
  if (/^[A-Fa-f0-9]{3}$/.test(trimmed)) {
    return normalizeHex(`#${trimmed}`);
  }
  
  return null;
}

export function ColorInput({
  value,
  onChange,
  onConfirm,
  placeholder = '#FFFFFF',
  className,
  showConfirmButton = false,
  label,
}: ColorInputProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  // Sync input value when external value changes
  React.useEffect(() => {
    setInputValue(value);
    setIsConfirmed(false);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsConfirmed(false);
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);
    onChange(newValue);
  };

  const applyColor = () => {
    const parsed = parseColorInput(inputValue);
    if (parsed) {
      setInputValue(parsed);
      onChange(parsed);
      return parsed;
    } else {
      // Reset to current value if invalid
      setInputValue(value);
      return null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyColor();
    }
  };

  const handleBlur = () => {
    applyColor();
  };

  const handleConfirm = () => {
    const parsed = applyColor();
    if (parsed && onConfirm) {
      onConfirm(parsed);
      setIsConfirmed(true);
      setTimeout(() => setIsConfirmed(false), 2000);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={handleColorPickerChange}
          className="h-10 w-14 cursor-pointer rounded border p-1 flex-shrink-0"
        />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 font-mono"
        />
        {showConfirmButton && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleConfirm}
            className={cn(
              'flex-shrink-0 transition-colors',
              isConfirmed && 'bg-primary text-primary-foreground'
            )}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Aceita HEX (#FFFFFF) ou RGB (255, 255, 255). Pressione ENTER para aplicar.
      </p>
    </div>
  );
}
