/**
 * Custom hook for managing multi-step onboarding form state
 * Consolidates 4 separate useForm hooks into one unified interface
 */

import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { DEFAULT_COUNTRY } from '@/lib/constants/onboarding/selectOptions';
import { GUEST_ONBOARDING_ROUTES } from '@/lib/constants/onboarding/routes';

/**
 * Determines the initial step based on submission completion
 * @param {Object} submission - Existing submission data
 * @returns {number} Initial step number (1-4)
 */
function determineInitialStep(submission) {
    if (!submission) return 1;

    // If emergency contact is filled, go to step 4 (documents)
    if (submission.emergency_contact?.name && submission.emergency_contact?.phone) {
        return 4;
    }

    // If government IDs are filled, go to step 3 (emergency contact)
    if (submission.government_ids && (
        submission.government_ids.sss_number ||
        submission.government_ids.tin_number ||
        submission.government_ids.hdmf_number ||
        submission.government_ids.philhealth_number
    )) {
        return 3;
    }

    // If personal info is filled, go to step 2 (government IDs)
    if (submission.personal_info?.first_name &&
        submission.personal_info?.last_name &&
        submission.personal_info?.birthday) {
        return 2;
    }

    // Default to step 1 (personal info)
    return 1;
}

/**
 * Manages multi-step onboarding form state
 *
 * @param {Object} submission - Existing submission data
 * @param {string} inviteToken - Invite token for API calls
 * @returns {Object} Form state and handlers
 */
export function useOnboardingForm(submission, inviteToken) {
    const [currentStep, setCurrentStep] = useState(() => determineInitialStep(submission));

    // Personal Info Form (Step 1)
    const personalForm = useForm({
        first_name: submission?.personal_info?.first_name || '',
        middle_name: submission?.personal_info?.middle_name || '',
        last_name: submission?.personal_info?.last_name || '',
        suffix: submission?.personal_info?.suffix || 'none',
        birthday: submission?.personal_info?.birthday || '',
        gender: submission?.personal_info?.gender || '',
        civil_status: submission?.personal_info?.civil_status || '',
        phone_number: submission?.personal_info?.phone_number || '',
        mobile_number: submission?.personal_info?.mobile_number || '',
        address_line_1: submission?.personal_info?.address_line_1 || '',
        address_line_2: submission?.personal_info?.address_line_2 || '',
        city: submission?.personal_info?.city || '',
        state: submission?.personal_info?.state || '',
        postal_code: submission?.personal_info?.postal_code || '',
        country: submission?.personal_info?.country || DEFAULT_COUNTRY,
    });

    // Government IDs Form (Step 2)
    const govIdForm = useForm({
        sss_number: submission?.government_ids?.sss_number || '',
        tin_number: submission?.government_ids?.tin_number || '',
        hdmf_number: submission?.government_ids?.hdmf_number || '',
        philhealth_number: submission?.government_ids?.philhealth_number || '',
    });

    // Emergency Contact Form (Step 3)
    const emergencyForm = useForm({
        name: submission?.emergency_contact?.name || '',
        phone: submission?.emergency_contact?.phone || '',
        mobile: submission?.emergency_contact?.mobile || '',
        relationship: submission?.emergency_contact?.relationship || '',
    });

    // Document Upload Form (Step 4)
    const documentForm = useForm({
        document_type: '',
        file: null,
        description: '',
    });

    // Step navigation handlers
    const handleSavePersonalInfo = () => {
        personalForm.post(route(GUEST_ONBOARDING_ROUTES.UPDATE_PERSONAL_INFO, inviteToken), {
            preserveScroll: true,
            onSuccess: () => setCurrentStep(2),
        });
    };

    const handleSaveGovIds = () => {
        govIdForm.post(route(GUEST_ONBOARDING_ROUTES.UPDATE_GOVERNMENT_IDS, inviteToken), {
            preserveScroll: true,
            onSuccess: () => setCurrentStep(3),
        });
    };

    const handleSaveEmergency = () => {
        emergencyForm.post(route(GUEST_ONBOARDING_ROUTES.UPDATE_EMERGENCY_CONTACT, inviteToken), {
            preserveScroll: true,
            onSuccess: () => setCurrentStep(4),
        });
    };

    const handleDeleteDocument = (documentId) => {
        if (confirm('Are you sure you want to delete this document?')) {
            router.delete(route(GUEST_ONBOARDING_ROUTES.DELETE_DOCUMENT, [inviteToken, documentId]), {
                preserveScroll: true,
            });
        }
    };

    const handleFinalSubmit = () => {
        router.post(route(GUEST_ONBOARDING_ROUTES.SUBMIT, inviteToken), {}, {
            onSuccess: () => {
                // Will redirect to checklist page
            },
        });
    };

    const goToStep = (step) => {
        setCurrentStep(step);
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return {
        // Current step state
        currentStep,
        totalSteps: 4,

        // Form instances
        personalForm,
        govIdForm,
        emergencyForm,
        documentForm,

        // Step handlers
        handleSavePersonalInfo,
        handleSaveGovIds,
        handleSaveEmergency,
        handleDeleteDocument,
        handleFinalSubmit,

        // Navigation
        goToStep,
        goToPreviousStep,
    };
}
