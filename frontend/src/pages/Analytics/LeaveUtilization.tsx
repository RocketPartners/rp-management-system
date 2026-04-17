import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    CalendarDays,
    Download,
    Percent,
    AlertTriangle,
    TrendingUp,
    BarChart3,
} from 'lucide-react';
import {
    BarChart,
    Bar,
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
import { apiGet, apiFetch } from '@/lib/spring-boot-api';

interface LeaveUtilizationData {
    totalUsed: number;
    totalAvailable: number;
    byDepartment: { name: string; used: number; available: number }[];
    byLeaveType: { type: string; count: number; totalDays: number }[];
    nearingLimit: { userId: number; name: string; department: string; leaveType: string; used: number; total: number; remaining: number }[];
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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

export default function LeaveUtilization() {
    const today = new Date().toISOString().split('T')[0];
    const janFirst = `${new Date().getFullYear()}-01-01`;
    const [startDate, setStartDate] = useState(janFirst);
    const [endDate, setEndDate] = useState(today);

    const { data, isLoading } = useQuery({
        queryKey: ['analytics-leave', { startDate, endDate }],
        queryFn: () => {
            const params = new URLSearchParams();
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
            return apiGet<LeaveUtilizationData>(`/analytics/leave-utilization?${params}`);
        },
    });

    const utilizationRate = data && data.totalAvailable > 0
        ? ((data.totalUsed / data.totalAvailable) * 100).toFixed(1)
        : '0.0';

    async function handleExport() {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        const res = await apiFetch(`/analytics/leave-utilization/export?${params}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leave-utilization-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <>
            <Helmet><title>Leave Utilization | Analytics | HRIS</title></Helmet>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/analytics">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Leave Utilization</h1>
                                <p className="mt-1 text-sm text-gray-500">Leave usage analysis by department and type</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
                                <span className="text-xs font-medium text-gray-400">Range</span>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 w-[130px] border-0 p-0 text-xs shadow-none" />
                                <span className="text-gray-300">&ndash;</span>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 w-[130px] border-0 p-0 text-xs shadow-none" />
                            </div>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
                                <Download className="h-3.5 w-3.5" /> Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <StatCard title="Total Used" value={data?.totalUsed} icon={CalendarDays} color="blue" loading={isLoading} suffix=" days" />
                        <StatCard title="Total Available" value={data?.totalAvailable} icon={BarChart3} color="green" loading={isLoading} suffix=" days" />
                        <StatCard title="Utilization Rate" value={data ? Number(utilizationRate) : undefined} icon={Percent} color="purple" loading={isLoading} suffix="%" />
                        <StatCard title="Near Limit" value={data?.nearingLimit?.length} icon={AlertTriangle} color="red" loading={isLoading} />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        {/* Bar Chart — by Department */}
                        <div className="lg:col-span-2">
                            <ChartPanel title="Leave Usage by Department" loading={isLoading}>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={data?.byDepartment || []} margin={{ bottom: 40 }}>
                                        <defs>
                                            <linearGradient id="leaveBarGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                        <XAxis dataKey="name" fontSize={10} stroke="#9ca3af" angle={-25} textAnchor="end" height={50} />
                                        <YAxis fontSize={10} stroke="#9ca3af" />
                                        <CustomTooltip formatter={(v: number, name: string) => [v, name === 'used' ? 'Used' : 'Available']} />
                                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                                        <Bar dataKey="used" name="Used" fill="url(#leaveBarGrad)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="available" name="Available" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartPanel>
                        </div>

                        {/* Pie Chart — by Leave Type */}
                        <ChartPanel title="Usage by Leave Type" loading={isLoading}>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={data?.byLeaveType || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        dataKey="totalDays"
                                        nameKey="type"
                                        paddingAngle={3}
                                        label={({ type, percent }: { type: string; percent: number }) => `${type} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={{ stroke: '#d1d5db' }}
                                    >
                                        {(data?.byLeaveType || []).map((_, idx) => (
                                            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#f9fafb', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartPanel>
                    </div>

                    {/* Table — Nearing Limit */}
                    <TablePanel title="Employees Nearing Leave Limit" icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />} loading={isLoading}
                        empty={!data?.nearingLimit?.length} emptyText="No employees nearing their leave limit">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                    <th className="pb-2">Name</th>
                                    <th className="pb-2">Department</th>
                                    <th className="pb-2">Leave Type</th>
                                    <th className="pb-2 text-right">Used</th>
                                    <th className="pb-2 text-right">Total</th>
                                    <th className="pb-2 text-right">Remaining</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.nearingLimit?.map((row) => (
                                    <tr key={`${row.userId}-${row.leaveType}`} className="transition-colors hover:bg-gray-50/50">
                                        <td className="py-2 text-xs font-medium text-gray-700">{row.name}</td>
                                        <td className="py-2 text-xs text-gray-500">{row.department}</td>
                                        <td className="py-2 text-xs text-gray-500">{row.leaveType}</td>
                                        <td className="py-2 text-right text-xs font-medium text-gray-700">{row.used}</td>
                                        <td className="py-2 text-right text-xs text-gray-500">{row.total}</td>
                                        <td className="py-2 text-right">
                                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${row.remaining <= 1 ? 'bg-red-100 text-red-700' : row.remaining <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {row.remaining}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TablePanel>
                </div>
            </div>
        </>
    );
}

// --- Reusable Components ---

function StatCard({ title, value, icon: Icon, color, loading, suffix = '' }: {
    title: string; value?: number; icon: React.ComponentType<{ className?: string }>; color: string; loading: boolean; suffix?: string;
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
                        <p className={`text-xl font-bold ${c.text}`}>{(value ?? 0).toLocaleString()}{suffix}</p>
                    )}
                </div>
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
                {loading ? <Skeleton className="h-[280px] w-full rounded" /> : children}
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
