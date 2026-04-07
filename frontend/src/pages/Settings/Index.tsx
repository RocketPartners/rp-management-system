import { useNavOffset } from '@/hooks/use-nav-offset';
import { useIsBottomNav } from '@/hooks/use-bottom-nav';
import { Settings, Minus, Plus, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
    const { offset, setOffset, DEFAULT_OFFSET } = useNavOffset();
    const isMobile = useIsBottomNav();

    return (
        <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="mb-6 flex items-center gap-3">
                <Settings className="h-6 w-6 text-gray-400" />
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>

            {isMobile && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h2 className="text-sm font-semibold text-gray-900">Navigation Bar Position</h2>
                    <p className="mt-1 text-xs text-gray-500">
                        Adjust how high the bottom navigation bar sits. Increase if it overlaps your device's home indicator.
                    </p>

                    <div className="mt-4 flex items-center gap-4">
                        <button
                            onClick={() => setOffset(offset - 2)}
                            disabled={offset <= 0}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
                        >
                            <Minus className="h-4 w-4" />
                        </button>

                        <div className="flex-1">
                            <input
                                type="range"
                                min={0}
                                max={60}
                                step={2}
                                value={offset}
                                onChange={(e) => setOffset(Number(e.target.value))}
                                className="w-full accent-blue-600"
                            />
                            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                                <span>Lower</span>
                                <span>{offset}px</span>
                                <span>Higher</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setOffset(offset + 2)}
                            disabled={offset >= 60}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-30"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    {offset !== DEFAULT_OFFSET && (
                        <button
                            onClick={() => setOffset(DEFAULT_OFFSET)}
                            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset to default ({DEFAULT_OFFSET}px)
                        </button>
                    )}
                </div>
            )}

            {!isMobile && (
                <p className="text-sm text-gray-500">
                    Navigation bar settings are only available on mobile devices.
                </p>
            )}
        </div>
    );
}
