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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermission } from '@/hooks/use-permission';
import {
    apiDelete,
    apiGet,
    apiPost,
    apiPut,
} from '@/lib/spring-boot-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Ban,
    CalendarPlus,
    CheckCircle2,
    Clock,
    Copy,
    Eye,
    Loader2,
    Mail,
    MoreVertical,
    Plus,
    Send,
    Trash2,
    UserPlus,
    X,
} from 'lucide-react';
import { useState } from 'react';
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

interface InviteResponse {
    id: number;
    token: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    position: string | null;
    department: string | null;
    status: string;
    inviteLink: string;
    expiresAt: string;
    acceptedAt: string | null;
    invitedById: number | null;
    invitedByName: string | null;
    expired: boolean;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// Helpers
// ============================================

const STATUS_COLORS: Record<string, string> = {
    pending: 'border-yellow-200 bg-yellow-100 text-yellow-700',
    accepted: 'border-blue-200 bg-blue-100 text-blue-700',
    expired: 'border-gray-200 bg-gray-100 text-gray-700',
    cancelled: 'border-red-200 bg-red-100 text-red-700',
};

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// Component
// ============================================

export default function OnboardingInvites() {
    const { can } = usePermission();
    const queryClient = useQueryClient();
    const canManage = can('onboarding.manage');

    // State
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showExtendDialog, setShowExtendDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedInvite, setSelectedInvite] = useState<InviteResponse | null>(null);

    // Create form
    const [createForm, setCreateForm] = useState({
        email: '',
        firstName: '',
        lastName: '',
        position: '',
        department: '',
    });

    // Extend form
    const [extendDate, setExtendDate] = useState('');

