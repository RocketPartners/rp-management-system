/**
 * Email helper utilities
 * Provides utility functions for generating and formatting work emails
 */

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
 * Generate work email from personal information
 * Format: firstnamelastname@gmail.com (no periods)
 * In development: janetubigon00@gmail.com
 * @param {Object} personalInfo - Personal info object with first_name and last_name
 * @returns {string} Generated work email
 */
export const generateWorkEmail = (personalInfo) => {
    // In development, always use testing email
    if (isDevelopment) {
        return `${TESTING_EMAIL_USERNAME}@${COMPANY_EMAIL_DOMAIN}`;
    }

    if (!personalInfo || !personalInfo.first_name || !personalInfo.last_name) {
        return '';
    }

    // Extract first word only from first name (handles "John Paul" -> "john")
    const firstNameParts = personalInfo.first_name.trim().split(' ');
    const firstWord = firstNameParts[0] || '';

    // Remove non-alphabetic characters and convert to lowercase
    const firstName = firstWord.toLowerCase().replace(/[^a-z]/gi, '');
    const lastName = personalInfo.last_name.toLowerCase().trim().replace(/[^a-z]/gi, '');

    return `${firstName}${lastName}@${COMPANY_EMAIL_DOMAIN}`;
};

/**
 * Generate work email from separate name parts
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Generated work email
 */
export const generateWorkEmailFromNames = (firstName, lastName) => {
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
    const last = lastName.toLowerCase().trim().replace(/[^a-z]/gi, '');

    return `${first}${last}@${COMPANY_EMAIL_DOMAIN}`;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Check if email is a company email
 * @param {string} email - Email to check
 * @returns {boolean}
 */
export const isCompanyEmail = (email) => {
    if (!email) return false;
    return email.toLowerCase().endsWith(`@${COMPANY_EMAIL_DOMAIN}`);
};

/**
 * Extract username from email
 * @param {string} email - Full email address
 * @returns {string} Username part (before @)
 */
export const extractEmailUsername = (email) => {
    if (!email) return '';
    return email.split('@')[0];
};

/**
 * Format full name for display
 * @param {Object} personalInfo - Personal info object
 * @returns {string} Formatted full name
 */
export const formatFullName = (personalInfo) => {
    if (!personalInfo) return '';

    const parts = [
        personalInfo.first_name,
        personalInfo.middle_name,
        personalInfo.last_name,
    ].filter(Boolean);

    // Add suffix if not 'none'
    if (personalInfo.suffix && personalInfo.suffix !== 'none') {
        parts.push(personalInfo.suffix);
    }

    return parts.join(' ');
};

/**
 * Get default temporary password
 * @returns {string} Default temp password
 */
export const getDefaultTempPassword = () => DEFAULT_TEMP_PASSWORD;
