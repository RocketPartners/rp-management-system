import { apiFetch } from '@/lib/spring-boot-api';

// File attachments are served only through the hardened, authenticated
// GET /api/v1/files/** endpoint (Bearer JWT + per-resource ownership), so a
// plain <a href> (cookie-only, no bearer) now 401/404s. This regex extracts the
// apiFetch path from either a relative "/files/..." url or a legacy absolute
// ".../api/v1/files/..." url, stripping origin + any /api/v1 prefix so apiFetch
// re-adds API_URL exactly once (mirrors H3-FE extractUploadsImagePath).
const FILES_PATH = /\/files\/[^"'\s]+/;

/**
 * Pulls the authenticated /files/* path out of a URL, or null if the URL does
 * not point at our authenticated files endpoint. Shared so every download site
 * normalizes identically.
 */
export function extractFilesPath(url: string | null | undefined): string | null {
    if (!url) return null;
    const match = url.match(FILES_PATH);
    return match ? match[0] : null;
}

/**
 * Downloads a file from the authenticated /files/** endpoint: fetches the bytes
 * with the Bearer token via apiFetch, then triggers a browser download of the
 * resulting blob. Throws on a non-ok response so callers can surface an error.
 *
 * @param url      The backend download URL (relative "/files/...", legacy
 *                 absolute ".../api/v1/files/...", or full-host form).
 * @param filename Optional download filename for the saved file.
 */
export async function downloadAuthenticatedFile(
    url: string,
    filename?: string,
): Promise<void> {
    const path = extractFilesPath(url);
    if (!path) {
        throw new Error('Not an authenticated file URL');
    }

    const res = await apiFetch(path);
    if (!res.ok) {
        if (res.status === 404) {
            throw new Error('This file is no longer available.');
        }
        throw new Error(`Download failed (${res.status})`);
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        if (filename) anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    } finally {
        // Defer revoke so the browser has time to start the download.
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    }
}
