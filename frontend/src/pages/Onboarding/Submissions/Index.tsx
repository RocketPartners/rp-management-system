import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermission } from '@/hooks/usePermission';
import { apiGet } from '@/lib/spring-boot-api';
import { useQuery } from '@tanstack/react-query';
import {
    CheckCircle2,
    Clock,
    Eye,
    FileCheck,
    FileText,
    MoreVertical,
    Search,
    UserCheck,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

// ============================================
// Types
// ============================================

interface PagedResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

interface SubmissionResponse {
    id: number;
    inviteId: number;
    applicantName: string;
    applicantEmail: string;
    position: string | null;
    department: string | null;
    status: string;
    currentStep: number;
    totalDocuments: number;
    approvedDocuments: number;
    notes: string | null;
    reviewedById: number | null;
    reviewedByName: string | null;
    reviewedAt: string | null;
    convertedUserId: number | null;
    createdAt: string;
    updatedAt: string;
}

// ============================================
// Helpers
// ============================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    draft: { label: 'Draft', color: 'border-gray-200 bg-gray-100 text-gray-700', icon: FileText },
    submitted: { label: 'Submitted', color: 'border-yellow-200 bg-yellow-100 text-yellow-700', icon: Clock },
    under_review: { label: 'Under Review', color: 'border-blue-200 bg-blue-100 text-blue-700', icon: Eye },
    approved: { label: 'Approved', color: 'border-green-200 bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'border-red-200 bg-red-100 text-red-700', icon: XCircle },
    converted: { label: 'Converted', color: 'border-purple-200 bg-purple-100 text-purple-700', icon: UserCheck },
};

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// ============================================
// Component
// ============================================

export default function OnboardingSubmissions() {
    const { can } = usePermission();
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const { data: submissionsData, isLoading } = useQuery({
        queryKey: ['onboarding-submissions', page, search, statusFilter],
        queryFn: () => {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('size', '20');
            if (search) params.set('search', search);
            if (statusFilter) params.set('status', statusFilter);
            return apiGet<PagedResponse<SubmissionResponse>>(`/onboarding/submissions?${params}`);
        },
    });

    const submissions = submissionsData?.content ?? [];
    const totalElements = submissionsData?.totalElements ?? 0;

    // Stats from current page
    const stats = {
        total: totalElements,
        draft: submissions.filter((s) => s.status === 'draft').length,
        submitted: submissions.filter((s) => s.status === 'submitted').length,
        under_review: submissions.filter((s) => s.status === 'under_review').length,
        approved: submissions.filter((s) => s.status === 'approved').length,
        rejected: submissions.filter((s) => s.status === 'rejected').length,
        converted: submissions.filter((s) => s.status === 'converted').length,
    };

    const statCards = [
        { key: null as string | null, label: 'Total', value: stats.total, color: 'text-gray-900', icon: FileText, iconColor: 'text-gray-400' },
        { key: 'submitted', label: 'Submitted', value: stats.submitted, color: 'text-yellow-600', icon: Clock, iconColor: 'text-yellow-400', subtitle: 'Needs review' },
        { key: 'under_review', label: 'Reviewing', value: stats.under_review, color: 'text-blue-600', icon: Eye, iconColor: 'text-blue-400', subtitle: 'In progress' },
        { key: 'approved', label: 'Approved', value: stats.approved, color: 'text-green-600', icon: CheckCircle2, iconColor: 'text-green-400', subtitle: 'Complete' },
        { key: 'rejected', label: 'Rejected', value: stats.rejected, color: 'text-red-600', icon: XCircle, iconColor: 'text-red-400' },
        { key: 'converted', label: 'Converted', value: stats.converted, color: 'text-purple-600', icon: UserCheck, iconColor: 'text-purple-400' },
    ];

    return (
        <>
            <Helmet>
                <title>Onboarding Submissions</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                        <FileCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Onboarding Submissions</h2>
                        <p className="mt-1 text-gray-600">Review and manage applicant submissions</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        const isActive = statusFilter === stat.key;
                        return (
                            <Card
                                key={stat.label}
                                className={`${stat.key !== null ? 'cursor-pointer transition-shadow hover:shadow-md' : ''} ${isActive ? 'ring-2 ring-blue-400' : ''}`}
                                onClick={() => {
                                    if (stat.key !== null) {
                                        setStatusFilter(isActive ? null : stat.key);
                                        setPage(0);
                                    }
                                }}
                            >
                                <CardContent className="pt-4 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                                            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
                                                {stat.value}
                                            </p>
                                            {stat.subtitle && (
                                                <p className="text-xs text-gray-400">{stat.subtitle}</p>
                                            )}
                                        </div>
                                        <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="flex items-center gap-2">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                            className="pl-10"
                        />
                    </div>
                    {(search || statusFilter) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                setStatusFilter(null);
                                setPage(0);
                            }}
                        >
                            <X className="mr-1 h-4 w-4" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="space-y-4 p-6">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : submissions.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Candidate
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Position
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Progress
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Documents
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Submitted
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {submissions.map((sub) => {
                                                const progress =
                                                    sub.totalDocuments > 0
                                                        ? Math.round(
                                                              (sub.approvedDocuments / sub.totalDocuments) * 100,
                                                          )
                                                        : 0;
                                                const statusCfg =
                                                    STATUS_CONFIG[sub.status] || STATUS_CONFIG.draft;

                                                return (
                                                    <tr
                                                        key={sub.id}
                                                        className="cursor-pointer hover:bg-gray-50"
                                                        onClick={() =>
                                                            navigate(`/onboarding/submissions/${sub.id}`)
                                                        }
                                                    >
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <div className="flex items-center">
                                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2596be]">
                                                                    <span className="font-semibold text-white">
                                                                        {sub.applicantName
                                                                            .split(' ')
                                                                            .map((n) => n[0])
                                                                            .join('')
                                                                            .slice(0, 2)}
                                                                    </span>
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {sub.applicantName}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {sub.applicantEmail}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                            {sub.position || '-'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Progress value={progress} className="h-2 w-20" />
                                                                <span className="text-xs text-gray-500">
                                                                    {progress}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                                <FileText className="h-4 w-4" />
                                                                {sub.approvedDocuments}/{sub.totalDocuments}
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <Badge className={statusCfg.color}>
                                                                {statusCfg.label}
                                                            </Badge>
                                                        </td>
                                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                            {sub.createdAt ? formatDate(sub.createdAt) : '—'}
                                                        </td>
                                                        <td
                                                            className="whitespace-nowrap px-6 py-4 text-right text-sm"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/onboarding/submissions/${sub.id}`,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        Review
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {submissionsData && submissionsData.totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t px-6 py-3">
                                        <p className="text-sm text-gray-500">
                                            Showing {page * 20 + 1} to{' '}
                                            {Math.min((page + 1) * 20, totalElements)} of {totalElements}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={submissionsData.first}
                                                onClick={() => setPage((p) => p - 1)}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={submissionsData.last}
                                                onClick={() => setPage((p) => p + 1)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                <FileCheck className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="font-medium">No submissions yet</p>
                                <p className="mt-1 text-sm">
                                    Submissions will appear here once candidates start their onboarding
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
