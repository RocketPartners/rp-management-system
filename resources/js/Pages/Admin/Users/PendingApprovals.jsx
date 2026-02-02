// resources/js/Pages/Admin/Users/PendingApprovals.jsx
import { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Mail,
    Shield,
    CheckCircle2,
    AlertCircle,
    Clock,
    UserCheck,
    UserX,
    Users as UsersIcon,
    Phone,
    Briefcase,
    Calendar,
} from 'lucide-react';

export default function PendingApprovals({ auth, users, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const [selected, setSelected] = useState([]);
    const selectAllRef = useRef(null);
    const allChecked = selected.length === users.data.length && selected.length > 0;
    const isIndeterminate = selected.length > 0 && selected.length < users.length;

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(users.data.map(user => user.id));
        } else {
            setSelected([]);
        }
    };

    const handleItemToggle = (itemId) => {
        setSelected(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const { flash } = usePage().props;

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('users.pending-approvals'), { search }, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('users.pending-approvals'));
    };

    const handleApprove = (user) => {
        if (confirm(`Are you sure you want to approve ${user.name}? They will be able to access the system.`)) {
            router.post(route('users.approve', user), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleBulkApprove = () => {
        if (selected.length === 0) {
            alert("Please select at least one user.");
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
        if (confirm(`Are you sure you want to reject ${user.name}? They will need to register again.`)) {
            router.post(route('users.reject', user.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleBulkReject = () => {
        if (selected.length === 0) {
            alert("Please select at least one user.");
            return;
        }
        if (confirm(`Are you sure you want to reject ${selected}? They will need to register again.`)) {
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
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <UserCheck className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Pending User Approvals</h2>
                            <p className="text-gray-600 mt-1">Review and approve new user registrations</p>
                        </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 border text-lg px-4 py-2">
                        <Clock className="h-5 w-5 mr-2" />
                        {users.total} Pending
                    </Badge>
                </div>
            }
        >
            <Head title="Pending Approvals" />

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="bg-green-50 border-green-200 animate-fade-in">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 font-medium">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert className="bg-red-50 border-red-200 animate-fade-in">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 font-medium">
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Info Banner */}
                {users.total > 0 && (
                    <Alert className="bg-blue-50 border-blue-200 animate-fade-in">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <strong>Quick Action Required:</strong> These users have registered and are waiting for approval to access the system.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Search Filter */}
                <Card className="shadow-sm animate-fade-in animation-delay-100">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-11"
                                />
                            </div>

                            <div className="flex items-end gap-3">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white h-10">
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                                {hasFilters && (
                                    <Button type="button" variant="outline" onClick={handleReset} className="h-10">
                                        <X className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                )}
                            </div>

                            <div className="text-sm text-gray-600 pt-2 border-t">
                                Showing <span className="font-semibold text-gray-900">{users.total}</span> pending {users.total === 1 ? 'user' : 'users'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card className="shadow-sm animate-fade-in animation-delay-200">
                    <div className="flex items-center justify-end gap-2 px-6">
                        <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleBulkApprove()}
                        >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                            onClick={() => handleBulkReject(selected)}
                        >
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b-2">
                                    <TableHead className="font-semibold text-gray-700 h-12">
                                        <input
                                            ref={selectAllRef}
                                            type="checkbox"
                                            checked={allChecked}
                                            onChange={handleSelectAll}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 h-12">User</TableHead>
                                    <TableHead className="font-semibold text-gray-700 h-12">Contact</TableHead>
                                    <TableHead className="font-semibold text-gray-700 h-12">Roles</TableHead>
                                    <TableHead className="font-semibold text-gray-700 h-12">Registered</TableHead>
                                    <TableHead className="font-semibold text-gray-700 h-12 text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-yellow-50/30 border-b bg-yellow-50/20">
                                            <TableCell className="py-4 align-middle">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(user.id)}
                                                    onChange={() => handleItemToggle(user.id)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                />
                                            </TableCell>
                                            <TableCell className="py-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    {user.profile_picture ? (
                                                        <img
                                                            src={`/storage/${user.profile_picture}`}
                                                            alt={user.name}
                                                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-600 rounded-full flex-shrink-0">
                                                            <span className="text-sm font-medium text-white">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                                                        {user.position && (
                                                            <p className="text-sm text-gray-600 truncate">{user.position}</p>
                                                        )}
                                                        {user.department && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                                <Briefcase className="h-3 w-3" />
                                                                {user.department}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                        <span className="text-sm text-gray-700 truncate">{user.email}</span>
                                                    </div>
                                                    {user.phone_number && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                            <span className="text-sm text-gray-600">{user.phone_number}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles && user.roles.length > 0 ? (
                                                        user.roles.map((role) => (
                                                            <Badge key={role.id} className="bg-purple-100 text-purple-700 border-purple-200 border text-xs whitespace-nowrap">
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                {role.name}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">No roles assigned</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600 whitespace-nowrap">
                                                        {new Date(user.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="align-middle">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handleApprove(user)}
                                                    >
                                                        <UserCheck className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                                        onClick={() => handleReject(user)}
                                                    >
                                                        <UserX className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="p-4 bg-green-100 rounded-full mb-4">
                                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                                </div>
                                                <p className="text-gray-900 font-medium text-lg mb-1">All caught up!</p>
                                                <p className="text-gray-500 text-sm">
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
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{users.from}</span> to{' '}
                                <span className="font-medium">{users.to}</span> of{' '}
                                <span className="font-medium">{users.total}</span> results
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(users.prev_page_url)}
                                    disabled={!users.prev_page_url}
                                    className="h-9"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(users.next_page_url)}
                                    disabled={!users.next_page_url}
                                    className="h-9"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
