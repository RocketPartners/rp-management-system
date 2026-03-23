import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermission } from '@/hooks/usePermission';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
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
import { useState } from 'react';

const statusConfig = {
    active: { label: 'Active', className: 'bg-green-100 text-green-800' },
    inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800' },
    archived: { label: 'Archived', className: 'bg-red-100 text-red-800' },
};

export default function Index({ auth, teams, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        team: null,
    });
    const { flash } = usePage().props;
    const { can } = usePermission();

    const handleSearch = (value) => {
        setSearch(value);
        router.get(
            route('teams.index'),
            { search: value, status: status !== 'all' ? status : undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleStatusFilter = (value) => {
        setStatus(value);
        router.get(
            route('teams.index'),
            {
                search: search || undefined,
                status: value !== 'all' ? value : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = () => {
        if (deleteModal.team) {
            router.delete(route('teams.destroy', deleteModal.team.id), {
                preserveScroll: true,
            });
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        router.get(
            route('teams.index'),
            {},
            { preserveState: true, replace: true },
        );
    };

    const hasFilters = search || (status && status !== 'all');

    return (
        <AuthenticatedLayout
            header={
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
                            <Link href={route('teams.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Team
                            </Link>
                        </Button>
                    )}
                </div>
            }
        >
            <Head title="Teams" />

            <div className="space-y-6">
                {flash?.success && (
                    <Alert className="animate-fade-in border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="font-medium text-green-800">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search teams..."
                                    value={search}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={status}
                                onValueChange={handleStatusFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Statuses
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {hasFilters && (
                                <Button
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
                                {teams.data.length > 0 ? (
                                    teams.data.map((team) => (
                                        <TableRow key={team.id}>
                                            <TableCell>
                                                <Link
                                                    href={route(
                                                        'teams.show',
                                                        team.id,
                                                    )}
                                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {team.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {team.leader ? (
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {team.leader.name}
                                                        </p>
                                                        {team.leader
                                                            .position && (
                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    team.leader
                                                                        .position
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        No Leader Assigned
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {team.sub_leader ? (
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                team.sub_leader
                                                                    .name
                                                            }
                                                        </p>
                                                        {team.sub_leader
                                                            .position && (
                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    team
                                                                        .sub_leader
                                                                        .position
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        None
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">
                                                    {team.members_count}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        statusConfig[
                                                            team.status
                                                        ]?.className
                                                    }
                                                >
                                                    {
                                                        statusConfig[
                                                            team.status
                                                        ]?.label
                                                    }
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
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
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'teams.show',
                                                                    team.id,
                                                                )}
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
                                                                    href={route(
                                                                        'teams.edit',
                                                                        team.id,
                                                                    )}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {can(
                                                            'teams.delete',
                                                        ) && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() =>
                                                                        setDeleteModal(
                                                                            {
                                                                                isOpen: true,
                                                                                team,
                                                                            },
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
                                    ))
                                ) : (
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
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {teams.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-6 py-4">
                                <p className="text-sm text-gray-600">
                                    Showing {teams.from} to {teams.to} of{' '}
                                    {teams.total} teams
                                </p>
                                <div className="flex gap-2">
                                    {teams.prev_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(teams.prev_page_url)
                                            }
                                        >
                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                            Previous
                                        </Button>
                                    )}
                                    {teams.next_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(teams.next_page_url)
                                            }
                                        >
                                            Next
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, team: null })}
                onConfirm={handleDelete}
                title="Delete Team"
                description="This will permanently delete this team and remove all member associations. This action cannot be undone."
                itemName={deleteModal.team?.name}
            />
        </AuthenticatedLayout>
    );
}
