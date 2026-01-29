// resources/js/Pages/Inventory/Create.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Package,
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    Barcode as BarcodeIcon,
    Hash,
} from 'lucide-react';

export default function Create({ auth, categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        sku: '',
        barcode: '',
        serial_number: '',
        description: '',
        category_id: '',
        quantity: 0,
        min_quantity: 10,
        unit_price: 0,
        unit: 'piece',
        location: '',
        manufacturer: '',
        model: '',
        purchase_date: '',
        warranty_expiry: '',
        status: 'active',
        asset_type: 'asset',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('inventory.store'));
    };

    const generateSKU = () => {
        const prefix = 'INV';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        setData('sku', `${prefix}-${timestamp}-${random}`);
    };

    const generateBarcode = () => {
        const barcode = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
        setData('barcode', barcode);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('inventory.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Add New Item</h2>
                                <p className="text-gray-600 mt-1">Create a new inventory item or asset</p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Add Inventory Item" />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card className="animate-fade-in">
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Essential details about the inventory item</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Item Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Item Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., MacBook Pro 16"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* SKU and Barcode */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="sku"
                                        value={data.sku}
                                        onChange={(e) => setData('sku', e.target.value)}
                                        placeholder="INV-123456"
                                        className={errors.sku ? 'border-red-500' : ''}
                                    />
                                    <Button type="button" variant="outline" onClick={generateSKU}>
                                        <Hash className="h-4 w-4" />
                                    </Button>
                                </div>
                                {errors.sku && (
                                    <p className="text-sm text-red-500">{errors.sku}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barcode</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="barcode"
                                        value={data.barcode}
                                        onChange={(e) => setData('barcode', e.target.value)}
                                        placeholder="123456789012"
                                        className={errors.barcode ? 'border-red-500' : ''}
                                    />
                                    <Button type="button" variant="outline" onClick={generateBarcode}>
                                        <BarcodeIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                                {errors.barcode && (
                                    <p className="text-sm text-red-500">{errors.barcode}</p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Brief description of the item..."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Classification */}
                <Card className="animate-fade-in animation-delay-100">
                    <CardHeader>
                        <CardTitle>Classification</CardTitle>
                        <CardDescription>Categorize and classify the item</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Category</Label>
                                <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="asset_type">Asset Type *</Label>
                                <Select value={data.asset_type} onValueChange={(value) => setData('asset_type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="asset">Asset</SelectItem>
                                        <SelectItem value="consumable">Consumable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="discontinued">Discontinued</SelectItem>
                                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Details */}
                <Card className="animate-fade-in animation-delay-200">
                    <CardHeader>
                        <CardTitle>Inventory Details</CardTitle>
                        <CardDescription>Stock levels and pricing information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Current Quantity *</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={data.quantity}
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    min="0"
                                    className={errors.quantity ? 'border-red-500' : ''}
                                />
                                {errors.quantity && (
                                    <p className="text-sm text-red-500">{errors.quantity}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="min_quantity">Minimum Quantity *</Label>
                                <Input
                                    id="min_quantity"
                                    type="number"
                                    value={data.min_quantity}
                                    onChange={(e) => setData('min_quantity', e.target.value)}
                                    min="0"
                                    className={errors.min_quantity ? 'border-red-500' : ''}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit *</Label>
                                <Input
                                    id="unit"
                                    value={data.unit}
                                    onChange={(e) => setData('unit', e.target.value)}
                                    placeholder="piece, kg, box..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit_price">Unit Price *</Label>
                                <Input
                                    id="unit_price"
                                    type="number"
                                    step="0.01"
                                    value={data.unit_price}
                                    onChange={(e) => setData('unit_price', e.target.value)}
                                    min="0"
                                    className={errors.unit_price ? 'border-red-500' : ''}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                placeholder="e.g., Warehouse A, Shelf 3"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Product Details */}
                <Card className="animate-fade-in animation-delay-300">
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                        <CardDescription>Manufacturer and warranty information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="manufacturer">Manufacturer</Label>
                                <Input
                                    id="manufacturer"
                                    value={data.manufacturer}
                                    onChange={(e) => setData('manufacturer', e.target.value)}
                                    placeholder="e.g., Apple, Dell..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input
                                    id="model"
                                    value={data.model}
                                    onChange={(e) => setData('model', e.target.value)}
                                    placeholder="e.g., MacBook Pro 16"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="serial_number">Serial Number</Label>
                                <Input
                                    id="serial_number"
                                    value={data.serial_number}
                                    onChange={(e) => setData('serial_number', e.target.value)}
                                    placeholder="e.g., C02XYZ123"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="purchase_date">Purchase Date</Label>
                                <Input
                                    id="purchase_date"
                                    type="date"
                                    value={data.purchase_date}
                                    onChange={(e) => setData('purchase_date', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
                                <Input
                                    id="warranty_expiry"
                                    type="date"
                                    value={data.warranty_expiry}
                                    onChange={(e) => setData('warranty_expiry', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <Card className="animate-fade-in animation-delay-400">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Fields marked with * are required
                            </p>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('inventory.index')}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                    {processing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Create Item
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