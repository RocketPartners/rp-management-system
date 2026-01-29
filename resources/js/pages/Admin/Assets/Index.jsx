// resources/js/Pages/Assets/IndividualAssets/Index.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Laptop,
    Plus,
    Search,
    MoreVertical,
    Eye,
    UserPlus,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    X,
    Package,
    Barcode,
    Hash,
    MapPin,
    User,
    AlertCircle,
    Edit,
    Trash2,
    CheckCircle2,
} from 'lucide-react';

export default function Index({ auth, assets, inventoryItems, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [inventoryItemId, setInventoryItemId] = useState(filters.inventory_item_id || 'all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState(null);
    const { flash } = usePage().props;

    const handleSearch = (e) => {
        e.preventDefault();
        const params = { search };
        
        if (status && status !== 'all') params.status = status;
        if (inventoryItemId && inventoryItemId !== 'all') params.inventory_item_id = inventoryItemId;
        
        router.get(route('individual-assets.index'), params, {
            preserveState: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setInventoryItemId('all');
        router.get(route('individual-assets.index'));
    };

    const handleDelete = (asset) => {
        setAssetToDelete(asset);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (assetToDelete) {
            // Delete via the selective delete endpoint (will auto-update inventory quantity)
            router.post(route('inventory.delete-assets'), {
                asset_ids: [assetToDelete.id]
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModalOpen(false);
                    setAssetToDelete(null);
                }
            });
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Available': 'bg-green-100 text-green-700 border-green-200',
            'Assigned': 'bg-blue-100 text-blue-700 border-blue-200',
            'In Repair': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Retired': 'bg-gray-100 text-gray-700 border-gray-200',
            'Lost': 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getConditionBadge = (condition) => {
        const styles = {
            'New': 'bg-green-100 text-green-700',
            'Good': 'bg-blue-100 text-blue-700',
            'Fair': 'bg-yellow-100 text-yellow-700',
            'Poor': 'bg-orange-100 text-orange-700',
            'Damaged': 'bg-red-100 text-red-700',
        };
        return styles[condition] || 'bg-gray-100 text-gray-700';
    };

    const hasFilters = search || status !== 'all' || inventoryItemId !== 'all';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Laptop className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Individual Assets</h2>
                            <p className="text-gray-600 mt-1">Track each specific physical asset</p>
                        </div>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href={route('individual-assets.assign')}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Asset
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Individual Assets" />

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

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Assets</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{assets.total || 0}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Laptop className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Available</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">
                                        {assets.data?.filter(a => a.status === 'Available').length || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Package className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Assigned</p>
                                    <p className="text-3xl font-bold text-blue-600 mt-2">
                                        {assets.data?.filter(a => a.status === 'Assigned').length || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <User className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Repair</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                                        {assets.data?.filter(a => a.status === 'In Repair').length || 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Card */}
                <Card className="shadow-sm animate-fade-in animation-delay-100">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by asset tag, barcode, serial number, or item name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 h-11 text-base"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[200px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Product Type</label>
                                    <Select value={inventoryItemId} onValueChange={setInventoryItemId}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Products" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Products</SelectItem>
                                            {inventoryItems.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 min-w-[200px] space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="Available">Available</SelectItem>
                                            <SelectItem value="Assigned">Assigned</SelectItem>
                                            <SelectItem value="In Repair">In Repair</SelectItem>
                                            <SelectItem value="Retired">Retired</SelectItem>
                                            <SelectItem value="Lost">Lost</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

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

                            <div className="text-sm text-gray-600 pt-2 border-t">
                                Showing <span className="font-semibold text-gray-900">{assets.total}</span> individual {assets.total === 1 ? 'asset' : 'assets'}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="shadow-sm animate-fade-in animation-delay-200">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold">Asset Tag</TableHead>
                                    <TableHead className="font-semibold">Product</TableHead>
                                    <TableHead className="font-semibold">Serial / Barcode</TableHead>
                                    <TableHead className="font-semibold">Condition</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Assigned To</TableHead>
                                    <TableHead className="font-semibold">Location</TableHead>
                                    <TableHead className="text-right font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assets.data.length > 0 ? (
                                    assets.data.map((asset, index) => (
                                        <TableRow key={asset.id} className={`hover:bg-gray-50 animate-fade-in-up animation-delay-${Math.min((index + 3) * 100, 900)}`}>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <Hash className="h-4 w-4 text-gray-400" />
                                                    <span className="font-mono font-medium text-gray-900">{asset.asset_tag}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 rounded-lg">
                                                        <Package className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {asset.inventory_item?.name || 'Unknown Item'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {asset.inventory_item?.sku || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    {asset.serial_number ? (
                                                        <p className="text-gray-600 font-mono">SN: {asset.serial_number}</p>
                                                    ) : (
                                                        <p className="text-orange-600 text-xs font-medium">⚠️ Missing SN</p>
                                                    )}
                                                    {asset.barcode ? (
                                                        <div className="flex items-center gap-1.5 text-gray-500">
                                                            <Barcode className="h-3.5 w-3.5" />
                                                            <span className="font-mono">{asset.barcode}</span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-orange-600 text-xs font-medium">⚠️ Missing Barcode</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getConditionBadge(asset.condition)} border`}>
                                                    {asset.condition}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusBadge(asset.status)} border`}>
                                                    {asset.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {asset.current_assignment?.user ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                                                            <span className="text-xs font-medium text-white">
                                                                {(asset.current_assignment.user.name || 'U').charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm">
                                                            <p className="font-medium text-gray-900">{asset.current_assignment.user.name || 'Unknown User'}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {asset.location ? (
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{asset.location}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
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
                                                            <Link href={route('individual-assets.edit', asset.id)} className="cursor-pointer flex items-center">
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit Asset
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {asset.status === 'Available' && (
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('individual-assets.assign', asset.id)} className="cursor-pointer flex items-center">
                                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                                    Assign to User
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {asset.current_assignment && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    router.post(route('individual-assets.return', asset.current_assignment.id), {
                                                                        actual_return_date: new Date().toISOString().split('T')[0],
                                                                    });
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                                Return Asset
                                                            </DropdownMenuItem>
                                                        )}
                                                        
                                                        {/* Delete Option - Only for unassigned assets */}
                                                        {asset.status !== 'Assigned' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(asset)}
                                                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete Asset
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-16">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                    <Laptop className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <p className="text-gray-900 font-medium text-lg mb-1">No individual assets found</p>
                                                <p className="text-gray-500 text-sm mb-4">Assets are created from inventory items</p>
                                                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                                    <Link href={route('inventory.index')}>
                                                        <Package className="h-4 w-4 mr-2" />
                                                        Go to Inventory
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
                    {assets.data.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{assets.from}</span> to{' '}
                                    <span className="font-medium">{assets.to}</span> of{' '}
                                    <span className="font-medium">{assets.total}</span> results
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(assets.prev_page_url)}
                                    disabled={!assets.prev_page_url}
                                    className="h-9"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(assets.next_page_url)}
                                    disabled={!assets.next_page_url}
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
                onClose={() => {
                    setDeleteModalOpen(false);
                    setAssetToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Asset"
                description={`This will permanently delete ${assetToDelete?.asset_tag} and automatically update the inventory quantity.`}
                itemName={assetToDelete?.asset_tag}
            />
        </AuthenticatedLayout>
    );
}