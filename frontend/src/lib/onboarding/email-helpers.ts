/**
 * Email helper utilities
 * Provides utility functions for generating and formatting work emails
 */

import type { PersonalInfo } from '@/types/onboarding';

/**
 * Company email domain
 * Used in Admin/Submissions/Review.jsx line 133
 */
export const COMPANY_EMAIL_DOMAIN = 'gmail.com';

/**
 * Testing email username (for local development)
 */
export const TESTING_EMAIL_USERNAME = 'janetubigon00';

/**
 * Check if running in development mode
 */
const isDevelopment = import.meta.env.DEV;

/**
 * Default temporary password for new user accounts
 * Used in Admin/Submissions/Review.jsx line 751
 */
export const DEFAULT_TEMP_PASSWORD = 'ChangeMe123!';

/**
 * Generate work email from personal information.
 * Format: firstnamelastname@gmail.com (no periods).
 * In development, always returns the testing email.
 */
export const generateWorkEmail = (
    personalInfo?: PersonalInfo | null,
): string => {
    // In development, always use testing email
    if (isDevelopment) {
        return `${TESTING_EMAIL_USERNAME}@${COMPANY_EMAIL_DOMAIN}`;
    }

    if (!personalInfo || !personalInfo.first_name || !personalInfo.last_name) {
        return '';
    }

    // Extract first word only from first name (handles "John Paul" -> "john")
    const firstNameParts = personalInfo.first_name!.trim().split(' ');
    const firstWord = firstNameParts[0] || '';

    // Remove non-alphabetic characters and convert to lowercase
    const firstName = firstWord.toLowerCase().replace(/[^a-z]/gi, '');
    const lastName = personalInfo
        .last_name!.toLowerCase()
        .trim()
        .replace(/[^a-z]/gi, '');

    return `${firstName}${lastName}@${COMPANY_EMAIL_DOMAIN}`;
};

/** Generate a work email from separate name parts. */
export const generateWorkEmailFromNames = (
    firstName: string,
    lastName: string,
): string => {
    // In development, always use testing email
    if (isDevelopment) {
        return `${TESTING_EMAIL_USERNAME}@${COMPANY_EMAIL_DOMAIN}`;
    }

    if (!firstName || !lastName) {
        return '';
    }

    // Extract first word only from first name (handles "John Paul" -> "john")
    const firstNameParts = firstName.trim().split(' ');
    const firstWord = firstNameParts[0] || '';

    // Remove non-alphabetic characters and convert to lowercase
    const first = firstWord.toLowerCase().replace(/[^a-z]/gi, '');
    const last = lastName
        .toLowerCase()
        .trim()
        .replace(/[^a-z]/gi, '');

    return `${first}${last}@${COMPANY_EMAIL_DOMAIN}`;
};

/** Validate an email's format. */
export const isValidEmail = (email?: string | null): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/** Check if an email belongs to the company domain. */
export const isCompanyEmail = (email?: string | null): boolean => {
    if (!email) return false;
    return email.toLowerCase().endsWith(`@${COMPANY_EMAIL_DOMAIN}`);
};

/** Extract the username (before @) from an email. */
export const extractEmailUsername = (email?: string | null): string => {
    if (!email) return '';
    return email.split('@')[0];
};

/** Format a full name for display from personal info. */
export const formatFullName = (
    personalInfo?: PersonalInfo | null,
): string => {
    if (!personalInfo) return '';

    const parts = [
        personalInfo.first_name,
        personalInfo.middle_name,
        personalInfo.last_name,
    ].filter(Boolean) as string[];

    // Add suffix if not 'none'
    if (personalInfo.suffix && personalInfo.suffix !== 'none') {
        parts.push(personalInfo.suffix);
    }

    return parts.join(' ');
};

/** Get the default temporary password for new accounts. */
export const getDefaultTempPassword = (): string => DEFAULT_TEMP_PASSWORD;
