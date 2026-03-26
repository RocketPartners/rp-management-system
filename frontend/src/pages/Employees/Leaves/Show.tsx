import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/spring-boot-api';
import type { LeaveApplicationResponse, LeaveStatus } from '@/types';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Edit2,
    Loader2,
    Shield,
    User,
    Users,
    XCircle,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

interface StatusStyle {
    bg: string;
    text: string;
    border: string;
    icon: LucideIcon;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
    PENDING_MANAGER: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: Clock,
    },
    PENDING_HR: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: Clock,
    },
    APPROVED: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircle2,
    },
    REJECTED_BY_MANAGER: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle,
    },
    REJECTED_BY_HR: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircle,
    },
    CANCELLED: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: XCircle,
    },
    PENDING_CANCELLATION: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-200',
        icon: AlertTriangle,
    },
};

export default function Show() {
    const { id } = useParams<{ id: string }>();
    const [leave, setLeave] = useState<LeaveApplicationResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [showRequestCancelModal, setShowRequestCancelModal] = useState<boolean>(false);
    const [cancelling, setCancelling] = useState<boolean>(false);
    const [requestingCancel, setRequestingCancel] = useState<boolean>(false);
    const [cancellationReason, setCancellationReason] = useState<string>('');
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    const fetchLeave = useCallback(async () => {
        try {
            const res = await apiFetch(`/leave-applications/${id}`);
            if (res.ok) {
                const json = await res.json();
                setLeave(json.data);
            }
        } catch {
            setErrorMsg('Failed to load leave request.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchLeave();
    }, [fetchLeave]);

    const canCancel = leave
        ? (['PENDING_MANAGER', 'PENDING_HR'] as LeaveStatus[]).includes(leave.status)
        : false;

    const canRequestCancellation =
        leave?.status === 'APPROVED' &&
        new Date(leave.startDate) > new Date();

    const canEdit = leave?.status === 'PENDING_MANAGER';
    const isPendingCancellation = leave?.status === 'PENDING_CANCELLATION';

    const handleCancel = async () => {
        setCancelling(true);
        try {
            const res = await apiFetch(`/leave-applications/${id}/cancel`, {
                method: 'POST',
            });
            if (res.ok) {
                setSuccessMsg('Leave request cancelled successfully.');
                setShowCancelModal(false);
                fetchLeave();
            } else {
                const json = await res.json();
                setErrorMsg(json.message || 'Failed to cancel.');
            }
        } catch {
            setErrorMsg('Failed to cancel leave request.');
        } finally {
            setCancelling(false);
        }
    };

    const handleRequestCancellation = async () => {
        if (!cancellationReason.trim()) return;

        setRequestingCancel(true);
        try {
            const res = await apiFetch(`/leave-applications/${id}/request-cancel`, {
                method: 'POST',
                body: JSON.stringify({ cancellationReason }),
            });
            if (res.ok) {
                setSuccessMsg('Cancellation request submitted successfully.');
                setShowRequestCancelModal(false);
                setCancellationReason('');
                fetchLeave();
            } else {
                const json = await res.json();
                setErrorMsg(json.message || 'Failed to request cancellation.');
            }
        } catch {
            setErrorMsg('Failed to request cancellation.');
        } finally {
            setRequestingCancel(false);
        }
    };

    const getStatusStyle = (s: string): StatusStyle => {
        return STATUS_STYLES[s] || STATUS_STYLES.PENDING_MANAGER;
    };

    const formatStatusLabel = (s: string): string => {
        return s
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    if (!leave) {
        return (
            <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Leave Request Not Found</h1>
                <Link to="/my-leaves" className="text-blue-600 hover:underline">
                    Back to My Leaves
                </Link>
            </div>
        );
    }

    const statusStyle = getStatusStyle(leave.status);
    const StatusIcon = statusStyle.icon;

    return (
        <>
            <Helmet>
                <title>Leave Request Details</title>
            </Helmet>

            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button asChild variant="ghost" size="sm">
                                <Link to="/my-leaves">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to My Leaves
                                </Link>
                            </Button>
                            <div className="h-8 w-px bg-gray-300" />
                            <div className="flex items-center gap-3">
                                <div
                                    className="rounded-lg p-2"
                                    style={{
                                        backgroundColor:
                                            (leave.leaveTypeColor || '#3B82F6') + '15',
                                    }}
                                >
                                    <Calendar
                                        className="h-6 w-6"
                                        style={{
                                            color: leave.leaveTypeColor || '#3B82F6',
                                        }}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-3xl font-bold text-gray-900">
                                            My Leave Request
                                        </h2>
                                        <Badge
                                            className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex items-center gap-1.5 border`}
                                        >
                                            <StatusIcon className="h-3.5 w-3.5" />
                                            {leave.statusLabel || formatStatusLabel(leave.status)}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-gray-600">
                                        {leave.leaveTypeName}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {canEdit && (
                                <Button asChild variant="outline">
                                    <Link to={`/my-leaves/${leave.id}/edit`}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit Request
                                    </Link>
                                </Button>
                            )}
                            {canCancel && (
                                <Button
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => setShowCancelModal(true)}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Request
                                </Button>
                            )}
                            {canRequestCancellation && (
                                <Button
                                    variant="outline"
                                    className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                    onClick={() => setShowRequestCancelModal(true)}
                                >
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Request Cancellation
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Flash Messages */}
                {successMsg && (
                    <Alert className="animate-fade-in border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="font-medium text-green-800">
                            {successMsg}
                        </AlertDescription>
                    </Alert>
                )}
                {errorMsg && (
                    <Alert className="animate-fade-in border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="font-medium text-red-800">
                            {errorMsg}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Pending Cancellation Banner */}
                {isPendingCancellation && (
                    <Alert className="border-orange-200 bg-orange-50">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                            <strong>Cancellation Pending:</strong> Your
                            cancellation request is being reviewed.
                            {leave.cancellationReason && (
                                <span className="mt-1 block text-sm">
                                    Reason: {leave.cancellationReason}
                                </span>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Leave Details */}
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Leave Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">
                                                Leave Type
                                            </p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            leave.leaveTypeColor || '#3B82F6',
                                                    }}
                                                />
                                                <p className="font-medium text-gray-900">
                                                    {leave.leaveTypeName}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {leave.leaveTypeCode}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-500">
                                                Start Date
                                            </p>
                                            <p className="mt-1 font-medium text-gray-900">
                                                {new Date(
                                                    leave.startDate,
                                                ).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-500">
                                                End Date
                                            </p>
                                            <p className="mt-1 font-medium text-gray-900">
                                                {new Date(
                                                    leave.endDate,
                                                ).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">
                                                Total Days
                                            </p>
                                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                                {leave.totalDays}{' '}
                                                <span className="text-sm font-normal text-gray-500">
                                                    {leave.totalDays === 1
                                                        ? 'day'
                                                        : 'days'}
                                                </span>
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-500">
                                                Duration
                                            </p>
                                            <p className="mt-1 font-medium text-gray-900">
                                                {leave.duration || 'Full Day'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-500">
                                                Availability
                                            </p>
                                            <p className="mt-1 font-medium capitalize text-gray-900">
                                                {leave.availability?.replace(/_/g, ' ') || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="mt-6 border-t pt-6">
                                    <p className="text-sm font-medium text-gray-500">
                                        Reason
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap text-gray-900">
                                        {leave.reason}
                                    </p>
                                </div>

                                {/* Emergency Contact */}
                                {(leave.emergencyContactName ||
                                    leave.emergencyContactPhone) && (
                                    <div className="mt-6 border-t pt-6">
                                        <p className="mb-3 text-sm font-medium text-gray-500">
                                            Emergency Contact
                                        </p>
                                        <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                                <User className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {leave.emergencyContactName}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {leave.emergencyContactPhone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Approval Timeline */}
                        <Card className="animate-fade-in animation-delay-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Approval Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Submitted */}
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <Calendar className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="mt-2 h-full w-0.5 bg-gray-200" />
                                        </div>
                                        <div className="pb-6">
                                            <p className="font-medium text-gray-900">
                                                Request Submitted
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(
                                                    leave.createdAt,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Manager Review */}
                                    {leave.managerApprovedByName && (
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                        leave.status === 'REJECTED_BY_MANAGER'
                                                            ? 'bg-red-100'
                                                            : 'bg-green-100'
                                                    }`}
                                                >
                                                    <Users
                                                        className={`h-5 w-5 ${
                                                            leave.status === 'REJECTED_BY_MANAGER'
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                        }`}
                                                    />
                                                </div>
                                                <div className="mt-2 h-full w-0.5 bg-gray-200" />
                                            </div>
                                            <div className="pb-6">
                                                <p className="font-medium text-gray-900">
                                                    {leave.status === 'REJECTED_BY_MANAGER'
                                                        ? 'Rejected by Manager'
                                                        : 'Manager Approved'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {leave.managerApprovedByName}
                                                    {leave.managerApprovedAt &&
                                                        ` — ${new Date(
                                                            leave.managerApprovedAt,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}`}
                                                </p>
                                                {leave.managerComments && (
                                                    <p className="mt-1 rounded bg-gray-50 p-2 text-sm text-gray-700">
                                                        "{leave.managerComments}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* HR Review */}
                                    {leave.hrApprovedByName && (
                                        <div className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                        leave.status === 'REJECTED_BY_HR'
                                                            ? 'bg-red-100'
                                                            : 'bg-green-100'
                                                    }`}
                                                >
                                                    <Shield
                                                        className={`h-5 w-5 ${
                                                            leave.status === 'REJECTED_BY_HR'
                                                                ? 'text-red-600'
                                                                : 'text-green-600'
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {leave.status === 'REJECTED_BY_HR'
                                                        ? 'Rejected by HR'
                                                        : 'HR Approved'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {leave.hrApprovedByName}
                                                    {leave.hrApprovedAt &&
                                                        ` — ${new Date(
                                                            leave.hrApprovedAt,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}`}
                                                </p>
                                                {leave.hrComments && (
                                                    <p className="mt-1 rounded bg-gray-50 p-2 text-sm text-gray-700">
                                                        "{leave.hrComments}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Pending state */}
                                    {leave.status === 'PENDING_MANAGER' && (
                                        <div className="flex gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                                                <Clock className="h-5 w-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-yellow-700">
                                                    Awaiting Manager Review
                                                </p>
                                                {leave.assignedManagerName && (
                                                    <p className="text-sm text-gray-600">
                                                        Assigned to:{' '}
                                                        {leave.assignedManagerName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {leave.status === 'PENDING_HR' && (
                                        <div className="flex gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                <Shield className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-blue-700">
                                                    Awaiting HR Review
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Request Info Card */}
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Request Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Request ID
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        #{leave.id}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Filed on
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(
                                            leave.createdAt,
                                        ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Last updated
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(
                                            leave.updatedAt,
                                        ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Leave Request</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this leave request?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelModal(false)}
                        >
                            Keep Request
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={cancelling}
                        >
                            {cancelling ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Yes, Cancel Request
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request Cancellation Modal */}
            <Dialog
                open={showRequestCancelModal}
                onOpenChange={setShowRequestCancelModal}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request Cancellation</DialogTitle>
                        <DialogDescription>
                            This leave has already been approved. A cancellation
                            request will be sent to your manager and HR for
                            review.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cancellationReason">
                                Reason for cancellation *
                            </Label>
                            <Textarea
                                id="cancellationReason"
                                value={cancellationReason}
                                onChange={(e) =>
                                    setCancellationReason(e.target.value)
                                }
                                placeholder="Please provide a reason for the cancellation..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowRequestCancelModal(false)}
                        >
                            Keep Leave
                        </Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={handleRequestCancellation}
                            disabled={
                                requestingCancel ||
                                !cancellationReason.trim()
                            }
                        >
                            {requestingCancel ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                    Submit Cancellation Request
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
