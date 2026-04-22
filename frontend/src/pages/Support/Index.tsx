import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/contexts/auth-context';
import {
    apiGet,
    apiPatch,
    apiPostFormData,
} from '@/lib/spring-boot-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Bug,
    HelpCircle,
    Lightbulb,
    LifeBuoy,
    MessageSquare,
    Paperclip,
    Plus,
    Send,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

// ============================================
// Types
// ============================================

interface PagedResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

interface TicketResponse {
    id: number;
    subject: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    userId: number;
    userName: string;
    messageCount: number;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

interface TicketAttachmentResponse {
    id: number;
    fileName: string;
    storedPath: string;
    contentType: string;
    fileSize: number;
    downloadUrl: string;
    createdAt: string;
}

interface TicketMessageResponse {
    id: number;
    userId: number | null;
    userName: string;
    userProfilePicture: string | null;
    isSupport: boolean;
    message: string;
    attachments: TicketAttachmentResponse[];
    createdAt: string;
}

interface TicketDetailResponse {
    id: number;
    subject: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    userId: number;
    userName: string;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
    messages: TicketMessageResponse[];
    attachments: TicketAttachmentResponse[];
}

// ============================================
// Helpers
// ============================================

const STATUS_COLORS: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-purple-100 text-purple-800',
    closed: 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800',
};

const CATEGORY_ICONS: Record<string, typeof Bug> = {
    bug: Bug,
    feature: Lightbulb,
    question: HelpCircle,
    other: LifeBuoy,
};

