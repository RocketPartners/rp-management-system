/**
 * Leave Request Detail + Approval Page
 * Ported from monolith's Admin/Leaves/Show.jsx
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Loader2,
    MessageSquare,
    Phone,
    User,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import { apiGet, apiPost } from '@/lib/spring-boot-api';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
    pending_manager: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Manager Approval' },
    pending_hr: { color: 'bg-orange-100 text-orange-700', label: 'Pending HR Approval' },
    approved: { color: 'bg-green-100 text-green-700', label: 'Approved' },
    rejected_by_manager: { color: 'bg-red-100 text-red-700', label: 'Rejected by Manager' },
    rejected_by_hr: { color: 'bg-red-100 text-red-700', label: 'Rejected by HR' },
    cancelled: { color: 'bg-gray-100 text-gray-600', label: 'Cancelled' },
    pending_cancellation: { color: 'bg-purple-100 text-purple-700', label: 'Pending Cancellation' },
};

export default function LeaveShow() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { can } = usePermission();

    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        type: 'manager_approve' | 'manager_reject' | 'hr_approve' | 'hr_reject' | 'cancel_approve' | 'cancel_reject' | null;
    }>({ open: false, type: null });
    const [comments, setComments] = useState('');

    const { data: leave, isLoading, isError } = useQuery({
        queryKey: ['leave-application', id],
        queryFn: () => apiGet<any>(`/leave-applications/${id}`),
        enabled: !!id,
    });

    const actionMutation = useMutation({
        mutationFn: ({ endpoint, body }: { endpoint: string; body: any }) =>
            apiPost(endpoint, body),
        onSuccess: (_, variables) => {
            const action = variables.endpoint.includes('approve') ? 'approved' : 'rejected';
            toast.success(`Leave request ${action} successfully`);
            queryClient.invalidateQueries({ queryKey: ['leave-application', id] });
            queryClient.invalidateQueries({ queryKey: ['leave-applications'] });
            setActionDialog({ open: false, type: null });
            setComments('');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleAction = () => {
        if (!actionDialog.type || !id) return;
        const endpoints: Record<string, string> = {
            manager_approve: `/leave-applications/${id}/manager/approve`,
            manager_reject: `/leave-applications/${id}/manager/reject`,
            hr_approve: `/leave-applications/${id}/hr/approve`,
            hr_reject: `/leave-applications/${id}/hr/reject`,
            cancel_approve: `/leave-applications/${id}/cancellation/approve`,
            cancel_reject: `/leave-applications/${id}/cancellation/reject`,
        };
        actionMutation.mutate({ endpoint: endpoints[actionDialog.type], body: { comments } });
    };

    const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const formatDateTime = (date: string) => date ? new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : null;

    if (isLoading) return (
        <div className="space-y-6 p-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
        </div>
    );

    if (isError || !leave) return (
        <div className="flex flex-col items-center justify-center p-12">
            <XCircle className="mb-3 h-12 w-12 text-red-400" />
            <p className="text-lg font-medium">Leave request not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/leaves')}>Back to List</Button>
        </div>
    );

    const statusCfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG.cancelled;
    const canApprove = can('LEAVE_APPLICATION_APPROVE');

    return (
        <>
            <Helmet><title>{`Leave Request #${leave.id} | HRIS`}</title></Helmet>

            <div className="space-y-6 p-6">
                {/* Back + Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/leaves')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Leave Request #{leave.id}</h1>
                        <p className="text-sm text-gray-500">Submitted {formatDate(leave.createdAt)}</p>
                    </div>
                    <Badge className={`${statusCfg.color} px-3 py-1 text-sm`}>{statusCfg.label}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Employee & Leave Info */}
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Leave Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-sm text-gray-500">Employee</p><p className="font-medium">{leave.userName}</p></div>
                                    <div><p className="text-sm text-gray-500">Leave Type</p><div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ backgroundColor: leave.leaveTypeColor || '#3b82f6' }} /><span className="font-medium">{leave.leaveTypeName}</span></div></div>
                                    <div><p className="text-sm text-gray-500">Start Date</p><p className="font-medium">{formatDate(leave.startDate)}</p></div>
                                    <div><p className="text-sm text-gray-500">End Date</p><p className="font-medium">{formatDate(leave.endDate)}</p></div>
                                    <div><p className="text-sm text-gray-500">Duration</p><p className="font-medium">{leave.totalDays} day(s)</p></div>
                                    <div><p className="text-sm text-gray-500">Assigned Manager</p><p className="font-medium">{leave.assignedManagerName || '—'}</p></div>
                                </div>
                                {leave.reason && (
                                    <div className="border-t pt-4"><p className="text-sm text-gray-500">Reason</p><p className="mt-1 text-gray-700">{leave.reason}</p></div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Approval Timeline */}
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Approval Timeline</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Submitted */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center"><div className="rounded-full bg-blue-100 p-1.5"><Calendar className="h-4 w-4 text-blue-600" /></div><div className="mt-1 flex-1 border-l-2 border-gray-200" /></div>
                                        <div className="pb-4"><p className="font-medium">Submitted</p><p className="text-sm text-gray-500">{formatDateTime(leave.createdAt)}</p></div>
                                    </div>
                                    {/* Manager Review */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center"><div className={`rounded-full p-1.5 ${leave.managerApprovedAt ? (leave.status.includes('rejected_by_manager') ? 'bg-red-100' : 'bg-green-100') : 'bg-gray-100'}`}>{leave.managerApprovedAt ? (leave.status.includes('rejected_by_manager') ? <XCircle className="h-4 w-4 text-red-600" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />) : <Clock className="h-4 w-4 text-gray-400" />}</div><div className="mt-1 flex-1 border-l-2 border-gray-200" /></div>
                                        <div className="pb-4"><p className="font-medium">Manager Review</p>{leave.managerApprovedAt ? (<><p className="text-sm text-gray-500">{leave.managerApprovedBy} — {formatDateTime(leave.managerApprovedAt)}</p>{leave.managerComments && <p className="mt-1 rounded bg-gray-50 p-2 text-sm text-gray-600">{leave.managerComments}</p>}</>) : <p className="text-sm text-gray-400">Pending</p>}</div>
                                    </div>
                                    {/* HR Review */}
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center"><div className={`rounded-full p-1.5 ${leave.hrApprovedAt ? (leave.status.includes('rejected_by_hr') ? 'bg-red-100' : 'bg-green-100') : 'bg-gray-100'}`}>{leave.hrApprovedAt ? (leave.status.includes('rejected_by_hr') ? <XCircle className="h-4 w-4 text-red-600" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />) : <Clock className="h-4 w-4 text-gray-400" />}</div></div>
                                        <div><p className="font-medium">HR Review</p>{leave.hrApprovedAt ? (<><p className="text-sm text-gray-500">{leave.hrApprovedBy} — {formatDateTime(leave.hrApprovedAt)}</p>{leave.hrComments && <p className="mt-1 rounded bg-gray-50 p-2 text-sm text-gray-600">{leave.hrComments}</p>}</>) : <p className="text-sm text-gray-400">Pending</p>}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cancellation Info */}
                        {leave.cancellationReason && (
                            <Card className="border-purple-200">
                                <CardHeader><CardTitle className="text-purple-700">Cancellation Request</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">{leave.cancellationReason}</p>
                                    {leave.cancellationRequestedAt && <p className="mt-2 text-xs text-gray-400">Requested: {formatDateTime(leave.cancellationRequestedAt)}</p>}
                                    {leave.cancellationApprovedBy && <p className="mt-1 text-xs text-gray-400">Reviewed by: {leave.cancellationApprovedBy} — {formatDateTime(leave.cancellationApprovedAt)}</p>}
                                    {leave.cancellationHrComments && <p className="mt-2 rounded bg-purple-50 p-2 text-sm">{leave.cancellationHrComments}</p>}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Emergency Contact */}
                        {(leave.emergencyContactName || leave.emergencyContactPhone) && (
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Phone className="h-4 w-4" />Emergency Contact</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="font-medium">{leave.emergencyContactName || '—'}</p>
                                    <p className="text-sm text-gray-500">{leave.emergencyContactPhone || '—'}</p>
                                    {leave.availability && <Badge className="mt-2" variant="secondary">{leave.availability}</Badge>}
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        {canApprove && (
                            <Card>
                                <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    {leave.status === 'pending_manager' && (
                                        <>
                                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => { setComments(''); setActionDialog({ open: true, type: 'manager_approve' }); }}>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />Manager Approve
                                            </Button>
                                            <Button variant="destructive" className="w-full" onClick={() => { setComments(''); setActionDialog({ open: true, type: 'manager_reject' }); }}>
                                                <XCircle className="mr-2 h-4 w-4" />Manager Reject
                                            </Button>
                                        </>
                                    )}
                                    {leave.status === 'pending_hr' && (
                                        <>
                                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => { setComments(''); setActionDialog({ open: true, type: 'hr_approve' }); }}>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />HR Approve
                                            </Button>
                                            <Button variant="destructive" className="w-full" onClick={() => { setComments(''); setActionDialog({ open: true, type: 'hr_reject' }); }}>
                                                <XCircle className="mr-2 h-4 w-4" />HR Reject
                                            </Button>
                                        </>
                                    )}
                                    {leave.status === 'pending_cancellation' && (
                                        <>
                                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => { setComments(''); setActionDialog({ open: true, type: 'cancel_approve' }); }}>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />Approve Cancellation
                                            </Button>
                                            <Button variant="destructive" className="w-full" onClick={() => { setComments(''); setActionDialog({ open: true, type: 'cancel_reject' }); }}>
                                                <XCircle className="mr-2 h-4 w-4" />Reject Cancellation
                                            </Button>
                                        </>
                                    )}
                                    {!['pending_manager', 'pending_hr', 'pending_cancellation'].includes(leave.status) && (
                                        <p className="text-center text-sm text-gray-500">No actions available for this status.</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Dialog */}
            <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionDialog.type?.includes('approve') ? 'Approve' : 'Reject'} Leave Request
                        </DialogTitle>
                        <DialogDescription>
                            {actionDialog.type?.includes('reject')
                                ? 'Please provide a reason for rejection.'
                                : 'Add optional comments for this approval.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>{actionDialog.type?.includes('reject') ? 'Reason *' : 'Comments (optional)'}</Label>
                        <Textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Enter comments..." rows={3} className="mt-2" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null })}>Cancel</Button>
                        <Button
                            onClick={handleAction}
                            disabled={actionMutation.isPending || (actionDialog.type?.includes('reject') && !comments.trim())}
                            className={actionDialog.type?.includes('approve') ? 'bg-green-600 hover:bg-green-700' : ''}
                            variant={actionDialog.type?.includes('reject') ? 'destructive' : 'default'}
                        >
                            {actionMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
