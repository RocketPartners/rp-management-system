// resources/js/Pages/Inventory/Index.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
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
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    AlertTriangle,
    Barcode,
    ChevronLeft,
    ChevronRight,
    X,
    Laptop,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

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
        return styles[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    const getAssetTypeBadge = (type) => {
        const styles = {
            asset: 'bg-blue-100 text-blue-700 border border-blue-200',
            consumable: 'bg-purple-100 text-purple-700 border border-purple-200',
        };
        return styles[type] || 'bg-gray-100 text-gray-700 border border-gray-200';
    };

    const hasFilters = search || category !== 'all' || status !== 'all' || assetType !== 'all';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
                            <p className="text-gray-600 mt-1">Manage all inventory items and assets</p>
                        </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href={route('inventory.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Item
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Inventory" />

            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-green-800 font-medium">{flash.success}</p>
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-800 font-medium">{flash.error}</p>
                </div>
            )}

            <div className="space-y-6">
                {/* Filters Card */}
                <Card className="shadow-sm animate-fade-in">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Search Bar - Full Width */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, SKU, barcode, or serial number..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-11 text-base"
                                />
                            </div>

                            {/* Filters Row - Inline with Buttons */}
                            <div className="flex flex-wrap items-end gap-3">
                                {/* Category Filter */}
                                <div className="flex-1 min-w-[200px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Category</label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status Filter */}
                                <div className="flex-1 min-w-[200px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="discontinued">Discontinued</SelectItem>
                                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Asset Type Filter */}
                                <div className="flex-1 min-w-[200px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Asset Type</label>
                                    <Select value={assetType} onValueChange={setAssetType}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="asset">Asset</SelectItem>
                                            <SelectItem value="consumable">Consumable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-10">
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

                            {/* Results Count */}
                            <div className="text-sm text-gray-600 pt-2 border-t">
                                Showing <span className="font-semibold text-gray-900">{items.total}</span> {items.total === 1 ? 'item' : 'items'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table Card */}
                <Card className="shadow-sm animate-fade-in animation-delay-200">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold">Item Details</TableHead>
                                    <TableHead className="font-semibold">SKU / Barcode</TableHead>
                                    <TableHead className="font-semibold">Category</TableHead>
                                    <TableHead className="font-semibold">Stock</TableHead>
                                    <TableHead className="font-semibold">Type</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.data.length > 0 ? (
                                    items.data.map((item, index) => (
                                        <TableRow key={item.id} className={`hover:bg-gray-50 animate-fade-in-up animation-delay-${Math.min((index + 3) * 100, 900)}`}>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <Package className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.name}</p>
                                                        {item.manufacturer && (
                                                            <p className="text-sm text-gray-500 mt-0.5">
                                                                {item.manufacturer} {item.model}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-mono font-medium text-gray-900">{item.sku}</p>
                                                    {item.barcode && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <Barcode className="h-3.5 w-3.5" />
                                                            <span className="font-mono">{item.barcode}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {item.category ? (
                                                    <span 
                                                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border"
                                                        style={{ 
                                                            backgroundColor: item.category.color + '15',
                                                            color: item.category.color,
                                                            borderColor: item.category.color + '40'
                                                        }}
                                                    >
                                                        {item.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.asset_type === 'asset' ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">Total:</span>
                                                            <span className="font-semibold text-gray-900">{item.assets?.length || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">Available:</span>
                                                            <span className="font-semibold text-green-600">
                                                                {item.assets?.filter(a => a.status === 'Available').length || 0}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-600">Assigned:</span>
                                                            <span className="font-semibold text-blue-600">
                                                                {item.assets?.filter(a => a.status === 'Assigned').length || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`font-semibold ${item.quantity <= item.min_quantity ? 'text-red-600' : 'text-gray-900'}`}>
                                                                    {item.quantity}
                                                                </span>
                                                                <span className="text-gray-400 text-sm">/ {item.min_quantity}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5">{item.unit}</p>
                                                        </div>
                                                        {item.quantity <= item.min_quantity && (
                                                            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getAssetTypeBadge(item.asset_type)}`}>
                                                    {item.asset_type}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBadge(item.status)}`}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 transition-colors">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('inventory.show', item.id)} className="cursor-pointer flex items-center">
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {item.asset_type === 'asset' && (
                                                            <DropdownMenuItem asChild>
                                                                <Link 
                                                                    href={route('individual-assets.index', { inventory_item_id: item.id })} 
                                                                    className="cursor-pointer flex items-center"
                                                                >
                                                                    <Laptop className="h-4 w-4 mr-2" />
                                                                    View Assets ({item.assets?.length || 0})
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('inventory.edit', item.id)} className="cursor-pointer flex items-center">
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(item)}
                                                            className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-16">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                    <Package className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="text-gray-900 font-medium text-lg mb-1">No inventory items found</p>
                                                <p className="text-gray-500 text-sm mb-4">Get started by adding your first item</p>
                                                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                                    <Link href={route('inventory.create')}>
                                                        <Plus className="h-4 w-4 mr-2" />
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
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{items.from}</span> to{' '}
                                    <span className="font-medium">{items.to}</span> of{' '}
                                    <span className="font-medium">{items.total}</span> results
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(items.prev_page_url)}
                                    disabled={!items.prev_page_url}
                                    className="h-9"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(items.next_page_url)}
                                    disabled={!items.next_page_url}
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