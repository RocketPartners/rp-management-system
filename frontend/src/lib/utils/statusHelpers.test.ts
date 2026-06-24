import {
    DOCUMENT_STATUSES,
    SUBMISSION_STATUSES,
} from '@/lib/constants/onboarding/statuses';
import {
    canDocumentBeReviewed,
    canSubmissionBeApproved,
    canSubmissionBeEdited,
    getStatusLabel,
    isDocumentApproved,
    isDocumentRejected,
    isSubmissionApproved,
} from '@/lib/utils/statusHelpers';
import { describe, expect, it } from 'vitest';

describe('statusHelpers', () => {
    describe('canSubmissionBeEdited', () => {
        it('allows editing for draft and revision-requested submissions', () => {
            // Arrange / Act / Assert
            expect(canSubmissionBeEdited(SUBMISSION_STATUSES.DRAFT)).toBe(true);
            expect(
                canSubmissionBeEdited(SUBMISSION_STATUSES.REVISION_REQUESTED),
            ).toBe(true);
        });

        it('blocks editing for submitted and approved submissions', () => {
            // Arrange / Act / Assert
            expect(canSubmissionBeEdited(SUBMISSION_STATUSES.SUBMITTED)).toBe(
                false,
            );
            expect(canSubmissionBeEdited(SUBMISSION_STATUSES.APPROVED)).toBe(
                false,
            );
        });
    });

    describe('submission approval guards', () => {
        it('only allows approval of submitted submissions', () => {
            // Arrange / Act / Assert
            expect(canSubmissionBeApproved(SUBMISSION_STATUSES.SUBMITTED)).toBe(
                true,
            );
            expect(canSubmissionBeApproved(SUBMISSION_STATUSES.DRAFT)).toBe(
                false,
            );
        });

        it('reports approval state via isSubmissionApproved', () => {
            // Arrange / Act / Assert
            expect(isSubmissionApproved(SUBMISSION_STATUSES.APPROVED)).toBe(
                true,
            );
            expect(isSubmissionApproved(SUBMISSION_STATUSES.UNDER_REVIEW)).toBe(
                false,
            );
        });
    });

    describe('document review guards', () => {
        it('allows review of pending and uploaded documents only', () => {
            // Arrange / Act / Assert
            expect(canDocumentBeReviewed(DOCUMENT_STATUSES.PENDING)).toBe(true);
            expect(canDocumentBeReviewed(DOCUMENT_STATUSES.UPLOADED)).toBe(true);
            expect(canDocumentBeReviewed(DOCUMENT_STATUSES.APPROVED)).toBe(
                false,
            );
        });

        it('distinguishes approved from rejected documents', () => {
            // Arrange / Act / Assert
            expect(isDocumentApproved(DOCUMENT_STATUSES.APPROVED)).toBe(true);
            expect(isDocumentRejected(DOCUMENT_STATUSES.REJECTED)).toBe(true);
            expect(isDocumentApproved(DOCUMENT_STATUSES.REJECTED)).toBe(false);
        });
    });

    describe('getStatusLabel', () => {
        it('maps a known submission status to its human-readable label', () => {
            // Arrange / Act / Assert
            expect(getStatusLabel(SUBMISSION_STATUSES.APPROVED)).toBe(
                'Approved',
            );
        });

        it('maps a known document status to its label when type is document', () => {
            // Arrange / Act / Assert
            expect(
                getStatusLabel(DOCUMENT_STATUSES.REJECTED, 'document'),
            ).toBe('Rejected');
        });

        it('falls back to the default config label for an unknown status', () => {
            // Arrange / Act / Assert: unknown submission status falls back to Draft
            expect(getStatusLabel('not-a-real-status')).toBe('Draft');
        });
    });
});
