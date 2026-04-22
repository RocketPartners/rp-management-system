import { useEffect, useState } from 'react';

const STORAGE_KEY = 'hris-nav-bar-offset';
const DEFAULT_OFFSET = 16;

/**
 * Configurable bottom offset (in px) for the mobile nav bar.
 * Stored in localStorage so users can tweak it per-device from Settings.
 */
export function useNavOffset() {
    const [offset, setOffsetState] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? Number(stored) : DEFAULT_OFFSET;
    });

    const setOffset = (value: number) => {
        const clamped = Math.max(0, Math.min(60, value));
        localStorage.setItem(STORAGE_KEY, String(clamped));
        setOffsetState(clamped);
        window.dispatchEvent(new Event('nav-offset-change'));
    };

    useEffect(() => {
        const handler = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            setOffsetState(stored ? Number(stored) : DEFAULT_OFFSET);
        };
        window.addEventListener('nav-offset-change', handler);
        return () => window.removeEventListener('nav-offset-change', handler);
    }, []);

    return { offset, setOffset, DEFAULT_OFFSET };
}
