import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Lock, Loader2, Mail, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { apiGet, apiPatch, apiPut } from '@/lib/spring-boot-api';
import type { UserResponse } from '@/types';

const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional().or(z.literal('')),
    personalMobile: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
    emergencyContactName: z.string().optional().or(z.literal('')),
    emergencyContactPhone: z.string().optional().or(z.literal('')),
    emergencyContactRelationship: z.string().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type PasswordFormValues = z.infer<typeof passwordSchema>;

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-sm text-destructive">{message}</p>;
}

export default function ProfilePage() {
    const { refreshUser } = useAuth();
    const queryClient = useQueryClient();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: () => apiGet<UserResponse>('/users/me'),
    });

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            personalMobile: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactRelationship: '',
        },
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (profile) {
            profileForm.reset({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                phone: profile.phone || '',
                personalMobile: profile.personalMobile || '',
                address: profile.address || '',
                city: profile.city || '',
                state: profile.state || '',
                postalCode: profile.postalCode || '',
                country: profile.country || '',
                emergencyContactName: profile.emergencyContactName || '',
                emergencyContactPhone: profile.emergencyContactPhone || '',
                emergencyContactRelationship:
                    profile.emergencyContactRelationship || '',
            });
        }
    }, [profile, profileForm]);

    const updateProfile = useMutation({
        mutationFn: (data: ProfileFormValues) =>
            apiPatch<UserResponse>('/users/me', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            refreshUser();
            toast.success('Profile updated');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const changePassword = useMutation({
        mutationFn: (data: PasswordFormValues) =>
            apiPut('/users/me/password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            }),
        onSuccess: () => {
            passwordForm.reset();
            toast.success('Password changed');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>My Profile | HRIS</title>
            </Helmet>

            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                    <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-gray-900">
                        My Profile
                    </h1>
                </div>
            </div>

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Profile Header */}
                {profile && (
                    <Card>
                        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                            <Avatar className="h-16 w-16">
                                <AvatarImage
                                    src={profile.profileImageUrl || ''}
                                />
                                <AvatarFallback>
                                    {getInitials(profile.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {profile.fullName}
                                </h2>
                                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {profile.email}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    {profile.departmentName && (
                                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Briefcase className="h-3 w-3" />
                                            {profile.departmentName}
                                        </span>
                                    )}
                                    {profile.positionTitle && (
                                        <span className="text-sm text-muted-foreground">
                                            &middot; {profile.positionTitle}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {profile.roles.map((role) => (
                                        <Badge key={role} variant="secondary">
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Personal Info Form */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Personal Information
                        </h2>
                        <form
                            onSubmit={profileForm.handleSubmit((data) =>
                                updateProfile.mutate(data),
                            )}
                            className="space-y-6"
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">
                                        First Name *
                                    </Label>
                                    <Input
                                        id="firstName"
                                        {...profileForm.register('firstName')}
                                    />
                                    <FieldError
                                        message={
                                            profileForm.formState.errors
                                                .firstName?.message
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">
                                        Last Name *
                                    </Label>
                                    <Input
                                        id="lastName"
                                        {...profileForm.register('lastName')}
                                    />
                                    <FieldError
                                        message={
                                            profileForm.formState.errors
                                                .lastName?.message
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        {...profileForm.register('phone')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="personalMobile">
                                        Personal Mobile
                                    </Label>
                                    <Input
                                        id="personalMobile"
                                        {...profileForm.register(
                                            'personalMobile',
                                        )}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <h3 className="font-medium">Address</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        {...profileForm.register('address')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        {...profileForm.register('city')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">
                                        State / Province
                                    </Label>
                                    <Input
                                        id="state"
                                        {...profileForm.register('state')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">
                                        Postal Code
                                    </Label>
                                    <Input
                                        id="postalCode"
                                        {...profileForm.register('postalCode')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        {...profileForm.register('country')}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <h3 className="font-medium">Emergency Contact</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="emergencyContactName">
                                        Contact Name
                                    </Label>
                                    <Input
                                        id="emergencyContactName"
                                        {...profileForm.register(
                                            'emergencyContactName',
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergencyContactPhone">
                                        Contact Phone
                                    </Label>
                                    <Input
                                        id="emergencyContactPhone"
                                        {...profileForm.register(
                                            'emergencyContactPhone',
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergencyContactRelationship">
                                        Relationship
                                    </Label>
                                    <Input
                                        id="emergencyContactRelationship"
                                        {...profileForm.register(
                                            'emergencyContactRelationship',
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={updateProfile.isPending}
                                >
                                    {updateProfile.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <Lock className="h-5 w-5" />
                            Change Password
                        </h2>
                        <form
                            onSubmit={passwordForm.handleSubmit((data) =>
                                changePassword.mutate(data),
                            )}
                            className="max-w-md space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">
                                    Current Password *
                                </Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    {...passwordForm.register(
                                        'currentPassword',
                                    )}
                                />
                                <FieldError
                                    message={
                                        passwordForm.formState.errors
                                            .currentPassword?.message
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">
                                    New Password *
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    {...passwordForm.register('newPassword')}
                                />
                                <FieldError
                                    message={
                                        passwordForm.formState.errors
                                            .newPassword?.message
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    Confirm Password *
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...passwordForm.register(
                                        'confirmPassword',
                                    )}
                                />
                                <FieldError
                                    message={
                                        passwordForm.formState.errors
                                            .confirmPassword?.message
                                    }
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={changePassword.isPending}
                            >
                                {changePassword.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Change Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
