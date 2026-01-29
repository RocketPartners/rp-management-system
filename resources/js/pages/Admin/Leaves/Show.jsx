// resources/js/Pages/Admin/Leaves/Show.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Loader2,
    Send,
    Shield,
    User,
    UserCheck,
    UserX,
    XCircle,
    X as XIcon,
} from 'lucide-react';
import { useState } from 'react';

export default function Show({ auth, leaveRequest }) {
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveCancelModal, setShowApproveCancelModal] = useState(false);
    const [showRejectCancelModal, setShowRejectCancelModal] = useState(false);
    const { flash } = usePage().props;

    // ✅ FIXED: Check if user is HR/Admin (by ROLE, not permission)
    const isHROrAdmin = auth.user?.roles?.some((role) =>
        ['super-admin', 'admin', 'hr-manager'].includes(role.slug),
    );

    // ✅ Check if user is Senior/Lead/PM
    const isSeniorOrAbove = auth.user?.roles?.some((role) =>
        ['senior-engineer', 'lead-engineer', 'project-manager'].includes(
            role.slug,
        ),
    );

    // ✅ Determine which approval step user can perform
    const isPendingManager = leaveRequest.status === 'pending_manager';
    const isPendingHR = leaveRequest.status === 'pending_hr';
    const isPendingCancellation =
        leaveRequest.status === 'pending_cancellation';

    // ✅ User can approve as manager if they're Senior/Lead/PM OR HR (HR can override)
    const canApproveAsManager =
        isPendingManager && (isSeniorOrAbove || isHROrAdmin);

    // ✅ User can approve as HR if status is pending_hr AND they have HR role
    const canApproveAsHRFinal = isPendingHR && isHROrAdmin;

    // ✅ User can handle cancellation requests (HR only)
    const canHandleCancellation = isPendingCancellation && isHROrAdmin;

    // ✅ Combined permission check
    const canTakeAction =
        canApproveAsManager || canApproveAsHRFinal || canHandleCancellation;

    // ✅ Determine approval type based on status
    const approvalType = isPendingManager
        ? 'manager'
        : isPendingHR
          ? 'hr'
          : 'none';

    // ✅ FIXED: Smart Back Button Logic
    const getBackUrl = () => {
        // If HR/Admin - go to all leaves
        if (isHROrAdmin) {
            return route('leaves.index');
        }
        // If Senior/Lead/PM - go to pending approvals
        if (isSeniorOrAbove) {
            return route('leaves.pending-approvals');
        }
        // Default - go to my leaves
        return route('my-leaves.index');
    };

    // Forms for manager approval
    const {
        data: managerApproveData,
        setData: setManagerApproveData,
        post: postManagerApprove,
        processing: managerApproveProcessing,
    } = useForm({
        manager_comments: '',
    });

    const {
        data: managerRejectData,
        setData: setManagerRejectData,
        post: postManagerReject,
        processing: managerRejectProcessing,
    } = useForm({
        manager_comments: '',
    });

    // Forms for HR approval
    const {
        data: hrApproveData,
        setData: setHrApproveData,
        post: postHrApprove,
        processing: hrApproveProcessing,
    } = useForm({
        hr_comments: '',
    });

    const {
        data: hrRejectData,
        setData: setHrRejectData,
        post: postHrReject,
        processing: hrRejectProcessing,
    } = useForm({
        hr_comments: '',
    });

    // ✅ NEW: Forms for cancellation approval
    const {
        data: cancelApproveData,
        setData: setCancelApproveData,
        post: postCancelApprove,
        processing: cancelApproveProcessing,
    } = useForm({
        cancellation_hr_comments: '',
    });

    const {
        data: cancelRejectData,
        setData: setCancelRejectData,
        post: postCancelReject,
        processing: cancelRejectProcessing,
    } = useForm({
        cancellation_hr_comments: '',
    });

    // ✅ Handle manager approval
    const handleManagerApprove = (e) => {
        e.preventDefault();
        postManagerApprove(route('leaves.manager-approve', leaveRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowApproveModal(false);
            },
        });
    };

    const handleManagerReject = (e) => {
        e.preventDefault();
        postManagerReject(route('leaves.manager-reject', leaveRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
            },
        });
    };

    // ✅ Handle HR approval
    const handleHrApprove = (e) => {
        e.preventDefault();
        postHrApprove(route('leaves.hr-approve', leaveRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowApproveModal(false);
            },
        });
    };

    const handleHrReject = (e) => {
        e.preventDefault();
        postHrReject(route('leaves.hr-reject', leaveRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
            },
        });
    };

    // ✅ NEW: Handle cancellation approval
    const handleApproveCancellation = (e) => {
        e.preventDefault();
        postCancelApprove(
            route('leaves.approve-cancellation', leaveRequest.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowApproveCancelModal(false);
                },
            },
        );
    };

    const handleRejectCancellation = (e) => {
        e.preventDefault();
        postCancelReject(route('leaves.reject-cancellation', leaveRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectCancelModal(false);
            },
        });
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

    const statusStyle = getStatusBadge(leaveRequest.status);
    const StatusIcon = statusStyle.icon;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={getBackUrl()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div className="h-8 w-px bg-gray-300" />
                        <div className="flex items-center gap-3">
                            <div
                                className="rounded-lg p-2"
                                style={{
                                    backgroundColor:
                                        leaveRequest.leave_type.color + '15',
                                }}
                            >
                                <Calendar
                                    className="h-6 w-6"
                                    style={{
                                        color: leaveRequest.leave_type.color,
                                    }}
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {leaveRequest.user.name}'s Leave Request
                                    </h2>
                                    <Badge
                                        className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex items-center gap-1.5 border`}
                                    >
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {leaveRequest.status
                                            .replace(/_/g, ' ')
                                            .replace(/\b\w/g, (l) =>
                                                l.toUpperCase(),
                                            )}
                                    </Badge>
                                </div>
                                <p className="mt-1 text-gray-600">
                                    {leaveRequest.leave_type.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Show appropriate buttons */}
                    {canApproveAsManager && (
                        <div className="flex gap-3">
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setShowApproveModal(true)}
                            >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Approve (Manager)
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setShowRejectModal(true)}
                            >
                                <UserX className="mr-2 h-4 w-4" />
                                Reject (Manager)
                            </Button>
                        </div>
                    )}

                    {canApproveAsHRFinal && (
                        <div className="flex gap-3">
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setShowApproveModal(true)}
                            >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Approve (HR Final)
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setShowRejectModal(true)}
                            >
                                <UserX className="mr-2 h-4 w-4" />
                                Reject (HR Final)
                            </Button>
                        </div>
                    )}

                    {canHandleCancellation && (
                        <div className="flex gap-3">
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setShowApproveCancelModal(true)}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve Cancellation
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setShowRejectCancelModal(true)}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject Cancellation
                            </Button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title={`Leave Request - ${leaveRequest.user.name}`} />

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

                    {/* ✅ NEW: Cancellation Request Alert (for HR) */}
                    {isPendingCancellation && (
                        <Alert className="animate-fade-in border-orange-300 bg-orange-50">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                <strong>Cancellation Request Pending:</strong>{' '}
                                Employee requested to cancel this approved
                                leave. Review the reason below and
                                approve/reject.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* ✅ NEW: Cancellation Details Card (if pending cancellation) */}
                    {isPendingCancellation && (
                        <Card className="animate-fade-in border-2 border-orange-300 bg-orange-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-800">
                                    <AlertTriangle className="h-5 w-5" />
                                    Cancellation Request Details
                                </CardTitle>
                                <CardDescription className="text-orange-700">
                                    Employee wants to cancel this approved leave
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="font-semibold text-orange-800">
                                        Cancellation Reason:
                                    </Label>
                                    <div className="mt-2 rounded-lg border border-orange-200 bg-white p-4">
                                        <p className="whitespace-pre-wrap text-gray-900">
                                            {leaveRequest.cancellation_reason}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-orange-200 pt-2">
                                    <div>
                                        <p className="text-sm font-medium text-orange-700">
                                            Requested By
                                        </p>
                                        <p className="text-gray-900">
                                            {leaveRequest.user.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-orange-700">
                                            Requested On
                                        </p>
                                        <p className="text-gray-900">
                                            {new Date(
                                                leaveRequest.cancellation_requested_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-lg border border-orange-200 bg-white p-3">
                                    <p className="text-sm text-orange-800">
                                        <strong>If you approve:</strong>{' '}
                                        {leaveRequest.total_days} days will be
                                        restored to employee's balance
                                        <br />
                                        <strong>If you reject:</strong> Leave
                                        remains approved, employee must take the
                                        leave
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* ✅ Permission Info Alert */}
                    {isPendingManager && !canApproveAsManager && (
                        <Alert className="animate-fade-in border-yellow-300 bg-yellow-50">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <strong>View Only:</strong> Only Seniors, Leads,
                                Project Managers, or HR can approve this
                                request.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isPendingHR && !canApproveAsHRFinal && (
                        <Alert className="animate-fade-in border-yellow-300 bg-yellow-50">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <strong>View Only:</strong> Only HR roles (Super
                                Admin, Admin, HR Manager) can approve this
                                request.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Employee Info */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle>Employee Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                {leaveRequest.user.profile_picture ? (
                                    <img
                                        src={`/storage/${leaveRequest.user.profile_picture}`}
                                        alt={leaveRequest.user.name}
                                        className="h-16 w-16 rounded-full border-2 border-gray-200 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-blue-600">
                                        <span className="text-2xl font-medium text-white">
                                            {leaveRequest.user.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {leaveRequest.user.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {leaveRequest.user.position ||
                                            leaveRequest.user.department ||
                                            leaveRequest.user.email}
                                    </p>
                                    {leaveRequest.user.employee_id && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            ID: {leaveRequest.user.employee_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Details */}
                    <Card className="animate-fade-in animation-delay-100">
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
                                            leaveRequest.start_date,
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
                                            leaveRequest.end_date,
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
                                            {leaveRequest.total_days}
                                        </p>
                                        <span className="text-gray-500">
                                            {leaveRequest.total_days === 1
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
                                        {leaveRequest.reason}
                                    </p>
                                </div>
                            </div>

                            {leaveRequest.attachment && (
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
                    <Card className="animate-fade-in animation-delay-200">
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
                                                leaveRequest.created_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>

                                {/* Manager Review */}
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                            leaveRequest.manager_approved_at
                                                ? 'bg-green-100'
                                                : isPendingManager
                                                  ? 'bg-yellow-100'
                                                  : leaveRequest.status ===
                                                      'rejected_by_manager'
                                                    ? 'bg-red-100'
                                                    : 'bg-gray-100'
                                        }`}
                                    >
                                        <User
                                            className={`h-5 w-5 ${
                                                leaveRequest.manager_approved_at
                                                    ? 'text-green-600'
                                                    : isPendingManager
                                                      ? 'text-yellow-600'
                                                      : leaveRequest.status ===
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

                                        {leaveRequest.manager_approver ? (
                                            <p className="text-sm text-gray-600">
                                                Reviewed by{' '}
                                                {
                                                    leaveRequest
                                                        .manager_approver.name
                                                }
                                            </p>
                                        ) : (
                                            <p className="text-sm italic text-gray-500">
                                                Waiting for review
                                            </p>
                                        )}

                                        {leaveRequest.manager_approved_at && (
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
                                                {leaveRequest.manager_comments && (
                                                    <div
                                                        className={`mt-2 rounded-lg p-3 ${
                                                            leaveRequest.status ===
                                                            'rejected_by_manager'
                                                                ? 'border border-red-200 bg-red-50'
                                                                : 'bg-gray-50'
                                                        }`}
                                                    >
                                                        <p className="mb-1 text-xs text-gray-500">
                                                            Comment:
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

                                        {isPendingManager && (
                                            <Badge className="mt-2 border border-yellow-200 bg-yellow-100 text-yellow-700">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {canApproveAsManager
                                                    ? 'Awaiting Your Approval'
                                                    : 'Pending'}
                                            </Badge>
                                        )}
                                    </div>
                                    {leaveRequest.manager_approved_at &&
                                        leaveRequest.status !==
                                            'rejected_by_manager' && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        )}
                                    {leaveRequest.status ===
                                        'rejected_by_manager' && (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                    {isPendingManager && (
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    )}
                                </div>

                                {/* HR Approval */}
                                {[
                                    'pending_hr',
                                    'approved',
                                    'rejected_by_hr',
                                    'pending_cancellation',
                                ].includes(leaveRequest.status) && (
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                                leaveRequest.hr_approved_at
                                                    ? 'bg-green-100'
                                                    : isPendingHR
                                                      ? 'bg-blue-100'
                                                      : leaveRequest.status ===
                                                          'rejected_by_hr'
                                                        ? 'bg-red-100'
                                                        : 'bg-gray-100'
                                            }`}
                                        >
                                            <Shield
                                                className={`h-5 w-5 ${
                                                    leaveRequest.hr_approved_at
                                                        ? 'text-green-600'
                                                        : isPendingHR
                                                          ? 'text-blue-600'
                                                          : leaveRequest.status ===
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
                                            {leaveRequest.hr_approver && (
                                                <p className="text-sm text-gray-600">
                                                    Reviewed by{' '}
                                                    {
                                                        leaveRequest.hr_approver
                                                            .name
                                                    }
                                                </p>
                                            )}

                                            {leaveRequest.hr_approved_at && (
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
                                                    {leaveRequest.hr_comments && (
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

                                            {isPendingHR && (
                                                <Badge className="mt-2 border border-blue-200 bg-blue-100 text-blue-700">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    {canApproveAsHRFinal
                                                        ? 'Awaiting Your Approval'
                                                        : 'Awaiting HR'}
                                                </Badge>
                                            )}
                                        </div>
                                        {leaveRequest.status === 'approved' && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        )}
                                        {leaveRequest.status ===
                                            'rejected_by_hr' && (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        {isPendingHR && (
                                            <Clock className="h-5 w-5 text-blue-600" />
                                        )}
                                        {isPendingCancellation && (
                                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* ✅ NEW: Cancellation Action Card (HR only) */}
                    {canHandleCancellation && (
                        <Card className="animate-fade-in border-2 border-orange-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-700">
                                    <AlertTriangle className="h-5 w-5" />
                                    Cancellation Review
                                </CardTitle>
                                <CardDescription>
                                    Approve or reject the cancellation request
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    className="w-full justify-start bg-green-600 hover:bg-green-700"
                                    onClick={() =>
                                        setShowApproveCancelModal(true)
                                    }
                                >
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Approve Cancellation
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full justify-start"
                                    onClick={() =>
                                        setShowRejectCancelModal(true)
                                    }
                                >
                                    <XCircle className="mr-2 h-5 w-5" />
                                    Reject (Keep Approved)
                                </Button>
                                <div className="mt-3 border-t pt-2">
                                    <p className="text-xs text-gray-600">
                                        Approving will restore{' '}
                                        {leaveRequest.total_days} days to
                                        employee's balance
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Card for Manager Approval */}
                    {canApproveAsManager && (
                        <Card className="animate-fade-in border-2 border-yellow-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-700">
                                    <Clock className="h-5 w-5" />
                                    Review Required
                                </CardTitle>
                                <CardDescription>
                                    Approve or reject this leave request
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    className="w-full justify-start bg-green-600 hover:bg-green-700"
                                    onClick={() => setShowApproveModal(true)}
                                >
                                    <UserCheck className="mr-2 h-5 w-5" />
                                    Approve Request
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full justify-start"
                                    onClick={() => setShowRejectModal(true)}
                                >
                                    <UserX className="mr-2 h-5 w-5" />
                                    Reject Request
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Card for HR Approval */}
                    {canApproveAsHRFinal && (
                        <Card className="animate-fade-in border-2 border-blue-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-700">
                                    <Shield className="h-5 w-5" />
                                    HR Final Approval
                                </CardTitle>
                                <CardDescription>
                                    Make the final decision on this request
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    className="w-full justify-start bg-green-600 hover:bg-green-700"
                                    onClick={() => setShowApproveModal(true)}
                                >
                                    <UserCheck className="mr-2 h-5 w-5" />
                                    Approve (Final)
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full justify-start"
                                    onClick={() => setShowRejectModal(true)}
                                >
                                    <UserX className="mr-2 h-5 w-5" />
                                    Reject (Final)
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Manager/HR Approval Modals (existing modals - keeping your original code) */}
            {showApproveModal && approvalType === 'manager' && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/50"
                        onClick={() => setShowApproveModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-green-100 p-2">
                                        <UserCheck className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Approve (Manager)
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowApproveModal(false)}
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={handleManagerApprove}
                                className="space-y-4"
                            >
                                <div>
                                    <Label>Comments (Optional)</Label>
                                    <Textarea
                                        value={
                                            managerApproveData.manager_comments
                                        }
                                        onChange={(e) =>
                                            setManagerApproveData(
                                                'manager_comments',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowApproveModal(false)
                                        }
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={managerApproveProcessing}
                                        className="flex-1 bg-green-600"
                                    >
                                        {managerApproveProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Approve'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {showRejectModal && approvalType === 'manager' && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/50"
                        onClick={() => setShowRejectModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-red-100 p-2">
                                        <UserX className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Reject (Manager)
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={handleManagerReject}
                                className="space-y-4"
                            >
                                <div>
                                    <Label>Rejection Reason *</Label>
                                    <Textarea
                                        value={
                                            managerRejectData.manager_comments
                                        }
                                        onChange={(e) =>
                                            setManagerRejectData(
                                                'manager_comments',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowRejectModal(false)
                                        }
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={managerRejectProcessing}
                                        variant="destructive"
                                        className="flex-1"
                                    >
                                        {managerRejectProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Reject'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {showApproveModal && approvalType === 'hr' && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/50"
                        onClick={() => setShowApproveModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-green-100 p-2">
                                        <Shield className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Final HR Approval
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowApproveModal(false)}
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={handleHrApprove}
                                className="space-y-4"
                            >
                                <div>
                                    <Label>Comments (Optional)</Label>
                                    <Textarea
                                        value={hrApproveData.hr_comments}
                                        onChange={(e) =>
                                            setHrApproveData(
                                                'hr_comments',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowApproveModal(false)
                                        }
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={hrApproveProcessing}
                                        className="flex-1 bg-green-600"
                                    >
                                        {hrApproveProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Approve'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {showRejectModal && approvalType === 'hr' && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/50"
                        onClick={() => setShowRejectModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-red-100 p-2">
                                        <UserX className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Final HR Rejection
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={handleHrReject}
                                className="space-y-4"
                            >
                                <div>
                                    <Label>Rejection Reason *</Label>
                                    <Textarea
                                        value={hrRejectData.hr_comments}
                                        onChange={(e) =>
                                            setHrRejectData(
                                                'hr_comments',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        rows={3}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowRejectModal(false)
                                        }
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={hrRejectProcessing}
                                        variant="destructive"
                                        className="flex-1"
                                    >
                                        {hrRejectProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Reject'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* ✅ NEW: Approve Cancellation Modal */}
            {showApproveCancelModal && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/50"
                        onClick={() => setShowApproveCancelModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-green-100 p-2">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Approve Cancellation
                                        </h3>
                                        <p className="mt-0.5 text-sm text-gray-600">
                                            Restore {leaveRequest.total_days}{' '}
                                            days to balance
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        setShowApproveCancelModal(false)
                                    }
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={handleApproveCancellation}
                                className="space-y-4"
                            >
                                <div>
                                    <Label>Comments (Optional)</Label>
                                    <Textarea
                                        value={
                                            cancelApproveData.cancellation_hr_comments
                                        }
                                        onChange={(e) =>
                                            setCancelApproveData(
                                                'cancellation_hr_comments',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Add any comments for the employee..."
                                        rows={3}
                                    />
                                </div>
                                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                    <p className="text-sm text-green-800">
                                        <strong>This will:</strong>
                                        <br />• Cancel the approved leave
                                        <br />• Restore{' '}
                                        {leaveRequest.total_days} days to
                                        balance
                                        <br />• Notify employee of approval
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowApproveCancelModal(false)
                                        }
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={cancelApproveProcessing}
                                        className="flex-1 bg-green-600"
                                    >
                                        {cancelApproveProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Approve Cancellation'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* ✅ NEW: Reject Cancellation Modal */}
            {showRejectCancelModal && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/50"
                        onClick={() => setShowRejectCancelModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-red-100 p-2">
                                        <XCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Reject Cancellation
                                        </h3>
                                        <p className="mt-0.5 text-sm text-gray-600">
                                            Leave will remain approved
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        setShowRejectCancelModal(false)
                                    }
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <form
                                onSubmit={handleRejectCancellation}
                                className="space-y-4"
                            >
                                <div>
                                    <Label>Rejection Reason *</Label>
                                    <Textarea
                                        value={
                                            cancelRejectData.cancellation_hr_comments
                                        }
                                        onChange={(e) =>
                                            setCancelRejectData(
                                                'cancellation_hr_comments',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Explain why cancellation is not allowed..."
                                        required
                                        rows={3}
                                    />
                                </div>
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                    <p className="text-sm text-red-800">
                                        <strong>This will:</strong>
                                        <br />• Reject the cancellation request
                                        <br />• Leave remains approved
                                        <br />• Employee must take the leave
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowRejectCancelModal(false)
                                        }
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={cancelRejectProcessing}
                                        variant="destructive"
                                        className="flex-1"
                                    >
                                        {cancelRejectProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Reject Cancellation'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}
