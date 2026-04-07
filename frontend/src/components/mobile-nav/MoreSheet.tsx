import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { usePermission } from '@/hooks/usePermission';
import { buildNavigation, type NavSection, type NavItemConfig } from '@/lib/navigation';
import { glassClasses } from './glass-styles';

function isActive(href: string, pathname: string): boolean {
    const cleanHref = href.split('?')[0];
    if (pathname === cleanHref) return true;
    if (cleanHref !== '/' && pathname.startsWith(cleanHref + '/')) return true;
    return false;
}

function NavItem({ item, pathname, onNavigate }: { item: NavItemConfig; pathname: string; onNavigate: () => void }) {
    const active = isActive(item.href, pathname);
    const Icon = item.icon;
    return (
        <Link
            to={item.href}
            onClick={onNavigate}
            className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-blue-500/10 text-blue-600' : 'text-slate-700 hover:bg-black/[0.04]',
            )}
        >
            <Icon className={cn('h-5 w-5', active ? 'text-blue-600' : 'text-black/40')} />
            {item.name}
            {item.badge && (
                <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

function AccordionSection({ section, pathname, onNavigate }: {
    section: { name: string; icon: React.ComponentType<{ className?: string }>; items: NavItemConfig[] };
    pathname: string;
    onNavigate: () => void;
}) {
    const hasActive = section.items.some((i) => isActive(i.href, pathname));
    const [expanded, setExpanded] = useState(hasActive);
    const Icon = section.icon;

    return (
        <div>
            <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    hasActive ? 'text-blue-600' : 'text-slate-700 hover:bg-black/[0.04]',
                )}
            >
                <Icon className={cn('h-5 w-5', hasActive ? 'text-blue-600' : 'text-black/40')} />
                {section.name}
                <ChevronRight className={cn('ml-auto h-4 w-4 text-black/30 transition-transform', expanded && 'rotate-90')} />
            </button>
            {expanded && (
                <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-2">
                    {section.items.map((item) => (
                        <NavItem key={item.name} item={item} pathname={pathname} onNavigate={onNavigate} />
                    ))}
                </div>
            )}
        </div>
    );
}

const DISMISS_THRESHOLD = 150; // px — intentionally large to prevent accidental dismiss

export function MoreSheet() {
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false);
    const [dragY, setDragY] = useState(0);
    const dragStartY = useRef(0);
    const isDragging = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();
    const { can } = usePermission();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const navigation = buildNavigation(can);

    useEffect(() => {
        if (open) {
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
        setTimeout(() => setOpen(false), 350);
    }, []);

    // --- Drag handlers for the fixed header zone (handle + user info) ---
    // Always initiates a drag regardless of scroll position.
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

    // --- Drag handlers for the scrollable content area ---
    // Only initiates a drag when scroll is at the top (scrollTop === 0).
    // If content is scrolled down, let normal scroll happen.
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
            // Dragging down — prevent scroll, move sheet instead
            e.preventDefault();
            setDragY(dy);
        } else {
            // Dragging up — cancel drag, let scroll take over
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

    const handleNavigate = () => handleClose();

    const handleLogout = async () => {
        handleClose();
        await logout();
        navigate('/login');
    };

    return (
        <>
            {/* More blob trigger */}
            <button
                onClick={() => setOpen(true)}
                className={cn('flex h-16 w-16 items-center justify-center rounded-full', glassClasses)}
                aria-label="More navigation"
            >
                <MoreHorizontal className="h-6 w-6 text-black/30" strokeWidth={2.5} />
            </button>

            {/* Custom bottom sheet portal */}
            {open && (
                <div className="fixed inset-0 z-50">
                    {/* Scrim overlay */}
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
                        )}
                        style={{
                            transform: visible
                                ? `translateY(${dragY}px)`
                                : 'translateY(100%)',
                        }}
                    >
                        {/* ===== Fixed header zone: drag handle + user info ===== */}
                        {/* Always acts as swipe target, regardless of scroll */}
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

                            {/* User header */}
                            <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 pb-3 pt-2">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600">
                                    <span className="text-sm font-semibold text-white">
                                        {(user?.name || 'U').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-900">{user?.name}</div>
                                    <div className="truncate text-xs text-slate-500">{user?.position || user?.email}</div>
                                </div>
                            </div>
                        </div>

                        {/* ===== Scrollable content: swipe-to-dismiss when at scroll top ===== */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto overscroll-contain px-3 py-2"
                            onTouchStart={onScrollTouchStart}
                            onTouchMove={onScrollTouchMove}
                            onTouchEnd={onScrollTouchEnd}
                        >
                            {navigation.map((section: NavSection, idx: number) => (
                                <div key={idx}>
                                    {section.type === 'divider' ? (
                                        section.label ? (
                                            <div className="flex items-center gap-2 px-3 pt-4 pb-2">
                                                <div className="h-px flex-1 bg-black/[0.06]" />
                                                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                                    {section.label}
                                                </span>
                                                <div className="h-px flex-1 bg-black/[0.06]" />
                                            </div>
                                        ) : (
                                            <div className="mx-3 my-2 h-px bg-black/[0.06]" />
                                        )
                                    ) : section.type === 'items' ? (
                                        <div className="space-y-0.5">
                                            {section.items.map((item) => (
                                                <NavItem key={item.name} item={item} pathname={pathname} onNavigate={handleNavigate} />
                                            ))}
                                        </div>
                                    ) : (
                                        <AccordionSection section={section} pathname={pathname} onNavigate={handleNavigate} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer - Logout */}
                        <div className="border-t border-black/[0.06] px-3 py-3">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/[0.06]"
                            >
                                <LogOut className="h-5 w-5" />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
