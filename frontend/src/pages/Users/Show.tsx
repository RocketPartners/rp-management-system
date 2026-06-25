import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    CreditCard,
    Edit,
    Heart,
    Mail,
    MapPin,
    Phone,
    Shield,
    Trash2,
    User,
    UserCheck,
    UserX,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionMatrix } from '@/components/users/PermissionMatrix';
import { UserStatusBadge } from '@/components/users/UserStatusBadge';
import { usePermission } from '@/hooks/use-permission';
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
        queryFn: async () => {
            const raw = await apiGet<
                Array<{
                    id: number;
                    name: string;
                    description: string;
                    fromRole: boolean;
                    effective: boolean;
                    overrideType?: 'GRANT' | 'REVOKE' | null;
                    reason?: string | null;
                    expiresAt?: string | null;
                    grantedBy?: number | null;
                }>
            >(`/users/${id}/permissions`);
            return raw.map((p): PermissionMatrixEntry => {
                const parts = p.name.split('_');
                parts.pop();
                const group = parts
                    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
                    .join(' ');
                return {
                    permissionId: p.id,
                    permissionName: p.description || p.name,
                    permissionSlug: p.name,
                    group: group || 'General',
                    fromRole: p.fromRole,
                    overrideType: p.overrideType ?? null,
                    effective: p.effective,
                    reason: p.reason ?? null,
                    expiresAt: p.expiresAt ?? null,
                    grantedBy: p.grantedBy ?? null,
                };
            });
        },
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
            queryClient.invalidateQueries({ queryKey: ['users', Number(id)] });
            toast.success('User approved');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const rejectMutation = useMutation({
        mutationFn: () => apiPost(`/users/${id}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', Number(id)] });
            toast.success('User rejected');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const suspendMutation = useMutation({
        mutationFn: () => apiPost(`/users/${id}/suspend`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', Number(id)] });
            toast.success('User suspended');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const activateMutation = useMutation({
        mutationFn: () => apiPost(`/users/${id}/activate`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users', Number(id)] });
            toast.success('User activated');
        },
        onError: (err: Error) => toast.error(err.message),
    });

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <Skeleton className="h-5 w-28" />
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-36" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="grid gap-6 lg:grid-cols-3">
                    <Skeleton className="h-60 lg:col-span-2" />
                    <Skeleton className="h-60 lg:col-span-1" />
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                    <div className="rounded-full bg-gray-100 p-4">
                        <UserX className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900">User not found</p>
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/users">Back to Users</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{user.fullName} | HRIS</title>
            </Helmet>

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="ghost" size="sm">
                            <Link to="/users">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                                <span className="text-xl font-medium text-white">
                                    {getInitials(user.fullName)}
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {user.fullName}
                                    </h2>
                                    <UserStatusBadge status={user.accountStatus} />
                                </div>
                                <p className="mt-1 text-gray-600">
                                    {user.positionTitle || 'Employee'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {user.accountStatus === 'PENDING' && (
                            <>
                                <Button
                                    onClick={() => approveMutation.mutate()}
                                    disabled={approveMutation.isPending}
                                    className="bg-green-600 text-white hover:bg-green-700"
                                >
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => rejectMutation.mutate()}
                                    disabled={rejectMutation.isPending}
                                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                            </>
                        )}
                        {user.accountStatus === 'ACTIVE' && (
                            <Button
                                variant="outline"
                                onClick={() => suspendMutation.mutate()}
                                disabled={suspendMutation.isPending}
                                className="border-orange-300 text-orange-600 hover:bg-orange-50"
                            >
                                Suspend
                            </Button>
                        )}
                        {user.accountStatus === 'SUSPENDED' && (
                            <Button
                                onClick={() => activateMutation.mutate()}
                                disabled={activateMutation.isPending}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                Activate
                            </Button>
                        )}
                        {can('users.edit') && (
                            <Button asChild variant="outline">
                                <Link to={`/users/${id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
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
                                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete{' '}
                                            <span className="font-medium">{user.fullName}</span>?
                                            This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => deleteMutation.mutate()}
                                            className="bg-destructive text-white hover:bg-destructive/90"
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>

                {/* Tabbed Content */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Main Column */}
                            <div className="space-y-6 lg:col-span-2">
                                {/* Personal Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Personal Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div>
                                                <p className="mb-1 text-sm text-gray-600">First Name</p>
                                                <p className="font-medium text-gray-900">{user.firstName || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-sm text-gray-600">Middle Name</p>
                                                <p className="font-medium text-gray-900">{user.middleName || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-sm text-gray-600">Last Name</p>
                                                <p className="font-medium text-gray-900">{user.lastName || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-sm text-gray-600">Suffix</p>
                                                <p className="font-medium text-gray-900">{user.suffix || '—'}</p>
                                            </div>
                                            {user.gender && (
                                                <div>
                                                    <p className="mb-1 text-sm text-gray-600">Gender</p>
                                                    <p className="font-medium capitalize text-gray-900">{user.gender}</p>
                                                </div>
                                            )}
                                            {user.dateOfBirth && (
                                                <div>
                                                    <p className="mb-1 text-sm text-gray-600">Date of Birth</p>
                                                    <p className="font-medium text-gray-900">{formatDate(user.dateOfBirth)}</p>
                                                </div>
                                            )}
                                            {user.civilStatus && (
                                                <div>
                                                    <p className="mb-1 text-sm text-gray-600">Civil Status</p>
                                                    <p className="font-medium capitalize text-gray-900">{user.civilStatus}</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Contact Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Phone className="h-5 w-5" />
                                            Contact Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Primary Email</p>
                                                    <p className="font-medium text-gray-900">{user.email}</p>
                                                </div>
                                            </div>
                                            {user.workEmail && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Work Email</p>
                                                        <p className="font-medium text-gray-900">{user.workEmail}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {user.personalEmail && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Personal Email</p>
                                                        <p className="font-medium text-gray-900">{user.personalEmail}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {user.phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Phone</p>
                                                        <p className="font-medium text-gray-900">{user.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {user.personalMobile && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-5 w-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Personal Mobile</p>
                                                        <p className="font-medium text-gray-900">{user.personalMobile}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Address */}
                                {(user.address || user.city) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5" />
                                                Address
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-1 text-gray-900">
                                                {user.address && <p>{user.address}</p>}
                                                {user.addressLine2 && <p>{user.addressLine2}</p>}
                                                {(user.city || user.state || user.postalCode) && (
                                                    <p>
                                                        {[user.city, user.state, user.postalCode]
                                                            .filter(Boolean)
                                                            .join(', ')}
                                                    </p>
                                                )}
                                                {user.country && <p>{user.country}</p>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Emergency Contact */}
                                {(user.emergencyContactName || user.emergencyContactPhone) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Heart className="h-5 w-5 text-red-600" />
                                                Emergency Contact
                                            </CardTitle>
                                            <CardDescription>
                                                Person to contact in case of emergency
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {user.emergencyContactName && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="rounded-lg bg-red-50 p-2">
                                                            <User className="h-5 w-5 text-red-600" />
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-sm text-gray-600">Contact Name</p>
                                                            <p className="font-medium text-gray-900">{user.emergencyContactName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {user.emergencyContactRelationship && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="rounded-lg bg-pink-50 p-2">
                                                            <Heart className="h-5 w-5 text-pink-600" />
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-sm text-gray-600">Relationship</p>
                                                            <p className="font-medium text-gray-900">{user.emergencyContactRelationship}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {user.emergencyContactPhone && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="rounded-lg bg-orange-50 p-2">
                                                            <Phone className="h-5 w-5 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-sm text-gray-600">Phone</p>
                                                            <p className="font-medium text-gray-900">{user.emergencyContactPhone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {user.emergencyContactMobile && (
                                                    <div className="flex items-start gap-3">
                                                        <div className="rounded-lg bg-blue-50 p-2">
                                                            <Phone className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-sm text-gray-600">Mobile</p>
                                                            <p className="font-medium text-gray-900">{user.emergencyContactMobile}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Government IDs */}
                                {(user.sssNumber || user.tinNumber || user.philhealthNumber || user.hdmfNumber || user.payrollAccount) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CreditCard className="h-5 w-5" />
                                                Government IDs & Benefits
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {user.sssNumber && (
                                                    <div className="rounded-lg bg-blue-50 p-3">
                                                        <p className="mb-1 text-xs text-gray-600">SSS Number</p>
                                                        <p className="font-mono font-medium text-gray-900">{maskId(user.sssNumber)}</p>
                                                    </div>
                                                )}
                                                {user.tinNumber && (
                                                    <div className="rounded-lg bg-green-50 p-3">
                                                        <p className="mb-1 text-xs text-gray-600">TIN Number</p>
                                                        <p className="font-mono font-medium text-gray-900">{maskId(user.tinNumber)}</p>
                                                    </div>
                                                )}
                                                {user.philhealthNumber && (
                                                    <div className="rounded-lg bg-purple-50 p-3">
                                                        <p className="mb-1 text-xs text-gray-600">PhilHealth Number</p>
                                                        <p className="font-mono font-medium text-gray-900">{maskId(user.philhealthNumber)}</p>
                                                    </div>
                                                )}
                                                {user.hdmfNumber && (
                                                    <div className="rounded-lg bg-yellow-50 p-3">
                                                        <p className="mb-1 text-xs text-gray-600">HDMF (Pag-IBIG) Number</p>
                                                        <p className="font-mono font-medium text-gray-900">{maskId(user.hdmfNumber)}</p>
                                                    </div>
                                                )}
                                                {user.payrollAccount && (
                                                    <div className="rounded-lg bg-indigo-50 p-3">
                                                        <p className="mb-1 text-xs text-gray-600">Payroll Account</p>
                                                        <p className="font-mono font-medium text-gray-900">{maskId(user.payrollAccount)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Employment Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5" />
                                            Employment
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {user.employeeId && (
                                            <div>
                                                <p className="mb-1 text-sm text-gray-600">Employee ID</p>
                                                <p className="font-mono font-medium text-gray-900">{user.employeeId}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="mb-1 text-sm text-gray-600">Department</p>
                                            <p className="font-medium text-gray-900">{user.departmentName || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-sm text-gray-600">Position</p>
                                            <p className="font-medium text-gray-900">{user.positionTitle || '—'}</p>
                                        </div>
                                        {user.managerName && (
                                            <div>
                                                <p className="mb-1 text-sm text-gray-600">Manager</p>
                                                <p className="font-medium text-gray-900">{user.managerName}</p>
                                            </div>
                                        )}
                                        {user.hireDate && (
                                            <div>
                                                <p className="mb-1 text-sm text-gray-600">Hire Date</p>
                                                <p className="font-medium text-gray-900">{formatDate(user.hireDate)}</p>
                                            </div>
                                        )}
                                        {user.employmentType && (
                                            <div>
                                                <p className="mb-1 text-sm text-gray-600">Employment Type</p>
                                                <Badge className="border border-green-200 bg-green-100 text-green-700">
                                                    {user.employmentType.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Roles */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5" />
                                            Roles
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {(user.roles ?? []).length > 0 ? (
                                            <div className="space-y-2">
                                                {(user.roles ?? []).map((role) => (
                                                    <div
                                                        key={role}
                                                        className="flex items-center gap-2 rounded-lg bg-purple-50 p-3"
                                                    >
                                                        <Shield className="h-4 w-4 text-purple-600" />
                                                        <p className="font-medium text-gray-900">
                                                            {role}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No roles assigned</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Account Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Account Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="mb-1 text-sm text-gray-600">Account Status</p>
                                            <UserStatusBadge status={user.accountStatus} />
                                        </div>
                                        <div>
                                            <p className="mb-1 text-sm text-gray-600">Created</p>
                                            <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                                        </div>
                                        {user.updatedAt && (
                                            <div>
                                                <p className="mb-1 text-sm text-gray-600">Last Updated</p>
                                                <p className="font-medium text-gray-900">{formatDate(user.updatedAt)}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="permissions">
                        <PermissionMatrix
                            userId={Number(id)}
                            permissions={permissions}
                            onRefresh={() => refetchPermissions()}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
