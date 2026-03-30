import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Briefcase,
    Contact,
    CreditCard,
    Edit,
    Mail,
    MapPin,
    Phone,
    Trash2,
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionMatrix } from '@/components/users/PermissionMatrix';
import { UserStatusBadge } from '@/components/users/UserStatusBadge';
import { usePermission } from '@/hooks/usePermission';
import { apiGet, apiPost, apiDelete } from '@/lib/spring-boot-api';
import type { UserResponse, PermissionMatrixEntry } from '@/types';

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function maskId(value: string | null): string {
    if (!value) return '—';
    if (value.length <= 4) return value;
    return '\u2022\u2022\u2022\u2022' + value.slice(-4);
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div>
            <dt className="text-sm font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 text-sm">{value || '—'}</dd>
        </div>
    );
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function UserShow() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { can } = usePermission();
    const queryClient = useQueryClient();

    const {
        data: user,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['users', Number(id)],
        queryFn: () => apiGet<UserResponse>(`/users/${id}`),
        enabled: !!id,
    });

    const { data: permissions = [], refetch: refetchPermissions } = useQuery({
        queryKey: ['users', Number(id), 'permissions'],
        queryFn: () =>
            apiGet<PermissionMatrixEntry[]>(`/users/${id}/permissions`),
        enabled: !!id,
    });

    const deleteMutation = useMutation({
        mutationFn: () => apiDelete(`/users/${id}`),
        onSuccess: () => {
            toast.success('User deleted');
            navigate('/users');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const approveMutation = useMutation({
        mutationFn: () => apiPost(`/users/${id}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['users', Number(id)],
            });
            toast.success('User approved');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const rejectMutation = useMutation({
        mutationFn: () => apiPost(`/users/${id}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['users', Number(id)],
            });
            toast.success('User rejected');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const suspendMutation = useMutation({
        mutationFn: () => apiPost(`/users/${id}/suspend`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['users', Number(id)],
            });
            toast.success('User suspended');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const activateMutation = useMutation({
        mutationFn: () => apiPost(`/users/${id}/activate`),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['users', Number(id)],
            });
            toast.success('User activated');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 w-full" />
                <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-60" />
                    <Skeleton className="h-60" />
                </div>
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

    return (
        <>
            <Helmet>
                <title>{user.fullName} | HRIS</title>
            </Helmet>

            <div className="space-y-6">
                <Link
                    to="/users"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Users
                </Link>

                {/* Header Card */}
                <Card>
                    <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.profileImageUrl || ''} />
                            <AvatarFallback className="text-lg">
                                {getInitials(user.fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold">
                                    {user.fullName}
                                </h1>
                                <UserStatusBadge
                                    status={user.accountStatus}
                                />
                            </div>
                            <p className="text-muted-foreground">
                                {user.email}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                    <Badge key={role} variant="secondary">
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {can('users.edit') && (
                                <Button variant="outline" asChild>
                                    <Link to={`/users/${id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                            {user.accountStatus === 'PENDING' && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="text-green-600"
                                        onClick={() =>
                                            approveMutation.mutate()
                                        }
                                        disabled={approveMutation.isPending}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="text-red-600"
                                        onClick={() =>
                                            rejectMutation.mutate()
                                        }
                                        disabled={rejectMutation.isPending}
                                    >
                                        Reject
                                    </Button>
                                </>
                            )}
                            {user.accountStatus === 'ACTIVE' && (
                                <Button
                                    variant="outline"
                                    className="text-orange-600"
                                    onClick={() => suspendMutation.mutate()}
                                    disabled={suspendMutation.isPending}
                                >
                                    Suspend
                                </Button>
                            )}
                            {user.accountStatus === 'SUSPENDED' && (
                                <Button
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() => activateMutation.mutate()}
                                    disabled={activateMutation.isPending}
                                >
                                    Activate
                                </Button>
                            )}
                            {can('users.delete') && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Delete User
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete{' '}
                                                {user.fullName}? This action
                                                cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() =>
                                                    deleteMutation.mutate()
                                                }
                                                className="bg-destructive text-white hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Personal Info */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <Contact className="h-5 w-5" />
                                Personal Information
                            </h2>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <DetailRow
                                    label="First Name"
                                    value={user.firstName}
                                />
                                <DetailRow
                                    label="Last Name"
                                    value={user.lastName}
                                />
                                <DetailRow
                                    label="Middle Name"
                                    value={user.middleName}
                                />
                                <DetailRow
                                    label="Suffix"
                                    value={user.suffix}
                                />
                                <DetailRow
                                    label="Gender"
                                    value={user.gender}
                                />
                                <DetailRow
                                    label="Date of Birth"
                                    value={formatDate(user.dateOfBirth)}
                                />
                                <DetailRow
                                    label="Civil Status"
                                    value={user.civilStatus}
                                />
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Contact & Address */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <Mail className="h-5 w-5" />
                                Contact & Address
                            </h2>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <DetailRow
                                    label="Phone"
                                    value={user.phone}
                                />
                                <DetailRow
                                    label="Personal Mobile"
                                    value={user.personalMobile}
                                />
                                <DetailRow
                                    label="Work Email"
                                    value={user.workEmail}
                                />
                                <DetailRow
                                    label="Personal Email"
                                    value={user.personalEmail}
                                />
                            </dl>
                            <Separator className="my-4" />
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <DetailRow
                                    label="Address"
                                    value={user.address}
                                />
                                <DetailRow
                                    label="Address Line 2"
                                    value={user.addressLine2}
                                />
                                <DetailRow label="City" value={user.city} />
                                <DetailRow label="State" value={user.state} />
                                <DetailRow
                                    label="Postal Code"
                                    value={user.postalCode}
                                />
                                <DetailRow
                                    label="Country"
                                    value={user.country}
                                />
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <Phone className="h-5 w-5" />
                                Emergency Contact
                            </h2>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <DetailRow
                                    label="Contact Name"
                                    value={user.emergencyContactName}
                                />
                                <DetailRow
                                    label="Phone"
                                    value={user.emergencyContactPhone}
                                />
                                <DetailRow
                                    label="Mobile"
                                    value={user.emergencyContactMobile}
                                />
                                <DetailRow
                                    label="Relationship"
                                    value={user.emergencyContactRelationship}
                                />
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Government IDs */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <CreditCard className="h-5 w-5" />
                                Government IDs
                            </h2>
                            <dl className="grid gap-4 sm:grid-cols-2">
                                <DetailRow
                                    label="SSS"
                                    value={maskId(user.sssNumber)}
                                />
                                <DetailRow
                                    label="TIN"
                                    value={maskId(user.tinNumber)}
                                />
                                <DetailRow
                                    label="HDMF / Pag-IBIG"
                                    value={maskId(user.hdmfNumber)}
                                />
                                <DetailRow
                                    label="PhilHealth"
                                    value={maskId(user.philhealthNumber)}
                                />
                                <DetailRow
                                    label="Payroll Account"
                                    value={maskId(user.payrollAccount)}
                                />
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                {/* Employment */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <Briefcase className="h-5 w-5" />
                            Employment
                        </h2>
                        <dl className="grid gap-4 sm:grid-cols-3">
                            <DetailRow
                                label="Employee ID"
                                value={user.employeeId}
                            />
                            <DetailRow
                                label="Hire Date"
                                value={formatDate(user.hireDate)}
                            />
                            <DetailRow
                                label="Employment Type"
                                value={user.employmentType}
                            />
                            <DetailRow
                                label="Department"
                                value={user.departmentName}
                            />
                            <DetailRow
                                label="Position"
                                value={user.positionTitle}
                            />
                            <DetailRow
                                label="Manager"
                                value={user.managerName}
                            />
                        </dl>
                    </CardContent>
                </Card>

                {/* Permissions */}
                <PermissionMatrix
                    userId={Number(id)}
                    permissions={permissions}
                    onRefresh={() => refetchPermissions()}
                />
            </div>
        </>
    );
}
