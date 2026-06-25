/**
 * Status helper utilities
 * Provides utility functions for working with submission and document statuses
 */

import {
    DOCUMENT_STATUSES,
    getDocumentStatusConfig,
    getSubmissionStatusConfig,
    SUBMISSION_STATUSES,
} from '@/lib/constants/onboarding/statuses';

/** Get formatted status badge data for a submission. */
export const getSubmissionBadgeData = (status: string) => {
    return getSubmissionStatusConfig(status);
};

/** Get formatted status badge data for a document. */
export const getDocumentBadgeData = (status: string) => {
    return getDocumentStatusConfig(status);
};

/** Check if a submission can be edited by the candidate. */
export const canSubmissionBeEdited = (status: string): boolean => {
    return [
        SUBMISSION_STATUSES.DRAFT,
        SUBMISSION_STATUSES.REVISION_REQUESTED,
    ].includes(status);
};

/** Check if a submission can be approved by an admin. */
export const canSubmissionBeApproved = (status: string): boolean => {
    return status === SUBMISSION_STATUSES.SUBMITTED;
};

/** Check if a submission has been approved. */
export const isSubmissionApproved = (status: string): boolean => {
    return status === SUBMISSION_STATUSES.APPROVED;
};

/** Check if a document can be approved/rejected. */
export const canDocumentBeReviewed = (status: string): boolean => {
    return [DOCUMENT_STATUSES.PENDING, DOCUMENT_STATUSES.UPLOADED].includes(
        status,
    );
};

/** Check if a document has been approved. */
export const isDocumentApproved = (status: string): boolean => {
    return status === DOCUMENT_STATUSES.APPROVED;
};

/** Check if a document has been rejected. */
export const isDocumentRejected = (status: string): boolean => {
    return status === DOCUMENT_STATUSES.REJECTED;
};

/** Get a human-readable status label. */
export const getStatusLabel = (
    status: string,
    type: 'submission' | 'document' = 'submission',
): string => {
    if (type === 'document') {
        return getDocumentStatusConfig(status).label;
    }
    return getSubmissionStatusConfig(status).label;
};

/** Get a status description. */
export const getStatusDescription = (
    status: string,
    type: 'submission' | 'document' = 'submission',
): string => {
    if (type === 'document') {
        return getDocumentStatusConfig(status).label;
    }
    return getSubmissionStatusConfig(status).description || '';
};
