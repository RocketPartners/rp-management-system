import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

/**
 * Hook for checking user permissions in React components
 *
 * Usage:
 * ```tsx
 * const { can, canAll } = usePermission();
 *
 * if (can('users.edit')) {
 *   // Show edit button
 * }
 *
 * if (canAll(['users.edit', 'users.delete'])) {
 *   // Show advanced admin controls
 * }
 * ```
 */
export function usePermission() {
    const { auth } = usePage<SharedData>().props;

    /**
     * Check if user has at least one of the given permissions
     * @param permission Single permission slug or array of permission slugs
     */
    const can = (permission: string | string[]): boolean => {
        if (!auth.user || !auth.user.permissions) {
            return false;
        }

        const perms = Array.isArray(permission) ? permission : [permission];
        return perms.some((p) => auth.user.permissions?.includes(p));
    };

    /**
     * Check if user has all of the given permissions
     * @param permissions Array of permission slugs
     */
    const canAll = (permissions: string[]): boolean => {
        if (!auth.user || !auth.user.permissions) {
            return false;
        }

        return permissions.every((p) => auth.user.permissions?.includes(p));
    };

    /**
     * Check if user has none of the given permissions
     * @param permissions Array of permission slugs
     */
    const cannot = (permissions: string | string[]): boolean => {
        return !can(permissions);
    };

    return { can, canAll, cannot };
}
