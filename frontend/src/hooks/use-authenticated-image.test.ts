import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    extractUploadsImagePath,
    useAuthenticatedImage,
} from '@/hooks/use-authenticated-image';

// ---- Mock the auth-injecting Spring Boot API client ----
const apiFetch = vi.fn();
vi.mock('@/lib/spring-boot-api', () => ({
    apiFetch: (...args: unknown[]) => apiFetch(...args),
}));

describe('extractUploadsImagePath', () => {
    it('extracts a relative /uploads/images path', () => {
        expect(extractUploadsImagePath('/uploads/images/abc.png')).toBe(
            '/uploads/images/abc.png',
        );
    });

    it('strips origin + /api/v1 from a legacy absolute url', () => {
        expect(
            extractUploadsImagePath('https://hr.example.com/api/v1/uploads/images/abc.png'),
        ).toBe('/uploads/images/abc.png');
    });

    it('returns null for non-uploads urls', () => {
        expect(extractUploadsImagePath('https://cdn.example.com/avatar.png')).toBeNull();
        expect(extractUploadsImagePath(null)).toBeNull();
        expect(extractUploadsImagePath(undefined)).toBeNull();
    });
});

describe('useAuthenticatedImage (H3 gallery/lightbox)', () => {
    beforeEach(() => {
        apiFetch.mockReset();
        // jsdom does not implement object URLs.
        URL.createObjectURL = vi.fn(() => 'blob:mock-object-url');
        URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('fetches a /uploads/images/* url with auth and returns an object URL', async () => {
        // Arrange
        apiFetch.mockResolvedValue({
            ok: true,
            status: 200,
            blob: vi
                .fn()
                .mockResolvedValue(new Blob(['png-bytes'], { type: 'image/png' })),
        });

        // Act
        const { result } = renderHook(() =>
            useAuthenticatedImage('/uploads/images/abc.png'),
        );

        // Assert
        await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
        expect(apiFetch).toHaveBeenCalledWith('/uploads/images/abc.png');
        await waitFor(() => expect(result.current).toBe('blob:mock-object-url'));
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    });

    it('leaves non-/uploads/images/ urls untouched and never calls apiFetch', async () => {
        // Act
        const { result } = renderHook(() =>
            useAuthenticatedImage('https://cdn.example.com/avatar.png'),
        );

        // Assert
        expect(result.current).toBe('https://cdn.example.com/avatar.png');
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it('leaves the original src and never creates an object URL when apiFetch rejects', async () => {
        // Arrange
        apiFetch.mockRejectedValue(new Error('network'));

        // Act
        const { result } = renderHook(() =>
            useAuthenticatedImage('/uploads/images/abc.png'),
        );

        // Assert
        await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
        expect(result.current).toBe('/uploads/images/abc.png');
        expect(URL.createObjectURL).not.toHaveBeenCalled();
    });

    it('leaves the original src and never creates an object URL when the response is not ok', async () => {
        // Arrange
        const blob = vi.fn();
        apiFetch.mockResolvedValue({ ok: false, status: 404, blob });

        // Act
        const { result } = renderHook(() =>
            useAuthenticatedImage('/uploads/images/abc.png'),
        );

        // Assert
        await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
        expect(result.current).toBe('/uploads/images/abc.png');
        expect(blob).not.toHaveBeenCalled();
        expect(URL.createObjectURL).not.toHaveBeenCalled();
    });

    it('revokes the created object URL on unmount', async () => {
        // Arrange
        apiFetch.mockResolvedValue({
            ok: true,
            status: 200,
            blob: vi
                .fn()
                .mockResolvedValue(new Blob(['png-bytes'], { type: 'image/png' })),
        });

        // Act
        const { result, unmount } = renderHook(() =>
            useAuthenticatedImage('/uploads/images/abc.png'),
        );
        await waitFor(() => expect(result.current).toBe('blob:mock-object-url'));
        unmount();

        // Assert
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-object-url');
    });
});
