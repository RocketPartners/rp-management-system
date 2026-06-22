import { Bot, CalendarDays, ClipboardList, Megaphone, Ticket } from 'lucide-react';

interface EmptyStateProps {
    onPromptClick: (prompt: string) => void;
}

const SUGGESTIONS = [
    { icon: ClipboardList, text: 'What are my leave balances?', color: 'text-blue-500' },
    { icon: CalendarDays, text: 'What holidays are coming up?', color: 'text-green-500' },
    { icon: Megaphone, text: 'Show recent announcements', color: 'text-amber-500' },
    { icon: Ticket, text: 'Create a support ticket', color: 'text-rose-500' },
];

export default function EmptyState({ onPromptClick }: EmptyStateProps) {
    return (
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4">
            <div className="mb-6 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 p-6">
                <Bot className="h-12 w-12 text-violet-600" />
            </div>
            <h2 className="mb-1 text-xl font-semibold text-gray-900">HRIS AI Assistant</h2>
            <p className="mb-8 text-sm text-gray-400">Powered by Claude</p>
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                    <button
                        key={s.text}
                        onClick={() => onPromptClick(s.text)}
                        className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-left text-sm text-gray-700 transition-all hover:border-violet-300 hover:bg-violet-50 hover:shadow-sm"
                    >
                        <s.icon className={`h-5 w-5 shrink-0 ${s.color}`} />
                        <span>{s.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
