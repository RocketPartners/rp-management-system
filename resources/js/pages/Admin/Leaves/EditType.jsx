// resources/js/Pages/Admin/Leaves/EditType.jsx
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
import { Switch } from '@/Components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    FileText,
    Info,
    Save,
    Settings,
    Shield,
} from 'lucide-react';
import { useState } from 'react';

export default function EditType({
    auth,
    leaveType,
    availableColors,
    availableIcons,
    usageStats,
}) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('basic');

    const { data, setData, put, processing, errors } = useForm({
        name: leaveType.name || '',
        code: leaveType.code || '',
        description: leaveType.description || '',
        days_per_year: leaveType.days_per_year || 0,
        is_paid: leaveType.is_paid || false,
        requires_medical_cert: leaveType.requires_medical_cert || false,
        medical_cert_days_threshold:
            leaveType.medical_cert_days_threshold || null,
        is_carry_over_allowed: leaveType.is_carry_over_allowed || false,
        max_carry_over_days: leaveType.max_carry_over_days || null,
        requires_manager_approval: leaveType.requires_manager_approval || true,
        requires_hr_approval: leaveType.requires_hr_approval || true,
        color: leaveType.color || '#3B82F6',
        icon: leaveType.icon || 'Calendar',
        sort_order: leaveType.sort_order || 0,
        gender_specific: leaveType.gender_specific || '',
        is_active: leaveType.is_active || true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('leave-types.update', leaveType.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('leave-types.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div className="h-8 w-px bg-gray-300" />
                        <div className="flex items-center gap-3">
                            <div
                                className="rounded-lg p-2"
                                style={{ backgroundColor: `${data.color}20` }}
                            >
                                <Settings
                                    className="h-6 w-6"
                                    style={{ color: data.color }}
                                />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Edit Leave Type
                                </h2>
                                <p className="mt-1 text-gray-600">
                                    Modify {leaveType.name} ({leaveType.code})
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            }
        >
            <Head title={`Edit ${leaveType.name}`} />

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
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="font-medium text-red-800">
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Usage Stats Alert */}
                <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        <strong>Usage:</strong> {usageStats.total_balances}{' '}
                        active balances, {usageStats.active_requests} pending
                        requests, {usageStats.total_days_used} days used total
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit}>
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-6"
                    >
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger
                                value="basic"
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger
                                value="allocation"
                                className="flex items-center gap-2"
                            >
                                <Calendar className="h-4 w-4" />
                                Allocation
                            </TabsTrigger>
                            <TabsTrigger
                                value="medical"
                                className="flex items-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                Medical Cert
                            </TabsTrigger>
                            <TabsTrigger
                                value="carryover"
                                className="flex items-center gap-2"
                            >
                                <Calendar className="h-4 w-4" />
                                Carry Over
                            </TabsTrigger>
                            <TabsTrigger
                                value="approval"
                                className="flex items-center gap-2"
                            >
                                <Shield className="h-4 w-4" />
                                Approval
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Configure the name, code, and appearance
                                        of this leave type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Leave Type Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g., Vacation Leave"
                                                className={
                                                    errors.name
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-600">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Code */}
                                        <div className="space-y-2">
                                            <Label htmlFor="code">Code *</Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={(e) =>
                                                    setData(
                                                        'code',
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                                placeholder="e.g., VL"
                                                maxLength={10}
                                                className={
                                                    errors.code
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.code && (
                                                <p className="text-sm text-red-600">
                                                    {errors.code}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description || ''}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Brief description of this leave type..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-6">
                                        {/* Color */}
                                        <div className="space-y-2">
                                            <Label htmlFor="color">
                                                Display Color *
                                            </Label>
                                            <Select
                                                value={data.color}
                                                onValueChange={(value) =>
                                                    setData('color', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-4 w-4 rounded"
                                                            style={{
                                                                backgroundColor:
                                                                    data.color,
                                                            }}
                                                        />
                                                        <SelectValue />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(
                                                        availableColors,
                                                    ).map(([hex, name]) => (
                                                        <SelectItem
                                                            key={hex}
                                                            value={hex}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="h-4 w-4 rounded"
                                                                    style={{
                                                                        backgroundColor:
                                                                            hex,
                                                                    }}
                                                                />
                                                                {name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Sort Order */}
                                        <div className="space-y-2">
                                            <Label htmlFor="sort_order">
                                                Display Order
                                            </Label>
                                            <Input
                                                id="sort_order"
                                                type="number"
                                                value={data.sort_order}
                                                onChange={(e) =>
                                                    setData(
                                                        'sort_order',
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                min={0}
                                            />
                                            <p className="text-xs text-gray-500">
                                                Lower numbers appear first
                                            </p>
                                        </div>

                                        {/* Gender Specific */}
                                        <div className="space-y-2">
                                            <Label htmlFor="gender_specific">
                                                Gender Restriction
                                            </Label>
                                            <Select
                                                value={
                                                    data.gender_specific ||
                                                    'none'
                                                }
                                                onValueChange={(value) =>
                                                    setData(
                                                        'gender_specific',
                                                        value === 'none'
                                                            ? null
                                                            : value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        No Restriction
                                                    </SelectItem>
                                                    <SelectItem value="male">
                                                        Male Only
                                                    </SelectItem>
                                                    <SelectItem value="female">
                                                        Female Only
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Active Status */}
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                        <div className="flex-1">
                                            <Label
                                                htmlFor="is_active"
                                                className="text-base font-semibold"
                                            >
                                                Active Status
                                            </Label>
                                            <p className="mt-1 text-sm text-gray-600">
                                                When active, employees can
                                                request this leave type
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData('is_active', checked)
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Allocation Tab */}
                        <TabsContent value="allocation" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Leave Allocation</CardTitle>
                                    <CardDescription>
                                        Configure how many days employees get
                                        per year
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Days Per Year */}
                                        <div className="space-y-2">
                                            <Label htmlFor="days_per_year">
                                                Days Per Year *
                                            </Label>
                                            <Input
                                                id="days_per_year"
                                                type="number"
                                                value={data.days_per_year}
                                                onChange={(e) =>
                                                    setData(
                                                        'days_per_year',
                                                        parseInt(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                min={0}
                                                max={365}
                                                className={
                                                    errors.days_per_year
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.days_per_year && (
                                                <p className="text-sm text-red-600">
                                                    {errors.days_per_year}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Total days allocated per year
                                            </p>
                                        </div>

                                        {/* Paid/Unpaid */}
                                        <div className="space-y-4">
                                            <Label>Payment Type *</Label>
                                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        Paid Leave
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Employee receives salary
                                                        during leave
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={data.is_paid}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            'is_paid',
                                                            checked,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Alert className="border-yellow-200 bg-yellow-50">
                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                        <AlertDescription className="text-yellow-800">
                                            <strong>Warning:</strong> Changing
                                            days per year will only affect
                                            future balances. Existing balances
                                            for the current year remain
                                            unchanged.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Medical Certificate Tab */}
                        <TabsContent value="medical" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Medical Certificate Requirements
                                    </CardTitle>
                                    <CardDescription>
                                        Configure when employees must submit
                                        medical documentation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                        <div className="flex-1">
                                            <Label className="text-base font-semibold">
                                                Require Medical Certificate
                                            </Label>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Employees must upload a doctor's
                                                note
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.requires_medical_cert}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'requires_medical_cert',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    {data.requires_medical_cert && (
                                        <div className="animate-fade-in space-y-2">
                                            <Label htmlFor="medical_cert_days_threshold">
                                                Days Threshold (Optional)
                                            </Label>
                                            <Input
                                                id="medical_cert_days_threshold"
                                                type="number"
                                                value={
                                                    data.medical_cert_days_threshold ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'medical_cert_days_threshold',
                                                        e.target.value
                                                            ? parseInt(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                                min={1}
                                                placeholder="e.g., 2"
                                            />
                                            <p className="text-xs text-gray-500">
                                                Require certificate only if
                                                leave exceeds this many days.
                                                Leave empty to always require.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Carry Over Tab */}
                        <TabsContent value="carryover" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Carry Over Rules</CardTitle>
                                    <CardDescription>
                                        Configure if unused days can transfer to
                                        the next year
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                        <div className="flex-1">
                                            <Label className="text-base font-semibold">
                                                Allow Carry Over
                                            </Label>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Unused days can be transferred
                                                to next year
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_carry_over_allowed}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_carry_over_allowed',
                                                    checked,
                                                )
                                            }
                                        />
                                    </div>

                                    {data.is_carry_over_allowed && (
                                        <div className="animate-fade-in space-y-2">
                                            <Label htmlFor="max_carry_over_days">
                                                Maximum Carry Over Days
                                                (Optional)
                                            </Label>
                                            <Input
                                                id="max_carry_over_days"
                                                type="number"
                                                value={
                                                    data.max_carry_over_days ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'max_carry_over_days',
                                                        e.target.value
                                                            ? parseInt(
                                                                  e.target
                                                                      .value,
                                                              )
                                                            : null,
                                                    )
                                                }
                                                min={0}
                                                placeholder="e.g., 5"
                                            />
                                            <p className="text-xs text-gray-500">
                                                Maximum days that can carry
                                                over. Leave empty for no limit.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Approval Workflow Tab */}
                        <TabsContent value="approval" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Approval Workflow</CardTitle>
                                    <CardDescription>
                                        Configure who must approve this leave
                                        type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                            <div className="flex-1">
                                                <Label className="text-base font-semibold">
                                                    Manager Approval Required
                                                </Label>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Leave must be approved by
                                                    employee's manager
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    data.requires_manager_approval
                                                }
                                                onCheckedChange={(checked) =>
                                                    setData(
                                                        'requires_manager_approval',
                                                        checked,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                            <div className="flex-1">
                                                <Label className="text-base font-semibold">
                                                    HR Approval Required
                                                </Label>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Leave must be approved by HR
                                                    department
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    data.requires_hr_approval
                                                }
                                                onCheckedChange={(checked) =>
                                                    setData(
                                                        'requires_hr_approval',
                                                        checked,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <Alert className="border-blue-200 bg-blue-50">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            <strong>Approval Flow:</strong>{' '}
                                            {data.requires_manager_approval &&
                                                data.requires_hr_approval &&
                                                'Manager → HR'}
                                            {data.requires_manager_approval &&
                                                !data.requires_hr_approval &&
                                                'Manager Only'}
                                            {!data.requires_manager_approval &&
                                                data.requires_hr_approval &&
                                                'HR Only'}
                                            {!data.requires_manager_approval &&
                                                !data.requires_hr_approval &&
                                                'Auto-approved (not recommended)'}
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Fixed Bottom Bar */}
                    <Card className="sticky bottom-4 border-2 shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('leave-types.index')}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
