import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { usePermission } from '@/hooks/usePermission';
import { apiGet, apiPatch, apiPost } from '@/lib/spring-boot-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft,
    CheckCircle2,
    Download,
    Eye,
    FileText,
    Loader2,
    Mail,
    Phone,
    User,
    UserCheck,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

// ============================================
// Types
// ============================================

interface DocumentResponse {
    id: number;
    submissionId: number;
    documentType: string;
    documentTypeLabel: string;
    fileName: string;
    contentType: string | null;
    fileSize: number | null;
    status: string;
    rejectionReason: string | null;
    downloadUrl: string;
    uploadedAt: string | null;
    createdAt: string;
}

interface SubmissionDetailResponse {
    id: number;
    inviteId: number;
    applicantName: string;
    applicantEmail: string;
    position: string | null;
    department: string | null;
    status: string;
    currentStep: number;
    personalInfo: Record<string, unknown> | null;
    emergencyContact: Record<string, unknown> | null;
    notes: string | null;
    reviewedById: number | null;
    reviewedByName: string | null;
    reviewedAt: string | null;
    convertedUserId: number | null;
    totalDocuments: number;
    approvedDocuments: number;
    documents: DocumentResponse[];
    createdAt: string;
    updatedAt: string;
}

// ============================================
// Helpers
// ============================================

const STATUS_COLORS: Record<string, string> = {
    draft: 'border-gray-200 bg-gray-100 text-gray-700',
    submitted: 'border-yellow-200 bg-yellow-100 text-yellow-700',
    under_review: 'border-blue-200 bg-blue-100 text-blue-700',
    approved: 'border-green-200 bg-green-100 text-green-700',
    rejected: 'border-red-200 bg-red-100 text-red-700',
    converted: 'border-purple-200 bg-purple-100 text-purple-700',
    pending: 'border-yellow-200 bg-yellow-100 text-yellow-700',
};

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    converted: 'Converted',
    pending: 'Pending',
};

const DOC_STATUS_COLORS: Record<string, string> = {
    pending: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    approved: 'border-green-200 bg-green-50 text-green-700',
    rejected: 'border-red-200 bg-red-50 text-red-700',
};

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getApiBaseUrl() {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
}

// ============================================
// Component
// ============================================

