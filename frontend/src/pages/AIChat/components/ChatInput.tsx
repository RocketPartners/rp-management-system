import { useRef, useEffect } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    isLoading: boolean;
}

export default function ChatInput({ value, onChange, onSend, isLoading }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!isLoading) textareaRef.current?.focus();
    }, [isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = Math.min(el.scrollHeight, 128) + 'px';
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="border-t bg-white px-6 py-4">
            <div className="mx-auto flex max-w-3xl gap-3">
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message HRIS Assistant..."
                    className="min-h-[44px] max-h-32 resize-none"
                    rows={1}
                    disabled={isLoading}
                />
                <Button
                    onClick={onSend}
                    disabled={!value.trim() || isLoading}
                    className="h-11 w-11 shrink-0 bg-violet-600 hover:bg-violet-700"
                    size="icon"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                </Button>
            </div>
            <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-gray-400">
                AI Assistant powered by Claude. Actions are performed on your behalf using your permissions.
            </p>
        </div>
    );
}
