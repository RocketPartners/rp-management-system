import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/spring-boot-api';
import type { DepartmentOption, PositionOption, RoleOption, UserResponse } from '@/types';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
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
} from 'lucide-react';

export const userFormSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .optional()
        .or(z.literal('')),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional().or(z.literal('')),
    suffix: z.string().optional().or(z.literal('')),
    gender: z.string().optional().or(z.literal('')),
    dateOfBirth: z.string().optional().or(z.literal('')),
    civilStatus: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    personalMobile: z.string().optional().or(z.literal('')),
    workEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    personalEmail: z
        .string()
        .email('Invalid email')
        .optional()
        .or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    addressLine2: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
    emergencyContactName: z.string().optional().or(z.literal('')),
    emergencyContactPhone: z.string().optional().or(z.literal('')),
    emergencyContactMobile: z.string().optional().or(z.literal('')),
    emergencyContactRelationship: z.string().optional().or(z.literal('')),
    sssNumber: z.string().optional().or(z.literal('')),
    tinNumber: z.string().optional().or(z.literal('')),
    hdmfNumber: z.string().optional().or(z.literal('')),
    philhealthNumber: z.string().optional().or(z.literal('')),
    payrollAccount: z.string().optional().or(z.literal('')),
    employeeId: z.string().optional().or(z.literal('')),
    hireDate: z.string().optional().or(z.literal('')),
    employmentType: z.string().optional().or(z.literal('')),
    departmentId: z.coerce.number().nullable().optional(),
    positionId: z.coerce.number().nullable().optional(),
    managerId: z.coerce.number().nullable().optional(),
    roles: z.array(z.string()).optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
    mode: 'create' | 'edit';
    defaultValues?: Partial<UserFormValues>;
    onSubmit: (data: UserFormValues) => void;
    isSubmitting: boolean;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-sm text-red-500">{message}</p>;
}

