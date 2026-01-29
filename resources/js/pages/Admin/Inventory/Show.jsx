// resources/js/Pages/Inventory/Show.jsx
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Barcode,
    Barcode as BarcodeIcon,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Edit,
    Hash,
    History,
    Laptop,
    Lock,
    MapPin,
    Package,
    Trash2,
    User,
    UserPlus,
    X,
} from 'lucide-react';

export default function Show({ auth, item }) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [deleteSelectedModalOpen, setDeleteSelectedModalOpen] =
        useState(false);

    // Get list of assets that CAN be deleted (NOT assigned to users)
    // Assets with serial numbers or barcodes can be deleted if unassigned
    const selectableAssets =
        item.assets?.filter((asset) => asset.status !== 'Assigned') || [];

    const handleDelete = () => {
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('inventory.destroy', item.id));
    };

    const handleAssetToggle = (assetId) => {
        setSelectedAssets((prev) =>
            prev.includes(assetId)
                ? prev.filter((id) => id !== assetId)
                : [...prev, assetId],
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedAssets(selectableAssets.map((a) => a.id));
        } else {
            setSelectedAssets([]);
        }
    };

    const handleDeleteSelected = () => {
        router.post(
            route('inventory.delete-assets'),
            {
                asset_ids: selectedAssets,
            },
            {
                onSuccess: () => {
                    setSelectedAssets([]);
                    setDeleteSelectedModalOpen(false);
                },
                preserveScroll: true,
            },
        );
    };

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-700 border-green-200',
            discontinued: 'bg-gray-100 text-gray-700 border-gray-200',
            out_of_stock: 'bg-red-100 text-red-700 border-red-200',
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getAssetTypeBadge = (type) => {
        const styles = {
            asset: 'bg-blue-100 text-blue-700 border-blue-200',
            consumable: 'bg-purple-100 text-purple-700 border-purple-200',
        };
        return styles[type] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const isLowStock = item.quantity <= item.min_quantity;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('inventory.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {item.name}
                                </h2>
                                <p className="mt-1 text-gray-600">
                                    Item Details & Information
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button asChild variant="outline">
                            <Link href={route('inventory.edit', item.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={item.name} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Information - Left Column */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Overview Card */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">
                                        {item.name}
                                    </CardTitle>
                                    {item.manufacturer && (
                                        <CardDescription className="mt-1 text-base">
                                            {item.manufacturer} {item.model}
                                        </CardDescription>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Badge
                                        className={`${getAssetTypeBadge(item.asset_type)} border`}
                                    >
                                        {item.asset_type}
                                    </Badge>
                                    <Badge
                                        className={`${getStatusBadge(item.status)} border`}
                                    >
                                        {item.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {item.description && (
                                <div>
                                    <p className="text-gray-700">
                                        {item.description}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-4">
                                <div>
                                    <p className="mb-1 text-sm text-gray-600">
                                        SKU
                                    </p>
                                    <p className="font-mono font-medium text-gray-900">
                                        {item.sku}
                                    </p>
                                </div>
                                {item.serial_number && (
                                    <div>
                                        <p className="mb-1 text-sm text-gray-600">
                                            Serial Number
                                        </p>
                                        <p className="font-mono text-sm text-gray-900">
                                            {item.serial_number}
                                        </p>
                                    </div>
                                )}
                                {item.category && (
                                    <div>
                                        <p className="mb-1 text-sm text-gray-600">
                                            Category
                                        </p>
                                        <Badge
                                            className="border"
                                            style={{
                                                backgroundColor:
                                                    item.category.color + '15',
                                                color: item.category.color,
                                                borderColor:
                                                    item.category.color + '40',
                                            }}
                                        >
                                            {item.category.name}
                                        </Badge>
                                    </div>
                                )}
                                {item.location && (
                                    <div>
                                        <p className="mb-1 flex items-center gap-1 text-sm text-gray-600">
                                            <MapPin className="h-3 w-3" />
                                            Location
                                        </p>
                                        <p className="text-sm text-gray-900">
                                            {item.location}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Information */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <CardTitle>Stock Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                                <div>
                                    <p className="mb-2 text-sm text-gray-600">
                                        Current Stock
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p
                                            className={`text-3xl font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}
                                        >
                                            {item.quantity}
                                        </p>
                                        <span className="text-gray-500">
                                            {item.unit}
                                        </span>
                                    </div>
                                    {isLowStock && (
                                        <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
                                            <AlertTriangle className="h-4 w-4" />
                                            Low Stock
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="mb-2 text-sm text-gray-600">
                                        Minimum Stock
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-3xl font-bold text-gray-900">
                                            {item.min_quantity}
                                        </p>
                                        <span className="text-gray-500">
                                            {item.unit}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-sm text-gray-600">
                                        Unit Price
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-gray-600" />
                                        <p className="text-3xl font-bold text-gray-900">
                                            {parseFloat(
                                                item.unit_price,
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-sm text-gray-600">
                                        Total Value
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-gray-600" />
                                        <p className="text-3xl font-bold text-gray-900">
                                            {(
                                                item.quantity *
                                                parseFloat(item.unit_price)
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Individual Assets - UPDATED: Allow deleting any unassigned asset */}
                    {item.asset_type === 'asset' &&
                        item.assets &&
                        item.assets.length > 0 && (
                            <Card className="animate-fade-in animation-delay-150">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Laptop className="h-5 w-5" />
                                            Individual Assets (
                                            {item.assets.length})
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {selectedAssets.length > 0 && (
                                                <>
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {selectedAssets.length}{' '}
                                                        selected
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setDeleteSelectedModalOpen(
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete (
                                                        {selectedAssets.length})
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                            >
                                                <Link
                                                    href={route(
                                                        'individual-assets.index',
                                                        {
                                                            inventory_item_id:
                                                                item.id,
                                                        },
                                                    )}
                                                >
                                                    View All
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {/* Select All Checkbox */}
                                        {selectableAssets.length > 0 && (
                                            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                <Checkbox
                                                    id="select-all"
                                                    checked={
                                                        selectedAssets.length ===
                                                            selectableAssets.length &&
                                                        selectableAssets.length >
                                                            0
                                                    }
                                                    onCheckedChange={
                                                        handleSelectAll
                                                    }
                                                />
                                                <Label
                                                    htmlFor="select-all"
                                                    className="flex-1 cursor-pointer text-sm font-medium"
                                                >
                                                    Select All Unassigned Assets
                                                    ({selectableAssets.length})
                                                </Label>
                                            </div>
                                        )}

                                        {/* Asset List */}
                                        {item.assets.map((asset) => {
                                            const isAssigned =
                                                asset.status === 'Assigned';
                                            const isDeletable = !isAssigned;

                                            return (
                                                <div
                                                    key={asset.id}
                                                    className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
                                                        isDeletable
                                                            ? 'border-gray-200 bg-white hover:bg-gray-50'
                                                            : 'border-gray-300 bg-gray-50'
                                                    }`}
                                                >
                                                    {/* Checkbox or Lock Icon */}
                                                    <div className="flex w-5 items-center justify-center">
                                                        {isDeletable ? (
                                                            <Checkbox
                                                                id={`asset-${asset.id}`}
                                                                checked={selectedAssets.includes(
                                                                    asset.id,
                                                                )}
                                                                onCheckedChange={() =>
                                                                    handleAssetToggle(
                                                                        asset.id,
                                                                    )
                                                                }
                                                            />
                                                        ) : (
                                                            <Lock className="h-4 w-4 text-gray-400" />
                                                        )}
                                                    </div>

                                                    {/* Asset Info */}
                                                    <div className="flex flex-1 items-center gap-4">
                                                        <div className="rounded-lg bg-blue-100 p-2">
                                                            <Hash className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="mb-1 flex flex-wrap items-center gap-3">
                                                                <p className="font-mono font-medium text-gray-900">
                                                                    {
                                                                        asset.asset_tag
                                                                    }
                                                                </p>
                                                                <Badge
                                                                    className={
                                                                        asset.status ===
                                                                        'Available'
                                                                            ? 'border-green-200 bg-green-100 text-green-700'
                                                                            : 'border-blue-200 bg-blue-100 text-blue-700'
                                                                    }
                                                                >
                                                                    {
                                                                        asset.status
                                                                    }
                                                                </Badge>

                                                                {/* Show lock badge only if assigned */}
                                                                {isAssigned && (
                                                                    <Badge className="border border-red-300 bg-red-100 text-red-700">
                                                                        <Lock className="mr-1 h-3 w-3" />
                                                                        Assigned
                                                                        - Cannot
                                                                        Delete
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                                {asset.serial_number ? (
                                                                    <span className="font-mono">
                                                                        SN:{' '}
                                                                        {
                                                                            asset.serial_number
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs font-medium text-orange-600">
                                                                        ⚠️ No
                                                                        Serial
                                                                    </span>
                                                                )}

                                                                {asset.barcode ? (
                                                                    <span className="flex items-center gap-1 font-mono">
                                                                        <Barcode className="h-3.5 w-3.5" />
                                                                        {
                                                                            asset.barcode
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs font-medium text-orange-600">
                                                                        ⚠️ No
                                                                        Barcode
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Assignment Status */}
                                                    <div className="flex-shrink-0 text-right">
                                                        {asset
                                                            .current_assignment
                                                            ?.user ? (
                                                            <div className="text-sm">
                                                                <p className="font-medium text-gray-900">
                                                                    {
                                                                        asset
                                                                            .current_assignment
                                                                            .user
                                                                            .name
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Assigned
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm">
                                                                <p className="mb-1 text-gray-500">
                                                                    Unassigned
                                                                </p>
                                                                <Button
                                                                    asChild
                                                                    size="sm"
                                                                    variant="outline"
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'individual-assets.assign',
                                                                            asset.id,
                                                                        )}
                                                                    >
                                                                        <UserPlus className="mr-1 h-3 w-3" />
                                                                        Assign
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Info Alert */}
                                        {selectableAssets.length > 0 && (
                                            <Alert className="border-blue-200 bg-blue-50">
                                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                                <AlertDescription className="text-sm text-blue-800">
                                                    <strong>Tip:</strong> You
                                                    can delete any unassigned
                                                    asset, even if it has a
                                                    serial number or barcode.
                                                    Select assets above and
                                                    click "Delete" to remove
                                                    them. The inventory quantity
                                                    will automatically decrease
                                                    from{' '}
                                                    <strong>
                                                        {item.quantity}
                                                    </strong>{' '}
                                                    to{' '}
                                                    <strong>
                                                        {item.quantity -
                                                            selectedAssets.length}
                                                    </strong>{' '}
                                                    when you delete{' '}
                                                    {selectedAssets.length ||
                                                        'selected'}{' '}
                                                    asset(s).
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {/* No Deletable Assets Info */}
                                        {selectableAssets.length === 0 &&
                                            item.assets.length > 0 && (
                                                <Alert className="border-gray-200 bg-gray-50">
                                                    <Lock className="h-4 w-4 text-gray-600" />
                                                    <AlertDescription className="text-sm text-gray-700">
                                                        All assets are currently
                                                        assigned to users.
                                                        Please return them
                                                        before deleting.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    {/* Additional Details */}
                    <Card className="animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle>Additional Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {item.purchase_date && (
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-blue-50 p-2">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Purchase Date
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(
                                                    item.purchase_date,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {item.warranty_expiry && (
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-purple-50 p-2">
                                            <Clock className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Warranty Expiry
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(
                                                    item.warranty_expiry,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {item.creator && (
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-lg bg-green-50 p-2">
                                            <User className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Created By
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {item.creator.name}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="rounded-lg bg-gray-50 p-2">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Last Updated
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(
                                                item.updated_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assignment History */}
                    {item.assignments && item.assignments.length > 0 && (
                        <Card className="animate-fade-in animation-delay-300">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Assignment History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {item.assignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="rounded-full bg-blue-100 p-2">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {assignment.user.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {assignment.user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge
                                                    className={
                                                        assignment.status ===
                                                        'active'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }
                                                >
                                                    {assignment.status}
                                                </Badge>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {new Date(
                                                        assignment.assigned_date,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    {/* Barcode Card */}
                    {item.barcode && (
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarcodeIcon className="h-5 w-5" />
                                    Barcode
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-6">
                                    <BarcodeIcon className="mb-4 h-16 w-full text-gray-400" />
                                    <p className="font-mono text-lg font-bold text-gray-900">
                                        {item.barcode}
                                    </p>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Scan to identify this item
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Current Assignment */}
                    <Card className="animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle>Current Assignment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {item.current_assignment?.user ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                                            <span className="text-lg font-medium text-white">
                                                {item.current_assignment.user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {
                                                    item.current_assignment.user
                                                        .name
                                                }
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {
                                                    item.current_assignment.user
                                                        .email
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <p className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Assigned:{' '}
                                            {new Date(
                                                item.current_assignment.assigned_date,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center">
                                    <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                                    <p className="text-gray-600">
                                        Not currently assigned
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="animate-fade-in animation-delay-300">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {item.asset_type === 'asset' && (
                                <Button
                                    className="w-full justify-start"
                                    variant="outline"
                                    asChild
                                >
                                    <Link
                                        href={route('individual-assets.index', {
                                            inventory_item_id: item.id,
                                        })}
                                    >
                                        <Laptop className="mr-2 h-4 w-4" />
                                        View Individual Assets (
                                        {item.assets?.length || 0})
                                    </Link>
                                </Button>
                            )}
                            <Button
                                className="w-full justify-start"
                                variant="outline"
                                asChild
                            >
                                <Link href={route('inventory.edit', item.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Item
                                </Link>
                            </Button>
                            <Button
                                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                                variant="outline"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Item
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Inventory Item Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName={item.name}
            />

            {/* Delete Selected Assets Modal */}
            {deleteSelectedModalOpen && (
                <>
                    <div
                        className="animate-fade-in fixed inset-0 z-50 bg-black/50"
                        onClick={() => setDeleteSelectedModalOpen(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="animate-scale-in w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start gap-3">
                                <div className="rounded-full bg-red-100 p-2">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Delete {selectedAssets.length} Asset
                                        {selectedAssets.length !== 1 ? 's' : ''}
                                        ?
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        This will permanently delete the
                                        selected unassigned assets (including
                                        those with serial numbers or barcodes).
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setDeleteSelectedModalOpen(false)
                                    }
                                    className="rounded-md p-1 transition-colors hover:bg-gray-100"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <Alert className="mb-4 border-blue-200 bg-blue-50">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-sm text-blue-800">
                                    <strong>Auto-Update:</strong> Inventory
                                    quantity will automatically decrease from{' '}
                                    <strong>{item.quantity}</strong> to{' '}
                                    <strong>
                                        {item.quantity - selectedAssets.length}
                                    </strong>
                                </AlertDescription>
                            </Alert>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setDeleteSelectedModalOpen(false)
                                    }
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                    onClick={handleDeleteSelected}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Assets
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}
