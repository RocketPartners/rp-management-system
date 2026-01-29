// resources/js/Pages/Admin/Onboarding/Submissions/Index.jsx
import { StatusBadge } from '@/components/onboarding/shared/StatusBadge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import { Progress } from '@/Components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ADMIN_ONBOARDING_ROUTES } from '@/lib/constants/onboarding/routes';
import { Head, Link, router } from '@inertiajs/react';
import {
    Eye,
    FileCheck,
    FileText,
    MoreVertical,
    Search,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ submissions, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route(ADMIN_ONBOARDING_ROUTES.INDEX),
            { search: searchTerm },
            { preserveState: true },
        );
    };

    const filterByStatus = (status) => {
        router.get(
            route(ADMIN_ONBOARDING_ROUTES.INDEX),
            { status, search: searchTerm },
            { preserveState: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Onboarding Submissions" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Onboarding Submissions
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Review and approve pre-employment documents
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.total}
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer transition-shadow hover:shadow-md"
                        onClick={() => filterByStatus('draft')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Draft
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-700">
                                {stats.draft}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                In progress
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer transition-shadow hover:shadow-md"
                        onClick={() => filterByStatus('submitted')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-yellow-600">
                                Submitted
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-yellow-700">
                                {stats.submitted}
                            </p>
                            <p className="mt-1 text-xs text-yellow-600">
                                Needs review
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer transition-shadow hover:shadow-md"
                        onClick={() => filterByStatus('under_review')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-blue-600">
                                Reviewing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-700">
                                {stats.under_review}
                            </p>
                            <p className="mt-1 text-xs text-blue-600">
                                In progress
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer transition-shadow hover:shadow-md"
                        onClick={() => filterByStatus('revision_requested')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-orange-600">
                                Revisions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-orange-700">
                                {stats.revision_requested || 0}
                            </p>
                            <p className="mt-1 text-xs text-orange-600">
                                Needs fixes
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className="cursor-pointer transition-shadow hover:shadow-md"
                        onClick={() => filterByStatus('approved')}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-green-600">
                                Approved
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-700">
                                {stats.approved}
                            </p>
                            <p className="mt-1 text-xs text-green-600">
                                Complete
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by candidate name or email..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit">
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                            {(filters?.search || filters?.status !== 'all') && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.get(
                                            route(
                                                ADMIN_ONBOARDING_ROUTES.INDEX,
                                            ),
                                        )
                                    }
                                >
                                    Clear
                                </Button>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Submissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            All Submissions ({submissions.data.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Documents</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.data.length > 0 ? (
                                    submissions.data.map((submission) => (
                                        <TableRow
                                            key={submission.id}
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() =>
                                                router.get(
                                                    route(
                                                        ADMIN_ONBOARDING_ROUTES.REVIEW,
                                                        submission.id,
                                                    ),
                                                )
                                            }
                                        >
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {
                                                            submission.invite
                                                                .first_name
                                                        }{' '}
                                                        {
                                                            submission.invite
                                                                .last_name
                                                        }
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {
                                                            submission.invite
                                                                .email
                                                        }
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-700">
                                                    {submission.invite
                                                        .position || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <Progress
                                                        value={
                                                            submission.completion_percentage
                                                        }
                                                        className="h-2"
                                                    />
                                                    <p className="text-xs text-gray-600">
                                                        {
                                                            submission.completion_percentage
                                                        }
                                                        %
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">
                                                        {submission.documents
                                                            ?.length || 0}{' '}
                                                        files
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={submission.status}
                                                    variant="submission"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {submission.submitted_at ? (
                                                    <span className="text-sm text-gray-600">
                                                        {new Date(
                                                            submission.submitted_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        —
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        ADMIN_ONBOARDING_ROUTES.REVIEW,
                                                                        submission.id,
                                                                    )}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Review
                                                                    Submission
                                                                </Link>
                                                            </DropdownMenuItem>

                                                            {submission.status ===
                                                                'approved' &&
                                                                !submission
                                                                    .invite
                                                                    .converted_user_id && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            if (
                                                                                confirm(
                                                                                    'Convert this submission to a user account?',
                                                                                )
                                                                            ) {
                                                                                router.post(
                                                                                    route(
                                                                                        ADMIN_ONBOARDING_ROUTES.CONVERT_TO_USER,
                                                                                        submission
                                                                                            .invite
                                                                                            .id,
                                                                                    ),
                                                                                );
                                                                            }
                                                                        }}
                                                                        className="text-green-600"
                                                                    >
                                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                                        Convert
                                                                        to User
                                                                    </DropdownMenuItem>
                                                                )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-12 text-center text-gray-500"
                                        >
                                            <FileCheck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                            <p className="mb-2 text-lg font-medium">
                                                No submissions yet
                                            </p>
                                            <p className="text-sm">
                                                Submissions will appear here
                                                after candidates fill out their
                                                forms
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {submissions.data.length > 0 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {submissions.from} to {submissions.to} of{' '}
                            {submissions.total} submissions
                        </p>
                        <div className="flex gap-2">
                            {submissions.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
