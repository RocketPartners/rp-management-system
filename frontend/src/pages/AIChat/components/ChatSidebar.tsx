import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    MessageSquarePlus,
    Pencil,
    Trash2,
    Check,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { AIChatSessionResponse } from '@/types';

interface ChatSidebarProps {
    sessions: AIChatSessionResponse[];
    collapsed: boolean;
    onToggle: () => void;
    onRename: (id: number, title: string) => void;
    onDelete: (id: number) => void;
}

function groupByDate(sessions: AIChatSessionResponse[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: { label: string; items: AIChatSessionResponse[] }[] = [
        { label: 'Today', items: [] },
        { label: 'Yesterday', items: [] },
        { label: 'Previous 7 Days', items: [] },
        { label: 'Older', items: [] },
    ];

    for (const s of sessions) {
        const d = new Date(s.updatedAt);
        if (d >= today) groups[0].items.push(s);
        else if (d >= yesterday) groups[1].items.push(s);
        else if (d >= weekAgo) groups[2].items.push(s);
        else groups[3].items.push(s);
    }

    return groups.filter((g) => g.items.length > 0);
}

export default function ChatSidebar({ sessions, collapsed, onToggle, onRename, onDelete }: ChatSidebarProps) {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const groups = groupByDate(sessions);

    const startRename = (s: AIChatSessionResponse) => {
        setEditingId(s.id);
        setEditTitle(s.title);
    };

    const confirmRename = () => {
        if (editingId && editTitle.trim()) {
            onRename(editingId, editTitle.trim());
        }
        setEditingId(null);
    };

    const confirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId);
            if (Number(sessionId) === deleteId) {
                navigate('/ai-chat');
            }
        }
        setDeleteId(null);
    };

    if (collapsed) {
        return (
            <div className="flex h-full w-12 flex-col items-center border-r bg-white py-3 gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onToggle}
                    title="Expand sidebar"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-violet-600"
                    onClick={() => navigate('/ai-chat')}
                    title="New chat"
                >
                    <MessageSquarePlus className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="flex h-full w-72 flex-col border-r bg-white">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h2 className="text-sm font-semibold text-gray-700">Conversations</h2>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-violet-600 hover:bg-violet-50"
                            onClick={() => navigate('/ai-chat')}
                            title="New chat"
                        >
                            <MessageSquarePlus className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={onToggle}
                            title="Collapse sidebar"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto px-2 py-2">
                    {sessions.length === 0 ? (
                        <p className="px-2 py-8 text-center text-xs text-gray-400">
                            No conversations yet. Start a new chat!
                        </p>
                    ) : (
                        groups.map((group) => (
                            <div key={group.label} className="mb-3">
                                <p className="mb-1 px-2 text-xs font-medium text-gray-400">
                                    {group.label}
                                </p>
                                {group.items.map((s) => {
                                    const isActive = Number(sessionId) === s.id;
                                    const isEditing = editingId === s.id;

                                    return (
                                        <div
                                            key={s.id}
                                            className={`group relative flex items-center rounded-lg px-2 py-2 text-sm transition-colors ${
                                                isActive
                                                    ? 'border-l-2 border-violet-500 bg-violet-50 text-violet-900'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {isEditing ? (
                                                <div className="flex w-full items-center gap-1">
                                                    <Input
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') confirmRename();
                                                            if (e.key === 'Escape') setEditingId(null);
                                                        }}
                                                        className="h-7 text-xs"
                                                        autoFocus
                                                    />
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={confirmRename}>
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingId(null)}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Link
                                                        to={`/ai-chat/${s.id}`}
                                                        className="min-w-0 flex-1"
                                                    >
                                                        <p className="truncate font-medium">{s.title}</p>
                                                        {s.lastMessagePreview && (
                                                            <p className="truncate text-xs text-gray-400">
                                                                {s.lastMessagePreview}
                                                            </p>
                                                        )}
                                                    </Link>
                                                    <div className="ml-1 flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                startRename(s);
                                                            }}
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-red-500"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteId(s.id);
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Delete confirmation */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this conversation and all its messages.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
