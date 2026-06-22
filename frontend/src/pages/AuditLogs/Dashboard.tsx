import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    Activity,
    AlertTriangle,
    Clock,
    Database,
    Cpu,
    ScrollText,
    Server,
    ShieldAlert,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { apiGet } from '@/lib/spring-boot-api';
import type { AuditStatsResponse } from '@/types';

interface SystemHealthResponse {
    status: string;
    jvm: { heapUsedMb: number; heapMaxMb: number; heapUsagePercent: number; nonHeapUsedMb: number; availableProcessors: number };
    database: { status: string; activeConnections: number; totalConnections: number; maxConnections: number };
    uptimeSeconds: number;
}

const SEVERITY_COLORS: Record<string, string> = {
    INFO: '#3b82f6',
    WARN: '#f59e0b',
    ERROR: '#ef4444',
    CRITICAL: '#7c3aed',
};

function formatTs(iso: string): string {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatUptime(seconds: number): string {
    if (seconds >= 86400) return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 60)}m`;
}

function formatDuration(minutes: number | null): string {
    if (minutes == null) return '—';
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

// Grafana-style tooltip
const CustomTooltip = ({ contentStyle, ...props }: any) => (
    <Tooltip
        {...props}
        contentStyle={{
            background: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: '12px',
            padding: '8px 12px',
            ...contentStyle,
        }}
        labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
    />
);

export default function AuditDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(sevenDaysAgo);
    const [endDate, setEndDate] = useState(today);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['audit-stats', { startDate, endDate }],
        queryFn: () => {
            const params = new URLSearchParams();
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
            return apiGet<AuditStatsResponse>(`/audit-logs/stats?${params}`);
        },
    });

    const { data: health } = useQuery({
        queryKey: ['system-health'],
        queryFn: () => apiGet<SystemHealthResponse>('/audit-logs/system-health'),
        refetchInterval: 30000,
    });

    const severityData = stats
        ? Object.entries(stats.severityBreakdown)
              .map(([name, value]) => ({ name, value, color: SEVERITY_COLORS[name] || '#6b7280' }))
              .filter((d) => d.value > 0)
        : [];

    const topEndpointData = (stats?.topEndpoints || []).map((e) => ({
        ...e,
        name: e.endpoint.replace('/api/v1', ''),
    }));

    return (
        <>
            <Helmet><title>Audit Dashboard | HRIS</title></Helmet>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Audit Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-500">System monitoring and activity analytics</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
                                <span className="text-xs font-medium text-gray-400">Range</span>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 w-[130px] border-0 p-0 text-xs shadow-none" />
                                <span className="text-gray-300">–</span>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 w-[130px] border-0 p-0 text-xs shadow-none" />
                            </div>
                            <Link to="/audit-logs">
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                    <ScrollText className="h-3.5 w-3.5" /> View Logs
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <StatCard title="Total Events" value={stats?.summaryCards.totalToday} icon={Activity} color="blue" loading={isLoading} />
                        <StatCard title="Errors Today" value={stats?.summaryCards.errorsToday} icon={AlertTriangle} color="red" loading={isLoading} />
                        <StatCard title="Critical" value={stats?.summaryCards.criticalToday} icon={ShieldAlert} color="purple" loading={isLoading} />
                        <StatCard title="Active Users" value={stats?.summaryCards.activeUsersToday} icon={Users} color="green" loading={isLoading} />
                    </div>

                    {/* System Health */}
                    {health && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Panel title="JVM Memory" icon={<Cpu className="h-3.5 w-3.5" />} badge={`${health.jvm.heapUsagePercent}%`} badgeColor={health.jvm.heapUsagePercent > 80 ? 'red' : 'green'}>
                                <Progress value={health.jvm.heapUsagePercent} className="mb-2 h-2" />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{health.jvm.heapUsedMb} MB used</span>
                                    <span>{health.jvm.heapMaxMb} MB max</span>
                                </div>
                            </Panel>
                            <Panel title="Database" icon={<Database className="h-3.5 w-3.5" />} badge={health.database.status} badgeColor={health.database.status === 'UP' ? 'green' : 'red'}>
                                <Progress value={(health.database.activeConnections / health.database.maxConnections) * 100} className="mb-2 h-2" />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{health.database.activeConnections} active</span>
                                    <span>{health.database.maxConnections} max</span>
                                </div>
                            </Panel>
                            <Panel title="System" icon={<Server className="h-3.5 w-3.5" />} badge={health.status} badgeColor="green">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-gray-900">{formatUptime(health.uptimeSeconds)}</span>
                                    <span className="text-xs text-gray-400">uptime</span>
                                </div>
                                <div className="mt-1 text-xs text-gray-500">{health.jvm.availableProcessors} CPUs | Non-heap: {health.jvm.nonHeapUsedMb} MB</div>
                            </Panel>
                        </div>
                    )}

                    {/* Row 1: Activity + Errors (full width area charts) */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <ChartPanel title="Activity Over Time" loading={isLoading}>
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={stats?.activityOverTime || []}>
                                    <defs>
                                        <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="timestamp" tickFormatter={formatTs} fontSize={10} stroke="#9ca3af" />
                                    <YAxis fontSize={10} stroke="#9ca3af" />
                                    <CustomTooltip labelFormatter={formatTs} formatter={(v: number) => [v, 'Events']} />
                                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#activityGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartPanel>

                        <ChartPanel title="Error Rate" loading={isLoading}>
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={stats?.errorRateOverTime || []}>
                                    <defs>
                                        <linearGradient id="err4xxGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="err5xxGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="timestamp" tickFormatter={formatTs} fontSize={10} stroke="#9ca3af" />
                                    <YAxis fontSize={10} stroke="#9ca3af" />
                                    <CustomTooltip labelFormatter={formatTs} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                                    <Area type="monotone" dataKey="count4xx" name="4xx Client" stroke="#f59e0b" strokeWidth={2} fill="url(#err4xxGrad)" />
                                    <Area type="monotone" dataKey="count5xx" name="5xx Server" stroke="#ef4444" strokeWidth={2} fill="url(#err5xxGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartPanel>
                    </div>

                    {/* Row 2: Most Used APIs (area) + Severity (donut) */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <ChartPanel title="Most Used APIs" loading={isLoading}>
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={topEndpointData} margin={{ bottom: 60 }}>
                                        <defs>
                                            <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis dataKey="name" fontSize={9} stroke="#9ca3af" angle={-35} textAnchor="end" height={60}
                                            tickFormatter={(v: string) => v.length > 22 ? v.slice(0, 22) + '…' : v} />
                                        <YAxis fontSize={10} stroke="#9ca3af" />
                                        <CustomTooltip formatter={(v: number) => [v, 'Requests']} labelFormatter={(l: string) => l} />
                                        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#apiGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </ChartPanel>
                        </div>

                        <ChartPanel title="Severity Breakdown" loading={isLoading}>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={severityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                                        dataKey="value" nameKey="name" paddingAngle={3}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={{ stroke: '#d1d5db' }}>
                                        {severityData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartPanel>
                    </div>

                    {/* Row 3: Heatmap (full width) */}
                    <ChartPanel title="Activity Heatmap" loading={isLoading}>
                        <ActivityHeatmap data={stats?.activityHeatmap || []} />
                    </ChartPanel>

                    {/* Row 4: Active Users + Sessions side by side */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Active Users */}
                        <TablePanel title="Active Users Today" icon={<Users className="h-3.5 w-3.5 text-green-500" />} loading={isLoading}
                            empty={!stats?.activeUsersToday?.length} emptyText="No active users today">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                        <th className="pb-2">User</th>
                                        <th className="pb-2 text-right">Actions</th>
                                        <th className="pb-2 text-right">Last Seen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {stats?.activeUsersToday?.map((user) => (
                                        <tr key={user.userId} className="transition-colors hover:bg-gray-50/50">
                                            <td className="py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[10px] font-bold text-white">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 text-right">
                                                <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">{user.actionCount}</span>
                                            </td>
                                            <td className="py-2 text-right text-[10px] text-gray-400">
                                                {new Date(user.lastActivity).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TablePanel>

                        {/* User Sessions */}
                        <TablePanel title="Recent Sessions" icon={<Clock className="h-3.5 w-3.5 text-blue-500" />} loading={isLoading}
                            empty={!stats?.recentSessions?.length} emptyText="No sessions recorded">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                        <th className="pb-2">User</th>
                                        <th className="pb-2">IP</th>
                                        <th className="pb-2">Login</th>
                                        <th className="pb-2">Status</th>
                                        <th className="pb-2 text-right">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {stats?.recentSessions?.map((s, idx) => (
                                        <tr key={idx} className="transition-colors hover:bg-gray-50/50">
                                            <td className="py-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-[10px] font-bold text-white">
                                                        {s.userName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700">{s.userName}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 font-mono text-[10px] text-gray-400">{s.ipAddress || '—'}</td>
                                            <td className="py-2 text-[10px] text-gray-500">{formatTime(s.loginTime)}</td>
                                            <td className="py-2">
                                                {s.logoutTime
                                                    ? <span className="text-[10px] text-gray-400">{formatTime(s.logoutTime)}</span>
                                                    : <Badge variant="outline" className="border-green-200 bg-green-50 px-1.5 py-0 text-[10px] font-medium text-green-700">Active</Badge>
                                                }
                                            </td>
                                            <td className="py-2 text-right text-[10px] font-medium text-gray-600">{formatDuration(s.durationMinutes)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TablePanel>
                    </div>

                    {/* Row 5: Failed Logins */}
                    {stats?.recentFailedLogins && stats.recentFailedLogins.length > 0 && (
                        <TablePanel title="Failed Login Attempts" icon={<ShieldAlert className="h-3.5 w-3.5 text-red-500" />} loading={isLoading}
                            empty={false} emptyText="">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                        <th className="pb-2">User / Email</th>
                                        <th className="pb-2">IP Address</th>
                                        <th className="pb-2">Status</th>
                                        <th className="pb-2 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {stats.recentFailedLogins.map((a, idx) => (
                                        <tr key={idx} className="transition-colors hover:bg-red-50/30">
                                            <td className="py-2 text-xs font-medium text-gray-700">{a.actorName || <span className="italic text-gray-400">Unknown</span>}</td>
                                            <td className="py-2 font-mono text-[10px] text-gray-400">{a.ipAddress || '—'}</td>
                                            <td className="py-2">
                                                <Badge variant="outline" className="border-red-200 bg-red-50 px-1.5 py-0 text-[10px] font-semibold text-red-700">{a.httpStatus}</Badge>
                                            </td>
                                            <td className="py-2 text-right text-[10px] text-gray-500">{formatTime(a.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TablePanel>
                    )}
                </div>
            </div>
        </>
    );
}

// --- Reusable Components ---

function StatCard({ title, value, icon: Icon, color, loading }: {
    title: string; value?: number; icon: React.ComponentType<{ className?: string }>; color: string; loading: boolean;
}) {
    const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
        red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
        green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' },
    };
    const c = colorMap[color] || colorMap.blue;

    return (
        <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2.5 ${c.bg}`}>
                    <Icon className={`h-5 w-5 ${c.icon}`} />
                </div>
                <div>
                    <p className="text-[11px] font-medium text-gray-400">{title}</p>
                    {loading ? <Skeleton className="mt-1 h-6 w-12" /> : (
                        <p className={`text-xl font-bold ${c.text}`}>{(value ?? 0).toLocaleString()}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function Panel({ title, icon, badge, badgeColor, children }: {
    title: string; icon: React.ReactNode; badge: string; badgeColor: string; children: React.ReactNode;
}) {
    const badgeClass = badgeColor === 'green' ? 'border-green-200 bg-green-50 text-green-700'
        : badgeColor === 'red' ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-gray-200 bg-gray-50 text-gray-700';
    return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">{icon}{title}</div>
                    <Badge variant="outline" className={`px-1.5 py-0 text-[10px] font-bold ${badgeClass}`}>{badge}</Badge>
                </div>
                {children}
            </CardContent>
        </Card>
    );
}

function ChartPanel({ title, loading, children }: { title: string; loading: boolean; children: React.ReactNode }) {
    return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500">{title}</span>
                </div>
                {loading ? <Skeleton className="h-[240px] w-full rounded" /> : children}
            </CardContent>
        </Card>
    );
}

