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

export async function refreshAccessToken() {
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
}

export async function logout() {
    if (refreshToken) {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
