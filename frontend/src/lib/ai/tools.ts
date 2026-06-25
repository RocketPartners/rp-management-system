/**
 * Single generic HRIS API tool — Claude decides which endpoint to call
 * based on the API reference in the system prompt.
 */

export interface Tool {
    name: string;
    description: string;
    input_schema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}

export const HRIS_TOOLS: Tool[] = [
    {
        name: 'call_hris_api',
        description:
            'Call a self-service HRIS API endpoint scoped to the current employee. Use the API reference in the system prompt to pick the right method, path, and body. The request is authenticated automatically with the current user\'s token. Admin-only surfaces (roles, permissions, the admin dashboard, and listing all users) are NOT available through this tool — direct the user to the HRIS web UI for those.',
        input_schema: {
            type: 'object',
            properties: {
                method: {
                    type: 'string',
                    description: 'HTTP method',
                    enum: ['GET', 'POST', 'PUT', 'PATCH'],
                },
                path: {
                    type: 'string',
                    description:
                        'API path WITHOUT the base URL. Example: /leave-applications/my?page=0&size=10',
                },
                body: {
                    type: 'object',
                    description:
                        'JSON request body (for POST/PUT/PATCH). Omit for GET/DELETE.',
                },
            },
            required: ['method', 'path'],
        },
    },
];
