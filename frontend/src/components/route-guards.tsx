import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { usePermission } from '@/hooks/usePermission';
import { ForbiddenPage } from '@/components/error-boundary';
import { FullPageSpinner } from '@/components/full-page-spinner';

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <FullPageSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export function GuestRoute() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <FullPageSpinner />;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

/**
 * Route guard that checks permissions before rendering child routes.
 * Accepts a single permission string or an array (OR logic — any match grants access).
 * Includes its own loading guard as a safety net: if this component is ever used
 * outside of ProtectedRoute (which already waits for auth), this prevents false 403s
 * during auth initialization when user.permissions is still null.
 */
export function PermissionRoute({ permission }: { permission: string | string[] }) {
    const { isLoading } = useAuth();
    const { can } = usePermission();

    if (isLoading) {
        return <FullPageSpinner />;
    }

    if (!can(permission)) {
        return <ForbiddenPage />;
    }

    return <Outlet />;
}