export default function OnboardingSubmissionShow() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { can } = usePermission();
    const queryClient = useQueryClient();
    const canManage = can('onboarding.manage');

    // State
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showConvertDialog, setShowConvertDialog] = useState(false);
    const [showDocRejectDialog, setShowDocRejectDialog] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
    const [rejectionNotes, setRejectionNotes] = useState('');
    const [docRejectionReason, setDocRejectionReason] = useState('');

    // Query
    const { data: submission, isLoading } = useQuery({
        queryKey: ['onboarding-submission', id],
        queryFn: () => apiGet<SubmissionDetailResponse>(`/onboarding/submissions/${id}`),
        enabled: !!id,
    });

    // Mutations
    const reviewMutation = useMutation({
        mutationFn: ({ status, notes }: { status: string; notes?: string }) =>
            apiPatch<SubmissionDetailResponse>(`/onboarding/submissions/${id}/review`, { status, notes }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-submission', id] });
            queryClient.invalidateQueries({ queryKey: ['onboarding-submissions'] });
            if (variables.status === 'approved') {
                setShowApproveDialog(false);
                toast.success('Submission approved');
            } else {
                setShowRejectDialog(false);
                toast.success('Submission rejected');
            }
        },
        onError: () => toast.error('Failed to review submission'),
    });

    const docReviewMutation = useMutation({
        mutationFn: ({
            docId,
            status,
            rejectionReason,
        }: {
            docId: number;
            status: string;
            rejectionReason?: string;
        }) =>
            apiPatch<DocumentResponse>(`/onboarding/submissions/${id}/documents/${docId}/review`, {
                status,
                rejectionReason,
            }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-submission', id] });
            if (variables.status === 'approved') {
                toast.success('Document approved');
            } else {
                setShowDocRejectDialog(false);
                toast.success('Document rejected');
            }
        },
        onError: () => toast.error('Failed to review document'),
    });

    const convertMutation = useMutation({
        mutationFn: () => apiPost<SubmissionDetailResponse>(`/onboarding/submissions/${id}/convert`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-submission', id] });
            queryClient.invalidateQueries({ queryKey: ['onboarding-submissions'] });
            setShowConvertDialog(false);
            toast.success('User account created successfully');
        },
        onError: () => toast.error('Failed to convert to user'),
    });

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-3 gap-6">
                    <Skeleton className="col-span-2 h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="py-12 text-center text-gray-500">
                <p className="font-medium">Submission not found</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/onboarding/submissions')}>
                    Back to Submissions
                </Button>
            </div>
        );
    }

    const progress =
        submission.totalDocuments > 0
            ? Math.round((submission.approvedDocuments / submission.totalDocuments) * 100)
            : 0;

    const allDocsApproved =
        submission.documents.length > 0 && submission.documents.every((d) => d.status === 'approved');
    const canApprove = ['submitted', 'under_review'].includes(submission.status);
    const canConvert = submission.status === 'approved' && !submission.convertedUserId;

    // Group documents by type
    const docsByType: Record<string, DocumentResponse[]> = {};
    for (const doc of submission.documents) {
        if (!docsByType[doc.documentType]) docsByType[doc.documentType] = [];
        docsByType[doc.documentType].push(doc);
    }

    const personalInfo = (submission.personalInfo as Record<string, string>) || {};
    const emergencyContact = (submission.emergencyContact as Record<string, string>) || {};

    return (
        <>
            <Helmet>
                <title>Review Submission — {submission.applicantName}</title>
            </Helmet>

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/onboarding/submissions')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2596be]">
                                <span className="text-lg font-semibold text-white">
                                    {submission.applicantName
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .slice(0, 2)}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {submission.applicantName}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Badge className={STATUS_COLORS[submission.status] || ''}>
                                        {STATUS_LABELS[submission.status] || submission.status}
                                    </Badge>
                                    {submission.position && (
                                        <span className="text-sm text-gray-500">{submission.position}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {canManage && canApprove && (
                            <>
                                <Button
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        setRejectionNotes('');
                                        setShowRejectDialog(true);
                                    }}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => setShowApproveDialog(true)}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                            </>
                        )}
                        {canManage && canConvert && (
                            <Button
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => setShowConvertDialog(true)}
                            >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Convert to User
                            </Button>
                        )}
                    </div>
                </div>

                {/* Progress Card */}
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="mb-1 flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700">Document Review Progress</span>
                                    <span className="text-gray-500">
                                        {submission.approvedDocuments}/{submission.totalDocuments} approved
                                    </span>
                                </div>
                                <Progress value={progress} className="h-3" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">{progress}%</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Personal Info */}
                        {Object.keys(personalInfo).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {personalInfo.firstName && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">First Name</p>
                                                <p className="mt-1">{personalInfo.firstName}</p>
                                            </div>
                                        )}
                                        {personalInfo.middleName && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Middle Name</p>
                                                <p className="mt-1">{personalInfo.middleName}</p>
                                            </div>
                                        )}
                                        {personalInfo.lastName && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Last Name</p>
                                                <p className="mt-1">{personalInfo.lastName}</p>
                                            </div>
                                        )}
                                        {personalInfo.dateOfBirth && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                                                <p className="mt-1">{personalInfo.dateOfBirth}</p>
                                            </div>
                                        )}
                                        {personalInfo.phone && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                                <p className="mt-1">{personalInfo.phone}</p>
                                            </div>
                                        )}
                                        {personalInfo.address && (
                                            <div className="col-span-2">
                                                <p className="text-sm font-medium text-gray-500">Address</p>
                                                <p className="mt-1">
                                                    {personalInfo.address}
                                                    {personalInfo.city && `, ${personalInfo.city}`}
                                                    {personalInfo.state && `, ${personalInfo.state}`}
                                                    {personalInfo.postalCode && ` ${personalInfo.postalCode}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Emergency Contact */}
                        {Object.keys(emergencyContact).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="h-5 w-5" />
                                        Emergency Contact
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {emergencyContact.name && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Name</p>
                                                <p className="mt-1">{emergencyContact.name}</p>
                                            </div>
                                        )}
                                        {emergencyContact.relationship && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Relationship</p>
                                                <p className="mt-1">{emergencyContact.relationship}</p>
                                            </div>
                                        )}
                                        {emergencyContact.phone && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                                <p className="mt-1">{emergencyContact.phone}</p>
                                            </div>
                                        )}
                                        {emergencyContact.mobile && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Mobile</p>
                                                <p className="mt-1">{emergencyContact.mobile}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Documents */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Documents
                                </CardTitle>
                                <CardDescription>
                                    Review and approve each document individually
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {submission.documents.length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(docsByType).map(([type, docs]) => (
                                            <div key={type}>
                                                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                    {docs[0].documentTypeLabel}
                                                    {docs.every((d) => d.status === 'approved') && (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    )}
                                                </h4>
                                                <div className="space-y-2">
                                                    {docs.map((doc) => (
                                                        <div
                                                            key={doc.id}
                                                            className={`flex items-center justify-between rounded-lg border p-3 ${DOC_STATUS_COLORS[doc.status] || ''}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-5 w-5 text-gray-400" />
                                                                <div>
                                                                    <p className="text-sm font-medium">
                                                                        {doc.fileName}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {doc.fileSize
                                                                            ? formatFileSize(doc.fileSize)
                                                                            : ''}
                                                                        {doc.status === 'rejected' &&
                                                                            doc.rejectionReason && (
                                                                                <span className="ml-2 text-red-600">
                                                                                    — {doc.rejectionReason}
                                                                                </span>
                                                                            )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    className={
                                                                        DOC_STATUS_COLORS[doc.status] || ''
                                                                    }
                                                                >
                                                                    {doc.status.charAt(0).toUpperCase() +
                                                                        doc.status.slice(1)}
                                                                </Badge>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        const url = `${getApiBaseUrl()}${doc.downloadUrl}`;
                                                                        window.open(url, '_blank');
                                                                    }}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                {canManage &&
                                                                    doc.status !== 'approved' && (
                                                                        <Button
                                                                            size="sm"
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                            onClick={() =>
                                                                                docReviewMutation.mutate({
                                                                                    docId: doc.id,
                                                                                    status: 'approved',
                                                                                })
                                                                            }
                                                                            disabled={docReviewMutation.isPending}
                                                                        >
                                                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                            Approve
                                                                        </Button>
                                                                    )}
                                                                {canManage &&
                                                                    doc.status !== 'rejected' && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="text-red-600 hover:bg-red-50"
                                                                            onClick={() => {
                                                                                setSelectedDocId(doc.id);
                                                                                setDocRejectionReason('');
                                                                                setShowDocRejectDialog(true);
                                                                            }}
                                                                        >
                                                                            <XCircle className="mr-1 h-3 w-3" />
                                                                            Reject
                                                                        </Button>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-500">
                                        <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                                        <p className="text-sm">No documents uploaded yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 p-6">
                        {/* Submission Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Submission Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <Badge className={`mt-1 ${STATUS_COLORS[submission.status] || ''}`}>
                                        {STATUS_LABELS[submission.status] || submission.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="mt-1 flex items-center gap-1 text-sm">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        {submission.applicantEmail}
                                    </p>
                                </div>
                                {submission.position && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Position</p>
                                        <p className="mt-1 text-sm">{submission.position}</p>
                                    </div>
                                )}
                                {submission.department && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Department</p>
                                        <p className="mt-1 text-sm">{submission.department}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Created</p>
                                    <p className="mt-1 text-sm">{formatDate(submission.createdAt)}</p>
                                </div>
                                {submission.reviewedByName && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Reviewed By</p>
                                        <p className="mt-1 text-sm">{submission.reviewedByName}</p>
                                    </div>
                                )}
                                {submission.reviewedAt && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Reviewed At</p>
                                        <p className="mt-1 text-sm">{formatDate(submission.reviewedAt)}</p>
                                    </div>
                                )}
                                {submission.notes && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">HR Notes</p>
                                        <p className="mt-1 text-sm text-gray-700">{submission.notes}</p>
                                    </div>
                                )}
                                {submission.convertedUserId && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Converted User</p>
                                        <Button
                                            variant="link"
                                            className="mt-1 h-auto p-0"
                                            onClick={() =>
                                                navigate(`/users/${submission.convertedUserId}`)
                                            }
                                        >
                                            View User Profile
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* Approve Submission Dialog */}
            {/* ============================================ */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will approve {submission?.applicantName}'s onboarding submission.
                            {!allDocsApproved && (
                                <span className="mt-2 block font-medium text-orange-600">
                                    Note: Not all documents have been approved yet.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => reviewMutation.mutate({ status: 'approved' })}
                        >
                            Approve
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ============================================ */}
            {/* Reject Submission Dialog */}
            {/* ============================================ */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will reject {submission?.applicantName}'s onboarding submission.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label>Reason (optional)</Label>
                        <Textarea
                            className="mt-2"
                            placeholder="Enter rejection reason..."
                            value={rejectionNotes}
                            onChange={(e) => setRejectionNotes(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() =>
                                reviewMutation.mutate({ status: 'rejected', notes: rejectionNotes })
                            }
                        >
                            Reject
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ============================================ */}
            {/* Document Reject Dialog */}
            {/* ============================================ */}
            <AlertDialog open={showDocRejectDialog} onOpenChange={setShowDocRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Document</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejecting this document.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label>Rejection Reason</Label>
                        <Textarea
                            className="mt-2"
                            placeholder="e.g., Document is blurry, please re-upload"
                            value={docRejectionReason}
                            onChange={(e) => setDocRejectionReason(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                                if (selectedDocId) {
                                    docReviewMutation.mutate({
                                        docId: selectedDocId,
                                        status: 'rejected',
                                        rejectionReason: docRejectionReason,
                                    });
                                }
                            }}
                        >
                            Reject Document
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ============================================ */}
            {/* Convert to User Dialog */}
            {/* ============================================ */}
            <AlertDialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Convert to User Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will create a user account for {submission?.applicantName}. They will
                            receive a welcome email with login credentials.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {submission && (
                        <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Full Name</span>
                                <span className="font-medium">{submission.applicantName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email</span>
                                <span className="font-medium">{submission.applicantEmail}</span>
                            </div>
                            {submission.position && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Position</span>
                                    <span className="font-medium">{submission.position}</span>
                                </div>
                            )}
                            {submission.department && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Department</span>
                                    <span className="font-medium">{submission.department}</span>
                                </div>
                            )}
                            <p className="mt-2 text-xs text-gray-400">
                                A temporary password will be generated and sent via email.
                            </p>
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => convertMutation.mutate()}
                            disabled={convertMutation.isPending}
                        >
                            {convertMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create User Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