    // Queries
    const { data: invitesData, isLoading } = useQuery({
        queryKey: ['onboarding-invites', page, search, statusFilter],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('size', '20');
            if (search) params.set('search', search);
            if (statusFilter) params.set('status', statusFilter);
            return apiGet<PagedResponse<InviteResponse>>(`/onboarding/invites?${params}`);
        },
    });

    const invites = invitesData?.content ?? [];
    const totalElements = invitesData?.totalElements ?? 0;

    // Compute stats from the full list (client-side approximation)
    const stats = {
        total: totalElements,
        pending: invites.filter((i) => i.status === 'pending').length,
        accepted: invites.filter((i) => i.status === 'accepted').length,
        cancelled: invites.filter((i) => i.status === 'cancelled').length,
    };

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: typeof createForm) => apiPost<InviteResponse>('/onboarding/invites', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-invites'] });
            setShowCreateDialog(false);
            setCreateForm({ email: '', firstName: '', lastName: '', position: '', department: '' });
            toast.success('Invite created and email sent');
        },
        onError: () => toast.error('Failed to create invite'),
    });

    const resendMutation = useMutation({
        mutationFn: (id: number) => apiPost<InviteResponse>(`/onboarding/invites/${id}/resend`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-invites'] });
            toast.success('Invite email resent');
        },
        onError: () => toast.error('Failed to resend invite'),
    });

    const extendMutation = useMutation({
        mutationFn: ({ id, expiresAt }: { id: number; expiresAt: string }) =>
            apiPost<InviteResponse>(`/onboarding/invites/${id}/extend`, { expiresAt }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-invites'] });
            setShowExtendDialog(false);
            setSelectedInvite(null);
            toast.success('Invite expiry extended');
        },
        onError: () => toast.error('Failed to extend invite'),
    });

    const cancelMutation = useMutation({
        mutationFn: (id: number) => apiPost<InviteResponse>(`/onboarding/invites/${id}/cancel`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-invites'] });
            setShowCancelDialog(false);
            setSelectedInvite(null);
            toast.success('Invite cancelled');
        },
        onError: () => toast.error('Failed to cancel invite'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiDelete(`/onboarding/invites/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-invites'] });
            setShowDeleteDialog(false);
            setSelectedInvite(null);
            toast.success('Invite deleted');
        },
        onError: () => toast.error('Failed to delete invite'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Record<string, string> }) =>
            apiPut<InviteResponse>(`/onboarding/invites/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-invites'] });
            toast.success('Invite updated');
        },
        onError: () => toast.error('Failed to update invite'),
    });

    function handleCopyLink(link: string) {
        navigator.clipboard.writeText(link);
        toast.success('Invite link copied to clipboard');
    }

    // ============================================
    // Render
    // ============================================

    return (
        <>
            <Helmet>
                <title>Onboarding Invites</title>
            </Helmet>

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-2">
                            <UserPlus className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Onboarding Invites</h2>
                            <p className="mt-1 text-gray-600">Manage pre-onboarding invitations</p>
                        </div>
                    </div>
                    {canManage && (
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setShowCreateDialog(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Send New Invite
                        </Button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Invites</p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <Mail className="h-8 w-8 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === 'pending' ? 'ring-2 ring-yellow-400' : ''}`}
                        onClick={() => setStatusFilter(statusFilter === 'pending' ? null : 'pending')}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === 'accepted' ? 'ring-2 ring-blue-400' : ''}`}
                        onClick={() => setStatusFilter(statusFilter === 'accepted' ? null : 'accepted')}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Accepted</p>
                                    <p className="mt-2 text-3xl font-bold text-blue-600">{stats.accepted}</p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`cursor-pointer transition-shadow hover:shadow-md ${statusFilter === 'cancelled' ? 'ring-2 ring-red-400' : ''}`}
                        onClick={() => setStatusFilter(statusFilter === 'cancelled' ? null : 'cancelled')}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Cancelled</p>
                                    <p className="mt-2 text-3xl font-bold text-red-600">{stats.cancelled}</p>
                                </div>
                                <Ban className="h-8 w-8 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                        className="max-w-sm"
                    />
                    {(search || statusFilter) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                setStatusFilter(null);
                                setPage(0);
                            }}
                        >
                            <X className="mr-1 h-4 w-4" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="space-y-4 p-6">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : invites.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Candidate
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Position
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Sent Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Expires
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {invites.map((invite) => (
                                                <tr key={invite.id} className="hover:bg-gray-50">
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="flex items-center">
                                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2596be]">
                                                                <span className="font-semibold text-white">
                                                                    {invite.firstName?.[0]}
                                                                    {invite.lastName?.[0]}
                                                                </span>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {invite.fullName}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {invite.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="text-sm text-gray-900">
                                                            {invite.position || '-'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {invite.department || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <Badge
                                                            className={
                                                                STATUS_COLORS[invite.status] ||
                                                                'border-gray-200 bg-gray-100 text-gray-700'
                                                            }
                                                        >
                                                            {capitalize(invite.status)}
                                                        </Badge>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {formatDate(invite.createdAt)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {invite.expiresAt
                                                            ? formatDate(invite.expiresAt)
                                                            : 'No expiration'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setSelectedInvite(invite);
                                                                        setShowDetailDialog(true);
                                                                    }}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleCopyLink(invite.inviteLink)}
                                                                >
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Copy Link
                                                                </DropdownMenuItem>
                                                                {canManage && invite.status === 'pending' && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => resendMutation.mutate(invite.id)}
                                                                    >
                                                                        <Send className="mr-2 h-4 w-4" />
                                                                        Resend Email
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {canManage && !['cancelled'].includes(invite.status) && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setSelectedInvite(invite);
                                                                            setExtendDate('');
                                                                            setShowExtendDialog(true);
                                                                        }}
                                                                    >
                                                                        <CalendarPlus className="mr-2 h-4 w-4" />
                                                                        Extend Expiry
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {canManage &&
                                                                    !['accepted', 'cancelled'].includes(invite.status) && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedInvite(invite);
                                                                                setShowCancelDialog(true);
                                                                            }}
                                                                            className="text-orange-600"
                                                                        >
                                                                            <Ban className="mr-2 h-4 w-4" />
                                                                            Cancel
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                {canManage &&
                                                                    !['accepted'].includes(invite.status) && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                setSelectedInvite(invite);
                                                                                setShowDeleteDialog(true);
                                                                            }}
                                                                            className="text-red-600"
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {invitesData && invitesData.totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t px-6 py-3">
                                        <p className="text-sm text-gray-500">
                                            Showing {page * 20 + 1} to{' '}
                                            {Math.min((page + 1) * 20, totalElements)} of {totalElements}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={invitesData.first}
                                                onClick={() => setPage((p) => p - 1)}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={invitesData.last}
                                                onClick={() => setPage((p) => p + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                <Mail className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="font-medium">No invites sent yet</p>
                                <p className="mt-1 text-sm">
                                    Click "Send New Invite" to create your first onboarding invitation
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ============================================ */}
            {/* Create Invite Dialog */}
            {/* ============================================ */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Send New Onboarding Invite</DialogTitle>
                        <DialogDescription>
                            Send an onboarding invitation to a new candidate. They will receive an email
                            with instructions.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            createMutation.mutate(createForm);
                        }}
                    >
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>
                                        First Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={createForm.firstName}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, firstName: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>
                                        Last Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        value={createForm.lastName}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, lastName: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="email"
                                        className="pl-10"
                                        value={createForm.email}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, email: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Position</Label>
                                    <Input
                                        value={createForm.position}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, position: e.target.value })
                                        }
                                        placeholder="e.g., Software Engineer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Input
                                        value={createForm.department}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, department: e.target.value })
                                        }
                                        placeholder="e.g., Engineering"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                Send Invite
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ============================================ */}
            {/* Detail Dialog */}
            {/* ============================================ */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Invite Details</DialogTitle>
                    </DialogHeader>
                    {selectedInvite && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Name</p>
                                    <p className="mt-1">{selectedInvite.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="mt-1">{selectedInvite.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Position</p>
                                    <p className="mt-1">{selectedInvite.position || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Department</p>
                                    <p className="mt-1">{selectedInvite.department || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <Badge className={`mt-1 ${STATUS_COLORS[selectedInvite.status] || ''}`}>
                                        {capitalize(selectedInvite.status)}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Expires</p>
                                    <p className={`mt-1 ${selectedInvite.expired ? 'text-red-600 font-medium' : ''}`}>
                                        {formatDate(selectedInvite.expiresAt)}
                                        {selectedInvite.expired && ' (Expired)'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Invited By</p>
                                    <p className="mt-1">{selectedInvite.invitedByName || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Created</p>
                                    <p className="mt-1">{formatDate(selectedInvite.createdAt)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Invite Link</p>
                                <div className="mt-1 flex items-center gap-2">
                                    <Input readOnly value={selectedInvite.inviteLink} className="text-sm" />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleCopyLink(selectedInvite.inviteLink)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ============================================ */}
            {/* Extend Dialog */}
            {/* ============================================ */}
            <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Extend Invite Expiry</DialogTitle>
                        <DialogDescription>
                            Set a new expiration date for {selectedInvite?.fullName}'s invite.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label>New Expiry Date</Label>
                        <Input
                            type="datetime-local"
                            value={extendDate}
                            onChange={(e) => setExtendDate(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            disabled={!extendDate || extendMutation.isPending}
                            onClick={() => {
                                if (selectedInvite && extendDate) {
                                    extendMutation.mutate({
                                        id: selectedInvite.id,
                                        expiresAt: extendDate,
                                    });
                                }
                            }}
                        >
                            {extendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Extend
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ============================================ */}
            {/* Cancel Confirm */}
            {/* ============================================ */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Invite</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel the invite for {selectedInvite?.fullName}? They
                            will no longer be able to use the invite link.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Invite</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={() => selectedInvite && cancelMutation.mutate(selectedInvite.id)}
                        >
                            Cancel Invite
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ============================================ */}
            {/* Delete Confirm */}
            {/* ============================================ */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invite</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the invite for {selectedInvite?.fullName}. This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => selectedInvite && deleteMutation.mutate(selectedInvite.id)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
