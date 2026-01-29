// resources/js/Pages/Users/Create.jsx
import {
    HDMFInput,
    PayrollAccountInput,
    PhilHealthInput,
    PhoneInput,
    SSSInput,
    TINInput,
} from '@/Components/FormattedInput';
import ProfilePictureUpload from '@/Components/ProfilePictureUpload';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    CheckCircle2,
    CreditCard,
    Heart,
    Info,
    Loader2,
    Lock,
    Mail,
    MapPin,
    Phone,
    Save,
    Shield,
    User,
    Users as UsersIcon,
} from 'lucide-react';

export default function Create({ auth, roles = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        profile_picture: null,
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: 'none',
        email: '',
        phone_number: '',
        personal_mobile: '',
        work_email: '',
        personal_email: '',
        gender: 'prefer_not_to_say',
        civil_status: '',
        birthday: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Philippines',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_mobile: '',
        emergency_contact_relationship: '',
        sss_number: '',
        tin_number: '',
        hdmf_number: '',
        philhealth_number: '',
        payroll_account: '',
        employee_id: '',
        department: '',
        position: '',
        hire_date: new Date().toISOString().split('T')[0],
        employment_status: 'active',
        employment_type: 'full_time',
        password: '',
        password_confirmation: '',
        roles: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    const handleRoleToggle = (roleId) => {
        const currentRoles = [...data.roles];
        const index = currentRoles.indexOf(roleId);

        if (index > -1) {
            currentRoles.splice(index, 1);
        } else {
            currentRoles.push(roleId);
        }

        setData('roles', currentRoles);
    };

    // ✅ Get selected roles and their permissions
    const selectedRoles = Array.isArray(roles)
        ? roles.filter((r) => data.roles.includes(r.id))
        : [];
    const rolePermissions = selectedRoles
        .flatMap((role) => role.permissions || [])
        .filter(
            (perm, index, self) =>
                index === self.findIndex((p) => p.id === perm.id),
        );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('users.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                                <UsersIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Add New User
                                </h2>
                                <p className="mt-1 text-gray-600">
                                    Create a new user account
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Add User" />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                {/* Profile Picture */}
                <Card className="animate-fade-in">
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>
                            Upload a profile photo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfilePictureUpload
                            currentImage={null}
                            onImageChange={(file) =>
                                setData('profile_picture', file)
                            }
                            onImageRemove={() =>
                                setData('profile_picture', null)
                            }
                        />
                    </CardContent>
                </Card>

                {/* Personal Information */}
                <Card className="animate-fade-in">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>
                            Basic personal details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name *</Label>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(e) =>
                                        setData('first_name', e.target.value)
                                    }
                                    placeholder="John"
                                    className={
                                        errors.first_name
                                            ? 'border-red-500'
                                            : ''
                                    }
                                />
                                {errors.first_name && (
                                    <p className="text-sm text-red-500">
                                        {errors.first_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="middle_name">Middle Name</Label>
                                <Input
                                    id="middle_name"
                                    value={data.middle_name}
                                    onChange={(e) =>
                                        setData('middle_name', e.target.value)
                                    }
                                    placeholder="Optional"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name *</Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) =>
                                        setData('last_name', e.target.value)
                                    }
                                    placeholder="Doe"
                                    className={
                                        errors.last_name ? 'border-red-500' : ''
                                    }
                                />
                                {errors.last_name && (
                                    <p className="text-sm text-red-500">
                                        {errors.last_name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="suffix">Suffix</Label>
                                <Select
                                    value={data.suffix}
                                    onValueChange={(value) =>
                                        setData('suffix', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            None
                                        </SelectItem>
                                        <SelectItem value="Jr.">Jr.</SelectItem>
                                        <SelectItem value="Sr.">Sr.</SelectItem>
                                        <SelectItem value="II">II</SelectItem>
                                        <SelectItem value="III">III</SelectItem>
                                        <SelectItem value="IV">IV</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select
                                    value={data.gender}
                                    onValueChange={(value) =>
                                        setData('gender', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">
                                            Male
                                        </SelectItem>
                                        <SelectItem value="female">
                                            Female
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                        <SelectItem value="prefer_not_to_say">
                                            Prefer not to say
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="civil_status">
                                    Civil Status
                                </Label>
                                <Select
                                    value={data.civil_status}
                                    onValueChange={(value) =>
                                        setData('civil_status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">
                                            Single
                                        </SelectItem>
                                        <SelectItem value="married">
                                            Married
                                        </SelectItem>
                                        <SelectItem value="widowed">
                                            Widowed
                                        </SelectItem>
                                        <SelectItem value="divorced">
                                            Divorced
                                        </SelectItem>
                                        <SelectItem value="separated">
                                            Separated
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birthday">Birthday</Label>
                                <Input
                                    id="birthday"
                                    type="date"
                                    value={data.birthday}
                                    onChange={(e) =>
                                        setData('birthday', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="animate-fade-in animation-delay-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="h-5 w-5" />
                            Contact Information
                        </CardTitle>
                        <CardDescription>
                            Email addresses and phone numbers
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Primary Email (Login) *
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="john.doe@company.com"
                                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="work_email">Work Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="work_email"
                                        type="email"
                                        value={data.work_email}
                                        onChange={(e) =>
                                            setData(
                                                'work_email',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="john.doe@company.com"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="personal_email">
                                    Personal Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="personal_email"
                                        type="email"
                                        value={data.personal_email}
                                        onChange={(e) =>
                                            setData(
                                                'personal_email',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="john@gmail.com"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone_number">
                                    Mobile Number
                                </Label>
                                <PhoneInput
                                    id="phone_number"
                                    value={data.phone_number}
                                    onChange={(e) =>
                                        setData('phone_number', e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="personal_mobile">
                                Personal Mobile
                            </Label>
                            <PhoneInput
                                id="personal_mobile"
                                value={data.personal_mobile}
                                onChange={(e) =>
                                    setData('personal_mobile', e.target.value)
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Address */}
                <Card className="animate-fade-in animation-delay-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Address
                        </CardTitle>
                        <CardDescription>Residential address</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address_line_1">
                                Address Line 1
                            </Label>
                            <Input
                                id="address_line_1"
                                value={data.address_line_1}
                                onChange={(e) =>
                                    setData('address_line_1', e.target.value)
                                }
                                placeholder="Street address, P.O. box"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address_line_2">
                                Address Line 2
                            </Label>
                            <Input
                                id="address_line_2"
                                value={data.address_line_2}
                                onChange={(e) =>
                                    setData('address_line_2', e.target.value)
                                }
                                placeholder="Apartment, suite, unit"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={(e) =>
                                        setData('city', e.target.value)
                                    }
                                    placeholder="Manila"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">State/Province</Label>
                                <Input
                                    id="state"
                                    value={data.state}
                                    onChange={(e) =>
                                        setData('state', e.target.value)
                                    }
                                    placeholder="Metro Manila"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postal_code">Postal Code</Label>
                                <Input
                                    id="postal_code"
                                    value={data.postal_code}
                                    onChange={(e) =>
                                        setData('postal_code', e.target.value)
                                    }
                                    placeholder="1000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={data.country}
                                    onChange={(e) =>
                                        setData('country', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Employment Information */}
                <Card className="animate-fade-in animation-delay-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Employment Information
                        </CardTitle>
                        <CardDescription>
                            Job details and employment status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="employee_id">Employee ID</Label>
                                <Input
                                    id="employee_id"
                                    value={data.employee_id}
                                    onChange={(e) =>
                                        setData('employee_id', e.target.value)
                                    }
                                    placeholder="EMP-001"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={data.department}
                                    onChange={(e) =>
                                        setData('department', e.target.value)
                                    }
                                    placeholder="Engineering"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="position">Position</Label>
                                <Input
                                    id="position"
                                    value={data.position}
                                    onChange={(e) =>
                                        setData('position', e.target.value)
                                    }
                                    placeholder="Software Engineer"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="hire_date">Hire Date</Label>
                                <Input
                                    id="hire_date"
                                    type="date"
                                    value={data.hire_date}
                                    onChange={(e) =>
                                        setData('hire_date', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employment_status">
                                    Employment Status
                                </Label>
                                <Select
                                    value={data.employment_status}
                                    onValueChange={(value) =>
                                        setData('employment_status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="on_leave">
                                            On Leave
                                        </SelectItem>
                                        <SelectItem value="terminated">
                                            Terminated
                                        </SelectItem>
                                        <SelectItem value="resigned">
                                            Resigned
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employment_type">
                                    Employment Type
                                </Label>
                                <Select
                                    value={data.employment_type}
                                    onValueChange={(value) =>
                                        setData('employment_type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full_time">
                                            Full-Time
                                        </SelectItem>
                                        <SelectItem value="part_time">
                                            Part-Time
                                        </SelectItem>
                                        <SelectItem value="contract">
                                            Contract
                                        </SelectItem>
                                        <SelectItem value="intern">
                                            Intern
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Government IDs & Benefits */}
                <Card className="animate-fade-in animation-delay-400">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Government IDs & Benefits
                        </CardTitle>
                        <CardDescription>
                            Philippine government identification numbers
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="sss_number">SSS Number</Label>
                                <SSSInput
                                    id="sss_number"
                                    value={data.sss_number}
                                    onChange={(e) =>
                                        setData('sss_number', e.target.value)
                                    }
                                />
                                <p className="text-xs text-gray-500">
                                    Format: XX-XXXXXXX-X
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tin_number">TIN Number</Label>
                                <TINInput
                                    id="tin_number"
                                    value={data.tin_number}
                                    onChange={(e) =>
                                        setData('tin_number', e.target.value)
                                    }
                                />
                                <p className="text-xs text-gray-500">
                                    Format: XXX-XXX-XXX-XXXXX
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="philhealth_number">
                                    PhilHealth Number
                                </Label>
                                <PhilHealthInput
                                    id="philhealth_number"
                                    value={data.philhealth_number}
                                    onChange={(e) =>
                                        setData(
                                            'philhealth_number',
                                            e.target.value,
                                        )
                                    }
                                />
                                <p className="text-xs text-gray-500">
                                    Format: XXXX-XXXXX-XX
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hdmf_number">
                                    HDMF (Pag-IBIG) Number
                                </Label>
                                <HDMFInput
                                    id="hdmf_number"
                                    value={data.hdmf_number}
                                    onChange={(e) =>
                                        setData('hdmf_number', e.target.value)
                                    }
                                />
                                <p className="text-xs text-gray-500">
                                    Format: 12 digits
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payroll_account">
                                Union Bank Payroll Account
                            </Label>
                            <PayrollAccountInput
                                id="payroll_account"
                                value={data.payroll_account}
                                onChange={(e) =>
                                    setData('payroll_account', e.target.value)
                                }
                            />
                            <p className="text-xs text-gray-500">
                                Format: 12 digits
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card className="animate-fade-in animation-delay-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            Emergency Contact
                        </CardTitle>
                        <CardDescription>
                            Person to contact in case of emergency
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="emergency_contact_name">
                                    Contact Name
                                </Label>
                                <Input
                                    id="emergency_contact_name"
                                    value={data.emergency_contact_name}
                                    onChange={(e) =>
                                        setData(
                                            'emergency_contact_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Jane Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="emergency_contact_relationship">
                                    Relationship
                                </Label>
                                <Input
                                    id="emergency_contact_relationship"
                                    value={data.emergency_contact_relationship}
                                    onChange={(e) =>
                                        setData(
                                            'emergency_contact_relationship',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Spouse, Parent, Sibling..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="emergency_contact_phone">
                                    Contact Phone
                                </Label>
                                <PhoneInput
                                    id="emergency_contact_phone"
                                    value={data.emergency_contact_phone}
                                    onChange={(e) =>
                                        setData(
                                            'emergency_contact_phone',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="emergency_contact_mobile">
                                    Contact Mobile
                                </Label>
                                <PhoneInput
                                    id="emergency_contact_mobile"
                                    value={data.emergency_contact_mobile}
                                    onChange={(e) =>
                                        setData(
                                            'emergency_contact_mobile',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Security */}
                <Card className="animate-fade-in animation-delay-600">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Account Security
                        </CardTitle>
                        <CardDescription>Login credentials</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder="••••••••"
                                        className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password *
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="••••••••"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Roles - UPDATED WITH PERMISSION BADGES */}
                <Card className="animate-fade-in animation-delay-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Roles & Permissions
                        </CardTitle>
                        <CardDescription>
                            Assign roles to define user permissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {roles.map((role) => (
                                <label
                                    key={role.id}
                                    htmlFor={`role-${role.id}`}
                                    className={`flex cursor-pointer items-start space-x-3 rounded-lg border-2 p-4 transition-colors hover:bg-gray-50 ${
                                        data.roles.includes(role.id)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={data.roles.includes(role.id)}
                                        onCheckedChange={() =>
                                            handleRoleToggle(role.id)
                                        }
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-900">
                                            {role.name}
                                        </p>
                                        {role.description && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {role.description}
                                            </p>
                                        )}
                                        {/* ✅ Show permissions from this role */}
                                        {role.permissions &&
                                            role.permissions.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {role.permissions
                                                        .slice(0, 3)
                                                        .map((perm) => (
                                                            <Badge
                                                                key={perm.id}
                                                                className="border border-blue-200 bg-blue-100 text-xs text-blue-700"
                                                            >
                                                                {perm.name}
                                                            </Badge>
                                                        ))}
                                                    {role.permissions.length >
                                                        3 && (
                                                        <Badge className="bg-gray-100 text-xs text-gray-600">
                                                            +
                                                            {role.permissions
                                                                .length -
                                                                3}{' '}
                                                            more
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* ✅ Permission Summary */}
                        {rolePermissions.length > 0 && (
                            <Alert className="border-blue-200 bg-blue-50">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    <strong>
                                        This user will have these permissions:
                                    </strong>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {rolePermissions.map((perm) => (
                                            <Badge
                                                key={perm.id}
                                                className="border border-blue-200 bg-blue-100 text-blue-700"
                                            >
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                {perm.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {data.roles.length === 0 && (
                            <Alert className="border-yellow-200 bg-yellow-50">
                                <AlertDescription className="text-sm text-yellow-800">
                                    <strong>No roles selected.</strong> User
                                    will have basic employee access only.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card className="animate-fade-in animation-delay-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Fields marked with * are required
                            </p>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('users.index')}>
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
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Create User
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
