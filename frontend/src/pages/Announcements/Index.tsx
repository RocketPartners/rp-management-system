import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { usePermission } from '@/hooks/usePermission';
import {
    apiGet,
    apiPost,
    apiDelete,
    apiPatch,
} from '@/lib/spring-boot-api';
import type {
    AnnouncementResponse,
    AnnouncementComment,
    PagedResponse,
} from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ChevronDown,
    ChevronUp,
    Megaphone,
    MessageCircle,
    MoreHorizontal,
    Edit,
    Trash2,
    Pin,
    PinOff,
    Plus,
    Send,
    X,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import CreateEditDialog from './CreateEditDialog';

// ============================================
// Constants
// ============================================

const CATEGORIES = [
    { value: '', label: 'All' },
    { value: 'COMPANY_NEWS', label: 'Company News' },
    { value: 'EVENTS', label: 'Events' },
    { value: 'FUN', label: 'Fun' },
    { value: 'HR_UPDATES', label: 'HR Updates' },
    { value: 'GENERAL', label: 'General' },
];

const CATEGORY_COLORS: Record<string, string> = {
    COMPANY_NEWS: 'bg-blue-100 text-blue-700',
    EVENTS: 'bg-purple-100 text-purple-700',
    FUN: 'bg-pink-100 text-pink-700',
    HR_UPDATES: 'bg-amber-100 text-amber-700',
    GENERAL: 'bg-gray-100 text-gray-700',
};

const EMOJI_MAP: Record<string, string> = {
    thumbs_up: '\uD83D\uDC4D',
    heart: '\u2764\uFE0F',
    fire: '\uD83D\uDD25',
    clap: '\uD83D\uDC4F',
    laugh: '\uD83D\uDE02',
    wow: '\uD83D\uDE2E',
};

const EMOJI_LABELS: Record<string, string> = {
    thumbs_up: 'Like',
    heart: 'Love',
    fire: 'Fire',
    clap: 'Applause',
    laugh: 'Haha',
    wow: 'Wow',
};

