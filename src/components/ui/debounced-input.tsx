import * as React from 'react';
import { Input } from './input';
import { Textarea } from './textarea';
import { cn } from '@/lib/utils';

interface DebouncedInputProps extends Omit<React.ComponentProps<'input'>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

const DebouncedInput = React.forwardRef<HTMLInputElement, DebouncedInputProps>(
  function DebouncedInput(
    { value, onChange, debounceMs = 500, className, onFocus, onBlur, ...props },
    ref
  ) {
    const [localValue, setLocalValue] = React.useState(value);
    const isFocusedRef = React.useRef(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const lastSentValueRef = React.useRef(value);
    const internalRef = React.useRef<HTMLInputElement | null>(null);

    // Combine refs
    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Only sync external value when NOT focused AND value changed externally
    // Use ref for focus check to avoid sync on blur
    React.useEffect(() => {
      // Don't sync if focused
      if (isFocusedRef.current) return;
      
      // Don't sync if this is our own change coming back
      if (value === lastSentValueRef.current) return;
      
      // External change while not focused - sync it
      setLocalValue(value);
      lastSentValueRef.current = value;
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastSentValueRef.current = newValue;
        onChange(newValue);
      }, debounceMs);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = true;
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Flush any pending changes BEFORE changing focus state
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Send current value if different from last sent
      if (localValue !== lastSentValueRef.current) {
        lastSentValueRef.current = localValue;
        onChange(localValue);
      }
      
      // Update focus state after flushing
      isFocusedRef.current = false;
      onBlur?.(e);
    };

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <Input
        {...props}
        ref={setRefs}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className}
      />
    );
  }
);

DebouncedInput.displayName = 'DebouncedInput';

interface DebouncedTextareaProps extends Omit<React.ComponentProps<'textarea'>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

const DebouncedTextarea = React.forwardRef<HTMLTextAreaElement, DebouncedTextareaProps>(
  function DebouncedTextarea(
    { value, onChange, debounceMs = 500, className, onFocus, onBlur, ...props },
    ref
  ) {
    const [localValue, setLocalValue] = React.useState(value);
    const isFocusedRef = React.useRef(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const lastSentValueRef = React.useRef(value);
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);

    // Combine refs
    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Only sync external value when NOT focused AND value changed externally
    // Use ref for focus check to avoid sync on blur
    React.useEffect(() => {
      // Don't sync if focused
      if (isFocusedRef.current) return;
      
      // Don't sync if this is our own change coming back
      if (value === lastSentValueRef.current) return;
      
      // External change while not focused - sync it
      setLocalValue(value);
      lastSentValueRef.current = value;
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastSentValueRef.current = newValue;
        onChange(newValue);
      }, debounceMs);
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      isFocusedRef.current = true;
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      // Flush any pending changes BEFORE changing focus state
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Send current value if different from last sent
      if (localValue !== lastSentValueRef.current) {
        lastSentValueRef.current = localValue;
        onChange(localValue);
      }
      
      // Update focus state after flushing
      isFocusedRef.current = false;
      onBlur?.(e);
    };

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <Textarea
        {...props}
        ref={setRefs}
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className}
      />
    );
  }
);

DebouncedTextarea.displayName = 'DebouncedTextarea';

export { DebouncedInput, DebouncedTextarea };
