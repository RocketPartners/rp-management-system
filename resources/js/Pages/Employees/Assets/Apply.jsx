// resources/js/Pages/Employees/Leaves/Apply.jsx
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
    Calendar,
    ArrowLeft,
    Send,
    Loader2,
    AlertCircle,
    Clock,
    Upload,
    Phone,
    CheckCircle2,
    XCircle,
    Info,
    FileText,
    UserCheck,
} from 'lucide-react';

export default function Apply({ auth, leaveTypes = [], leaveBalances = {}, user, managers = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        duration: 'full_day',
        custom_start_time: '',
        custom_end_time: '',
        reason: '',
        attachment: null,
        emergency_contact_name: user?.emergency_contact_name || '',
        emergency_contact_phone: user?.emergency_contact_phone || '',
        use_default_emergency_contact: true,
        availability: 'reachable',
        manager_id: user?.manager_id?.toString() || '',
    });

    const [selectedLeaveType, setSelectedLeaveType] = useState(null);
    const [calculatedDays, setCalculatedDays] = useState(0);
    const [filePreview, setFilePreview] = useState(null);

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
    }, [data.start_date, data.end_date, data.duration]);

    const calculateDays = () => {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        let total = 0;
        switch (data.duration) {
            case 'half_day_am':
            case 'half_day_pm':
            case 'custom_hours':
                total = 0.5;
                break;
            case 'full_day':
            default:
                total = daysDiff;
                break;
        }

        setCalculatedDays(total);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('attachment', file);
            setFilePreview(file.name);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('my-leaves.store'));
    };

    const selectedBalance = data.leave_type_id 
        ? leaveBalances[data.leave_type_id] 
        : null;

    const hasSufficientBalance = selectedBalance 
        ? selectedBalance.remaining_days >= calculatedDays 
        : true;

    const requiresMedicalCert = selectedLeaveType?.requires_medical_cert && 
        (selectedLeaveType.medical_cert_days_threshold === null || 
         calculatedDays > selectedLeaveType.medical_cert_days_threshold);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('my-leaves.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Apply for Leave</h2>
                                <p className="text-gray-600 mt-1">Submit your leave request</p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Apply for Leave" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Leave Type & Dates */}
                        <Card className="animate-fade-in">
                            <CardHeader>
                                <CardTitle>Leave Details</CardTitle>
                                <CardDescription>Select leave type and dates</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="leave_type_id">Leave Type *</Label>
                                    <Select 
                                        value={data.leave_type_id.toString()} 
                                        onValueChange={(value) => setData('leave_type_id', value)}
                                    >
                                        <SelectTrigger className={errors.leave_type_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select leave type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(leaveTypes) && leaveTypes.length > 0 ? (
                                                leaveTypes.map((leaveType) => {
                                                    const balance = leaveBalances[leaveType.id];
                                                    return (
                                                        <SelectItem key={leaveType.id} value={leaveType.id.toString()}>
                                                            <div className="flex items-center justify-between w-full">
                                                                <span>{leaveType.name} ({leaveType.code})</span>
                                                                {balance && (
                                                                    <span className="ml-2 text-xs text-gray-500">
                                                                        {balance.remaining_days} days left
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })
                                            ) : (
                                                <SelectItem value="none" disabled>No leave types available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.leave_type_id && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.leave_type_id}
                                        </p>
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

                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration *</Label>
                                    <Select value={data.duration} onValueChange={(value) => setData('duration', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="full_day">Full Day(s)</SelectItem>
                                            <SelectItem value="half_day_am">Half Day - Morning (8 AM - 12 PM)</SelectItem>
                                            <SelectItem value="half_day_pm">Half Day - Afternoon (1 PM - 5 PM)</SelectItem>
                                            <SelectItem value="custom_hours">Custom Hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {data.duration === 'custom_hours' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="custom_start_time">Start Time</Label>
                                            <Input
                                                id="custom_start_time"
                                                type="time"
                                                value={data.custom_start_time}
                                                onChange={(e) => setData('custom_start_time', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="custom_end_time">End Time</Label>
                                            <Input
                                                id="custom_end_time"
                                                type="time"
                                                value={data.custom_end_time}
                                                onChange={(e) => setData('custom_end_time', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {calculatedDays > 0 && (
                                    <Alert className={hasSufficientBalance ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}>
                                        {hasSufficientBalance ? (
                                            <Info className="h-4 w-4 text-blue-600" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        <AlertDescription className={hasSufficientBalance ? 'text-blue-800' : 'text-red-800'}>
                                            {hasSufficientBalance ? (
                                                <>
                                                    <strong>Total:</strong> {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
                                                    {selectedBalance && (
                                                        <> · <strong>Remaining after:</strong> {selectedBalance.remaining_days - calculatedDays} days</>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <strong>Insufficient balance!</strong> You have {selectedBalance.remaining_days} days but requested {calculatedDays} days.
                                                </>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Manager Selection */}
                        <Card className="animate-fade-in animation-delay-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserCheck className="h-5 w-5" />
                                    Manager Approval
                                </CardTitle>
                                <CardDescription>
                                    Your leave request will be sent to this manager first
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="manager_id">Select Manager *</Label>
                                    <Select 
                                        value={data.manager_id.toString()} 
                                        onValueChange={(value) => setData('manager_id', value)}
                                    >
                                        <SelectTrigger className={errors.manager_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select your manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(managers) && managers.length > 0 ? (
                                                managers.map((manager) => (
                                                    <SelectItem key={manager.id} value={manager.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                                                                <span className="text-xs font-medium text-white">
                                                                    {manager.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">{manager.name}</span>
                                                                {manager.position && (
                                                                    <span className="text-xs text-gray-500 ml-2">
                                                                        - {manager.position}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>No managers available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.manager_id && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.manager_id}
                                        </p>
                                    )}
                                    {user?.manager && data.manager_id === user.manager_id?.toString() && (
                                        <p className="text-xs text-blue-600 flex items-center gap-1">
                                            <Info className="h-3 w-3" />
                                            Your assigned manager
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reason & Attachment */}
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle>Request Details</CardTitle>
                                <CardDescription>Why do you need this leave?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason for Leave *</Label>
                                    <Textarea
                                        id="reason"
                                        value={data.reason}
                                        onChange={(e) => setData('reason', e.target.value)}
                                        placeholder="Please provide a detailed reason for your leave request..."
                                        rows={4}
                                        className={errors.reason ? 'border-red-500' : ''}
                                    />
                                    {errors.reason && (
                                        <p className="text-sm text-red-500">{errors.reason}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="attachment">
                                        Medical Certificate / Supporting Document
                                        {requiresMedicalCert && <span className="text-red-600 ml-1">*</span>}
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            id="attachment"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('attachment').click()}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Choose File
                                        </Button>
                                        {filePreview && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FileText className="h-4 w-4" />
                                                {filePreview}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PDF, JPG, PNG up to 5MB
                                        {requiresMedicalCert && ' · Medical certificate required for this leave'}
                                    </p>
                                    {errors.attachment && (
                                        <p className="text-sm text-red-500">{errors.attachment}</p>
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
                                        Use my default emergency contact
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
                                                placeholder="Jane Doe"
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
                        <Card className="animate-fade-in animation-delay-300">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Fields marked with * are required
                                    </p>
                                    <div className="flex gap-3">
                                        <Button type="button" variant="outline" asChild>
                                            <Link href={route('my-leaves.index')}>Cancel</Link>
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={processing || !hasSufficientBalance} 
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>
                                            ) : (
                                                <><Send className="h-4 w-4 mr-2" />Submit Request</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>

                {/* Sidebar - Balance Preview */}
                <div className="space-y-6">
                    {/* Leave Balance Preview */}
                    {selectedBalance && (
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle className="text-lg">{selectedLeaveType?.name} Balance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-4xl font-bold ${selectedBalance.remaining_days < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                            {selectedBalance.remaining_days}
                                        </span>
                                        <span className="text-gray-500">/ {selectedBalance.total_days}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">days remaining</p>
                                    
                                    <Progress 
                                        value={(selectedBalance.remaining_days / selectedBalance.total_days) * 100} 
                                        className="h-2"
                                    />
                                </div>

                                <div className="pt-4 border-t space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total allocated:</span>
                                        <span className="font-medium text-gray-900">{selectedBalance.total_days} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Used:</span>
                                        <span className="font-medium text-gray-900">{selectedBalance.used_days} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Remaining:</span>
                                        <span className="font-medium text-gray-900">{selectedBalance.remaining_days} days</span>
                                    </div>
                                </div>

                                {calculatedDays > 0 && (
                                    <div className="pt-4 border-t">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <p className="text-xs text-blue-600 font-medium mb-1">After this request:</p>
                                            <p className={`text-2xl font-bold ${(selectedBalance.remaining_days - calculatedDays) < 0 ? 'text-red-600' : 'text-blue-900'}`}>
                                                {selectedBalance.remaining_days - calculatedDays} days
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Approval Process Info */}
                    <Card className="animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle className="text-lg">Approval Process</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full flex-shrink-0">
                                        <span className="text-sm font-bold text-yellow-700">1</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Manager Review</p>
                                        {data.manager_id && (() => {
                                            const selectedManager = Array.isArray(managers) 
                                                ? managers.find(m => m.id === parseInt(data.manager_id))
                                                : null;
                                            return selectedManager ? (
                                                <p className="text-sm text-gray-600 mt-1">{selectedManager.name}</p>
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-1">Select manager above</p>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0">
                                        <span className="text-sm font-bold text-blue-700">2</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">HR Final Approval</p>
                                        <p className="text-sm text-gray-600 mt-1">HR department review</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
                                        <CheckCircle2 className="h-4 w-4 text-green-700" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Approved!</p>
                                        <p className="text-sm text-gray-600 mt-1">Balance deducted</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Type Info */}
                    {selectedLeaveType && (
                        <Card className="animate-fade-in animation-delay-300">
                            <CardHeader>
                                <CardTitle className="text-lg">{selectedLeaveType.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    {selectedLeaveType.is_paid ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-gray-700">
                                        {selectedLeaveType.is_paid ? 'Paid Leave' : 'Unpaid Leave'}
                                    </span>
                                </div>

                                {selectedLeaveType.requires_medical_cert && (
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                                        <span className="text-gray-700">
                                            Medical certificate required
                                            {selectedLeaveType.medical_cert_days_threshold && 
                                                ` for leaves over ${selectedLeaveType.medical_cert_days_threshold} days`
                                            }
                                        </span>
                                    </div>
                                )}

                                {selectedLeaveType.description && (
                                    <p className="text-gray-600 pt-3 border-t">
                                        {selectedLeaveType.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}