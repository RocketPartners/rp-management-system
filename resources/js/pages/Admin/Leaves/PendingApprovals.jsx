// resources/js/Pages/Admin/Leaves/PendingApprovals.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    Loader2,
    Search,
    Shield,
    UserCheck,
    UserX,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function PendingApprovals({
    auth,
    leaveRequests,
    filters,
    userRole,
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [managerComments, setManagerComments] = useState('');
    const [processing, setProcessing] = useState(false);
    const { flash } = usePage().props;

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('leaves.pending-approvals'),
            { search },
            {
                preserveState: true,
            },
        );
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('leaves.pending-approvals'));
    };

    const openApproveModal = (leave) => {
        setSelectedLeave(leave);
        setManagerComments('');
        setApproveModalOpen(true);
    };

    const openRejectModal = (leave) => {
        setSelectedLeave(leave);
        setManagerComments('');
        setRejectModalOpen(true);
    };

    const handleApprove = () => {
        if (!selectedLeave) return;

        setProcessing(true);
        router.post(
            route('leaves.manager-approve', selectedLeave.id),
            {
                manager_comments: managerComments || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setApproveModalOpen(false);
                    setSelectedLeave(null);
                    setManagerComments('');
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const handleReject = () => {
        if (!selectedLeave || !managerComments.trim()) return;

        setProcessing(true);
        router.post(
            route('leaves.manager-reject', selectedLeave.id),
            {
                manager_comments: managerComments,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectModalOpen(false);
                    setSelectedLeave(null);
                    setManagerComments('');
                    setProcessing(false);
                },
                onError: () => {
                    setProcessing(false);
                },
            },
        );
    };

    const getRoleLabel = (role) => {
        const labels = {
            'senior-engineer': 'Senior Engineer',
            'lead-engineer': 'Lead Engineer',
            'project-manager': 'Project Manager',
        };
        return labels[role] || role;
    };

    const hasFilters = search !== '';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-yellow-100 p-2">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Pending Leave Approvals
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Review and approve leave requests as{' '}
                                {getRoleLabel(userRole)}
                            </p>
                        </div>
                    </div>
                    <Badge className="border border-yellow-200 bg-yellow-100 px-4 py-2 text-lg text-yellow-700">
                        <Clock className="mr-2 h-5 w-5" />
                        {leaveRequests.total} Pending
                    </Badge>
                </div>
            }
        >
            <Head title="Pending Leave Approvals" />

            <div className="space-y-6">
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

                {/* Info Banner */}
                {leaveRequests.total > 0 && (
                    <Alert className="animate-fade-in border-blue-200 bg-blue-50">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <strong>Action Required:</strong> These leave
                            requests are waiting for your approval before being
                            forwarded to HR.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search Filter */}
                <Card className="animate-fade-in animation-delay-100 shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by employee name or leave type..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-11 pl-10"
                                />
                            </div>

                            <div className="flex items-end gap-3">
                                <Button
                                    type="submit"
                                    className="h-10 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Search
                                </Button>
                                {hasFilters && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        className="h-10"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Reset
                                    </Button>
                                )}
                            </div>

                            <div className="border-t pt-2 text-sm text-gray-600">
                                Showing{' '}
                                <span className="font-semibold text-gray-900">
                                    {leaveRequests.total}
                                </span>{' '}
                                pending{' '}
                                {leaveRequests.total === 1
                                    ? 'request'
                                    : 'requests'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Leave Requests Table */}
                <Card className="animate-fade-in animation-delay-200 shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-2 bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="h-12 font-semibold text-gray-700">
                                        Employee
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">
                                        Leave Type
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">
                                        Dates
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">
                                        Duration
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">
                                        Requested
                                    </TableHead>
                                    <TableHead className="h-12 text-center font-semibold text-gray-700">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveRequests.data.length > 0 ? (
                                    leaveRequests.data.map((leave) => (
                                        <TableRow
                                            key={leave.id}
                                            className="border-b bg-yellow-50/20 hover:bg-yellow-50/30"
                                        >
                                            <TableCell className="py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    {leave.user
                                                        ?.profile_picture ? (
                                                        <img
                                                            src={`/storage/${leave.user.profile_picture}`}
                                                            alt={
                                                                leave.user.name
                                                            }
                                                            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-600">
                                                            <span className="text-sm font-medium text-white">
                                                                {leave.user?.name
                                                                    ?.charAt(0)
                                                                    .toUpperCase() ||
                                                                    'U'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-gray-900">
                                                            {leave.user?.name ||
                                                                'Unknown'}
                                                        </p>
                                                        <p className="truncate text-sm text-gray-600">
                                                            {leave.user
                                                                ?.position ||
                                                                leave.user
                                                                    ?.email}
                                                        </p>
                                                        {leave.user?.roles &&
                                                            leave.user.roles
                                                                .length > 0 && (
                                                                <div className="mt-1 flex items-center gap-1">
                                                                    <Shield className="h-3 w-3 text-gray-400" />
                                                                    <p className="text-xs text-gray-500">
                                                                        {leave.user.roles
                                                                            .map(
                                                                                (
                                                                                    r,
                                                                                ) =>
                                                                                    r.name,
                                                                            )
                                                                            .join(
                                                                                ', ',
                                                                            )}
                                                                    </p>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 flex-shrink-0 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                leave.leave_type
                                                                    ?.color,
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                leave.leave_type
                                                                    ?.name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {
                                                                leave.leave_type
                                                                    ?.code
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="text-sm">
                                                    <p className="whitespace-nowrap font-medium text-gray-900">
                                                        {new Date(
                                                            leave.start_date,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            },
                                                        )}
                                                    </p>
                                                    {leave.start_date !==
                                                        leave.end_date && (
                                                        <p className="whitespace-nowrap text-gray-500">
                                                            to{' '}
                                                            {new Date(
                                                                leave.end_date,
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                },
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {leave.total_days}{' '}
                                                        {leave.total_days === 1
                                                            ? 'day'
                                                            : 'days'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="whitespace-nowrap text-sm text-gray-600">
                                                        {new Date(
                                                            leave.created_at,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'leaves.show',
                                                                leave.id,
                                                            )}
                                                        >
                                                            <Eye className="mr-1 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 text-white hover:bg-green-700"
                                                        onClick={() =>
                                                            openApproveModal(
                                                                leave,
                                                            )
                                                        }
                                                    >
                                                        <UserCheck className="mr-1 h-4 w-4" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() =>
                                                            openRejectModal(
                                                                leave,
                                                            )
                                                        }
                                                    >
                                                        <UserX className="mr-1 h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-64 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="mb-4 rounded-full bg-green-100 p-4">
                                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                                </div>
                                                <p className="mb-1 text-lg font-medium text-gray-900">
                                                    All caught up!
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {hasFilters
                                                        ? 'No pending requests match your search'
                                                        : 'There are no pending leave requests at the moment'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {leaveRequests.data.length > 0 && (
                        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                            <p className="text-sm text-gray-700">
                                Showing{' '}
                                <span className="font-medium">
                                    {leaveRequests.from}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {leaveRequests.to}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">
                                    {leaveRequests.total}
                                </span>{' '}
                                results
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(leaveRequests.prev_page_url)
                                    }
                                    disabled={!leaveRequests.prev_page_url}
                                    className="h-9"
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(leaveRequests.next_page_url)
                                    }
                                    disabled={!leaveRequests.next_page_url}
                                    className="h-9"
                                >
                                    Next
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Approve Modal */}
            <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-lg bg-green-100 p-2">
                                <UserCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <DialogTitle className="text-xl">
                                Approve Leave Request
                            </DialogTitle>
                        </div>
                        <DialogDescription className="pt-2 text-base">
                            Approve leave request for{' '}
                            <strong className="text-gray-900">
                                {selectedLeave?.user?.name}
                            </strong>
                            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="mb-2 flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                selectedLeave?.leave_type
                                                    ?.color,
                                        }}
                                    />
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedLeave?.leave_type?.name}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    <strong>{selectedLeave?.total_days}</strong>{' '}
                                    {selectedLeave?.total_days === 1
                                        ? 'day'
                                        : 'days'}{' '}
                                    •{' '}
                                    {new Date(
                                        selectedLeave?.start_date,
                                    ).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                    {selectedLeave?.start_date !==
                                        selectedLeave?.end_date &&
                                        ` - ${new Date(selectedLeave?.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="approve_comments">
                                Comments (Optional)
                            </Label>
                            <Textarea
                                id="approve_comments"
                                value={managerComments}
                                onChange={(e) =>
                                    setManagerComments(e.target.value)
                                }
                                placeholder="Add any comments for the employee..."
                                rows={3}
                            />
                        </div>

                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                            <p className="text-sm text-green-800">
                                <strong>This will:</strong>
                                <br />• Approve as manager
                                <br />• Forward to HR for final approval
                                <br />• Send notification to employee
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setApproveModalOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={processing}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Approve Request
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="rounded-lg bg-red-100 p-2">
                                <UserX className="h-6 w-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl">
                                Reject Leave Request
                            </DialogTitle>
                        </div>
                        <DialogDescription className="pt-2 text-base">
                            Reject leave request for{' '}
                            <strong className="text-gray-900">
                                {selectedLeave?.user?.name}
                            </strong>
                            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="mb-2 flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                selectedLeave?.leave_type
                                                    ?.color,
                                        }}
                                    />
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedLeave?.leave_type?.name}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    <strong>{selectedLeave?.total_days}</strong>{' '}
                                    {selectedLeave?.total_days === 1
                                        ? 'day'
                                        : 'days'}{' '}
                                    •{' '}
                                    {new Date(
                                        selectedLeave?.start_date,
                                    ).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                    {selectedLeave?.start_date !==
                                        selectedLeave?.end_date &&
                                        ` - ${new Date(selectedLeave?.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reject_comments">
                                Rejection Reason *
                            </Label>
                            <Textarea
                                id="reject_comments"
                                value={managerComments}
                                onChange={(e) =>
                                    setManagerComments(e.target.value)
                                }
                                placeholder="Please provide a reason for rejection..."
                                rows={3}
                                required
                            />
                        </div>

                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="text-sm text-red-800">
                                <strong>This will:</strong>
                                <br />• Reject the leave request
                                <br />• Employee can appeal this decision
                                <br />• Send email notification
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setRejectModalOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={processing || !managerComments.trim()}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Reject Request
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
