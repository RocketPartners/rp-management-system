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
            'border border-yellow-200 bg-yellow-100 text-yellow-700',
    },
    ACTIVE: {
        icon: CheckCircle2,
        className:
            'border border-green-200 bg-green-100 text-green-700',
    },
    REJECTED: {
        icon: XCircle,
        className:
            'border border-red-200 bg-red-100 text-red-700',
    },
    SUSPENDED: {
        icon: AlertCircle,
        className:
            'border border-orange-200 bg-orange-100 text-orange-700',
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
        <Badge variant="outline" className={cn('gap-1.5', config.className, className)}>
            <Icon className="h-3.5 w-3.5" />
            {formatStatus(status)}
        </Badge>
    );
}
