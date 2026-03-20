import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, Download, Plus, Trash2, Edit2, Power, Upload } from 'lucide-react';
import { useState } from 'react';

export default function HolidaysIndex({
    auth,
    holidays,
    filters,
    availableYears,
    countries,
}) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showFetchModal, setShowFetchModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);

    const importForm = useForm({
        file: null,
    });

    const addForm = useForm({
        name: '',
        date: '',
        country_code: filters.country || 'PH',
        type: 'public',
        description: '',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        date: '',
        country_code: '',
        type: 'public',
        description: '',
        is_active: true,
    });

    const fetchForm = useForm({
        year: filters.year,
        country_code: filters.country || 'PH',
    });

    const handleFilterChange = (key, value) => {
        router.get(
            route('holidays.index'),
            { ...filters, [key]: value },
            { preserveState: true }
        );
    };

    const handleAdd = (e) => {
        e.preventDefault();
        addForm.post(route('holidays.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                addForm.reset();
            },
        });
    };

    const handleEdit = (holiday) => {
        setEditingHoliday(holiday);
        editForm.setData({
            name: holiday.name,
            date: holiday.date,
            country_code: holiday.country_code,
            type: holiday.type || 'public',
            description: holiday.description || '',
            is_active: holiday.is_active,
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.put(route('holidays.update', editingHoliday.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setEditingHoliday(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (holiday) => {
        if (confirm(`Are you sure you want to delete "${holiday.name}"?`)) {
            router.delete(route('holidays.destroy', holiday.id));
        }
    };

    const handleToggleActive = (holiday) => {
        router.patch(route('holidays.toggle-active', holiday.id));
    };

    const handleFetchFromAPI = (e) => {
        e.preventDefault();
        fetchForm.post(route('holidays.fetch-from-api'), {
            onSuccess: () => {
                setShowFetchModal(false);
                fetchForm.reset();
            },
        });
    };

    const handleImport = (e) => {
        e.preventDefault();
        importForm.post(route('holidays.import'), {
            forceFormData: true,
            onSuccess: () => {
                setShowImportModal(false);
                importForm.reset();
            },
        });
    };

    const getCountryName = (code) => {
        const country = countries.find((c) => c.code === code);
        return country ? country.name : code;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Holiday Management
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Manage public holidays for different countries
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowImportModal(true)}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Import Excel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFetchModal(true)}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Fetch from API
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Custom Holiday
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Holidays" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Holidays</CardTitle>
                                <div className="flex gap-3">
                                    {/* Country Filter */}
                                    <Select
                                        value={filters.country}
                                        onValueChange={(value) =>
                                            handleFilterChange('country', value)
                                        }
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((country) => (
                                                <SelectItem
                                                    key={country.code}
                                                    value={country.code}
                                                >
                                                    {country.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Year Filter */}
                                    <Select
                                        value={filters.year.toString()}
                                        onValueChange={(value) =>
                                            handleFilterChange('year', value)
                                        }
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableYears.map((year) => (
                                                <SelectItem
                                                    key={year}
                                                    value={year.toString()}
                                                >
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Holiday Name</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {holidays.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center text-gray-500"
                                            >
                                                No holidays found. Try fetching
                                                from API or add custom holidays.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        holidays.data.map((holiday) => (
                                            <TableRow key={holiday.id}>
                                                <TableCell className="font-medium">
                                                    {new Date(
                                                        holiday.date
                                                    ).toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        }
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {holiday.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {getCountryName(
                                                            holiday.country_code
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className="capitalize"
                                                    >
                                                        {holiday.type || 'public'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {holiday.is_active ? (
                                                        <Badge variant="success">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleToggleActive(
                                                                    holiday
                                                                )
                                                            }
                                                        >
                                                            <Power className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    holiday
                                                                )
                                                            }
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    holiday
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {holidays.links && holidays.links.length > 3 && (
                                <div className="mt-4 flex justify-center gap-2">
                                    {holidays.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url &&
                                                router.get(link.url)
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Holiday Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Custom Holiday</DialogTitle>
                        <DialogDescription>
                            Create a custom holiday for any country.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAdd}>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="name">Holiday Name</Label>
                                <Input
                                    id="name"
                                    value={addForm.data.name}
                                    onChange={(e) =>
                                        addForm.setData('name', e.target.value)
                                    }
                                    placeholder="e.g., Company Foundation Day"
                                    required
                                />
                                {addForm.errors.name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {addForm.errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={addForm.data.date}
                                    onChange={(e) =>
                                        addForm.setData('date', e.target.value)
                                    }
                                    required
                                />
                                {addForm.errors.date && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {addForm.errors.date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="country_code">Country</Label>
                                <Select
                                    value={addForm.data.country_code}
                                    onValueChange={(value) =>
                                        addForm.setData('country_code', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country) => (
                                            <SelectItem
                                                key={country.code}
                                                value={country.code}
                                            >
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={addForm.data.type}
                                    onValueChange={(value) =>
                                        addForm.setData('type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">
                                            Public
                                        </SelectItem>
                                        <SelectItem value="bank">
                                            Bank Holiday
                                        </SelectItem>
                                        <SelectItem value="observance">
                                            Observance
                                        </SelectItem>
                                        <SelectItem value="company">
                                            Company Holiday
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="description">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    value={addForm.data.description}
                                    onChange={(e) =>
                                        addForm.setData(
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Additional information about this holiday"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addForm.processing}>
                                {addForm.processing ? 'Adding...' : 'Add Holiday'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Holiday Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Holiday</DialogTitle>
                        <DialogDescription>
                            Update holiday information.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="edit_name">Holiday Name</Label>
                                <Input
                                    id="edit_name"
                                    value={editForm.data.name}
                                    onChange={(e) =>
                                        editForm.setData('name', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit_date">Date</Label>
                                <Input
                                    id="edit_date"
                                    type="date"
                                    value={editForm.data.date}
                                    onChange={(e) =>
                                        editForm.setData('date', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit_country_code">
                                    Country
                                </Label>
                                <Select
                                    value={editForm.data.country_code}
                                    onValueChange={(value) =>
                                        editForm.setData('country_code', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country) => (
                                            <SelectItem
                                                key={country.code}
                                                value={country.code}
                                            >
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit_type">Type</Label>
                                <Select
                                    value={editForm.data.type}
                                    onValueChange={(value) =>
                                        editForm.setData('type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">
                                            Public
                                        </SelectItem>
                                        <SelectItem value="bank">
                                            Bank Holiday
                                        </SelectItem>
                                        <SelectItem value="observance">
                                            Observance
                                        </SelectItem>
                                        <SelectItem value="company">
                                            Company Holiday
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit_description">
                                    Description
                                </Label>
                                <Textarea
                                    id="edit_description"
                                    value={editForm.data.description}
                                    onChange={(e) =>
                                        editForm.setData(
                                            'description',
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowEditModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                            >
                                {editForm.processing ? 'Updating...' : 'Update'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Fetch from API Modal */}
            <Dialog open={showFetchModal} onOpenChange={setShowFetchModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Fetch Holidays from API</DialogTitle>
                        <DialogDescription>
                            Automatically fetch public holidays from Nager.Date
                            API
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleFetchFromAPI}>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="fetch_year">Year</Label>
                                <Input
                                    id="fetch_year"
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={fetchForm.data.year}
                                    onChange={(e) =>
                                        fetchForm.setData('year', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="fetch_country">Country</Label>
                                <Select
                                    value={fetchForm.data.country_code}
                                    onValueChange={(value) =>
                                        fetchForm.setData('country_code', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map((country) => (
                                            <SelectItem
                                                key={country.code}
                                                value={country.code}
                                            >
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                                This will fetch holidays from a free public API.
                                Existing holidays for this year will be updated.
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowFetchModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={fetchForm.processing}
                            >
                                {fetchForm.processing
                                    ? 'Fetching...'
                                    : 'Fetch Holidays'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Import Excel Modal */}
            <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Holidays from Excel</DialogTitle>
                        <DialogDescription>
                            Upload an Excel file (.xlsx, .xls) or CSV with holiday data.
                            Required columns: <strong>name</strong>, <strong>date</strong>.
                            Optional: country_code (default: PH), type, description, state.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleImport}>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="import-file">Excel / CSV File</Label>
                                <Input
                                    id="import-file"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="mt-1"
                                    onChange={(e) =>
                                        importForm.setData('file', e.target.files[0])
                                    }
                                />
                                {importForm.errors.file && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {importForm.errors.file}
                                    </p>
                                )}
                            </div>
                            <div className="rounded-lg bg-gray-50 p-3">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                    Expected columns:
                                </p>
                                <code className="text-xs text-gray-600">
                                    name | date | country_code | type | description | state
                                </code>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowImportModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={importForm.processing || !importForm.data.file}
                            >
                                {importForm.processing
                                    ? 'Importing...'
                                    : 'Import Holidays'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
