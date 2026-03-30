/**
 * Theme constants - Brand colors and design tokens
 * Centralizes all color values used throughout the application
 */

/**
 * Brand colors used in the onboarding system
 * Primary brand color appears 20+ times in Guest/Onboarding/Form.jsx
 */
export const BRAND_COLORS = {
    /**
     * Primary brand color - Rocket Partners blue
     * Used for: buttons, focus rings, badges, progress indicators, icons
     */
    primary: '#2596be',

    /**
     * Primary hover state - Darker variant of brand blue
     * Used for: button hover states
     */
    primaryHover: '#1e7a9f',

    /**
     * Primary light - Light background variant
     * Used for: card backgrounds, subtle highlights
     */
    primaryLight: '#e0f2fe',
};

/**
 * Tailwind CSS classes for primary brand color
 * Pre-built class strings for consistency
 */
export const BRAND_CLASSES = {
    // Backgrounds
    bgPrimary: 'bg-[#2596be]',
    bgPrimaryHover: 'hover:bg-[#1e7a9f]',

    // Text
    textPrimary: 'text-[#2596be]',

    // Borders
    borderPrimary: 'border-[#2596be]',

    // Focus rings
    focusRingPrimary: 'focus:ring-[#2596be] focus:border-[#2596be]',

    // Combined button styles
    buttonPrimary: 'bg-[#2596be] hover:bg-[#1e7a9f]',

    // Badge styles
    badgePrimary: 'bg-[#2596be] text-white border-[#2596be]',
};

/**
 * Status-specific color schemes
 * Semantic colors for different states
 */
export const STATUS_COLORS = {
    success: {
        bg: 'bg-green-600',
        bgLight: 'bg-green-50',
        bgHover: 'hover:bg-green-700',
        text: 'text-green-700',
        border: 'border-green-200',
    },
    warning: {
        bg: 'bg-yellow-600',
        bgLight: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
    },
    error: {
        bg: 'bg-red-600',
        bgLight: 'bg-red-50',
        bgHover: 'hover:bg-red-700',
        text: 'text-red-700',
        border: 'border-red-200',
    },
    info: {
        bg: 'bg-blue-600',
        bgLight: 'bg-blue-50',
        bgHover: 'hover:bg-blue-700',
        text: 'text-blue-700',
        border: 'border-blue-200',
    },
    neutral: {
        bg: 'bg-gray-600',
        bgLight: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
    },
};

/**
 * Get Tailwind focus ring classes with primary color
 * @returns {string} Tailwind CSS classes
 */
export const getPrimaryFocusClasses = () => BRAND_CLASSES.focusRingPrimary;

/**
 * Get Tailwind button classes with primary color
 * @returns {string} Tailwind CSS classes
 */
export const getPrimaryButtonClasses = () => BRAND_CLASSES.buttonPrimary;
