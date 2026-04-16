import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import {
    BarChart3,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    Download,
    FileText,
    Globe,
    Hash,
    Monitor,
    Search,
    User,
    X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { apiGet, apiFetch } from '@/lib/spring-boot-api';
import type { AuditLogResponse, PagedResponse } from '@/types';

const SEVERITY_STYLES: Record<string, string> = {
    INFO: 'border-blue-200 bg-blue-50 text-blue-700',
    WARN: 'border-amber-200 bg-amber-50 text-amber-700',
    ERROR: 'border-red-200 bg-red-50 text-red-700',
    CRITICAL: 'border-purple-200 bg-purple-50 text-purple-700',
};

const HTTP_STATUS_STYLES: Record<string, string> = {
    '2xx': 'border-green-200 bg-green-50 text-green-700',
    '4xx': 'border-amber-200 bg-amber-50 text-amber-700',
    '5xx': 'border-red-200 bg-red-50 text-red-700',
};

function getHttpStatusStyle(status: number | null): string {
    if (!status) return '';
    if (status >= 500) return HTTP_STATUS_STYLES['5xx'];
    if (status >= 400) return HTTP_STATUS_STYLES['4xx'];
    return HTTP_STATUS_STYLES['2xx'];
}

function formatTimestamp(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

export default function AuditLogList() {
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') || '';
    const severity = searchParams.get('severity') || '';
    const entityType = searchParams.get('entityType') || '';
    const httpStatus = searchParams.get('httpStatus') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = 25;

    const [searchInput, setSearchInput] = useState(search);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (searchInput) params.set('search', searchInput);
            else params.delete('search');
            params.delete('page');
            setSearchParams(params, { replace: true });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['audit-logs', { search, severity, entityType, httpStatus, startDate, endDate, page, size }],
        queryFn: () => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (severity) params.set('severity', severity);
            if (entityType) params.set('entityType', entityType);
            if (httpStatus) params.set('httpStatus', httpStatus);
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
            params.set('page', String(page));
            params.set('size', String(size));
            return apiGet<PagedResponse<AuditLogResponse>>(`/audit-logs?${params}`);
        },
    });

    function setFilter(key: string, value: string) {
        const params = new URLSearchParams(searchParams);
        if (value && value !== 'all') params.set(key, value);
        else params.delete(key);
        params.delete('page');
        setSearchParams(params, { replace: true });
    }

    function setPage(newPage: number) {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(newPage));
        setSearchParams(params, { replace: true });
    }

    function clearFilters() {
        setSearchInput('');
        setSearchParams({}, { replace: true });
    }

    const hasFilters = search || severity || entityType || httpStatus || startDate || endDate;

    async function handleExport() {
        const params = new URLSearchParams();
        if (severity) params.set('severity', severity);
        if (entityType) params.set('entityType', entityType);
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        const res = await apiFetch(`/audit-logs/export?${params}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <>
            <Helmet>
                <title>Audit Logs | HRIS</title>
            </Helmet>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Track all system activity, user actions, and errors
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2" onClick={handleExport}>
                                <Download className="h-4 w-4" />
                                Export CSV
                            </Button>
                            <Link to="/audit-dashboard">
                                <Button variant="outline" className="gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    View Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-3">
                                {/* Row 1: Search + Dropdowns */}
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            placeholder="Search events or messages..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            className="h-11 pl-10"
                                        />
                                        {searchInput && (
                                            <button
                                                onClick={() => setSearchInput('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                            >
                                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                            </button>
                                        )}
                                    </div>

                                    <Select
                                        value={severity || 'all'}
                                        onValueChange={(v) => setFilter('severity', v)}
                                    >
                                        <SelectTrigger className="h-11 w-full sm:w-[160px]">
                                            <SelectValue placeholder="Severity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Severity</SelectItem>
                                            <SelectItem value="INFO">INFO</SelectItem>
                                            <SelectItem value="WARN">WARN</SelectItem>
                                            <SelectItem value="ERROR">ERROR</SelectItem>
                                            <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={entityType || 'all'}
                                        onValueChange={(v) => setFilter('entityType', v)}
                                    >
                                        <SelectTrigger className="h-11 w-full sm:w-[170px]">
                                            <SelectValue placeholder="Entity Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Entities</SelectItem>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="role">Role</SelectItem>
                                            <SelectItem value="team">Team</SelectItem>
                                            <SelectItem value="leave">Leave</SelectItem>
                                            <SelectItem value="asset">Asset</SelectItem>
                                            <SelectItem value="announcement">Announcement</SelectItem>
                                            <SelectItem value="ticket">Ticket</SelectItem>
                                            <SelectItem value="auth">Auth</SelectItem>
                                            <SelectItem value="profile">Profile</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={httpStatus || 'all'}
                                        onValueChange={(v) => setFilter('httpStatus', v)}
                                    >
                                        <SelectTrigger className="h-11 w-full sm:w-[160px]">
                                            <SelectValue placeholder="HTTP Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="200">2xx Success</SelectItem>
                                            <SelectItem value="400">4xx Client</SelectItem>
                                            <SelectItem value="500">5xx Server</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Row 2: Date range + Page size + Clear */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-500">From</span>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setFilter('startDate', e.target.value)}
                                            className="h-11 w-[160px]"
                                        />
                                        <span className="text-sm font-medium text-gray-500">To</span>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setFilter('endDate', e.target.value)}
                                            className="h-11 w-[160px]"
                                        />
                                    </div>

                                    <div className="flex-1" />

                                    {hasFilters && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
                                            <X className="mr-1 h-4 w-4" /> Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table */}
                    <Card className="shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b-2 bg-gray-50 hover:bg-gray-50">
                                        <TableHead className="w-[180px]">Timestamp</TableHead>
                                        <TableHead className="w-[100px]">Severity</TableHead>
                                        <TableHead className="w-[200px]">Event</TableHead>
                                        <TableHead className="w-[160px]">Actor</TableHead>
                                        <TableHead className="w-[110px]">Entity</TableHead>
                                        <TableHead className="w-[90px]">Status</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead className="w-10" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading &&
                                        Array.from({ length: 10 }).map((_, i) => (
                                            <TableRow key={i}>
                                                {Array.from({ length: 8 }).map((_, j) => (
                                                    <TableCell key={j}>
                                                        <Skeleton className="h-5 w-full rounded" />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}

                                    {isError && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="rounded-full bg-red-50 p-3">
                                                        <X className="h-6 w-6 text-red-400" />
                                                    </div>
                                                    <p className="font-medium text-gray-900">Failed to load audit logs</p>
                                                    <p className="text-sm text-gray-500">Please try refreshing the page</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {!isLoading && !isError && data?.content.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="rounded-full bg-gray-100 p-3">
                                                        <FileText className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <p className="font-medium text-gray-900">No audit logs found</p>
                                                    <p className="text-sm text-gray-500">
                                                        {hasFilters
                                                            ? 'Try adjusting your filters'
                                                            : 'Audit logs will appear here as the system is used'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {data?.content.map((log) => (
                                        <React.Fragment key={log.id}>
                                            <TableRow
                                                className="cursor-pointer border-b transition-colors hover:bg-gray-50"
                                                onClick={() =>
                                                    setExpandedRow(expandedRow === log.id ? null : log.id)
                                                }
                                            >
                                                <TableCell className="whitespace-nowrap text-sm text-gray-500">
                                                    {formatTimestamp(log.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs font-semibold ${SEVERITY_STYLES[log.severity] || ''}`}
                                                    >
                                                        {log.severity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                                                        {log.eventName}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                                                            <User className="h-3.5 w-3.5 text-gray-500" />
                                                        </div>
                                                        <span className="text-sm text-gray-700">
                                                            {log.actorName || <span className="italic text-gray-400">System</span>}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {log.entityType ? (
                                                        <span className="text-sm text-gray-600">
                                                            {log.entityType}
                                                            {log.entityId && (
                                                                <span className="ml-0.5 text-gray-400">#{log.entityId}</span>
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {log.httpStatus ? (
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs font-medium ${getHttpStatusStyle(log.httpStatus)}`}
                                                        >
                                                            {log.httpStatus}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-[300px] truncate text-sm text-gray-500">
                                                    {log.message}
                                                </TableCell>
                                                <TableCell>
                                                    {expandedRow === log.id ? (
                                                        <ChevronUp className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded detail row — renders directly below its parent */}
                                            {expandedRow === log.id && (
                                                <TableRow className="bg-slate-50">
                                                    <TableCell colSpan={8} className="p-0">
                                                        <div className="border-l-4 border-blue-400 px-6 py-4">
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                                        Full Message
                                                                    </p>
                                                                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                                                                        {log.message}
                                                                    </p>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4 rounded-lg bg-white p-3 sm:grid-cols-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Monitor className="h-4 w-4 text-gray-400" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-400">Endpoint</p>
                                                                            <p className="font-mono text-xs font-medium text-gray-700">
                                                                                {log.httpMethod} {log.endpoint || '—'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Globe className="h-4 w-4 text-gray-400" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-400">IP Address</p>
                                                                            <p className="font-mono text-xs font-medium text-gray-700">
                                                                                {log.ipAddress || '—'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Hash className="h-4 w-4 text-gray-400" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-400">Actor ID</p>
                                                                            <p className="text-xs font-medium text-gray-700">
                                                                                {log.actorId ?? '—'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                                        <div>
                                                                            <p className="text-xs text-gray-400">Logged At</p>
                                                                            <p className="text-xs font-medium text-gray-700">
                                                                                {formatTimestamp(log.createdAt)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing{' '}
                                <span className="font-semibold">{page * size + 1}</span>–
                                <span className="font-semibold">
                                    {Math.min((page + 1) * size, data.totalElements)}
                                </span>{' '}
                                of{' '}
                                <span className="font-semibold">{data.totalElements}</span>
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={data.first}
                                    onClick={() => setPage(page - 1)}
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                                </Button>
                                <span className="text-sm text-gray-600">
                                    Page {page + 1} of {data.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={data.last}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Show total when only 1 page */}
                    {data && data.totalPages <= 1 && data.totalElements > 0 && (
                        <p className="text-sm text-gray-500">
                            Showing all <span className="font-semibold">{data.totalElements}</span> entries
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
