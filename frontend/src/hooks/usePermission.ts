import { useAuth } from '@/contexts/auth-context';

export function usePermission() {
    const { user } = useAuth();

    const can = (permission: string | string[]): boolean => {
        if (!user || !user.permissions) {
            return false;
        }

        const perms = Array.isArray(permission) ? permission : [permission];
        return perms.some((p) => user.permissions?.includes(p));
    };

    const canAll = (permissions: string[]): boolean => {
        if (!user || !user.permissions) {
            return false;
        }

        return permissions.every((p) => user.permissions?.includes(p));
    };

    const cannot = (permissions: string | string[]): boolean => {
        return !can(permissions);
    };

    return { can, canAll, cannot };
}
