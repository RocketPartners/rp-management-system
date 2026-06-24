/**
 * Custom hook for managing multi-step onboarding form state.
 * Replaces Inertia useForm with React state + TanStack Query mutations.
 * Keeps the same external interface (form.data, form.setData, form.processing)
 * so form components need no changes.
 */

import { portalDelete, portalPost, portalPostFormData } from '@/lib/api/onboarding-portal';
import { DEFAULT_COUNTRY } from '@/lib/constants/onboarding/selectOptions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * Form-like state object that mimics Inertia's useForm interface.
 * `setData` accepts either a key/value pair or a state updater function.
 */
interface FormState<T> {
    data: T;
    setData: {
        <K extends keyof T>(key: K, value: T[K]): void;
        (updater: (prev: T) => T): void;
    };
    reset: () => void;
}

/** A form state object augmented with TanStack Query's pending flag. */
type FormStateWithProcessing<T> = FormState<T> & {
    processing: boolean;
};

interface PersonalInfoData {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    birthday: string;
    gender: string;
    civil_status: string;
    phone_number: string;
    mobile_number: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

interface GovIdData {
    sss_number: string;
    tin_number: string;
    hdmf_number: string;
    philhealth_number: string;
}

interface EmergencyContactData {
    name: string;
    phone: string;
    mobile: string;
    relationship: string;
}

interface DocumentUploadData {
    document_type: string;
    file: File | null;
    description: string;
}

/**
 * Existing submission data from the portal API (snake_case fields from Spring Boot).
 * Only the fields read by this hook are typed; the API payload may carry more.
 */
interface OnboardingSubmission {
    current_step?: number;
    personal_info?: Partial<PersonalInfoData & GovIdData>;
    emergency_contact?: Partial<EmergencyContactData>;
}

/** Return shape of {@link useOnboardingForm} — every member consumers rely on. */
export interface UseOnboardingFormReturn {
    currentStep: number;
    totalSteps: number;

    personalForm: FormStateWithProcessing<PersonalInfoData>;
    govIdForm: FormStateWithProcessing<GovIdData>;
    emergencyForm: FormStateWithProcessing<EmergencyContactData>;
    documentForm: FormStateWithProcessing<DocumentUploadData>;

    handleSavePersonalInfo: () => void;
    handleSaveGovIds: () => void;
    handleSaveEmergency: () => void;
    handleUploadDocument: (e?: { preventDefault: () => void }) => void;
    handleDeleteDocument: (documentId: string | number) => void;
    handleFinalSubmit: () => void;

    goToStep: (step: number) => void;
    goToPreviousStep: () => void;

