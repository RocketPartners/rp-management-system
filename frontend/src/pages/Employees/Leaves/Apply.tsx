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
import { useAuth } from '@/contexts/auth-context';
import { apiFetch } from '@/lib/spring-boot-api';
import type {
    LeaveBalanceResponse,
    LeaveTypeResponse,
    PotentialApprover,
} from '@/types';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Info,
    Loader2,
    Phone,
    Send,
    XCircle,
} from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

interface FormData {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    useDefaultEmergencyContact: boolean;
    availability: string;
    managerId: string;
    duration: string;
}

interface FormErrors {
    leaveTypeId?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
    [key: string]: string | undefined;
}

export default function Apply() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [leaveTypes, setLeaveTypes] = useState<LeaveTypeResponse[]>([]);
    const [balances, setBalances] = useState<LeaveBalanceResponse[]>([]);
    const [approvers, setApprovers] = useState<PotentialApprover[]>([]);
    const [processing, setProcessing] = useState<boolean>(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const [form, setForm] = useState<FormData>({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        useDefaultEmergencyContact: true,
        availability: 'REACHABLE',
        managerId: 'auto',
        duration: 'FULL_DAY',
    });

    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypeResponse | null>(null);
    const [calculatedDays, setCalculatedDays] = useState<number>(0);

    const fetchFormData = useCallback(async () => {
        try {
            const [typesRes, balancesRes, approversRes, defaultApproverRes] = await Promise.allSettled([
                apiFetch('/leave-types/active'),
                apiFetch('/leave-applications/balances/my'),
                apiFetch('/users/potential-approvers'),
                apiFetch('/teams/my-default-approver'),
            ]);

            if (typesRes.status === 'fulfilled' && typesRes.value.ok) {
                const json = await typesRes.value.json();
                setLeaveTypes(json.data || []);
            }

            if (balancesRes.status === 'fulfilled' && balancesRes.value.ok) {
                const json = await balancesRes.value.json();
                setBalances(json.data || []);
            }

            if (approversRes.status === 'fulfilled' && approversRes.value.ok) {
                const json = await approversRes.value.json();
                setApprovers(json.data || []);
            }

            // Auto-prefill: set manager to primary team leader if available
            if (defaultApproverRes.status === 'fulfilled' && defaultApproverRes.value.ok) {
                const json = await defaultApproverRes.value.json();
                const approverId = json.data?.approverId;
                if (approverId) {
                    setForm((prev) => ({ ...prev, managerId: String(approverId) }));
                }
            }
        } catch {
            // Silent fail
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFormData();
    }, [fetchFormData]);

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
                duration: form.duration,
                emergencyContactName: form.emergencyContactName || undefined,
                emergencyContactPhone: form.emergencyContactPhone || undefined,
                useDefaultEmergencyContact: form.useDefaultEmergencyContact,
                availability: form.availability,
            };

            if (form.managerId && form.managerId !== 'auto') {
                body.managerId = parseInt(form.managerId);
            }

            const res = await apiFetch('/leave-applications', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            const json = await res.json();

            if (res.ok) {
                setSuccessMsg('Leave request submitted successfully!');
                setTimeout(() => navigate('/my-leaves'), 1500);
            } else {
                if (json.errors) {
                    setErrors(json.errors as FormErrors);
                } else {
                    setErrors({ reason: json.message || 'Failed to submit leave request.' });
                }
            }
        } catch {
            setErrors({ reason: 'Failed to submit leave request.' });
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

    return (
        <>
            <Helmet>
                <title>Apply for Leave</title>
            </Helmet>

            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/my-leaves">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div className="h-8 w-px bg-gray-300" />
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Apply for Leave
                                </h2>
                                <p className="mt-1 text-gray-600">
                                    Submit a new leave request
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Flash Messages */}
                {successMsg && (
                    <Alert className="animate-fade-in border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="font-medium text-green-800">
                            {successMsg}
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
                                        Select leave type and dates
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
                                                    leaveTypes.map((lt) => {
                                                        const bal = balances.find(
                                                            (b) => b.leaveTypeId === lt.id,
                                                        );
                                                        return (
                                                            <SelectItem
                                                                key={lt.id}
                                                                value={lt.id.toString()}
                                                            >
                                                                <div className="flex w-full items-center justify-between">
                                                                    <span>
                                                                        {lt.name} ({lt.code})
                                                                    </span>
                                                                    {bal && (
                                                                        <span className="ml-2 text-xs text-gray-500">
                                                                            {bal.remainingDays} days left
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })
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
                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                <AlertCircle className="h-4 w-4" />
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

                                    {/* Days Calculation Display */}
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

                            {/* Reason & Availability */}
                            <Card className="animate-fade-in animation-delay-100">
                                <CardHeader>
                                    <CardTitle>Request Details</CardTitle>
                                    <CardDescription>
                                        Provide reason and supporting documents
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

                                    <div className="space-y-2">
                                        <Label htmlFor="managerId">
                                            Leave Approver (Optional)
                                        </Label>
                                        <Select
                                            value={form.managerId}
                                            onValueChange={(value) =>
                                                updateForm('managerId', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Auto (Based on Role Hierarchy)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="auto">
                                                    Auto (Based on Role
                                                    Hierarchy)
                                                </SelectItem>
                                                {approvers.map((approver) => (
                                                    <SelectItem
                                                        key={approver.id}
                                                        value={String(approver.id)}
                                                    >
                                                        {approver.name}
                                                        {approver.employeeId
                                                            ? ` (${approver.employeeId})`
                                                            : ''}
                                                        {' - '}
                                                        {approver.position ||
                                                            approver.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500">
                                            Select who should approve this leave
                                            request. Leave blank for automatic
                                            assignment based on role hierarchy.
                                        </p>
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
                                                    placeholder="Jane Doe"
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
                            <Card className="animate-fade-in animation-delay-300">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-600">
                                            Fields marked with * are required
                                        </p>
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link to="/my-leaves">
                                                    Cancel
                                                </Link>
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    processing ||
                                                    !hasSufficientBalance
                                                }
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {processing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Submit Request
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </div>

                    {/* Sidebar - Summary */}
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
                                            <span className="text-gray-500">
                                                / {selectedBalance.totalDays}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            days remaining
                                        </p>

                                        <Progress
                                            value={
                                                (selectedBalance.remainingDays /
                                                    selectedBalance.totalDays) *
                                                100
                                            }
                                            className="h-2"
                                        />
                                    </div>

                                    <div className="space-y-2 border-t pt-4 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Total allocated:
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {selectedBalance.totalDays}{' '}
                                                days
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Used:
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {selectedBalance.usedDays} days
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Remaining:
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {selectedBalance.remainingDays}{' '}
                                                days
                                            </span>
                                        </div>
                                    </div>

                                    {calculatedDays > 0 && (
                                        <div className="border-t pt-4">
                                            <div className="rounded-lg bg-blue-50 p-3">
                                                <p className="mb-1 text-xs font-medium text-blue-600">
                                                    After this request:
                                                </p>
                                                <p
                                                    className={`text-2xl font-bold ${selectedBalance.remainingDays - calculatedDays < 0 ? 'text-red-600' : 'text-blue-900'}`}
                                                >
                                                    {selectedBalance.remainingDays -
                                                        calculatedDays}{' '}
                                                    days
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Leave Type Info */}
                        {selectedLeaveType && (
                            <Card className="animate-fade-in animation-delay-300">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Leave Type Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        {selectedLeaveType.isPaid ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <span className="text-gray-700">
                                            {selectedLeaveType.isPaid
                                                ? 'Paid Leave'
                                                : 'Unpaid Leave'}
                                        </span>
                                    </div>

                                    {selectedLeaveType.requiresMedicalCert && (
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="mt-0.5 h-4 w-4 text-orange-600" />
                                            <span className="text-gray-700">
                                                Medical certificate required
                                                {selectedLeaveType.medicalCertDaysThreshold &&
                                                    ` for leaves over ${selectedLeaveType.medicalCertDaysThreshold} days`}
                                            </span>
                                        </div>
                                    )}

                                    {selectedLeaveType.description && (
                                        <p className="border-t pt-3 text-gray-600">
                                            {selectedLeaveType.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
