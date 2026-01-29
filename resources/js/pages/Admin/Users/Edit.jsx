// resources/js/Pages/Users/Edit.jsx
import {
    HDMFInput,
    PayrollAccountInput,
    PhilHealthInput,
    SSSInput,
    TINInput,
} from '@/Components/FormattedInput';
import ProfilePictureUpload from '@/Components/ProfilePictureUpload';
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
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Briefcase,
    CreditCard,
    Heart,
    Loader2,
    Lock,
    MapPin,
    Phone,
    Save,
    Shield,
    User,
    Users as UsersIcon,
} from 'lucide-react';

export default function Edit({ auth, user, roles = [], allPermissions = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        profile_picture: null,
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        suffix: user.suffix || 'none',
        email: user.email || '',
        phone_number: user.phone_number || '',
        personal_mobile: user.personal_mobile || '',
        work_email: user.work_email || '',
        personal_email: user.personal_email || '',
        gender: user.gender || 'prefer_not_to_say',
        civil_status: user.civil_status || '',
        birthday: user.birthday || '',
        address_line_1: user.address_line_1 || '',
        address_line_2: user.address_line_2 || '',
        city: user.city || '',
        state: user.state || '',
        postal_code: user.postal_code || '',
        country: user.country || 'Philippines',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        emergency_contact_mobile: user.emergency_contact_mobile || '',
        emergency_contact_relationship:
            user.emergency_contact_relationship || '',
        sss_number: user.sss_number || '',
        tin_number: user.tin_number || '',
        hdmf_number: user.hdmf_number || '',
        philhealth_number: user.philhealth_number || '',
        payroll_account: user.payroll_account || '',
        employee_id: user.employee_id || '',
        department: user.department || '',
        position: user.position || '',
        hire_date: user.hire_date || '',
        employment_status: user.employment_status || 'active',
        employment_type: user.employment_type || 'full_time',
        password: '',
        password_confirmation: '',
        roles: user.roles ? user.roles.map((r) => r.id) : [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        router.post(route('users.update', user.id), {
            ...data,
            _method: 'PUT',
        });
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

    // ✅ Get selected roles with their permissions
    const selectedRoles = Array.isArray(roles)
        ? roles.filter((r) => data.roles.includes(r.id))
        : [];

    // ✅ Get unique permissions from selected roles
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
                                    Edit User
                                </h2>
                                <p className="mt-1 text-gray-600">
                                    Update user information
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Edit ${user.name}`} />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                {/* Profile Picture */}
                <Card className="animate-fade-in">
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>Update profile photo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfilePictureUpload
                            currentImage={
                                user.profile_picture
                                    ? `/storage/${user.profile_picture}`
                                    : null
                            }
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>First Name *</Label>
                                <Input
                                    value={data.first_name}
                                    onChange={(e) =>
                                        setData('first_name', e.target.value)
                                    }
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
                                <Label>Middle Name</Label>
                                <Input
                                    value={data.middle_name}
                                    onChange={(e) =>
                                        setData('middle_name', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Last Name *</Label>
                                <Input
                                    value={data.last_name}
                                    onChange={(e) =>
                                        setData('last_name', e.target.value)
                                    }
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
                                <Label>Suffix</Label>
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
                                <Label>Gender</Label>
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
                                <Label>Civil Status</Label>
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
                                <Label>Birthday</Label>
                                <Input
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Primary Email *</Label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className={
                                        errors.email ? 'border-red-500' : ''
                                    }
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Work Email</Label>
                                <Input
                                    type="email"
                                    value={data.work_email}
                                    onChange={(e) =>
                                        setData('work_email', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Personal Email</Label>
                                <Input
                                    type="email"
                                    value={data.personal_email}
                                    onChange={(e) =>
                                        setData(
                                            'personal_email',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Phone Number 1</Label>
                                <Input
                                    value={data.phone_number}
                                    onChange={(e) =>
                                        setData('phone_number', e.target.value)
                                    }
                                    placeholder="9123456789"
                                />
                                <p className="text-xs text-gray-500">
                                    10 digits (no leading 0)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Phone Number 2</Label>
                                <Input
                                    value={data.personal_mobile}
                                    onChange={(e) =>
                                        setData(
                                            'personal_mobile',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="9987654321"
                                />
                                <p className="text-xs text-gray-500">
                                    10 digits (no leading 0)
                                </p>
                            </div>
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Address Line 1</Label>
                            <Input
                                value={data.address_line_1}
                                onChange={(e) =>
                                    setData('address_line_1', e.target.value)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Address Line 2</Label>
                            <Input
                                value={data.address_line_2}
                                onChange={(e) =>
                                    setData('address_line_2', e.target.value)
                                }
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input
                                    value={data.city}
                                    onChange={(e) =>
                                        setData('city', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>State/Province</Label>
                                <Input
                                    value={data.state}
                                    onChange={(e) =>
                                        setData('state', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Postal Code</Label>
                                <Input
                                    value={data.postal_code}
                                    onChange={(e) =>
                                        setData('postal_code', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Country</Label>
                                <Input
                                    value={data.country}
                                    onChange={(e) =>
                                        setData('country', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Employment */}
                <Card className="animate-fade-in animation-delay-300">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Employment Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Employee ID</Label>
                                <Input
                                    value={data.employee_id}
                                    onChange={(e) =>
                                        setData('employee_id', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Input
                                    value={data.department}
                                    onChange={(e) =>
                                        setData('department', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Position</Label>
                                <Input
                                    value={data.position}
                                    onChange={(e) =>
                                        setData('position', e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Hire Date</Label>
                                <Input
                                    type="date"
                                    value={data.hire_date}
                                    onChange={(e) =>
                                        setData('hire_date', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Employment Status</Label>
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
                                <Label>Employment Type</Label>
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

                {/* Government IDs */}
                <Card className="animate-fade-in animation-delay-400">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Government IDs & Benefits
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>SSS Number</Label>
                                <SSSInput
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
                                <Label>TIN Number</Label>
                                <TINInput
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
                                <Label>PhilHealth Number</Label>
                                <PhilHealthInput
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
                                <Label>HDMF (Pag-IBIG) Number</Label>
                                <HDMFInput
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
                            <Label>Union Bank Payroll Account</Label>
                            <PayrollAccountInput
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
                                <Label>Contact Name</Label>
                                <Input
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
                                <Label>Relationship</Label>
                                <Input
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
                                <Label>Phone Number 1</Label>
                                <Input
                                    value={data.emergency_contact_phone}
                                    onChange={(e) =>
                                        setData(
                                            'emergency_contact_phone',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="9111111111"
                                />
                                <p className="text-xs text-gray-500">
                                    10 digits (no leading 0)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Phone Number 2</Label>
                                <Input
                                    value={data.emergency_contact_mobile}
                                    onChange={(e) =>
                                        setData(
                                            'emergency_contact_mobile',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="9222222222"
                                />
                                <p className="text-xs text-gray-500">
                                    10 digits (no leading 0)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Password */}
                <Card className="animate-fade-in animation-delay-600">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Leave blank to keep current password
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className={
                                        errors.password ? 'border-red-500' : ''
                                    }
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Roles */}
                <Card className="animate-fade-in animation-delay-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Roles & Permissions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                        <p className="font-medium">
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
                                                                className="bg-blue-100 text-xs text-blue-700"
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

                        {/* ✅ Show inherited permissions summary */}
                        {rolePermissions.length > 0 && (
                            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <p className="mb-2 text-sm font-medium text-blue-900">
                                    📋 Permissions from selected roles:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {rolePermissions.map((perm) => (
                                        <Badge
                                            key={perm.id}
                                            className="bg-blue-100 text-blue-700"
                                        >
                                            {perm.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card className="animate-fade-in animation-delay-800">
                    <CardContent className="pt-6">
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('users.index')}>Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Update User
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </AuthenticatedLayout>
    );
}
