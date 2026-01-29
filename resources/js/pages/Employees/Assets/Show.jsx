// resources/js/Pages/Employees/Leaves/Show.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Info,
    Loader2,
    MessageSquare,
    Phone,
    Send,
    Shield,
    User,
    XCircle,
    X as XIcon,
} from 'lucide-react';
import { useState } from 'react';

export default function Show({ auth, leaveRequest }) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showAppealModal, setShowAppealModal] = useState(false);

    const {
        data: appealData,
        setData: setAppealData,
        post: postAppeal,
        processing: appealProcessing,
    } = useForm({
        appeal_reason: '',
    });

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this leave request?')) {
            router.post(route('my-leaves.cancel', leaveRequest.id));
        }
    };

    const handleAppeal = (e) => {
        e.preventDefault();
        postAppeal(route('my-leaves.appeal', leaveRequest.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowAppealModal(false);
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
            appealed: {
                bg: 'bg-orange-100',
                text: 'text-orange-700',
                border: 'border-orange-200',
                icon: AlertCircle,
            },
            cancelled: {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
                border: 'border-gray-200',
                icon: XCircle,
            },
        };
        return styles[status] || styles.pending_manager;
    };

    const statusStyle = getStatusBadge(leaveRequest.status);
    const StatusIcon = statusStyle.icon;

    const canCancel = ['pending_manager', 'pending_hr'].includes(
        leaveRequest.status,
    );
    const canAppeal = leaveRequest.status === 'rejected_by_manager';
    const wasAutoApproved =
        leaveRequest.manager_comments?.includes('Auto-approved');

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
                                        My Leave Request
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

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {canCancel && (
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Request
                            </Button>
                        )}
                        {canAppeal && (
                            <Button
                                onClick={() => setShowAppealModal(true)}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Appeal Decision
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
                    {/* Status Alert */}
                    {leaveRequest.status === 'pending_manager' && (
                        <Alert className="animate-fade-in border-yellow-300 bg-yellow-50">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <strong>Waiting for Manager Approval</strong>
                                <p className="mt-1 text-sm">
                                    Your request has been sent to{' '}
                                    {leaveRequest.manager?.name ||
                                        'your manager'}{' '}
                                    for review.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {leaveRequest.status === 'pending_hr' && (
                        <Alert className="animate-fade-in border-blue-300 bg-blue-50">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                                <strong>Waiting for HR Approval</strong>
                                <p className="mt-1 text-sm">
                                    Your manager approved! Now waiting for HR
                                    final approval.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {leaveRequest.status === 'approved' && (
                        <Alert className="animate-fade-in border-green-300 bg-green-50">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <AlertDescription className="text-green-800">
                                <strong>Leave Approved!</strong>
                                <p className="mt-1 text-sm">
                                    Your leave has been approved.{' '}
                                    {leaveRequest.total_days}{' '}
                                    {leaveRequest.total_days === 1
                                        ? 'day'
                                        : 'days'}{' '}
                                    deducted from your balance.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {leaveRequest.status === 'rejected_by_manager' && (
                        <Alert className="animate-fade-in border-red-300 bg-red-50">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <strong>Request Rejected by Manager</strong>
                                <p className="mt-1 text-sm">
                                    You can appeal this decision. Click "Appeal
                                    Decision" above.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {leaveRequest.status === 'rejected_by_hr' && (
                        <Alert className="animate-fade-in border-red-300 bg-red-50">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <strong>Request Rejected by HR</strong>
                                <p className="mt-1 text-sm">
                                    This is a final decision. Please contact HR
                                    if you have questions.
                                </p>
                            </AlertDescription>
                        </Alert>
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
                                    Duration Type
                                </p>
                                <Badge variant="outline" className="capitalize">
                                    {leaveRequest.duration.replace(/_/g, ' ')}
                                </Badge>
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
                            <CardTitle>Approval Status</CardTitle>
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

                                {/* Manager Approval */}
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                            leaveRequest.manager_approved_at
                                                ? 'bg-green-100'
                                                : leaveRequest.status ===
                                                    'pending_manager'
                                                  ? 'bg-yellow-100'
                                                  : leaveRequest.status ===
                                                      'rejected_by_manager'
                                                    ? 'bg-red-100'
                                                    : 'bg-gray-100'
                                        }`}
                                    >
                                        {wasAutoApproved ? (
                                            <Shield className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <User
                                                className={`h-5 w-5 ${
                                                    leaveRequest.manager_approved_at
                                                        ? 'text-green-600'
                                                        : leaveRequest.status ===
                                                            'pending_manager'
                                                          ? 'text-yellow-600'
                                                          : leaveRequest.status ===
                                                              'rejected_by_manager'
                                                            ? 'text-red-600'
                                                            : 'text-gray-400'
                                                }`}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            Manager Approval
                                        </p>
                                        {leaveRequest.manager && (
                                            <p className="text-sm text-gray-600">
                                                {leaveRequest.manager.name}
                                            </p>
                                        )}

                                        {leaveRequest.manager_approved_at && (
                                            <>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Approved on{' '}
                                                    {new Date(
                                                        leaveRequest.manager_approved_at,
                                                    ).toLocaleString()}
                                                </p>
                                                {leaveRequest.manager_comments && (
                                                    <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
                                                        <p className="mb-1 text-xs text-green-600">
                                                            Manager's Comment:
                                                        </p>
                                                        <p className="text-sm text-green-800">
                                                            {
                                                                leaveRequest.manager_comments
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {leaveRequest.status ===
                                            'pending_manager' && (
                                            <Badge className="mt-2 bg-yellow-100 text-yellow-700">
                                                <Clock className="mr-1 h-3 w-3" />
                                                Pending Review
                                            </Badge>
                                        )}

                                        {leaveRequest.status ===
                                            'rejected_by_manager' && (
                                            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                                                <p className="mb-1 text-xs text-red-600">
                                                    Rejection Reason:
                                                </p>
                                                <p className="text-sm text-red-800">
                                                    {
                                                        leaveRequest.manager_comments
                                                    }
                                                </p>
                                                {canAppeal && (
                                                    <Button
                                                        size="sm"
                                                        className="mt-3 bg-orange-600 hover:bg-orange-700"
                                                        onClick={() =>
                                                            setShowAppealModal(
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        Appeal This Decision
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {leaveRequest.manager_approved_at && (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    )}
                                    {leaveRequest.status ===
                                        'rejected_by_manager' && (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                </div>

                                {/* HR Approval */}
                                {[
                                    'pending_hr',
                                    'approved',
                                    'rejected_by_hr',
                                    'appealed',
                                ].includes(leaveRequest.status) && (
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                                                leaveRequest.hr_approved_at
                                                    ? 'bg-green-100'
                                                    : leaveRequest.status ===
                                                        'pending_hr'
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
                                                        : leaveRequest.status ===
                                                            'pending_hr'
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

                                            {leaveRequest.hr_approved_at && (
                                                <>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        Approved on{' '}
                                                        {new Date(
                                                            leaveRequest.hr_approved_at,
                                                        ).toLocaleString()}
                                                    </p>
                                                    {leaveRequest.hr_comments && (
                                                        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
                                                            <p className="mb-1 text-xs text-green-600">
                                                                HR Comment:
                                                            </p>
                                                            <p className="text-sm text-green-800">
                                                                {
                                                                    leaveRequest.hr_comments
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {leaveRequest.status ===
                                                'pending_hr' && (
                                                <Badge className="mt-2 bg-blue-100 text-blue-700">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    Pending HR Review
                                                </Badge>
                                            )}

                                            {leaveRequest.status ===
                                                'rejected_by_hr' &&
                                                leaveRequest.hr_comments && (
                                                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                                                        <p className="mb-1 text-xs text-red-600">
                                                            Rejection Reason:
                                                        </p>
                                                        <p className="text-sm text-red-800">
                                                            {
                                                                leaveRequest.hr_comments
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                        </div>
                                        {leaveRequest.status === 'approved' && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        )}
                                        {leaveRequest.status ===
                                            'rejected_by_hr' && (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                )}

                                {/* Appeal Info */}
                                {leaveRequest.status === 'appealed' &&
                                    leaveRequest.appeal_reason && (
                                        <div className="flex items-start gap-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                                                <MessageSquare className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    Your Appeal
                                                </p>
                                                <p className="mb-2 text-xs text-gray-600">
                                                    Submitted on{' '}
                                                    {new Date(
                                                        leaveRequest.appealed_at,
                                                    ).toLocaleString()}
                                                </p>
                                                <div className="rounded border border-orange-200 bg-white p-3">
                                                    <p className="text-sm text-gray-900">
                                                        {
                                                            leaveRequest.appeal_reason
                                                        }
                                                    </p>
                                                </div>
                                                <Alert className="mt-3 border-blue-200 bg-blue-50">
                                                    <Info className="h-4 w-4 text-blue-600" />
                                                    <AlertDescription className="text-xs text-blue-800">
                                                        Your appeal is being
                                                        reviewed by HR. You'll
                                                        receive an email with
                                                        their decision.
                                                    </AlertDescription>
                                                </Alert>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Emergency Contact */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Emergency Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="mb-1 text-sm text-gray-600">
                                    Name
                                </p>
                                <p className="font-medium text-gray-900">
                                    {leaveRequest.emergency_contact_name ||
                                        'Not provided'}
                                </p>
                            </div>
                            <div>
                                <p className="mb-1 text-sm text-gray-600">
                                    Phone
                                </p>
                                <p className="font-medium text-gray-900">
                                    {leaveRequest.emergency_contact_phone ||
                                        'Not provided'}
                                </p>
                            </div>
                            {leaveRequest.availability && (
                                <div className="border-t pt-3">
                                    <p className="mb-1 text-sm text-gray-600">
                                        Availability
                                    </p>
                                    <Badge
                                        variant="outline"
                                        className="capitalize"
                                    >
                                        {leaveRequest.availability.replace(
                                            /_/g,
                                            ' ',
                                        )}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Leave Type Info */}
                    <Card className="animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle>
                                {leaveRequest.leave_type.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                {leaveRequest.leave_type.is_paid ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-gray-700">
                                    {leaveRequest.leave_type.is_paid
                                        ? 'Paid Leave'
                                        : 'Unpaid Leave'}
                                </span>
                            </div>

                            <div className="border-t pt-3">
                                <p className="mb-1 text-gray-600">
                                    Annual Allocation
                                </p>
                                <p className="font-medium text-gray-900">
                                    {leaveRequest.leave_type.days_per_year}{' '}
                                    days/year
                                </p>
                            </div>

                            {leaveRequest.leave_type.description && (
                                <p className="border-t pt-3 text-gray-600">
                                    {leaveRequest.leave_type.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Request Info */}
                    <Card className="animate-fade-in animation-delay-300">
                        <CardHeader>
                            <CardTitle>Request Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="mb-1 text-gray-600">Request ID</p>
                                <p className="font-mono font-medium text-gray-900">
                                    #{leaveRequest.id}
                                </p>
                            </div>
                            <div>
                                <p className="mb-1 text-gray-600">Submitted</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(
                                        leaveRequest.created_at,
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="mb-1 text-gray-600">
                                    Last Updated
                                </p>
                                <p className="font-medium text-gray-900">
                                    {new Date(
                                        leaveRequest.updated_at,
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Appeal Modal */}
            {showAppealModal && (
                <>
                    <div
                        className="animate-fade-in fixed inset-0 z-50 bg-black/50"
                        onClick={() => setShowAppealModal(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="animate-scale-in w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-orange-100 p-2">
                                        <MessageSquare className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Appeal Decision
                                        </h3>
                                        <p className="mt-0.5 text-sm text-gray-600">
                                            Explain why you're appealing this
                                            rejection
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAppealModal(false)}
                                    className="rounded-md p-1 transition-colors hover:bg-gray-100"
                                >
                                    <XIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleAppeal} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="appeal_reason">
                                        Appeal Reason *
                                    </Label>
                                    <Textarea
                                        id="appeal_reason"
                                        value={appealData.appeal_reason}
                                        onChange={(e) =>
                                            setAppealData(
                                                'appeal_reason',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Explain why this leave is important and should be reconsidered..."
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                                    <p className="text-sm text-orange-800">
                                        <strong>This will:</strong>
                                        <br />• Send your appeal to HR for
                                        review
                                        <br />• HR will make the final decision
                                        <br />• You'll receive an email with the
                                        outcome
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowAppealModal(false)
                                        }
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={appealProcessing}
                                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                                    >
                                        {appealProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Submit Appeal
                                            </>
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
