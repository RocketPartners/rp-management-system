/**
 * AI Chat Page — AI-powered HRIS assistant
 * Users can ask questions and perform actions via natural language.
 */

import { useRef, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    Bot,
    ChevronRight,
    Loader2,
    MessageSquare,
    Send,
    Sparkles,
    User,
    Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { sendChatMessage, type ChatMessage } from '@/lib/ai/chat-service';

const SUGGESTED_PROMPTS = [
    'What are my leave balances?',
    'Show me my recent leave requests',
    'What holidays are coming up?',
    'List available leave types',
    'Show me my assigned assets',
    'Search for an employee',
    'Create a support ticket for VPN issues',
    'Show recent announcements',
];

export default function AIChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentTool, setCurrentTool] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: trimmed };
        setMessages((prev) => [...prev, userMessage, { role: 'assistant', content: '', isLoading: true }]);
        setInput('');
        setIsLoading(true);
        setCurrentTool(null);

        try {
            const response = await sendChatMessage(
                trimmed,
                messages,
                (toolName) => setCurrentTool(toolName),
            );

            setMessages((prev) => [
                ...prev.filter((m) => !m.isLoading),
                response,
            ]);
        } catch (error: any) {
            setMessages((prev) => [
                ...prev.filter((m) => !m.isLoading),
                {
                    role: 'assistant',
                    content: `Sorry, something went wrong: ${error.message}`,
                },
            ]);
        } finally {
            setIsLoading(false);
            setCurrentTool(null);
            textareaRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestedPrompt = (prompt: string) => {
        setInput(prompt);
        textareaRef.current?.focus();
    };

    const formatToolName = (name: string) =>
        name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <>
            <Helmet><title>AI Assistant | HRIS</title></Helmet>

            <div className="flex h-[calc(100vh-4rem)] flex-col">
                {/* Beta Warning Banner */}
                <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-sm text-amber-800">
                    <strong>Beta:</strong> This AI assistant is still in progress. Responses may contain inaccuracies or hallucinations. Please verify important information before acting on it.
                </div>

                {/* Header */}
                <div className="border-b bg-white px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-violet-100 p-2">
                            <Sparkles className="h-6 w-6 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
                            <p className="text-sm text-gray-500">
                                Ask me anything about HR — leaves, teams, announcements, and more
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
                    {messages.length === 0 ? (
                        /* Empty State */
                        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center">
                            <div className="mb-6 rounded-full bg-violet-100 p-6">
                                <Bot className="h-12 w-12 text-violet-600" />
                            </div>
                            <h2 className="mb-2 text-xl font-semibold text-gray-900">
                                How can I help you today?
                            </h2>
                            <p className="mb-8 text-center text-gray-500">
                                I can help you manage leaves, search employees, create teams,
                                check holidays, and more.
                            </p>
                            <div className="grid w-full grid-cols-2 gap-3">
                                {SUGGESTED_PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => handleSuggestedPrompt(prompt)}
                                        className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-violet-300 hover:bg-violet-50"
                                    >
                                        <ChevronRight className="h-4 w-4 flex-shrink-0 text-violet-500" />
                                        <span>{prompt}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Message List */
                        <div className="mx-auto max-w-3xl space-y-4">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-100">
                                            <Bot className="h-4 w-4 text-violet-600" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                            msg.role === 'user'
                                                ? 'bg-violet-600 text-white'
                                                : 'border bg-white text-gray-800'
                                        }`}
                                    >
                                        {msg.isLoading ? (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm">
                                                    {currentTool
                                                        ? `Running: ${formatToolName(currentTool)}...`
                                                        : 'Thinking...'}
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Tool actions indicator */}
                                                {msg.toolActions && msg.toolActions.length > 0 && (
                                                    <div className="mb-2 space-y-1">
                                                        {msg.toolActions.map((action, j) => (
                                                            <div key={j} className="flex items-center gap-1.5">
                                                                <Wrench className="h-3 w-3 text-violet-500" />
                                                                <Badge variant="secondary" className="bg-violet-100 text-violet-700 text-xs">
                                                                    {formatToolName(action.tool)}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {msg.content}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                                            <User className="h-4 w-4 text-gray-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="border-t bg-white px-6 py-4">
                    <div className="mx-auto flex max-w-3xl gap-3">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
                            className="min-h-[44px] max-h-32 resize-none"
                            rows={1}
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="h-11 w-11 flex-shrink-0 bg-violet-600 hover:bg-violet-700"
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
            </div>
        </>
    );
}
