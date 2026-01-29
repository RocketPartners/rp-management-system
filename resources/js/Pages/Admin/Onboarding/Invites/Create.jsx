// resources/js/Pages/Admin/Onboarding/Invites/Create.jsx
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import {
    ArrowLeft,
    Send,
    Loader2,
    Mail,
    UserPlus,
    Info,
    CheckCircle2,
    AlertCircle,
    Briefcase,
    Building2,
} from 'lucide-react';

export default function Create({ auth, roles, departments }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        first_name: '',
        last_name: '',
        position: '',
        department: '',
    });

    // ✅ Auto-fill department when position is selected (if role has description with dept)
    const handlePositionChange = (value) => {
        setData('position', value);
        
        // Try to auto-suggest department based on role name
        const selectedRole = roles.find(r => r.slug === value);
        if (selectedRole) {
            // Smart department detection
            if (selectedRole.name.toLowerCase().includes('engineer')) {
                setData('department', 'Engineering');
            } else if (selectedRole.name.toLowerCase().includes('hr')) {
                setData('department', 'Human Resources');
            } else if (selectedRole.name.toLowerCase().includes('admin')) {
                setData('department', 'Administration');
            } else if (selectedRole.name.toLowerCase().includes('project')) {
                setData('department', 'Project Management');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('onboarding.invites.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('onboarding.invites.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Invites
                            </Link>
                        </Button>
                        <div className="h-8 w-px bg-gray-300" />
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <UserPlus className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Send Onboarding Invite</h2>
                                <p className="text-gray-600 mt-1">Invite a new hire to complete pre-onboarding</p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Send Onboarding Invite" />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="bg-green-50 border-green-200 animate-fade-in">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 font-medium">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert className="bg-red-50 border-red-200 animate-fade-in">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 font-medium">
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Info Alert */}
                <Alert className="border-blue-200 bg-blue-50 animate-fade-in">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        <strong>How it works:</strong> The candidate will receive an email with a unique guest link valid for 14 days. They can fill out their information and upload documents without creating an account.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Candidate Information */}
                    <Card className="animate-fade-in animation-delay-100">
                        <CardHeader>
                            <CardTitle>Candidate Information</CardTitle>
                            <CardDescription>
                                Basic details about the new hire (optional but recommended)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        placeholder="John"
                                        className={errors.first_name ? 'border-red-500' : ''}
                                    />
                                    {errors.first_name && (
                                        <p className="text-sm text-red-600">{errors.first_name}</p>
                                    )}
                                    <p className="text-xs text-gray-500">Will be used in the invitation email</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        placeholder="Doe"
                                        className={errors.last_name ? 'border-red-500' : ''}
                                    />
                                    {errors.last_name && (
                                        <p className="text-sm text-red-600">{errors.last_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="position">
                                        Position <span className="text-red-600">*</span>
                                    </Label>
                                    <Select 
                                        value={data.position} 
                                        onValueChange={handlePositionChange}
                                    >
                                        <SelectTrigger className={errors.position ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select position..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles && roles.length > 0 ? (
                                                <>
                                                    {/* Engineering Roles */}
                                                    {roles.filter(r => r.name.toLowerCase().includes('engineer')).length > 0 && (
                                                        <>
                                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                                                                Engineering Roles
                                                            </div>
                                                            {roles.filter(r => r.name.toLowerCase().includes('engineer')).map((role) => (
                                                                <SelectItem key={role.id} value={role.slug}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Briefcase className="h-4 w-4 text-gray-400" />
                                                                        {role.name}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </>
                                                    )}
                                                    
                                                    {/* Management & Admin Roles */}
                                                    {roles.filter(r => !r.name.toLowerCase().includes('engineer')).length > 0 && (
                                                        <>
                                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase mt-2">
                                                                Management & Admin Roles
                                                            </div>
                                                            {roles.filter(r => !r.name.toLowerCase().includes('engineer')).map((role) => (
                                                                <SelectItem key={role.id} value={role.slug}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Briefcase className="h-4 w-4 text-gray-400" />
                                                                        {role.name}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <SelectItem value="none" disabled>No roles available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.position && (
                                        <p className="text-sm text-red-600">{errors.position}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        ⚠️ Position is locked - candidate cannot change this
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department">
                                        Department <span className="text-red-600">*</span>
                                    </Label>
                                    <Select 
                                        value={data.department} 
                                        onValueChange={(value) => setData('department', value)}
                                    >
                                        <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select department..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-gray-400" />
                                                        {dept}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.department && (
                                        <p className="text-sm text-red-600">{errors.department}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Auto-filled based on position (can be changed)
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Personal Email Address <span className="text-red-600">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="candidate@gmail.com"
                                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                    The invitation will be sent to this email address
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* What Happens Next */}
                    <Card className="border-green-200 bg-green-50 animate-fade-in animation-delay-200">
                        <CardHeader>
                            <CardTitle className="text-green-800 flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                What Happens Next
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-green-800">
                            <div className="flex items-start gap-2">
                                <div className="flex items-center justify-center w-6 h-6 bg-green-200 rounded-full flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-green-700">1</span>
                                </div>
                                <p>An email will be sent to the candidate with a unique guest link</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="flex items-center justify-center w-6 h-6 bg-green-200 rounded-full flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-green-700">2</span>
                                </div>
                                <p>The candidate can access the onboarding portal without login (valid for 14 days)</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="flex items-center justify-center w-6 h-6 bg-green-200 rounded-full flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-green-700">3</span>
                                </div>
                                <p>They'll fill personal information and upload required documents</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="flex items-center justify-center w-6 h-6 bg-green-200 rounded-full flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-green-700">4</span>
                                </div>
                                <p>You'll review their submission and convert it to an employee account</p>
                            </div>
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
                                        <Link href={route('onboarding.invites.index')}>
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Sending Invite...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Invitation
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}