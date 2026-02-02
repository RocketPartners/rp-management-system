/**
 * Email helper utilities
 * Provides utility functions for generating and formatting work emails
 */

/**
 * Company email domain
 * Used in Admin/Submissions/Review.jsx line 133
 */
export const COMPANY_EMAIL_DOMAIN = 'rocketpartners.ph';

/**
 * Default temporary password for new user accounts
 * Used in Admin/Submissions/Review.jsx line 751
 */
export const DEFAULT_TEMP_PASSWORD = 'ChangeMe123!';

/**
 * Generate work email from personal information
 * Format: firstname.lastname@rocketpartners.ph
 * @param {Object} personalInfo - Personal info object with first_name and last_name
 * @returns {string} Generated work email
 */
export const generateWorkEmail = (personalInfo) => {
    if (!personalInfo || !personalInfo.first_name || !personalInfo.last_name) {
        return '';
    }

    const firstName = personalInfo.first_name.toLowerCase().trim();
    const lastName = personalInfo.last_name.toLowerCase().trim();

    return `${firstName}.${lastName}@${COMPANY_EMAIL_DOMAIN}`;
};

/**
 * Generate work email from separate name parts
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Generated work email
 */
export const generateWorkEmailFromNames = (firstName, lastName) => {
    if (!firstName || !lastName) {
        return '';
    }

    const first = firstName.toLowerCase().trim();
    const last = lastName.toLowerCase().trim();

    return `${first}.${last}@${COMPANY_EMAIL_DOMAIN}`;
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
