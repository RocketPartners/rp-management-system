/**
 * Onboarding Portal - Post-submission success/checklist page
 * Ported from monolith's Guest/Onboarding/Checklist.jsx
 * Replaces Inertia server-side props with TanStack Query + Spring Boot API
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { portalGet } from '@/lib/api/onboarding-portal';
import { useQuery } from '@tanstack/react-query';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    Mail,
    Rocket,
    UserCheck,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useParams } from 'react-router-dom';

export default function OnboardingSuccess() {
    const { token } = useParams<{ token: string }>();

    const { data: portalData, isLoading, error } = useQuery({
        queryKey: ['onboarding-portal', token],
        queryFn: () => portalGet(`/onboarding/portal/${token}`),
        enabled: !!token,
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <Loader2 className="h-8 w-8 animate-spin text-[#2596be]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-6">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                        <p className="mt-4 text-muted-foreground">{(error as Error).message}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!portalData) return null;

    const { invite, submission } = portalData as any;

    // If not submitted yet, redirect back to form
    if (!submission?.submitted_at) {
        return <Navigate to={`/onboarding/${token}`} replace />;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'complete': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'missing': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'complete': return <CheckCircle2 className="h-5 w-5" />;
            case 'pending': return <Clock className="h-5 w-5" />;
            case 'missing': return <AlertCircle className="h-5 w-5" />;
            default: return null;
        }
    };

    // Build checklist from submission data
    const checklist = {
        personal_info: {
            label: 'Personal Information',
            completed: !!submission.personal_info,
            status: submission.personal_info ? 'complete' : 'missing',
            message: submission.personal_info
                ? 'All personal details submitted'
                : 'Personal information not provided',
        },
        government_ids: {
            label: 'Government IDs',
            completed: !!(submission.personal_info?.sss_number || submission.personal_info?.tin_number),
            status: (submission.personal_info?.sss_number || submission.personal_info?.tin_number) ? 'complete' : 'missing',
            message: (submission.personal_info?.sss_number || submission.personal_info?.tin_number)
                ? 'Government ID information provided'
                : 'Government IDs not provided',
        },
        emergency_contact: {
            label: 'Emergency Contact',
            completed: !!submission.emergency_contact,
            status: submission.emergency_contact ? 'complete' : 'missing',
            message: submission.emergency_contact
                ? 'Emergency contact information provided'
                : 'Emergency contact not provided',
        },
        documents: {
            label: 'Required Documents',
            completed: submission.documents?.length > 0,
            status: submission.documents?.length > 0 ? 'complete' : 'missing',
            message: submission.documents?.length > 0
                ? `${submission.documents.length} document(s) uploaded`
                : 'No documents uploaded',
        },
    };

    return (
        <>
            <Helmet><title>Onboarding Submitted</title></Helmet>

            <div className="min-h-screen bg-zinc-50 px-4 py-12">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <div className="mb-6 flex flex-col items-center justify-center">
                            <div className="mb-4 rounded-full bg-green-100 p-4">
                                <CheckCircle2 className="h-16 w-16 text-green-600" />
                            </div>
                            <h1 className="mb-2 text-4xl font-bold text-gray-900">
                                Submission Complete!
                            </h1>
                            <p className="text-lg text-gray-600">
                                Thank you, {invite.full_name}!
                            </p>
                        </div>
                    </div>

                    {/* Status Alert */}
                    <Alert className="border-blue-300 bg-blue-50">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <strong>What's Next?</strong> Our HR team will review your
                            submission. You'll receive an email notification once your
                            onboarding has been approved.
                        </AlertDescription>
                    </Alert>

                    {/* Checklist */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Submission Status</CardTitle>
                            <CardDescription>
                                Review the status of your submitted information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(checklist).map(([section, data], index) => (
                                    <div key={section} className="rounded-lg border bg-gray-50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-1 items-center gap-2">
                                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#2596be] text-xs font-bold text-white">
                                                    {index + 1}
                                                </div>
                                                <div className={`flex-shrink-0 ${
                                                    data.status === 'complete' ? 'text-green-600' :
                                                    data.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                    {getStatusIcon(data.status)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-gray-900">{data.label}</h3>
                                                    <p className="mt-1 text-sm text-gray-600">{data.message}</p>
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(data.status)}>
                                                {data.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents Summary */}
                    {submission.documents?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-[#2596be]" />
                                    Uploaded Documents ({submission.documents.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {submission.documents.map((doc: any) => (
                                        <div key={doc.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                                            <div className="flex items-start gap-2">
                                                <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium">{doc.document_type_label}</p>
                                                    <p className="truncate text-xs text-gray-500">{doc.filename}</p>
                                                </div>
                                            </div>
                                            <Badge className={`flex-shrink-0 ${
                                                doc.status === 'approved' ? 'border-green-200 bg-green-100 text-green-700' :
                                                doc.status === 'pending' ? 'border-yellow-200 bg-yellow-100 text-yellow-700' :
                                                'border-red-200 bg-red-100 text-red-700'
                                            }`}>
                                                {doc.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Next Steps */}
                    <Card className="border-2 border-[#2596be]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Rocket className="h-5 w-5 text-[#2596be]" />
                                What Happens Next?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#2596be] text-sm font-bold text-white">1</div>
                                <div className="flex-1">
                                    <h4 className="font-semibold leading-6 text-gray-900">HR Review</h4>
                                    <p className="text-sm text-gray-600">Our HR team will review your documents and information within 2-3 business days.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#2596be] text-sm font-bold text-white">2</div>
                                <div className="flex-1">
                                    <h4 className="font-semibold leading-6 text-gray-900">Email Notification</h4>
                                    <p className="text-sm text-gray-600">You'll receive an email at <strong>{invite.email}</strong> with the review results.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#2596be] text-sm font-bold text-white">3</div>
                                <div className="flex-1">
                                    <h4 className="font-semibold leading-6 text-gray-900">Account Activation</h4>
                                    <p className="text-sm text-gray-600">Once approved, you'll receive your login credentials and can start working!</p>
                                </div>
                            </div>

                            <Alert className="mt-4">
                                <UserCheck className="h-4 w-4" />
                                <AlertDescription>
                                    If you have any questions, please contact HR at{' '}
                                    <a href="mailto:hr@rocketpartners.com" className="font-semibold">
                                        hr@rocketpartners.com
                                    </a>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
