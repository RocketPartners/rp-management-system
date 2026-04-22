import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, ChevronDown, ChevronRight, User, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTypingEffect } from '../hooks/useTypingEffect';

interface ToolAction {
    tool: string;
    input: any;
    result: string;
}

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    toolActions?: ToolAction[];
    isLoading?: boolean;
    isNew?: boolean; // true for the latest assistant message that just arrived
    currentTool?: string | null;
    createdAt?: string;
}

function formatToolName(name: string) {
    if (name.includes('/')) return name;
    return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function TypingDots() {
    return (
        <div className="flex items-center gap-1 py-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]" />
        </div>
    );
}

function BlinkingCursor() {
    return (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-violet-500" />
    );
}

export default function MessageBubble({ role, content, toolActions, isLoading, isNew, currentTool, createdAt }: MessageBubbleProps) {
    const [toolsExpanded, setToolsExpanded] = useState(false);
    const { displayedText, isTyping } = useTypingEffect(content, !!isNew && role === 'assistant');

    if (role === 'user') {
        return (
            <div className="flex justify-end gap-3 group">
                <div className="max-w-[75%] rounded-2xl bg-violet-600 px-4 py-3 text-white" title={createdAt}>
                    <p className="whitespace-pre-wrap text-sm">{content}</p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-4 w-4 text-gray-600" />
                </div>
            </div>
        );
    }

    const textToShow = isNew ? displayedText : content;

    return (
        <div className="flex gap-3 group">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100">
                <Bot className="h-4 w-4 text-violet-600" />
            </div>
            <div className="min-w-0 max-w-[85%]" title={createdAt}>
                {isLoading ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <TypingDots />
                        {currentTool && (
                            <span className="text-xs text-gray-400">
                                Running {formatToolName(currentTool)}...
                            </span>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Tool actions */}
                        {toolActions && toolActions.length > 0 && (
                            <button
                                onClick={() => setToolsExpanded(!toolsExpanded)}
                                className="mb-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {toolsExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                <Wrench className="h-3 w-3" />
                                <span>Used {toolActions.length} tool{toolActions.length > 1 ? 's' : ''}</span>
                            </button>
                        )}
                        {toolsExpanded && toolActions && (
                            <div className="mb-2 flex flex-wrap gap-1">
                                {toolActions.map((a, i) => (
                                    <Badge key={i} variant="secondary" className="bg-violet-50 text-violet-700 text-xs font-mono">
                                        {formatToolName(a.tool)}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Content with typing effect */}
                        <div className="prose prose-sm max-w-none text-sm leading-relaxed prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-inherit prose-a:text-violet-600">
                            <Markdown remarkPlugins={[remarkGfm]}>{textToShow}</Markdown>
                            {isTyping && <BlinkingCursor />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
