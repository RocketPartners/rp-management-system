// resources/js/Pages/Users/Index.jsx
import { useState } from 'react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import {
    Users as UsersIcon,
    Plus,
    Upload,
    Search,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    Mail,
    Shield,
    Laptop,
    LayoutGrid,
    List,
    Phone,
    Briefcase,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    UserCheck,
    UserX,
    ArrowRight,
} from 'lucide-react';

export default function Index({ auth, users, roles, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [accountStatus, setAccountStatus] = useState(filters.account_status || 'all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const { flash } = usePage().props;

    // Calculate pending count
    const pendingCount = users.data.filter(u => u.account_status === 'pending').length;

    // Check if current user can approve (Super Admin, Admin, or HR Manager)
    const canApprove = auth.user.roles?.some(role => 
        ['super-admin', 'admin', 'hr-manager'].includes(role.slug)
    );

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search };
        
        if (role && role !== 'all') params.role = role;
        if (accountStatus && accountStatus !== 'all') params.account_status = accountStatus;
        
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
        router.post(route('users.approve', user.id), {}, {
            preserveScroll: true,
        });
    };

    const handleReject = (user) => {
        router.post(route('users.reject', user.id), {}, {
            preserveScroll: true,
        });
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
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
            'active': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2 },
            'rejected': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
            'suspended': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: AlertCircle },
        };
        return styles[status] || styles.active;
    };

    const hasFilters = search || role !== 'all' || accountStatus !== 'all';

    // Get counts for each status
    const statusCounts = {
        all: users.total,
        pending: users.data.filter(u => u.account_status === 'pending').length,
        active: users.data.filter(u => u.account_status === 'active').length,
        rejected: users.data.filter(u => u.account_status === 'rejected').length,
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <UsersIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
                            <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex border rounded-lg p-1 bg-white">
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={viewMode === 'table' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                            >
                                <List className="h-4 w-4 mr-2" />
                                Table
                            </Button>
                            <Button
                                variant={viewMode === 'card' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('card')}
                                className={viewMode === 'card' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" />
                                Cards
                            </Button>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={route('users.import')}>
                                <Upload className="h-4 w-4 mr-2" />
                                Import Users
                            </Link>
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Link href={route('users.create')}>
                                <Plus className="h-4 w-4 mr-2" />
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

                {/* 🎯 PENDING USERS ALERT BANNER */}
                {canApprove && pendingCount > 0 && (
                    <Alert className="bg-yellow-50 border-yellow-300 animate-fade-in">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <AlertDescription className="flex items-center justify-between">
                            <span className="text-yellow-800 font-medium">
                                <strong>{pendingCount}</strong> {pendingCount === 1 ? 'user' : 'users'} waiting for approval
                            </span>
                            <Button 
                                size="sm" 
                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                onClick={() => handleQuickFilter('pending')}
                            >
                                View Pending
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* 🎯 QUICK FILTER TABS */}
                <div className="flex gap-2 overflow-x-auto pb-2 animate-fade-in animation-delay-100">
                    <Button
                        variant={accountStatus === 'all' ? 'default' : 'outline'}
                        onClick={() => handleQuickFilter('all')}
                        className={accountStatus === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                        All Users
                        <Badge variant="secondary" className="ml-2 bg-white text-gray-900">
                            {statusCounts.all}
                        </Badge>
                    </Button>
                    
                    <Button
                        variant={accountStatus === 'pending' ? 'default' : 'outline'}
                        onClick={() => handleQuickFilter('pending')}
                        className={accountStatus === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'}
                    >
                        <Clock className="h-4 w-4 mr-2" />
                        Pending
                        {statusCounts.pending > 0 && (
                            <Badge className="ml-2 bg-yellow-600 text-white hover:bg-yellow-600">
                                {statusCounts.pending}
                            </Badge>
                        )}
                    </Button>
                    
                    <Button
                        variant={accountStatus === 'active' ? 'default' : 'outline'}
                        onClick={() => handleQuickFilter('active')}
                        className={accountStatus === 'active' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 text-green-700 hover:bg-green-50'}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Active
                        <Badge variant="secondary" className="ml-2 bg-white text-gray-900">
                            {statusCounts.active}
                        </Badge>
                    </Button>
                    
                    {statusCounts.rejected > 0 && (
                        <Button
                            variant={accountStatus === 'rejected' ? 'default' : 'outline'}
                            onClick={() => handleQuickFilter('rejected')}
                            className={accountStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'border-red-300 text-red-700 hover:bg-red-50'}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejected
                            <Badge variant="secondary" className="ml-2 bg-white text-gray-900">
                                {statusCounts.rejected}
                            </Badge>
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <Card className="shadow-sm animate-fade-in animation-delay-200">
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

                            <div className="flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[200px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Role</label>
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            {roles.map((r) => (
                                                <SelectItem key={r.id} value={r.id.toString()}>
                                                    {r.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2">
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
                            </div>

                            <div className="text-sm text-gray-600 pt-2 border-t">
                                Showing <span className="font-semibold text-gray-900">{users.total}</span> {users.total === 1 ? 'user' : 'users'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table View */}
                {viewMode === 'table' ? (
                    <Card className="shadow-sm animate-fade-in animation-delay-300">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-b-2">
                                        <TableHead className="font-semibold text-gray-700 h-12">User</TableHead>
                                        <TableHead className="font-semibold text-gray-700 h-12">Email</TableHead>
                                        <TableHead className="font-semibold text-gray-700 h-12">Account Status</TableHead>
                                        <TableHead className="font-semibold text-gray-700 h-12">Roles</TableHead>
                                        <TableHead className="font-semibold text-gray-700 h-12 text-center">Assets</TableHead>
                                        <TableHead className="font-semibold text-gray-700 h-12">Joined</TableHead>
                                        <TableHead className="font-semibold text-gray-700 h-12 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length > 0 ? (
                                        users.data.map((user, index) => {
                                            const statusStyle = getAccountStatusBadge(user.account_status);
                                            const StatusIcon = statusStyle.icon;
                                            const isPending = user.account_status === 'pending';

                                            return (
                                                <TableRow 
                                                    key={user.id} 
                                                    className={`hover:bg-gray-50 border-b ${isPending ? 'bg-yellow-50/30' : ''}`}
                                                >
                                                    <TableCell className="py-4 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            {user.profile_picture ? (
                                                                <img
                                                                    src={`/storage/${user.profile_picture}`}
                                                                    alt={user.name}
                                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full flex-shrink-0">
                                                                    <span className="text-sm font-medium text-white">
                                                                        {user.name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                                                {user.position && (
                                                                    <p className="text-xs text-gray-500 truncate">{user.position}</p>
                                                                )}
                                                                {user.id === auth.user.id && (
                                                                    <Badge className="bg-blue-100 text-blue-700 text-xs mt-0.5">You</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-middle">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                            <span className="text-sm text-gray-600 truncate">{user.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-middle">
                                                        <Badge className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border flex items-center gap-1.5 w-fit`}>
                                                            <StatusIcon className="h-3.5 w-3.5" />
                                                            {user.account_status.charAt(0).toUpperCase() + user.account_status.slice(1)}
                                                        </Badge>
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
                                                                <span className="text-gray-400 text-sm">No roles</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-middle text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Laptop className="h-4 w-4 text-gray-400" />
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {user.current_individual_assets?.length || 0}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="align-middle">
                                                        <span className="text-sm text-gray-600 whitespace-nowrap">
                                                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="align-middle text-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Open menu</span>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-56">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('users.show', user.id)} className="cursor-pointer">
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('users.edit', user.id)} className="cursor-pointer">
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit User
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                
                                                                {/* 🎯 APPROVE/REJECT OPTIONS (only for pending users) */}
                                                                {canApprove && isPending && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleApprove(user)}
                                                                            className="cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50"
                                                                        >
                                                                            <UserCheck className="mr-2 h-4 w-4" />
                                                                            Approve User
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleReject(user)}
                                                                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                        >
                                                                            <UserX className="mr-2 h-4 w-4" />
                                                                            Reject User
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                
                                                                {user.id !== auth.user.id && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleDelete(user)}
                                                                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
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
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                        <UsersIcon className="h-12 w-12 text-gray-400" />
                                                    </div>
                                                    <p className="text-gray-900 font-medium text-lg mb-1">No users found</p>
                                                    <p className="text-gray-500 text-sm mb-4">
                                                        {hasFilters ? 'Try adjusting your filters' : 'Add your first user to get started'}
                                                    </p>
                                                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                                                        <Link href={route('users.create')}>
                                                            <Plus className="h-4 w-4 mr-2" />
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
                ) : (
                    /* Card View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in animation-delay-300">
                        {users.data.length > 0 ? (
                            users.data.map((user, index) => {
                                const statusStyle = getAccountStatusBadge(user.account_status);
                                const StatusIcon = statusStyle.icon;
                                const isPending = user.account_status === 'pending';

                                return (
                                    <Card key={user.id} className={`hover:shadow-lg transition-shadow ${isPending ? 'border-yellow-300 border-2' : ''}`}>
                                        <CardContent className="pt-6">
                                            {/* 🎯 ACCOUNT STATUS BADGE (top-right) */}
                                            <div className="flex justify-end mb-2">
                                                <Badge className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border flex items-center gap-1.5`}>
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {user.account_status.charAt(0).toUpperCase() + user.account_status.slice(1)}
                                                </Badge>
                                            </div>

                                            {/* User Avatar & Name */}
                                            <div className="flex items-center gap-4 mb-4">
                                                {user.profile_picture ? (
                                                    <img
                                                        src={`/storage/${user.profile_picture}`}
                                                        alt={user.name}
                                                        className="w-16 h-16 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                                                        <span className="text-2xl font-medium text-white">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
                                                    {user.position && (
                                                        <p className="text-sm text-gray-600">{user.position}</p>
                                                    )}
                                                    {user.id === auth.user.id && (
                                                        <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">You</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-2 mb-4 pb-4 border-b">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="h-4 w-4" />
                                                    <span className="truncate">{user.email}</span>
                                                </div>
                                                {user.phone_number && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="h-4 w-4" />
                                                        <span>{user.phone_number}</span>
                                                    </div>
                                                )}
                                                {user.department && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Briefcase className="h-4 w-4" />
                                                        <span>{user.department}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Roles */}
                                            {user.roles && user.roles.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-xs text-gray-600 mb-2">Roles</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.map((role) => (
                                                            <Badge key={role.id} className="bg-purple-100 text-purple-700 border-purple-200 border text-xs">
                                                                {role.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Assets Count */}
                                            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Laptop className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">Assets</span>
                                                </div>
                                                <span className="text-lg font-bold text-gray-900">
                                                    {user.current_individual_assets?.length || 0}
                                                </span>
                                            </div>

                                            {/* 🎯 APPROVE/REJECT BUTTONS (for pending users in card view) */}
                                            {canApprove && isPending ? (
                                                <div className="flex gap-2 mb-3">
                                                    <Button 
                                                        size="sm" 
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handleApprove(user)}
                                                    >
                                                        <UserCheck className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                                        onClick={() => handleReject(user)}
                                                    >
                                                        <UserX className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            ) : null}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild className="flex-1">
                                                    <Link href={route('users.show', user.id)}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild className="flex-1">
                                                    <Link href={route('users.edit', user.id)}>
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                {user.id !== auth.user.id && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleDelete(user)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                                    <CardContent className="text-center py-16">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                <UsersIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <p className="text-gray-900 font-medium text-lg mb-1">No users found</p>
                                            <p className="text-gray-500 text-sm mb-4">
                                                {hasFilters ? 'Try adjusting your filters' : 'Add your first user to get started'}
                                            </p>
                                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                                                <Link href={route('users.create')}>
                                                    <Plus className="h-4 w-4 mr-2" />
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