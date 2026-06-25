import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiFetch } from '@/lib/spring-boot-api';
import { executeTool } from './executor';

vi.mock('@/lib/spring-boot-api', () => ({
    apiFetch: vi.fn(),
}));

const mockApiFetch = vi.mocked(apiFetch);

function okResponse() {
    return {
        ok: true,
        status: 200,
        json: async () => ({ data: {} }),
    } as unknown as Response;
}

describe('executeTool allowlist', () => {
    beforeEach(() => {
        mockApiFetch.mockReset();
    });

    describe('rejects admin / out-of-scope GET routes', () => {
        it('rejects GET /roles/all without calling apiFetch', async () => {
            // Act
            const result = await executeTool('call_hris_api', {
                method: 'GET',
                path: '/roles/all',
            });

            // Assert
            expect(result).toContain('is not allowed');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });

        it('rejects GET /permissions/all without calling apiFetch', async () => {
            // Act
            const result = await executeTool('call_hris_api', {
                method: 'GET',
                path: '/permissions/all',
            });

            // Assert
            expect(result).toContain('is not allowed');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });

        it('rejects GET /dashboard/admin without calling apiFetch', async () => {
            // Act
            const result = await executeTool('call_hris_api', {
                method: 'GET',
                path: '/dashboard/admin',
            });

            // Assert
            expect(result).toContain('is not allowed');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });

        it('rejects bare GET /users?page=0&size=10 without calling apiFetch', async () => {
            // Act
            const result = await executeTool('call_hris_api', {
                method: 'GET',
                path: '/users?page=0&size=10',
            });

            // Assert
            expect(result).toContain('is not allowed');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });
    });

    describe('allows self-service GET routes', () => {
        it('allows GET /users/me and calls apiFetch', async () => {
            // Arrange
            mockApiFetch.mockResolvedValue(okResponse());

            // Act
            await executeTool('call_hris_api', {
                method: 'GET',
                path: '/users/me',
            });

            // Assert
            expect(mockApiFetch).toHaveBeenCalledWith(
                '/users/me',
                expect.objectContaining({ method: 'GET' }),
            );
        });

        it('allows GET /dashboard/my and calls apiFetch', async () => {
            // Arrange
            mockApiFetch.mockResolvedValue(okResponse());

            // Act
            await executeTool('call_hris_api', {
                method: 'GET',
                path: '/dashboard/my',
            });

            // Assert
            expect(mockApiFetch).toHaveBeenCalledWith(
                '/dashboard/my',
                expect.objectContaining({ method: 'GET' }),
            );
        });
    });
});
