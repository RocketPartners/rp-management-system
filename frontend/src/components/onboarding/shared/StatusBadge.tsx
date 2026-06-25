/**
 * Unified StatusBadge component
 * Displays status badges for both submissions and documents
 * Eliminates duplicate badge logic across Form.jsx, Index.jsx, and Review.jsx
 */

import { Badge } from '@/components/ui/badge';
import {
    getDocumentStatusConfig,
    getSubmissionStatusConfig,
} from '@/lib/constants/onboarding/statuses';
import React from 'react';

interface StatusBadgeProps {
    /** Status value (e.g. 'approved', 'pending', 'draft'). */
    status: string;
    /** Badge variant (default: 'submission'). */
    variant?: 'submission' | 'document';
    /** Additional CSS classes. */
    className?: string;
}

/** Unified status badge component for submissions and documents. */
export const StatusBadge = React.memo(
    ({ status, variant = 'submission', className = '' }: StatusBadgeProps) => {
        // Get configuration based on variant
        const config =
            variant === 'document'
                ? getDocumentStatusConfig(status)
                : getSubmissionStatusConfig(status);

        const Icon = config.icon;

        return (
            <Badge className={`${config.color} border ${className}`}>
                <Icon className="mr-1 h-3 w-3" />
                {config.label}
            </Badge>
        );
    },
);

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
