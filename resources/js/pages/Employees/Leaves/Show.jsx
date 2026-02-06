// resources/js/Pages/Employees/Leaves/Show.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Edit2,
    Loader2,
    Send,
    Shield,
    User,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function Show({ auth, leaveRequest }) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRequestCancelModal, setShowRequestCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [requestingCancel, setRequestingCancel] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const { flash } = usePage().props;

    const canCancel = ['pending_manager', 'pending_hr'].includes(
        leaveRequest?.status,
    );
    const canRequestCancellation =
        leaveRequest?.status === 'approved' &&
        new Date(leaveRequest?.start_date) > new Date();
    const canEdit = leaveRequest?.status === 'pending_manager';
    const isPendingCancellation =
        leaveRequest?.status === 'pending_cancellation';

    const handleCancel = () => {
        setCancelling(true);
        router.post(
            route('my-leaves.cancel', leaveRequest.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowCancelModal(false);
                    setCancelling(false);
                },
                onError: () => {
                    setCancelling(false);
                },
            },
        );
    };

    const handleRequestCancellation = () => {
        if (!cancellationReason.trim()) {
            return;
        }

        setRequestingCancel(true);
        router.post(
            route('my-leaves.request-cancel', leaveRequest.id),
            {
                cancellation_reason: cancellationReason,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRequestCancelModal(false);
                    setRequestingCancel(false);
                    setCancellationReason('');
                },
                onError: () => {
                    setRequestingCancel(false);
                },
            },
        );
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending_manager: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                border: 'border-yellow-200',
                icon: Clock,
            },
            pending_hr: {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                border: 'border-blue-200',
                icon: Clock,
            },
            approved: {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-200',
                icon: CheckCircle2,
            },
            rejected_by_manager: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: XCircle,
            },
            rejected_by_hr: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: XCircle,
            },
            cancelled: {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                border: 'border-gray-200',
                icon: XCircle,
            },
            pending_cancellation: {
                bg: 'bg-orange-100',
                text: 'text-orange-700',
                border: 'border-orange-200',
                icon: AlertTriangle,
            },
        };
        return styles[status] || styles.pending_manager;
    };

    const statusStyle = getStatusBadge(leaveRequest?.status);
    const StatusIcon = statusStyle?.icon;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('my-leaves.index')}>
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
                                        (leaveRequest?.leave_type?.color ||
                                            '#3B82F6') + '15',
                                }}
                            >
                                <Calendar
                                    className="h-6 w-6"
                                    style={{
                                        color:
                                            leaveRequest?.leave_type?.color ||
                                            '#3B82F6',
                                    }}
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        My Leave Request
                                    </h2>
                                    <Badge
                                        className={`${statusStyle?.bg} ${statusStyle?.text} ${statusStyle?.border} flex items-center gap-1.5 border`}
                                    >
                                        {StatusIcon && (
                                            <StatusIcon className="h-3.5 w-3.5" />
                                        )}
                                        {leaveRequest?.status
                                            ?.replace(/_/g, ' ')
                                            .replace(/\b\w/g, (l) =>
                                                l.toUpperCase(),
                                            )}
                                    </Badge>
                                </div>
                                <p className="mt-1 text-gray-600">
                                    {leaveRequest?.leave_type?.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {canEdit && (
                            <Button asChild variant="outline">
                                <Link
                                    href={route(
                                        'my-leaves.edit',
                                        leaveRequest.id,
                                    )}
                                >
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
            }
        >
            <Head title="My Leave Request" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <Alert className="animate-fade-in border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="font-medium text-green-800">
                                {flash.success}
                            </AlertDescription>
                        </Alert>
                    )}
                    {flash?.error && (
                        <Alert className="animate-fade-in border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="font-medium text-red-800">
                                {flash.error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Status Alerts */}
                    {leaveRequest?.status === 'pending_manager' && (
                        <Alert className="animate-fade-in border-yellow-300 bg-yellow-50">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <strong>Pending Review:</strong> Your request is
                                waiting to be reviewed by a Senior, Lead, or
                                Project Manager.
                            </AlertDescription>
                        </Alert>
                    )}

                    {leaveRequest?.status === 'pending_hr' && (
                        <Alert className="animate-fade-in border-blue-300 bg-blue-50">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                <strong>Pending HR Approval:</strong> Your
                                manager has approved. Waiting for HR final
                                decision.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isPendingCancellation && (
                        <Alert className="animate-fade-in border-orange-300 bg-orange-50">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                <strong>Cancellation Pending:</strong> Your
                                cancellation request is being reviewed by HR.
                                Your leave remains approved until HR makes a
                                decision.
                            </AlertDescription>
                        </Alert>
                    )}

                    {leaveRequest?.status === 'rejected_by_manager' && (
                        <Alert className="animate-fade-in border-red-300 bg-red-50">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <strong>Request Rejected:</strong> Your leave
                                request has been rejected. This decision is
                                final.
                            </AlertDescription>
                        </Alert>
                    )}

                    {leaveRequest?.status === 'rejected_by_hr' && (
                        <Alert className="animate-fade-in border-red-300 bg-red-50">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <strong>Request Rejected by HR:</strong> HR has
                                rejected this request. This is the final
                                decision.
                            </AlertDescription>
                        </Alert>
                    )}

                    {leaveRequest?.status === 'approved' && (
                        <Alert className="animate-fade-in border-green-300 bg-green-50">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <AlertDescription className="text-green-800">
                                <strong>Request Approved:</strong> Your leave
                                request has been approved! Leave days have been
                                deducted from your balance.
                            </AlertDescription>
                        </Alert>
                    )}

                    {leaveRequest?.status === 'cancelled' &&
                        leaveRequest?.cancellation_reason && (
                            <Alert className="animate-fade-in border-gray-300 bg-gray-50">
                                <XCircle className="h-5 w-5 text-gray-600" />
                                <AlertDescription className="text-gray-800">
                                    <strong>Request Cancelled:</strong> This
                                    leave request was cancelled. Balance has
                                    been restored.
                                </AlertDescription>
                            </Alert>
                        )}

                    {/* Cancellation Info (if pending or approved) */}
                    {(isPendingCancellation ||
                        (leaveRequest?.status === 'cancelled' &&
                            leaveRequest?.cancellation_reason)) && (
                        <Card className="animate-fade-in border-orange-200 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-800">
                                    <AlertTriangle className="h-5 w-5" />
                                    Cancellation Request
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="mb-1 text-sm font-medium text-orange-700">
                                        Reason for Cancellation:
                                    </p>
                                    <div className="rounded-lg border border-orange-200 bg-white p-3">
                                        <p className="whitespace-pre-wrap text-gray-900">
                                            {leaveRequest.cancellation_reason}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm text-orange-700">
                                    <p>
                                        Requested on:{' '}
                                        {new Date(
                                            leaveRequest.cancellation_requested_at,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                {leaveRequest?.cancellation_hr_comments && (
                                    <div>
                                        <p className="mb-1 text-sm font-medium text-orange-700">
                                            HR Response:
                                        </p>
                                        <div className="rounded-lg border border-orange-200 bg-white p-3">
                                            <p className="text-gray-900">
                                                {
                                                    leaveRequest.cancellation_hr_comments
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Leave Details */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle>Leave Request Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">
                                        Start Date
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(
                                            leaveRequest?.start_date,
                                        ).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-sm text-gray-600">
                                        End Date
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(
                                            leaveRequest?.end_date,
                                        ).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-sm text-gray-600">
                                        Total Duration
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <p className="text-2xl font-bold text-gray-900">
                                            {leaveRequest?.total_days}
                                        </p>
                                        <span className="text-gray-500">
                                            {leaveRequest?.total_days === 1
                                                ? 'day'
                                                : 'days'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <p className="mb-2 text-sm text-gray-600">
                                    Reason
                                </p>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="whitespace-pre-wrap text-gray-900">
                                        {leaveRequest?.reason}
                                    </p>
                                </div>
                            </div>

                            {leaveRequest?.attachment && (
                                <div className="border-t pt-4">
                                    <p className="mb-2 text-sm text-gray-600">
                                        Supporting Document
                                    </p>
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={`/storage/${leaveRequest.attachment}`}
                                            download
                                            target="_blank"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download Attachment
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Approval Timeline */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <CardTitle>Approval Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Submitted */}
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                        <Send className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            Request Submitted
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(
                                                leaveRequest?.created_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>

                                {/* Manager Review */}
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                            leaveRequest?.manager_approved_at
                                                ? 'bg-green-100'
                                                : leaveRequest?.status ===
                                                    'pending_manager'
                                                  ? 'bg-yellow-100'
                                                  : leaveRequest?.status ===
                                                      'rejected_by_manager'
                                                    ? 'bg-red-100'
                                                    : 'bg-gray-100'
                                        }`}
                                    >
                                        <User
                                            className={`h-5 w-5 ${
                                                leaveRequest?.manager_approved_at
                                                    ? 'text-green-600'
                                                    : leaveRequest?.status ===
                                                        'pending_manager'
                                                      ? 'text-yellow-600'
                                                      : leaveRequest?.status ===
                                                          'rejected_by_manager'
                                                        ? 'text-red-600'
                                                        : 'text-gray-400'
                                            }`}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            Manager Review
                                        </p>

                                        {leaveRequest?.manager_approver ? (
                                            <div className="mt-1 flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600">
                                                    <span className="text-xs font-medium text-white">
                                                        {leaveRequest.manager_approver.name
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Reviewed by{' '}
                                                    {
                                                        leaveRequest
                                                            .manager_approver
                                                            .name
                                                    }
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="mt-1 flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <p className="text-sm text-gray-500">
                                                    Waiting for review
                                                </p>
                                            </div>
                                        )}

                                        {leaveRequest?.manager_approved_at && (
                                            <>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {leaveRequest.status ===
                                                    'rejected_by_manager'
                                                        ? 'Rejected'
                                                        : 'Approved'}{' '}
                                                    on{' '}
                                                    {new Date(
                                                        leaveRequest.manager_approved_at,
                                                    ).toLocaleString()}
                                                </p>
                                                {leaveRequest?.manager_comments && (
                                                    <div
                                                        className={`mt-2 rounded-lg p-3 ${
                                                            leaveRequest.status ===
                                                            'rejected_by_manager'
                                                                ? 'border border-red-200 bg-red-50'
                                                                : 'bg-gray-50'
                                                        }`}
                                                    >
                                                        <p className="mb-1 text-xs text-gray-500">
                                                            {leaveRequest.status ===
                                                            'rejected_by_manager'
                                                                ? 'Rejection Reason:'
                                                                : 'Comment:'}
                                                        </p>
                                                        <p
                                                            className={`text-sm ${
                                                                leaveRequest.status ===
                                                                'rejected_by_manager'
                                                                    ? 'text-red-700'
                                                                    : 'text-gray-700'
                                                            }`}
                                                        >
                                                            {
                                                                leaveRequest.manager_comments
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {leaveRequest?.status ===
                                            'pending_manager' && (
                                            <Badge className="mt-2 border border-yellow-200 bg-yellow-100 text-yellow-700">
                                                <Clock className="mr-1 h-3 w-3" />
                                                Pending Review
                                            </Badge>
                                        )}
                                    </div>
                                    {leaveRequest?.manager_approved_at &&
                                        leaveRequest?.status !==
                                            'rejected_by_manager' && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        )}
                                    {leaveRequest?.status ===
                                        'rejected_by_manager' && (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                    {leaveRequest?.status ===
                                        'pending_manager' && (
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    )}
                                </div>

                                {/* HR Approval */}
                                {[
                                    'pending_hr',
                                    'approved',
                                    'rejected_by_hr',
                                    'pending_cancellation',
                                    'cancelled',
                                ].includes(leaveRequest?.status) && (
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                                leaveRequest?.hr_approved_at
                                                    ? 'bg-green-100'
                                                    : leaveRequest?.status ===
                                                        'pending_hr'
                                                      ? 'bg-blue-100'
                                                      : leaveRequest?.status ===
                                                          'rejected_by_hr'
                                                        ? 'bg-red-100'
                                                        : 'bg-gray-100'
                                            }`}
                                        >
                                            <Shield
                                                className={`h-5 w-5 ${
                                                    leaveRequest?.hr_approved_at
                                                        ? 'text-green-600'
                                                        : leaveRequest?.status ===
                                                            'pending_hr'
                                                          ? 'text-blue-600'
                                                          : leaveRequest?.status ===
                                                              'rejected_by_hr'
                                                            ? 'text-red-600'
                                                            : 'text-gray-400'
                                                }`}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                HR Final Approval
                                            </p>

                                            {leaveRequest?.hr_approver && (
                                                <div className="mt-1 flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                                                        <span className="text-xs font-medium text-white">
                                                            {leaveRequest.hr_approver.name
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Reviewed by{' '}
                                                        {
                                                            leaveRequest
                                                                .hr_approver
                                                                .name
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {leaveRequest?.hr_approved_at && (
                                                <>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {leaveRequest.status ===
                                                        'rejected_by_hr'
                                                            ? 'Rejected'
                                                            : 'Approved'}{' '}
                                                        on{' '}
                                                        {new Date(
                                                            leaveRequest.hr_approved_at,
                                                        ).toLocaleString()}
                                                    </p>
                                                    {leaveRequest?.hr_comments && (
                                                        <div
                                                            className={`mt-2 rounded-lg p-3 ${
                                                                leaveRequest.status ===
                                                                'rejected_by_hr'
                                                                    ? 'border border-red-200 bg-red-50'
                                                                    : 'bg-gray-50'
                                                            }`}
                                                        >
                                                            <p className="mb-1 text-xs text-gray-500">
                                                                {leaveRequest.status ===
                                                                'rejected_by_hr'
                                                                    ? 'Rejection Reason:'
                                                                    : 'HR Comment:'}
                                                            </p>
                                                            <p
                                                                className={`text-sm ${
                                                                    leaveRequest.status ===
                                                                    'rejected_by_hr'
                                                                        ? 'text-red-700'
                                                                        : 'text-gray-700'
                                                                }`}
                                                            >
                                                                {
                                                                    leaveRequest.hr_comments
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {leaveRequest?.status ===
                                                'pending_hr' && (
                                                <Badge className="mt-2 border border-blue-200 bg-blue-100 text-blue-700">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    Awaiting HR Decision
                                                </Badge>
                                            )}
                                        </div>
                                        {leaveRequest?.status ===
                                            'approved' && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        )}
                                        {leaveRequest?.status ===
                                            'rejected_by_hr' && (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        {leaveRequest?.status ===
                                            'pending_hr' && (
                                            <Clock className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Leave Type Info */}
                    {leaveRequest?.leave_type && (
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Leave Type
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-4 w-4 rounded-full"
                                        style={{
                                            backgroundColor:
                                                leaveRequest.leave_type.color,
                                        }}
                                    />
                                    <p className="font-medium text-gray-900">
                                        {leaveRequest.leave_type.name}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {leaveRequest.leave_type.code}
                                </p>
                                {leaveRequest.leave_type.description && (
                                    <p className="border-t pt-3 text-sm text-gray-600">
                                        {leaveRequest.leave_type.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Emergency Contact */}
                    {leaveRequest?.emergency_contact_name && (
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Emergency Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Name
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {leaveRequest.emergency_contact_name}
                                    </p>
                                </div>
                                {leaveRequest?.emergency_contact_phone && (
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Phone
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {
                                                leaveRequest.emergency_contact_phone
                                            }
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Cancel Pending Request Modal */}
            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <DialogContent>
                    <DialogHeader>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-lg bg-red-100 p-2">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl">
                                Cancel Leave Request
                            </DialogTitle>
                        </div>
                        <DialogDescription className="pt-2 text-base">
                            Are you sure you want to cancel this pending leave
                            request?
                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                                <p className="text-sm text-red-800">
                                    <strong>
                                        This action cannot be undone.
                                    </strong>
                                    <br />• Your leave request will be cancelled
                                    immediately
                                    <br />• You'll need to submit a new request
                                    if needed
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelModal(false)}
                            disabled={cancelling}
                        >
                            Keep Request
                        </Button>
                        <Button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {cancelling ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cancelling...
                                </>
                            ) : (
                                <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Request
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request Cancellation Modal (for approved leaves) */}
            <Dialog
                open={showRequestCancelModal}
                onOpenChange={setShowRequestCancelModal}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-lg bg-orange-100 p-2">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                            </div>
                            <DialogTitle className="text-xl">
                                Request Cancellation
                            </DialogTitle>
                        </div>
                        <DialogDescription className="pt-2 text-base">
                            Your leave has already been approved. To cancel it,
                            you need HR approval.
                            <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
                                <p className="text-sm text-orange-800">
                                    <strong>After submitting:</strong>
                                    <br />• Your request will be sent to HR for
                                    review
                                    <br />• Your leave remains approved until HR
                                    decides
                                    <br />• Balance will be restored if approved
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cancellation_reason">
                                Reason for Cancellation{' '}
                                <span className="text-red-600">*</span>
                            </Label>
                            <Textarea
                                id="cancellation_reason"
                                placeholder="Please explain why you need to cancel this approved leave..."
                                value={cancellationReason}
                                onChange={(e) =>
                                    setCancellationReason(e.target.value)
                                }
                                rows={4}
                                className="resize-none"
                            />
                            <p className="text-xs text-gray-500">
                                Be specific - this helps HR make a decision
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRequestCancelModal(false);
                                setCancellationReason('');
                            }}
                            disabled={requestingCancel}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={handleRequestCancellation}
                            disabled={
                                requestingCancel || !cancellationReason.trim()
                            }
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {requestingCancel ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Request
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
