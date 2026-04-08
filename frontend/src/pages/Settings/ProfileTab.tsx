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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-sm text-red-600">{message}</p>;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="border-b border-gray-100 pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                {children}
            </h3>
        </div>
    );
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
            firstName: '', middleName: '', lastName: '', suffix: '',
            phone: '', personalMobile: '', personalEmail: '',
            address: '', addressLine2: '', city: '', state: '', postalCode: '', country: '',
            emergencyContactName: '', emergencyContactPhone: '', emergencyContactMobile: '', emergencyContactRelationship: '',
        },
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                firstName: profile.firstName || '', middleName: profile.middleName || '',
                lastName: profile.lastName || '', suffix: profile.suffix || '',
                phone: profile.phone || '', personalMobile: profile.personalMobile || '',
                personalEmail: profile.personalEmail || '',
                address: profile.address || '', addressLine2: profile.addressLine2 || '',
                city: profile.city || '', state: profile.state || '',
                postalCode: profile.postalCode || '', country: profile.country || '',
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
            <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-80 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            {profile && (
                <div className="flex items-center gap-5 rounded-xl border border-gray-200 bg-white p-5">
                    <div className="group relative cursor-pointer" onClick={handleAvatarClick}>
                        <Avatar className="h-[72px] w-[72px] ring-2 ring-gray-100 ring-offset-2">
                            <AvatarImage src={profile.profileImageUrl || ''} />
                            <AvatarFallback className="bg-blue-600 text-lg font-semibold text-white">
                                {getInitials(profile.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            {uploadAvatar.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin text-white" />
                            ) : (
                                <Camera className="h-5 w-5 text-white" />
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-semibold text-gray-900">{profile.fullName}</h2>
                        <p className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            {profile.email}
                        </p>
                        {(profile.departmentName || profile.positionTitle) && (
                            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500">
                                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                                {[profile.departmentName, profile.positionTitle].filter(Boolean).join(' \u00b7 ')}
                            </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {profile.roles.map((role) => (
                                <Badge key={role} variant="secondary" className="text-xs">
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <form
                onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))}
                className="space-y-6 rounded-xl border border-gray-200 bg-white p-5"
            >
                <SectionHeader>Personal Information</SectionHeader>
                <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-xs">First Name *</Label>
                        <Input id="firstName" {...form.register('firstName')} />
                        <FieldError message={form.formState.errors.firstName?.message} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="middleName" className="text-xs">Middle Name</Label>
                        <Input id="middleName" {...form.register('middleName')} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-xs">Last Name *</Label>
                        <Input id="lastName" {...form.register('lastName')} />
                        <FieldError message={form.formState.errors.lastName?.message} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="suffix" className="text-xs">Suffix</Label>
                        <Input id="suffix" placeholder="Jr., Sr., III" {...form.register('suffix')} />
                    </div>
                </div>

                <div className="grid gap-x-4 gap-y-3 sm:grid-cols-3">
                    <div className="space-y-1">
                        <Label htmlFor="phone" className="text-xs">Phone</Label>
                        <Input id="phone" {...form.register('phone')} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="personalMobile" className="text-xs">Personal Mobile</Label>
                        <Input id="personalMobile" {...form.register('personalMobile')} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="personalEmail" className="text-xs">Personal Email</Label>
                        <Input id="personalEmail" type="email" {...form.register('personalEmail')} />
                        <FieldError message={form.formState.errors.personalEmail?.message} />
                    </div>
                </div>

                <SectionHeader>Address</SectionHeader>
                <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="address" className="text-xs">Address Line 1</Label>
                        <Input id="address" {...form.register('address')} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="addressLine2" className="text-xs">Address Line 2</Label>
                        <Input id="addressLine2" {...form.register('addressLine2')} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="city" className="text-xs">City</Label>
                        <Input id="city" {...form.register('city')} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="state" className="text-xs">State / Province</Label>
                        <Input id="state" {...form.register('state')} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="postalCode" className="text-xs">Postal Code</Label>
                        <Input id="postalCode" {...form.register('postalCode')} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="country" className="text-xs">Country</Label>
                        <Input id="country" {...form.register('country')} />
                    </div>
                </div>

                <SectionHeader>Emergency Contact</SectionHeader>
                <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="emergencyContactName" className="text-xs">Contact Name</Label>
                        <Input id="emergencyContactName" {...form.register('emergencyContactName')} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="emergencyContactPhone" className="text-xs">Contact Phone</Label>
                        <Input id="emergencyContactPhone" {...form.register('emergencyContactPhone')} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="emergencyContactMobile" className="text-xs">Contact Mobile</Label>
                        <Input id="emergencyContactMobile" {...form.register('emergencyContactMobile')} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="emergencyContactRelationship" className="text-xs">Relationship</Label>
                        <Input id="emergencyContactRelationship" {...form.register('emergencyContactRelationship')} />
                    </div>
                </div>

                <div className="flex justify-end border-t border-gray-100 pt-4">
                    <Button type="submit" disabled={updateProfile.isPending}>
                        {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
