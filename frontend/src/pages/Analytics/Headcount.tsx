import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    Briefcase,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGet } from '@/lib/spring-boot-api';
import { usePermission } from '@/hooks/usePermission';
import { ChartPanel, TablePanel, CustomTooltip } from './components';
import { PIE_COLORS } from './constants';

interface HeadcountData {
    total: number;
    byDepartment: { name: string; count: number }[];
    byEmploymentType: { name: string; count: number }[];
    byPosition: { name: string; count: number }[];
    growthByMonth: { month: string; newHires: number }[];
}

export default function Headcount() {
    const { can } = usePermission();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['analytics-headcount'],
        queryFn: () => apiGet<HeadcountData>('/analytics/headcount'),
        enabled: can('ANALYTICS_READ'),
    });

    if (!can('ANALYTICS_READ')) return <Navigate to="/dashboard" replace />;

    return (
        <>
            <Helmet><title>Headcount | Analytics | HRIS</title></Helmet>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <Link to="/analytics">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Headcount Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-500">Current workforce overview</p>
                        </div>
                    </div>

                    {isError && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-800">Failed to load analytics data. Please try again later.</p>
                        </div>
                    )}

                    {/* Big Number Card */}
                    <Card className="border-0 shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <Users className="mb-2 h-8 w-8 text-blue-500" />
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Active Headcount</p>
                            {isLoading ? (
                                <Skeleton className="mt-2 h-12 w-24 rounded" />
                            ) : (
                                <p className="mt-1 text-5xl font-bold text-gray-900">{(data?.total ?? 0).toLocaleString()}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Charts Row 1: Department (horizontal bar) + Employment Type (pie) */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <ChartPanel title="Headcount by Department" loading={isLoading}>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={data?.byDepartment || []} layout="vertical" margin={{ left: 20, right: 30 }}>
                                        <defs>
                                            <linearGradient id="deptGrad" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                        <XAxis type="number" fontSize={10} stroke="#9ca3af" />
                                        <YAxis type="category" dataKey="name" fontSize={10} stroke="#9ca3af" width={100} />
                                        <CustomTooltip formatter={(v: number) => [v, 'Employees']} />
                                        <Bar dataKey="count" fill="url(#deptGrad)" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartPanel>
                        </div>

                        <ChartPanel title="By Employment Type" loading={isLoading}>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={data?.byEmploymentType || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        dataKey="count"
                                        nameKey="name"
                                        paddingAngle={3}
                                        label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={{ stroke: '#d1d5db' }}
                                    >
                                        {(data?.byEmploymentType || []).map((_, idx) => (
                                            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <CustomTooltip />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartPanel>
                    </div>

                    {/* Table — by Position */}
                    <TablePanel title="Headcount by Position" icon={<Briefcase className="h-3.5 w-3.5 text-blue-500" />} loading={isLoading}
                        empty={!data?.byPosition?.length} emptyText="No position data available">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                    <th className="pb-2">Position</th>
                                    <th className="pb-2 text-right">Count</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.byPosition?.map((row) => (
                                    <tr key={row.name} className="transition-colors hover:bg-gray-50/50">
                                        <td className="py-2 text-xs font-medium text-gray-700">{row.name}</td>
                                        <td className="py-2 text-right">
                                            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">{row.count}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TablePanel>

                    {/* Growth Over Time — Line Chart */}
                    <ChartPanel title="New Hires — Last 12 Months" loading={isLoading}>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={data?.growthByMonth || []}>
                                <defs>
                                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="month" fontSize={10} stroke="#9ca3af" />
                                <YAxis fontSize={10} stroke="#9ca3af" allowDecimals={false} />
                                <CustomTooltip formatter={(v: number) => [v, 'New Hires']} />
                                <Line type="monotone" dataKey="newHires" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartPanel>
                </div>
            </div>
        </>
    );
}