export function UserForm({
    mode,
    defaultValues,
    onSubmit,
    isSubmitting,
}: UserFormProps) {
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            middleName: '',
            suffix: '',
            gender: '',
            dateOfBirth: '',
            civilStatus: '',
            phone: '',
            personalMobile: '',
            workEmail: '',
            personalEmail: '',
            address: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'Philippines',
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactMobile: '',
            emergencyContactRelationship: '',
            sssNumber: '',
            tinNumber: '',
            hdmfNumber: '',
            philhealthNumber: '',
            payrollAccount: '',
            employeeId: '',
            hireDate: '',
            employmentType: '',
            departmentId: null,
            positionId: null,
            managerId: null,
            roles: [],
            ...defaultValues,
        },
    });

    const { register, control, formState: { errors }, handleSubmit } = form;

    const { data: departments = [] } = useQuery({
        queryKey: ['departments', 'active'],
        queryFn: () => apiGet<DepartmentOption[]>('/departments/active'),
    });

    const { data: positions = [] } = useQuery({
        queryKey: ['positions', 'active'],
        queryFn: () => apiGet<PositionOption[]>('/positions/active'),
    });

    const { data: managers = [] } = useQuery({
        queryKey: ['users', 'all-for-manager'],
        queryFn: async () => {
            const res = await apiGet<{ content: UserResponse[] }>('/users?size=1000');
            return res.content;
        },
    });

    const { data: roles = [] } = useQuery({
        queryKey: ['roles', 'all'],
        queryFn: () => apiGet<RoleOption[]>('/roles/all'),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
            {/* Personal Information */}
            <Card>
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
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                placeholder="John"
                                {...register('firstName')}
                                className={errors.firstName ? 'border-red-500' : ''}
                            />
                            <FieldError message={errors.firstName?.message} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="middleName">Middle Name</Label>
                            <Input
                                id="middleName"
                                placeholder="Optional"
                                {...register('middleName')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                {...register('lastName')}
                                className={errors.lastName ? 'border-red-500' : ''}
                            />
                            <FieldError message={errors.lastName?.message} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="suffix">Suffix</Label>
                            <Controller
                                control={control}
                                name="suffix"
                                render={({ field }) => (
                                    <Select
                                        value={field.value || 'none'}
                                        onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="Jr.">Jr.</SelectItem>
                                            <SelectItem value="Sr.">Sr.</SelectItem>
                                            <SelectItem value="II">II</SelectItem>
                                            <SelectItem value="III">III</SelectItem>
                                            <SelectItem value="IV">IV</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Controller
                                control={control}
                                name="gender"
                                render={({ field }) => (
                                    <Select
                                        value={field.value || ''}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Civil Status</Label>
                            <Controller
                                control={control}
                                name="civilStatus"
                                render={({ field }) => (
                                    <Select
                                        value={field.value || ''}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Single</SelectItem>
                                            <SelectItem value="married">Married</SelectItem>
                                            <SelectItem value="widowed">Widowed</SelectItem>
                                            <SelectItem value="divorced">Divorced</SelectItem>
                                            <SelectItem value="separated">Separated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Birthday</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                {...register('dateOfBirth')}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
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
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                {...register('email')}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            <FieldError message={errors.email?.message} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="workEmail">Work Email</Label>
                            <Input
                                id="workEmail"
                                type="email"
                                {...register('workEmail')}
                            />
                            <FieldError message={errors.workEmail?.message} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="personalEmail">Personal Email</Label>
                            <Input
                                id="personalEmail"
                                type="email"
                                {...register('personalEmail')}
                            />
                            <FieldError message={errors.personalEmail?.message} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" {...register('phone')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="personalMobile">Personal Mobile</Label>
                            <Input id="personalMobile" {...register('personalMobile')} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Address */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Address
                    </CardTitle>
                    <CardDescription>
                        Residential address
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="address">Address Line 1</Label>
                        <Input id="address" {...register('address')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="addressLine2">Address Line 2</Label>
                        <Input id="addressLine2" {...register('addressLine2')} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" {...register('city')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State / Province</Label>
                            <Input id="state" {...register('state')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input id="postalCode" {...register('postalCode')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" {...register('country')} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-600" />
                        Emergency Contact
                    </CardTitle>
                    <CardDescription>
                        Person to contact in case of emergency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContactName">Contact Name</Label>
                            <Input id="emergencyContactName" {...register('emergencyContactName')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                            <Input id="emergencyContactRelationship" {...register('emergencyContactRelationship')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContactPhone">Phone</Label>
                            <Input id="emergencyContactPhone" {...register('emergencyContactPhone')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContactMobile">Mobile</Label>
                            <Input id="emergencyContactMobile" {...register('emergencyContactMobile')} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Government IDs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Government IDs & Benefits
                    </CardTitle>
                    <CardDescription>
                        Government identification numbers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="sssNumber">SSS Number</Label>
                            <Input id="sssNumber" {...register('sssNumber')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tinNumber">TIN Number</Label>
                            <Input id="tinNumber" {...register('tinNumber')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="philhealthNumber">PhilHealth Number</Label>
                            <Input id="philhealthNumber" {...register('philhealthNumber')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hdmfNumber">HDMF (Pag-IBIG) Number</Label>
                            <Input id="hdmfNumber" {...register('hdmfNumber')} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="payrollAccount">Payroll Account</Label>
                            <Input id="payrollAccount" {...register('payrollAccount')} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Employment */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Employment
                    </CardTitle>
                    <CardDescription>
                        Employment details and organizational information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input id="employeeId" {...register('employeeId')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hireDate">Hire Date</Label>
                            <Input id="hireDate" type="date" {...register('hireDate')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Employment Type</Label>
                            <Controller
                                control={control}
                                name="employmentType"
                                render={({ field }) => (
                                    <Select value={field.value || ''} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-Time">Full-Time</SelectItem>
                                            <SelectItem value="Part-Time">Part-Time</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                            <SelectItem value="Intern">Intern</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Controller
                                control={control}
                                name="departmentId"
                                render={({ field }) => (
                                    <Select
                                        value={field.value != null ? String(field.value) : ''}
                                        onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((d) => (
                                                <SelectItem key={d.id} value={String(d.id)}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Position</Label>
                            <Controller
                                control={control}
                                name="positionId"
                                render={({ field }) => (
                                    <Select
                                        value={field.value != null ? String(field.value) : ''}
                                        onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positions.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Manager</Label>
                            <Controller
                                control={control}
                                name="managerId"
                                render={({ field }) => (
                                    <Select
                                        value={field.value != null ? String(field.value) : ''}
                                        onValueChange={(v) => field.onChange(v ? Number(v) : null)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {managers.map((m) => (
                                                <SelectItem key={m.id} value={String(m.id)}>
                                                    {m.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Password (Create only) */}
            {mode === 'create' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Account Security
                        </CardTitle>
                        <CardDescription>
                            Set the initial password for this user
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-w-md space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Minimum 8 characters"
                                {...register('password')}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            <FieldError message={errors.password?.message} />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Roles */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Roles & Permissions
                    </CardTitle>
                    <CardDescription>
                        Assign roles to determine what this user can access
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Controller
                        control={control}
                        name="roles"
                        render={({ field }) => (
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                                {roles.map((role) => (
                                    <label
                                        key={role.id}
                                        className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                                    >
                                        <Checkbox
                                            checked={(field.value || []).includes(role.name)}
                                            onCheckedChange={(checked) => {
                                                const current = field.value || [];
                                                field.onChange(
                                                    checked
                                                        ? [...current, role.name]
                                                        : current.filter((r) => r !== role.name),
                                                );
                                            }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{role.name}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    />
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                >
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    {mode === 'create' ? 'Create User' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}