function TablePanel({ title, icon, loading, empty, emptyText, children }: {
    title: string; icon: React.ReactNode; loading: boolean; empty: boolean; emptyText: string; children: React.ReactNode;
}) {
    return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-1.5">
                    {icon}
                    <span className="text-xs font-semibold text-gray-500">{title}</span>
                </div>
                {loading ? (
                    <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded" />)}</div>
                ) : empty ? (
                    <p className="py-6 text-center text-xs text-gray-400">{emptyText}</p>
                ) : (
                    <div className="overflow-x-auto">{children}</div>
                )}
            </CardContent>
        </Card>
    );
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ActivityHeatmap({ data }: { data: { dayOfWeek: number; hour: number; count: number }[] }) {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let maxCount = 0;
    for (const cell of data) {
        grid[cell.dayOfWeek][cell.hour] = cell.count;
        if (cell.count > maxCount) maxCount = cell.count;
    }

    function getColor(count: number): string {
        if (count === 0) return 'bg-gray-100/60';
        const i = count / maxCount;
        if (i > 0.75) return 'bg-blue-600';
        if (i > 0.5) return 'bg-blue-500';
        if (i > 0.25) return 'bg-blue-400';
        return 'bg-blue-200';
    }

    if (data.length === 0) return <p className="py-6 text-center text-xs text-gray-400">No activity data</p>;

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[500px]">
                <div className="mb-1 flex">
                    <div className="w-9" />
                    {Array.from({ length: 24 }).map((_, h) => (
                        <div key={h} className="flex-1 text-center text-[9px] text-gray-400">{h % 3 === 0 ? `${h}:00` : ''}</div>
                    ))}
                </div>
                {grid.map((row, day) => (
                    <div key={day} className="mb-px flex items-center">
                        <div className="w-9 pr-2 text-right text-[10px] font-medium text-gray-400">{DAY_LABELS[day]}</div>
                        {row.map((count, hour) => (
                            <div key={hour} className={`mx-px h-[18px] flex-1 rounded-[3px] ${getColor(count)} transition-all hover:ring-1 hover:ring-blue-400`}
                                title={`${DAY_LABELS[day]} ${hour}:00 — ${count} events`} />
                        ))}
                    </div>
                ))}
                <div className="mt-2 flex items-center justify-end gap-1 text-[9px] text-gray-400">
                    <span>Less</span>
                    {['bg-gray-100/60', 'bg-blue-200', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600'].map((c, i) => (
                        <div key={i} className={`h-2.5 w-2.5 rounded-[2px] ${c}`} />
                    ))}
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}
