import { useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatHeaderProps {
    title: string;
    isNewChat: boolean;
    onRename: (title: string) => void;
}

export default function ChatHeader({ title, isNewChat, onRename }: ChatHeaderProps) {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(title);

    const confirmEdit = () => {
        if (editValue.trim()) {
            onRename(editValue.trim());
        }
        setEditing(false);
    };

    return (
        <div className="flex items-center justify-between border-b bg-white px-6 py-3">
            <div className="flex items-center gap-3 min-w-0">
                {editing ? (
                    <div className="flex items-center gap-2">
                        <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmEdit();
                                if (e.key === 'Escape') setEditing(false);
                            }}
                            className="h-8 w-64 text-sm"
                            autoFocus
                        />
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={confirmEdit}>
                            <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(false)}>
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 min-w-0">
                        <h2 className="truncate text-sm font-semibold text-gray-800">
                            {isNewChat ? 'New conversation' : title}
                        </h2>
                        {!isNewChat && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => {
                                    setEditValue(title);
                                    setEditing(true);
                                }}
                            >
                                <Pencil className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
            <Badge variant="secondary" className="shrink-0 bg-gray-100 text-xs text-gray-500">
                Claude Sonnet 4.6
            </Badge>
        </div>
    );
}
