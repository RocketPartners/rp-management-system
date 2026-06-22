import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    AlertCircle,
    Briefcase,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Mail,
    Phone,
    Search,
    Shield,
    UserCheck,
    UserX,
    X,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { apiGet, apiPost } from '@/lib/spring-boot-api';
import type { UserResponse, PagedResponse } from '@/types';

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PendingApprovals() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = 15;

    const [searchInput, setSearchInput] = useState(search);
    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (searchInput) params.set('search', searchInput);
            else params.delete('search');
            params.delete('page');
            setSearchParams(params, { replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data, isLoading } = useQuery({
        queryKey: ['users', 'pending', { search, page, size }],
        queryFn: () => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            params.set('page', String(page));
            params.set('size', String(size));
            return apiGet<PagedResponse<UserResponse>>(
                `/users/pending-approvals?${params}`,
            );
        },
    });

    const approveMutation = useMutation({
        mutationFn: (id: number) => apiPost(`/users/${id}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User approved');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const rejectMutation = useMutation({
        mutationFn: (id: number) => apiPost(`/users/${id}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User rejected');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const bulkApproveMutation = useMutation({
        mutationFn: (ids: number[]) =>
            apiPost('/users/bulk-approve', { userIds: ids }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setSelected([]);
            toast.success('Users approved');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const bulkRejectMutation = useMutation({
        mutationFn: (ids: number[]) =>
            apiPost('/users/bulk-reject', { userIds: ids }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setSelected([]);
            toast.success('Users rejected');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const allIds = data?.content.map((u) => u.id) ?? [];
    const allSelected =
        allIds.length > 0 && allIds.every((id) => selected.includes(id));

    function toggleAll() {
        if (allSelected) setSelected([]);
        else setSelected(allIds);
    }

    function toggleOne(id: number) {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    }

    function setPage(newPage: number) {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(newPage));
        setSearchParams(params, { replace: true });
    }

    return (
        <>
            <Helmet>
                <title>Pending Approvals | HRIS</title>
            </Helmet>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-yellow-100 p-2">
                            <UserCheck className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Pending User Approvals
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Review and approve new user registrations
                            </p>
                        </div>
                    </div>
                    <Badge className="border border-yellow-200 bg-yellow-100 px-4 py-2 text-lg text-yellow-700">
                        <Clock className="mr-2 h-5 w-5" />
                        {data?.totalElements ?? 0} Pending
                    </Badge>
                </div>

                {/* Info Banner */}
                {data && data.totalElements > 0 && (
                    <Alert className="border-blue-200 bg-blue-50">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <strong>Quick Action Required:</strong> These users have
                            registered and are waiting for approval to access the system.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search */}
                <Card className="shadow-sm">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="h-11 pl-10"
                                />
                                {searchInput && (
                                    <button
                                        onClick={() => setSearchInput('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="h-4 w-4 text-gray-400" />
                                    </button>
                                )}
                            </div>
                            <div className="border-t pt-2 text-sm text-gray-600">
                                Showing{' '}
                                <span className="font-semibold text-gray-900">
                                    {data?.totalElements ?? 0}
                                </span>{' '}
                                pending {(data?.totalElements ?? 0) === 1 ? 'user' : 'users'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="shadow-sm">
                    {/* Bulk Actions */}
                    {selected.length > 0 && (
                        <div className="flex items-center justify-end gap-2 border-b px-6 py-3">
                            <span className="mr-auto text-sm font-medium text-gray-700">
                                {selected.length} selected
                            </span>
                            <Button
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() => bulkApproveMutation.mutate(selected)}
                                disabled={bulkApproveMutation.isPending}
                            >
                                <UserCheck className="mr-1 h-4 w-4" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => bulkRejectMutation.mutate(selected)}
                                disabled={bulkRejectMutation.isPending}
                            >
                                <UserX className="mr-1 h-4 w-4" />
                                Reject
                            </Button>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-2 bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="h-12 w-12">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={toggleAll}
                                        />
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">
                                        User
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">
                                        Contact
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">
                                        Roles
                                    </TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">
                                        Registered
                                    </TableHead>
                                    <TableHead className="h-12 text-center font-semibold text-gray-700">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading &&
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton className="h-5 w-full" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}

                                {!isLoading && data?.content.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="mb-4 rounded-full bg-green-100 p-4">
                                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                                </div>
                                                <p className="mb-1 text-lg font-medium text-gray-900">
                                                    All caught up!
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {search
                                                        ? 'No pending users match your search'
                                                        : 'There are no pending user approvals at the moment'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {data?.content.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className="border-b bg-yellow-50/20 hover:bg-yellow-50/30"
                                    >
                                        <TableCell className="py-4 align-middle">
                                            <Checkbox
                                                checked={selected.includes(user.id)}
                                                onCheckedChange={() => toggleOne(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="py-4 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-600">
                                                    <span className="text-sm font-medium text-white">
                                                        {user.fullName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <Link
                                                        to={`/users/${user.id}`}
                                                        className="truncate font-semibold text-gray-900 hover:underline"
                                                    >
                                                        {user.fullName}
                                                    </Link>
                                                    {user.positionTitle && (
                                                        <p className="truncate text-sm text-gray-600">
                                                            {user.positionTitle}
                                                        </p>
                                                    )}
                                                    {user.departmentName && (
                                                        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                                                            <Briefcase className="h-3 w-3" />
                                                            {user.departmentName}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-middle">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                                                    <span className="truncate text-sm text-gray-700">
                                                        {user.email}
                                                    </span>
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                                                        <span className="text-sm text-gray-600">
                                                            {user.phone}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-middle">
                                            <div className="flex flex-wrap gap-1">
                                                {(user.roles ?? []).length > 0 ? (
                                                    (user.roles ?? []).map((role) => (
                                                        <Badge
                                                            key={role}
                                                            className="whitespace-nowrap border border-purple-200 bg-purple-100 text-xs text-purple-700"
                                                        >
                                                            <Shield className="mr-1 h-3 w-3" />
                                                            {role}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        No roles assigned
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-middle">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(user.createdAt)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-middle">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 text-white hover:bg-green-700"
                                                    onClick={() => approveMutation.mutate(user.id)}
                                                    disabled={approveMutation.isPending}
                                                >
                                                    <UserCheck className="mr-1 h-4 w-4" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => rejectMutation.mutate(user.id)}
                                                    disabled={rejectMutation.isPending}
                                                >
                                                    <UserX className="mr-1 h-4 w-4" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                            <p className="text-sm text-gray-700">
                                Showing{' '}
                                <span className="font-medium">{page * size + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min((page + 1) * size, data.totalElements)}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">{data.totalElements}</span>{' '}
                                results
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                    disabled={data.first}
                                    onClick={() => setPage(page - 1)}
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9"
                                    disabled={data.last}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}
