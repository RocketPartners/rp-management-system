/**
 * My Assets Page — Employee view of assigned assets
 * Ported from monolith's Employees/Assets/MyAssets.jsx
 */

import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    FileText,
    Hash,
    Laptop,
    Mail,
    Package,
    Phone,
    User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiGet } from '@/lib/spring-boot-api';

interface AssetAssignment {
    id: number;
    assetId: number;
    assetName: string;
    assetTag: string;
    categoryName: string;
    userId: number;
    userName: string;
    assignedById: number;
    assignedByName: string;
    quantityAssigned: number;
    checkedOutAt: string;
    expectedReturnDate: string;
    checkedInAt: string;
    conditionOnCheckout: string;
    conditionOnCheckin: string;
    checkoutNotes: string;
    checkinNotes: string;
    status: string;
}

export default function MyAssets() {
    const { data: assignments, isLoading } = useQuery({
        queryKey: ['my-assets'],
        queryFn: () => apiGet<AssetAssignment[]>('/asset-assignments/my-assets'),
    });

    const activeAssets = (assignments || []).filter((a) => a.status === 'CHECKED_OUT' || !a.checkedInAt);
    const returnedAssets = (assignments || []).filter((a) => a.status === 'CHECKED_IN' || a.checkedInAt);

    const formatDate = (date: string) =>
        date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

    return (
        <>
            <Helmet><title>My Assets | HRIS</title></Helmet>

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                        <Laptop className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Assets</h1>
                        <p className="text-sm text-gray-500">View equipment assigned to you</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Currently Assigned */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    Currently Assigned ({isLoading ? '...' : activeAssets.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
                                    </div>
                                ) : activeAssets.length > 0 ? (
                                    <div className="space-y-4">
                                        {activeAssets.map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-5 transition-shadow hover:shadow-md"
                                            >
                                                {/* Header */}
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-lg bg-blue-100 p-3">
                                                            <Package className="h-6 w-6 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                {assignment.assetName || 'Unknown Asset'}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {assignment.categoryName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className="border border-green-200 bg-green-100 text-green-700">
                                                        Active
                                                    </Badge>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="mb-4 grid grid-cols-2 gap-4">
                                                    <div className="rounded-lg border bg-white p-3">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <Hash className="h-4 w-4 text-gray-400" />
                                                            <span className="text-xs text-gray-600">Asset Tag</span>
                                                        </div>
                                                        <p className="font-mono font-medium text-gray-900">{assignment.assetTag}</p>
                                                    </div>
                                                    <div className="rounded-lg border bg-white p-3">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span className="text-xs text-gray-600">Qty Assigned</span>
                                                        </div>
                                                        <p className="font-medium text-gray-900">{assignment.quantityAssigned}</p>
                                                    </div>
                                                </div>

                                                {/* Assignment Info */}
                                                <div className="space-y-2 border-t border-blue-200 pt-4 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Checked Out:</span>
                                                        <span className="font-medium text-gray-900">{formatDate(assignment.checkedOutAt)}</span>
                                                    </div>
                                                    {assignment.expectedReturnDate && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Expected Return:</span>
                                                            <span className="font-medium text-gray-900">{formatDate(assignment.expectedReturnDate)}</span>
                                                        </div>
                                                    )}
                                                    {assignment.conditionOnCheckout && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Condition:</span>
                                                            <Badge variant="outline">{assignment.conditionOnCheckout}</Badge>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Assigned By:</span>
                                                        <span className="font-medium text-gray-900">{assignment.assignedByName || '—'}</span>
                                                    </div>
                                                </div>

                                                {/* Notes */}
                                                {assignment.checkoutNotes && (
                                                    <div className="mt-4 rounded-lg border bg-white p-3">
                                                        <p className="mb-1 text-xs text-gray-600">Notes:</p>
                                                        <p className="text-sm text-gray-900">{assignment.checkoutNotes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <div className="mb-4 inline-flex rounded-full bg-gray-100 p-4">
                                            <Laptop className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <p className="mb-1 font-medium text-gray-900">No Assets Assigned</p>
                                        <p className="text-sm text-gray-500">Contact HR if you need equipment</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Return History */}
                        {returnedAssets.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Return History
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {returnedAssets.map((assignment) => (
                                            <div key={assignment.id} className="rounded-lg border bg-gray-50 p-4">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{assignment.assetName}</p>
                                                        <p className="font-mono text-sm text-gray-600">{assignment.assetTag}</p>
                                                    </div>
                                                    <Badge className="bg-gray-100 text-gray-700">Returned</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                                    <span>{formatDate(assignment.checkedOutAt)}</span>
                                                    {assignment.checkedInAt && (
                                                        <>
                                                            <span>→</span>
                                                            <span>{formatDate(assignment.checkedInAt)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Responsibility Card */}
                        <Card className="border-blue-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-blue-700">
                                    <AlertCircle className="h-5 w-5" />
                                    Asset Responsibility
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-gray-700">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                    <span>You are responsible for the care and maintenance of assigned assets</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                    <span>Report any damage or issues to HR immediately</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                    <span>Return assets in good condition when requested</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                    <span>Keep serial numbers and asset tags visible</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact HR */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="h-5 w-5" />
                                    Need Help?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <p className="text-gray-700">For asset-related concerns:</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="h-4 w-4" />
                                        <a href="mailto:hr@rocketpartners.com" className="hover:text-blue-600">hr@rocketpartners.com</a>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
