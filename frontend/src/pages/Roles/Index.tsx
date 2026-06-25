/**
 * Roles Management Page
 * Ported from monolith's Admin/Roles/Index.jsx
 * Lists roles with search, table/card views, create/edit dialog, delete
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    LayoutGrid,
    List,
    Lock,
    Loader2,
    MoreHorizontal,
    Plus,
    Search,
    Shield,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { usePermission } from '@/hooks/use-permission';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/spring-boot-api';

interface PermissionResponse {
    id: number;
    name: string;
    description?: string;
}

interface RoleResponse {
    id: number;
    name: string;
    description?: string;
    permissions: PermissionResponse[];
    createdAt: string;
    updatedAt: string;
}

interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

const PROTECTED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'];

export default function RoleList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { can } = usePermission();

    const page = parseInt(searchParams.get('page') || '0');
    const size = 15;
    const search = searchParams.get('search') || '';

    const [searchInput, setSearchInput] = useState(search);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        role: RoleResponse | null;
    }>({ isOpen: false, role: null });
    const [editDialog, setEditDialog] = useState<{
        open: boolean;
        role: RoleResponse | null;
    }>({ open: false, role: null });
    const [showDialog, setShowDialog] = useState<{
        open: boolean;
        role: RoleResponse | null;
    }>({ open: false, role: null });

    // Fetch roles
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['roles', page, size, search],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('size', String(size));
            if (search) params.set('search', search);
            return apiGet<PagedResponse<RoleResponse>>(`/roles?${params.toString()}`);
        },
    });

    // Fetch all permissions (for create/edit dialog)
    const { data: allPermissions } = useQuery({
        queryKey: ['permissions-all'],
        queryFn: () => apiGet<PermissionResponse[]>('/permissions/all'),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiDelete(`/roles/${id}`),
        onSuccess: () => {
            toast.success('Role deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            setDeleteModal({ isOpen: false, role: null });
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to delete role'),
    });

    // Search handlers
    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        if (searchInput) {
            params.set('search', searchInput);
        } else {
            params.delete('search');
        }
        params.delete('page');
        setSearchParams(params);
    };

    const clearSearch = () => {
        setSearchInput('');
        const params = new URLSearchParams(searchParams);
        params.delete('search');
        params.delete('page');
        setSearchParams(params);
    };

    const goToPage = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(newPage));
        setSearchParams(params);
    };

    const isProtected = (name: string) => PROTECTED_ROLES.includes(name);

    const roles = data?.content || [];
    const totalPages = data?.totalPages || 0;
    const totalElements = data?.totalElements || 0;

    return (
        <>
            <Helmet><title>Roles | HRIS</title></Helmet>

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                            <p className="text-sm text-gray-500">
                                Create and manage roles and their permissions
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex rounded-lg border bg-white p-1">
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={viewMode === 'table' ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}
                            >
                                <List className="mr-2 h-4 w-4" />
                                Table
                            </Button>
                            <Button
                                variant={viewMode === 'card' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('card')}
                                className={viewMode === 'card' ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                Cards
                            </Button>
                        </div>
                        {can('ROLE_CREATE') && (
                            <Button
                                className="bg-purple-600 text-white hover:bg-purple-700"
                                onClick={() => setEditDialog({ open: true, role: null })}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Role
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search by role name..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9"
                                />
                                {searchInput && (
                                    <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <X className="h-4 w-4 text-gray-400" />
                                    </button>
                                )}
                            </div>
                            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>
                        <div className="mt-3 border-t pt-2 text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{totalElements}</span>{' '}
                            {totalElements === 1 ? 'role' : 'roles'}
                        </div>
                    </CardContent>
                </Card>

                {/* Table View */}
                {viewMode === 'table' ? (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold">Role</TableHead>
                                        <TableHead className="font-semibold">Description</TableHead>
                                        <TableHead className="text-center font-semibold">Permissions</TableHead>
                                        <TableHead className="font-semibold">Created</TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                {Array.from({ length: 5 }).map((_, j) => (
                                                    <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : isError ? (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <div className="flex flex-col items-center justify-center py-12">
                                                    <Shield className="mb-3 h-12 w-12 text-gray-300" />
                                                    <p className="text-lg font-medium">Failed to load roles</p>
                                                    <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try again</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : roles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <div className="flex flex-col items-center justify-center py-12">
                                                    <Shield className="mb-3 h-12 w-12 text-gray-300" />
                                                    <p className="text-lg font-medium">No roles found</p>
                                                    <p className="text-sm text-gray-500">
                                                        {search ? 'Try adjusting your search.' : 'Get started by creating a role.'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        roles.map((role) => (
                                            <TableRow key={role.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-lg bg-purple-100 p-2">
                                                            <Shield className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-gray-900">{role.name}</span>
                                                                {isProtected(role.name) && (
                                                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">System</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-600">{role.description || 'No description'}</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                        <Lock className="mr-1 h-3 w-3" />
                                                        {role.permissions?.length || 0}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-gray-600">
                                                        {new Date(role.createdAt).toLocaleDateString()}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => setShowDialog({ open: true, role })}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            {can('ROLE_UPDATE') && (
                                                                <DropdownMenuItem onClick={() => setEditDialog({ open: true, role })}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Role
                                                                </DropdownMenuItem>
                                                            )}
                                                            {can('ROLE_DELETE') && !isProtected(role.name) && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-red-600"
                                                                        onClick={() => setDeleteModal({ isOpen: true, role })}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete Role
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    /* Card View */
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i}><CardContent className="p-6"><Skeleton className="h-32" /></CardContent></Card>
                            ))
                        ) : roles.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12">
                                <Shield className="mb-3 h-12 w-12 text-gray-300" />
                                <p className="text-lg font-medium">No roles found</p>
                            </div>
                        ) : (
                            roles.map((role) => (
                                <Card key={role.id} className="transition-shadow hover:shadow-md">
                                    <CardContent className="p-6">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-lg bg-purple-100 p-2">
                                                    <Shield className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900">{role.name}</h3>
                                                        {isProtected(role.name) && (
                                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">System</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                                            {role.description || 'No description'}
                                        </p>
                                        <div className="mb-4">
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                <Lock className="mr-1 h-3 w-3" />
                                                {role.permissions?.length || 0} permissions
                                            </Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowDialog({ open: true, role })}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Button>
                                            {can('ROLE_UPDATE') && (
                                                <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => setEditDialog({ open: true, role })}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>
                                            )}
                                            {can('ROLE_DELETE') && !isProtected(role.name) && (
                                                <Button size="sm" variant="destructive" onClick={() => setDeleteModal({ isOpen: true, role })}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of {totalElements}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => goToPage(page - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <RoleDialog
                open={editDialog.open}
                role={editDialog.role}
                allPermissions={allPermissions || []}
                onClose={() => setEditDialog({ open: false, role: null })}
            />

            {/* View Details Dialog */}
            <RoleShowDialog
                open={showDialog.open}
                role={showDialog.role}
                onClose={() => setShowDialog({ open: false, role: null })}
            />

            {/* Delete Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, role: null })}
                onConfirm={() => {
                    if (deleteModal.role) deleteMutation.mutate(deleteModal.role.id);
                }}
                title="Delete Role"
                description={`Are you sure you want to delete "${deleteModal.role?.name}"? This action cannot be undone.`}
                itemName={deleteModal.role?.name}
            />
        </>
    );
}

// ============================================
// Create/Edit Dialog
// ============================================

function RoleDialog({
    open,
    role,
    allPermissions,
    onClose,
}: {
    open: boolean;
    role: RoleResponse | null;
    allPermissions: PermissionResponse[];
    onClose: () => void;
}) {
    const queryClient = useQueryClient();
    const isEditing = !!role;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());

    // Reset form when dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setName(role?.name || '');
            setDescription(role?.description || '');
            setSelectedPermissions(new Set(role?.permissions?.map((p) => p.id) || []));
        }
        if (!isOpen) onClose();
    };

    const createMutation = useMutation({
        mutationFn: (data: { name: string; description: string; permissionIds: number[] }) =>
            apiPost<RoleResponse>('/roles', data),
        onSuccess: () => {
            toast.success('Role created successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to create role'),
    });

    const updateMutation = useMutation({
        mutationFn: (data: { name: string; description: string; permissionIds: number[] }) =>
            apiPut<RoleResponse>(`/roles/${role!.id}`, data),
        onSuccess: () => {
            toast.success('Role updated successfully');
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            onClose();
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to update role'),
    });

    const handleSubmit = () => {
        const data = {
            name,
            description,
            permissionIds: Array.from(selectedPermissions),
        };
        if (isEditing) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const togglePermission = (id: number) => {
        setSelectedPermissions((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAll = () => setSelectedPermissions(new Set(allPermissions.map((p) => p.id)));
    const deselectAll = () => setSelectedPermissions(new Set());

    const isPending = createMutation.isPending || updateMutation.isPending;

    // Group permissions by prefix (e.g., USER_READ -> USER)
    const groupedPermissions = allPermissions.reduce<Record<string, PermissionResponse[]>>((acc, perm) => {
        const parts = perm.name.split('_');
        const group = parts.length > 1 ? parts.slice(0, -1).join('_') : perm.name;
        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
    }, {});

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Role' : 'Create Role'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update role details and permissions.' : 'Create a new role with specific permissions.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Role Name *</Label>
                        <Input
                            id="role-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., HR_MANAGER"
                            disabled={isEditing && PROTECTED_ROLES.includes(role?.name || '')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role-desc">Description</Label>
                        <Textarea
                            id="role-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of what this role can do..."
                            rows={2}
                        />
                    </div>

                    {/* Permissions */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Permissions ({selectedPermissions.size} selected)</Label>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={selectAll}>Select All</Button>
                                <Button type="button" variant="outline" size="sm" onClick={deselectAll}>Deselect All</Button>
                            </div>
                        </div>
                        <div className="max-h-64 space-y-4 overflow-y-auto rounded-lg border p-4">
                            {Object.entries(groupedPermissions).map(([group, perms]) => (
                                <div key={group}>
                                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        {group.replace(/_/g, ' ')}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {perms.map((perm) => (
                                            <label
                                                key={perm.id}
                                                className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-gray-50"
                                            >
                                                <Checkbox
                                                    checked={selectedPermissions.has(perm.id)}
                                                    onCheckedChange={() => togglePermission(perm.id)}
                                                />
                                                <span className="text-gray-700">{perm.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim() || isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {isPending ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                        ) : isEditing ? 'Update Role' : 'Create Role'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// View Details Dialog
// ============================================

function RoleShowDialog({
    open,
    role,
    onClose,
}: {
    open: boolean;
    role: RoleResponse | null;
    onClose: () => void;
}) {
    if (!role) return null;

    // Group permissions by prefix
    const groupedPermissions = (role.permissions || []).reduce<Record<string, PermissionResponse[]>>((acc, perm) => {
        const parts = perm.name.split('_');
        const group = parts.length > 1 ? parts.slice(0, -1).join('_') : perm.name;
        if (!acc[group]) acc[group] = [];
        acc[group].push(perm);
        return acc;
    }, {});

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-purple-600" />
                        {role.name}
                        {PROTECTED_ROLES.includes(role.name) && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">System</Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription>{role.description || 'No description'}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex gap-4 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Created:</span>{' '}
                            {new Date(role.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                            <span className="font-medium">Permissions:</span>{' '}
                            {role.permissions?.length || 0}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Assigned Permissions</h4>
                        {Object.keys(groupedPermissions).length > 0 ? (
                            <div className="max-h-64 space-y-3 overflow-y-auto rounded-lg border p-4">
                                {Object.entries(groupedPermissions).map(([group, perms]) => (
                                    <div key={group}>
                                        <h5 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            {group.replace(/_/g, ' ')}
                                        </h5>
                                        <div className="flex flex-wrap gap-1">
                                            {perms.map((perm) => (
                                                <Badge key={perm.id} variant="secondary" className="bg-green-100 text-green-700">
                                                    {perm.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No permissions assigned.</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
