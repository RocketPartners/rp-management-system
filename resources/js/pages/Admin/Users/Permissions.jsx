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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    RefreshCcw,
    Shield,
    ShieldCheck,
    ShieldX,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UserPermissions({ user, permissionMatrix }) {
    const { flash } = usePage().props;
    const [grants, setGrants] = useState([]);
    const [revokes, setRevokes] = useState([]);
    const [saving, setSaving] = useState(false);

    // Initialize state from existing overrides
    useEffect(() => {
        const initialGrants = [];
        const initialRevokes = [];

        Object.values(permissionMatrix).forEach((permissions) => {
            permissions.forEach((perm) => {
                if (perm.override === 'grant') {
                    initialGrants.push(perm.id);
                } else if (perm.override === 'revoke') {
                    initialRevokes.push(perm.id);
                }
            });
        });

        setGrants(initialGrants);
        setRevokes(initialRevokes);
    }, [permissionMatrix]);

    const handleCheckboxChange = (permissionId, fromRole, currentOverride) => {
        if (grants.includes(permissionId)) {
            setGrants(grants.filter((id) => id !== permissionId));
        } else if (revokes.includes(permissionId)) {
            setRevokes(revokes.filter((id) => id !== permissionId));
        } else if (fromRole) {
            setRevokes([...revokes, permissionId]);
        } else {
            setGrants([...grants, permissionId]);
        }
    };

    const isChecked = (permissionId, fromRole) => {
        if (grants.includes(permissionId)) return true;
        if (revokes.includes(permissionId)) return false;
        return fromRole;
    };

    const getPermissionIcon = (permissionId, fromRole) => {
        if (grants.includes(permissionId)) {
            return <ShieldCheck className="h-4 w-4 text-green-600" />;
        }
        if (revokes.includes(permissionId)) {
            return <ShieldX className="h-4 w-4 text-red-600" />;
        }
        if (fromRole) {
            return <Shield className="h-4 w-4 text-blue-600" />;
        }
        return null;
    };

    const handleSave = () => {
        console.log('Saving permissions:', { grants, revokes });
        setSaving(true);
        router.put(
            route('users.permissions.update', user.id),
            { grants, revokes },
            {
                onFinish: () => setSaving(false),
                onSuccess: () => console.log('Permissions saved successfully'),
                onError: (errors) =>
                    console.error('Error saving permissions:', errors),
            },
        );
    };

    const handleReset = () => {
        if (confirm('Reset all permission overrides to role defaults?')) {
            router.post(route('users.permissions.reset', user.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Manage Permissions - ${user.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            User Permissions
                        </h1>
                        <p className="text-muted-foreground">
                            Manage permission overrides for {user.name}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleReset}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reset to Role Defaults
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="font-medium text-green-800">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="font-medium text-red-800">
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* User Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                </Card>

                {/* Legend */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <div className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                                <Shield className="h-4 w-4 text-blue-600" />{' '}
                                From Role
                            </span>
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="h-4 w-4 text-green-600" />{' '}
                                Granted
                            </span>
                            <span className="flex items-center gap-1">
                                <ShieldX className="h-4 w-4 text-red-600" />{' '}
                                Revoked
                            </span>
                        </div>
                    </AlertDescription>
                </Alert>

                {/* Permission Groups */}
                <div className="space-y-4">
                    {Object.entries(permissionMatrix).map(
                        ([group, permissions]) => (
                            <Card key={group}>
                                <CardHeader>
                                    <CardTitle className="capitalize">
                                        {group}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {permissions.map((permission) => (
                                        <div
                                            key={permission.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`permission-${permission.id}`}
                                                    checked={isChecked(
                                                        permission.id,
                                                        permission.from_role,
                                                    )}
                                                    onCheckedChange={() =>
                                                        handleCheckboxChange(
                                                            permission.id,
                                                            permission.from_role,
                                                            permission.override,
                                                        )
                                                    }
                                                />
                                                {getPermissionIcon(
                                                    permission.id,
                                                    permission.from_role,
                                                )}
                                                <label
                                                    htmlFor={`permission-${permission.id}`}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <div className="font-medium">
                                                        {permission.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {permission.description}
                                                    </div>
                                                </label>
                                            </div>
                                            {permission.effective ? (
                                                <Badge variant="default">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ),
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
