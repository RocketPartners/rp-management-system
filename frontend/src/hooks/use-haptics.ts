import { useWebHaptics } from 'web-haptics/react';

/**
 * App-wide haptic feedback hook.
 * Wraps web-haptics with preset patterns for common interactions.
 */
export function useHaptics() {
    const { trigger } = useWebHaptics();

    return {
        /** Light tap — tab switches, option selection */
        tap: () => trigger('nudge'),
        /** Success feedback — form submit, mark as read */
        success: () => trigger('success'),
        /** Error feedback — validation errors */
        error: () => trigger('error'),
        /** Soft buzz — sheet open/close, FAB toggle */
        buzz: () => trigger([{ duration: 40, intensity: 0.4 }]),
        /** Custom pattern */
        trigger,
    };
}