    isSubmitting: boolean;
}

/**
 * Creates a form-like state object that mimics Inertia's useForm interface.
 */
function useFormState<T>(initialData: T): FormState<T> {
    const [data, setDataState] = useState<T>(initialData);

    const setData = (<K extends keyof T>(
        key: K | ((prev: T) => T),
        value?: T[K],
    ): void => {
        if (typeof key === 'function') {
            setDataState(key);
        } else {
            setDataState((prev) => ({ ...prev, [key]: value }));
        }
    }) as FormState<T>['setData'];

    return {
        data,
        setData,
        reset: () => setDataState(initialData),
    };
}

/**
 * Determines the initial step based on submission completion.
 * Response fields are snake_case from the Spring Boot API.
 */
function determineInitialStep(submission: OnboardingSubmission | null | undefined): number {
    if (!submission) return 1;

    // Use current_step from backend if available
    if (submission.current_step) return submission.current_step;

    // Fallback: check completion
    if (
        submission.emergency_contact?.name &&
        submission.emergency_contact?.phone
    ) {
        return 4;
    }

    // Gov IDs are merged into personal_info in Spring Boot
    if (
        submission.personal_info?.sss_number ||
        submission.personal_info?.tin_number ||
        submission.personal_info?.hdmf_number ||
        submission.personal_info?.philhealth_number
    ) {
        return 3;
    }

    if (
        submission.personal_info?.first_name &&
        submission.personal_info?.last_name &&
        submission.personal_info?.birthday
    ) {
        return 2;
    }

    return 1;
}

/**
 * Manages multi-step onboarding form state with TanStack Query mutations.
 *
 * @param submission - Existing submission data from portal API (snake_case fields)
 * @param inviteToken - Invite token for API calls
 * @returns Form state and handlers (same interface as Inertia version)
 */
export function useOnboardingForm(
    submission: OnboardingSubmission | null | undefined,
    inviteToken: string,
): UseOnboardingFormReturn {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState<number>(() =>
        determineInitialStep(submission),
    );

    const basePath = `/onboarding/portal/${inviteToken}`;

    // Invalidate portal data after each mutation
    const invalidatePortal = () => {
        queryClient.invalidateQueries({ queryKey: ['onboarding-portal', inviteToken] });
    };

    // ========== Form State (mimics Inertia useForm interface) ==========

    // Personal Info Form (Step 1)
    // API response uses snake_case: submission.personal_info
    const pi = submission?.personal_info;
    const personalForm = useFormState<PersonalInfoData>({
        first_name: pi?.first_name || '',
        middle_name: pi?.middle_name || '',
        last_name: pi?.last_name || '',
        suffix: pi?.suffix || 'none',
        birthday: pi?.birthday || '',
        gender: pi?.gender || '',
        civil_status: pi?.civil_status || '',
        phone_number: pi?.phone_number || '',
        mobile_number: pi?.mobile_number || '',
        address_line_1: pi?.address_line_1 || '',
        address_line_2: pi?.address_line_2 || '',
        city: pi?.city || '',
        state: pi?.state || '',
        postal_code: pi?.postal_code || '',
        country: pi?.country || DEFAULT_COUNTRY,
    });

    // Government IDs Form (Step 2)
    // Gov IDs stored in personal_info in Spring Boot
    const govIdForm = useFormState<GovIdData>({
        sss_number: pi?.sss_number || '',
        tin_number: pi?.tin_number || '',
        hdmf_number: pi?.hdmf_number || '',
        philhealth_number: pi?.philhealth_number || '',
    });

    // Emergency Contact Form (Step 3)
    const ec = submission?.emergency_contact;
    const emergencyForm = useFormState<EmergencyContactData>({
        name: ec?.name || '',
        phone: ec?.phone || '',
        mobile: ec?.mobile || '',
        relationship: ec?.relationship || '',
    });

    // Document Upload Form (Step 4)
    const documentForm = useFormState<DocumentUploadData>({
        document_type: '',
        file: null,
        description: '',
    });

    // ========== Mutations ==========

    const personalMutation = useMutation({
        mutationFn: (data: PersonalInfoData) => portalPost(`${basePath}/personal-info`, data),
        onSuccess: () => {
            toast.success('Personal information saved!');
            invalidatePortal();
            setCurrentStep(2);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const govIdMutation = useMutation({
        mutationFn: (data: GovIdData) => portalPost(`${basePath}/government-ids`, data),
        onSuccess: () => {
            toast.success('Government IDs saved!');
            invalidatePortal();
            setCurrentStep(3);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const emergencyMutation = useMutation({
        mutationFn: (data: EmergencyContactData) => portalPost(`${basePath}/emergency-contact`, data),
        onSuccess: () => {
            toast.success('Emergency contact saved!');
            invalidatePortal();
            setCurrentStep(4);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const uploadMutation = useMutation({
        mutationFn: (formData: FormData) => portalPostFormData(`${basePath}/documents`, formData),
        onSuccess: () => {
            toast.success('Document uploaded successfully!');
            invalidatePortal();
            documentForm.setData('file', null);
            documentForm.setData('description', '');
            // Reset file input
            const fileInput = document.getElementById('file-upload');
            if (fileInput instanceof HTMLInputElement) fileInput.value = '';
        },
        onError: (err: Error) => toast.error('Upload failed: ' + err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: (documentId: string | number) => portalDelete(`${basePath}/documents/${documentId}`),
        onSuccess: () => {
            toast.success('Document deleted successfully!');
            invalidatePortal();
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const submitMutation = useMutation({
        mutationFn: () => portalPost(`${basePath}/submit`),
        onSuccess: () => {
            toast.success('Onboarding submitted successfully!');
            invalidatePortal();
            navigate(`/onboarding/${inviteToken}/success`);
        },
        onError: (err: Error) => toast.error(err.message),
    });

    // ========== Handlers ==========

    const handleSavePersonalInfo = () => {
        personalMutation.mutate(personalForm.data);
    };

    const handleSaveGovIds = () => {
        govIdMutation.mutate(govIdForm.data);
    };

    const handleSaveEmergency = () => {
        emergencyMutation.mutate(emergencyForm.data);
    };

    const handleUploadDocument = (e?: { preventDefault: () => void }) => {
        if (e) e.preventDefault();

        const formData = new FormData();
        formData.append('document_type', documentForm.data.document_type);
        if (documentForm.data.file) {
            formData.append('file', documentForm.data.file);
        }
        if (documentForm.data.description) {
            formData.append('description', documentForm.data.description);
        }

        uploadMutation.mutate(formData);
    };

    const handleDeleteDocument = (documentId: string | number) => {
        if (confirm('Are you sure you want to delete this document?')) {
            deleteMutation.mutate(documentId);
        }
    };

    const handleFinalSubmit = () => {
        submitMutation.mutate();
    };

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // ========== Return compatible interface ==========
    // Wire mutation.isPending into form.processing for button states

    return {
        currentStep,
        totalSteps: 4,

        // Form instances (compatible with Inertia useForm interface)
        personalForm: { ...personalForm, processing: personalMutation.isPending },
        govIdForm: { ...govIdForm, processing: govIdMutation.isPending },
        emergencyForm: { ...emergencyForm, processing: emergencyMutation.isPending },
        documentForm: { ...documentForm, processing: uploadMutation.isPending },

        // Step handlers
        handleSavePersonalInfo,
        handleSaveGovIds,
        handleSaveEmergency,
        handleUploadDocument,
        handleDeleteDocument,
        handleFinalSubmit,

        // Navigation
        goToStep,
        goToPreviousStep,

        // Extra state for submit
        isSubmitting: submitMutation.isPending,
    };
}
