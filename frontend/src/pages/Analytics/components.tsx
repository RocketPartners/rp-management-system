import { TrendingUp } from 'lucide-react';
import { Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// --- Shared constants ---

export const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export const TOOLTIP_STYLE = {
    background: '#1f2937',
    border: 'none',
    borderRadius: '8px',
    color: '#f9fafb',
    fontSize: '12px',
    padding: '8px 12px',
} as const;

// --- Shared components ---

/** Grafana-style Recharts tooltip wrapper */
export const CustomTooltip = ({ contentStyle, ...props }: any) => (
    <Tooltip
        {...props}
        contentStyle={{
            ...TOOLTIP_STYLE,
            ...contentStyle,
        }}
        labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
    />
);

/** Stat card with icon, value, and color theming */
export function StatCard({ title, value, icon: Icon, color, loading, suffix = '' }: {
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

/** Chart wrapper with title, TrendingUp icon, and loading skeleton */
export function ChartPanel({ title, loading, children }: { title: string; loading: boolean; children: React.ReactNode }) {
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

/** Table wrapper with title, icon, loading skeleton, and empty state */
export function TablePanel({ title, icon, loading, empty, emptyText, children }: {
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
