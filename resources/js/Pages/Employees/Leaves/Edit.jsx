// resources/js/Pages/Employees/Leaves/Edit.jsx
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Progress } from '@/Components/ui/progress';
import {
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    Phone,
    Info,
    Edit2,
} from 'lucide-react';

export default function Edit({ auth, leaveRequest = {}, leaveTypes = [], leaveBalances = {}, user }) {
    const { data, setData, put, processing, errors } = useForm({
        leave_type_id: leaveRequest?.leave_type_id?.toString() || '',
        start_date: leaveRequest?.start_date ? leaveRequest.start_date.split('T')[0] : '',
        end_date: leaveRequest?.end_date ? leaveRequest.end_date.split('T')[0] : '',
        reason: leaveRequest?.reason || '',
        emergency_contact_name: leaveRequest?.emergency_contact_name || '',
        emergency_contact_phone: leaveRequest?.emergency_contact_phone || '',
        use_default_emergency_contact: false,
        availability: leaveRequest?.availability || 'reachable',
    });

    const [selectedLeaveType, setSelectedLeaveType] = useState(null);
    const [calculatedDays, setCalculatedDays] = useState(leaveRequest?.total_days || 0);

    useEffect(() => {
        if (data.leave_type_id && Array.isArray(leaveTypes) && leaveTypes.length > 0) {
            const leaveType = leaveTypes.find(lt => lt.id === parseInt(data.leave_type_id));
            setSelectedLeaveType(leaveType || null);
        }
    }, [data.leave_type_id, leaveTypes]);

    useEffect(() => {
        if (data.start_date && data.end_date) {
            calculateDays();
        } else {
            setCalculatedDays(0);
        }
    }, [data.start_date, data.end_date]);

    const calculateDays = () => {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(daysDiff);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('my-leaves.update', leaveRequest.id));
    };

    const selectedBalance = data.leave_type_id ? leaveBalances[data.leave_type_id] : null;
    const hasSufficientBalance = selectedBalance
        ? selectedBalance.remaining_days >= calculatedDays
        : true;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Edit2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Edit Leave Request</h2>
                            <p className="text-gray-600 mt-1">
                                Modify your pending leave request
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Edit Leave Request" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Leave Type & Dates */}
                            <Card className="animate-fade-in">
                                <CardHeader>
                                    <CardTitle>Leave Details</CardTitle>
                                    <CardDescription>Update leave type and dates</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="leave_type_id">Leave Type *</Label>
                                        <Select value={data.leave_type_id} onValueChange={(value) => setData('leave_type_id', value)}>
                                            <SelectTrigger className={errors.leave_type_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select leave type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.isArray(leaveTypes) && leaveTypes.length > 0 ? (
                                                    leaveTypes.map((leaveType) => (
                                                        <SelectItem key={leaveType.id} value={leaveType.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <span>{leaveType.name}</span>
                                                                <span className="text-xs text-gray-500">({leaveType.code})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="none" disabled>No leave types available</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.leave_type_id && (
                                            <p className="text-sm text-red-500">{errors.leave_type_id}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date">Start Date *</Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className={errors.start_date ? 'border-red-500' : ''}
                                            />
                                            {errors.start_date && (
                                                <p className="text-sm text-red-500">{errors.start_date}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">End Date *</Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                                min={data.start_date || new Date().toISOString().split('T')[0]}
                                                className={errors.end_date ? 'border-red-500' : ''}
                                            />
                                            {errors.end_date && (
                                                <p className="text-sm text-red-500">{errors.end_date}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Days Calculation Display */}
                                    {calculatedDays > 0 && (
                                        <Alert className="bg-blue-50 border-blue-200">
                                            <Info className="h-4 w-4 text-blue-600" />
                                            <AlertDescription className="text-blue-800">
                                                <strong>Total:</strong> {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
                                                {selectedBalance && (
                                                    <> · <strong>Remaining after:</strong> {selectedBalance.remaining_days - calculatedDays} days</>
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Insufficient Balance Warning */}
                                    {!hasSufficientBalance && selectedBalance && (
                                        <Alert className="bg-red-50 border-red-200">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                            <AlertDescription className="text-red-800">
                                                <strong>Insufficient balance!</strong> You only have {selectedBalance.remaining_days} days remaining but requested {calculatedDays} days.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Reason */}
                            <Card className="animate-fade-in animation-delay-100">
                                <CardHeader>
                                    <CardTitle>Request Details</CardTitle>
                                    <CardDescription>Provide reason for your leave</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reason">Reason for Leave *</Label>
                                        <Textarea
                                            id="reason"
                                            value={data.reason}
                                            onChange={(e) => setData('reason', e.target.value)}
                                            placeholder="Please provide a detailed reason for the leave request..."
                                            rows={4}
                                            className={errors.reason ? 'border-red-500' : ''}
                                        />
                                        {errors.reason && (
                                            <p className="text-sm text-red-500">{errors.reason}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="availability">Availability During Leave</Label>
                                        <Select value={data.availability} onValueChange={(value) => setData('availability', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="reachable">Reachable - Can respond to urgent matters</SelectItem>
                                                <SelectItem value="offline">Completely Offline</SelectItem>
                                                <SelectItem value="emergency_only">Emergency Only</SelectItem>
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
                                    <CardDescription>Who should we contact in case of emergency?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                        <Checkbox
                                            id="use_default"
                                            checked={data.use_default_emergency_contact}
                                            onCheckedChange={(checked) => {
                                                setData('use_default_emergency_contact', checked);
                                                if (checked) {
                                                    setData('emergency_contact_name', user?.emergency_contact_name || '');
                                                    setData('emergency_contact_phone', user?.emergency_contact_phone || '');
                                                }
                                            }}
                                        />
                                        <Label htmlFor="use_default" className="cursor-pointer flex-1">
                                            Use my default emergency contact from profile
                                            {user?.emergency_contact_name && (
                                                <span className="block text-sm text-gray-600 mt-1">
                                                    {user.emergency_contact_name} - {user.emergency_contact_phone}
                                                </span>
                                            )}
                                        </Label>
                                    </div>

                                    {!data.use_default_emergency_contact && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="emergency_contact_name">Contact Name *</Label>
                                                <Input
                                                    id="emergency_contact_name"
                                                    value={data.emergency_contact_name}
                                                    onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="emergency_contact_phone">Contact Phone *</Label>
                                                <Input
                                                    id="emergency_contact_phone"
                                                    value={data.emergency_contact_phone}
                                                    onChange={(e) => setData('emergency_contact_phone', e.target.value)}
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
                                    disabled={processing || !hasSufficientBalance}
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

                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                >
                                    <Link href={route('my-leaves.show', leaveRequest.id)}>
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
                                            <span className={`text-4xl font-bold ${selectedBalance.remaining_days < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {selectedBalance.remaining_days}
                                            </span>
                                            <span className="text-gray-600">days remaining</span>
                                        </div>

                                        <Progress
                                            value={(selectedBalance.remaining_days / selectedBalance.total_days) * 100}
                                            className="h-2"
                                        />

                                        <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
                                            <div>
                                                <p className="text-gray-600">Total</p>
                                                <p className="font-semibold">{selectedBalance.total_days} days</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Used</p>
                                                <p className="font-semibold">{selectedBalance.used_days} days</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
