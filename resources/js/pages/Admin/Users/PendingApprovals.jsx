// resources/js/Pages/Admin/Users/PendingApprovals.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
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
import { useEffect, useRef, useState } from 'react';

export default function PendingApprovals({ auth, users, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const [selected, setSelected] = useState([]);
    const selectAllRef = useRef(null);
    const allChecked =
        selected.length === users.data.length && selected.length > 0;
    const isIndeterminate =
        selected.length > 0 && selected.length < users.length;

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(users.data.map((user) => user.id));
        } else {
            setSelected([]);
        }
    };

    const handleItemToggle = (itemId) => {
        setSelected((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId],
        );
    };

    const { flash } = usePage().props;

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('users.pending-approvals'),
            { search },
            {
                preserveState: true,
            },
        );
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('users.pending-approvals'));
    };

    const handleApprove = (user) => {
        if (
            confirm(
                `Are you sure you want to approve ${user.name}? They will be able to access the system.`,
            )
        ) {
            router.post(
                route('users.approve', user),
                {},
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const handleBulkApprove = () => {
        if (selected.length === 0) {
            alert('Please select at least one user.');
            return;
        }
        if (confirm(`Are you sure you want to approve ${selected}?`)) {
            router.post(
                route('users.bulkApprove'),
                {
                    userIds: selected,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelected([]);
                    },
                },
            );
        }
    };

    const handleReject = (user) => {
        if (
            confirm(
                `Are you sure you want to reject ${user.name}? They will need to register again.`,
            )
        ) {
            router.post(
                route('users.reject', user.id),
                {},
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const handleBulkReject = () => {
        if (selected.length === 0) {
            alert('Please select at least one user.');
            return;
        }
        if (
            confirm(
                `Are you sure you want to reject ${selected}? They will need to register again.`,
            )
        ) {
            router.post(
                route('users.bulkReject'),
                {
                    userIds: selected,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelected([]);
                    },
                },
            );
        }
    };

    const hasFilters = search !== '';

    return (
        <AuthenticatedLayout
            header={
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
                        {users.total} Pending
                    </Badge>
                </div>
            }
        >
            <Head title="Pending Approvals" />

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

                {/* Info Banner */}
                {users.total > 0 && (
                    <Alert className="animate-fade-in border-blue-200 bg-blue-50">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <strong>Quick Action Required:</strong> These users
                            have registered and are waiting for approval to
                            access the system.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search Filter */}
                <Card className="animate-fade-in animation-delay-100 shadow-sm">
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

                            <div className="flex items-end gap-3">
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

                            <div className="border-t pt-2 text-sm text-gray-600">
                                Showing{' '}
                                <span className="font-semibold text-gray-900">
                                    {users.total}
                                </span>{' '}
                                pending {users.total === 1 ? 'user' : 'users'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="animate-fade-in animation-delay-200 shadow-sm">
                    <div className="flex items-center justify-end gap-2 px-6">
                        <Button
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleBulkApprove()}
                        >
                            <UserCheck className="mr-1 h-4 w-4" />
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleBulkReject(selected)}
                        >
                            <UserX className="mr-1 h-4 w-4" />
                            Reject
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-2 bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="h-12 font-semibold text-gray-700">
                                        <input
                                            ref={selectAllRef}
                                            type="checkbox"
                                            checked={allChecked}
                                            onChange={handleSelectAll}
                                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
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
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="border-b bg-yellow-50/20 hover:bg-yellow-50/30"
                                        >
                                            <TableCell className="py-4 align-middle">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(
                                                        user.id,
                                                    )}
                                                    onChange={() =>
                                                        handleItemToggle(
                                                            user.id,
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                />
                                            </TableCell>
                                            <TableCell className="py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    {user.profile_picture ? (
                                                        <img
                                                            src={`/storage/${user.profile_picture}`}
                                                            alt={user.name}
                                                            className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-600">
                                                            <span className="text-sm font-medium text-white">
                                                                {user.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-gray-900">
                                                            {user.name}
                                                        </p>
                                                        {user.position && (
                                                            <p className="truncate text-sm text-gray-600">
                                                                {user.position}
                                                            </p>
                                                        )}
                                                        {user.department && (
                                                            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                                                                <Briefcase className="h-3 w-3" />
                                                                {
                                                                    user.department
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                                        <span className="truncate text-sm text-gray-700">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                    {user.phone_number && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                                            <span className="text-sm text-gray-600">
                                                                {
                                                                    user.phone_number
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles &&
                                                    user.roles.length > 0 ? (
                                                        user.roles.map(
                                                            (role) => (
                                                                <Badge
                                                                    key={
                                                                        role.id
                                                                    }
                                                                    className="whitespace-nowrap border border-purple-200 bg-purple-100 text-xs text-purple-700"
                                                                >
                                                                    <Shield className="mr-1 h-3 w-3" />
                                                                    {role.name}
                                                                </Badge>
                                                            ),
                                                        )
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
                                                        {new Date(
                                                            user.created_at,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 text-white hover:bg-green-700"
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
                                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() =>
                                                            handleReject(user)
                                                        }
                                                    >
                                                        <UserX className="mr-1 h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-64 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="mb-4 rounded-full bg-green-100 p-4">
                                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                                </div>
                                                <p className="mb-1 text-lg font-medium text-gray-900">
                                                    All caught up!
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {hasFilters
                                                        ? 'No pending users match your search'
                                                        : 'There are no pending user approvals at the moment'}
                                                </p>
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
                                <span className="font-medium">{users.to}</span>{' '}
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
            </div>
        </AuthenticatedLayout>
    );
}
