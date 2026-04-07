import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    return <p className="text-sm text-destructive">{message}</p>;
}

export default function SecurityTab() {
    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
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
            <Card>
                <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">Change Password</h2>
                    </div>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Your password is managed through Keycloak. Enter your current password to verify your identity, then set a new one.
                    </p>
                    <form
                        onSubmit={form.handleSubmit((data) => changePassword.mutate(data))}
                        className="max-w-md space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password *</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                {...form.register('currentPassword')}
                            />
                            <FieldError message={form.formState.errors.currentPassword?.message} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password *</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                {...form.register('newPassword')}
                            />
                            <FieldError message={form.formState.errors.newPassword?.message} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...form.register('confirmPassword')}
                            />
                            <FieldError message={form.formState.errors.confirmPassword?.message} />
                        </div>
                        <Button type="submit" disabled={changePassword.isPending}>
                            {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Change Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
