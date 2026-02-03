// resources/js/Pages/Admin/Leaves/Types.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    Edit,
    FileText,
    MoreVertical,
    Plus,
    Power,
    Search,
    Settings,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Types({ auth, leaveTypes, stats, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [paymentType, setPaymentType] = useState(
        filters?.payment_type || 'all',
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const { flash } = usePage().props;

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search };

        if (status && status !== 'all') params.status = status;
        if (paymentType && paymentType !== 'all')
            params.payment_type = paymentType;

        router.get(route('leave-types.index'), params, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setPaymentType('all');
        router.get(route('leave-types.index'));
    };

    const openDeleteDialog = (leaveType) => {
        setSelectedType(leaveType);
        setDeleteDialogOpen(true);
    };

    const openToggleDialog = (leaveType) => {
        setSelectedType(leaveType);
        setToggleDialogOpen(true);
    };

    const handleDelete = () => {
        if (selectedType) {
            router.delete(route('leave-types.destroy', selectedType.id), {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSelectedType(null);
                },
            });
        }
    };

    const handleToggle = () => {
        if (selectedType) {
            router.patch(
                route('leave-types.toggle', selectedType.id),
                {},
                {
                    onSuccess: () => {
                        setToggleDialogOpen(false);
                        setSelectedType(null);
                    },
                },
            );
        }
    };

    const hasFilters = search || status !== 'all' || paymentType !== 'all';

    // Get icon component dynamically (simplified version)
    const getIconComponent = (iconName) => {
        const icons = {
            Calendar: Calendar,
            Clock: Clock,
            FileText: FileText,
            Settings: Settings,
        };
        return icons[iconName] || Calendar;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2">
                            <Settings className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Leave Types
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Configure and manage leave type policies
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            asChild
                            variant="outline"
                            className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                            <Link href={route('leaves.index')}>
                                <Calendar className="mr-2 h-4 w-4" />
                                View Leave Requests
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Link href={route('leave-types.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Leave Type
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Leave Types Management" />

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
                        <X className="h-4 w-4 text-red-600" />
                        <AlertDescription className="font-medium text-red-800">
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                <div className="animate-fade-in grid grid-cols-1 gap-6 md:grid-cols-5">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Types
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                        {stats?.total || 0}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-purple-100 p-3">
                                    <Settings className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Active
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-green-600">
                                        {stats?.active || 0}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-green-100 p-3">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Inactive
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-gray-600">
                                        {stats?.inactive || 0}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-gray-100 p-3">
                                    <Power className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Paid Types
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-blue-600">
                                        {stats?.paid || 0}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Days/Year
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-orange-600">
                                        {stats?.total_days_per_year || 0}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-orange-100 p-3">
                                    <Calendar className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Card */}
                <Card className="animate-fade-in animation-delay-100 shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, code, or description..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-11 pl-10 text-base"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="min-w-[200px] flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <Select
                                        value={status}
                                        onValueChange={setStatus}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Status
                                            </SelectItem>
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Inactive
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="min-w-[200px] flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Payment Type
                                    </label>
                                    <Select
                                        value={paymentType}
                                        onValueChange={setPaymentType}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Types
                                            </SelectItem>
                                            <SelectItem value="paid">
                                                Paid
                                            </SelectItem>
                                            <SelectItem value="unpaid">
                                                Unpaid
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        className="h-10 bg-purple-600 hover:bg-purple-700"
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
                                    {leaveTypes?.total || 0}
                                </span>{' '}
                                {leaveTypes?.total === 1 ? 'type' : 'types'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="animate-fade-in animation-delay-200 shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold">
                                        Leave Type
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Code
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Days/Year
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Payment
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Carry Over
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Medical Cert
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Approval Flow
                                    </TableHead>
                                    <TableHead className="text-center font-semibold">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveTypes &&
                                leaveTypes.data &&
                                leaveTypes.data.length > 0 ? (
                                    leaveTypes.data.map((type, index) => (
                                        <TableRow
                                            key={type.id}
                                            className={`animate-fade-in-up hover:bg-gray-50 animation-delay-${Math.min((index + 3) * 100, 900)}`}
                                        >
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                                                        style={{
                                                            backgroundColor: `${type.color}20`,
                                                        }}
                                                    >
                                                        <div
                                                            className="h-6 w-6 rounded"
                                                            style={{
                                                                backgroundColor:
                                                                    type.color,
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {type.name}
                                                        </p>
                                                        {type.description && (
                                                            <p className="max-w-xs truncate text-xs text-gray-500">
                                                                {
                                                                    type.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono"
                                                >
                                                    {type.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold text-gray-900">
                                                    {type.days_per_year}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {type.is_paid ? (
                                                    <Badge className="border border-green-200 bg-green-100 text-green-700">
                                                        Paid
                                                    </Badge>
                                                ) : (
                                                    <Badge className="border border-gray-200 bg-gray-100 text-gray-700">
                                                        Unpaid
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {type.is_carry_over_allowed ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        {type.max_carry_over_days && (
                                                            <span className="text-xs text-gray-500">
                                                                Max{' '}
                                                                {
                                                                    type.max_carry_over_days
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <X className="mx-auto h-4 w-4 text-gray-400" />
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {type.requires_medical_cert ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                                        {type.medical_cert_days_threshold && (
                                                            <span className="text-xs text-gray-500">
                                                                &gt;{' '}
                                                                {
                                                                    type.medical_cert_days_threshold
                                                                }{' '}
                                                                days
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <X className="mx-auto h-4 w-4 text-gray-400" />
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1 text-xs">
                                                    {type.requires_manager_approval && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            Manager
                                                        </Badge>
                                                    )}
                                                    {type.requires_hr_approval && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            HR
                                                        </Badge>
                                                    )}
                                                    {!type.requires_manager_approval &&
                                                        !type.requires_hr_approval && (
                                                            <span className="text-gray-400">
                                                                None
                                                            </span>
                                                        )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {type.is_active ? (
                                                    <Badge className="border border-green-200 bg-green-100 text-green-700">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge className="border border-gray-200 bg-gray-100 text-gray-700">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-48"
                                                    >
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'leave-types.edit',
                                                                    type.id,
                                                                )}
                                                                className="cursor-pointer"
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Type
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openToggleDialog(
                                                                    type,
                                                                )
                                                            }
                                                            className="cursor-pointer"
                                                        >
                                                            <Power className="mr-2 h-4 w-4" />
                                                            {type.is_active
                                                                ? 'Deactivate'
                                                                : 'Activate'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                openDeleteDialog(
                                                                    type,
                                                                )
                                                            }
                                                            className="cursor-pointer text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Type
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="mb-4 rounded-full bg-gray-100 p-4">
                                                    <Settings className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="mb-1 text-lg font-medium text-gray-900">
                                                    No leave types found
                                                </p>
                                                <p className="mb-4 text-sm text-gray-500">
                                                    {hasFilters
                                                        ? 'Try adjusting your filters'
                                                        : 'Get started by creating your first leave type'}
                                                </p>
                                                {!hasFilters && (
                                                    <Button
                                                        asChild
                                                        className="bg-purple-600 hover:bg-purple-700"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'leave-types.create',
                                                            )}
                                                        >
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Add Leave Type
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {leaveTypes &&
                        leaveTypes.data &&
                        leaveTypes.data.length > 0 && (
                            <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-700">
                                        Showing{' '}
                                        <span className="font-medium">
                                            {leaveTypes.from}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-medium">
                                            {leaveTypes.to}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium">
                                            {leaveTypes.total}
                                        </span>{' '}
                                        results
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(leaveTypes.prev_page_url)
                                        }
                                        disabled={!leaveTypes.prev_page_url}
                                        className="h-9"
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(leaveTypes.next_page_url)
                                        }
                                        disabled={!leaveTypes.next_page_url}
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Leave Type</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{selectedType?.name}</strong>? This action
                            cannot be undone and will affect all related leave
                            balances and requests.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setSelectedType(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Toggle Active/Inactive Dialog */}
            <AlertDialog
                open={toggleDialogOpen}
                onOpenChange={setToggleDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {selectedType?.is_active
                                ? 'Deactivate'
                                : 'Activate'}{' '}
                            Leave Type
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedType?.is_active ? (
                                <>
                                    Are you sure you want to deactivate{' '}
                                    <strong>{selectedType?.name}</strong>?
                                    Employees will no longer be able to request
                                    this leave type.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to activate{' '}
                                    <strong>{selectedType?.name}</strong>?
                                    Employees will be able to request this leave
                                    type.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setSelectedType(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleToggle}
                            className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-600"
                        >
                            {selectedType?.is_active
                                ? 'Deactivate'
                                : 'Activate'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
