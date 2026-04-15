import { RefreshCw } from 'lucide-react';
import { useSwUpdate } from '@/hooks/use-sw-update';

export function SwUpdateBanner() {
    const { updateAvailable, applyUpdate } = useSwUpdate();

    if (!updateAvailable) return null;

    return (
        <div className="fixed left-4 right-4 top-4 z-[100] mx-auto max-w-md animate-fade-in-down sm:left-auto sm:right-4">
            <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-lg">
                <RefreshCw className="h-5 w-5 shrink-0 text-blue-600" />
                <p className="flex-1 text-sm font-medium text-blue-900">
                    A new version is available.
                </p>
                <button
                    onClick={applyUpdate}
                    className="shrink-0 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    Update
                </button>
            </div>
        </div>
    );
}
