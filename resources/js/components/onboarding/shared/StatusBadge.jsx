/**
 * Unified StatusBadge component
 * Displays status badges for both submissions and documents
 * Eliminates duplicate badge logic across Form.jsx, Index.jsx, and Review.jsx
 */

import React from 'react';
import { Badge } from '@/Components/ui/badge';
import {
    getSubmissionStatusConfig,
    getDocumentStatusConfig,
} from '@/lib/constants/onboarding/statuses';

/**
 * StatusBadge - Unified status badge component
 *
 * @param {Object} props
 * @param {string} props.status - Status value (e.g., 'approved', 'pending', 'draft')
 * @param {'submission'|'document'} props.variant - Badge variant (default: 'submission')
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export const StatusBadge = React.memo(({ status, variant = 'submission', className = '' }) => {
    // Get configuration based on variant
    const config = variant === 'document'
        ? getDocumentStatusConfig(status)
        : getSubmissionStatusConfig(status);

    const Icon = config.icon;

    return (
        <Badge className={`${config.color} border ${className}`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
        </Badge>
    );
});

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
