/**
 * Public API helper for the guest onboarding portal.
 * These endpoints are unauthenticated — access is authorized by invite token.
 */

const API_URL = import.meta.env.VITE_SPRING_BOOT_API_URL || 'http://localhost:8080/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
    const json = await res.json().catch(() => ({ message: 'Request failed' }));

    if (!res.ok) {
        throw new Error(json.message || `Request failed (${res.status})`);
    }

    return (json.data ?? json) as T;
}

export async function portalGet<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<T>(res);
}

export async function portalPost<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body != null ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
}

export async function portalPostFormData<T>(path: string, formData: FormData): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        body: formData,
    });
    return handleResponse<T>(res);
}

export async function portalDelete<T = void>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<T>(res);
}
