import { GlassPill } from './GlassPill';
import { MoreSheet } from './MoreSheet';
import { QuickActionFab } from './QuickActionFab';

export function BottomNav() {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-30 px-3 lg:hidden"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 14px) + 8px)' }}
        >
            <div className="mb-3 flex justify-end pr-1">
                <QuickActionFab />
            </div>
            <div className="flex items-center gap-2.5">
                <GlassPill />
                <MoreSheet />
            </div>
        </div>
    );
}
