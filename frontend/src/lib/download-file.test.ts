import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadAuthenticatedFile, extractFilesPath } from '@/lib/download-file';

// ---- Mock the auth-injecting Spring Boot API client ----
const apiFetch = vi.fn();
vi.mock('@/lib/spring-boot-api', () => ({
    apiFetch: (...args: unknown[]) => apiFetch(...args),
}));

describe('extractFilesPath', () => {
    it('extracts a relative /files path', () => {
        expect(extractFilesPath('/files/abc-123/download')).toBe('/files/abc-123/download');
    });

    it('strips origin + /api/v1 from a legacy absolute url', () => {
        expect(
            extractFilesPath('https://hr.example.com/api/v1/files/abc-123/download'),
        ).toBe('/files/abc-123/download');
    });

    it('returns null for non-files urls', () => {
        expect(extractFilesPath('https://cdn.example.com/avatar.png')).toBeNull();
        expect(extractFilesPath(null)).toBeNull();
        expect(extractFilesPath(undefined)).toBeNull();
    });
});

describe('downloadAuthenticatedFile', () => {
    beforeEach(() => {
        apiFetch.mockReset();
        // jsdom does not implement object URLs.
        URL.createObjectURL = vi.fn(() => 'blob:mock-object-url');
        URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('fetches the normalized /files path with auth and triggers a download', async () => {
        // Arrange
        apiFetch.mockResolvedValue({
            ok: true,
            status: 200,
            blob: vi
                .fn()
                .mockResolvedValue(new Blob(['pdf-bytes'], { type: 'application/pdf' })),
        });
        const clickSpy = vi
            .spyOn(HTMLAnchorElement.prototype, 'click')
            .mockImplementation(() => {});

        // Act
        await downloadAuthenticatedFile(
            'https://hr.example.com/api/v1/files/abc-123/download',
            'report.pdf',
        );

        // Assert: apiFetch called with host + /api/v1 stripped, download triggered
        expect(apiFetch).toHaveBeenCalledTimes(1);
        expect(apiFetch).toHaveBeenCalledWith('/files/abc-123/download');
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('throws a friendly error on a 404 and does not trigger a download', async () => {
        // Arrange
        apiFetch.mockResolvedValue({ ok: false, status: 404 });
        const clickSpy = vi
            .spyOn(HTMLAnchorElement.prototype, 'click')
            .mockImplementation(() => {});

        // Act + Assert
        await expect(
            downloadAuthenticatedFile('/files/missing/download'),
        ).rejects.toThrow('This file is no longer available.');
        expect(clickSpy).not.toHaveBeenCalled();
    });

    it('throws without calling apiFetch for a non-files url', async () => {
        await expect(
            downloadAuthenticatedFile('https://cdn.example.com/avatar.png'),
        ).rejects.toThrow('Not an authenticated file URL');
        expect(apiFetch).not.toHaveBeenCalled();
    });
});
