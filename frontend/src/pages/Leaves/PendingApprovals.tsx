import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    Loader2,
    Search,
    ShieldCheck,
    X,
    XCircle,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/use-permission';
import { apiGet, apiPost } from '@/lib/spring-boot-api';
import type { PendingApprovalsResponse } from '@/types';

type ActionType =
    | 'manager_approve'
    | 'manager_reject'
    | 'hr_approve'
    | 'hr_reject'
    | 'cancel_approve'
    | 'cancel_reject';

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Clock; label: string }> = {
    pending_manager: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending Manager' },
    pending_hr: { color: 'bg-orange-100 text-orange-700', icon: Clock, label: 'Pending HR' },
    pending_cancellation: { color: 'bg-purple-100 text-purple-700', icon: AlertCircle, label: 'Pending Cancellation' },
};

export default function PendingApprovals() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { can } = usePermission();

    // Role-based action permissions
    const canActAsManager = can('LEAVE_APPLICATION_APPROVE');
    const canActAsHr = can('LEAVE_TYPE_CREATE');

    const page = parseInt(searchParams.get('page') || '0');
    const size = 20;
    const search = searchParams.get('search') || '';
    const [searchInput, setSearchInput] = useState(search);

    // Action dialog state
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        type: ActionType | null;
        leaveId: number | null;
        employeeName: string;
    }>({ open: false, type: null, leaveId: null, employeeName: '' });
    const [comments, setComments] = useState('');

    // Fetch pending approvals
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['pending-approvals', page, size, search],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('size', String(size));
            if (search) params.set('search', search);
            return apiGet<PendingApprovalsResponse>(`/leave-applications/pending-approvals?${params.toString()}`);
        },
    });

    // Approve/reject mutation
    const actionMutation = useMutation({
        mutationFn: ({ endpoint, body }: { endpoint: string; body: { comments: string } }) =>
            apiPost(endpoint, body),
        onSuccess: (_, variables) => {
            const action = variables.endpoint.includes('approve') ? 'approved' : 'rejected';
            toast.success(`Leave request ${action} successfully`);
            queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
            queryClient.invalidateQueries({ queryKey: ['leave-applications'] });
            setActionDialog({ open: false, type: null, leaveId: null, employeeName: '' });
            setComments('');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleAction = () => {
        if (!actionDialog.type || !actionDialog.leaveId) return;
        const endpoints: Record<ActionType, string> = {
            manager_approve: `/leave-applications/${actionDialog.leaveId}/manager/approve`,
            manager_reject: `/leave-applications/${actionDialog.leaveId}/manager/reject`,
            hr_approve: `/leave-applications/${actionDialog.leaveId}/hr/approve`,
            hr_reject: `/leave-applications/${actionDialog.leaveId}/hr/reject`,
            cancel_approve: `/leave-applications/${actionDialog.leaveId}/cancellation/approve`,
            cancel_reject: `/leave-applications/${actionDialog.leaveId}/cancellation/reject`,
        };
        actionMutation.mutate({ endpoint: endpoints[actionDialog.type], body: { comments } });
    };

    const openActionDialog = (type: ActionType, leaveId: number, employeeName: string) => {
        setComments('');
        setActionDialog({ open: true, type, leaveId, employeeName });
    };

    // Search handlers
    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        if (searchInput) params.set('search', searchInput);
        else params.delete('search');
        params.delete('page');
        setSearchParams(params);
    };

    const clearSearch = () => {
        setSearchInput('');
        const params = new URLSearchParams(searchParams);
        params.delete('search');
        params.delete('page');
        setSearchParams(params);
    };

    const goToPage = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(newPage));
        setSearchParams(params);
    };

    const leaves = data?.page?.content || [];
    const totalPages = data?.page?.totalPages || 0;
    const totalElements = data?.page?.totalElements || 0;
    const summary = data?.summary || { pendingManager: 0, pendingHr: 0, pendingCancellation: 0 };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const isReject = actionDialog.type?.includes('reject') ?? false;

    return (
        <>
            <Helmet><title>Pending Approvals | HRIS</title></Helmet>

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-100 p-2">
                        <ShieldCheck className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
                        <p className="text-sm text-gray-500">Leave requests awaiting your action</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="rounded-lg bg-yellow-100 p-2">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending Manager</p>
                                <p className="text-2xl font-bold">{summary.pendingManager}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="rounded-lg bg-orange-100 p-2">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending HR</p>
                                <p className="text-2xl font-bold">{summary.pendingHr}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="rounded-lg bg-purple-100 p-2">
                                <AlertCircle className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pending Cancellation</p>
                                <p className="text-2xl font-bold">{summary.pendingCancellation}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Search by employee name..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-9"
                    />
                    {searchInput && (
                        <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    )}
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Leave Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead className="text-center">Days</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Manager</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 7 }).map((_, j) => (
                                                <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <XCircle className="mb-3 h-12 w-12 text-red-300" />
                                                <p className="text-lg font-medium">Failed to load</p>
                                                <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                                                    Try again
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : leaves.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <CheckCircle2 className="mb-3 h-12 w-12 text-green-300" />
                                                <p className="text-lg font-medium">No pending approvals</p>
                                                <p className="text-sm text-gray-500">You're all caught up!</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leaves.map((leave) => {
                                        const statusKey = leave.status.toLowerCase();
                                        const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending_manager;
                                        const isPendingManager = leave.status === 'PENDING_MANAGER';
                                        const isPendingHr = leave.status === 'PENDING_HR';
                                        const isPendingCancel = leave.status === 'PENDING_CANCELLATION';

                                        return (
                                            <TableRow key={leave.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <span className="font-medium text-gray-900">{leave.userName}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: leave.leaveTypeColor || '#3b82f6' }} />
                                                        <span>{leave.leaveTypeName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-600">
                                                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">{leave.totalDays}d</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-600">{leave.assignedManagerName || '—'}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {isPendingManager && (
                                                            <>
                                                                <Button size="sm" className="h-7 bg-green-600 px-2 text-xs hover:bg-green-700"
                                                                    disabled={!canActAsManager}
                                                                    onClick={() => openActionDialog('manager_approve', leave.id, leave.userName)}>
                                                                    Approve
                                                                </Button>
                                                                <Button size="sm" variant="destructive" className="h-7 px-2 text-xs"
                                                                    disabled={!canActAsManager}
                                                                    onClick={() => openActionDialog('manager_reject', leave.id, leave.userName)}>
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        {isPendingHr && (
                                                            <>
                                                                <Button size="sm" className="h-7 bg-green-600 px-2 text-xs hover:bg-green-700"
                                                                    disabled={!canActAsHr}
                                                                    onClick={() => openActionDialog('hr_approve', leave.id, leave.userName)}>
                                                                    Approve
                                                                </Button>
                                                                <Button size="sm" variant="destructive" className="h-7 px-2 text-xs"
                                                                    disabled={!canActAsHr}
                                                                    onClick={() => openActionDialog('hr_reject', leave.id, leave.userName)}>
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        {isPendingCancel && (
                                                            <>
                                                                <Button size="sm" className="h-7 bg-green-600 px-2 text-xs hover:bg-green-700"
                                                                    disabled={!canActAsHr}
                                                                    onClick={() => openActionDialog('cancel_approve', leave.id, leave.userName)}>
                                                                    Approve
                                                                </Button>
                                                                <Button size="sm" variant="destructive" className="h-7 px-2 text-xs"
                                                                    disabled={!canActAsHr}
                                                                    onClick={() => openActionDialog('cancel_reject', leave.id, leave.userName)}>
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" asChild>
                                                            <Link to={`/leaves/${leave.id}`}>
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of {totalElements}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => goToPage(page - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Confirmation Dialog */}
            <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, leaveId: null, employeeName: '' })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isReject ? 'Reject' : 'Approve'} Leave Request
                        </DialogTitle>
                        <DialogDescription>
                            {isReject
                                ? `Please provide a reason for rejecting ${actionDialog.employeeName}'s leave request.`
                                : `Add optional comments for approving ${actionDialog.employeeName}'s leave request.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>{isReject ? 'Reason *' : 'Comments (optional)'}</Label>
                        <Textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder={isReject ? 'Enter reason for rejection...' : 'Enter comments...'}
                            rows={3}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null, leaveId: null, employeeName: '' })}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAction}
                            disabled={actionMutation.isPending || (isReject && !comments.trim())}
                            className={!isReject ? 'bg-green-600 hover:bg-green-700' : ''}
                            variant={isReject ? 'destructive' : 'default'}
                        >
                            {actionMutation.isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                            ) : (
                                'Confirm'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
