/**
 * Generic tool executor — calls HRIS API endpoints with safety guardrails.
 * Enforces an allowlist of safe method+path patterns to prevent
 * prompt injection and accidental destructive operations.
 */

import { apiFetch } from '@/lib/spring-boot-api';

// Allowlist of safe API operations the AI can perform
const ALLOWED_ROUTES: { method: string; pattern: RegExp }[] = [
    // Reads — all GET endpoints are safe
    { method: 'GET', pattern: /^\/(auth|users|leave-applications|leave-types|teams|announcements|holidays|calendar|wfh|asset-assignments|assets|asset-categories|tickets|dashboard|notifications|departments|positions|roles|permissions)\b/ },

    // Leave management — create and cancel own
    { method: 'POST', pattern: /^\/leave-applications$/ },
    { method: 'POST', pattern: /^\/leave-applications\/\d+\/cancel$/ },

    // WFH — schedule and cancel own
    { method: 'POST', pattern: /^\/wfh\/schedules$/ },
    { method: 'POST', pattern: /^\/wfh\/schedules\/\d+\/cancel$/ },

    // Announcements — react and comment
    { method: 'POST', pattern: /^\/announcements\/\d+\/reactions$/ },
    { method: 'POST', pattern: /^\/announcements\/\d+\/comments$/ },

    // Profile — update own
    { method: 'PATCH', pattern: /^\/users\/me$/ },

    // Notifications — mark as read
    { method: 'PATCH', pattern: /^\/notifications\/\d+\/read$/ },
    { method: 'PATCH', pattern: /^\/notifications\/read-all$/ },
];

function isAllowed(method: string, path: string): boolean {
    const cleanPath = path.split('?')[0]; // strip query params for matching
    return ALLOWED_ROUTES.some(r => r.method === method && r.pattern.test(cleanPath));
}

const MAX_RESPONSE_LENGTH = 8000;

export async function executeTool(
    toolName: string,
    toolInput: Record<string, any>,
): Promise<string> {
    if (toolName !== 'call_hris_api') {
        return `Unknown tool: ${toolName}`;
    }

    const { method, path, body } = toolInput;

    if (!method || !path) {
        return 'Error: method and path are required.';
    }

    // Normalize method to uppercase
    const normalizedMethod = method.toUpperCase();

    // Path validation — prevent traversal and SSRF
    if (!path.startsWith('/') || path.includes('..') || path.includes('//')) {
        return 'Error: invalid API path.';
    }

    // Allowlist check — block destructive or unauthorized operations
    if (!isAllowed(normalizedMethod, path)) {
        return `Error: ${normalizedMethod} ${path.split('?')[0]} is not allowed via the AI assistant. Please use the HRIS web UI for this action.`;
    }

    try {
        const options: RequestInit = { method: normalizedMethod };

        if (body && ['POST', 'PUT', 'PATCH'].includes(normalizedMethod)) {
            options.body = JSON.stringify(body);
        }

        const res = await apiFetch(path, options);

        if (!res.ok) {
            // Sanitize error response — only expose the message, not internals
            try {
                const errJson = await res.json();
                return `Error (${res.status}): ${errJson.message || 'Request failed'}`;
            } catch {
                return `Error (${res.status}): Request failed`;
            }
        }

        if (res.status === 204) {
            return 'Success (no content).';
        }

        const data = await res.json();
        const payload = data?.data ?? data;
        const json = JSON.stringify(payload, null, 2);

        // Truncate large responses to stay within token limits
        if (json.length > MAX_RESPONSE_LENGTH) {
            return json.slice(0, MAX_RESPONSE_LENGTH) + `\n... (truncated, ${json.length} chars total)`;
        }

        return json;
    } catch (error: any) {
        return `Error: ${error.message || 'Failed to call API'}`;
    }
}
