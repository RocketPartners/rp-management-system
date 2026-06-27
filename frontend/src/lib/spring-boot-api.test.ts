import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getAccessToken,
    login,
    loginWithGoogle,
    logout,
    refreshAccessToken,
} from '@/lib/spring-boot-api';

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
    beforeEach(async () => {
        vi.stubGlobal('localStorage', createLocalStorageStub());
        // The access token is module-level state shared across imports; reset it
        // between tests via logout so each case starts unauthenticated.
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
        await logout();
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

    it('login throws with the backend message when the response is not ok', async () => {
        // Arrange
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ status: 'error', message: 'Invalid credentials' }),
        });
        vi.stubGlobal('fetch', fetchMock);

        // Act + Assert
        await expect(login('user@example.com', 'wrong-password')).rejects.toThrow(
            'Invalid credentials',
        );
        expect(getAccessToken()).toBeNull();
    });

    it('login throws when status is not success even if the HTTP status is ok', async () => {
        // Arrange
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'error', message: 'Account locked' }),
        });
        vi.stubGlobal('fetch', fetchMock);

        // Act + Assert
        await expect(login('user@example.com', 'password')).rejects.toThrow('Account locked');
        expect(getAccessToken()).toBeNull();
    });

    it('loginWithGoogle stores the access token in memory on success', async () => {
        // Arrange
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                status: 'success',
                data: { accessToken: 'google-access-token', expiresIn: 900000 },
            }),
        });
        vi.stubGlobal('fetch', fetchMock);

        // Act
        await loginWithGoogle('google-id-token');

        // Assert
        expect(getAccessToken()).toBe('google-access-token');
        expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('refreshAccessToken updates the in-memory token on success', async () => {
        // Arrange
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                status: 'success',
                data: { accessToken: 'refreshed-access-token', expiresIn: 900000 },
            }),
        });
        vi.stubGlobal('fetch', fetchMock);

        // Act
        await refreshAccessToken();

        // Assert
        expect(getAccessToken()).toBe('refreshed-access-token');
    });

    it('refreshAccessToken nullifies the token and throws on failure', async () => {
        // Arrange: first seed a valid token via a successful login
        const loginMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                status: 'success',
                data: { accessToken: 'soon-to-expire', expiresIn: 900000 },
            }),
        });
        vi.stubGlobal('fetch', loginMock);
        await login('user@example.com', 'password');
        expect(getAccessToken()).toBe('soon-to-expire');

        // Now the refresh endpoint rejects the cookie
        const refreshMock = vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ status: 'error', message: 'Token refresh failed' }),
        });
        vi.stubGlobal('fetch', refreshMock);

        // Act + Assert
        await expect(refreshAccessToken()).rejects.toThrow('Token refresh failed');
        expect(getAccessToken()).toBeNull();
    });

    it('logout clears the in-memory access token', async () => {
        // Arrange: seed a token via a successful login
        const loginMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                status: 'success',
                data: { accessToken: 'active-token', expiresIn: 900000 },
            }),
        });
        vi.stubGlobal('fetch', loginMock);
        await login('user@example.com', 'password');
        expect(getAccessToken()).toBe('active-token');

        // logout posts to the backend then clears the token
        const logoutMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
        vi.stubGlobal('fetch', logoutMock);

        // Act
        await logout();

        // Assert
        expect(getAccessToken()).toBeNull();
    });
});
