/**
 * Leave Balance Management Page
 * Ported from monolith's Admin/Leaves/Balances.jsx
 * View employee leave balances, initialize, and adjust
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    CalendarClock,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus,
    Search,
    TrendingUp,
    Users,
    Wallet,
    X,
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
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import { apiGet, apiPost } from '@/lib/spring-boot-api';

interface LeaveBalanceResponse {
    id: number;
    userId: number;
    employeeName: string;
    leaveTypeId: number;
    leaveTypeName: string;
    year: number;
    totalDays: number;
    usedDays: number;
    pendingDays: number;
    remainingDays: number;
    carriedOverDays: number;
    adjustmentDays: number;
}

interface EmployeeBalanceGroup {
    userId: number;
    employeeName: string;
    balances: LeaveBalanceResponse[];
}

interface UserOption {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
}

interface PagedUsers {
    content: UserOption[];
}

const currentYear = new Date().getFullYear();

export default function LeaveBalances() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { can } = usePermission();

    const search = searchParams.get('search') || '';
    const yearFilter = searchParams.get('year') || String(currentYear);
    const [searchInput, setSearchInput] = useState(search);

    const [adjustDialog, setAdjustDialog] = useState<{
        open: boolean;
        balance: LeaveBalanceResponse | null;
    }>({ open: false, balance: null });
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustReason, setAdjustReason] = useState('');

    const [initDialog, setInitDialog] = useState(false);
    const [initUserId, setInitUserId] = useState('');

    // Fetch all users' balances
    const { data: balances, isLoading, isError, refetch } = useQuery({
        queryKey: ['leave-balances', search, yearFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (yearFilter) params.set('year', yearFilter);
            if (search) params.set('search', search);
            const res = await apiGet<LeaveBalanceResponse[]>(
                `/leave-applications/balances/all?${params.toString()}`,
            );
            return Array.isArray(res) ? res : [];
        },
    });

    // Fetch users for init dropdown
    const { data: users } = useQuery({
        queryKey: ['users-list'],
        queryFn: () => apiGet<PagedUsers>('/users?size=200'),
        select: (data) => data?.content || [],
    });

    // Adjust balance mutation
    const adjustMutation = useMutation({
        mutationFn: ({ balanceId, adjustmentDays, reason }: { balanceId: number; adjustmentDays: number; reason: string }) =>
            apiPost(
                `/leave-applications/balances/${balanceId}/adjust?adjustmentDays=${encodeURIComponent(String(adjustmentDays))}&reason=${encodeURIComponent(reason)}`,
            ),
        onSuccess: () => {
            toast.success('Balance adjusted successfully');
            queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
            setAdjustDialog({ open: false, balance: null });
            setAdjustAmount('');
            setAdjustReason('');
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to adjust balance'),
    });

    // Initialize balances mutation
    const initMutation = useMutation({
        mutationFn: (userId: number) =>
            apiPost(`/leave-applications/balances/initialize/${userId}`),
        onSuccess: () => {
            toast.success('Balances initialized successfully');
            queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
            setInitDialog(false);
            setInitUserId('');
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to initialize balances'),
    });

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        if (searchInput) params.set('search', searchInput);
        else params.delete('search');
        setSearchParams(params);
    };

    const clearSearch = () => {
        setSearchInput('');
        const params = new URLSearchParams(searchParams);
        params.delete('search');
        setSearchParams(params);
    };

    const handleYearChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('year', value);
        setSearchParams(params);
    };

    // Group flat balance rows by employee for per-employee rendering
    const employeeGroups = (balances || []).reduce<EmployeeBalanceGroup[]>((acc, b) => {
        const existing = acc.find((g) => g.userId === b.userId);
        if (existing) {
            existing.balances.push(b);
        } else {
            acc.push({ userId: b.userId, employeeName: b.employeeName, balances: [b] });
        }
        return acc;
    }, []);

    // Stats
    const totalUsers = employeeGroups.length;
    const totalBalances = (balances || []).length;
    const totalCarriedOver = (balances || []).reduce((sum, b) => sum + (b.carriedOverDays || 0), 0);
    const lowBalanceCount = (balances || []).filter((b) => b.remainingDays <= 2 && b.remainingDays >= 0).length;

    return (
        <>
            <Helmet><title>Leave Balances | HRIS</title></Helmet>

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-100 p-2">
                            <Wallet className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Leave Balances</h1>
                            <p className="text-sm text-gray-500">Manage employee leave balances</p>
                        </div>
                    </div>
                    {can('LEAVE_APPLICATION_UPDATE') && (
                        <Button onClick={() => setInitDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Initialize Balances
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active Users</p>
                                <p className="text-2xl font-bold">{totalUsers}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="rounded-lg bg-green-100 p-2">
                                <CalendarClock className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Balances</p>
                                <p className="text-2xl font-bold">{totalBalances}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="rounded-lg bg-purple-100 p-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Carried Over Days</p>
                                <p className="text-2xl font-bold">{totalCarriedOver}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="rounded-lg bg-orange-100 p-2">
                                <Wallet className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Low Balance</p>
                                <p className="text-2xl font-bold">{lowBalanceCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
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
                    <Select value={yearFilter} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-full sm:w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
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
                                    <TableHead className="text-center">Total</TableHead>
                                    <TableHead className="text-center">Used</TableHead>
                                    <TableHead className="text-center">Pending</TableHead>
                                    <TableHead className="text-center">Remaining</TableHead>
                                    <TableHead className="text-center">Carried Over</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 8 }).map((_, j) => (
                                                <TableCell key={j}><Skeleton className="h-5 w-16" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <Wallet className="mb-3 h-12 w-12 text-gray-300" />
                                                <p className="text-lg font-medium">Failed to load balances</p>
                                                <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try again</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : employeeGroups.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <Wallet className="mb-3 h-12 w-12 text-gray-300" />
                                                <p className="text-lg font-medium">No balances found</p>
                                                <p className="text-sm text-gray-500">Initialize balances for employees to get started.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    employeeGroups.map((group) =>
                                        group.balances.map((balance, index) => (
                                            <TableRow key={balance.id}>
                                                {index === 0 && (
                                                    <TableCell rowSpan={group.balances.length} className="align-top">
                                                        <span className="font-medium text-gray-900">{group.employeeName}</span>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <Badge variant="secondary">{balance.leaveTypeName}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center font-medium">{balance.totalDays}</TableCell>
                                                <TableCell className="text-center text-red-600">{balance.usedDays}</TableCell>
                                                <TableCell className="text-center text-yellow-600">{balance.pendingDays}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={balance.remainingDays <= 2 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                                                        {balance.remainingDays}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center text-purple-600">{balance.carriedOverDays}</TableCell>
                                                <TableCell>
                                                    {can('LEAVE_APPLICATION_UPDATE') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setAdjustDialog({ open: true, balance });
                                                                setAdjustAmount('');
                                                                setAdjustReason('');
                                                            }}
                                                        >
                                                            Adjust
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )),
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Adjust Balance Dialog */}
            <Dialog open={adjustDialog.open} onOpenChange={(open) => !open && setAdjustDialog({ open: false, balance: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust Leave Balance</DialogTitle>
                        <DialogDescription>
                            Adjust balance for {adjustDialog.balance?.employeeName} — {adjustDialog.balance?.leaveTypeName}
                            <br />
                            Current remaining: <strong>{adjustDialog.balance?.remainingDays} days</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Adjustment (+ to add, - to deduct) *</Label>
                            <Input
                                type="number"
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                placeholder="e.g., 5 or -2"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Reason *</Label>
                            <Textarea
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                                placeholder="Reason for adjustment..."
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAdjustDialog({ open: false, balance: null })}>Cancel</Button>
                        <Button
                            disabled={!adjustAmount || !adjustReason.trim() || adjustMutation.isPending}
                            onClick={() => {
                                if (adjustDialog.balance) {
                                    adjustMutation.mutate({
                                        balanceId: adjustDialog.balance.id,
                                        adjustmentDays: Number(adjustAmount),
                                        reason: adjustReason,
                                    });
                                }
                            }}
                        >
                            {adjustMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Apply Adjustment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Initialize Balances Dialog */}
            <Dialog open={initDialog} onOpenChange={setInitDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Initialize Leave Balances</DialogTitle>
                        <DialogDescription>
                            Create default leave balances for an employee based on active leave types.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Employee *</Label>
                            <Select value={initUserId} onValueChange={setInitUserId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {(users || []).map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.name || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()} ({u.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInitDialog(false)}>Cancel</Button>
                        <Button
                            disabled={!initUserId || initMutation.isPending}
                            onClick={() => initMutation.mutate(Number(initUserId))}
                        >
                            {initMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Initializing...</> : 'Initialize'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
