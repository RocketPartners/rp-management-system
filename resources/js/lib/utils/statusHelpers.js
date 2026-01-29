/**
 * Status helper utilities
 * Provides utility functions for working with submission and document statuses
 */

import {
    getSubmissionStatusConfig,
    getDocumentStatusConfig,
    SUBMISSION_STATUSES,
    DOCUMENT_STATUSES,
} from '@/lib/constants/onboarding/statuses';

/**
 * Get formatted status badge data for submission
 * @param {string} status - Submission status value
 * @returns {Object} Badge configuration with color, icon, and label
 */
export const getSubmissionBadgeData = (status) => {
    return getSubmissionStatusConfig(status);
};

/**
 * Get formatted status badge data for document
 * @param {string} status - Document status value
 * @returns {Object} Badge configuration with color, icon, and label
 */
export const getDocumentBadgeData = (status) => {
    return getDocumentStatusConfig(status);
};

/**
 * Check if submission can be edited by candidate
 * @param {string} status - Submission status
 * @returns {boolean}
 */
export const canSubmissionBeEdited = (status) => {
    return [
        SUBMISSION_STATUSES.DRAFT,
        SUBMISSION_STATUSES.REVISION_REQUESTED,
    ].includes(status);
};

/**
 * Check if submission can be approved by admin
 * @param {string} status - Submission status
 * @returns {boolean}
 */
export const canSubmissionBeApproved = (status) => {
    return status === SUBMISSION_STATUSES.SUBMITTED;
};

/**
 * Check if submission has been approved
 * @param {string} status - Submission status
 * @returns {boolean}
 */
export const isSubmissionApproved = (status) => {
    return status === SUBMISSION_STATUSES.APPROVED;
};

/**
 * Check if document can be approved/rejected
 * @param {string} status - Document status
 * @returns {boolean}
 */
export const canDocumentBeReviewed = (status) => {
    return [
        DOCUMENT_STATUSES.PENDING,
        DOCUMENT_STATUSES.UPLOADED,
    ].includes(status);
};

/**
 * Check if document has been approved
 * @param {string} status - Document status
 * @returns {boolean}
 */
export const isDocumentApproved = (status) => {
    return status === DOCUMENT_STATUSES.APPROVED;
};

/**
 * Check if document has been rejected
 * @param {string} status - Document status
 * @returns {boolean}
 */
export const isDocumentRejected = (status) => {
    return status === DOCUMENT_STATUSES.REJECTED;
};

/**
 * Get human-readable status label
 * @param {string} status - Status value
 * @param {'submission'|'document'} type - Type of status
 * @returns {string} Human-readable label
 */
export const getStatusLabel = (status, type = 'submission') => {
    if (type === 'document') {
        return getDocumentStatusConfig(status).label;
    }
    return getSubmissionStatusConfig(status).label;
};

/**
 * Get status description
 * @param {string} status - Status value
 * @param {'submission'|'document'} type - Type of status
 * @returns {string} Status description
 */
export const getStatusDescription = (status, type = 'submission') => {
    if (type === 'document') {
        return getDocumentStatusConfig(status).label;
    }
    return getSubmissionStatusConfig(status).description || '';
};
