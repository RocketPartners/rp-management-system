/**
 * AI Chat Page — Claude/ChatGPT-style HRIS assistant with persistent chat history.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/spring-boot-api';
import { sendChatMessage, type ChatMessage } from '@/lib/ai/chat-service';
import type {
    AIChatSessionResponse,
    AIChatSessionDetailResponse,
    PagedResponse,
} from '@/types';

import ChatSidebar from './components/ChatSidebar';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import EmptyState from './components/EmptyState';

export default function AIChat() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentTool, setCurrentTool] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        return localStorage.getItem('ai-chat-sidebar') === 'collapsed';
    });
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [newMessageIndex, setNewMessageIndex] = useState<number | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Persist sidebar state
    useEffect(() => {
        localStorage.setItem('ai-chat-sidebar', sidebarCollapsed ? 'collapsed' : 'open');
    }, [sidebarCollapsed]);

    // Fetch sessions for sidebar
    const { data: sessionsData } = useQuery({
        queryKey: ['ai-chat-sessions'],
        queryFn: () => apiGet<PagedResponse<AIChatSessionResponse>>('/ai-chat/sessions?page=0&size=50'),
    });
    const sessions = sessionsData?.content ?? [];

    // Fetch session detail when viewing a conversation
    const { data: sessionDetail } = useQuery({
        queryKey: ['ai-chat-session', sessionId],
        queryFn: () => apiGet<AIChatSessionDetailResponse>(`/ai-chat/sessions/${sessionId}`),
        enabled: !!sessionId,
    });

    // Load messages from session detail
    useEffect(() => {
        if (sessionDetail) {
            const loaded: ChatMessage[] = sessionDetail.messages.map((m) => ({
                role: m.role,
                content: m.content,
                toolActions: m.toolActions ? JSON.parse(m.toolActions) : undefined,
            }));
            setMessages(loaded);
            setNewMessageIndex(null); // don't animate loaded history
        }
    }, [sessionDetail]);

    // Clear messages when navigating to new chat
    useEffect(() => {
        if (!sessionId) {
            setMessages([]);
            setNewMessageIndex(null);
        }
    }, [sessionId]);

    // Scroll handling
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleScroll = () => {
        const el = scrollAreaRef.current;
        if (!el) return;
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollBtn(distFromBottom > 200);
    };

    // Mutations
    const createSession = useMutation({
        mutationFn: (title: string) =>
            apiPost<AIChatSessionResponse>('/ai-chat/sessions', { title }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-chat-sessions'] }),
    });

    const saveMessages = useMutation({
        mutationFn: ({ id, body }: { id: number; body: any }) =>
            apiPost(`/ai-chat/sessions/${id}/messages`, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-chat-sessions'] });
            if (sessionId) {
                queryClient.invalidateQueries({ queryKey: ['ai-chat-session', sessionId] });
            }
        },
    });

    const renameSession = useMutation({
        mutationFn: ({ id, title }: { id: number; title: string }) =>
            apiPatch(`/ai-chat/sessions/${id}`, { title }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-chat-sessions'] });
            if (sessionId) {
                queryClient.invalidateQueries({ queryKey: ['ai-chat-session', sessionId] });
            }
        },
    });

    const deleteSession = useMutation({
        mutationFn: (id: number) => apiDelete(`/ai-chat/sessions/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-chat-sessions'] });
            toast.success('Conversation deleted');
        },
    });

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: trimmed };
        const prevMessages = [...messages];
        setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '', isLoading: true }]);
        setInput('');
        setIsLoading(true);
        setCurrentTool(null);

        let response: ChatMessage;
        try {
            response = await sendChatMessage(
                trimmed,
                prevMessages,
                (toolName) => setCurrentTool(toolName),
                (textDelta) => {
                    // Update the loading message with streamed text
                    setMessages((prev) => {
                        const updated = [...prev];
                        const loadingIdx = updated.findIndex((m) => m.isLoading);
                        if (loadingIdx !== -1) {
                            updated[loadingIdx] = {
                                ...updated[loadingIdx],
                                content: updated[loadingIdx].content + textDelta,
                            };
                        }
                        return updated;
                    });
                },
            );
        } catch (error: any) {
            response = {
                role: 'assistant',
                content: `Sorry, something went wrong: ${error.message}`,
            };
        }

        setMessages((prev) => {
            const updated = [...prev.filter((m) => !m.isLoading), response];
            setNewMessageIndex(updated.length - 1);
            return updated;
        });
        setIsLoading(false);
        setCurrentTool(null);

        // Persist
        try {
            let activeSessionId = sessionId ? Number(sessionId) : null;

            // Create session if this is a new chat
            if (!activeSessionId) {
                const title = trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed;
                const newSession = await createSession.mutateAsync(title);
                activeSessionId = newSession.id;
            }

            // Save the message pair
            await saveMessages.mutateAsync({
                id: activeSessionId,
                body: {
                    userMessage: trimmed,
                    assistantMessage: response.content,
                    toolActions: response.toolActions ? JSON.stringify(response.toolActions) : null,
                },
            });

            // Navigate to session URL if it was a new chat
            if (!sessionId) {
                navigate(`/ai-chat/${activeSessionId}`, { replace: true });
            }
        } catch (err) {
            console.error('Failed to save chat:', err);
        }
    };

    const handlePromptClick = (prompt: string) => {
        setInput(prompt);
    };

    const currentTitle = sessionDetail?.title ?? 'New conversation';

    return (
        <>
            <Helmet><title>AI Assistant | HRIS</title></Helmet>

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Conversation Sidebar */}
                <ChatSidebar
                    sessions={sessions}
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    onRename={(id, title) => renameSession.mutate({ id, title })}
                    onDelete={(id) => deleteSession.mutate(id)}
                />

                {/* Main Chat Area */}
                <div className="flex flex-1 flex-col min-w-0">
                    {/* Beta Banner */}
                    <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-700">
                        <strong>Beta:</strong> Responses may contain inaccuracies. Please verify important information.
                    </div>

                    {/* Chat Header */}
                    <ChatHeader
                        title={currentTitle}
                        isNewChat={!sessionId}
                        onRename={(title) => {
                            if (sessionId) {
                                renameSession.mutate({ id: Number(sessionId), title });
                            }
                        }}
                    />

                    {/* Messages */}
                    <div
                        ref={scrollAreaRef}
                        onScroll={handleScroll}
                        className="relative flex-1 overflow-y-auto bg-gray-50 px-6 py-4"
                    >
                        {messages.length === 0 && !sessionId ? (
                            <EmptyState onPromptClick={handlePromptClick} />
                        ) : (
                            <div className="mx-auto max-w-3xl space-y-5">
                                {messages.map((msg, i) => (
                                    <MessageBubble
                                        key={i}
                                        role={msg.role}
                                        content={msg.content}
                                        toolActions={msg.toolActions}
                                        isLoading={msg.isLoading}
                                        isNew={i === newMessageIndex}
                                        currentTool={currentTool}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}

                        {/* Scroll to bottom button */}
                        {showScrollBtn && (
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full shadow-md"
                                onClick={scrollToBottom}
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Input */}
                    <ChatInput
                        value={input}
                        onChange={setInput}
                        onSend={handleSend}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </>
    );
}
