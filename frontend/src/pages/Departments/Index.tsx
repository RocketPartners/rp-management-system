import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    Building2,
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
import { usePermission } from '@/hooks/usePermission';
import { apiGet, apiDelete } from '@/lib/spring-boot-api';
import type { DepartmentResponse, PagedResponse } from '@/types';

export default function DepartmentList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { can } = usePermission();

    const page = parseInt(searchParams.get('page') || '0');
    const size = 15;
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';

    const [searchInput, setSearchInput] = useState(search);
    const [deleteModal, setDeleteModal] = useState<{
        open: boolean;
        department: DepartmentResponse | null;
    }>({ open: false, department: null });

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['departments', page, size, search, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('size', String(size));
            if (search) params.set('search', search);
            if (statusFilter !== 'all') params.set('isActive', statusFilter);
            const res = await apiGet<PagedResponse<DepartmentResponse>>(
                `/departments?${params.toString()}`,
            );
            return res;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiDelete(`/departments/${id}`),
        onSuccess: () => {
            toast.success('Department deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            setDeleteModal({ open: false, department: null });
        },
        onError: () => {
            toast.error('Failed to delete department');
        },
    });

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

    const handleStatusChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === 'all') {
            params.delete('status');
        } else {
            params.set('status', value);
        }
        params.delete('page');
        setSearchParams(params);
    };

    const goToPage = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(newPage));
        setSearchParams(params);
    };

    const departments = data?.content || [];
    const totalPages = data?.totalPages || 0;
    const totalElements = data?.totalElements || 0;

    return (
        <>
            <Helmet>
                <title>Departments | HRIS</title>
            </Helmet>

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                        <p className="text-sm text-gray-500">
                            Manage organizational departments.
                        </p>
                    </div>
                    {can('departments.create') && (
                        <Link to="/departments/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Department
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search by name or code..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-9"
                        />
                        {searchInput && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        )}
                    </div>
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
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
                                    <TableHead>Code</TableHead>
                                    <TableHead>Manager</TableHead>
                                    <TableHead>Parent</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton className="h-5 w-24" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <Building2 className="mb-3 h-12 w-12 text-gray-300" />
                                                <p className="text-lg font-medium text-gray-900">
                                                    Failed to load departments
                                                </p>
                                                <p className="mb-4 text-sm text-gray-500">
                                                    Something went wrong. Please try again.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => refetch()}
                                                >
                                                    Try again
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : departments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <div className="flex flex-col items-center justify-center py-12">
                                                <Building2 className="mb-3 h-12 w-12 text-gray-300" />
                                                <p className="text-lg font-medium text-gray-900">
                                                    No departments found
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {search
                                                        ? 'Try adjusting your search.'
                                                        : 'Get started by creating a department.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    departments.map((dept) => (
                                        <TableRow key={dept.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                                                        <Building2 className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">
                                                        {dept.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                                                    {dept.code}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {dept.managerName || '—'}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {dept.parentName || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        dept.isActive
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className={
                                                        dept.isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }
                                                >
                                                    {dept.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>
                                                            Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {can('departments.edit') && (
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    to={`/departments/${dept.id}/edit`}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {can('departments.delete') && (
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() =>
                                                                    setDeleteModal({
                                                                        open: true,
                                                                        department: dept,
                                                                    })
                                                                }
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {page * size + 1}–
                            {Math.min((page + 1) * size, totalElements)} of{' '}
                            {totalElements}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 0}
                                onClick={() => goToPage(page - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages - 1}
                                onClick={() => goToPage(page + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, department: null })}
                onConfirm={() => {
                    if (deleteModal.department)
                        deleteMutation.mutate(deleteModal.department.id);
                }}
                title="Delete Department"
                description={`Are you sure you want to delete "${deleteModal.department?.name}"? This action cannot be undone.`}
            />
        </>
    );
}
