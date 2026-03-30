import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { apiPost } from '@/lib/spring-boot-api';
import type { UserResponse } from '@/types';
import { UserForm, type UserFormValues } from '@/components/users/UserForm';

export default function CreateUser() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: UserFormValues) =>
            apiPost<UserResponse>('/users', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User created successfully');
            navigate('/users');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    return (
        <>
            <Helmet>
                <title>Create User | HRIS</title>
            </Helmet>

            <div className="space-y-6">
                <div>
                    <Link
                        to="/users"
                        className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Users
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Create User
                    </h1>
                    <p className="text-muted-foreground">
                        Add a new user to the system.
                    </p>
                </div>

                <UserForm
                    mode="create"
                    onSubmit={(data) => createMutation.mutate(data)}
                    isSubmitting={createMutation.isPending}
                />
            </div>
        </>
    );
}
