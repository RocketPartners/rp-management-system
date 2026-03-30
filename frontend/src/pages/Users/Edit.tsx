import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGet, apiPut } from '@/lib/spring-boot-api';
import type { UserResponse } from '@/types';
import { UserForm, type UserFormValues } from '@/components/users/UserForm';

export default function EditUser() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['users', Number(id)],
        queryFn: () => apiGet<UserResponse>(`/users/${id}`),
        enabled: !!id,
    });

    const updateMutation = useMutation({
        mutationFn: (data: UserFormValues) =>
            apiPut<UserResponse>(`/users/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User updated successfully');
            navigate(`/users/${id}`);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
                <p className="text-muted-foreground">User not found.</p>
                <Link
                    to="/users"
                    className="text-sm text-primary hover:underline"
                >
                    Back to Users
                </Link>
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

            <div className="space-y-6">
                <div>
                    <Link
                        to={`/users/${id}`}
                        className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to User
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Edit User
                    </h1>
                    <p className="text-muted-foreground">
                        Update {user.fullName}'s information.
                    </p>
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
