import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen flex-col items-center justify-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
                    <p className="text-gray-600">An unexpected error occurred. Please try refreshing the page.</p>
                    <Button onClick={() => window.location.reload()}>
                        Refresh Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export function ForbiddenPage({ homePath = '/dashboard' }: { homePath?: string }) {
    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
            <h1 className="text-6xl font-bold text-gray-300">403</h1>
            <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
            <p className="text-gray-600">
                You don&apos;t have permission to access this page. If you think
                this is a mistake, contact your administrator.
            </p>
            <Button asChild>
                <Link to={homePath}>Back to Dashboard</Link>
            </Button>
        </div>
    );
}

export function NotFoundPage({ homePath = '/' }: { homePath?: string }) {
    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
            <h1 className="text-6xl font-bold text-gray-300">404</h1>
            <h2 className="text-xl font-semibold text-gray-900">Page Not Found</h2>
            <p className="text-gray-600">The page you're looking for doesn't exist or has been moved.</p>
            <Button asChild>
                <Link to={homePath}>Go Home</Link>
            </Button>
        </div>
    );
}

export function RouteErrorPage({ homePath = '/' }: { homePath?: string }) {
    const error = useRouteError();

    if (isRouteErrorResponse(error) && error.status === 404) {
        return <NotFoundPage homePath={homePath} />;
    }

    console.error('RouteErrorPage caught:', error);

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-gray-600">An unexpected error occurred.</p>
            <Button asChild>
                <Link to={homePath}>Go Home</Link>
            </Button>
        </div>
    );
}
