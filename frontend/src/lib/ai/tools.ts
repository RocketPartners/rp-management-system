/**
 * HRIS Tool definitions for Claude AI assistant.
 * Each tool maps to a real HRIS API endpoint.
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
        name: 'list_my_leaves',
        description: 'List the current user\'s leave applications. Returns their recent leave requests with status, dates, and type.',
        input_schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    description: 'Filter by status: pending_manager, pending_hr, approved, rejected_by_manager, rejected_by_hr, cancelled',
                    enum: ['pending_manager', 'pending_hr', 'approved', 'rejected_by_manager', 'rejected_by_hr', 'cancelled'],
                },
            },
        },
    },
    {
        name: 'create_leave_application',
        description: 'Create/apply for a new leave request for the current user. Requires leave type, start date, end date, and reason.',
        input_schema: {
            type: 'object',
            properties: {
                leaveTypeId: { type: 'number', description: 'ID of the leave type. Use list_leave_types first to find the correct ID.' },
                startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
                endDate: { type: 'string', description: 'End date in YYYY-MM-DD format' },
                reason: { type: 'string', description: 'Reason for the leave' },
            },
            required: ['leaveTypeId', 'startDate', 'endDate', 'reason'],
        },
    },
    {
        name: 'list_leave_types',
        description: 'List all available leave types (Vacation, Sick Leave, etc.) with their IDs and available days per year.',
        input_schema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'get_my_leave_balances',
        description: 'Get the current user\'s leave balances showing remaining days for each leave type.',
        input_schema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'list_team_members',
        description: 'List all teams and their members.',
        input_schema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'create_team',
        description: 'Create a new team. Requires a name and optionally a description and leader ID.',
        input_schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Team name' },
                description: { type: 'string', description: 'Team description' },
                leaderId: { type: 'number', description: 'User ID of the team leader' },
            },
            required: ['name'],
        },
    },
    {
        name: 'search_users',
        description: 'Search for employees/users by name or email.',
        input_schema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search query (name or email)' },
            },
            required: ['query'],
        },
    },
    {
        name: 'get_my_profile',
        description: 'Get the current user\'s profile information.',
        input_schema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'list_announcements',
        description: 'List recent company announcements.',
        input_schema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'create_announcement',
        description: 'Create a new company announcement. Requires title and content.',
        input_schema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Announcement title' },
                content: { type: 'string', description: 'Announcement content (can include rich text)' },
                priority: { type: 'string', description: 'Priority: low, normal, high, urgent', enum: ['low', 'normal', 'high', 'urgent'] },
            },
            required: ['title', 'content'],
        },
    },
    {
        name: 'list_holidays',
        description: 'List upcoming public holidays.',
        input_schema: {
            type: 'object',
            properties: {
                year: { type: 'number', description: 'Year to query (default: current year)' },
            },
        },
    },
    {
        name: 'get_my_assets',
        description: 'List assets/equipment currently assigned to the current user.',
        input_schema: {
            type: 'object',
            properties: {},
        },
    },
    {
        name: 'create_support_ticket',
        description: 'Create a new support/IT ticket.',
        input_schema: {
            type: 'object',
            properties: {
                subject: { type: 'string', description: 'Ticket subject/title' },
                description: { type: 'string', description: 'Detailed description of the issue' },
                priority: { type: 'string', description: 'Priority: LOW, MEDIUM, HIGH, URGENT', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
                category: { type: 'string', description: 'Category: IT, HR, FACILITIES, OTHER', enum: ['IT', 'HR', 'FACILITIES', 'OTHER'] },
            },
            required: ['subject', 'description'],
        },
    },
    {
        name: 'get_dashboard',
        description: 'Get dashboard overview with stats (leave balances, upcoming holidays, team info, etc.).',
        input_schema: {
            type: 'object',
            properties: {},
        },
    },
];