function formatStatus(status: string) {
    if (status === 'in_progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatRelativeDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatFullDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================
// Component
// ============================================

export default function SupportIndex() {
    const { user } = useAuth();
    const { can } = usePermission();
    const queryClient = useQueryClient();

    const isAdmin = can('TICKET_MANAGE') || can('tickets.manage');

    // Filters
    const [statusFilter, setStatusFilter] = useState('open');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [messageFiles, setMessageFiles] = useState<File[]>([]);
    const [createFiles, setCreateFiles] = useState<File[]>([]);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const messageFileRef = useRef<HTMLInputElement>(null);
    const createFileRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        priority: 'medium',
        description: '',
        category: 'bug',
    });

    // ---- Queries ----

    const buildQueryParams = useCallback(() => {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (categoryFilter !== 'all') params.set('category', categoryFilter);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        params.set('page', String(page));
        params.set('size', '20');
        return params.toString();
    }, [statusFilter, categoryFilter, searchQuery, page]);

    const {
        data: ticketsData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['tickets', statusFilter, categoryFilter, searchQuery, page],
        queryFn: () =>
            apiGet<PagedResponse<TicketResponse>>(`/tickets?${buildQueryParams()}`),
    });

    const tickets = ticketsData?.content ?? [];
    const totalElements = ticketsData?.totalElements ?? 0;

    const {
        data: selectedTicket,
        isLoading: isDetailLoading,
    } = useQuery({
        queryKey: ['ticket', selectedTicketId],
        queryFn: () => apiGet<TicketDetailResponse>(`/tickets/${selectedTicketId}`),
        enabled: selectedTicketId !== null,
    });

    // Scroll to bottom of messages when ticket loads
    useEffect(() => {
        if (selectedTicket?.messages?.length) {
            setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    }, [selectedTicket?.messages?.length]);

    // ---- Mutations ----

    const createMutation = useMutation({
        mutationFn: (data: { form: typeof formData; files: File[] }) => {
            const fd = new FormData();
            fd.append('ticket', new Blob([JSON.stringify(data.form)], { type: 'application/json' }));
            data.files.forEach((f) => fd.append('files', f));
            return apiPostFormData<TicketDetailResponse>('/tickets', fd);
        },
        onSuccess: () => {
            toast.success('Ticket created successfully');
            handleCloseDialog();
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const messageMutation = useMutation({
        mutationFn: (data: { ticketId: number; message: string; files: File[] }) => {
            const fd = new FormData();
            fd.append('message', new Blob([JSON.stringify({ message: data.message })], { type: 'application/json' }));
            data.files.forEach((f) => fd.append('files', f));
            return apiPostFormData<TicketMessageResponse>(`/tickets/${data.ticketId}/messages`, fd);
        },
        onSuccess: (_data, variables) => {
            setNewMessage('');
            setMessageFiles([]);
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const statusMutation = useMutation({
        mutationFn: (data: { ticketId: number; status: string }) =>
            apiPatch<TicketDetailResponse>(`/tickets/${data.ticketId}/status`, {
                status: data.status,
            }),
        onSuccess: (_data, variables) => {
            toast.success(`Ticket status updated to ${formatStatus(variables.status)}`);
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // ---- Handlers ----

    const handleOpenDialog = (category = 'bug') => {
        setFormData({ subject: '', priority: 'medium', description: '', category });
        setCreateFiles([]);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setFormData({ subject: '', priority: 'medium', description: '', category: 'bug' });
        setCreateFiles([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ form: formData, files: createFiles });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicketId) return;
        messageMutation.mutate({
            ticketId: selectedTicketId,
            message: newMessage.trim(),
            files: messageFiles,
        });
    };

    const handleStatusChange = (newStatus: string) => {
        if (!selectedTicketId || !isAdmin) return;
        statusMutation.mutate({ ticketId: selectedTicketId, status: newStatus });
    };

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [statusFilter, categoryFilter, searchQuery]);

    return (
        <>
            <Helmet>
                <title>Support</title>
            </Helmet>

            {/* Header — white bg strip */}
            <div className="border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 lg:text-3xl">Support</h1>
                        <p className="hidden mt-1 text-gray-600 lg:block">
                            Submit and track your support tickets
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => handleOpenDialog('feature')}
                    >
                        <Plus className="h-4 w-4" />
                        New Ticket
                    </Button>
                </div>
            </div>

            <div className="p-4 lg:p-8">
                {/* Filters Bar */}
                <div className="mb-4 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-center lg:gap-4">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full lg:max-w-md"
                        />
                    </div>
                    <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="flex-1 lg:w-40 lg:flex-none">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="all">All Status</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="flex-1 lg:w-48 lg:flex-none">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="bug">Bug</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="question">Question</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                    <div className="text-xs text-gray-500 lg:ml-auto lg:text-sm">
                        {tickets.length > 0
                            ? `1-${tickets.length} of ${totalElements}`
                            : `0 of ${totalElements}`}
                    </div>
                </div>

                {/* Tickets List */}
                <div className="min-h-[400px] rounded-lg border border-gray-200 bg-white">
                    {isLoading ? (
                        <div className="divide-y divide-gray-200">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4">
                                    <Skeleton className="mb-2 h-5 w-64" />
                                    <Skeleton className="mb-2 h-4 w-full max-w-lg" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="flex h-[400px] items-center justify-center">
                            <div className="py-12 text-center">
                                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                    Failed to load tickets
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        queryClient.invalidateQueries({ queryKey: ['tickets'] })
                                    }
                                >
                                    Try again
                                </Button>
                            </div>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="flex h-[400px] items-center justify-center">
                            <div className="py-12 text-center">
                                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                    No tickets found
                                </h3>
                                <p className="mb-6 text-gray-500">
                                    Click &quot;New Ticket&quot; to submit a support request.
                                </p>
                                <Button
                                    className="mx-auto flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={() => handleOpenDialog('feature')}
                                >
                                    <Plus className="h-4 w-4" />
                                    New Ticket
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full divide-y divide-gray-200">
                            {tickets.map((ticket) => {
                                const CategoryIcon = CATEGORY_ICONS[ticket.category] ?? LifeBuoy;
                                return (
                                    <div
                                        key={ticket.id}
                                        className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
                                            selectedTicketId === ticket.id
                                                ? 'bg-blue-50 hover:bg-blue-50'
                                                : ''
                                        }`}
                                        onClick={() => setSelectedTicketId(ticket.id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <h3 className="truncate text-base font-semibold text-gray-900">
                                                        {ticket.subject}
                                                    </h3>
                                                    <Badge
                                                        className={`${PRIORITY_COLORS[ticket.priority] ?? 'bg-gray-100 text-gray-800'} border-0 text-xs`}
                                                    >
                                                        {capitalize(ticket.priority)}
                                                    </Badge>
                                                </div>
                                                <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                                                    {ticket.description}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <CategoryIcon className="h-3 w-3" />
                                                        {capitalize(ticket.category)}
                                                    </span>
                                                    <span>&bull;</span>
                                                    <span>Ticket #{ticket.id}</span>
                                                    {isAdmin && ticket.userName && (
                                                        <>
                                                            <span>&bull;</span>
                                                            <span>{ticket.userName}</span>
                                                        </>
                                                    )}
                                                    <span>&bull;</span>
                                                    <span>
                                                        Updated{' '}
                                                        {formatRelativeDate(ticket.updatedAt)}
                                                    </span>
                                                    {ticket.messageCount > 0 && (
                                                        <>
                                                            <span>&bull;</span>
                                                            <span className="flex items-center gap-1">
                                                                <MessageSquare className="h-3 w-3" />
                                                                {ticket.messageCount}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                <Badge
                                                    className={`${STATUS_COLORS[ticket.status] ?? 'bg-gray-100 text-gray-800'} border-0`}
                                                >
                                                    {formatStatus(ticket.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {ticketsData && ticketsData.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Page {ticketsData.pageNumber + 1} of {ticketsData.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={ticketsData.first}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={ticketsData.last}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {/* Ticket Conversation Panel */}
                {selectedTicketId && (
                    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
                        {isDetailLoading ? (
                            <div className="p-6">
                                <Skeleton className="mb-4 h-6 w-64" />
                                <Skeleton className="mb-2 h-4 w-48" />
                                <Separator className="my-4" />
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="flex gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="flex-1">
                                                <Skeleton className="mb-1 h-3 w-24" />
                                                <Skeleton className="h-16 w-3/4 rounded-lg" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : selectedTicket ? (
                            <>
                                {/* Conversation Header */}
                                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <h2 className="text-lg font-semibold text-gray-900">
                                                {selectedTicket.subject}
                                            </h2>
                                            {isAdmin ? (
                                                <Select
                                                    value={selectedTicket.status}
                                                    onValueChange={handleStatusChange}
                                                >
                                                    <SelectTrigger className="h-7 w-36">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="open">Open</SelectItem>
                                                        <SelectItem value="in_progress">
                                                            In Progress
                                                        </SelectItem>
                                                        <SelectItem value="resolved">
                                                            Resolved
                                                        </SelectItem>
                                                        <SelectItem value="closed">
                                                            Closed
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge
                                                    className={`${STATUS_COLORS[selectedTicket.status] ?? 'bg-gray-100 text-gray-800'} border-0`}
                                                >
                                                    {formatStatus(selectedTicket.status)}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Ticket #{selectedTicket.id} &bull; Created{' '}
                                            {formatFullDate(selectedTicket.createdAt)}
                                            {isAdmin &&
                                                selectedTicket.userName &&
                                                ` \u2022 Reported by ${selectedTicket.userName}`}
                                            {selectedTicket.resolvedAt && (
                                                <span className="font-medium text-green-600">
                                                    {' '}
                                                    &bull; Resolved{' '}
                                                    {formatFullDate(selectedTicket.resolvedAt)}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setSelectedTicketId(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Description */}
                                <div className="border-b border-gray-100 bg-white px-6 py-4">
                                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                                        {selectedTicket.description}
                                    </p>
                                    {selectedTicket.attachments.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {selectedTicket.attachments.map((att) => (
                                                <a
                                                    key={att.id}
                                                    href={`${import.meta.env.VITE_SPRING_BOOT_API_URL || 'http://localhost:8080/api/v1'}${att.downloadUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                                                >
                                                    <Paperclip className="h-3 w-3" />
                                                    {att.fileName}
                                                    <span className="text-gray-400">
                                                        ({formatFileSize(att.fileSize)})
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Messages */}
                                <div className="max-h-[500px] space-y-4 overflow-y-auto p-6">
                                    {selectedTicket.messages.length === 0 ? (
                                        <p className="py-8 text-center text-sm text-gray-400">
                                            No messages yet. Start the conversation below.
                                        </p>
                                    ) : (
                                        selectedTicket.messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.isSupport ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] ${msg.isSupport ? '' : 'flex flex-col items-end'}`}
                                                >
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span className="text-xs font-medium text-gray-700">
                                                            {msg.userName}
                                                        </span>
                                                        {msg.isSupport && (
                                                            <Badge className="h-4 border-0 bg-blue-100 px-1.5 text-[10px] text-blue-700">
                                                                Support
                                                            </Badge>
                                                        )}
                                                        <span
                                                            className="text-xs text-gray-500"
                                                            title={formatFullDate(msg.createdAt)}
                                                        >
                                                            {formatRelativeDate(msg.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`rounded-lg px-4 py-2 ${
                                                            msg.isSupport
                                                                ? 'bg-gray-100 text-gray-900'
                                                                : 'bg-blue-600 text-white'
                                                        }`}
                                                    >
                                                        <p className="whitespace-pre-wrap text-sm">
                                                            {msg.message}
                                                        </p>
                                                    </div>
                                                    {msg.attachments.length > 0 && (
                                                        <div className="mt-1 flex flex-wrap gap-1.5">
                                                            {msg.attachments.map((att) => (
                                                                <a
                                                                    key={att.id}
                                                                    href={`${import.meta.env.VITE_SPRING_BOOT_API_URL || 'http://localhost:8080/api/v1'}${att.downloadUrl}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                                                                >
                                                                    <Paperclip className="h-3 w-3" />
                                                                    {att.fileName}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messageEndRef} />
                                </div>

                                {/* Message Input */}
                                {selectedTicket.status !== 'closed' && (
                                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                                        <form onSubmit={handleSendMessage} className="space-y-2">
                                            <div className="flex gap-2">
                                                <Textarea
                                                    placeholder="Type your message..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    rows={2}
                                                    className="flex-1 resize-none"
                                                />
                                                <div className="flex flex-col gap-1 self-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9"
                                                        onClick={() => messageFileRef.current?.click()}
                                                    >
                                                        <Paperclip className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        className="h-9 w-9 bg-blue-600 text-white hover:bg-blue-700"
                                                        size="icon"
                                                        disabled={
                                                            !newMessage.trim() ||
                                                            messageMutation.isPending
                                                        }
                                                    >
                                                        <Send className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <input
                                                ref={messageFileRef}
                                                type="file"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        setMessageFiles(Array.from(e.target.files));
                                                    }
                                                }}
                                            />
                                            {messageFiles.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {messageFiles.map((f, i) => (
                                                        <span
                                                            key={i}
                                                            className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
                                                        >
                                                            <Paperclip className="h-3 w-3" />
                                                            {f.name}
                                                            <button
                                                                type="button"
                                                                className="ml-0.5 text-gray-400 hover:text-gray-600"
                                                                onClick={() =>
                                                                    setMessageFiles((prev) =>
                                                                        prev.filter((_, idx) => idx !== i),
                                                                    )
                                                                }
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </form>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                )}

                {/* Create Ticket Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-blue-600" />
                                Create New Ticket
                            </DialogTitle>
                            <DialogDescription>
                                Provide details about your request and we&apos;ll get back to you as
                                soon as possible.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(v) =>
                                            setFormData((d) => ({ ...d, category: v }))
                                        }
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bug">Bug Report</SelectItem>
                                            <SelectItem value="feature">Feature Request</SelectItem>
                                            <SelectItem value="question">Question</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject *</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Brief description of the issue"
                                        value={formData.subject}
                                        onChange={(e) =>
                                            setFormData((d) => ({ ...d, subject: e.target.value }))
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(v) =>
                                            setFormData((d) => ({ ...d, priority: v }))
                                        }
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe your request in detail..."
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData((d) => ({
                                                ...d,
                                                description: e.target.value,
                                            }))
                                        }
                                        rows={6}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Attachments</Label>
                                    <div
                                        className="cursor-pointer rounded-md border-2 border-dashed border-gray-200 p-4 text-center transition-colors hover:border-gray-300"
                                        onClick={() => createFileRef.current?.click()}
                                    >
                                        <Paperclip className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                                        <p className="text-sm text-gray-500">
                                            Click to attach files
                                        </p>
                                    </div>
                                    <input
                                        ref={createFileRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setCreateFiles(Array.from(e.target.files));
                                            }
                                        }}
                                    />
                                    {createFiles.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {createFiles.map((f, i) => (
                                                <span
                                                    key={i}
                                                    className="flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600"
                                                >
                                                    <Paperclip className="h-3 w-3" />
                                                    {f.name}
                                                    <button
                                                        type="button"
                                                        className="ml-0.5 text-gray-400 hover:text-gray-600"
                                                        onClick={() =>
                                                            setCreateFiles((prev) =>
                                                                prev.filter((_, idx) => idx !== i),
                                                            )
                                                        }
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={handleCloseDialog}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
