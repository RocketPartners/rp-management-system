/**
 * Shared types for the onboarding portal flow.
 * API responses use snake_case fields (Spring Boot), kept verbatim here.
 */

/** A single uploaded onboarding document. */
export interface OnboardingDocument {
    id: number;
    document_type: string;
    filename: string;
    description?: string;
    status: 'uploaded' | 'pending' | 'approved' | 'rejected' | string;
    rejection_reason?: string;
}

/** Configuration for a required document type, keyed by document type. */
export interface RequiredDocument {
    label: string;
    required: boolean;
    accepted_formats?: string[];
    /** Maximum size in KB. */
    max_size?: number;
}

export type RequiredDocuments = Record<string, RequiredDocument>;

/** Personal info captured in step 1 (and government IDs, merged server-side). */
export interface PersonalInfo {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    suffix?: string;
    birthday?: string;
    gender?: string;
    civil_status?: string;
    phone_number?: string;
    mobile_number?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    sss_number?: string;
    tin_number?: string;
    hdmf_number?: string;
    philhealth_number?: string;
}

/** Emergency contact captured in step 3. */
export interface EmergencyContact {
    name?: string;
    phone?: string;
    mobile?: string;
    relationship?: string;
}

/** A loaded submission for an onboarding invite. */
export interface Submission {
    current_step?: number;
    submitted_at?: string;
    personal_info?: PersonalInfo;
    emergency_contact?: EmergencyContact;
    documents?: OnboardingDocument[];
}

/** Server-side validation status that gates final submission. */
export interface SubmissionStatus {
    can_submit?: boolean;
    blocker?: string | null;
    missing_documents?: string[];
}

// ---- Form data shapes (mirror the snake_case API payloads) ----

export interface PersonalInfoFormData {
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

export interface GovIdFormData {
    sss_number: string;
    tin_number: string;
    hdmf_number: string;
    philhealth_number: string;
}

export interface EmergencyContactFormData {
    name: string;
    phone: string;
    mobile: string;
    relationship: string;
}

export interface DocumentFormData {
    document_type: string;
    file: File | null;
    description: string;
}

/**
 * Form-like state object mimicking Inertia's useForm interface.
 * `processing` is wired from the corresponding mutation's pending state.
 */
export interface FormState<T> {
    data: T;
    setData: <K extends keyof T>(
        key: K | ((prev: T) => T),
        value?: T[K],
    ) => void;
    reset: () => void;
    processing?: boolean;
}
