import { apiFetch } from '@/lib/spring-boot-api';
import { useEffect, useState } from 'react';

// Uploaded images are served only through the authenticated
// GET /api/v1/uploads/images/{filename} endpoint, so a raw <img src> 401s.
// This regex extracts the apiFetch path from either a relative
// "/uploads/images/..." src or a legacy absolute ".../api/v1/uploads/images/..."
// src, stripping origin + any /api/v1 prefix so apiFetch re-adds API_URL once.
const UPLOADS_IMAGE_PATH = /\/uploads\/images\/[^"'\s?]+/;

/**
 * Pulls the authenticated /uploads/images/* path out of a URL, or null if the
 * URL does not point at our authenticated upload endpoint. Shared so the body
 * resolver, gallery, and lightbox normalize identically.
 */
export function extractUploadsImagePath(url: string | null | undefined): string | null {
    if (!url) return null;
    const match = url.match(UPLOADS_IMAGE_PATH);
    return match ? match[0] : null;
}

/**
 * Resolves an image URL for display. If it targets the authenticated
 * /uploads/images/* endpoint, fetches the bytes with auth and returns an object
 * URL (revoked on unmount/change). Any other URL (external, profile, blob:) is
 * returned untouched.
 */
export function useAuthenticatedImage(url: string | null | undefined): string | undefined {
    const [resolved, setResolved] = useState<string | undefined>(() => url ?? undefined);

    useEffect(() => {
        const path = extractUploadsImagePath(url);
        if (!path) {
            // Not our authenticated endpoint — render the URL as-is.
            setResolved(url ?? undefined);
            return;
        }

        let cancelled = false;
        let objectUrl: string | null = null;

        (async () => {
            try {
                const res = await apiFetch(path);
                if (!res.ok || cancelled) return;
                const blob = await res.blob();
                if (cancelled) return;
                objectUrl = URL.createObjectURL(blob);
                setResolved(objectUrl);
            } catch {
                // Leave the original src; a broken image beats a crash.
            }
        })();

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [url]);

    return resolved;
}
