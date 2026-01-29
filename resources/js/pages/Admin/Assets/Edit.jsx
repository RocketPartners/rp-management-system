// resources/js/Pages/Assets/IndividualAssets/Edit.jsx
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Barcode as BarcodeIcon,
    DollarSign,
    Hash,
    Laptop,
    Loader2,
    MapPin,
    Package,
    Save,
} from 'lucide-react';

export default function Edit({ auth, asset }) {
    const { data, setData, put, processing, errors } = useForm({
        asset_tag: asset.asset_tag || '',
        serial_number: asset.serial_number || '',
        barcode: asset.barcode || '',
        purchase_date: asset.purchase_date || '',
        purchase_price: asset.purchase_price || '',
        warranty_expiry: asset.warranty_expiry || '',
        condition: asset.condition || 'Good',
        status: asset.status || 'Available',
        location: asset.location || '',
        notes: asset.notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('individual-assets.update', asset.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('individual-assets.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <Laptop className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Edit Asset
                                </h2>
                                <p className="mt-1 text-gray-600">
                                    Update asset details, serial number, and
                                    barcode
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Edit ${asset.asset_tag}`} />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                {/* Product Information (Read-Only) */}
                <Card className="animate-fade-in">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Product Information
                        </CardTitle>
                        <CardDescription>
                            This asset is a{' '}
                            {asset.inventory_item?.name || 'Unknown Item'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg bg-blue-50 p-4">
                            <div className="mb-2 flex items-center gap-3">
                                <Package className="h-6 w-6 text-blue-600" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {asset.inventory_item?.name ||
                                            'Unknown Item'}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {asset.inventory_item?.sku || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            {asset.inventory_item?.category && (
                                <span
                                    className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium"
                                    style={{
                                        backgroundColor:
                                            asset.inventory_item.category
                                                .color + '15',
                                        color: asset.inventory_item.category
                                            .color,
                                        borderColor:
                                            asset.inventory_item.category
                                                .color + '40',
                                    }}
                                >
                                    {asset.inventory_item.category.name}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Asset Identification */}
                <Card className="animate-fade-in animation-delay-100">
                    <CardHeader>
                        <CardTitle>Asset Identification</CardTitle>
                        <CardDescription>
                            Unique identifiers for this specific physical asset
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="asset_tag">Asset Tag *</Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    id="asset_tag"
                                    value={data.asset_tag}
                                    onChange={(e) =>
                                        setData('asset_tag', e.target.value)
                                    }
                                    placeholder="ASSET-1-001"
                                    className={`pl-10 ${errors.asset_tag ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.asset_tag && (
                                <p className="flex items-center gap-1 text-sm text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.asset_tag}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="serial_number">
                                    Serial Number
                                </Label>
                                <Input
                                    id="serial_number"
                                    value={data.serial_number}
                                    onChange={(e) =>
                                        setData('serial_number', e.target.value)
                                    }
                                    placeholder="e.g., C02XL123456"
                                    className={
                                        errors.serial_number
                                            ? 'border-red-500'
                                            : ''
                                    }
                                />
                                <p className="text-xs text-gray-500">
                                    Enter the manufacturer's serial number
                                </p>
                                {errors.serial_number && (
                                    <p className="text-sm text-red-500">
                                        {errors.serial_number}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barcode</Label>
                                <div className="relative">
                                    <BarcodeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="barcode"
                                        value={data.barcode}
                                        onChange={(e) =>
                                            setData('barcode', e.target.value)
                                        }
                                        placeholder="e.g., 123456789012"
                                        className={`pl-10 ${errors.barcode ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Scan or enter the barcode sticker
                                </p>
                                {errors.barcode && (
                                    <p className="text-sm text-red-500">
                                        {errors.barcode}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Asset Details */}
                <Card className="animate-fade-in animation-delay-200">
                    <CardHeader>
                        <CardTitle>Asset Details</CardTitle>
                        <CardDescription>
                            Current condition and status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition *</Label>
                                <Select
                                    value={data.condition}
                                    onValueChange={(value) =>
                                        setData('condition', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Good">
                                            Good
                                        </SelectItem>
                                        <SelectItem value="Fair">
                                            Fair
                                        </SelectItem>
                                        <SelectItem value="Poor">
                                            Poor
                                        </SelectItem>
                                        <SelectItem value="Damaged">
                                            Damaged
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Available">
                                            Available
                                        </SelectItem>
                                        <SelectItem value="Assigned">
                                            Assigned
                                        </SelectItem>
                                        <SelectItem value="In Repair">
                                            In Repair
                                        </SelectItem>
                                        <SelectItem value="Retired">
                                            Retired
                                        </SelectItem>
                                        <SelectItem value="Lost">
                                            Lost
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) =>
                                        setData('location', e.target.value)
                                    }
                                    placeholder="e.g., IT Storage Room A, Shelf 3"
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Purchase Information */}
                <Card className="animate-fade-in animation-delay-300">
                    <CardHeader>
                        <CardTitle>Purchase Information</CardTitle>
                        <CardDescription>
                            Financial and warranty details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="purchase_date">
                                    Purchase Date
                                </Label>
                                <Input
                                    id="purchase_date"
                                    type="date"
                                    value={data.purchase_date}
                                    onChange={(e) =>
                                        setData('purchase_date', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purchase_price">
                                    Purchase Price
                                </Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="purchase_price"
                                        type="number"
                                        step="0.01"
                                        value={data.purchase_price}
                                        onChange={(e) =>
                                            setData(
                                                'purchase_price',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0.00"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="warranty_expiry">
                                    Warranty Expiry
                                </Label>
                                <Input
                                    id="warranty_expiry"
                                    type="date"
                                    value={data.warranty_expiry}
                                    onChange={(e) =>
                                        setData(
                                            'warranty_expiry',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card className="animate-fade-in animation-delay-400">
                    <CardHeader>
                        <CardTitle>Additional Notes</CardTitle>
                        <CardDescription>
                            Any additional information about this asset
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                                placeholder="Any special notes about this asset..."
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card className="animate-fade-in animation-delay-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Fields marked with * are required
                            </p>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" asChild>
                                    <Link
                                        href={route('individual-assets.index')}
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update Asset
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </AuthenticatedLayout>
    );
}
