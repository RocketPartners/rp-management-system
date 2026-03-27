import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AccountStatus } from '@/types';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';

const statusConfig: Record<
    AccountStatus,
    { icon: React.ElementType; className: string }
> = {
    PENDING: {
        icon: Clock,
        className:
            'border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    },
    ACTIVE: {
        icon: CheckCircle2,
        className:
            'border-green-300 bg-green-100 text-green-800 dark:border-green-700 dark:bg-green-900/50 dark:text-green-300',
    },
    REJECTED: {
        icon: XCircle,
        className:
            'border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/50 dark:text-red-300',
    },
    SUSPENDED: {
        icon: AlertCircle,
        className:
            'border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    },
};

function formatStatus(status: AccountStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

export function UserStatusBadge({
    status,
    className,
}: {
    status: AccountStatus;
    className?: string;
}) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge className={cn(config.className, className)}>
            <Icon className="size-3" />
            {formatStatus(status)}
        </Badge>
    );
}
