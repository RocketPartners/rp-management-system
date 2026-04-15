import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePwaInstall } from '@/hooks/use-pwa-install';

const DISMISSED_KEY = 'hris-pwa-install-dismissed';

export function PwaInstallPrompt() {
    const { canInstall, promptInstall } = usePwaInstall();
    const [dismissed, setDismissed] = useState(
        () => sessionStorage.getItem(DISMISSED_KEY) === '1',
    );

    if (!canInstall || dismissed) return null;

    const handleDismiss = () => {
        sessionStorage.setItem(DISMISSED_KEY, '1');
        setDismissed(true);
    };

    return (
        <div className="fixed bottom-24 left-4 right-4 z-[100] mx-auto max-w-md animate-slide-up lg:bottom-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-lg backdrop-blur-xl">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                    <Download className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Install HRIS</p>
                    <p className="text-xs text-slate-500">Add to home screen for quick access</p>
                </div>
                <button
                    onClick={promptInstall}
                    className="shrink-0 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                >
                    Install
                </button>
                <button
                    onClick={handleDismiss}
                    className="shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-600"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
