// resources/js/Pages/Inventory/Index.jsx
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
    AlertTriangle,
    Barcode,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    Laptop,
    MoreVertical,
    Package,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, items, categories, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [assetType, setAssetType] = useState(filters.asset_type || 'all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const { flash } = usePage().props;

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search };

        if (category && category !== 'all') params.category = category;
        if (status && status !== 'all') params.status = status;
        if (assetType && assetType !== 'all') params.asset_type = assetType;

        router.get(route('inventory.index'), params, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setCategory('all');
        setStatus('all');
        setAssetType('all');
        router.get(route('inventory.index'));
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            router.delete(route('inventory.destroy', itemToDelete.id));
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-700 border border-green-200',
            discontinued: 'bg-gray-100 text-gray-700 border border-gray-200',
            out_of_stock: 'bg-red-100 text-red-700 border border-red-200',
        };
        return (
            styles[status] || 'bg-gray-100 text-gray-700 border border-gray-200'
        );
    };

    const getAssetTypeBadge = (type) => {
        const styles = {
            asset: 'bg-blue-100 text-blue-700 border border-blue-200',
            consumable:
                'bg-purple-100 text-purple-700 border border-purple-200',
        };
        return (
            styles[type] || 'bg-gray-100 text-gray-700 border border-gray-200'
        );
    };

    const hasFilters =
        search || category !== 'all' || status !== 'all' || assetType !== 'all';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Inventory Management
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Manage all inventory items and assets
                            </p>
                        </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href={route('inventory.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Item
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Inventory" />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="animate-fade-in mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="font-medium text-green-800">
                        {flash.success}
                    </p>
                </div>
            )}
            {flash?.error && (
                <div className="animate-fade-in mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="font-medium text-red-800">{flash.error}</p>
                </div>
            )}

            <div className="space-y-6">
                {/* Filters Card */}
                <Card className="animate-fade-in shadow-sm">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Search Bar - Full Width */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, SKU, barcode, or serial number..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-11 pl-10 text-base"
                                />
                            </div>

                            {/* Filters Row - Inline with Buttons */}
                            <div className="flex flex-wrap items-end gap-3">
                                {/* Category Filter */}
                                <div className="min-w-[200px] flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Category
                                    </label>
                                    <Select
                                        value={category}
                                        onValueChange={setCategory}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Categories
                                            </SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem
                                                    key={cat.id}
                                                    value={cat.id.toString()}
                                                >
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status Filter */}
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
                                            <SelectItem value="discontinued">
                                                Discontinued
                                            </SelectItem>
                                            <SelectItem value="out_of_stock">
                                                Out of Stock
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Asset Type Filter */}
                                <div className="min-w-[200px] flex-1 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Asset Type
                                    </label>
                                    <Select
                                        value={assetType}
                                        onValueChange={setAssetType}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Types
                                            </SelectItem>
                                            <SelectItem value="asset">
                                                Asset
                                            </SelectItem>
                                            <SelectItem value="consumable">
                                                Consumable
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        type="submit"
                                        className="h-10 bg-blue-600 hover:bg-blue-700"
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

                            {/* Results Count */}
                            <div className="border-t pt-2 text-sm text-gray-600">
                                Showing{' '}
                                <span className="font-semibold text-gray-900">
                                    {items.total}
                                </span>{' '}
                                {items.total === 1 ? 'item' : 'items'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table Card */}
                <Card className="animate-fade-in animation-delay-200 shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold">
                                        Item Details
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        SKU / Barcode
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Category
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Stock
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Type
                                    </TableHead>
                                    <TableHead className="font-semibold">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-right font-semibold">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.data.length > 0 ? (
                                    items.data.map((item, index) => (
                                        <TableRow
                                            key={item.id}
                                            className={`animate-fade-in-up hover:bg-gray-50 animation-delay-${Math.min((index + 3) * 100, 900)}`}
                                        >
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-blue-50 p-2">
                                                        <Package className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {item.name}
                                                        </p>
                                                        {item.manufacturer && (
                                                            <p className="mt-0.5 text-sm text-gray-500">
                                                                {
                                                                    item.manufacturer
                                                                }{' '}
                                                                {item.model}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-mono text-sm font-medium text-gray-900">
                                                        {item.sku}
                                                    </p>
                                                    {item.barcode && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Barcode className="h-3.5 w-3.5" />
                                                            <span className="font-mono">
                                                                {item.barcode}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.category ? (
                                                    <span
                                                        className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium"
                                                        style={{
                                                            backgroundColor:
                                                                item.category
                                                                    .color +
                                                                '15',
                                                            color: item.category
                                                                .color,
                                                            borderColor:
                                                                item.category
                                                                    .color +
                                                                '40',
                                                        }}
                                                    >
                                                        {item.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.asset_type === 'asset' ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">
                                                                Total:
                                                            </span>
                                                            <span className="font-semibold text-gray-900">
                                                                {item.assets
                                                                    ?.length ||
                                                                    0}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">
                                                                Available:
                                                            </span>
                                                            <span className="font-semibold text-green-600">
                                                                {item.assets?.filter(
                                                                    (a) =>
                                                                        a.status ===
                                                                        'Available',
                                                                ).length || 0}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">
                                                                Assigned:
                                                            </span>
                                                            <span className="font-semibold text-blue-600">
                                                                {item.assets?.filter(
                                                                    (a) =>
                                                                        a.status ===
                                                                        'Assigned',
                                                                ).length || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span
                                                                    className={`font-semibold ${item.quantity <= item.min_quantity ? 'text-red-600' : 'text-gray-900'}`}
                                                                >
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                                <span className="text-sm text-gray-400">
                                                                    /{' '}
                                                                    {
                                                                        item.min_quantity
                                                                    }
                                                                </span>
                                                            </div>
                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                {item.unit}
                                                            </p>
                                                        </div>
                                                        {item.quantity <=
                                                            item.min_quantity && (
                                                            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500" />
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${getAssetTypeBadge(item.asset_type)}`}
                                                >
                                                    {item.asset_type}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${getStatusBadge(item.status)}`}
                                                >
                                                    {item.status.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
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
                                                                    'inventory.show',
                                                                    item.id,
                                                                )}
                                                                className="flex cursor-pointer items-center"
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {item.asset_type ===
                                                            'asset' && (
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'individual-assets.index',
                                                                        {
                                                                            inventory_item_id:
                                                                                item.id,
                                                                        },
                                                                    )}
                                                                    className="flex cursor-pointer items-center"
                                                                >
                                                                    <Laptop className="mr-2 h-4 w-4" />
                                                                    View Assets
                                                                    (
                                                                    {item.assets
                                                                        ?.length ||
                                                                        0}
                                                                    )
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'inventory.edit',
                                                                    item.id,
                                                                )}
                                                                className="flex cursor-pointer items-center"
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item,
                                                                )
                                                            }
                                                            className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="mb-4 rounded-full bg-gray-100 p-4">
                                                    <Package className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="mb-1 text-lg font-medium text-gray-900">
                                                    No inventory items found
                                                </p>
                                                <p className="mb-4 text-sm text-gray-500">
                                                    Get started by adding your
                                                    first item
                                                </p>
                                                <Button
                                                    asChild
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Link
                                                        href={route(
                                                            'inventory.create',
                                                        )}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Item
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
                    {items.data.length > 0 && (
                        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {items.from}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {items.to}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium">
                                        {items.total}
                                    </span>{' '}
                                    results
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(items.prev_page_url)
                                    }
                                    disabled={!items.prev_page_url}
                                    className="h-9"
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(items.next_page_url)
                                    }
                                    disabled={!items.next_page_url}
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

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName={itemToDelete?.name}
            />
        </AuthenticatedLayout>
    );
}
