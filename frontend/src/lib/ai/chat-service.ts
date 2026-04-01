/**
 * AI Chat Service — sends messages to Claude via our Spring Boot backend proxy.
 * The backend proxies to LaunchCode Bedrock gateway (avoids CORS issues).
 * Handles tool use loop: user message -> Claude -> tool calls -> results -> final response.
 */

import { apiFetch } from '@/lib/spring-boot-api';
import { HRIS_TOOLS } from './tools';
import { executeTool } from './executor';

const MODEL = import.meta.env.VITE_AI_MODEL || 'anthropic.claude-3-haiku-20240307-v1:0';

const SYSTEM_PROMPT = `You are an AI assistant for the Rocket Partners HRIS (Human Resource Information System). You help employees with HR-related tasks.

You can:
- Look up and create leave applications (vacation, sick leave, etc.)
- Check leave balances
- Search for employees
- View and create teams
- Post announcements
- Check upcoming holidays
- View assigned assets/equipment
- Create support tickets
- View dashboard information

Guidelines:
- Be concise and helpful
- ALWAYS show the actual data returned by tools to the user — never give a vague summary
- When listing data (balances, leaves, holidays, etc.), format it as a clear bulleted list with all details
- After calling a tool and getting results, ALWAYS respond with the data in your text response. Do NOT call the same tool again.
- When creating leaves, always check available leave types first using list_leave_types
- Confirm details before creating/modifying anything
- Format dates as YYYY-MM-DD
- If unsure about a leave type ID, look it up first
- Use the user's timezone (Asia/Manila / Philippine Time)
- Today's date is ${new Date().toISOString().split('T')[0]}`;

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
): Promise<ChatMessage> {
    // Build messages for the API
    const messages: AnthropicMessage[] = conversationHistory
        .filter((m) => !m.isLoading)
        .map((m) => ({
            role: m.role,
            content: m.content,
        }));

    // Add the new user message
    messages.push({ role: 'user', content: userMessage });

    const toolActions: { tool: string; input: any; result: string }[] = [];

    // Tool use loop — keep calling until Claude gives a final text response
    let currentMessages = [...messages];
    let maxIterations = 5;

    while (maxIterations > 0) {
        maxIterations--;

        const response = await callClaude(currentMessages);

        // Check if response has tool_use
        const toolUseBlocks = response.content?.filter((b: any) => b.type === 'tool_use') || [];
        const textBlocks = response.content?.filter((b: any) => b.type === 'text') || [];

        if (toolUseBlocks.length === 0) {
            // No tool use — return the text response
            const text = textBlocks.map((b: any) => b.text).join('\n');
            return {
                role: 'assistant',
                content: text || 'I couldn\'t generate a response. Please try again.',
                toolActions: toolActions.length > 0 ? toolActions : undefined,
            };
        }

        // Execute all tool calls
        const toolResults: any[] = [];
        for (const toolBlock of toolUseBlocks) {
            onToolUse?.(toolBlock.name);

            const result = await executeTool(toolBlock.name, toolBlock.input);
            toolActions.push({
                tool: toolBlock.name,
                input: toolBlock.input,
                result,
            });

            toolResults.push({
                type: 'tool_result',
                tool_use_id: toolBlock.id,
                content: result,
            });
        }

        // Add assistant message with tool use + user message with tool results
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
 * Calls Claude via our Spring Boot backend proxy at /ai/chat.
 * The backend adds the API key and forwards to LaunchCode.
 */
async function callClaude(messages: AnthropicMessage[]): Promise<any> {
    const res = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
            model: MODEL,
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            tools: HRIS_TOOLS,
            messages,
        }),
    });

    if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`AI request failed (${res.status}): ${errorText}`);
    }

    return res.json();
}
