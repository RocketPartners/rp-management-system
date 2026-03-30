import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Search,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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

            <div className="space-y-6">
                <div>
                    <Link
                        to="/users"
                        className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Users
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Pending Approvals
                    </h1>
                    <p className="text-muted-foreground">
                        Review and approve pending user registrations.
                    </p>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search pending users..."
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

                {/* Bulk Actions */}
                {selected.length > 0 && (
                    <Card>
                        <CardContent className="flex items-center gap-4 py-3">
                            <span className="text-sm font-medium">
                                {selected.length} selected
                            </span>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle2 className="mr-1 h-4 w-4" />
                                        Approve All
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Bulk Approve
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Approve {selected.length} selected
                                            users?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() =>
                                                bulkApproveMutation.mutate(
                                                    selected,
                                                )
                                            }
                                        >
                                            Approve
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                        <XCircle className="mr-1 h-4 w-4" />
                                        Reject All
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Bulk Reject
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Reject {selected.length} selected
                                            users?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() =>
                                                bulkRejectMutation.mutate(
                                                    selected,
                                                )
                                            }
                                            className="bg-destructive text-white hover:bg-destructive/90"
                                        >
                                            Reject
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelected([])}
                            >
                                Clear
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={toggleAll}
                                        />
                                    </TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Registered</TableHead>
                                    <TableHead className="w-48 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading &&
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 5 }).map(
                                                (_, j) => (
                                                    <TableCell key={j}>
                                                        <Skeleton className="h-5 w-full" />
                                                    </TableCell>
                                                ),
                                            )}
                                        </TableRow>
                                    ))}

                                {!isLoading &&
                                    data?.content.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-12 text-center text-muted-foreground"
                                            >
                                                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
                                                No pending approvals.
                                            </TableCell>
                                        </TableRow>
                                    )}

                                {data?.content.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selected.includes(
                                                    user.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleOne(user.id)
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                to={`/users/${user.id}`}
                                                className="font-medium hover:underline"
                                            >
                                                {user.fullName}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {user.email}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(user.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:text-green-700"
                                                    onClick={() =>
                                                        approveMutation.mutate(
                                                            user.id,
                                                        )
                                                    }
                                                    disabled={
                                                        approveMutation.isPending
                                                    }
                                                >
                                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() =>
                                                        rejectMutation.mutate(
                                                            user.id,
                                                        )
                                                    }
                                                    disabled={
                                                        rejectMutation.isPending
                                                    }
                                                >
                                                    <XCircle className="mr-1 h-4 w-4" />
                                                    Reject
                                                </Button>
                                            </div>
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
                            {data.totalElements}
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
        </>
    );
}
