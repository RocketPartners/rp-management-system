/**
 * Onboarding status constants and configurations
 * Centralizes all status-related values, colors, and icons
 */

import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    ClipboardIcon,
    Edit3,
    Upload,
} from 'lucide-react';

/**
 * Submission status definitions
 * Used in Admin/Submissions/Index.jsx and Review.jsx
 */
export const SUBMISSION_STATUSES = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    REVISION_REQUESTED: 'revision_requested',
    APPROVED: 'approved',
};

/**
 * Document status definitions
 * Used in Guest/Onboarding/Form.jsx and Admin/Submissions/Review.jsx
 */
export const DOCUMENT_STATUSES = {
    UPLOADED: 'uploaded',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};

/**
 * Submission status badge configurations
 * Maps status to colors, icons, and labels
 */
export const SUBMISSION_STATUS_CONFIG = {
    [SUBMISSION_STATUSES.DRAFT]: {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: FileText,
        label: 'Draft',
        description: 'In progress',
    },
    [SUBMISSION_STATUSES.SUBMITTED]: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Clock,
        label: 'Submitted',
        description: 'Needs review',
    },
    [SUBMISSION_STATUSES.UNDER_REVIEW]: {
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: ClipboardIcon,
        label: 'Under Review',
        description: 'In progress',
    },
    [SUBMISSION_STATUSES.REVISION_REQUESTED]: {
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: Edit3,
        label: 'Revision Requested',
        description: 'Needs fixes',
    },
    [SUBMISSION_STATUSES.APPROVED]: {
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle2,
        label: 'Approved',
        description: 'Complete',
    },
};

/**
 * Document status badge configurations
 * Maps status to colors, icons, and labels
 */
export const DOCUMENT_STATUS_CONFIG = {
    [DOCUMENT_STATUSES.UPLOADED]: {
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        iconBgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
        icon: Upload,
        label: 'Uploaded',
    },
    [DOCUMENT_STATUSES.PENDING]: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        iconBgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        icon: Clock,
        label: 'Pending Review',
    },
    [DOCUMENT_STATUSES.APPROVED]: {
        color: 'bg-green-100 text-green-700 border-green-200',
        badgeColor: 'bg-green-100 text-green-700 border-green-200',
        iconBgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        icon: CheckCircle2,
        label: 'Approved',
    },
    [DOCUMENT_STATUSES.REJECTED]: {
        color: 'bg-red-100 text-red-700 border-red-200',
        badgeColor: 'bg-red-100 text-red-700 border-red-200',
        iconBgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        icon: XCircle,
        label: 'Rejected',
    },
};

/**
 * Get submission status configuration
 * @param {string} status - Status value
 * @returns {Object} Status configuration object
 */
export const getSubmissionStatusConfig = (status) => {
    return SUBMISSION_STATUS_CONFIG[status] || SUBMISSION_STATUS_CONFIG[SUBMISSION_STATUSES.DRAFT];
};

/**
 * Get document status configuration
 * @param {string} status - Status value
 * @returns {Object} Status configuration object
 */
export const getDocumentStatusConfig = (status) => {
    return DOCUMENT_STATUS_CONFIG[status] || DOCUMENT_STATUS_CONFIG[DOCUMENT_STATUSES.UPLOADED];
};
