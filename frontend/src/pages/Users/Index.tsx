import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
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
import type { UserResponse, PagedResponse, AccountStatus } from '@/types';

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
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

    // Debounced search
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

    return (
        <>
            <Helmet>
                <title>Users | HRIS</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Users
                        </h1>
                        <p className="text-muted-foreground">
                            Manage user accounts and permissions.
                        </p>
                    </div>
                    {can('users.create') && (
                        <Button asChild>
                            <Link to="/users/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create User
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9"
                        />
                        {searchInput && (
                            <button
                                onClick={() => setSearchInput('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    <Select value={status || 'all'} onValueChange={setStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="SUSPENDED">
                                Suspended
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Roles</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading &&
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 7 }).map(
                                                (_, j) => (
                                                    <TableCell key={j}>
                                                        <Skeleton className="h-5 w-full" />
                                                    </TableCell>
                                                ),
                                            )}
                                        </TableRow>
                                    ))}

                                {isError && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-8 text-center text-destructive"
                                        >
                                            Failed to load users. Please try
                                            again.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!isLoading &&
                                    !isError &&
                                    data?.content.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                <Users className="mx-auto mb-2 h-8 w-8" />
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    )}

                                {data?.content.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <Link
                                                    to={`/users/${user.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {user.fullName}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.departmentName || '—'}
                                        </TableCell>
                                        <TableCell>
                                            {user.positionTitle || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <UserStatusBadge
                                                status={user.accountStatus}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge
                                                        key={role}
                                                        variant="secondary"
                                                    >
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(user.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            to={`/users/${user.id}`}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {can('users.edit') && (
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                to={`/users/${user.id}/edit`}
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {user.accountStatus ===
                                                        'PENDING' && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    approveMutation.mutate(
                                                                        user.id,
                                                                    )
                                                                }
                                                                className="text-green-600"
                                                            >
                                                                Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    rejectMutation.mutate(
                                                                        user.id,
                                                                    )
                                                                }
                                                                className="text-red-600"
                                                            >
                                                                Reject
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {user.accountStatus ===
                                                        'ACTIVE' && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                suspendMutation.mutate(
                                                                    user.id,
                                                                )
                                                            }
                                                            className="text-orange-600"
                                                        >
                                                            Suspend
                                                        </DropdownMenuItem>
                                                    )}
                                                    {can('users.delete') && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDeleteUser(
                                                                    user,
                                                                )
                                                            }
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {page * size + 1}–
                            {Math.min((page + 1) * size, data.totalElements)} of{' '}
                            {data.totalElements} users
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={data.first}
                                onClick={() => setPage(page - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {page + 1} of {data.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={data.last}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
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