// ============================================
// Helpers
// ============================================

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCategoryLabel(category: string): string {
    return CATEGORIES.find((c) => c.value === category)?.label || category;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// ============================================
// Avatar Component
// ============================================

function UserAvatar({ name, imageUrl, size = 'md' }: { name: string; imageUrl?: string | null; size?: 'sm' | 'md' }) {
    const sizeClasses = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
    if (imageUrl) {
        return <img src={imageUrl} alt={name} className={`${sizeClasses} rounded-full object-cover`} />;
    }
    return (
        <div
            className={`${sizeClasses} flex items-center justify-center rounded-full bg-blue-600 font-semibold text-white`}
        >
            {getInitials(name)}
        </div>
    );
}

// ============================================
// Reaction Bar Component
// ============================================

function ReactionBar({
    announcementId,
    reactions,
    userReactions,
}: {
    announcementId: number;
    reactions: Record<string, number>;
    userReactions: string[];
}) {
    const queryClient = useQueryClient();

    const toggleReaction = useMutation({
        mutationFn: (emoji: string) =>
            apiPost<Record<string, unknown>>(`/announcements/${announcementId}/reactions`, { emoji }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
    });

    return (
        <div className="space-y-2">
            {/* Reaction summary */}
            {Object.keys(reactions).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {Object.entries(reactions).map(([emoji, count]) => (
                        <button
                            key={emoji}
                            onClick={() => toggleReaction.mutate(emoji)}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                                userReactions.includes(emoji)
                                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <span>{EMOJI_MAP[emoji] || emoji}</span>
                            <span>{count}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Reaction picker */}
            <div className="flex items-center gap-1">
                {Object.entries(EMOJI_MAP).map(([key, emoji]) => (
                    <button
                        key={key}
                        onClick={() => toggleReaction.mutate(key)}
                        title={EMOJI_LABELS[key]}
                        className={`rounded-lg p-1.5 text-lg transition-all hover:scale-110 hover:bg-gray-100 ${
                            userReactions.includes(key) ? 'bg-blue-50' : ''
                        }`}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ============================================
// Comment Thread Component
// ============================================

function CommentThread({
    announcementId,
    commentsCount,
}: {
    announcementId: number;
    commentsCount: number;
}) {
    const [expanded, setExpanded] = useState(false);
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: comments } = useQuery({
        queryKey: ['announcements', announcementId, 'comments'],
        queryFn: () => apiGet<AnnouncementComment[]>(`/announcements/${announcementId}/comments`),
        enabled: expanded,
    });

    const addComment = useMutation({
        mutationFn: (body: { body: string; parentId: number | null }) =>
            apiPost<AnnouncementComment>(`/announcements/${announcementId}/comments`, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements', announcementId, 'comments'] });
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            setCommentText('');
            setReplyText('');
            setReplyTo(null);
        },
    });

    const deleteComment = useMutation({
        mutationFn: (commentId: number) =>
            apiDelete(`/announcements/${announcementId}/comments/${commentId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements', announcementId, 'comments'] });
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            toast.success('Comment deleted');
        },
    });

    const handleSubmitComment = () => {
        if (!commentText.trim()) return;
        addComment.mutate({ body: commentText.trim(), parentId: null });
    };

    const handleSubmitReply = (parentId: number) => {
        if (!replyText.trim()) return;
        addComment.mutate({ body: replyText.trim(), parentId });
    };

    return (
        <div className="border-t border-gray-100 pt-3">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
                <MessageCircle className="h-4 w-4" />
                {commentsCount > 0 ? `${commentsCount} comment${commentsCount !== 1 ? 's' : ''}` : 'Add a comment'}
                {commentsCount > 0 && (expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
            </button>

            {expanded && (
                <div className="mt-3 space-y-3">
                    {/* Existing comments */}
                    {comments?.map((comment) => (
                        <div key={comment.id} className="space-y-2">
                            <div className="flex gap-2.5">
                                <UserAvatar name={comment.userName} imageUrl={comment.userImageUrl} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <div className="rounded-xl bg-gray-50 px-3.5 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {comment.userName}
                                            </span>
                                            {comment.userPosition && (
                                                <span className="text-xs text-gray-400">{comment.userPosition}</span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-sm text-gray-700">{comment.body}</p>
                                    </div>
                                    <div className="mt-1 flex items-center gap-3 px-1">
                                        <span className="text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
                                        <button
                                            onClick={() => {
                                                setReplyTo(replyTo === comment.id ? null : comment.id);
                                                setReplyText('');
                                            }}
                                            className="text-xs font-medium text-gray-500 hover:text-blue-600"
                                        >
                                            Reply
                                        </button>
                                        {comment.userId === user?.id && (
                                            <button
                                                onClick={() => deleteComment.mutate(comment.id)}
                                                className="text-xs font-medium text-gray-400 hover:text-red-500"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Replies */}
                            {comment.replies?.length > 0 && (
                                <div className="ml-10 space-y-2 border-l-2 border-gray-100 pl-3">
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className="flex gap-2.5">
                                            <UserAvatar name={reply.userName} imageUrl={reply.userImageUrl} size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <div className="rounded-xl bg-gray-50 px-3.5 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {reply.userName}
                                                        </span>
                                                        {reply.userPosition && (
                                                            <span className="text-xs text-gray-400">
                                                                {reply.userPosition}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-0.5 text-sm text-gray-700">{reply.body}</p>
                                                </div>
                                                <div className="mt-1 flex items-center gap-3 px-1">
                                                    <span className="text-xs text-gray-400">
                                                        {formatRelativeTime(reply.createdAt)}
                                                    </span>
                                                    {reply.userId === user?.id && (
                                                        <button
                                                            onClick={() => deleteComment.mutate(reply.id)}
                                                            className="text-xs font-medium text-gray-400 hover:text-red-500"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply input */}
                            {replyTo === comment.id && (
                                <div className="ml-10 flex items-center gap-2">
                                    <Input
                                        placeholder={`Reply to ${comment.userName}...`}
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply(comment.id)}
                                        className="text-sm"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={() => handleSubmitReply(comment.id)}
                                        disabled={!replyText.trim() || addComment.isPending}
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* New comment input */}
                    <div className="flex items-center gap-2 pt-1">
                        <UserAvatar name={user?.name || 'You'} size="sm" />
                        <Input
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                            className="text-sm"
                        />
                        <Button
                            size="sm"
                            onClick={handleSubmitComment}
                            disabled={!commentText.trim() || addComment.isPending}
                        >
                            <Send className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// Image Lightbox
// ============================================

function ImageLightbox({
    images,
    selectedIndex,
    onClose,
}: {
    images: { url: string; fileName: string }[];
    selectedIndex: number;
    onClose: () => void;
}) {
    const [current, setCurrent] = useState(selectedIndex);
    return (
        <Dialog open onOpenChange={() => onClose()}>
            <DialogContent className="max-w-4xl bg-black/95 border-none p-0">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-50 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30"
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="flex items-center justify-center p-8">
                    <img
                        src={images[current].url}
                        alt={images[current].fileName}
                        className="max-h-[80vh] max-w-full rounded-lg object-contain"
                    />
                </div>
                {images.length > 1 && (
                    <div className="flex justify-center gap-2 pb-4">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-2 w-2 rounded-full transition-all ${
                                    i === current ? 'bg-white scale-125' : 'bg-white/40'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// Announcement Card
// ============================================

function AnnouncementCard({
    announcement,
    onEdit,
    onDelete,
    onTogglePin,
}: {
    announcement: AnnouncementResponse;
    onEdit: (a: AnnouncementResponse) => void;
    onDelete: (id: number) => void;
    onTogglePin: (id: number) => void;
}) {
    const { user } = useAuth();
    const { can } = usePermission();
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const isAuthor = user?.id === announcement.authorId;
    const canManage = isAuthor || can('announcements.create');
    const isAdmin = can('users.view');

    return (
        <Card
            className={`overflow-hidden transition-shadow hover:shadow-md ${
                announcement.isPinned ? 'border-l-4 border-l-blue-500' : ''
            }`}
        >
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <UserAvatar
                            name={announcement.authorName}
                            imageUrl={announcement.authorImageUrl}
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                    {announcement.authorName}
                                </span>
                                {announcement.isPinned && (
                                    <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-600 text-xs">
                                        <Pin className="h-3 w-3" />
                                        Pinned
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                {announcement.authorPosition && (
                                    <>
                                        <span>{announcement.authorPosition}</span>
                                        <span>·</span>
                                    </>
                                )}
                                <Badge
                                    variant="secondary"
                                    className={`text-[10px] px-1.5 py-0 ${CATEGORY_COLORS[announcement.category] || ''}`}
                                >
                                    {formatCategoryLabel(announcement.category)}
                                </Badge>
                                <span>·</span>
                                <span>{formatRelativeTime(announcement.publishedAt)}</span>
                            </div>
                        </div>
                    </div>

                    {canManage && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(announcement)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <DropdownMenuItem onClick={() => onTogglePin(announcement.id)}>
                                        {announcement.isPinned ? (
                                            <>
                                                <PinOff className="mr-2 h-4 w-4" />
                                                Unpin
                                            </>
                                        ) : (
                                            <>
                                                <Pin className="mr-2 h-4 w-4" />
                                                Pin
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => onDelete(announcement.id)}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Title */}
                <h3 className="mt-4 text-xl font-bold text-gray-900">{announcement.title}</h3>

                {/* Body */}
                <div
                    className="prose prose-sm mt-3 max-w-none text-gray-700 [&_img]:max-w-full [&_img]:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: announcement.body }}
                />

                {/* Gallery */}
                {announcement.images.length > 0 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                        {announcement.images.map((img, i) => (
                            <button
                                key={img.id}
                                onClick={() => setLightboxIndex(i)}
                                className="flex-shrink-0 overflow-hidden rounded-xl transition-transform hover:scale-[1.02]"
                            >
                                <img
                                    src={img.url}
                                    alt={img.fileName}
                                    className="h-48 w-auto max-w-[300px] object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* Lightbox */}
                {lightboxIndex !== null && (
                    <ImageLightbox
                        images={announcement.images}
                        selectedIndex={lightboxIndex}
                        onClose={() => setLightboxIndex(null)}
                    />
                )}

                {/* Reactions */}
                <div className="mt-4">
                    <ReactionBar
                        announcementId={announcement.id}
                        reactions={announcement.reactions}
                        userReactions={announcement.userReactions}
                    />
                </div>

                {/* Comments */}
                <div className="mt-3">
                    <CommentThread
                        announcementId={announcement.id}
                        commentsCount={announcement.commentsCount}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

// ============================================
// Main Page Component
// ============================================

export default function AnnouncementList() {
    const { can } = usePermission();
    const queryClient = useQueryClient();
    const [activeCategory, setActiveCategory] = useState('');
    const [page, setPage] = useState(0);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editAnnouncement, setEditAnnouncement] = useState<AnnouncementResponse | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['announcements', activeCategory, page],
        queryFn: () => {
            const params = new URLSearchParams();
            if (activeCategory) params.set('category', activeCategory);
            params.set('page', String(page));
            params.set('size', '10');
            const qs = params.toString();
            return apiGet<PagedResponse<AnnouncementResponse>>(`/announcements?${qs}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiDelete(`/announcements/${id}`),
        onSuccess: () => {
            toast.success('Announcement deleted');
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const togglePinMutation = useMutation({
        mutationFn: (id: number) => apiPatch(`/announcements/${id}/pin`),
        onSuccess: () => {
            toast.success('Pin status updated');
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
    });

    const handleCategoryChange = useCallback((cat: string) => {
        setActiveCategory(cat);
        setPage(0);
    }, []);

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <>
            <Helmet>
                <title>Announcements | RP Management</title>
            </Helmet>

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                            <Megaphone className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                            <p className="text-sm text-gray-500">
                                A space for the team to share updates, wins, and good vibes
                            </p>
                        </div>
                    </div>
                    {can('announcements.create') && (
                        <Button
                            onClick={() => setCreateDialogOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            New Post
                        </Button>
                    )}
                </div>

                {/* Category Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => handleCategoryChange(cat.value)}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                                activeCategory === cat.value
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Feed */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                    <Skeleton className="mt-4 h-5 w-3/4" />
                                    <Skeleton className="mt-3 h-20 w-full" />
                                    <div className="mt-4 flex gap-2">
                                        <Skeleton className="h-7 w-14 rounded-full" />
                                        <Skeleton className="h-7 w-14 rounded-full" />
                                        <Skeleton className="h-7 w-14 rounded-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : data?.content.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Megaphone className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">No announcements yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {activeCategory
                                    ? 'No posts in this category. Try another filter.'
                                    : 'Be the first to share something with the team!'}
                            </p>
                            {can('announcements.create') && !activeCategory && (
                                <Button
                                    onClick={() => setCreateDialogOpen(true)}
                                    className="mt-4 gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create First Post
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {data?.content.map((announcement) => (
                            <AnnouncementCard
                                key={announcement.id}
                                announcement={announcement}
                                onEdit={(a) => setEditAnnouncement(a)}
                                onDelete={handleDelete}
                                onTogglePin={(id) => togglePinMutation.mutate(id)}
                            />
                        ))}
                    </div>
                )}

                {/* Load More */}
                {data && !data.last && (
                    <div className="flex justify-center pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setPage((p) => p + 1)}
                            className="px-8"
                        >
                            Load More
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <CreateEditDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            {/* Edit Dialog */}
            {editAnnouncement && (
                <CreateEditDialog
                    open={!!editAnnouncement}
                    onOpenChange={(open) => !open && setEditAnnouncement(null)}
                    announcement={editAnnouncement}
                />
            )}
        </>
    );
}
