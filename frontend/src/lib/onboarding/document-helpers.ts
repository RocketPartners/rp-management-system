/**
 * Document helper utilities
 * Provides utility functions for working with onboarding documents
 */

import type {
    OnboardingDocument,
    RequiredDocuments,
} from '@/types/onboarding';
import { isDocumentApproved } from './status-helpers';

/** Group documents by document type. */
export const groupDocumentsByType = (
    documents?: OnboardingDocument[] | null,
): Record<string, OnboardingDocument[]> => {
    if (!documents || !Array.isArray(documents)) {
        return {};
    }

    return documents.reduce<Record<string, OnboardingDocument[]>>(
        (acc, doc) => {
            const type = doc.document_type;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(doc);
            return acc;
        },
        {},
    );
};

/** Get all documents for a specific document type. */
export const getDocumentsByType = (
    documents: OnboardingDocument[] | null | undefined,
    docType: string,
): OnboardingDocument[] => {
    if (!documents || !Array.isArray(documents)) {
        return [];
    }
    return documents.filter((doc) => doc.document_type === docType);
};

/** Check if a document type has any uploads. */
export const hasDocumentType = (
    documents: OnboardingDocument[] | null | undefined,
    docType: string,
): boolean => {
    return getDocumentsByType(documents, docType).length > 0;
};

/** Get count of documents for a specific type. */
export const getDocumentTypeCount = (
    documents: OnboardingDocument[] | null | undefined,
    docType: string,
): number => {
    return getDocumentsByType(documents, docType).length;
};

/** Count how many required document types have been uploaded. */
export const countUploadedRequiredTypes = (
    requiredDocuments: RequiredDocuments | null | undefined,
    uploadedDocuments: OnboardingDocument[] | null | undefined,
): number => {
    if (!requiredDocuments) return 0;

    return Object.keys(requiredDocuments).filter(
        (key) =>
            requiredDocuments[key].required &&
            hasDocumentType(uploadedDocuments, key),
    ).length;
};

/** Count total number of required document types. */
export const countRequiredDocumentTypes = (
    requiredDocuments: RequiredDocuments | null | undefined,
): number => {
    if (!requiredDocuments) return 0;

    return Object.values(requiredDocuments).filter((doc) => doc.required)
        .length;
};

/** Check if all required document types have been uploaded. */
export const hasAllRequiredDocuments = (
    requiredDocuments: RequiredDocuments | null | undefined,
    uploadedDocuments: OnboardingDocument[] | null | undefined,
): boolean => {
    const uploadedCount = countUploadedRequiredTypes(
        requiredDocuments,
        uploadedDocuments,
    );
    const requiredCount = countRequiredDocumentTypes(requiredDocuments);
    return uploadedCount >= requiredCount;
};

/** Get list of missing required document types. */
export const getMissingRequiredDocuments = (
    requiredDocuments: RequiredDocuments | null | undefined,
    uploadedDocuments: OnboardingDocument[] | null | undefined,
): Array<{ key: string; label: string }> => {
    if (!requiredDocuments) return [];

    return Object.entries(requiredDocuments)
        .filter(
            ([key, doc]) =>
                doc.required && !hasDocumentType(uploadedDocuments, key),
        )
        .map(([key, doc]) => ({ key, label: doc.label }));
};

/** Count pending documents (documents awaiting review). */
export const countPendingDocuments = (
    documents?: OnboardingDocument[] | null,
): number => {
    if (!documents || !Array.isArray(documents)) return 0;
    return documents.filter(
        (doc) => doc.status === 'pending' || doc.status === 'uploaded',
    ).length;
};

/** Count approved documents. */
export const countApprovedDocuments = (
    documents?: OnboardingDocument[] | null,
): number => {
    if (!documents || !Array.isArray(documents)) return 0;
    return documents.filter((doc) => isDocumentApproved(doc.status)).length;
};

/** Check if all documents in a type are approved. */
export const areAllDocumentsApproved = (
    documents?: OnboardingDocument[] | null,
): boolean => {
    if (!documents || documents.length === 0) return false;
    return documents.every((doc) => isDocumentApproved(doc.status));
};

/** Format a file size in bytes for display (e.g. "2.5 MB"). */
export const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

/** Validate a file's type against a list of allowed extensions. */
export const isValidFileType = (
    file: File | null | undefined,
    allowedTypes: string[] = [
        '.pdf',
        '.jpg',
        '.jpeg',
        '.png',
        '.doc',
        '.docx',
    ],
): boolean => {
    if (!file || !file.name) return false;
    const extension = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    return allowedTypes.includes(extension);
};

/** Validate a file's size against a maximum (in MB). */
export const isValidFileSize = (
    file: File | null | undefined,
    maxSizeMB = 10,
): boolean => {
    if (!file || !file.size) return false;
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
};
