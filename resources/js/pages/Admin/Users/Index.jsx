// resources/js/Pages/Users/Index.jsx
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    Briefcase,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit,
    Eye,
    Laptop,
    LayoutGrid,
    List,
    Mail,
    MoreHorizontal,
    Phone,
    Plus,
    Search,
    Shield,
    Trash2,
    Upload,
    UserCheck,
    Users as UsersIcon,
    UserX,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, users, roles, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [accountStatus, setAccountStatus] = useState(
        filters.account_status || 'all',
    );
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const { flash } = usePage().props;

    // Calculate pending count
    const pendingCount = users.data.filter(
        (u) => u.account_status === 'pending',
    ).length;

    // Check if current user can approve (Super Admin, Admin, or HR Manager)
    const canApprove = auth.user.roles?.some((role) =>
        ['super-admin', 'admin', 'hr-manager'].includes(role.slug),
    );

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search };

        if (role && role !== 'all') params.role = role;
        if (accountStatus && accountStatus !== 'all')
            params.account_status = accountStatus;

        router.get(route('users.index'), params, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setRole('all');
        setAccountStatus('all');
        router.get(route('users.index'));
    };

    const handleDelete = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(route('users.destroy', userToDelete.id));
        }
    };

    const handleApprove = (user) => {
        router.post(
            route('users.approve', user.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleReject = (user) => {
        router.post(
            route('users.reject', user.id),
            {},
            {
                preserveScroll: true,
            },
        );
    };

    const handleQuickFilter = (status) => {
        setAccountStatus(status);
        const params = {};
        if (search) params.search = search;
        if (role && role !== 'all') params.role = role;
        if (status && status !== 'all') params.account_status = status;

        router.get(route('users.index'), params, {
            preserveState: true,
        });
    };

    const getAccountStatusBadge = (status) => {
        const styles = {
            pending: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                border: 'border-yellow-200',
                icon: Clock,
            },
            active: {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-200',
                icon: CheckCircle2,
            },
            rejected: {
                bg: 'bg-red-100',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: XCircle,
            },
            suspended: {
                bg: 'bg-orange-100',
                text: 'text-orange-700',
                border: 'border-orange-200',
                icon: AlertCircle,
            },
        };
        return styles[status] || styles.active;
    };

    const hasFilters = search || role !== 'all' || accountStatus !== 'all';

    // Get counts for each status
    const statusCounts = {
        all: users.total,
        pending: users.data.filter((u) => u.account_status === 'pending')
            .length,
        active: users.data.filter((u) => u.account_status === 'active').length,
        rejected: users.data.filter((u) => u.account_status === 'rejected')
            .length,
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <UsersIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                User Management
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Manage users, roles, and permissions
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex rounded-lg border bg-white p-1">
                            <Button
                                variant={
                                    viewMode === 'table' ? 'default' : 'ghost'
                                }
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={
                                    viewMode === 'table'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : ''
                                }
                            >
                                <List className="mr-2 h-4 w-4" />
                                Table
                            </Button>
                            <Button
                                variant={
                                    viewMode === 'card' ? 'default' : 'ghost'
                                }
                                size="sm"
                                onClick={() => setViewMode('card')}
                                className={
                                    viewMode === 'card'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : ''
                                }
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                Cards
                            </Button>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={route('users.import')}>
                                <Upload className="mr-2 h-4 w-4" />
                                Import Users
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Link href={route('users.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Users" />

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

                {/* 🎯 PENDING USERS ALERT BANNER */}
                {canApprove && pendingCount > 0 && (
                    <Alert className="animate-fade-in border-yellow-300 bg-yellow-50">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <AlertDescription className="flex items-center justify-between">
                            <span className="font-medium text-yellow-800">
                                <strong>{pendingCount}</strong>{' '}
                                {pendingCount === 1 ? 'user' : 'users'} waiting
                                for approval
                            </span>
                            <Button
                                size="sm"
                                className="bg-yellow-600 text-white hover:bg-yellow-700"
                                onClick={() => handleQuickFilter('pending')}
                            >
                                View Pending
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* 🎯 QUICK FILTER TABS */}
                <div className="animate-fade-in animation-delay-100 flex gap-2 overflow-x-auto pb-2">
                    <Button
                        variant={
                            accountStatus === 'all' ? 'default' : 'outline'
                        }
                        onClick={() => handleQuickFilter('all')}
                        className={
                            accountStatus === 'all'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : ''
                        }
                    >
                        All Users
                        <Badge
                            variant="secondary"
                            className="ml-2 bg-white text-gray-900"
                        >
                            {statusCounts.all}
                        </Badge>
                    </Button>

                    <Button
                        variant={
                            accountStatus === 'pending' ? 'default' : 'outline'
                        }
                        onClick={() => handleQuickFilter('pending')}
                        className={
                            accountStatus === 'pending'
                                ? 'bg-yellow-600 hover:bg-yellow-700'
                                : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                        }
                    >
                        <Clock className="mr-2 h-4 w-4" />
                        Pending
                        {statusCounts.pending > 0 && (
                            <Badge className="ml-2 bg-yellow-600 text-white hover:bg-yellow-600">
                                {statusCounts.pending}
                            </Badge>
                        )}
                    </Button>

                    <Button
                        variant={
                            accountStatus === 'active' ? 'default' : 'outline'
                        }
                        onClick={() => handleQuickFilter('active')}
                        className={
                            accountStatus === 'active'
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                        }
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Active
                        <Badge
                            variant="secondary"
                            className="ml-2 bg-white text-gray-900"
                        >
                            {statusCounts.active}
                        </Badge>
                    </Button>

                    {statusCounts.rejected > 0 && (
                        <Button
                            variant={
                                accountStatus === 'rejected'
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() => handleQuickFilter('rejected')}
                            className={
                                accountStatus === 'rejected'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'border-red-300 text-red-700 hover:bg-red-50'
                            }
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Rejected
                            <Badge
                                variant="secondary"
                                className="ml-2 bg-white text-gray-900"
                            >
                                {statusCounts.rejected}
                            </Badge>
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <Card className="animate-fade-in animation-delay-200 shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-11 pl-10"
                                />
                            </div>

                            <div className="flex flex-wrap items-end gap-3">
                                <div className="min-w-[200px] flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Role
                                    </label>
                                    <Select
                                        value={role}
                                        onValueChange={setRole}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Roles
                                            </SelectItem>
                                            {roles.map((r) => (
                                                <SelectItem
                                                    key={r.id}
                                                    value={r.id.toString()}
                                                >
                                                    {r.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        className="h-10 bg-blue-600 text-white hover:bg-blue-700"
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
                            </div>

                            <div className="border-t pt-2 text-sm text-gray-600">
                                Showing{' '}
                                <span className="font-semibold text-gray-900">
                                    {users.total}
                                </span>{' '}
                                {users.total === 1 ? 'user' : 'users'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table View */}
                {viewMode === 'table' ? (
                    <Card className="animate-fade-in animation-delay-300 shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b-2 bg-gray-50 hover:bg-gray-50">
                                        <TableHead className="h-12 font-semibold text-gray-700">
                                            User
                                        </TableHead>
                                        <TableHead className="h-12 font-semibold text-gray-700">
                                            Email
                                        </TableHead>
                                        <TableHead className="h-12 font-semibold text-gray-700">
                                            Account Status
                                        </TableHead>
                                        <TableHead className="h-12 font-semibold text-gray-700">
                                            Roles
                                        </TableHead>
                                        <TableHead className="h-12 text-center font-semibold text-gray-700">
                                            Assets
                                        </TableHead>
                                        <TableHead className="h-12 font-semibold text-gray-700">
                                            Joined
                                        </TableHead>
                                        <TableHead className="h-12 text-center font-semibold text-gray-700">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length > 0 ? (
                                        users.data.map((user, index) => {
                                            const statusStyle =
                                                getAccountStatusBadge(
                                                    user.account_status,
                                                );
                                            const StatusIcon = statusStyle.icon;
                                            const isPending =
                                                user.account_status ===
                                                'pending';

                                            return (
                                                <TableRow
                                                    key={user.id}
                                                    className={`border-b hover:bg-gray-50 ${isPending ? 'bg-yellow-50/30' : ''}`}
                                                >
                                                    <TableCell className="py-4 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            {user.profile_picture ? (
                                                                <img
                                                                    src={`/storage/${user.profile_picture}`}
                                                                    alt={
                                                                        user.name
                                                                    }
                                                                    className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                                                                    <span className="text-sm font-medium text-white">
                                                                        {user.name
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium text-gray-900">
                                                                    {user.name}
                                                                </p>
                                                                {user.position && (
                                                                    <p className="truncate text-xs text-gray-500">
                                                                        {
                                                                            user.position
                                                                        }
                                                                    </p>
                                                                )}
                                                                {user.id ===
                                                                    auth.user
                                                                        .id && (
                                                                    <Badge className="mt-0.5 bg-blue-100 text-xs text-blue-700">
                                                                        You
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-middle">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                                            <span className="truncate text-sm text-gray-600">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-middle">
                                                        <Badge
                                                            className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex w-fit items-center gap-1.5 border`}
                                                        >
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {user.account_status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                user.account_status.slice(
                                                                    1,
                                                                )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="align-middle">
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.roles &&
                                                            user.roles.length >
                                                                0 ? (
                                                                user.roles.map(
                                                                    (role) => (
                                                                        <Badge
                                                                            key={
                                                                                role.id
                                                                            }
                                                                            className="whitespace-nowrap border border-purple-200 bg-purple-100 text-xs text-purple-700"
                                                                        >
                                                                            <Shield className="mr-1 h-3 w-3" />
                                                                            {
                                                                                role.name
                                                                            }
                                                                        </Badge>
                                                                    ),
                                                                )
                                                            ) : (
                                                                <span className="text-sm text-gray-400">
                                                                    No roles
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center align-middle">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Laptop className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {user
                                                                    .current_individual_assets
                                                                    ?.length ||
                                                                    0}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-middle">
                                                        <span className="whitespace-nowrap text-sm text-gray-600">
                                                            {new Date(
                                                                user.created_at,
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                },
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-center align-middle">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Open menu
                                                                </span>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent
                                                                align="end"
                                                                className="w-56"
                                                            >
                                                                <DropdownMenuLabel>
                                                                    Actions
                                                                </DropdownMenuLabel>
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'users.show',
                                                                            user.id,
                                                                        )}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View
                                                                        Details
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'users.edit',
                                                                            user.id,
                                                                        )}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                        User
                                                                    </Link>
                                                                </DropdownMenuItem>

                                                                {/* 🎯 APPROVE/REJECT OPTIONS (only for pending users) */}
                                                                {canApprove &&
                                                                    isPending && (
                                                                        <>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    handleApprove(
                                                                                        user,
                                                                                    )
                                                                                }
                                                                                className="cursor-pointer text-green-600 focus:bg-green-50 focus:text-green-600"
                                                                            >
                                                                                <UserCheck className="mr-2 h-4 w-4" />
                                                                                Approve
                                                                                User
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    handleReject(
                                                                                        user,
                                                                                    )
                                                                                }
                                                                                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                                                                            >
                                                                                <UserX className="mr-2 h-4 w-4" />
                                                                                Reject
                                                                                User
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}

                                                                {user.id !==
                                                                    auth.user
                                                                        .id && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    user,
                                                                                )
                                                                            }
                                                                            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                            User
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="h-64 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="mb-4 rounded-full bg-gray-100 p-4">
                                                        <UsersIcon className="h-12 w-12 text-gray-400" />
                                                    </div>
                                                    <p className="mb-1 text-lg font-medium text-gray-900">
                                                        No users found
                                                    </p>
                                                    <p className="mb-4 text-sm text-gray-500">
                                                        {hasFilters
                                                            ? 'Try adjusting your filters'
                                                            : 'Add your first user to get started'}
                                                    </p>
                                                    <Button
                                                        asChild
                                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'users.create',
                                                            )}
                                                        >
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Add User
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {users.data.length > 0 && (
                            <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {users.from}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {users.to}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium">
                                        {users.total}
                                    </span>{' '}
                                    results
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(users.prev_page_url)
                                        }
                                        disabled={!users.prev_page_url}
                                        className="h-9"
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(users.next_page_url)
                                        }
                                        disabled={!users.next_page_url}
                                        className="h-9"
                                    >
                                        Next
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ) : (
                    /* Card View */
                    <div className="animate-fade-in animation-delay-300 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {users.data.length > 0 ? (
                            users.data.map((user, index) => {
                                const statusStyle = getAccountStatusBadge(
                                    user.account_status,
                                );
                                const StatusIcon = statusStyle.icon;
                                const isPending =
                                    user.account_status === 'pending';

                                return (
                                    <Card
                                        key={user.id}
                                        className={`transition-shadow hover:shadow-lg ${isPending ? 'border-2 border-yellow-300' : ''}`}
                                    >
                                        <CardContent className="pt-6">
                                            {/* 🎯 ACCOUNT STATUS BADGE (top-right) */}
                                            <div className="mb-2 flex justify-end">
                                                <Badge
                                                    className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex items-center gap-1.5 border`}
                                                >
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {user.account_status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        user.account_status.slice(
                                                            1,
                                                        )}
                                                </Badge>
                                            </div>

                                            {/* User Avatar & Name */}
                                            <div className="mb-4 flex items-center gap-4">
                                                {user.profile_picture ? (
                                                    <img
                                                        src={`/storage/${user.profile_picture}`}
                                                        alt={user.name}
                                                        className="h-16 w-16 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                                                        <span className="text-2xl font-medium text-white">
                                                            {user.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {user.name}
                                                    </h3>
                                                    {user.position && (
                                                        <p className="text-sm text-gray-600">
                                                            {user.position}
                                                        </p>
                                                    )}
                                                    {user.id ===
                                                        auth.user.id && (
                                                        <Badge className="mt-1 bg-blue-100 text-xs text-blue-700">
                                                            You
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="mb-4 space-y-2 border-b pb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="h-4 w-4" />
                                                    <span className="truncate">
                                                        {user.email}
                                                    </span>
                                                </div>
                                                {user.phone_number && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="h-4 w-4" />
                                                        <span>
                                                            {user.phone_number}
                                                        </span>
                                                    </div>
                                                )}
                                                {user.department && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Briefcase className="h-4 w-4" />
                                                        <span>
                                                            {user.department}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Roles */}
                                            {user.roles &&
                                                user.roles.length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="mb-2 text-xs text-gray-600">
                                                            Roles
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.roles.map(
                                                                (role) => (
                                                                    <Badge
                                                                        key={
                                                                            role.id
                                                                        }
                                                                        className="border border-purple-200 bg-purple-100 text-xs text-purple-700"
                                                                    >
                                                                        {
                                                                            role.name
                                                                        }
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Assets Count */}
                                            <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                <div className="flex items-center gap-2">
                                                    <Laptop className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">
                                                        Assets
                                                    </span>
                                                </div>
                                                <span className="text-lg font-bold text-gray-900">
                                                    {user
                                                        .current_individual_assets
                                                        ?.length || 0}
                                                </span>
                                            </div>

                                            {/* 🎯 APPROVE/REJECT BUTTONS (for pending users in card view) */}
                                            {canApprove && isPending ? (
                                                <div className="mb-3 flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                                                        onClick={() =>
                                                            handleApprove(user)
                                                        }
                                                    >
                                                        <UserCheck className="mr-1 h-4 w-4" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() =>
                                                            handleReject(user)
                                                        }
                                                    >
                                                        <UserX className="mr-1 h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            ) : null}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="flex-1"
                                                >
                                                    <Link
                                                        href={route(
                                                            'users.show',
                                                            user.id,
                                                        )}
                                                    >
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="flex-1"
                                                >
                                                    <Link
                                                        href={route(
                                                            'users.edit',
                                                            user.id,
                                                        )}
                                                    >
                                                        <Edit className="mr-1 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                {user.id !== auth.user.id && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(user)
                                                        }
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="col-span-full">
                                <Card>
                                    <CardContent className="py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="mb-4 rounded-full bg-gray-100 p-4">
                                                <UsersIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <p className="mb-1 text-lg font-medium text-gray-900">
                                                No users found
                                            </p>
                                            <p className="mb-4 text-sm text-gray-500">
                                                {hasFilters
                                                    ? 'Try adjusting your filters'
                                                    : 'Add your first user to get started'}
                                            </p>
                                            <Button
                                                asChild
                                                className="bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                <Link
                                                    href={route('users.create')}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add User
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Pagination for Card View */}
                        {users.data.length > 0 && viewMode === 'card' && (
                            <div className="col-span-full">
                                <Card>
                                    <CardContent className="flex items-center justify-between p-4">
                                        <p className="text-sm text-gray-700">
                                            Showing{' '}
                                            <span className="font-medium">
                                                {users.from}
                                            </span>{' '}
                                            to{' '}
                                            <span className="font-medium">
                                                {users.to}
                                            </span>{' '}
                                            of{' '}
                                            <span className="font-medium">
                                                {users.total}
                                            </span>{' '}
                                            results
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.get(
                                                        users.prev_page_url,
                                                    )
                                                }
                                                disabled={!users.prev_page_url}
                                                className="h-9"
                                            >
                                                <ChevronLeft className="mr-1 h-4 w-4" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.get(
                                                        users.next_page_url,
                                                    )
                                                }
                                                disabled={!users.next_page_url}
                                                className="h-9"
                                            >
                                                Next
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete User"
                description="This will permanently delete this user and remove all their data. Any assets assigned to them will become unassigned."
                itemName={userToDelete?.name}
            />
        </AuthenticatedLayout>
    );
}
