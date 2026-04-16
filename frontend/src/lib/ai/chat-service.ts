/**
 * AI Chat Service — sends messages to Claude via our Spring Boot backend proxy.
 * Uses a single generic call_hris_api tool so Claude can call any HRIS endpoint.
 */

import { apiFetch } from '@/lib/spring-boot-api';
import { HRIS_TOOLS } from './tools';
import { executeTool } from './executor';

const MODEL = import.meta.env.VITE_AI_MODEL || 'us.anthropic.claude-sonnet-4-6';

function getSystemPrompt(): string {
    return `You are an AI assistant for the Rocket Partners HRIS (Human Resource Information System). You help employees with HR-related tasks by calling the HRIS API.

Today's date: ${new Date().toISOString().split('T')[0]}
Timezone: Asia/Manila (Philippine Time)

## Guidelines
- Be concise and helpful.
- ALWAYS show actual data returned by the API — never give vague summaries.
- Format data as clear bulleted/numbered lists with all relevant details.
- After calling the API and getting results, present the data in your text response. Do NOT call the same endpoint again.
- When creating leaves, always check available leave types first (GET /leave-types/active).
- Confirm details before creating or modifying anything.
- Format dates as YYYY-MM-DD.
- The API base path is already handled — just use paths like /leave-applications/my.
- For paginated responses, the data is in the "content" array with "totalElements", "totalPages", etc.
- Most list endpoints support ?page=0&size=10 query params.

## HRIS API Reference

### Authentication & Profile
- GET /auth/me — current user info
- GET /users/me — current user profile
- PATCH /users/me — update profile { firstName, lastName, phone, etc. }

### Leave Management
- GET /leave-types/active — list all active leave types with IDs
- GET /leave-applications/my?page=0&size=10 — my leave applications
- GET /leave-applications/my?status={status} — filter by: pending_manager, pending_hr, approved, rejected_by_manager, rejected_by_hr, cancelled
- POST /leave-applications — apply for leave { leaveTypeId, startDate, endDate, reason }
- POST /leave-applications/{id}/cancel — cancel a leave request
- GET /leave-applications/balances/my — my leave balances (remaining days per type)
- GET /leave-applications/pending-approvals — leaves pending my approval (managers only)
- POST /leave-applications/{id}/manager/approve — approve as manager
- POST /leave-applications/{id}/manager/reject — reject as manager { remarks }
- POST /leave-applications/{id}/hr/approve — approve as HR
- POST /leave-applications/{id}/hr/reject — reject as HR { remarks }

### Teams
- GET /teams/active — list active teams
- GET /teams?search=X&page=0&size=10 — search teams
- GET /teams/{id} — team details
- POST /teams — create team { name, description, leaderId }
- PUT /teams/{id} — update team
- DELETE /teams/{id} — delete team
- GET /teams/my-default-approver — get my default leave approver

### Users / Employees
- GET /users/search?search=john&page=0&size=10 — search users by name/email
- GET /users/{id} — user details
- GET /users?page=0&size=10 — list all users (admin)
- GET /users/pending-approvals — pending user approvals

### Announcements
- GET /announcements?page=0&size=10 — list announcements
- GET /announcements?category=COMPANY_NEWS&search=keyword — filter (categories: COMPANY_NEWS, EVENTS, FUN, HR_UPDATES, GENERAL)
- GET /announcements/{id} — announcement details with comments
- POST /announcements/{id}/reactions — react { reactionType: "LIKE"|"LOVE"|"CELEBRATE"|"LAUGH" }
- GET /announcements/{id}/comments — list comments
- POST /announcements/{id}/comments — add comment { body }

### Holidays
- GET /holidays?startDate=2026-01-01&endDate=2026-12-31 — list holidays in range
- GET /holidays/upcoming?limit=10 — upcoming holidays
- GET /holidays/countries — configured holiday countries

### Calendar
- GET /calendar/events?start=2026-04-01&end=2026-04-30 — calendar events (leaves, holidays, WFH)
- GET /calendar/event-types — available event types
- GET /calendar/statistics?start=2026-04-01&end=2026-04-30 — calendar stats
- GET /calendar/users-on-leave?date=2026-04-07 — who's on leave today

### WFH (Work From Home)
- GET /wfh/schedules?month=2026-04 — my WFH schedules for a month
- GET /wfh/weekly-usage — my WFH usage this week
- GET /wfh/monthly-stats?month=2026-04 — monthly WFH stats
- POST /wfh/schedules — schedule WFH { dates: ["2026-04-10"], reason }
- POST /wfh/schedules/{id}/cancel — cancel WFH

### Assets / Equipment
- GET /asset-assignments/my-assets — my assigned equipment
- GET /assets?page=0&size=20 — all assets (admin)
- GET /assets/{id} — asset details
- GET /asset-categories — asset categories
- GET /assets/dashboard-stats — asset statistics

### Support Tickets
- GET /tickets?page=0&size=20 — my tickets
- GET /tickets?status=OPEN&category=IT&priority=HIGH — filter tickets
- GET /tickets/{id} — ticket details with messages
- POST /tickets/{id}/messages — add message to ticket (use multipart: not supported via this tool, advise user to use the UI)

### Dashboard
- GET /dashboard/my — my dashboard (leave balances, upcoming holidays, recent activity)
- GET /dashboard/admin — admin dashboard (system stats)

### Notifications
- GET /notifications?page=0&size=20 — my notifications
- GET /notifications/unread-count — unread notification count
- PATCH /notifications/{id}/read — mark notification as read
- PATCH /notifications/read-all — mark all as read

### Departments
- GET /departments/active — active departments
- GET /departments/{id} — department details

### Positions
- GET /positions/active — active positions
- GET /positions/by-department/{deptId} — positions in a department

### Roles & Permissions (admin)
- GET /roles/all — all roles
- GET /permissions/all — all permissions

## Notes
- Multipart endpoints (creating announcements with images, creating tickets with attachments) are NOT supported via this tool. For those, advise the user to use the HRIS web UI directly.
- The API automatically authenticates as the current user. You cannot act as another user.
- If an endpoint returns 403, the user doesn't have permission for that action.
- If an endpoint returns 404, the resource doesn't exist.`;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    toolActions?: { tool: string; input: any; result: string }[];
    isLoading?: boolean;
}

