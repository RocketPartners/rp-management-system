import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;

// Helper: read CSRF token from meta tag
const getCsrfToken = () => {
    const meta = document.head.querySelector('meta[name="csrf-token"]');
    return meta ? meta.content : '';
};

// Helper: refresh the CSRF token by fetching a fresh one from the server
const refreshCsrfToken = async () => {
    try {
        const response = await fetch('/sanctum/csrf-cookie', {
            method: 'GET',
            credentials: 'same-origin',
        });

        if (response.ok) {
            // Also try to refresh the meta tag from a lightweight endpoint
            const tokenResponse = await fetch('/api/keepalive', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            // The XSRF-TOKEN cookie is now refreshed by the server response.
            // Axios will automatically pick it up on the next request.
            return true;
        }
    } catch (e) {
        // Ignore — we'll fall back to reload if retry also fails
    }
    return false;
};

// Set initial CSRF token from meta tag as fallback
const initialToken = getCsrfToken();
if (initialToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = initialToken;
}

// Interceptor: always attach the freshest meta tag token as fallback
window.axios.interceptors.request.use((config) => {
    const freshToken = getCsrfToken();
    if (freshToken) {
        config.headers['X-CSRF-TOKEN'] = freshToken;
    }
    return config;
});

// Interceptor: auto-retry once on 419 (CSRF token mismatch)
// Instead of showing a scary dialog, silently refresh the token and retry
window.axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 419 && !originalRequest._retried) {
            originalRequest._retried = true;

            const refreshed = await refreshCsrfToken();
            if (refreshed) {
                // Retry the original request — axios will pick up the new XSRF cookie
                return window.axios(originalRequest);
            }

            // If refresh failed, the session is truly dead — reload
            window.location.reload();
            return Promise.reject(error);
        }

        return Promise.reject(error);
    },
);

// Create API axios instance with the same auto-retry behavior
window.apiAxios = axios.create({
    baseURL: window.location.origin,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Same interceptors for apiAxios
window.apiAxios.interceptors.request.use((config) => {
    const freshToken = getCsrfToken();
    if (freshToken) {
        config.headers['X-CSRF-TOKEN'] = freshToken;
    }
    return config;
});

window.apiAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 419 && !originalRequest._retried) {
            originalRequest._retried = true;

            const refreshed = await refreshCsrfToken();
            if (refreshed) {
                return window.apiAxios(originalRequest);
            }

            window.location.reload();
            return Promise.reject(error);
        }

        return Promise.reject(error);
    },
);
