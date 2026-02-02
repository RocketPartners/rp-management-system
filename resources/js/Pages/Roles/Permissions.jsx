import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { useState, useEffect } from 'react';
import { AlertCircle, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';

export default function RolePermissions({ role, permissionMatrix }) {
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [saving, setSaving] = useState(false);

    // Initialize from existing role permissions
    useEffect(() => {
        const initial = [];
        Object.values(permissionMatrix).forEach((permissions) => {
            permissions.forEach((perm) => {
                if (perm.assigned) {
                    initial.push(perm.id);
                }
            });
        });
        setSelectedPermissions(initial);
    }, [permissionMatrix]);

    const handleCheckboxChange = (permissionId) => {
        if (selectedPermissions.includes(permissionId)) {
            setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId));
        } else {
            setSelectedPermissions([...selectedPermissions, permissionId]);
        }
    };

    const handleSave = () => {
        setSaving(true);
        router.put(
            route('roles.permissions.update', role.id),
            { permissions: selectedPermissions },
            {
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Manage Permissions - ${role.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Role Permissions</h1>
                        <p className="text-muted-foreground">
                            Manage built-in permissions for {role.name}
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                {/* Role Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{role.name}</CardTitle>
                        <CardDescription>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {role.users_count} {role.users_count === 1 ? 'user' : 'users'} have this
                                role
                            </div>
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Warning */}
                {role.users_count > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Impact Warning</AlertTitle>
                        <AlertDescription>
                            Changes to role permissions will affect all {role.users_count}{' '}
                            {role.users_count === 1 ? 'user' : 'users'} with this role. Users with
                            individual permission overrides may not be affected by all changes.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Permission Groups */}
                <div className="space-y-4">
                    {Object.entries(permissionMatrix).map(([group, permissions]) => (
                        <Card key={group}>
                            <CardHeader>
                                <CardTitle className="capitalize">{group}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {permissions.map((permission) => (
                                    <div key={permission.id} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`permission-${permission.id}`}
                                            checked={selectedPermissions.includes(permission.id)}
                                            onCheckedChange={() => handleCheckboxChange(permission.id)}
                                        />
                                        <label
                                            htmlFor={`permission-${permission.id}`}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <div className="font-medium">{permission.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {permission.description}
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
