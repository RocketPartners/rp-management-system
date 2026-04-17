import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate } from 'react-router-dom';
import {
    ArrowLeft,
    Home,
    CalendarDays,
    Users,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiGet } from '@/lib/spring-boot-api';
import { usePermission } from '@/hooks/usePermission';
import { StatCard, ChartPanel, TablePanel, CustomTooltip } from './components';

interface WfhStatsData {
    totalDaysThisMonth: number;
    totalDaysThisQuarter: number;
    byDayOfWeek: { name: string; count: number }[];
    byDepartment: { name: string; count: number }[];
    trend: { month: string; count: number }[];
    topUsers: { userId: number; name: string; department: string; totalDays: number }[];
}

export default function WfhAnalytics() {
    const { can } = usePermission();

    const today = new Date().toISOString().split('T')[0];
    const janFirst = `${new Date().getFullYear()}-01-01`;
    const [startDate, setStartDate] = useState(janFirst);
    const [endDate, setEndDate] = useState(today);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['analytics-wfh', { startDate, endDate }],
        queryFn: () => {
            const params = new URLSearchParams();
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
            return apiGet<WfhStatsData>(`/analytics/wfh?${params}`);
        },
        enabled: can('ANALYTICS_READ') && !!startDate && !!endDate,
    });

    if (!can('ANALYTICS_READ')) return <Navigate to="/dashboard" replace />;

    return (
        <>
            <Helmet><title>WFH Analytics | Analytics | HRIS</title></Helmet>

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
                                <h1 className="text-2xl font-bold text-gray-900">WFH Analytics</h1>
                                <p className="mt-1 text-sm text-gray-500">Work-from-home patterns and usage trends</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
                            <span className="text-xs font-medium text-gray-400">Range</span>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 w-[130px] border-0 p-0 text-xs shadow-none" />
                            <span className="text-gray-300">&ndash;</span>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 w-[130px] border-0 p-0 text-xs shadow-none" />
                        </div>
                    </div>

                    {isError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-800">Failed to load analytics data. Please try again later.</p>
                        </div>
                    )}

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <StatCard title="This Month" value={data?.totalDaysThisMonth} icon={CalendarDays} color="blue" loading={isLoading} suffix=" days" />
                        <StatCard title="This Quarter" value={data?.totalDaysThisQuarter} icon={Home} color="green" loading={isLoading} suffix=" days" />
                    </div>

                    {/* Charts Row 1: By Day of Week (bar) + By Department (horizontal bar) */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <ChartPanel title="WFH by Day of Week" loading={isLoading}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={data?.byDayOfWeek || []}>
                                    <defs>
                                        <linearGradient id="wfhDayGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis dataKey="name" fontSize={10} stroke="#9ca3af" />
                                    <YAxis fontSize={10} stroke="#9ca3af" allowDecimals={false} />
                                    <CustomTooltip formatter={(v: number) => [v, 'WFH Days']} />
                                    <Bar dataKey="count" fill="url(#wfhDayGrad)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartPanel>

                        <ChartPanel title="WFH by Department" loading={isLoading}>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={data?.byDepartment || []} layout="vertical" margin={{ left: 20, right: 20 }}>
                                    <defs>
                                        <linearGradient id="wfhDeptGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                    <XAxis type="number" fontSize={10} stroke="#9ca3af" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" fontSize={10} stroke="#9ca3af" width={100} />
                                    <CustomTooltip formatter={(v: number) => [v, 'WFH Days']} />
                                    <Bar dataKey="count" fill="url(#wfhDeptGrad)" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartPanel>
                    </div>

                    {/* Monthly Trend — Line Chart */}
                    <ChartPanel title="Monthly WFH Trend" loading={isLoading}>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={data?.trend || []}>
                                <defs>
                                    <linearGradient id="wfhTrendGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="month" fontSize={10} stroke="#9ca3af" />
                                <YAxis fontSize={10} stroke="#9ca3af" allowDecimals={false} />
                                <CustomTooltip formatter={(v: number) => [v, 'WFH Days']} />
                                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartPanel>

                    {/* Table — Top WFH Users */}
                    <TablePanel title="Top WFH Users" icon={<Users className="h-3.5 w-3.5 text-blue-500" />} loading={isLoading}
                        empty={!data?.topUsers?.length} emptyText="No WFH data available">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                    <th className="pb-2">Name</th>
                                    <th className="pb-2">Department</th>
                                    <th className="pb-2 text-right">Total Days</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.topUsers?.map((row) => (
                                    <tr key={row.userId} className="transition-colors hover:bg-gray-50/50">
                                        <td className="py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[10px] font-bold text-white">
                                                    {row.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs font-medium text-gray-700">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 text-xs text-gray-500">{row.department}</td>
                                        <td className="py-2 text-right">
                                            <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">{row.totalDays}</span>
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
