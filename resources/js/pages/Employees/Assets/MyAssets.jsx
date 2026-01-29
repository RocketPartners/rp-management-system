// resources/js/Pages/Employees/Assets/MyAssets.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Laptop,
    Package,
    Calendar,
    Hash,
    Barcode,
    MapPin,
    User,
    FileText,
    CheckCircle2,
    AlertCircle,
    Mail,
    Phone,
} from 'lucide-react';

export default function MyAssets({ auth, assignedAssets, assignmentHistory }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Laptop className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">My Assets</h2>
                            <p className="text-gray-600 mt-1">View equipment assigned to you</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="My Assets" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Currently Assigned Assets */}
                    <Card className="animate-fade-in">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    Currently Assigned ({assignedAssets?.length || 0})
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {assignedAssets && assignedAssets.length > 0 ? (
                                <div className="space-y-4">
                                    {assignedAssets.map((assignment) => (
                                        <div key={assignment.id} className="p-5 border-2 border-blue-200 bg-blue-50/50 rounded-lg hover:shadow-md transition-shadow">
                                            {/* Asset Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-blue-100 rounded-lg">
                                                        <Package className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-lg text-gray-900">
                                                            {assignment.asset?.inventory_item?.name || 'Unknown Asset'}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {assignment.asset?.inventory_item?.sku}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-green-100 text-green-700 border-green-200 border">
                                                    Active
                                                </Badge>
                                            </div>

                                            {/* Asset Details Grid */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="p-3 bg-white rounded-lg border">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Hash className="h-4 w-4 text-gray-400" />
                                                        <span className="text-xs text-gray-600">Asset Tag</span>
                                                    </div>
                                                    <p className="font-mono font-medium text-gray-900">
                                                        {assignment.asset?.asset_tag}
                                                    </p>
                                                </div>

                                                {assignment.asset?.barcode && (
                                                    <div className="p-3 bg-white rounded-lg border">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Barcode className="h-4 w-4 text-gray-400" />
                                                            <span className="text-xs text-gray-600">Barcode</span>
                                                        </div>
                                                        <p className="font-mono text-sm text-gray-900">
                                                            {assignment.asset.barcode}
                                                        </p>
                                                    </div>
                                                )}

                                                {assignment.asset?.serial_number && (
                                                    <div className="p-3 bg-white rounded-lg border col-span-2">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <FileText className="h-4 w-4 text-gray-400" />
                                                            <span className="text-xs text-gray-600">Serial Number</span>
                                                        </div>
                                                        <p className="font-mono text-sm text-gray-900">
                                                            {assignment.asset.serial_number}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Assignment Info */}
                                            <div className="pt-4 border-t border-blue-200 space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Assigned Date:</span>
                                                    <span className="font-medium text-gray-900">
                                                        {new Date(assignment.assigned_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {assignment.expected_return_date && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Expected Return:</span>
                                                        <span className="font-medium text-gray-900">
                                                            {new Date(assignment.expected_return_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Condition:</span>
                                                    <Badge variant="outline">
                                                        {assignment.condition_on_assignment || assignment.asset?.condition}
                                                    </Badge>
                                                </div>
                                                {assignment.asset?.location && (
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{assignment.asset.location}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Notes */}
                                            {assignment.assignment_notes && (
                                                <div className="mt-4 p-3 bg-white rounded-lg border">
                                                    <p className="text-xs text-gray-600 mb-1">Assignment Notes:</p>
                                                    <p className="text-sm text-gray-900">{assignment.assignment_notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
                                        <Laptop className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <p className="text-gray-900 font-medium mb-1">No Assets Assigned</p>
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
                                        <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg border">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {assignment.asset?.inventory_item?.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600 font-mono">
                                                        {assignment.asset?.asset_tag}
                                                    </p>
                                                </div>
                                                <Badge className="bg-gray-100 text-gray-700">
                                                    {assignment.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                <span>
                                                    {new Date(assignment.assigned_date).toLocaleDateString()}
                                                </span>
                                                {assignment.actual_return_date && (
                                                    <>
                                                        <span>→</span>
                                                        <span>
                                                            {new Date(assignment.actual_return_date).toLocaleDateString()}
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
                            <CardTitle className="text-blue-700 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Asset Responsibility
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-gray-700">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>You are responsible for the care and maintenance of assigned assets</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Report any damage or issues to HR immediately</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Return assets in good condition when requested</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Keep serial numbers and asset tags visible</span>
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
                                    <a href="mailto:hr@rocketpartners.ph" className="hover:text-blue-600">
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