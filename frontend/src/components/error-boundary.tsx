import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

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
                <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
                    <p className="text-gray-600">An unexpected error occurred. Please try refreshing the page.</p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false });
                            window.location.reload();
                        }}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export function RouteErrorPage() {
    const error = useRouteError();

    if (isRouteErrorResponse(error) && error.status === 404) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-6xl font-bold text-gray-300">404</h1>
                <h2 className="text-xl font-semibold text-gray-900">Page Not Found</h2>
                <p className="text-gray-600">The page you're looking for doesn't exist or has been moved.</p>
                <Link
                    to="/dashboard"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-gray-600">An unexpected error occurred.</p>
            <Link
                to="/dashboard"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
                Back to Dashboard
            </Link>
        </div>
    );
}
