import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Function to get fresh CSRF token
const getCsrfToken = () => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    return token ? token.content : '';
};

// Automatically include CSRF token in all requests
let token = getCsrfToken();
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    console.log('✅ Axios configured with CSRF token');
} else {
    console.error(
        '❌ CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token',
    );
}

// Intercept requests to always use fresh CSRF token
window.axios.interceptors.request.use((config) => {
    const freshToken = getCsrfToken();
    if (freshToken) {
        config.headers['X-CSRF-TOKEN'] = freshToken;
    }
    return config;
});

// Create a special axios instance for API requests that need credentials
window.apiAxios = axios.create({
    baseURL: window.location.origin,
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Also add interceptor for API axios
window.apiAxios.interceptors.request.use((config) => {
    const freshToken = getCsrfToken();
    if (freshToken) {
        config.headers['X-CSRF-TOKEN'] = freshToken;
    }
    return config;
});

console.log('✅ API Axios configured with credentials');
