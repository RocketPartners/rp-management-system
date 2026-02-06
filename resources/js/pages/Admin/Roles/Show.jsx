import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Edit,
    Lock,
    Mail,
    Shield,
    Users,
} from 'lucide-react';

export default function Show({ auth, role, groupedPermissions }) {
    const isProtectedRole = ['super-admin', 'admin'].includes(role.slug);

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {role.name}
                                </h2>
                                {isProtectedRole && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-yellow-100 text-yellow-700"
                                    >
                                        System Role
                                    </Badge>
                                )}
                            </div>
                            <p className="mt-1 text-gray-600">
                                View role details and permissions
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            asChild
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Link href={route('roles.edit', role.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Role
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('roles.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Roles
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Role: ${role.name}`} />

            <div className="space-y-6">
                {/* Role Details Card */}
                <Card className="animate-fade-in shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-purple-600" />
                            Role Details
                        </CardTitle>
                        <CardDescription>
                            Basic information about this role
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Role Name
                                </dt>
                                <dd className="mt-1 text-base font-semibold text-gray-900">
                                    {role.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Slug
                                </dt>
                                <dd className="mt-1 font-mono text-sm text-gray-900">
                                    {role.slug}
                                </dd>
                            </div>
                        </div>

                        {role.description && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Description
                                </dt>
                                <dd className="mt-1 text-sm text-gray-700">
                                    {role.description}
                                </dd>
                            </div>
                        )}

                        <div className="grid gap-4 border-t pt-4 md:grid-cols-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <div>
                                    <dt className="text-xs text-gray-500">
                                        Users
                                    </dt>
                                    <dd className="font-semibold text-gray-900">
                                        {role.users_count}
                                    </dd>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-gray-400" />
                                <div>
                                    <dt className="text-xs text-gray-500">
                                        Permissions
                                    </dt>
                                    <dd className="font-semibold text-gray-900">
                                        {role.permissions?.length || 0}
                                    </dd>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                    <dt className="text-xs text-gray-500">
                                        Created
                                    </dt>
                                    <dd className="text-sm text-gray-900">
                                        {new Date(
                                            role.created_at,
                                        ).toLocaleDateString()}
                                    </dd>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 border-t pt-4">
                            <Button
                                variant="outline"
                                asChild
                                className="flex-1"
                            >
                                <Link
                                    href={route(
                                        'roles.permissions.edit',
                                        role.id,
                                    )}
                                >
                                    <Lock className="mr-2 h-4 w-4" />
                                    Manage Permissions
                                </Link>
                            </Button>
                            <Button
                                asChild
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                            >
                                <Link href={route('roles.edit', role.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Role
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Assigned Permissions Card */}
                <Card className="animate-fade-in animation-delay-100 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-purple-600" />
                                    Assigned Permissions
                                </CardTitle>
                                <CardDescription>
                                    Permissions granted to this role
                                </CardDescription>
                            </div>
                            <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700"
                            >
                                {role.permissions?.length || 0} permission
                                {role.permissions?.length !== 1 ? 's' : ''}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Object.keys(groupedPermissions).length > 0 ? (
                            Object.entries(groupedPermissions).map(
                                ([group, permissions]) => (
                                    <div
                                        key={group}
                                        className="animate-fade-in space-y-3 rounded-lg border p-4"
                                    >
                                        <h3 className="border-b pb-2 font-semibold capitalize text-gray-900">
                                            {group.replace(/-/g, ' ')}
                                            <Badge
                                                variant="secondary"
                                                className="ml-2 bg-purple-100 text-purple-700"
                                            >
                                                {permissions.length}
                                            </Badge>
                                        </h3>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {permissions.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className="flex items-start gap-3 rounded-md border p-3"
                                                >
                                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {permission.name}
                                                        </div>
                                                        {permission.description && (
                                                            <p className="text-sm text-gray-500">
                                                                {
                                                                    permission.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ),
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Lock className="mb-2 h-12 w-12 text-gray-400" />
                                <p className="text-lg font-medium">
                                    No permissions assigned
                                </p>
                                <p className="text-sm">
                                    This role has no permissions yet
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    asChild
                                >
                                    <Link
                                        href={route(
                                            'roles.permissions.edit',
                                            role.id,
                                        )}
                                    >
                                        <Lock className="mr-2 h-4 w-4" />
                                        Assign Permissions
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Users with this Role Card */}
                <Card className="animate-fade-in animation-delay-200 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-purple-600" />
                                    Users with this Role
                                </CardTitle>
                                <CardDescription>
                                    People assigned to this role
                                </CardDescription>
                            </div>
                            <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-700"
                            >
                                {role.users_count} user
                                {role.users_count !== 1 ? 's' : ''}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {role.users && role.users.length > 0 ? (
                            <div className="space-y-3">
                                {role.users.map((user) => (
                                    <Link
                                        key={user.id}
                                        href={route('users.show', user.id)}
                                        className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                                    >
                                        <Avatar>
                                            <AvatarImage
                                                src={
                                                    user.profile_picture
                                                        ? `/storage/${user.profile_picture}`
                                                        : undefined
                                                }
                                            />
                                            <AvatarFallback className="bg-purple-100 text-purple-600">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">
                                                {user.name}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Mail className="h-3 w-3" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {role.users_count > 10 && (
                                    <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                                        Showing first 10 users.{' '}
                                        {role.users_count - 10} more user
                                        {role.users_count - 10 !== 1
                                            ? 's have'
                                            : ' has'}{' '}
                                        this role.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                <Users className="mb-2 h-12 w-12 text-gray-400" />
                                <p className="text-lg font-medium">
                                    No users assigned
                                </p>
                                <p className="text-sm">
                                    No users have this role yet
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
