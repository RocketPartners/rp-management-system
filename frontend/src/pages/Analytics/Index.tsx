import { Helmet } from 'react-helmet-async';
import { Link, Navigate } from 'react-router-dom';
import { CalendarDays, UserPlus, Users, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePermission } from '@/hooks/usePermission';
import type { LucideIcon } from 'lucide-react';

interface ReportCard {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    color: string;
}

const reports: ReportCard[] = [
    {
        title: 'Leave Utilization',
        description: 'Analyze leave usage by department and type, identify employees nearing their limits, and export detailed reports.',
        icon: CalendarDays,
        href: '/analytics/leave-utilization',
        color: 'blue',
    },
    {
        title: 'Onboarding Funnel',
        description: 'Track onboarding stages from invite to conversion, monitor aging invites, and measure overall conversion rates.',
        icon: UserPlus,
        href: '/analytics/onboarding-funnel',
        color: 'green',
    },
    {
        title: 'Headcount',
        description: 'View total headcount by department, employment type, and position. Track monthly growth trends.',
        icon: Users,
        href: '/analytics/headcount',
        color: 'purple',
    },
    {
        title: 'WFH Analytics',
        description: 'Explore work-from-home patterns by day, department, and trend. See top WFH users and monthly statistics.',
        icon: Home,
        href: '/analytics/wfh',
        color: 'amber',
    },
];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
};

export default function AnalyticsIndex() {
    const { can } = usePermission();
    if (!can('ANALYTICS_READ')) return <Navigate to="/dashboard" replace />;

    return (
        <>
            <Helmet><title>Analytics | HRIS</title></Helmet>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                        <p className="mt-1 text-sm text-gray-500">HR reports and data insights</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {reports.map((report) => {
                            const c = colorMap[report.color] || colorMap.blue;
                            const Icon = report.icon;
                            return (
                                <Link key={report.title} to={report.href} className="group">
                                    <Card className={`h-full border ${c.border} shadow-sm transition-shadow group-hover:shadow-md`}>
                                        <CardContent className="p-5">
                                            <div className={`mb-3 inline-flex rounded-lg p-2.5 ${c.bg}`}>
                                                <Icon className={`h-5 w-5 ${c.icon}`} />
                                            </div>
                                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                                                {report.title}
                                            </h3>
                                            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                                                {report.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
