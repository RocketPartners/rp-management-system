// resources/js/Pages/Admin/Leaves/PendingApprovals.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import {
    Calendar,
    Search,
    Eye,
    CheckCircle2,
    Clock,
    User,
    ChevronLeft,
    ChevronRight,
    X,
    UserCheck,
    UserX,
    AlertCircle,
    Shield,
    Loader2,
} from 'lucide-react';

export default function PendingApprovals({ auth, leaveRequests, filters, userRole }) {
    const [search, setSearch] = useState(filters.search || '');
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [managerComments, setManagerComments] = useState('');
    const [processing, setProcessing] = useState(false);
    const { flash } = usePage().props;

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('leaves.pending-approvals'), { search }, {
            preserveState: true,
        });
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
        router.post(route('leaves.manager-approve', selectedLeave.id), {
            manager_comments: managerComments || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setApproveModalOpen(false);
                setSelectedLeave(null);
                setManagerComments('');
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
            }
        });
    };

    const handleReject = () => {
        if (!selectedLeave || !managerComments.trim()) return;
        
        setProcessing(true);
        router.post(route('leaves.manager-reject', selectedLeave.id), {
            manager_comments: managerComments,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectModalOpen(false);
                setSelectedLeave(null);
                setManagerComments('');
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
            }
        });
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
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Pending Leave Approvals</h2>
                            <p className="text-gray-600 mt-1">
                                Review and approve leave requests as {getRoleLabel(userRole)}
                            </p>
                        </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 border text-lg px-4 py-2">
                        <Clock className="h-5 w-5 mr-2" />
                        {leaveRequests.total} Pending
                    </Badge>
                </div>
            }
        >
            <Head title="Pending Leave Approvals" />

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="bg-green-50 border-green-200 animate-fade-in">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 font-medium">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert className="bg-red-50 border-red-200 animate-fade-in">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 font-medium">
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Info Banner */}
                {leaveRequests.total > 0 && (
                    <Alert className="bg-blue-50 border-blue-200 animate-fade-in">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <strong>Action Required:</strong> These leave requests are waiting for your approval before being forwarded to HR.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search Filter */}
                <Card className="shadow-sm animate-fade-in animation-delay-100">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by employee name or leave type..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-11"
                                />
                            </div>

                            <div className="flex items-end gap-3">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-10">
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                                {hasFilters && (
                                    <Button type="button" variant="outline" onClick={handleReset} className="h-10">
                                        <X className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                )}
                            </div>

                            <div className="text-sm text-gray-600 pt-2 border-t">
                                Showing <span className="font-semibold text-gray-900">{leaveRequests.total}</span> pending {leaveRequests.total === 1 ? 'request' : 'requests'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Leave Requests Table */}
                <Card className="shadow-sm animate-fade-in animation-delay-200">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b-2">
                                    <TableHead className="font-semibold text-gray-700 h-12">Employee</TableHead>
                                    <TableHead className="font-semibold text-gray-700 h-12">Leave Type</TableHead>
                                    <TableHead className="font-semibold text-gray-700 h-12">Dates</TableHead>
                                    <TableHead className="font-semibold text-gray-700 h-12">Duration</TableHead>
                                    <TableHead className="font-semibold text-gray-700 h-12">Requested</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-700 h-12">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveRequests.data.length > 0 ? (
                                    leaveRequests.data.map((leave) => (
                                        <TableRow key={leave.id} className="hover:bg-yellow-50/30 border-b bg-yellow-50/20">
                                            <TableCell className="py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    {leave.user?.profile_picture ? (
                                                        <img
                                                            src={`/storage/${leave.user.profile_picture}`}
                                                            alt={leave.user.name}
                                                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-600 rounded-full flex-shrink-0">
                                                            <span className="text-sm font-medium text-white">
                                                                {leave.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">{leave.user?.name || 'Unknown'}</p>
                                                        <p className="text-sm text-gray-600 truncate">{leave.user?.position || leave.user?.email}</p>
                                                        {leave.user?.roles && leave.user.roles.length > 0 && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Shield className="h-3 w-3 text-gray-400" />
                                                                <p className="text-xs text-gray-500">
                                                                    {leave.user.roles.map(r => r.name).join(', ')}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: leave.leave_type?.color }}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{leave.leave_type?.name}</p>
                                                        <p className="text-xs text-gray-500">{leave.leave_type?.code}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="text-sm">
                                                    <p className="text-gray-900 font-medium whitespace-nowrap">
                                                        {new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    {leave.start_date !== leave.end_date && (
                                                        <p className="text-gray-500 whitespace-nowrap">
                                                            to {new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600 whitespace-nowrap">
                                                        {new Date(leave.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
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
                                                        <Link href={route('leaves.show', leave.id)}>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => openApproveModal(leave)}
                                                    >
                                                        <UserCheck className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                                        onClick={() => openRejectModal(leave)}
                                                    >
                                                        <UserX className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="p-4 bg-green-100 rounded-full mb-4">
                                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                                </div>
                                                <p className="text-gray-900 font-medium text-lg mb-1">All caught up!</p>
                                                <p className="text-gray-500 text-sm">
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
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{leaveRequests.from}</span> to{' '}
                                <span className="font-medium">{leaveRequests.to}</span> of{' '}
                                <span className="font-medium">{leaveRequests.total}</span> results
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(leaveRequests.prev_page_url)}
                                    disabled={!leaveRequests.prev_page_url}
                                    className="h-9"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(leaveRequests.next_page_url)}
                                    disabled={!leaveRequests.next_page_url}
                                    className="h-9"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
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
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <UserCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <DialogTitle className="text-xl">Approve Leave Request</DialogTitle>
                        </div>
                        <DialogDescription className="text-base pt-2">
                            Approve leave request for <strong className="text-gray-900">{selectedLeave?.user?.name}</strong>
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: selectedLeave?.leave_type?.color }}
                                    />
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedLeave?.leave_type?.name}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    <strong>{selectedLeave?.total_days}</strong> {selectedLeave?.total_days === 1 ? 'day' : 'days'} •{' '}
                                    {new Date(selectedLeave?.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                                    {selectedLeave?.start_date !== selectedLeave?.end_date && 
                                        ` - ${new Date(selectedLeave?.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                    }
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="approve_comments">Comments (Optional)</Label>
                            <Textarea
                                id="approve_comments"
                                value={managerComments}
                                onChange={(e) => setManagerComments(e.target.value)}
                                placeholder="Add any comments for the employee..."
                                rows={3}
                            />
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
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
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <UserCheck className="h-4 w-4 mr-2" />
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
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <UserX className="h-6 w-6 text-red-600" />
                            </div>
                            <DialogTitle className="text-xl">Reject Leave Request</DialogTitle>
                        </div>
                        <DialogDescription className="text-base pt-2">
                            Reject leave request for <strong className="text-gray-900">{selectedLeave?.user?.name}</strong>
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: selectedLeave?.leave_type?.color }}
                                    />
                                    <p className="text-sm font-medium text-gray-900">
                                        {selectedLeave?.leave_type?.name}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    <strong>{selectedLeave?.total_days}</strong> {selectedLeave?.total_days === 1 ? 'day' : 'days'} •{' '}
                                    {new Date(selectedLeave?.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    {selectedLeave?.start_date !== selectedLeave?.end_date && 
                                        ` - ${new Date(selectedLeave?.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                    }
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reject_comments">Rejection Reason *</Label>
                            <Textarea
                                id="reject_comments"
                                value={managerComments}
                                onChange={(e) => setManagerComments(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                rows={3}
                                required
                            />
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
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
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Rejecting...
                                </>
                            ) : (
                                <>
                                    <UserX className="h-4 w-4 mr-2" />
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