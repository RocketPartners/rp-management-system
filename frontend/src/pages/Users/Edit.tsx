import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGet, apiPut } from '@/lib/spring-boot-api';
import type { UserResponse, RoleOption } from '@/types';
import { UserForm, type UserFormValues } from '@/components/users/UserForm';

/** Convert frontend form values to backend UpdateUserRequest shape */
function toUpdateRequest(
    data: UserFormValues,
    allRoles: RoleOption[],
): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if (key === 'password') continue;
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

export default function EditUser() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['users', Number(id)],
        queryFn: () => apiGet<UserResponse>(`/users/${id}`),
        enabled: !!id,
    });

    const { data: allRoles = [] } = useQuery({
        queryKey: ['roles', 'all'],
        queryFn: () => apiGet<RoleOption[]>('/roles/all'),
    });

    const updateMutation = useMutation({
        mutationFn: (data: UserFormValues) =>
            apiPut<UserResponse>(`/users/${id}`, toUpdateRequest(data, allRoles)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User updated successfully');
            navigate(`/users/${id}`);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[600px] w-full max-w-4xl" />
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                    <p className="text-lg font-medium text-gray-900">User not found</p>
                    <Button asChild variant="outline">
                        <Link to="/users">Back to Users</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const defaultValues: Partial<UserFormValues> = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName || '',
        suffix: user.suffix || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        civilStatus: user.civilStatus || '',
        phone: user.phone || '',
        personalMobile: user.personalMobile || '',
        workEmail: user.workEmail || '',
        personalEmail: user.personalEmail || '',
        address: user.address || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || '',
        country: user.country || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        emergencyContactMobile: user.emergencyContactMobile || '',
        emergencyContactRelationship: user.emergencyContactRelationship || '',
        sssNumber: user.sssNumber || '',
        tinNumber: user.tinNumber || '',
        hdmfNumber: user.hdmfNumber || '',
        philhealthNumber: user.philhealthNumber || '',
        payrollAccount: user.payrollAccount || '',
        employeeId: user.employeeId || '',
        hireDate: user.hireDate || '',
        employmentType: user.employmentType || '',
        departmentId: user.departmentId,
        positionId: user.positionId,
        managerId: user.managerId,
        roles: user.roles || [],
    };

    return (
        <>
            <Helmet>
                <title>Edit {user.fullName} | HRIS</title>
            </Helmet>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link to={`/users/${id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                            <span className="text-xl font-medium text-white">
                                {user.fullName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Edit {user.fullName}
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Update user information
                            </p>
                        </div>
                    </div>
                </div>

                <UserForm
                    mode="edit"
                    defaultValues={defaultValues}
                    onSubmit={(data) => updateMutation.mutate(data)}
                    isSubmitting={updateMutation.isPending}
                />
            </div>
        </>
    );
}
