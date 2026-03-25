/**
 * Form select options for onboarding
 * Centralizes all dropdown/select options used in the onboarding forms
 */

/**
 * Suffix options for personal names
 * Used in Guest/Onboarding/Form.jsx - Step 1 (Personal Info)
 */
export const SUFFIX_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'Jr.', label: 'Jr.' },
    { value: 'Sr.', label: 'Sr.' },
    { value: 'II', label: 'II' },
    { value: 'III', label: 'III' },
    { value: 'IV', label: 'IV' },
];

/**
 * Gender options
 * Used in Guest/Onboarding/Form.jsx - Step 1 (Personal Info)
 */
export const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

/**
 * Civil status options
 * Used in Guest/Onboarding/Form.jsx - Step 1 (Personal Info)
 */
export const CIVIL_STATUS_OPTIONS = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'separated', label: 'Separated' },
];

/**
 * Emergency contact relationship options
 * Used in Guest/Onboarding/Form.jsx - Step 3 (Emergency Contact)
 */
export const RELATIONSHIP_OPTIONS = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'relative', label: 'Other Relative' },
    { value: 'friend', label: 'Friend' },
];

/**
 * Default country value
 */
export const DEFAULT_COUNTRY = 'Philippines';
