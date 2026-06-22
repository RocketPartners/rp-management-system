import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiGet, apiPost } from '@/lib/spring-boot-api';
import type { UserResponse, RoleOption } from '@/types';
import { UserForm, type UserFormValues } from '@/components/users/UserForm';

/** Convert frontend form values to backend CreateUserRequest shape */
function toCreateRequest(
    data: UserFormValues,
    allRoles: RoleOption[],
): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if (key === 'roles') {
            payload.roleIds = (value as string[])
                .map((name) => allRoles.find((r) => r.name === name)?.id)
                .filter(Boolean);
            continue;
        }
        if (value === '') {
            payload[key] = null;
            continue;
        }
        payload[key] = value;
    }
    return payload;
}

export default function CreateUser() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: allRoles = [] } = useQuery({
        queryKey: ['roles', 'all'],
        queryFn: () => apiGet<RoleOption[]>('/roles/all'),
    });

    const createMutation = useMutation({
        mutationFn: (data: UserFormValues) =>
            apiPost<UserResponse>('/users', toCreateRequest(data, allRoles)),
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

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link to="/users">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Users className="h-6 w-6 text-blue-600" />
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

                <UserForm
                    mode="create"
                    onSubmit={(data) => createMutation.mutate(data)}
                    isSubmitting={createMutation.isPending}
                />
            </div>
        </>
    );
}
