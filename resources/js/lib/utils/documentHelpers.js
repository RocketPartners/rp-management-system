/**
 * Document helper utilities
 * Provides utility functions for working with onboarding documents
 */

import { isDocumentApproved } from './statusHelpers';

/**
 * Group documents by document type
 * Used in Admin/Submissions/Review.jsx to organize documents
 * @param {Array} documents - Array of document objects
 * @returns {Object} Documents grouped by type { [docType]: [doc1, doc2, ...] }
 */
export const groupDocumentsByType = (documents) => {
    if (!documents || !Array.isArray(documents)) {
        return {};
    }

    return documents.reduce((acc, doc) => {
        const type = doc.document_type;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(doc);
        return acc;
    }, {});
};

/**
 * Get all documents for a specific document type
 * @param {Array} documents - Array of document objects
 * @param {string} docType - Document type to filter by
 * @returns {Array} Filtered documents
 */
export const getDocumentsByType = (documents, docType) => {
    if (!documents || !Array.isArray(documents)) {
        return [];
    }
    return documents.filter(doc => doc.document_type === docType);
};

/**
 * Check if a document type has any uploads
 * @param {Array} documents - Array of document objects
 * @param {string} docType - Document type to check
 * @returns {boolean}
 */
export const hasDocumentType = (documents, docType) => {
    return getDocumentsByType(documents, docType).length > 0;
};

/**
 * Get count of documents for a specific type
 * @param {Array} documents - Array of document objects
 * @param {string} docType - Document type to count
 * @returns {number}
 */
export const getDocumentTypeCount = (documents, docType) => {
    return getDocumentsByType(documents, docType).length;
};

/**
 * Count how many required document types have been uploaded
 * @param {Object} requiredDocuments - Required documents configuration { [docType]: { label, required } }
 * @param {Array} uploadedDocuments - Array of uploaded document objects
 * @returns {number} Count of uploaded required document types
 */
export const countUploadedRequiredTypes = (requiredDocuments, uploadedDocuments) => {
    if (!requiredDocuments) return 0;

    return Object.keys(requiredDocuments)
        .filter(key =>
            requiredDocuments[key].required &&
            hasDocumentType(uploadedDocuments, key)
        )
        .length;
};

/**
 * Count total number of required document types
 * @param {Object} requiredDocuments - Required documents configuration
 * @returns {number} Total required document types
 */
export const countRequiredDocumentTypes = (requiredDocuments) => {
    if (!requiredDocuments) return 0;

    return Object.values(requiredDocuments)
        .filter(doc => doc.required)
        .length;
};

/**
 * Check if all required document types have been uploaded
 * @param {Object} requiredDocuments - Required documents configuration
 * @param {Array} uploadedDocuments - Array of uploaded document objects
 * @returns {boolean}
 */
export const hasAllRequiredDocuments = (requiredDocuments, uploadedDocuments) => {
    const uploadedCount = countUploadedRequiredTypes(requiredDocuments, uploadedDocuments);
    const requiredCount = countRequiredDocumentTypes(requiredDocuments);
    return uploadedCount >= requiredCount;
};

/**
 * Get list of missing required document types
 * @param {Object} requiredDocuments - Required documents configuration
 * @param {Array} uploadedDocuments - Array of uploaded document objects
 * @returns {Array} Array of missing document type objects { key, label }
 */
export const getMissingRequiredDocuments = (requiredDocuments, uploadedDocuments) => {
    if (!requiredDocuments) return [];

    return Object.entries(requiredDocuments)
        .filter(([key, doc]) =>
            doc.required &&
            !hasDocumentType(uploadedDocuments, key)
        )
        .map(([key, doc]) => ({ key, label: doc.label }));
};

/**
 * Count pending documents (documents awaiting review)
 * @param {Array} documents - Array of document objects
 * @returns {number}
 */
export const countPendingDocuments = (documents) => {
    if (!documents || !Array.isArray(documents)) return 0;
    return documents.filter(doc =>
        doc.status === 'pending' || doc.status === 'uploaded'
    ).length;
};

/**
 * Count approved documents
 * @param {Array} documents - Array of document objects
 * @returns {number}
 */
export const countApprovedDocuments = (documents) => {
    if (!documents || !Array.isArray(documents)) return 0;
    return documents.filter(doc => isDocumentApproved(doc.status)).length;
};

/**
 * Check if all documents in a type are approved
 * @param {Array} documents - Documents for a specific type
 * @returns {boolean}
 */
export const areAllDocumentsApproved = (documents) => {
    if (!documents || documents.length === 0) return false;
    return documents.every(doc => isDocumentApproved(doc.status));
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Validate file type
 * @param {File} file - File object
 * @param {Array} allowedTypes - Array of allowed extensions (e.g., ['.pdf', '.jpg'])
 * @returns {boolean}
 */
export const isValidFileType = (file, allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']) => {
    if (!file || !file.name) return false;
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(extension);
};

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSizeMB - Maximum file size in MB (default 10MB)
 * @returns {boolean}
 */
export const isValidFileSize = (file, maxSizeMB = 10) => {
    if (!file || !file.size) return false;
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
};
