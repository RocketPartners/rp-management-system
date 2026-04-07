import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { usePermission } from '@/hooks/usePermission';
import { useHaptics } from '@/hooks/use-haptics';
import { buildNavigation, type NavSection, type NavItemConfig } from '@/lib/navigation';
import { glassClasses } from './glass-styles';
import { MobileBottomSheet } from './MobileBottomSheet';

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

export function MoreSheet() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const { can } = usePermission();
    const { pathname } = useLocation();
    const { buzz } = useHaptics();
    const navigate = useNavigate();
    const navigation = buildNavigation(can);

    const handleClose = () => setOpen(false);

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        navigate('/login');
    };

    return (
        <>
            <button
                onClick={() => { buzz(); setOpen(true); }}
                className={cn('flex h-16 w-16 items-center justify-center rounded-full', glassClasses)}
                aria-label="More navigation"
            >
                <MoreHorizontal className="h-6 w-6 text-black/30" strokeWidth={2.5} />
            </button>

            <MobileBottomSheet
                open={open}
                onOpenChange={setOpen}
                header={
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
                }
            >
                <div className="px-3 py-2">
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
                                        <NavItem key={item.name} item={item} pathname={pathname} onNavigate={handleClose} />
                                    ))}
                                </div>
                            ) : (
                                <AccordionSection section={section} pathname={pathname} onNavigate={handleClose} />
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
            </MobileBottomSheet>
        </>
    );
}
