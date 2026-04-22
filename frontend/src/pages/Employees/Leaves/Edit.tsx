import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch } from '@/lib/spring-boot-api';
import type {
    LeaveApplicationResponse,
    LeaveBalanceResponse,
    LeaveTypeResponse,
} from '@/types';
import { AlertCircle, Edit2, Info, Loader2, Phone, Save } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';

interface FormData {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    useDefaultEmergencyContact: boolean;
    availability: string;
}

interface FormErrors {
    leaveTypeId?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
    [key: string]: string | undefined;
}

export default function EditLeave() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [leave, setLeave] = useState<LeaveApplicationResponse | null>(null);
    const [leaveTypes, setLeaveTypes] = useState<LeaveTypeResponse[]>([]);
    const [balances, setBalances] = useState<LeaveBalanceResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [processing, setProcessing] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [errorMsg, setErrorMsg] = useState<string>('');

    const [form, setForm] = useState<FormData>({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        useDefaultEmergencyContact: false,
        availability: 'REACHABLE',
    });

    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypeResponse | null>(null);
    const [calculatedDays, setCalculatedDays] = useState<number>(0);

    const fetchData = useCallback(async () => {
        try {
            const [leaveRes, typesRes, balancesRes] = await Promise.allSettled([
                apiFetch(`/leave-applications/${id}`),
                apiFetch('/leave-types/active'),
                apiFetch('/leave-applications/balances/my'),
            ]);

            if (leaveRes.status === 'fulfilled' && leaveRes.value.ok) {
                const json = await leaveRes.value.json();
                const data: LeaveApplicationResponse = json.data;
                setLeave(data);
                setForm({
                    leaveTypeId: data.leaveTypeId.toString(),
                    startDate: data.startDate.split('T')[0],
                    endDate: data.endDate.split('T')[0],
                    reason: data.reason || '',
                    emergencyContactName: data.emergencyContactName || '',
                    emergencyContactPhone: data.emergencyContactPhone || '',
                    useDefaultEmergencyContact: false,
                    availability: data.availability || 'REACHABLE',
                });
                setCalculatedDays(data.totalDays);
            }

            if (typesRes.status === 'fulfilled' && typesRes.value.ok) {
                const json = await typesRes.value.json();
                setLeaveTypes(json.data || []);
            }

            if (balancesRes.status === 'fulfilled' && balancesRes.value.ok) {
                const json = await balancesRes.value.json();
                setBalances(json.data || []);
            }
        } catch {
            setErrorMsg('Failed to load leave request.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Update selected leave type
    useEffect(() => {
        if (form.leaveTypeId && leaveTypes.length > 0) {
            const lt = leaveTypes.find(
                (t) => t.id === parseInt(form.leaveTypeId),
            );
            setSelectedLeaveType(lt || null);
        } else {
            setSelectedLeaveType(null);
        }
    }, [form.leaveTypeId, leaveTypes]);

    // Calculate days
    useEffect(() => {
        if (form.startDate && form.endDate) {
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            setCalculatedDays(diff > 0 ? diff : 0);
        } else {
            setCalculatedDays(0);
        }
    }, [form.startDate, form.endDate]);

    const updateForm = <K extends keyof FormData>(key: K, value: FormData[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const selectedBalance = form.leaveTypeId
        ? balances.find((b) => b.leaveTypeId === parseInt(form.leaveTypeId))
        : null;

    const hasSufficientBalance = selectedBalance
        ? selectedBalance.remainingDays >= calculatedDays
        : true;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const body: Record<string, unknown> = {
                leaveTypeId: parseInt(form.leaveTypeId),
                startDate: form.startDate,
                endDate: form.endDate,
                reason: form.reason,
                emergencyContactName: form.emergencyContactName || undefined,
                emergencyContactPhone: form.emergencyContactPhone || undefined,
                useDefaultEmergencyContact: form.useDefaultEmergencyContact,
                availability: form.availability,
            };

            const res = await apiFetch(`/leave-applications/${id}`, {
                method: 'PUT',
                body: JSON.stringify(body),
            });

            const json = await res.json();

            if (res.ok) {
                navigate(`/my-leaves/${id}`);
            } else {
                if (json.errors) {
                    setErrors(json.errors as FormErrors);
                } else {
                    setErrors({ reason: json.message || 'Failed to update leave request.' });
                }
            }
        } catch {
            setErrors({ reason: 'Failed to update leave request.' });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    if (!leave || leave.status !== 'PENDING_MANAGER') {
        return (
            <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                    {!leave ? 'Leave Request Not Found' : 'Cannot Edit This Request'}
                </h1>
                <p className="text-gray-600">
                    {!leave
                        ? 'The leave request could not be found.'
                        : 'Only pending manager requests can be edited.'}
                </p>
                <Link to="/my-leaves" className="text-blue-600 hover:underline">
                    Back to My Leaves
                </Link>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Edit Leave Request</title>
            </Helmet>

            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:block rounded-lg bg-blue-100 p-2">
                            <Edit2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-3xl font-bold text-gray-900">
                                Edit Leave Request
                            </h2>
                            <p className="hidden lg:block mt-1 text-gray-600">
                                Modify your pending leave request
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {errorMsg && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="font-medium text-red-800">
                            {errorMsg}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Leave Type & Dates */}
                            <Card className="animate-fade-in">
                                <CardHeader>
                                    <CardTitle>Leave Details</CardTitle>
                                    <CardDescription>
                                        Update leave type and dates
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="leaveTypeId">
                                            Leave Type *
                                        </Label>
                                        <Select
                                            value={form.leaveTypeId}
                                            onValueChange={(value) =>
                                                updateForm('leaveTypeId', value)
                                            }
                                        >
                                            <SelectTrigger
                                                className={
                                                    errors.leaveTypeId
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            >
                                                <SelectValue placeholder="Select leave type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leaveTypes.length > 0 ? (
                                                    leaveTypes.map((lt) => (
                                                        <SelectItem
                                                            key={lt.id}
                                                            value={lt.id.toString()}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span>
                                                                    {lt.name}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    ({lt.code})
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem
                                                        value="none"
                                                        disabled
                                                    >
                                                        No leave types available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.leaveTypeId && (
                                            <p className="text-sm text-red-500">
                                                {errors.leaveTypeId}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="startDate">
                                                Start Date *
                                            </Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={form.startDate}
                                                onChange={(e) =>
                                                    updateForm('startDate', e.target.value)
                                                }
                                                min={
                                                    new Date()
                                                        .toISOString()
                                                        .split('T')[0]
                                                }
                                                className={
                                                    errors.startDate
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.startDate && (
                                                <p className="text-sm text-red-500">
                                                    {errors.startDate}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="endDate">
                                                End Date *
                                            </Label>
                                            <Input
                                                id="endDate"
                                                type="date"
                                                value={form.endDate}
                                                onChange={(e) =>
                                                    updateForm('endDate', e.target.value)
                                                }
                                                min={
                                                    form.startDate ||
                                                    new Date()
                                                        .toISOString()
                                                        .split('T')[0]
                                                }
                                                className={
                                                    errors.endDate
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.endDate && (
                                                <p className="text-sm text-red-500">
                                                    {errors.endDate}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Days Calculation */}
                                    {calculatedDays > 0 && (
                                        <Alert className="border-blue-200 bg-blue-50">
                                            <Info className="h-4 w-4 text-blue-600" />
                                            <AlertDescription className="text-blue-800">
                                                <strong>Total:</strong>{' '}
                                                {calculatedDays}{' '}
                                                {calculatedDays === 1
                                                    ? 'day'
                                                    : 'days'}
                                                {selectedBalance && (
                                                    <>
                                                        {' '}
                                                        ·{' '}
                                                        <strong>
                                                            Remaining after:
                                                        </strong>{' '}
                                                        {selectedBalance.remainingDays -
                                                            calculatedDays}{' '}
                                                        days
                                                    </>
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Insufficient Balance Warning */}
                                    {!hasSufficientBalance && selectedBalance && (
                                        <Alert className="border-red-200 bg-red-50">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                            <AlertDescription className="text-red-800">
                                                <strong>
                                                    Insufficient balance!
                                                </strong>{' '}
                                                You only have{' '}
                                                {selectedBalance.remainingDays}{' '}
                                                days remaining but requested{' '}
                                                {calculatedDays} days.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Reason */}
                            <Card className="animate-fade-in animation-delay-100">
                                <CardHeader>
                                    <CardTitle>Request Details</CardTitle>
                                    <CardDescription>
                                        Provide reason for your leave
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reason">
                                            Reason for Leave *
                                        </Label>
                                        <Textarea
                                            id="reason"
                                            value={form.reason}
                                            onChange={(e) =>
                                                updateForm('reason', e.target.value)
                                            }
                                            placeholder="Please provide a detailed reason for the leave request..."
                                            rows={4}
                                            className={
                                                errors.reason
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                        />
                                        {errors.reason && (
                                            <p className="text-sm text-red-500">
                                                {errors.reason}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="availability">
                                            Availability During Leave
                                        </Label>
                                        <Select
                                            value={form.availability}
                                            onValueChange={(value) =>
                                                updateForm('availability', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="REACHABLE">
                                                    Reachable - Can respond to
                                                    urgent matters
                                                </SelectItem>
                                                <SelectItem value="OFFLINE">
                                                    Completely Offline
                                                </SelectItem>
                                                <SelectItem value="EMERGENCY_ONLY">
                                                    Emergency Only
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Emergency Contact */}
                            <Card className="animate-fade-in animation-delay-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="h-5 w-5" />
                                        Emergency Contact During Leave
                                    </CardTitle>
                                    <CardDescription>
                                        Who should we contact in case of
                                        emergency?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4">
                                        <Checkbox
                                            id="use_default"
                                            checked={
                                                form.useDefaultEmergencyContact
                                            }
                                            onCheckedChange={(checked) => {
                                                updateForm(
                                                    'useDefaultEmergencyContact',
                                                    checked === true,
                                                );
                                            }}
                                        />
                                        <Label
                                            htmlFor="use_default"
                                            className="flex-1 cursor-pointer"
                                        >
                                            Use my default emergency contact
                                            from profile
                                        </Label>
                                    </div>

                                    {!form.useDefaultEmergencyContact && (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="emergencyContactName">
                                                    Contact Name *
                                                </Label>
                                                <Input
                                                    id="emergencyContactName"
                                                    value={
                                                        form.emergencyContactName
                                                    }
                                                    onChange={(e) =>
                                                        updateForm(
                                                            'emergencyContactName',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="emergencyContactPhone">
                                                    Contact Phone *
                                                </Label>
                                                <Input
                                                    id="emergencyContactPhone"
                                                    value={
                                                        form.emergencyContactPhone
                                                    }
                                                    onChange={(e) =>
                                                        updateForm(
                                                            'emergencyContactPhone',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="+63 912 345 6789"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <div className="flex items-center gap-3">
                                <Button
                                    type="submit"
                                    disabled={
                                        processing || !hasSufficientBalance
                                    }
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update Leave Request
                                        </>
                                    )}
                                </Button>

                                <Button type="button" variant="outline" asChild>
                                    <Link to={`/my-leaves/${id}`}>
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="space-y-6">
                        {/* Leave Balance Preview */}
                        {selectedBalance && (
                            <Card className="animate-fade-in animation-delay-100">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {selectedLeaveType?.name} Balance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-baseline gap-2">
                                            <span
                                                className={`text-4xl font-bold ${selectedBalance.remainingDays < 5 ? 'text-red-600' : 'text-gray-900'}`}
                                            >
                                                {selectedBalance.remainingDays}
                                            </span>
                                            <span className="text-gray-600">
                                                days remaining
                                            </span>
                                        </div>

                                        <Progress
                                            value={
                                                (selectedBalance.remainingDays /
                                                    selectedBalance.totalDays) *
                                                100
                                            }
                                            className="h-2"
                                        />

                                        <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
                                            <div>
                                                <p className="text-gray-600">
                                                    Total
                                                </p>
                                                <p className="font-semibold">
                                                    {selectedBalance.totalDays}{' '}
                                                    days
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">
                                                    Used
                                                </p>
                                                <p className="font-semibold">
                                                    {selectedBalance.usedDays}{' '}
                                                    days
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
