import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Home, HelpCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glassClasses, scrimClass } from './glass-styles';

const actions = [
    { name: 'Apply Leave', href: '/my-leaves/apply', icon: ClipboardList },
    { name: 'Request WFH', href: '/my-wfh', icon: Home },
    { name: 'Submit Ticket', href: '/support', icon: HelpCircle },
] as const;

export function QuickActionFab() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    function handleAction(href: string) {
        setOpen(false);
        navigate(href);
    }

    return (
        <>
            {open && (
                <div
                    className={cn('fixed inset-0 z-40 transition-opacity', scrimClass)}
                    onClick={() => setOpen(false)}
                />
            )}
            <div className="relative z-50">
                <div
                    className={cn(
                        'absolute bottom-[60px] right-0 flex flex-col gap-2 transition-all duration-200',
                        open
                            ? 'translate-y-0 scale-100 opacity-100'
                            : 'pointer-events-none translate-y-2 scale-95 opacity-0',
                    )}
                >
                    {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={action.name}
                                onClick={() => handleAction(action.href)}
                                className={cn(
                                    'flex items-center gap-2.5 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-medium',
                                    'text-black/70',
                                    'transition-transform hover:-translate-x-1',
                                    glassClasses,
                                )}
                            >
                                <Icon className="h-[18px] w-[18px] text-black/50" />
                                {action.name}
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={() => setOpen(!open)}
                    className={cn(
                        'flex h-[50px] w-[50px] items-center justify-center rounded-full transition-transform duration-300',
                        glassClasses,
                        open && 'scale-105',
                    )}
                    aria-label={open ? 'Close quick actions' : 'Open quick actions'}
                >
                    <Plus
                        className={cn(
                            'h-6 w-6 text-black/50 transition-transform duration-300',
                            open && 'rotate-45',
                        )}
                        strokeWidth={2.2}
                    />
                </button>
            </div>
        </>
    );
}
