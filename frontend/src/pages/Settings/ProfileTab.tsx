import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Mail, Briefcase, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { apiGet, apiPatch, apiPostFormData } from '@/lib/spring-boot-api';
import type { UserResponse } from '@/types';

const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional().or(z.literal('')),
    lastName: z.string().min(1, 'Last name is required'),
    suffix: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    personalMobile: z.string().optional().or(z.literal('')),
    personalEmail: z.string().email('Invalid email').optional().or(z.literal('')),
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
});

type ProfileFormValues = z.infer<typeof profileSchema>;

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

export default function ProfileTab() {
    const { refreshUser } = useAuth();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: () => apiGet<UserResponse>('/users/me'),
    });

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            middleName: '',
            lastName: '',
            suffix: '',
            phone: '',
            personalMobile: '',
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
        },
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                firstName: profile.firstName || '',
                middleName: profile.middleName || '',
                lastName: profile.lastName || '',
                suffix: profile.suffix || '',
                phone: profile.phone || '',
                personalMobile: profile.personalMobile || '',
                personalEmail: profile.personalEmail || '',
                address: profile.address || '',
                addressLine2: profile.addressLine2 || '',
                city: profile.city || '',
                state: profile.state || '',
                postalCode: profile.postalCode || '',
                country: profile.country || '',
                emergencyContactName: profile.emergencyContactName || '',
                emergencyContactPhone: profile.emergencyContactPhone || '',
                emergencyContactMobile: profile.emergencyContactMobile || '',
                emergencyContactRelationship: profile.emergencyContactRelationship || '',
            });
        }
    }, [profile, form]);

    const updateProfile = useMutation({
        mutationFn: (data: ProfileFormValues) => apiPatch<UserResponse>('/users/me', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            refreshUser();
            toast.success('Profile updated');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const uploadAvatar = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const result = await apiPostFormData<{ url: string }>('/uploads/images', formData);
            await apiPatch('/users/me', { profileImageUrl: result.url });
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            refreshUser();
            toast.success('Avatar updated');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadAvatar.mutate(file);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Profile Header with Avatar */}
            {profile && (
                <Card>
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                        <div className="relative">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={profile.profileImageUrl || ''} />
                                <AvatarFallback className="text-lg">
                                    {getInitials(profile.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                onClick={handleAvatarClick}
                                disabled={uploadAvatar.isPending}
                                className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90"
                            >
                                {uploadAvatar.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Camera className="h-3.5 w-3.5" />
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{profile.fullName}</h2>
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
                <CardContent className="p-5">
                    <h2 className="mb-3 text-lg font-semibold">Personal Information</h2>
                    <form
                        onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))}
                        className="space-y-4"
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input id="firstName" {...form.register('firstName')} />
                                <FieldError message={form.formState.errors.firstName?.message} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="middleName">Middle Name</Label>
                                <Input id="middleName" {...form.register('middleName')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input id="lastName" {...form.register('lastName')} />
                                <FieldError message={form.formState.errors.lastName?.message} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="suffix">Suffix</Label>
                                <Input id="suffix" placeholder="Jr., Sr., III" {...form.register('suffix')} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" {...form.register('phone')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="personalMobile">Personal Mobile</Label>
                                <Input id="personalMobile" {...form.register('personalMobile')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="personalEmail">Personal Email</Label>
                                <Input id="personalEmail" type="email" {...form.register('personalEmail')} />
                                <FieldError message={form.formState.errors.personalEmail?.message} />
                            </div>
                        </div>

                        <Separator />

                        <h3 className="font-medium">Address</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="address">Address Line 1</Label>
                                <Input id="address" {...form.register('address')} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="addressLine2">Address Line 2</Label>
                                <Input id="addressLine2" {...form.register('addressLine2')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" {...form.register('city')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State / Province</Label>
                                <Input id="state" {...form.register('state')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postalCode">Postal Code</Label>
                                <Input id="postalCode" {...form.register('postalCode')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input id="country" {...form.register('country')} />
                            </div>
                        </div>

                        <Separator />

                        <h3 className="font-medium">Emergency Contact</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContactName">Contact Name</Label>
                                <Input id="emergencyContactName" {...form.register('emergencyContactName')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                                <Input id="emergencyContactPhone" {...form.register('emergencyContactPhone')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContactMobile">Contact Mobile</Label>
                                <Input id="emergencyContactMobile" {...form.register('emergencyContactMobile')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                                <Input id="emergencyContactRelationship" {...form.register('emergencyContactRelationship')} />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={updateProfile.isPending}>
                                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