interface AnthropicMessage {
    role: 'user' | 'assistant';
    content: any;
}

/**
 * Send a message and get AI response, handling tool use automatically.
 */
export async function sendChatMessage(
    userMessage: string,
    conversationHistory: ChatMessage[],
    onToolUse?: (toolName: string) => void,
    onTextDelta?: (text: string) => void,
): Promise<ChatMessage> {
    const messages: AnthropicMessage[] = conversationHistory
        .filter((m) => !m.isLoading)
        .map((m) => ({
            role: m.role,
            content: m.content,
        }));

    messages.push({ role: 'user', content: userMessage });

    const toolActions: { tool: string; input: any; result: string }[] = [];

    let currentMessages = [...messages];
    let maxIterations = 10;

    while (maxIterations > 0) {
        maxIterations--;

        // Use streaming for the call, passing onTextDelta for live text updates
        const response = await callClaudeStream(currentMessages, onTextDelta);

        const toolUseBlocks = response.content?.filter((b: any) => b.type === 'tool_use') || [];
        const textBlocks = response.content?.filter((b: any) => b.type === 'text') || [];

        if (toolUseBlocks.length === 0) {
            const text = textBlocks.map((b: any) => b.text).join('\n');
            return {
                role: 'assistant',
                content: text || 'I couldn\'t generate a response. Please try again.',
                toolActions: toolActions.length > 0 ? toolActions : undefined,
            };
        }

        // Tool use detected — execute tools (text streamed so far will be partial)
        const toolResults: any[] = [];
        for (const toolBlock of toolUseBlocks) {
            const label = toolBlock.input?.method && toolBlock.input?.path
                ? `${toolBlock.input.method} ${toolBlock.input.path.split('?')[0]}`
                : toolBlock.name;
            onToolUse?.(label);

            const result = await executeTool(toolBlock.name, toolBlock.input);
            toolActions.push({
                tool: label,
                input: toolBlock.input,
                result,
            });

            toolResults.push({
                type: 'tool_result',
                tool_use_id: toolBlock.id,
                content: result,
            });
        }

        currentMessages.push({
            role: 'assistant',
            content: response.content,
        });
        currentMessages.push({
            role: 'user',
            content: toolResults,
        });
    }

    return {
        role: 'assistant',
        content: 'I took too many steps trying to complete your request. Please try a simpler question.',
        toolActions,
    };
}

/**
 * Streaming call to /ai/chat/stream — processes SSE events.
 * Calls onTextDelta for each text chunk so the UI can update progressively.
 */
async function callClaudeStream(
    messages: AnthropicMessage[],
    onTextDelta?: (text: string) => void,
): Promise<any> {
    const res = await apiFetch('/ai/chat/stream', {
        method: 'POST',
        body: JSON.stringify({
            model: MODEL,
            max_tokens: 4096,
            system: getSystemPrompt(),
            tools: HRIS_TOOLS,
            messages,
        }),
    });

    if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`AI request failed (${res.status}): ${errorText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    const content: any[] = [];
    let currentTextBlock: { type: string; text: string } | null = null;
    let currentToolBlock: any | null = null;
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // keep incomplete last line

        let eventType = '';
        for (const line of lines) {
            if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (eventType === 'error') {
                    try {
                        const err = JSON.parse(data);
                        throw new Error(err.error || 'Stream error');
                    } catch (e) {
                        if (e instanceof Error && e.message !== 'Stream error') throw e;
                        throw new Error('Stream error');
                    }
                }
                if (eventType === 'done') continue;

                try {
                    const event = JSON.parse(data);

                    switch (event.type) {
                        case 'content_block_start':
                            if (event.content_block?.type === 'text') {
                                currentTextBlock = { type: 'text', text: '' };
                            } else if (event.content_block?.type === 'tool_use') {
                                currentToolBlock = {
                                    type: 'tool_use',
                                    id: event.content_block.id,
                                    name: event.content_block.name,
                                    input: '',
                                };
                            }
                            break;

                        case 'content_block_delta':
                            if (event.delta?.type === 'text_delta' && currentTextBlock) {
                                currentTextBlock.text += event.delta.text;
                                onTextDelta?.(event.delta.text);
                            } else if (event.delta?.type === 'input_json_delta' && currentToolBlock) {
                                currentToolBlock.input += event.delta.partial_json;
                            }
                            break;

                        case 'content_block_stop':
                            if (currentTextBlock) {
                                content.push(currentTextBlock);
                                currentTextBlock = null;
                            } else if (currentToolBlock) {
                                try {
                                    currentToolBlock.input = JSON.parse(currentToolBlock.input);
                                } catch {
                                    currentToolBlock.input = {};
                                }
                                content.push(currentToolBlock);
                                currentToolBlock = null;
                            }
                            break;
                    }
                } catch {
                    // skip unparseable events
                }
            }
        }
    }

    return { content };
}
