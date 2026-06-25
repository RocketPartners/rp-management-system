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
    UsersRound,
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
import { usePermission } from '@/hooks/use-permission';
import { apiGet, apiDelete } from '@/lib/spring-boot-api';
import type { TeamResponse, PagedResponse } from '@/types';

const statusConfig: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-800' },
    INACTIVE: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
    ARCHIVED: { label: 'Archived', className: 'bg-red-100 text-red-800' },
};

export default function TeamList() {
    const { can } = usePermission();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = 15;

    const [searchInput, setSearchInput] = useState(search);
    const [deleteTeam, setDeleteTeam] = useState<TeamResponse | null>(null);

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
        queryKey: ['teams', { search, status, page, size }],
        queryFn: () => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (status) params.set('status', status);
            params.set('page', String(page));
            params.set('size', String(size));
            return apiGet<PagedResponse<TeamResponse>>(
                `/teams?${params}`,
            );
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiDelete(`/teams/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team deleted successfully');
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

    function clearFilters() {
        setSearchInput('');
        setSearchParams({}, { replace: true });
    }

    const hasFilters = search || status;

    return (
        <>
            <Helmet>
                <title>Teams | HRIS</title>
            </Helmet>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <UsersRound className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Teams
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Manage teams and their members
                            </p>
                        </div>
                    </div>
                    {can('teams.create') && (
                        <Button
                            asChild
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Link to="/teams/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Team
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search teams..."
                                    value={searchInput}
                                    onChange={(e) =>
                                        setSearchInput(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={status || 'all'}
                                onValueChange={setStatus}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Statuses
                                    </SelectItem>
                                    <SelectItem value="ACTIVE">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="INACTIVE">
                                        Inactive
                                    </SelectItem>
                                    <SelectItem value="ARCHIVED">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {hasFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Leader (POC)</TableHead>
                                    <TableHead>Sub-Leader (Sub-POC)</TableHead>
                                    <TableHead className="text-center">
                                        Members
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading &&
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 6 }).map(
                                                (_, j) => (
                                                    <TableCell key={j}>
                                                        <Skeleton className="h-4 w-24" />
                                                    </TableCell>
                                                ),
                                            )}
                                        </TableRow>
                                    ))}

                                {isError && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-12 text-center"
                                        >
                                            <UsersRound className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-500">
                                                Failed to load teams
                                            </p>
                                            <p className="mb-4 text-sm text-gray-400">
                                                Something went wrong. Please try
                                                again.
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    queryClient.invalidateQueries(
                                                        {
                                                            queryKey: ['teams'],
                                                        },
                                                    )
                                                }
                                            >
                                                Try again
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!isLoading &&
                                    !isError &&
                                    data?.content.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-12 text-center"
                                            >
                                                <UsersRound className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                                <p className="text-lg font-medium text-gray-500">
                                                    No teams found
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {hasFilters
                                                        ? 'Try adjusting your filters'
                                                        : 'Create your first team to get started'}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                {data?.content.map((team) => (
                                    <TableRow key={team.id}>
                                        <TableCell>
                                            <Link
                                                to={`/teams/${team.id}`}
                                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {team.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {team.leaderName ? (
                                                <p className="font-medium text-gray-900">
                                                    {team.leaderName}
                                                </p>
                                            ) : (
                                                <span className="text-sm text-gray-400">
                                                    No Leader Assigned
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {team.subLeaderName ? (
                                                <p className="font-medium text-gray-900">
                                                    {team.subLeaderName}
                                                </p>
                                            ) : (
                                                <span className="text-sm text-gray-400">
                                                    None
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">
                                                {team.membersCount}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    statusConfig[team.status]
                                                        ?.className
                                                }
                                            >
                                                {statusConfig[team.status]
                                                    ?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>
                                                        Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            to={`/teams/${team.id}`}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {can('teams.edit') && (
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                to={`/teams/${team.id}/edit`}
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {can('teams.delete') && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() =>
                                                                    setDeleteTeam(
                                                                        team,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
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

                        {/* Pagination */}
                        {data && data.totalPages > 1 && (
                            <div className="flex items-center justify-between border-t px-6 py-4">
                                <p className="text-sm text-gray-600">
                                    Showing{' '}
                                    <span className="font-semibold text-gray-900">
                                        {page * size + 1}
                                    </span>
                                    {' '}to{' '}
                                    <span className="font-semibold text-gray-900">
                                        {Math.min(
                                            (page + 1) * size,
                                            data.totalElements,
                                        )}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-semibold text-gray-900">
                                        {data.totalElements}
                                    </span>
                                    {' '}teams
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={data.first}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        Previous
                                    </Button>
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
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteTeam}
                onClose={() => setDeleteTeam(null)}
                onConfirm={() => {
                    if (deleteTeam) deleteMutation.mutate(deleteTeam.id);
                }}
                title="Delete Team"
                description="This will permanently delete this team and remove all member associations. This action cannot be undone."
                itemName={deleteTeam?.name}
            />
        </>
    );
}
