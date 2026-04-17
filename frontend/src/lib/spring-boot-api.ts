const API_URL = import.meta.env.VITE_SPRING_BOOT_API_URL || 'http://localhost:8080/api/v1';

let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');
let tokenExpiry: number | null = null;

function persistTokens() {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    else localStorage.removeItem('accessToken');
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    else localStorage.removeItem('refreshToken');
}

export function getAccessToken() {
    return accessToken;
}

export function isAuthenticated() {
    return !!accessToken;
}

export async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || 'Login failed');
    }

    accessToken = json.data.accessToken;
    refreshToken = json.data.refreshToken;
    tokenExpiry = Date.now() + json.data.expiresIn - 30000;
    persistTokens();

    return json.data;
}

export async function loginWithGoogle(idToken: string) {
    const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    const json = await res.json();

    if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || 'Google login failed');
    }

    accessToken = json.data.accessToken;
    refreshToken = json.data.refreshToken;
    tokenExpiry = Date.now() + json.data.expiresIn - 30000;
    persistTokens();

    return json.data;
}

interface TokenData {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

let refreshPromise: Promise<TokenData> | null = null;

export async function refreshAccessToken() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        if (!refreshToken) throw new Error('No refresh token');

        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        const json = await res.json();

        if (!res.ok || json.status !== 'success') {
            accessToken = null;
            refreshToken = null;
            tokenExpiry = null;
            persistTokens();
            throw new Error('Token refresh failed');
        }

        accessToken = json.data.accessToken;
        refreshToken = json.data.refreshToken;
        tokenExpiry = Date.now() + json.data.expiresIn - 30000;
        persistTokens();

        return json.data;
    })().finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
}

export async function logout() {
    if (refreshToken) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
    }

    accessToken = null;
    refreshToken = null;
    tokenExpiry = null;
    persistTokens();
}

export async function apiFetch(path: string, options: RequestInit = {}) {
    if (!accessToken) throw new Error('Not authenticated');

    if (tokenExpiry && Date.now() >= tokenExpiry) {
        await refreshAccessToken();
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            ...options.headers,
        },
    });

    if (res.status === 401) {
        try {
            await refreshAccessToken();
            return fetch(`${API_URL}${path}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                    ...options.headers,
                },
            });
        } catch {
            accessToken = null;
            refreshToken = null;
            tokenExpiry = null;
            persistTokens();
            throw new Error('Session expired');
        }
    }

    return res;
}

// ---- Typed fetch helpers for TanStack Query ----

export async function apiGet<T>(path: string): Promise<T> {
    const res = await apiFetch(path);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    const json = await res.json();
    return (json.data ?? json) as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
    const res = await apiFetch(path, {
        method: 'POST',
        body: body != null ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    const json = await res.json();
    return (json.data ?? json) as T;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
    const res = await apiFetch(path, {
        method: 'PUT',
        body: body != null ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    const json = await res.json();
    return (json.data ?? json) as T;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
    const res = await apiFetch(path, {
        method: 'PATCH',
        body: body != null ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    const json = await res.json();
    return (json.data ?? json) as T;
}

export async function apiDelete<T = void>(path: string): Promise<T> {
    const res = await apiFetch(path, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    if (res.status === 204) return undefined as T;
    const json = await res.json();
    return (json.data ?? json) as T;
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
    if (!accessToken) throw new Error('Not authenticated');

    if (tokenExpiry && Date.now() >= tokenExpiry) {
        await refreshAccessToken();
    }

    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });

    if (res.status === 401) {
        try {
            await refreshAccessToken();
            const retryRes = await fetch(`${API_URL}${path}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });
            if (!retryRes.ok) {
                const err = await retryRes.json().catch(() => ({ message: 'Request failed' }));
                throw new Error(err.message || `Request failed (${retryRes.status})`);
            }
            const json = await retryRes.json();
            return (json.data ?? json) as T;
        } catch {
            accessToken = null;
            refreshToken = null;
            tokenExpiry = null;
            persistTokens();
            throw new Error('Session expired');
        }
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `Request failed (${res.status})`);
    }
    const json = await res.json();
    return (json.data ?? json) as T;
}
