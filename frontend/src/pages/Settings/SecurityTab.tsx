import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, KeyRound, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiPut } from '@/lib/spring-boot-api';

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type PasswordFormValues = z.infer<typeof passwordSchema>;

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-sm text-red-600">{message}</p>;
}

export default function SecurityTab() {
    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    });

    const changePassword = useMutation({
        mutationFn: (data: PasswordFormValues) =>
            apiPut('/users/me/password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            }),
        onSuccess: () => {
            form.reset();
            toast.success('Password changed successfully');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="mb-5 flex items-start gap-3">
                    <div className="rounded-lg bg-amber-50 p-2">
                        <KeyRound className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
                        <p className="mt-0.5 text-sm text-gray-500">
                            Update your password to keep your account secure
                        </p>
                    </div>
                </div>

                <div className="mb-5 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <p className="text-xs text-blue-700">
                        Your password is managed through the identity provider. Enter your current password to verify your identity.
                    </p>
                </div>

                <form
                    onSubmit={form.handleSubmit((data) => changePassword.mutate(data))}
                    className="max-w-sm space-y-3"
                >
                    <div className="space-y-1">
                        <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
                        <Input id="currentPassword" type="password" {...form.register('currentPassword')} />
                        <FieldError message={form.formState.errors.currentPassword?.message} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                        <Input id="newPassword" type="password" {...form.register('newPassword')} />
                        <FieldError message={form.formState.errors.newPassword?.message} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} />
                        <FieldError message={form.formState.errors.confirmPassword?.message} />
                    </div>
                    <div className="pt-2">
                        <Button type="submit" disabled={changePassword.isPending}>
                            {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
