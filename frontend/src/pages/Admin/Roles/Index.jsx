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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    LayoutGrid,
    List,
    Lock,
    MoreHorizontal,
    Plus,
    Search,
    Shield,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, roles, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const { flash } = usePage().props;

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('roles.index'),
            { search },
            {
                preserveState: true,
            },
        );
    };

    const handleReset = () => {
        setSearch('');
        router.get(route('roles.index'));
    };

    const handleDelete = (role) => {
        setRoleToDelete(role);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (roleToDelete) {
            router.delete(route('roles.destroy', roleToDelete.id));
        }
    };

    const hasFilters = search;

    const isProtectedRole = (slug) => {
        return ['super-admin', 'admin'].includes(slug);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Role Management
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Create and manage roles and their permissions
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
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
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
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : ''
                                }
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                Cards
                            </Button>
                        </div>
                        <Button
                            asChild
                            className="bg-purple-600 text-white hover:bg-purple-700"
                        >
                            <Link href={route('roles.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Role
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Roles" />

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

                {/* Filters */}
                <Card className="animate-fade-in animation-delay-100 shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by role name, slug, or description..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-11 pl-10"
                                />
                            </div>

                            <div className="flex items-end justify-between">
                                <div className="border-t pt-2 text-sm text-gray-600">
                                    Showing{' '}
                                    <span className="font-semibold text-gray-900">
                                        {roles.total}
                                    </span>{' '}
                                    {roles.total === 1 ? 'role' : 'roles'}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        className="h-10 bg-purple-600 text-white hover:bg-purple-700"
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
                        </form>
                    </CardContent>
                </Card>

                {/* Table View */}
                {viewMode === 'table' ? (
                    <Card className="animate-fade-in animation-delay-200 shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b-2 bg-gray-50 hover:bg-gray-50">
                                        <TableHead className="h-12 font-semibold text-gray-700">
                                            Role
                                        </TableHead>
                                        <TableHead className="h-12 font-semibold text-gray-700">
                                            Description
                                        </TableHead>
                                        <TableHead className="h-12 text-center font-semibold text-gray-700">
                                            Users
                                        </TableHead>
                                        <TableHead className="h-12 text-center font-semibold text-gray-700">
                                            Permissions
                                        </TableHead>
                                        <TableHead className="h-12 font-semibold text-gray-700">
                                            Created
                                        </TableHead>
                                        <TableHead className="h-12 text-center font-semibold text-gray-700">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.data.length > 0 ? (
                                        roles.data.map((role, index) => (
                                            <TableRow
                                                key={role.id}
                                                className="animate-fade-in border-b hover:bg-gray-50"
                                                style={{
                                                    animationDelay: `${index * 30}ms`,
                                                }}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-lg bg-purple-100 p-2">
                                                            <Shield className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-semibold text-gray-900">
                                                                    {role.name}
                                                                </div>
                                                                {isProtectedRole(
                                                                    role.slug,
                                                                ) && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="bg-yellow-100 text-yellow-700"
                                                                    >
                                                                        System
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {role.slug}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-md text-sm text-gray-600">
                                                        {role.description ||
                                                            'No description'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-blue-100 text-blue-700"
                                                    >
                                                        <Users className="mr-1 h-3 w-3" />
                                                        {role.users_count}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-green-100 text-green-700"
                                                    >
                                                        <Lock className="mr-1 h-3 w-3" />
                                                        {role.permissions_count}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-gray-600">
                                                        {new Date(
                                                            role.created_at,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
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
                                                                onClick={() =>
                                                                    router.visit(
                                                                        route(
                                                                            'roles.show',
                                                                            role.id,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    router.visit(
                                                                        route(
                                                                            'roles.edit',
                                                                            role.id,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Role
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    router.visit(
                                                                        route(
                                                                            'roles.permissions.edit',
                                                                            role.id,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                <Lock className="mr-2 h-4 w-4" />
                                                                Manage
                                                                Permissions
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        role,
                                                                    )
                                                                }
                                                                className="text-red-600 focus:text-red-600"
                                                                disabled={isProtectedRole(
                                                                    role.slug,
                                                                )}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Role
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-32 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <Shield className="mb-2 h-12 w-12 text-gray-400" />
                                                    <p className="text-lg font-medium">
                                                        No roles found
                                                    </p>
                                                    <p className="text-sm">
                                                        {hasFilters
                                                            ? 'Try adjusting your search'
                                                            : 'Get started by creating a new role'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                ) : (
                    /* Card View */
                    <div className="animate-fade-in animation-delay-200 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {roles.data.length > 0 ? (
                            roles.data.map((role, index) => (
                                <Card
                                    key={role.id}
                                    className="animate-fade-in shadow-sm transition-shadow hover:shadow-md"
                                    style={{
                                        animationDelay: `${index * 30}ms`,
                                    }}
                                >
                                    <CardContent className="p-6">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-purple-100 p-2">
                                                    <Shield className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900">
                                                            {role.name}
                                                        </h3>
                                                        {isProtectedRole(
                                                            role.slug,
                                                        ) && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-yellow-100 text-yellow-700"
                                                            >
                                                                System
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {role.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                                            {role.description ||
                                                'No description'}
                                        </p>

                                        <div className="mb-4 flex gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="bg-blue-100 text-blue-700"
                                            >
                                                <Users className="mr-1 h-3 w-3" />
                                                {role.users_count}{' '}
                                                {role.users_count === 1
                                                    ? 'user'
                                                    : 'users'}
                                            </Badge>
                                            <Badge
                                                variant="secondary"
                                                className="bg-green-100 text-green-700"
                                            >
                                                <Lock className="mr-1 h-3 w-3" />
                                                {role.permissions_count}{' '}
                                                {role.permissions_count === 1
                                                    ? 'permission'
                                                    : 'permissions'}
                                            </Badge>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() =>
                                                    router.visit(
                                                        route(
                                                            'roles.show',
                                                            role.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                                                onClick={() =>
                                                    router.visit(
                                                        route(
                                                            'roles.edit',
                                                            role.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Button>
                                            {!isProtectedRole(role.slug) && (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleDelete(role)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                                <Shield className="mb-2 h-12 w-12 text-gray-400" />
                                <p className="text-lg font-medium">
                                    No roles found
                                </p>
                                <p className="text-sm">
                                    {hasFilters
                                        ? 'Try adjusting your search'
                                        : 'Get started by creating a new role'}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {roles.last_page > 1 && (
                    <Card className="animate-fade-in animation-delay-300 shadow-sm">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing {roles.from} to {roles.to} of{' '}
                                    {roles.total} roles
                                </div>
                                <div className="flex gap-2">
                                    {roles.links.map((link, index) => {
                                        if (link.label.includes('Previous')) {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() =>
                                                        router.get(link.url)
                                                    }
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                            );
                                        }
                                        if (link.label.includes('Next')) {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() =>
                                                        router.get(link.url)
                                                    }
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            );
                                        }
                                        return (
                                            <Button
                                                key={index}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() =>
                                                    router.get(link.url)
                                                }
                                                className={
                                                    link.active
                                                        ? 'bg-purple-600 hover:bg-purple-700'
                                                        : ''
                                                }
                                            >
                                                {link.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setRoleToDelete(null);
                }}
                onConfirm={confirmDelete}
                title={`Delete Role: ${roleToDelete?.name || ''}`}
                message={
                    roleToDelete?.users_count > 0
                        ? `This role is assigned to ${roleToDelete.users_count} user(s). Deleting this role will remove it from all assigned users. Are you sure you want to proceed?`
                        : 'This action cannot be undone. Are you sure you want to delete this role?'
                }
                confirmText="Delete Role"
                warning={roleToDelete?.users_count > 0}
            />
        </AuthenticatedLayout>
    );
}
