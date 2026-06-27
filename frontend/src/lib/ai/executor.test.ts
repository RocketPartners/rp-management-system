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

    describe('rejects unknown tools and missing input', () => {
        it('returns Unknown tool for a non-call_hris_api tool name', async () => {
            // Act
            const result = await executeTool('other_tool', {
                method: 'GET',
                path: '/users/me',
            });

            // Assert
            expect(result).toBe('Unknown tool: other_tool');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });

        it('errors when method is missing', async () => {
            // Act
            const result = await executeTool('call_hris_api', {
                path: '/users/me',
            });

            // Assert
            expect(result).toBe('Error: method and path are required.');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });

        it('errors when path is missing', async () => {
            // Act
            const result = await executeTool('call_hris_api', {
                method: 'GET',
            });

            // Assert
            expect(result).toBe('Error: method and path are required.');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });
    });

    describe('rejects malformed / traversal paths', () => {
        it('rejects a path that does not start with a slash', async () => {
            // Act
            const result = await executeTool('call_hris_api', {
                method: 'GET',
                path: 'users/me',
            });

            // Assert
            expect(result).toBe('Error: invalid API path.');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });

        it('rejects a path-traversal attempt (..)', async () => {
            // Act
            const result = await executeTool('call_hris_api', {
                method: 'GET',
                path: '/../etc/passwd',
            });

            // Assert
            expect(result).toBe('Error: invalid API path.');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });

        it('rejects a double-slash (protocol-relative) path', async () => {
            // Act
            const result = await executeTool('call_hris_api', {
                method: 'GET',
                path: '//evil.com',
            });

            // Assert
            expect(result).toBe('Error: invalid API path.');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });
    });

    describe('mutating routes (allow + reject)', () => {
        it('allows POST /leave-applications and forwards a JSON body', async () => {
            // Arrange
            mockApiFetch.mockResolvedValue(okResponse());

            // Act
            await executeTool('call_hris_api', {
                method: 'POST',
                path: '/leave-applications',
                body: { leaveTypeId: 1, reason: 'vacation' },
            });

            // Assert
            expect(mockApiFetch).toHaveBeenCalledWith(
                '/leave-applications',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ leaveTypeId: 1, reason: 'vacation' }),
                }),
            );
        });

        it('lowercases the method before matching the allowlist', async () => {
            // Arrange
            mockApiFetch.mockResolvedValue(okResponse());

            // Act
            await executeTool('call_hris_api', {
                method: 'post',
                path: '/leave-applications',
            });

            // Assert
            expect(mockApiFetch).toHaveBeenCalledWith(
                '/leave-applications',
                expect.objectContaining({ method: 'POST' }),
            );
        });

        it('rejects DELETE on an otherwise-readable path', async () => {
            // Act
            const result = await executeTool('call_hris_api', {
                method: 'DELETE',
                path: '/leave-applications/5',
            });

            // Assert
            expect(result).toContain('is not allowed');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });

        it('rejects PUT on an allowlisted POST path', async () => {
            // Act
            const result = await executeTool('call_hris_api', {
                method: 'PUT',
                path: '/leave-applications',
            });

            // Assert
            expect(result).toContain('is not allowed');
            expect(mockApiFetch).not.toHaveBeenCalled();
        });
    });
});
