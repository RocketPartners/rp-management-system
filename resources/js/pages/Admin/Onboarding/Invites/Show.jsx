// resources/js/Pages/Admin/Onboarding/Invites/Show.jsx
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    AlertTriangle,
    ArrowLeft,
    Ban,
    Briefcase,
    Building2,
    Calendar,
    CalendarPlus,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    Eye,
    FileText,
    Link2,
    Mail,
    Send,
    User,
    UserPlus,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function Show({ auth, invite }) {
    const [showExtendDialog, setShowExtendDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [extensionDays, setExtensionDays] = useState(7);
    const [copied, setCopied] = useState(false);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
            submitted: 'bg-purple-100 text-purple-800 border-purple-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            expired: 'bg-gray-100 text-gray-800 border-gray-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: Clock,
            in_progress: Clock,
            submitted: CheckCircle2,
            approved: CheckCircle2,
            expired: XCircle,
            cancelled: Ban,
        };
        const Icon = icons[status] || Clock;
        return <Icon className="h-4 w-4" />;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(invite.guest_url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleResend = () => {
        router.post(
            route('onboarding.invites.resend', invite.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Invite resent successfully');
                },
            },
        );
    };

    const handleExtend = () => {
        router.post(
            route('onboarding.invites.extend', invite.id),
            {
                days: extensionDays,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowExtendDialog(false);
                },
            },
        );
    };

    const handleCancel = () => {
        router.post(
            route('onboarding.invites.cancel', invite.id),
            {},
            {
                onSuccess: () => {
                    setShowCancelDialog(false);
                },
            },
        );
    };

    const isExpiringSoon =
        invite.days_until_expiration !== null &&
        invite.days_until_expiration <= 3 &&
        invite.days_until_expiration >= 0;
    const isExpired =
        invite.days_until_expiration !== null &&
        invite.days_until_expiration < 0;
    const canResend = ['pending', 'in_progress'].includes(invite.status);
    const canExtend = ['pending', 'in_progress', 'submitted'].includes(
        invite.status,
    );
    const canCancel = !['approved', 'cancelled'].includes(invite.status);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('onboarding.invites.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="rounded-lg bg-blue-100 p-2">
                            <UserPlus className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Invite Details
                            </h2>
                            <p className="mt-1 text-gray-600">
                                {invite.full_name || invite.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {invite.submission && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={route(
                                        'onboarding.submissions.review',
                                        invite.submission.id,
                                    )}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Submission
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Invite - ${invite.full_name || invite.email}`} />

            <div className="space-y-6">
                {/* Status Alert */}
                {isExpiringSoon && (
                    <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-600" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-orange-900">
                                Expiring Soon
                            </h4>
                            <p className="mt-1 text-sm text-orange-800">
                                This invite will expire in{' '}
                                {invite.days_until_expiration} day
                                {invite.days_until_expiration !== 1 ? 's' : ''}.
                                Consider extending the deadline.
                            </p>
                        </div>
                    </div>
                )}

                {isExpired && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                        <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-red-900">
                                Invite Expired
                            </h4>
                            <p className="mt-1 text-sm text-red-800">
                                This invite expired{' '}
                                {Math.abs(invite.days_until_expiration)} day
                                {Math.abs(invite.days_until_expiration) !== 1
                                    ? 's'
                                    : ''}{' '}
                                ago.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column - Main Info */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Candidate Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Candidate Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-gray-600">
                                            Email Address
                                        </Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <p className="font-medium text-gray-900">
                                                {invite.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">
                                            Full Name
                                        </Label>
                                        <p className="mt-1 font-medium text-gray-900">
                                            {invite.full_name || (
                                                <span className="italic text-gray-400">
                                                    Not provided
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">
                                            Position
                                        </Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-gray-400" />
                                            <p className="font-medium text-gray-900">
                                                {invite.position}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-gray-600">
                                            Department
                                        </Label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-gray-400" />
                                            <p className="font-medium text-gray-900">
                                                {invite.department}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Guest Link */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Link2 className="h-5 w-5" />
                                    Onboarding Link
                                </CardTitle>
                                <CardDescription>
                                    Share this link with the candidate to start
                                    their onboarding process
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Input
                                        value={invite.guest_url}
                                        readOnly
                                        className="font-mono text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={copyToClipboard}
                                        className="shrink-0"
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        asChild
                                        className="shrink-0"
                                    >
                                        <a
                                            href={invite.guest_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Open
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submission Details */}
                        {invite.submission && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Submission Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label className="text-gray-600">
                                                Completion Status
                                            </Label>
                                            <div className="mt-1">
                                                <Badge
                                                    variant="outline"
                                                    className="text-sm"
                                                >
                                                    {
                                                        invite.submission
                                                            .completion_percentage
                                                    }
                                                    % Complete
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-gray-600">
                                                Documents Uploaded
                                            </Label>
                                            <p className="mt-1 font-medium text-gray-900">
                                                {invite.submission.documents
                                                    ?.length || 0}{' '}
                                                documents
                                            </p>
                                        </div>
                                        {invite.submission.submitted_at && (
                                            <div>
                                                <Label className="text-gray-600">
                                                    Submitted At
                                                </Label>
                                                <p className="mt-1 font-medium text-gray-900">
                                                    {format(
                                                        new Date(
                                                            invite.submission.submitted_at,
                                                        ),
                                                        'PPp',
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t pt-4">
                                        <Button asChild className="w-full">
                                            <Link
                                                href={route(
                                                    'onboarding.submissions.review',
                                                    invite.submission.id,
                                                )}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Review Full Submission
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Converted User */}
                        {invite.converted_user && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        User Account Created
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <p className="text-sm text-green-800">
                                            This candidate has been successfully
                                            converted to a user account.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label className="text-gray-600">
                                                User Name
                                            </Label>
                                            <p className="mt-1 font-medium text-gray-900">
                                                {invite.converted_user.name}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-600">
                                                Work Email
                                            </Label>
                                            <p className="mt-1 font-medium text-gray-900">
                                                {invite.converted_user
                                                    .work_email ||
                                                    invite.converted_user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="border-t pt-4">
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="w-full"
                                        >
                                            <Link
                                                href={route(
                                                    'users.show',
                                                    invite.converted_user.id,
                                                )}
                                            >
                                                <User className="mr-2 h-4 w-4" />
                                                View User Profile
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Status & Actions */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-gray-600">
                                        Current Status
                                    </Label>
                                    <div className="mt-2">
                                        <Badge
                                            className={`${getStatusColor(invite.status)} flex w-fit items-center gap-1.5 border`}
                                        >
                                            {getStatusIcon(invite.status)}
                                            <span className="capitalize">
                                                {invite.status.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </span>
                                        </Badge>
                                    </div>
                                </div>

                                {invite.expires_at && (
                                    <div>
                                        <Label className="text-gray-600">
                                            Expiration Date
                                        </Label>
                                        <div className="mt-2 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <p className="font-medium text-gray-900">
                                                {format(
                                                    new Date(invite.expires_at),
                                                    'PPP',
                                                )}
                                            </p>
                                        </div>
                                        {invite.days_until_expiration !==
                                            null && (
                                            <p
                                                className={`mt-1 text-sm ${
                                                    invite.days_until_expiration <
                                                    0
                                                        ? 'text-red-600'
                                                        : invite.days_until_expiration <=
                                                            3
                                                          ? 'text-orange-600'
                                                          : 'text-gray-600'
                                                }`}
                                            >
                                                {invite.days_until_expiration <
                                                0
                                                    ? `Expired ${Math.abs(invite.days_until_expiration)} days ago`
                                                    : invite.days_until_expiration ===
                                                        0
                                                      ? 'Expires today'
                                                      : `${invite.days_until_expiration} days remaining`}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <Label className="text-gray-600">
                                        Created
                                    </Label>
                                    <p className="mt-1 font-medium text-gray-900">
                                        {format(
                                            new Date(invite.created_at),
                                            'PPp',
                                        )}
                                    </p>
                                    {invite.creator && (
                                        <p className="mt-1 text-sm text-gray-600">
                                            by {invite.creator.name}
                                        </p>
                                    )}
                                </div>

                                {invite.submitted_at && (
                                    <div>
                                        <Label className="text-gray-600">
                                            Submitted
                                        </Label>
                                        <p className="mt-1 font-medium text-gray-900">
                                            {format(
                                                new Date(invite.submitted_at),
                                                'PPp',
                                            )}
                                        </p>
                                    </div>
                                )}

                                {invite.approved_at && (
                                    <div>
                                        <Label className="text-gray-600">
                                            Approved
                                        </Label>
                                        <p className="mt-1 font-medium text-gray-900">
                                            {format(
                                                new Date(invite.approved_at),
                                                'PPp',
                                            )}
                                        </p>
                                        {invite.approver && (
                                            <p className="mt-1 text-sm text-gray-600">
                                                by {invite.approver.name}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {canResend && (
                                    <Button
                                        onClick={handleResend}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Resend Invite Email
                                    </Button>
                                )}

                                {canExtend && (
                                    <Button
                                        onClick={() =>
                                            setShowExtendDialog(true)
                                        }
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <CalendarPlus className="mr-2 h-4 w-4" />
                                        Extend Deadline
                                    </Button>
                                )}

                                {canCancel && (
                                    <Button
                                        onClick={() =>
                                            setShowCancelDialog(true)
                                        }
                                        variant="outline"
                                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Ban className="mr-2 h-4 w-4" />
                                        Cancel Invite
                                    </Button>
                                )}

                                {!canResend && !canExtend && !canCancel && (
                                    <p className="py-4 text-center text-sm text-gray-500">
                                        No actions available for this invite
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Extend Dialog */}
            <AlertDialog
                open={showExtendDialog}
                onOpenChange={setShowExtendDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Extend Invite Deadline
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Add more days to the expiration date for this
                            invite.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="days">Number of Days to Add</Label>
                        <Input
                            id="days"
                            type="number"
                            min="1"
                            max="30"
                            value={extensionDays}
                            onChange={(e) =>
                                setExtensionDays(parseInt(e.target.value))
                            }
                            className="mt-2"
                        />
                        <p className="mt-2 text-sm text-gray-600">
                            New expiration date:{' '}
                            {invite.expires_at &&
                                format(
                                    new Date(
                                        new Date(invite.expires_at).getTime() +
                                            extensionDays * 24 * 60 * 60 * 1000,
                                    ),
                                    'PPP',
                                )}
                        </p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleExtend}>
                            Extend Deadline
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Dialog */}
            <AlertDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Cancel Invite
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this invite? The
                            candidate will no longer be able to access the
                            onboarding form using this link.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-800">
                            This action cannot be undone. You will need to
                            create a new invite if you want to re-invite this
                            candidate.
                        </p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Invite</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Yes, Cancel Invite
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
