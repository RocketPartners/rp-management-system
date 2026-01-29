// resources/js/Pages/Employees/Assets/MyAssets.jsx
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    Barcode,
    CheckCircle2,
    FileText,
    Hash,
    Laptop,
    Mail,
    MapPin,
    Package,
    Phone,
    User,
} from 'lucide-react';

export default function MyAssets({ auth, assignedAssets, assignmentHistory }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Laptop className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                My Assets
                            </h2>
                            <p className="mt-1 text-gray-600">
                                View equipment assigned to you
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="My Assets" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Currently Assigned Assets */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    Currently Assigned (
                                    {assignedAssets?.length || 0})
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {assignedAssets && assignedAssets.length > 0 ? (
                                <div className="space-y-4">
                                    {assignedAssets.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-5 transition-shadow hover:shadow-md"
                                        >
                                            {/* Asset Header */}
                                            <div className="mb-4 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-blue-100 p-3">
                                                        <Package className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {assignment.asset
                                                                ?.inventory_item
                                                                ?.name ||
                                                                'Unknown Asset'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {
                                                                assignment.asset
                                                                    ?.inventory_item
                                                                    ?.sku
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className="border border-green-200 bg-green-100 text-green-700">
                                                    Active
                                                </Badge>
                                            </div>

                                            {/* Asset Details Grid */}
                                            <div className="mb-4 grid grid-cols-2 gap-4">
                                                <div className="rounded-lg border bg-white p-3">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <Hash className="h-4 w-4 text-gray-400" />
                                                        <span className="text-xs text-gray-600">
                                                            Asset Tag
                                                        </span>
                                                    </div>
                                                    <p className="font-mono font-medium text-gray-900">
                                                        {
                                                            assignment.asset
                                                                ?.asset_tag
                                                        }
                                                    </p>
                                                </div>

                                                {assignment.asset?.barcode && (
                                                    <div className="rounded-lg border bg-white p-3">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <Barcode className="h-4 w-4 text-gray-400" />
                                                            <span className="text-xs text-gray-600">
                                                                Barcode
                                                            </span>
                                                        </div>
                                                        <p className="font-mono text-sm text-gray-900">
                                                            {
                                                                assignment.asset
                                                                    .barcode
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                                {assignment.asset
                                                    ?.serial_number && (
                                                    <div className="col-span-2 rounded-lg border bg-white p-3">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-gray-400" />
                                                            <span className="text-xs text-gray-600">
                                                                Serial Number
                                                            </span>
                                                        </div>
                                                        <p className="font-mono text-sm text-gray-900">
                                                            {
                                                                assignment.asset
                                                                    .serial_number
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Assignment Info */}
                                            <div className="space-y-2 border-t border-blue-200 pt-4 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">
                                                        Assigned Date:
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        {new Date(
                                                            assignment.assigned_date,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {assignment.expected_return_date && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">
                                                            Expected Return:
                                                        </span>
                                                        <span className="font-medium text-gray-900">
                                                            {new Date(
                                                                assignment.expected_return_date,
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">
                                                        Condition:
                                                    </span>
                                                    <Badge variant="outline">
                                                        {assignment.condition_on_assignment ||
                                                            assignment.asset
                                                                ?.condition}
                                                    </Badge>
                                                </div>
                                                {assignment.asset?.location && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                assignment.asset
                                                                    .location
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Notes */}
                                            {assignment.assignment_notes && (
                                                <div className="mt-4 rounded-lg border bg-white p-3">
                                                    <p className="mb-1 text-xs text-gray-600">
                                                        Assignment Notes:
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {
                                                            assignment.assignment_notes
                                                        }
                                                    </p>
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
                                    <p className="mb-1 font-medium text-gray-900">
                                        No Assets Assigned
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Contact HR if you need equipment
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assignment History */}
                    {assignmentHistory && assignmentHistory.length > 0 && (
                        <Card className="animate-fade-in animation-delay-100">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Assignment History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {assignmentHistory.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="rounded-lg border bg-gray-50 p-4"
                                        >
                                            <div className="mb-2 flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {
                                                            assignment.asset
                                                                ?.inventory_item
                                                                ?.name
                                                        }
                                                    </p>
                                                    <p className="font-mono text-sm text-gray-600">
                                                        {
                                                            assignment.asset
                                                                ?.asset_tag
                                                        }
                                                    </p>
                                                </div>
                                                <Badge className="bg-gray-100 text-gray-700">
                                                    {assignment.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                <span>
                                                    {new Date(
                                                        assignment.assigned_date,
                                                    ).toLocaleDateString()}
                                                </span>
                                                {assignment.actual_return_date && (
                                                    <>
                                                        <span>→</span>
                                                        <span>
                                                            {new Date(
                                                                assignment.actual_return_date,
                                                            ).toLocaleDateString()}
                                                        </span>
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

                {/* Sidebar - Important Info */}
                <div className="space-y-6">
                    {/* Responsibility Card */}
                    <Card className="animate-fade-in animation-delay-200 border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <AlertCircle className="h-5 w-5" />
                                Asset Responsibility
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                <span>
                                    You are responsible for the care and
                                    maintenance of assigned assets
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                <span>
                                    Report any damage or issues to HR
                                    immediately
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                <span>
                                    Return assets in good condition when
                                    requested
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                <span>
                                    Keep serial numbers and asset tags visible
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact HR */}
                    <Card className="animate-fade-in animation-delay-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Need Help?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <p className="text-gray-700">
                                For asset-related concerns:
                            </p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    <a
                                        href="mailto:hr@rocketpartners.ph"
                                        className="hover:text-blue-600"
                                    >
                                        hr@rocketpartners.ph
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Phone className="h-4 w-4" />
                                    <span>+63 123 456 7890</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
