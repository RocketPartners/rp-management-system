/**
 * Tool executor — maps AI tool calls to real HRIS API calls.
 */

import { apiGet, apiPost, apiPostFormData } from '@/lib/spring-boot-api';

export async function executeTool(
    toolName: string,
    toolInput: Record<string, any>,
): Promise<string> {
    try {
        switch (toolName) {
            case 'list_my_leaves': {
                const params = new URLSearchParams({ page: '0', size: '10' });
                if (toolInput.status) params.set('status', toolInput.status);
                const data = await apiGet<any>(`/leave-applications/my?${params}`);
                const leaves = data?.content || [];
                if (leaves.length === 0) return 'You have no leave applications.';
                return leaves.map((l: any) =>
                    `- ${l.leaveTypeName}: ${l.startDate} to ${l.endDate} (${l.totalDays} days) — Status: ${l.statusLabel || l.status}`
                ).join('\n');
            }

            case 'create_leave_application': {
                const result = await apiPost<any>('/leave-applications', {
                    leaveTypeId: toolInput.leaveTypeId,
                    startDate: toolInput.startDate,
                    endDate: toolInput.endDate,
                    reason: toolInput.reason,
                });
                return `Leave application created successfully! ID: ${result.id}, Type: ${result.leaveTypeName}, Dates: ${result.startDate} to ${result.endDate}, Status: ${result.statusLabel || result.status}`;
            }

            case 'list_leave_types': {
                const data = await apiGet<any>('/leave-types/active');
                const types = Array.isArray(data) ? data : data?.content || [];
                if (types.length === 0) return 'No leave types configured.';
                return types.map((t: any) =>
                    `- [ID: ${t.id}] ${t.name} (${t.code}) — ${t.defaultDaysPerYear} days/year, ${t.isPaid ? 'Paid' : 'Unpaid'}`
                ).join('\n');
            }

            case 'get_my_leave_balances': {
                const data = await apiGet<any>('/leave-applications/balances/my');
                const balances = Array.isArray(data) ? data : [];
                if (balances.length === 0) return 'No leave balances found. They may need to be initialized by HR.';
                return balances.map((b: any) =>
                    `- ${b.leaveTypeName}: ${b.remainingDays} remaining / ${b.totalDays} total (${b.usedDays} used, ${b.pendingDays} pending)`
                ).join('\n');
            }

            case 'list_team_members': {
                const data = await apiGet<any>('/teams/active');
                const teams = Array.isArray(data) ? data : data?.content || [];
                if (teams.length === 0) return 'No teams found.';
                return teams.map((t: any) =>
                    `- ${t.name}${t.leaderName ? ` (Leader: ${t.leaderName})` : ''} — ${t.memberCount || 0} members`
                ).join('\n');
            }

            case 'create_team': {
                const result = await apiPost<any>('/teams', {
                    name: toolInput.name,
                    description: toolInput.description || '',
                    leaderId: toolInput.leaderId || null,
                });
                return `Team "${result.name}" created successfully! ID: ${result.id}`;
            }

            case 'search_users': {
                const data = await apiGet<any>(`/users/search?query=${encodeURIComponent(toolInput.query)}&page=0&size=10`);
                const users = data?.content || [];
                if (users.length === 0) return `No users found matching "${toolInput.query}".`;
                return users.map((u: any) =>
                    `- [ID: ${u.id}] ${u.name || u.firstName + ' ' + u.lastName} — ${u.email}${u.position ? `, ${u.position}` : ''}`
                ).join('\n');
            }

            case 'get_my_profile': {
                const data = await apiGet<any>('/auth/me');
                return `Name: ${data.name || data.firstName + ' ' + data.lastName}\nEmail: ${data.email}\nPosition: ${data.position || 'N/A'}\nDepartment: ${data.department || 'N/A'}`;
            }

            case 'list_announcements': {
                const data = await apiGet<any>('/announcements?page=0&size=5');
                const items = data?.content || [];
                if (items.length === 0) return 'No recent announcements.';
                return items.map((a: any) =>
                    `- ${a.title} (${new Date(a.createdAt).toLocaleDateString()})${a.priority !== 'normal' ? ` [${a.priority.toUpperCase()}]` : ''}`
                ).join('\n');
            }

            case 'create_announcement': {
                const formData = new FormData();
                formData.append('title', toolInput.title);
                formData.append('content', toolInput.content);
                formData.append('priority', toolInput.priority || 'normal');
                const result = await apiPostFormData<any>('/announcements', formData);
                return `Announcement "${result.title}" created successfully!`;
            }

            case 'list_holidays': {
                const year = toolInput.year || new Date().getFullYear();
                const startDate = `${year}-01-01`;
                const endDate = `${year}-12-31`;
                const data = await apiGet<any>(`/holidays?startDate=${startDate}&endDate=${endDate}`);
                const holidays = Array.isArray(data) ? data : [];
                if (holidays.length === 0) return `No holidays found for ${year}.`;
                return holidays.slice(0, 20).map((h: any) =>
                    `- ${h.date} — ${h.name} (${h.countryCode})`
                ).join('\n');
            }

            case 'get_my_assets': {
                const data = await apiGet<any>('/asset-assignments/my-assets');
                const assets = Array.isArray(data) ? data : [];
                if (assets.length === 0) return 'You have no assets currently assigned to you.';
                return assets.map((a: any) =>
                    `- ${a.assetName} (Tag: ${a.assetTag}) — ${a.categoryName || 'N/A'}, Checked out: ${new Date(a.checkedOutAt).toLocaleDateString()}`
                ).join('\n');
            }

            case 'create_support_ticket': {
                const formData = new FormData();
                formData.append('subject', toolInput.subject);
                formData.append('description', toolInput.description);
                formData.append('priority', toolInput.priority || 'MEDIUM');
                formData.append('category', toolInput.category || 'IT');
                const result = await apiPostFormData<any>('/tickets', formData);
                return `Support ticket created! ID: ${result.id}, Subject: "${result.subject}", Status: ${result.status}`;
            }

            case 'get_dashboard': {
                const data = await apiGet<any>('/dashboard/my');
                return JSON.stringify(data, null, 2);
            }

            default:
                return `Unknown tool: ${toolName}`;
        }
    } catch (error: any) {
        return `Error: ${error.message || 'Failed to execute action'}`;
    }
}
