// resources/js/Pages/Assets/IndividualAssets/Assign.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
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
    Barcode,
    Camera,
    CheckCircle2,
    Hash,
    Laptop,
    Loader2,
    Package,
    Save,
    Search,
    X as XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Assign({
    auth,
    preselectedAsset,
    availableAssets,
    users,
}) {
    const [barcodeSearch, setBarcodeSearch] = useState('');
    const [searchedAsset, setSearchedAsset] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [notFoundModalOpen, setNotFoundModalOpen] = useState(false);
    const [searchError, setSearchError] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        asset_id: preselectedAsset?.id || '',
        user_id: '',
        assigned_date: new Date().toISOString().split('T')[0],
        expected_return_date: '',
        assignment_notes: '',
        condition_on_assignment: 'Good',
    });

    useEffect(() => {
        if (preselectedAsset) {
            setSearchedAsset(preselectedAsset);
        }
    }, [preselectedAsset]);

    const handleBarcodeSearch = async (e) => {
        e.preventDefault();
        if (!barcodeSearch) return;

        setScanning(true);
        setSearchError('');
        try {
            const response = await fetch(route('individual-assets.lookup'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector(
                        'meta[name="csrf-token"]',
                    ).content,
                },
                body: JSON.stringify({ barcode: barcodeSearch }),
            });

            const result = await response.json();

            if (result.found) {
                setSearchedAsset(result.asset);
                setData('asset_id', result.asset.id);
            } else {
                setSearchError(
                    result.message || 'No asset found with this barcode',
                );
                setNotFoundModalOpen(true);
                setSearchedAsset(null);
            }
        } catch (error) {
            setSearchError('Error looking up barcode. Please try again.');
            setNotFoundModalOpen(true);
        } finally {
            setScanning(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('individual-assets.store-assignment'));
    };

    const selectedAsset =
        searchedAsset ||
        availableAssets.find((asset) => asset.id === parseInt(data.asset_id));

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
                                    Assign Individual Asset
                                </h2>
                                <p className="mt-1 text-gray-600">
                                    Assign a specific physical asset to an
                                    employee
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Assign Individual Asset" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {/* Barcode Scanner */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Quick Scan
                            </CardTitle>
                            <CardDescription>
                                Scan barcode to find specific asset
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Scan or enter barcode..."
                                    value={barcodeSearch}
                                    onChange={(e) =>
                                        setBarcodeSearch(e.target.value)
                                    }
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleBarcodeSearch(e);
                                        }
                                    }}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    onClick={handleBarcodeSearch}
                                    disabled={scanning || !barcodeSearch}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {scanning ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {searchedAsset && (
                                <Alert className="mt-4 border-green-200 bg-green-50">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="font-medium text-green-800">
                                        Found:{' '}
                                        {searchedAsset.inventory_item?.name ||
                                            'Unknown Item'}{' '}
                                        ({searchedAsset.asset_tag})
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assignment Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle>Assignment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Specific Asset *</Label>
                                    <Select
                                        value={data.asset_id.toString()}
                                        onValueChange={(value) => {
                                            setData('asset_id', value);
                                            setSearchedAsset(
                                                availableAssets.find(
                                                    (asset) =>
                                                        asset.id ===
                                                        parseInt(value),
                                                ),
                                            );
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select asset" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableAssets.map((asset) => (
                                                <SelectItem
                                                    key={asset.id}
                                                    value={asset.id.toString()}
                                                >
                                                    {asset.asset_tag} -{' '}
                                                    {asset.inventory_item
                                                        ?.name ||
                                                        'Unknown Item'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.asset_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.asset_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Assign To *</Label>
                                    <Select
                                        value={data.user_id.toString()}
                                        onValueChange={(value) =>
                                            setData('user_id', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem
                                                    key={user.id}
                                                    value={user.id.toString()}
                                                >
                                                    {user.name} -{' '}
                                                    {user.position ||
                                                        user.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && (
                                        <p className="text-sm text-red-500">
                                            {errors.user_id}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Assignment Date *</Label>
                                        <Input
                                            type="date"
                                            value={data.assigned_date}
                                            onChange={(e) =>
                                                setData(
                                                    'assigned_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Expected Return Date</Label>
                                        <Input
                                            type="date"
                                            value={data.expected_return_date}
                                            onChange={(e) =>
                                                setData(
                                                    'expected_return_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Condition on Assignment</Label>
                                    <Select
                                        value={data.condition_on_assignment}
                                        onValueChange={(value) =>
                                            setData(
                                                'condition_on_assignment',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="New">
                                                New
                                            </SelectItem>
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
                                    <Label>Assignment Notes</Label>
                                    <Textarea
                                        value={data.assignment_notes}
                                        onChange={(e) =>
                                            setData(
                                                'assignment_notes',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Additional notes about this assignment..."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                    >
                                        <Link
                                            href={route(
                                                'individual-assets.index',
                                            )}
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
                                                Assigning...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Assign Asset
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>

                {/* Asset Preview */}
                {selectedAsset && (
                    <div className="space-y-6">
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle>Asset Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Asset Tag */}
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Hash className="h-5 w-5 text-blue-600" />
                                            <span className="text-sm text-gray-600">
                                                Asset Tag
                                            </span>
                                        </div>
                                        <p className="font-mono text-lg font-bold text-gray-900">
                                            {selectedAsset.asset_tag}
                                        </p>
                                    </div>

                                    {/* Product Info */}
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <div className="mb-3 flex items-center gap-3">
                                            <Package className="h-6 w-6 text-gray-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {selectedAsset
                                                        .inventory_item?.name ||
                                                        'Unknown Item'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {selectedAsset
                                                        .inventory_item?.sku ||
                                                        'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedAsset.inventory_item
                                            ?.category && (
                                            <span
                                                className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium"
                                                style={{
                                                    backgroundColor:
                                                        selectedAsset
                                                            .inventory_item
                                                            .category.color +
                                                        '15',
                                                    color: selectedAsset
                                                        .inventory_item.category
                                                        .color,
                                                    borderColor:
                                                        selectedAsset
                                                            .inventory_item
                                                            .category.color +
                                                        '40',
                                                }}
                                            >
                                                {
                                                    selectedAsset.inventory_item
                                                        .category.name
                                                }
                                            </span>
                                        )}
                                    </div>

                                    {/* Barcode */}
                                    <div className="rounded-lg border-2 border-dashed p-4 text-center">
                                        <Barcode className="mb-2 h-12 w-full text-gray-400" />
                                        <p className="font-mono text-sm font-medium text-gray-900">
                                            {selectedAsset.barcode}
                                        </p>
                                    </div>

                                    {/* Serial Number */}
                                    {selectedAsset.serial_number && (
                                        <div>
                                            <p className="mb-1 text-sm text-gray-600">
                                                Serial Number
                                            </p>
                                            <p className="font-mono text-sm font-medium text-gray-900">
                                                {selectedAsset.serial_number}
                                            </p>
                                        </div>
                                    )}

                                    {/* Condition */}
                                    <div>
                                        <p className="mb-1 text-sm text-gray-600">
                                            Condition
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {selectedAsset.condition}
                                        </p>
                                    </div>

                                    {/* Location */}
                                    {selectedAsset.location && (
                                        <div>
                                            <p className="mb-1 text-sm text-gray-600">
                                                Location
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {selectedAsset.location}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Not Found Modal */}
            {notFoundModalOpen && (
                <>
                    <div
                        className="animate-fade-in fixed inset-0 z-50 bg-black/50"
                        onClick={() => setNotFoundModalOpen(false)}
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="animate-scale-in w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-red-100 p-2">
                                        <AlertCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Asset Not Found
                                        </h3>
                                        <p className="mt-0.5 text-sm text-gray-600">
                                            Barcode: {barcodeSearch}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setNotFoundModalOpen(false)}
                                    className="rounded-md p-1 transition-colors hover:bg-gray-100"
                                >
                                    <XIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            <p className="mb-6 text-sm text-gray-600">
                                {searchError}
                            </p>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setNotFoundModalOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}
