import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Eye,
    Info,
    Loader2,
    Lock,
    Save,
    Shield,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Edit({ auth, role, permissions = {} }) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name || '',
        slug: role.slug || '',
        description: role.description || '',
        hierarchy_level: role.hierarchy_level || 6,
        permissions: role.permissions?.map((p) => p.id) || [],
    });

    const [selectedCount, setSelectedCount] = useState(0);

    useEffect(() => {
        setSelectedCount(data.permissions.length);
    }, [data.permissions]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('roles.update', role.id));
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setData('name', name);
    };

    const handlePermissionToggle = (permissionId) => {
        const currentPermissions = [...data.permissions];
        const index = currentPermissions.indexOf(permissionId);

        if (index > -1) {
            currentPermissions.splice(index, 1);
        } else {
            currentPermissions.push(permissionId);
        }

        setData('permissions', currentPermissions);
    };

    const handleSelectAllInGroup = (groupPermissions) => {
        const groupPermissionIds = groupPermissions.map((p) => p.id);
        const allSelected = groupPermissionIds.every((id) =>
            data.permissions.includes(id),
        );

        if (allSelected) {
            // Deselect all in group
            setData(
                'permissions',
                data.permissions.filter(
                    (id) => !groupPermissionIds.includes(id),
                ),
            );
        } else {
            // Select all in group
            const newPermissions = [...data.permissions];
            groupPermissionIds.forEach((id) => {
                if (!newPermissions.includes(id)) {
                    newPermissions.push(id);
                }
            });
            setData('permissions', newPermissions);
        }
    };

    const isGroupFullySelected = (groupPermissions) => {
        const groupPermissionIds = groupPermissions.map((p) => p.id);
        return groupPermissionIds.every((id) => data.permissions.includes(id));
    };

    const isProtectedRole = ['super-admin', 'admin'].includes(role.slug);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Edit Role: {role.name}
                            </h2>
                            <p className="mt-1 text-gray-600">
                                Update role details and permissions
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('roles.show', role.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
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
            <Head title={`Edit Role: ${role.name}`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* System Role Warning */}
                {isProtectedRole && (
                    <Alert className="animate-fade-in border-yellow-300 bg-yellow-50">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                            <strong>Warning:</strong> This is a protected system
                            role. Be careful when modifying its permissions as
                            it may affect system functionality.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Basic Information Card */}
                <Card className="animate-fade-in shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-purple-600" />
                            Basic Information
                        </CardTitle>
                        <CardDescription>
                            Update the role name, slug, and description
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Role Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Role Name{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={handleNameChange}
                                placeholder="e.g., DevOps Engineer"
                                className={errors.name ? 'border-red-500' : ''}
                                disabled={isProtectedRole}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Slug */}
                        <div className="space-y-2">
                            <Label htmlFor="slug">
                                Slug <span className="text-red-500">*</span>
                                <span className="ml-2 text-xs font-normal text-gray-500">
                                    (URL-friendly identifier, lowercase with
                                    hyphens)
                                </span>
                            </Label>
                            <Input
                                id="slug"
                                type="text"
                                value={data.slug}
                                onChange={(e) =>
                                    setData('slug', e.target.value)
                                }
                                placeholder="e.g., devops-engineer"
                                className={errors.slug ? 'border-red-500' : ''}
                                disabled={isProtectedRole}
                            />
                            {errors.slug && (
                                <p className="text-sm text-red-600">
                                    {errors.slug}
                                </p>
                            )}
                            {isProtectedRole && (
                                <Alert className="border-blue-200 bg-blue-50">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-sm text-blue-800">
                                        The slug cannot be modified for
                                        protected system roles.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Describe the role and its responsibilities..."
                                rows={4}
                                maxLength={500}
                                className={
                                    errors.description ? 'border-red-500' : ''
                                }
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>
                                    {errors.description && (
                                        <span className="text-red-600">
                                            {errors.description}
                                        </span>
                                    )}
                                </span>
                                <span>{data.description.length}/500</span>
                            </div>
                        </div>

                        {/* Hierarchy Level */}
                        <div className="space-y-2">
                            <Label htmlFor="hierarchy_level">
                                Hierarchy Level{' '}
                                <span className="text-red-500">*</span>
                                <span className="ml-2 text-xs font-normal text-gray-500">
                                    (Higher number = higher authority)
                                </span>
                            </Label>
                            <Input
                                id="hierarchy_level"
                                type="number"
                                min="1"
                                max="10"
                                value={data.hierarchy_level}
                                onChange={(e) =>
                                    setData(
                                        'hierarchy_level',
                                        parseInt(e.target.value) || 1,
                                    )
                                }
                                placeholder="6"
                                className={
                                    errors.hierarchy_level
                                        ? 'border-red-500'
                                        : ''
                                }
                                disabled={isProtectedRole}
                            />
                            {errors.hierarchy_level && (
                                <p className="text-sm text-red-600">
                                    {errors.hierarchy_level}
                                </p>
                            )}
                            <Alert className="border-blue-200 bg-blue-50">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-sm text-blue-800">
                                    <strong>Common levels:</strong> Admin (10),
                                    HR Manager (9), Project Manager (8), Lead
                                    Engineer (7), Senior Engineer (6), Mid-Level
                                    (5), Junior (4), Entry (3), Employee (2)
                                </AlertDescription>
                            </Alert>
                        </div>

                        {/* Last Updated */}
                        <Alert className="border-gray-200 bg-gray-50">
                            <Info className="h-4 w-4 text-gray-600" />
                            <AlertDescription className="text-sm text-gray-700">
                                <strong>Last updated:</strong>{' '}
                                {new Date(role.updated_at).toLocaleString()}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Permissions Card */}
                <Card className="animate-fade-in animation-delay-100 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-purple-600" />
                                    Manage Permissions
                                </CardTitle>
                                <CardDescription>
                                    Update which permissions this role should
                                    have
                                </CardDescription>
                            </div>
                            <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-700"
                            >
                                {selectedCount} selected
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Object.keys(permissions).length > 0 ? (
                            Object.entries(permissions).map(
                                ([group, groupPermissions]) => (
                                    <div
                                        key={group}
                                        className="animate-fade-in space-y-3 rounded-lg border p-4"
                                    >
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h3 className="font-semibold capitalize text-gray-900">
                                                {group.replace(/-/g, ' ')}
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleSelectAllInGroup(
                                                        groupPermissions,
                                                    )
                                                }
                                            >
                                                {isGroupFullySelected(
                                                    groupPermissions,
                                                )
                                                    ? 'Deselect All'
                                                    : 'Select All'}
                                            </Button>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {groupPermissions.map(
                                                (permission) => (
                                                    <div
                                                        key={permission.id}
                                                        className="flex items-start space-x-3 rounded-md border p-3 hover:bg-gray-50"
                                                    >
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={data.permissions.includes(
                                                                permission.id,
                                                            )}
                                                            onCheckedChange={() =>
                                                                handlePermissionToggle(
                                                                    permission.id,
                                                                )
                                                            }
                                                        />
                                                        <div className="flex-1">
                                                            <Label
                                                                htmlFor={`permission-${permission.id}`}
                                                                className="cursor-pointer font-medium"
                                                            >
                                                                {
                                                                    permission.name
                                                                }
                                                            </Label>
                                                            {permission.description && (
                                                                <p className="text-sm text-gray-500">
                                                                    {
                                                                        permission.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ),
                            )
                        ) : (
                            <Alert className="border-yellow-200 bg-yellow-50">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-800">
                                    No permissions available. Please ensure
                                    permissions are seeded in the database.
                                </AlertDescription>
                            </Alert>
                        )}

                        {errors.permissions && (
                            <Alert className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    {errors.permissions}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Review & Submit Card */}
                <Card className="animate-fade-in animation-delay-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-purple-600" />
                            Review & Update
                        </CardTitle>
                        <CardDescription>
                            Review the changes before updating
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-gray-50 p-4">
                            <dl className="space-y-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Role Name
                                    </dt>
                                    <dd className="text-base font-semibold text-gray-900">
                                        {data.name || '(Not set)'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Slug
                                    </dt>
                                    <dd className="font-mono text-base text-gray-900">
                                        {data.slug || '(Not set)'}
                                    </dd>
                                </div>
                                {data.description && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Description
                                        </dt>
                                        <dd className="text-sm text-gray-700">
                                            {data.description}
                                        </dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Permissions
                                    </dt>
                                    <dd>
                                        <Badge
                                            variant="secondary"
                                            className="bg-purple-100 text-purple-700"
                                        >
                                            {selectedCount} permission
                                            {selectedCount !== 1
                                                ? 's'
                                                : ''}{' '}
                                            selected
                                        </Badge>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                disabled={processing}
                            >
                                <Link href={route('roles.index')}>Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Update Role
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </AuthenticatedLayout>
    );
}
