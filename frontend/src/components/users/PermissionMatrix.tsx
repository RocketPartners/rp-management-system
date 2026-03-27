import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiPost, apiDelete } from '@/lib/spring-boot-api';
import type { PermissionMatrixEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CheckCircle2, XCircle, Shield, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface PermissionMatrixProps {
    userId: number;
    permissions: PermissionMatrixEntry[];
    onRefresh: () => void;
}

interface ConfirmAction {
    type: 'grant' | 'revoke' | 'remove' | 'reset';
    permissionId?: number;
    permissionName?: string;
}

export function PermissionMatrix({
    userId,
    permissions,
    onRefresh,
}: PermissionMatrixProps) {
    const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

    const grantMutation = useMutation({
        mutationFn: (permissionId: number) =>
            apiPost(`/users/${userId}/permissions/${permissionId}/grant`),
        onSuccess: () => {
            toast.success('Permission granted');
            onRefresh();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const revokeMutation = useMutation({
        mutationFn: (permissionId: number) =>
            apiPost(`/users/${userId}/permissions/${permissionId}/revoke`),
        onSuccess: () => {
            toast.success('Permission revoked');
            onRefresh();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const removeMutation = useMutation({
        mutationFn: (permissionId: number) =>
            apiDelete(`/users/${userId}/permissions/${permissionId}`),
        onSuccess: () => {
            toast.success('Override removed');
            onRefresh();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const resetMutation = useMutation({
        mutationFn: () => apiPost(`/users/${userId}/permissions/reset`),
        onSuccess: () => {
            toast.success('All overrides reset');
            onRefresh();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    function executeAction() {
        if (!confirm) return;
        switch (confirm.type) {
            case 'grant':
                if (confirm.permissionId)
                    grantMutation.mutate(confirm.permissionId);
                break;
            case 'revoke':
                if (confirm.permissionId)
                    revokeMutation.mutate(confirm.permissionId);
                break;
            case 'remove':
                if (confirm.permissionId)
                    removeMutation.mutate(confirm.permissionId);
                break;
            case 'reset':
                resetMutation.mutate();
                break;
        }
        setConfirm(null);
    }

    const grouped = permissions.reduce<
        Record<string, PermissionMatrixEntry[]>
    >((acc, p) => {
        (acc[p.group] ??= []).push(p);
        return acc;
    }, {});

    if (permissions.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    <Shield className="mx-auto mb-2 h-8 w-8" />
                    <p>No permissions found.</p>
                </CardContent>
            </Card>
        );
    }

    const hasOverrides = permissions.some((p) => p.overrideType !== null);

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Permissions</h3>
                    {hasOverrides && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirm({ type: 'reset' })}
                        >
                            <RotateCcw className="mr-1 h-4 w-4" />
                            Reset All Overrides
                        </Button>
                    )}
                </div>

                {Object.entries(grouped).map(([group, perms]) => (
                    <Card key={group}>
                        <CardContent className="p-0">
                            <div className="border-b bg-muted/50 px-4 py-3">
                                <h4 className="font-medium capitalize">
                                    {group}
                                </h4>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Permission</TableHead>
                                        <TableHead className="w-24 text-center">
                                            From Role
                                        </TableHead>
                                        <TableHead className="w-24 text-center">
                                            Override
                                        </TableHead>
                                        <TableHead className="w-24 text-center">
                                            Effective
                                        </TableHead>
                                        <TableHead className="w-48 text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {perms.map((p) => (
                                        <TableRow key={p.permissionId}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">
                                                        {p.permissionName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {p.permissionSlug}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {p.fromRole ? (
                                                    <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="mx-auto h-4 w-4 text-muted-foreground/40" />
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {p.overrideType === 'GRANT' && (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                        Grant
                                                    </Badge>
                                                )}
                                                {p.overrideType ===
                                                    'REVOKE' && (
                                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                                        Revoke
                                                    </Badge>
                                                )}
                                                {p.overrideType === null && (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {p.effective ? (
                                                    <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="mx-auto h-4 w-4 text-red-500" />
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {p.overrideType ===
                                                    null ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-green-600 hover:text-green-700"
                                                                onClick={() =>
                                                                    setConfirm({
                                                                        type: 'grant',
                                                                        permissionId:
                                                                            p.permissionId,
                                                                        permissionName:
                                                                            p.permissionName,
                                                                    })
                                                                }
                                                            >
                                                                Grant
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-red-600 hover:text-red-700"
                                                                onClick={() =>
                                                                    setConfirm({
                                                                        type: 'revoke',
                                                                        permissionId:
                                                                            p.permissionId,
                                                                        permissionName:
                                                                            p.permissionName,
                                                                    })
                                                                }
                                                            >
                                                                Revoke
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7"
                                                            onClick={() =>
                                                                setConfirm({
                                                                    type: 'remove',
                                                                    permissionId:
                                                                        p.permissionId,
                                                                    permissionName:
                                                                        p.permissionName,
                                                                })
                                                            }
                                                        >
                                                            Remove Override
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AlertDialog
                open={!!confirm}
                onOpenChange={(open) => !open && setConfirm(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirm?.type === 'reset'
                                ? 'This will remove all permission overrides for this user. They will revert to role-based permissions only.'
                                : `Are you sure you want to ${confirm?.type} "${confirm?.permissionName}"?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={executeAction}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
