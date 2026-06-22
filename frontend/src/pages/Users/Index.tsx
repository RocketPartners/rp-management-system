import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    Eye,
    MoreHorizontal,
    Plus,
    Search,
    ShieldOff,
    Trash2,
    UserCheck,
    UserX,
    Users,
    X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { UserStatusBadge } from '@/components/users/UserStatusBadge';
import { usePermission } from '@/hooks/usePermission';
import { apiGet, apiPost, apiDelete } from '@/lib/spring-boot-api';
import type { UserResponse, PagedResponse } from '@/types';

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

const avatarColors = [
    'bg-blue-600',
    'bg-purple-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-cyan-600',
    'bg-indigo-600',
    'bg-teal-600',
];

function getAvatarColor(id: number) {
    return avatarColors[id % avatarColors.length];
}

export default function UserList() {
    const { can } = usePermission();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = 15;

    const [searchInput, setSearchInput] = useState(search);
    const [deleteUser, setDeleteUser] = useState<UserResponse | null>(null);

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

    const { data, isLoading, isError } = useQuery({
        queryKey: ['users', { search, status, page, size }],
        queryFn: () => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (status) params.set('status', status);
            params.set('page', String(page));
            params.set('size', String(size));
            return apiGet<PagedResponse<UserResponse>>(
                `/users/search?${params}`,
            );
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiDelete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted');
        },
        onError: (err: Error) => toast.error(err.message),
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

    const suspendMutation = useMutation({
        mutationFn: (id: number) => apiPost(`/users/${id}/suspend`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User suspended');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    function setPage(newPage: number) {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(newPage));
        setSearchParams(params, { replace: true });
    }

    function setStatus(newStatus: string) {
        const params = new URLSearchParams(searchParams);
        if (newStatus && newStatus !== 'all') params.set('status', newStatus);
        else params.delete('status');
        params.delete('page');
        setSearchParams(params, { replace: true });
    }

    const activeCount = data?.content.filter((u) => u.accountStatus === 'ACTIVE').length ?? 0;
    const pendingCount = data?.content.filter((u) => u.accountStatus === 'PENDING').length ?? 0;
    const inactiveCount = data?.content.filter((u) => u.accountStatus === 'SUSPENDED' || u.accountStatus === 'REJECTED').length ?? 0;

    return (
        <>
            <Helmet>
                <title>Users | HRIS</title>
            </Helmet>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            User Management
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Manage employee accounts, roles, and permissions.
                        </p>
                    </div>
                    {can('users.create') && (
                        <Button
                            asChild
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Link to="/users/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Employee
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Stats */}
                {data && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card className="border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                                        <p className="mt-2 text-3xl font-bold text-gray-900">
                                            {data.totalElements}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-blue-100 p-3">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-green-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active</p>
                                        <p className="mt-2 text-3xl font-bold text-green-600">
                                            {activeCount}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-green-100 p-3">
                                        <UserCheck className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-yellow-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending</p>
                                        <p className="mt-2 text-3xl font-bold text-yellow-600">
                                            {pendingCount}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-yellow-100 p-3">
                                        <Clock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-red-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Inactive</p>
                                        <p className="mt-2 text-3xl font-bold text-red-600">
                                            {inactiveCount}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-red-100 p-3">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search by name, email, or employee ID..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="h-11 pl-10"
                        />
                        {searchInput && (
                            <button
                                onClick={() => setSearchInput('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm opacity-70 hover:opacity-100"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        )}
                    </div>
                    <Select value={status || 'all'} onValueChange={setStatus}>
                        <SelectTrigger className="h-11 w-full sm:w-[180px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <Card className="shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-2 bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="h-12 pl-6 font-semibold text-gray-700">Employee</TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">Department</TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">Position</TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">Status</TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">Role</TableHead>
                                    <TableHead className="h-12 font-semibold text-gray-700">Joined</TableHead>
                                    <TableHead className="h-12 w-10" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading &&
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="pl-6">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                                                    <div className="space-y-1.5">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-44" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {Array.from({ length: 5 }).map((_, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton className="h-4 w-20" />
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <Skeleton className="h-8 w-8" />
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                {isError && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="mb-4 rounded-full bg-gray-100 p-4">
                                                    <UserX className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="mb-1 text-lg font-medium text-gray-900">
                                                    Failed to load users
                                                </p>
                                                <p className="mb-4 text-sm text-gray-500">
                                                    Something went wrong. Please try again.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
                                                >
                                                    Try again
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!isLoading && !isError && data?.content.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="mb-4 rounded-full bg-gray-100 p-4">
                                                    <Users className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="mb-1 text-lg font-medium text-gray-900">
                                                    No users found
                                                </p>
                                                <p className="mb-4 text-sm text-gray-500">
                                                    {search || status
                                                        ? 'Try adjusting your filters'
                                                        : 'Add your first user to get started'}
                                                </p>
                                                {(search || status) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSearchInput('');
                                                            setSearchParams({}, { replace: true });
                                                        }}
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Clear filters
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {data?.content.map((user) => (
                                    <TableRow key={user.id} className="border-b hover:bg-gray-50">
                                        <TableCell className="py-4 pl-6 align-middle">
                                            <Link
                                                to={`/users/${user.id}`}
                                                className="flex items-center gap-3"
                                            >
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getAvatarColor(user.id)}`}
                                                >
                                                    <span className="text-sm font-medium text-white">
                                                        {getInitials(user.fullName)}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-gray-900">
                                                        {user.fullName}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-500">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="align-middle text-sm text-gray-600">
                                            {user.departmentName || <span className="text-gray-400">--</span>}
                                        </TableCell>
                                        <TableCell className="align-middle text-sm text-gray-600">
                                            {user.positionTitle || <span className="text-gray-400">--</span>}
                                        </TableCell>
                                        <TableCell className="align-middle">
                                            <UserStatusBadge status={user.accountStatus} />
                                        </TableCell>
                                        <TableCell className="align-middle">
                                            <div className="flex flex-wrap gap-1">
                                                {(user.roles ?? []).map((role) => (
                                                    <Badge
                                                        key={role}
                                                        variant="outline"
                                                        className="border-gray-200 bg-gray-50 text-xs font-medium text-gray-700"
                                                    >
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-middle whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(user.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-center align-middle">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/users/${user.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {can('users.edit') && (
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/users/${user.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit User
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {user.accountStatus === 'PENDING' && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => approveMutation.mutate(user.id)}
                                                                className="cursor-pointer text-green-600 focus:bg-green-50 focus:text-green-600"
                                                            >
                                                                <UserCheck className="mr-2 h-4 w-4" />
                                                                Approve User
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => rejectMutation.mutate(user.id)}
                                                                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                                                            >
                                                                <UserX className="mr-2 h-4 w-4" />
                                                                Reject User
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {user.accountStatus === 'ACTIVE' && (
                                                        <DropdownMenuItem
                                                            onClick={() => suspendMutation.mutate(user.id)}
                                                            className="cursor-pointer text-orange-600 focus:bg-orange-50 focus:text-orange-600"
                                                        >
                                                            <ShieldOff className="mr-2 h-4 w-4" />
                                                            Suspend User
                                                        </DropdownMenuItem>
                                                    )}
                                                    {can('users.delete') && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => setDeleteUser(user)}
                                                                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete User
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing{' '}
                            <span className="font-semibold text-gray-900">
                                {page * size + 1}
                            </span>
                            –
                            <span className="font-semibold text-gray-900">
                                {Math.min((page + 1) * size, data.totalElements)}
                            </span>
                            {' '}of{' '}
                            <span className="font-semibold text-gray-900">
                                {data.totalElements}
                            </span>
                            {' '}users
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={data.first}
                                onClick={() => setPage(page - 1)}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" />
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600">
                                Page {page + 1} of {data.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={data.last}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                                <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteUser}
                onClose={() => setDeleteUser(null)}
                onConfirm={() => {
                    if (deleteUser) deleteMutation.mutate(deleteUser.id);
                }}
                title="Delete User"
                itemName={deleteUser?.fullName}
            />
        </>
    );
}
