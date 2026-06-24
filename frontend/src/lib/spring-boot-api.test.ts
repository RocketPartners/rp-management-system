import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAccessToken, login } from '@/lib/spring-boot-api';

/**
 * Minimal in-memory localStorage probe. Node 26 leaves the global
 * `localStorage` undefined (needs --localstorage-file) and jsdom 29's shim is
 * unavailable, so we install a deterministic stub to verify that the auth code
 * never writes tokens to it.
 */
function createLocalStorageStub() {
    const store = new Map<string, string>();
    return {
        store,
        getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
        setItem: (key: string, value: string) => {
            store.set(key, String(value));
        },
        removeItem: (key: string) => {
            store.delete(key);
        },
        clear: () => {
            store.clear();
        },
    };
}

describe('spring-boot-api auth token handling', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', createLocalStorageStub());
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('login does not write refreshToken or accessToken to localStorage', async () => {
        // Arrange: backend returns access token in body, refresh token via httpOnly cookie only
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                status: 'success',
                data: { accessToken: 'in-memory-access-token', expiresIn: 900000 },
            }),
        });
        vi.stubGlobal('fetch', fetchMock);

        // Act
        await login('user@example.com', 'password');

        // Assert: nothing persisted to localStorage, token only lives in memory
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(getAccessToken()).toBe('in-memory-access-token');
    });
});
