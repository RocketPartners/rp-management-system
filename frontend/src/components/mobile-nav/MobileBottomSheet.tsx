import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const DISMISS_THRESHOLD = 150;

interface MobileBottomSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
    /** Content rendered in the fixed header zone (always swipeable) */
    header?: ReactNode;
    className?: string;
}

/**
 * Custom mobile bottom sheet with:
 * - Slide-up animation with spring easing
 * - Light scrim overlay
 * - Body scroll lock
 * - Swipe-to-dismiss on header (always) and content (when at scroll top)
 * - 150px threshold to prevent accidental dismisses
 */
export function MobileBottomSheet({ open, onOpenChange, children, header, className }: MobileBottomSheetProps) {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const [dragY, setDragY] = useState(0);
    const dragStartY = useRef(0);
    const isDragging = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            setMounted(true);
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setVisible(true));
            });
        } else {
            setVisible(false);
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [open]);

    const handleClose = useCallback(() => {
        setDragY(0);
        setVisible(false);
        setTimeout(() => {
            setMounted(false);
            onOpenChange(false);
        }, 350);
    }, [onOpenChange]);

    // Header zone drag — always initiates
    const onHeaderTouchStart = useCallback((e: React.TouchEvent) => {
        dragStartY.current = e.touches[0].clientY;
        isDragging.current = true;
    }, []);

    const onHeaderTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging.current) return;
        const dy = e.touches[0].clientY - dragStartY.current;
        setDragY(Math.max(0, dy));
    }, []);

    const onHeaderTouchEnd = useCallback(() => {
        isDragging.current = false;
        if (dragY > DISMISS_THRESHOLD) {
            handleClose();
        } else {
            setDragY(0);
        }
    }, [dragY, handleClose]);

    // Scroll area drag — only when at scroll top
    const onScrollTouchStart = useCallback((e: React.TouchEvent) => {
        const scrollEl = scrollRef.current;
        if (scrollEl && scrollEl.scrollTop <= 0) {
            dragStartY.current = e.touches[0].clientY;
            isDragging.current = true;
        }
    }, []);

    const onScrollTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging.current) return;
        const dy = e.touches[0].clientY - dragStartY.current;
        if (dy > 0) {
            e.preventDefault();
            setDragY(dy);
        } else {
            isDragging.current = false;
            setDragY(0);
        }
    }, []);

    const onScrollTouchEnd = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;
        if (dragY > DISMISS_THRESHOLD) {
            handleClose();
        } else {
            setDragY(0);
        }
    }, [dragY, handleClose]);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Scrim */}
            <div
                className={cn(
                    'absolute inset-0 bg-black/20 transition-opacity duration-300 touch-none',
                    visible ? 'opacity-100' : 'opacity-0',
                )}
                onClick={handleClose}
            />

            {/* Sheet panel */}
            <div
                className={cn(
                    'absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col',
                    'rounded-t-3xl border-t border-white/70',
                    'bg-white/80 backdrop-blur-[50px] backdrop-saturate-[1.8]',
                    'shadow-[0_-16px_48px_rgba(0,0,0,0.1)]',
                    !isDragging.current && 'transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]',
                    className,
                )}
                style={{
                    transform: visible
                        ? `translateY(${dragY}px)`
                        : 'translateY(100%)',
                }}
            >
                {/* Header zone — always swipeable */}
                <div
                    onTouchStart={onHeaderTouchStart}
                    onTouchMove={onHeaderTouchMove}
                    onTouchEnd={onHeaderTouchEnd}
                >
                    {/* Drag handle */}
                    <div
                        className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
                        onClick={handleClose}
                    >
                        <div className="h-1.5 w-10 rounded-full bg-black/20" />
                    </div>

                    {header}
                </div>

                {/* Scrollable content — always scrollable with rubber band bounce */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-scroll overscroll-contain"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                    onTouchStart={onScrollTouchStart}
                    onTouchMove={onScrollTouchMove}
                    onTouchEnd={onScrollTouchEnd}
                >
                    {children}
                    {/* Bottom safe area spacer */}
                    <div style={{ height: 'env(safe-area-inset-bottom, 16px)', minHeight: '16px' }} />
                </div>
            </div>
        </div>
    );
}
