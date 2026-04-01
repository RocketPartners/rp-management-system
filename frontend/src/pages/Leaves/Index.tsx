/**
 * Leave Requests List Page (Admin)
 * Ported from monolith's Admin/Leaves/Index.jsx
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    MoreVertical,
    Search,
    X,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { apiGet } from '@/lib/spring-boot-api';

interface LeaveApplicationResponse {
    id: number;
    userId: number;
    userName: string;
    leaveTypeId: number;
    leaveTypeName: string;
    leaveTypeCode: string;
    leaveTypeColor: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    duration: string;
    reason: string;
    status: string;
    statusLabel: string;
    assignedManagerName: string;
    createdAt: string;
}

interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Clock }> = {
    pending_manager: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    pending_hr: { color: 'bg-orange-100 text-orange-700', icon: Clock },
    approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected_by_manager: { color: 'bg-red-100 text-red-700', icon: XCircle },
    rejected_by_hr: { color: 'bg-red-100 text-red-700', icon: XCircle },
    cancelled: { color: 'bg-gray-100 text-gray-600', icon: XCircle },
    pending_cancellation: { color: 'bg-purple-100 text-purple-700', icon: AlertCircle },
};

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending_manager', label: 'Pending Manager' },
    { value: 'pending_hr', label: 'Pending HR' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected_by_manager', label: 'Rejected (Manager)' },
    { value: 'rejected_by_hr', label: 'Rejected (HR)' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'pending_cancellation', label: 'Pending Cancellation' },
];

export default function LeaveRequestList() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get('page') || '0');
    const size = 20;
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';
    const [searchInput, setSearchInput] = useState(search);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['leave-applications', page, size, search, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('size', String(size));
            if (search) params.set('search', search);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            return apiGet<PagedResponse<LeaveApplicationResponse>>(`/leave-applications?${params.toString()}`);
        },
    });

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

    const handleStatusChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === 'all') params.delete('status');
        else params.set('status', value);
        params.delete('page');
        setSearchParams(params);
    };

    const goToPage = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(newPage));
        setSearchParams(params);
    };

    const leaves = data?.content || [];
    const totalPages = data?.totalPages || 0;
    const totalElements = data?.totalElements || 0;

    // Stats from current data
    const pendingHr = leaves.filter((l) => l.status === 'pending_hr').length;
    const approved = leaves.filter((l) => l.status === 'approved').length;

    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <>
            <Helmet><title>Leave Requests | HRIS</title></Helmet>

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                        <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
                        <p className="text-sm text-gray-500">Manage all employee leave applications</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <Card><CardContent className="flex items-center gap-3 pt-6"><div className="rounded-lg bg-blue-100 p-2"><Calendar className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{totalElements}</p></div></CardContent></Card>
                    <Card><CardContent className="flex items-center gap-3 pt-6"><div className="rounded-lg bg-orange-100 p-2"><Clock className="h-5 w-5 text-orange-600" /></div><div><p className="text-sm text-gray-500">Pending HR</p><p className="text-2xl font-bold">{pendingHr}</p></div></CardContent></Card>
                    <Card><CardContent className="flex items-center gap-3 pt-6"><div className="rounded-lg bg-green-100 p-2"><CheckCircle2 className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-gray-500">Approved</p><p className="text-2xl font-bold">{approved}</p></div></CardContent></Card>
                    <Card><CardContent className="flex items-center gap-3 pt-6"><div className="rounded-lg bg-gray-100 p-2"><XCircle className="h-5 w-5 text-gray-600" /></div><div><p className="text-sm text-gray-500">This Page</p><p className="text-2xl font-bold">{leaves.length}</p></div></CardContent></Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input placeholder="Search by employee name..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="pl-9" />
                        {searchInput && <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-gray-400" /></button>}
                    </div>
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                        </SelectContent>
                    </Select>
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
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => (<TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>))}</TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow><TableCell colSpan={7}><div className="flex flex-col items-center justify-center py-12"><Calendar className="mb-3 h-12 w-12 text-gray-300" /><p className="text-lg font-medium">Failed to load</p><Button variant="outline" className="mt-4" onClick={() => refetch()}>Try again</Button></div></TableCell></TableRow>
                                ) : leaves.length === 0 ? (
                                    <TableRow><TableCell colSpan={7}><div className="flex flex-col items-center justify-center py-12"><Calendar className="mb-3 h-12 w-12 text-gray-300" /><p className="text-lg font-medium">No leave requests found</p><p className="text-sm text-gray-500">{search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'No requests yet.'}</p></div></TableCell></TableRow>
                                ) : (
                                    leaves.map((leave) => {
                                        const statusCfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG.cancelled;
                                        return (
                                            <TableRow key={leave.id} className="hover:bg-gray-50">
                                                <TableCell><span className="font-medium text-gray-900">{leave.userName}</span></TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: leave.leaveTypeColor || '#3b82f6' }} />
                                                        <span>{leave.leaveTypeName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-600">{formatDate(leave.startDate)} — {formatDate(leave.endDate)}</span>
                                                </TableCell>
                                                <TableCell className="text-center"><Badge variant="secondary">{leave.totalDays}d</Badge></TableCell>
                                                <TableCell><Badge className={statusCfg.color}>{leave.statusLabel || leave.status.replace(/_/g, ' ')}</Badge></TableCell>
                                                <TableCell><span className="text-sm text-gray-600">{leave.assignedManagerName || '—'}</span></TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild><Link to={`/leaves/${leave.id}`}><Eye className="mr-2 h-4 w-4" />View Details</Link></DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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
                        <p className="text-sm text-gray-600">Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of {totalElements}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => goToPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
