import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/spring-boot-api';
import type { DepartmentOption, PositionOption, RoleOption } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { cn } from '@/lib/utils';
import { ChevronDown, Loader2 } from 'lucide-react';

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

interface SectionProps {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

function FormSection({ title, defaultOpen = false, children }: SectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Card>
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between p-6 text-left">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <ChevronDown
                        className={cn(
                            'h-5 w-5 text-muted-foreground transition-transform',
                            open && 'rotate-180',
                        )}
                    />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="grid gap-4 border-t pt-6 sm:grid-cols-2">
                        {children}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-sm text-destructive">{message}</p>;
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
            country: '',
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
        queryKey: ['departments'],
        queryFn: () => apiGet<DepartmentOption[]>('/departments'),
    });

    const { data: positions = [] } = useQuery({
        queryKey: ['positions'],
        queryFn: () => apiGet<PositionOption[]>('/positions'),
    });

    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: () => apiGet<RoleOption[]>('/roles'),
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Section 1: Account */}
            <FormSection title="Account" defaultOpen>
                <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register('email')} />
                    <FieldError message={errors.email?.message} />
                </div>
                {mode === 'create' && (
                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            {...register('password')}
                        />
                        <FieldError message={errors.password?.message} />
                    </div>
                )}
            </FormSection>

            {/* Section 2: Personal Info */}
            <FormSection title="Personal Information" defaultOpen>
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" {...register('firstName')} />
                    <FieldError message={errors.firstName?.message} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" {...register('lastName')} />
                    <FieldError message={errors.lastName?.message} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" {...register('middleName')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="suffix">Suffix</Label>
                    <Input
                        id="suffix"
                        placeholder="Jr., Sr., III"
                        {...register('suffix')}
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
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">
                                        Female
                                    </SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                        id="dateOfBirth"
                        type="date"
                        {...register('dateOfBirth')}
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
                                    <SelectItem value="Single">
                                        Single
                                    </SelectItem>
                                    <SelectItem value="Married">
                                        Married
                                    </SelectItem>
                                    <SelectItem value="Widowed">
                                        Widowed
                                    </SelectItem>
                                    <SelectItem value="Separated">
                                        Separated
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </FormSection>

            {/* Section 3: Contact */}
            <FormSection title="Contact Information">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register('phone')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="personalMobile">Personal Mobile</Label>
                    <Input
                        id="personalMobile"
                        {...register('personalMobile')}
                    />
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
            </FormSection>

            {/* Section 4: Address */}
            <FormSection title="Address">
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" {...register('address')} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input id="addressLine2" {...register('addressLine2')} />
                </div>
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
            </FormSection>

            {/* Section 5: Emergency Contact */}
            <FormSection title="Emergency Contact">
                <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input
                        id="emergencyContactName"
                        {...register('emergencyContactName')}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                    <Input
                        id="emergencyContactPhone"
                        {...register('emergencyContactPhone')}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emergencyContactMobile">
                        Contact Mobile
                    </Label>
                    <Input
                        id="emergencyContactMobile"
                        {...register('emergencyContactMobile')}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelationship">
                        Relationship
                    </Label>
                    <Input
                        id="emergencyContactRelationship"
                        {...register('emergencyContactRelationship')}
                    />
                </div>
            </FormSection>

            {/* Section 6: Government IDs */}
            <FormSection title="Government IDs">
                <div className="space-y-2">
                    <Label htmlFor="sssNumber">SSS Number</Label>
                    <Input id="sssNumber" {...register('sssNumber')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tinNumber">TIN Number</Label>
                    <Input id="tinNumber" {...register('tinNumber')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hdmfNumber">HDMF / Pag-IBIG Number</Label>
                    <Input id="hdmfNumber" {...register('hdmfNumber')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="philhealthNumber">PhilHealth Number</Label>
                    <Input
                        id="philhealthNumber"
                        {...register('philhealthNumber')}
                    />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="payrollAccount">Payroll Account</Label>
                    <Input
                        id="payrollAccount"
                        {...register('payrollAccount')}
                    />
                </div>
            </FormSection>

            {/* Section 7: Employment */}
            <FormSection title="Employment">
                <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input id="employeeId" {...register('employeeId')} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hireDate">Hire Date</Label>
                    <Input
                        id="hireDate"
                        type="date"
                        {...register('hireDate')}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <Controller
                        control={control}
                        name="employmentType"
                        render={({ field }) => (
                            <Select
                                value={field.value || ''}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Full-Time">
                                        Full-Time
                                    </SelectItem>
                                    <SelectItem value="Part-Time">
                                        Part-Time
                                    </SelectItem>
                                    <SelectItem value="Contract">
                                        Contract
                                    </SelectItem>
                                    <SelectItem value="Intern">
                                        Intern
                                    </SelectItem>
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
                                value={
                                    field.value != null
                                        ? String(field.value)
                                        : ''
                                }
                                onValueChange={(v) =>
                                    field.onChange(v ? Number(v) : null)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((d) => (
                                        <SelectItem
                                            key={d.id}
                                            value={String(d.id)}
                                        >
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
                                value={
                                    field.value != null
                                        ? String(field.value)
                                        : ''
                                }
                                onValueChange={(v) =>
                                    field.onChange(v ? Number(v) : null)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent>
                                    {positions.map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={String(p.id)}
                                        >
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
                                value={
                                    field.value != null
                                        ? String(field.value)
                                        : ''
                                }
                                onValueChange={(v) =>
                                    field.onChange(v ? Number(v) : null)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select manager" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Manager list fetched via users search */}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <Label>Roles</Label>
                    <Controller
                        control={control}
                        name="roles"
                        render={({ field }) => (
                            <div className="grid gap-2 sm:grid-cols-3">
                                {roles.map((role) => (
                                    <label
                                        key={role.id}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={(
                                                field.value || []
                                            ).includes(role.name)}
                                            onCheckedChange={(checked) => {
                                                const current =
                                                    field.value || [];
                                                field.onChange(
                                                    checked
                                                        ? [
                                                              ...current,
                                                              role.name,
                                                          ]
                                                        : current.filter(
                                                              (r) =>
                                                                  r !==
                                                                  role.name,
                                                          ),
                                                );
                                            }}
                                        />
                                        {role.name}
                                    </label>
                                ))}
                            </div>
                        )}
                    />
                </div>
            </FormSection>

            {/* Submit */}
            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {mode === 'create' ? 'Create User' : 'Update User'}
                </Button>
            </div>
        </form>
    );
}
