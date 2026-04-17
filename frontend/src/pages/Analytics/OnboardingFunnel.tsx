import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    UserPlus,
    Percent,
    Clock,
    TrendingUp,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGet } from '@/lib/spring-boot-api';

interface OnboardingFunnelData {
    stages: { stage: string; count: number; conversionRate: number; avgDaysInStage: number | null }[];
    agingInvites: { id: number; email: string; name: string; invitedAt: string; daysAging: number }[];
    overallConversionRate: number;
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

export default function OnboardingFunnel() {
    const today = new Date().toISOString().split('T')[0];
    const janFirst = `${new Date().getFullYear()}-01-01`;
    const [startDate, setStartDate] = useState(janFirst);
    const [endDate, setEndDate] = useState(today);

    const { data, isLoading } = useQuery({
        queryKey: ['analytics-onboarding', { startDate, endDate }],
        queryFn: () => {
            const params = new URLSearchParams();
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
            return apiGet<OnboardingFunnelData>(`/analytics/onboarding-funnel?${params}`);
        },
    });

    const totalInvites = data?.stages?.[0]?.count ?? 0;
    const agingCount = data?.agingInvites?.length ?? 0;

    return (
        <>
            <Helmet><title>Onboarding Funnel | Analytics | HRIS</title></Helmet>

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
                                <h1 className="text-2xl font-bold text-gray-900">Onboarding Funnel</h1>
                                <p className="mt-1 text-sm text-gray-500">Track onboarding stages and conversion rates</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5">
                            <span className="text-xs font-medium text-gray-400">Range</span>
                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 w-[130px] border-0 p-0 text-xs shadow-none" />
                            <span className="text-gray-300">&ndash;</span>
                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 w-[130px] border-0 p-0 text-xs shadow-none" />
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <StatCard title="Total Invites" value={totalInvites} icon={UserPlus} color="blue" loading={isLoading} />
                        <StatCard title="Overall Conversion" value={data ? Number(data.overallConversionRate.toFixed(1)) : undefined} icon={Percent} color="green" loading={isLoading} suffix="%" />
                        <StatCard title="Aging Invites" value={agingCount} icon={Clock} color="red" loading={isLoading} />
                    </div>

                    {/* Funnel Chart — Horizontal Bar */}
                    <ChartPanel title="Onboarding Funnel Stages" loading={isLoading}>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data?.stages || []} layout="vertical" margin={{ left: 20, right: 40 }}>
                                <defs>
                                    <linearGradient id="funnelGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                <XAxis type="number" fontSize={10} stroke="#9ca3af" />
                                <YAxis type="category" dataKey="stage" fontSize={11} stroke="#9ca3af" width={80} />
                                <CustomTooltip
                                    formatter={(v: number, _name: string, entry: { payload: OnboardingFunnelData['stages'][number] }) => {
                                        const stage = entry.payload;
                                        return [
                                            `${v} (${stage.conversionRate.toFixed(1)}%)`,
                                            'Count',
                                        ];
                                    }}
                                />
                                <Bar dataKey="count" fill="url(#funnelGrad)" radius={[0, 4, 4, 0]}>
                                    <LabelList dataKey="count" position="right" fontSize={11} fill="#6b7280" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartPanel>

                    {/* Table — Aging Invites */}
                    <TablePanel title="Aging Invites" icon={<Clock className="h-3.5 w-3.5 text-amber-500" />} loading={isLoading}
                        empty={!data?.agingInvites?.length} emptyText="No aging invites found">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                    <th className="pb-2">Email</th>
                                    <th className="pb-2">Name</th>
                                    <th className="pb-2">Invited Date</th>
                                    <th className="pb-2 text-right">Days Aging</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data?.agingInvites?.map((row) => (
                                    <tr key={row.id} className="transition-colors hover:bg-gray-50/50">
                                        <td className="py-2 text-xs font-medium text-gray-700">{row.email}</td>
                                        <td className="py-2 text-xs text-gray-500">{row.name || '\u2014'}</td>
                                        <td className="py-2 text-xs text-gray-500">
                                            {new Date(row.invitedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="py-2 text-right">
                                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${row.daysAging >= 14 ? 'bg-red-100 text-red-700' : row.daysAging >= 7 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {row.daysAging}d
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
