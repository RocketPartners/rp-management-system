/**
 * Onboarding route helpers
 * Centralizes route names and helper functions for the onboarding system
 */

/**
 * Guest onboarding routes (used by candidates filling out forms)
 */
export const GUEST_ONBOARDING_ROUTES = {
    // Main form page
    FORM: 'guest.onboarding.form',

    // API endpoints for updating form data
    UPDATE_PERSONAL_INFO: 'guest.onboarding.update-personal-info',
    UPDATE_GOVERNMENT_IDS: 'guest.onboarding.update-government-ids',
    UPDATE_EMERGENCY_CONTACT: 'guest.onboarding.update-emergency-contact',

    // Document management
    UPLOAD_DOCUMENT: 'guest.onboarding.upload-document',
    DELETE_DOCUMENT: 'guest.onboarding.delete-document',

    // Final submission
    SUBMIT: 'guest.onboarding.submit',

    // Checklist view
    CHECKLIST: 'guest.onboarding.checklist',
};

/**
 * Admin onboarding routes (used by HR/admins reviewing submissions)
 */
export const ADMIN_ONBOARDING_ROUTES = {
    // Submissions list
    INDEX: 'onboarding.submissions.index',

    // Review individual submission
    REVIEW: 'onboarding.submissions.review',

    // Submission approval/rejection
    APPROVE: 'onboarding.submissions.approve',
    REJECT: 'onboarding.submissions.reject',

    // Document approval/rejection
    APPROVE_DOCUMENT: 'onboarding.submissions.approve-document',
    REJECT_DOCUMENT: 'onboarding.submissions.reject-document',

    // User conversion
    CONVERT_TO_USER: 'onboarding.invites.convert-to-user',
};