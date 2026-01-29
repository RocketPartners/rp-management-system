// resources/js/Pages/Admin/Onboarding/Submissions/Review.jsx
import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import {
    FileCheck,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    FileText,
    Download,
    Eye,
    User,
    Mail,
    Phone,
    CreditCard,
    AlertTriangle,
    UserCheck,
    Briefcase,
    Building2,
    Lock,
    Unlock,
} from 'lucide-react';
import { StatusBadge } from '@/components/onboarding/shared/StatusBadge';
import { DocumentCard } from '@/components/onboarding/shared/DocumentCard';
import { ADMIN_ONBOARDING_ROUTES } from '@/lib/constants/onboarding/routes';
import { groupDocumentsByType } from '@/lib/utils/documentHelpers';
import { generateWorkEmail, DEFAULT_TEMP_PASSWORD } from '@/lib/utils/emailHelpers';

export default function Review({ submission, checklist }) {
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showConvertDialog, setShowConvertDialog] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [showDocRejectDialog, setShowDocRejectDialog] = useState(false);

    const approveForm = useForm({});

    const rejectForm = useForm({
        rejection_reason: '',
    });

    const docRejectForm = useForm({
        rejection_reason: '',
    });

    // Check if any documents are rejected (prevents approve all)
    const hasRejectedDocuments = submission.documents?.some(doc => doc.status === 'rejected') || false;
    const rejectedCount = submission.documents?.filter(doc => doc.status === 'rejected').length || 0;
    const uploadedCount = submission.documents?.filter(doc => doc.status === 'uploaded').length || 0;

    const approveDocument = (document) => {
        router.post(route(ADMIN_ONBOARDING_ROUTES.APPROVE_DOCUMENT, document.id), {}, {
            preserveScroll: true,
        });
    };

    const openRejectDocDialog = (document) => {
        setSelectedDocument(document);
        setShowDocRejectDialog(true);
    };

    const rejectDocument = () => {
        if (selectedDocument) {
            docRejectForm.post(route(ADMIN_ONBOARDING_ROUTES.REJECT_DOCUMENT, selectedDocument.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDocRejectDialog(false);
                    docRejectForm.reset();
                    setSelectedDocument(null);
                },
            });
        }
    };

    const handleApproveSubmission = () => {
        approveForm.post(route(ADMIN_ONBOARDING_ROUTES.APPROVE, submission.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowApproveDialog(false);
                approveForm.reset();
            },
        });
    };

    const handleRejectSubmission = () => {
        rejectForm.post(route(ADMIN_ONBOARDING_ROUTES.REJECT, submission.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectDialog(false);
                rejectForm.reset();
            },
        });
    };

    const handleConvertToUser = () => {
        router.post(route(ADMIN_ONBOARDING_ROUTES.CONVERT_TO_USER, submission.invite.id), {
            onSuccess: () => {
                setShowConvertDialog(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Review - ${submission.invite.first_name} ${submission.invite.last_name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route(ADMIN_ONBOARDING_ROUTES.INDEX)}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Submissions
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {submission.invite.first_name} {submission.invite.last_name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">
                                    <Briefcase className="h-3 w-3 mr-1" />
                                    {submission.invite.position}
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 border">
                                    <Building2 className="h-3 w-3 mr-1" />
                                    {submission.invite.department}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {(submission.status === 'draft') && (
                            <>
                                <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => setShowRejectDialog(true)}
                                >
                                    <Unlock className="h-4 w-4 mr-2" />
                                    Request Revisions
                                </Button>
                                <div className="relative">
                                    <Button
                                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => setShowApproveDialog(true)}
                                        disabled={hasRejectedDocuments || uploadedCount === 0}
                                        title={hasRejectedDocuments
                                            ? `Cannot approve: ${rejectedCount} document(s) rejected and need to be reuploaded`
                                            : uploadedCount === 0
                                            ? 'No documents waiting for approval'
                                            : 'Approve all uploaded documents'}
                                    >
                                        <Lock className="h-4 w-4 mr-2" />
                                        Approve All
                                    </Button>
                                </div>
                            </>
                        )}

                        {submission.status === 'approved' && !submission.invite.converted_user_id && (
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setShowConvertDialog(true)}
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Convert to User Account
                            </Button>
                        )}
                    </div>
                </div>

                {/* Overall Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Completion Progress</span>
                            <span className="text-2xl font-bold text-blue-600">{submission.completion_percentage}%</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={submission.completion_percentage} className="h-3" />
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {/* Change from checklist.map to Object.values */}
                            {Object.values(checklist || {}).map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    {item.completed ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-gray-300" />
                                    )}
                                    <span className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {item.section}
                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Personal Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {submission.personal_info ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium">
                                                {submission.personal_info.first_name} {submission.personal_info.middle_name} {submission.personal_info.last_name} {submission.personal_info.suffix !== 'none' ? submission.personal_info.suffix : ''}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Birthday</p>
                                            <p className="font-medium">{submission.personal_info.birthday || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Gender</p>
                                            <p className="font-medium">{submission.personal_info.gender || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Civil Status</p>
                                            <p className="font-medium">{submission.personal_info.civil_status || '—'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-500">Address</p>
                                            <p className="font-medium">
                                                {submission.personal_info.address_line_1}, {submission.personal_info.city}, {submission.personal_info.country}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium">{submission.personal_info.phone_number || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Mobile</p>
                                            <p className="font-medium">{submission.personal_info.mobile_number || '—'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">Not yet filled</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Government IDs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Government IDs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {submission.government_ids ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">SSS Number</p>
                                            <p className="font-medium font-mono">{submission.government_ids.sss_number || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">TIN Number</p>
                                            <p className="font-medium font-mono">{submission.government_ids.tin_number || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">HDMF/Pag-IBIG</p>
                                            <p className="font-medium font-mono">{submission.government_ids.hdmf_number || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">PhilHealth</p>
                                            <p className="font-medium font-mono">{submission.government_ids.philhealth_number || '—'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">Not yet filled</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Emergency Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Emergency Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {submission.emergency_contact ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium">{submission.emergency_contact.name || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Relationship</p>
                                            <p className="font-medium">{submission.emergency_contact.relationship || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium">{submission.emergency_contact.phone || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Mobile</p>
                                            <p className="font-medium">{submission.emergency_contact.mobile || '—'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">Not yet filled</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Documents & Actions */}
                    <div className="space-y-6">
                        {/* Documents - Enhanced with Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Uploaded Documents ({submission.documents?.length || 0})
                                </CardTitle>
                                <CardDescription>
                                    Review and approve required clearances and documents
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Alert when rejected documents block Approve All */}
                                {hasRejectedDocuments && (
                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="text-red-800 text-sm">
                                            <strong>Action Required:</strong> {rejectedCount} document(s) {rejectedCount === 1 ? 'is' : 'are'} rejected.
                                            The candidate must reupload {rejectedCount === 1 ? 'this document' : 'these documents'} before you can use "Approve All".
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {submission.documents && submission.documents.length > 0 ? (
                                    // Group documents by type using helper
                                    Object.entries(
                                        groupDocumentsByType(submission.documents)
                                    ).map(([docType, docs]) => (
                                        <div key={docType} className="space-y-2">
                                            {/* Document Type Header */}
                                            <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                    <span className="font-semibold text-sm text-gray-900">
                                {docs[0].document_type_label}
                            </span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {docs.length} file{docs.length !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                                {/* Show overall status for this doc type */}
                                                {docs.every(d => d.status === 'approved') && (
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                )}
                                            </div>

                                            {/* Individual files */}
                                            <div className="space-y-2 pl-4">
                                                {docs.map((doc) => (
                                                    <DocumentCard
                                                        key={doc.id}
                                                        document={doc}
                                                        showActions={true}
                                                        showAdminActions={true}
                                                        onApprove={approveDocument}
                                                        onReject={openRejectDocDialog}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                        <p className="font-medium">No documents uploaded yet</p>
                                        <p className="text-sm mt-1">Candidate hasn't uploaded any documents</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submission Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Submission Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <div className="mt-1">
                                        <StatusBadge status={submission.status} variant="submission" />
                                    </div>
                                </div>

                                {submission.submitted_at && (
                                    <div>
                                        <p className="text-sm text-gray-500">Submitted Date</p>
                                        <p className="font-medium">{new Date(submission.submitted_at).toLocaleString()}</p>
                                    </div>
                                )}

                                {submission.reviewed_at && (
                                    <div>
                                        <p className="text-sm text-gray-500">Reviewed Date</p>
                                        <p className="font-medium">{new Date(submission.reviewed_at).toLocaleString()}</p>
                                    </div>
                                )}

                                {submission.reviewer && (
                                    <div>
                                        <p className="text-sm text-gray-500">Reviewed By</p>
                                        <p className="font-medium">{submission.reviewer.name}</p>
                                    </div>
                                )}

                                {submission.hr_notes && (
                                    <div>
                                        <p className="text-sm text-gray-500">HR Notes</p>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{submission.hr_notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Preview Work Email */}
                        {submission.personal_info && (
                            <Card className="border-blue-200 bg-blue-50">
                                <CardHeader>
                                    <CardTitle className="text-sm text-blue-900">Work Email Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                        <code className="text-sm font-mono text-blue-900">{generateWorkEmail(submission.personal_info)}</code>
                                    </div>
                                    <p className="text-xs text-blue-700 mt-2">
                                        This will be their login username after conversion
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Approve All Documents Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Approve All Documents
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will approve <strong>all uploaded documents</strong> for <strong>{submission.invite.first_name} {submission.invite.last_name}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <Alert className="border-yellow-200 bg-yellow-50">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800 text-sm">
                                <strong>Warning:</strong> This will mark all uploaded documents as approved.
                                Make sure you have reviewed each document before proceeding.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApproveSubmission}
                            disabled={approveForm.processing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Approve All Documents
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject All Documents Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            Reject All Documents
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will reject <strong>all documents</strong> for <strong>{submission.invite.first_name} {submission.invite.last_name}</strong>.
                            The candidate will need to reupload valid documents.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-4">
                        <Alert className="border-red-200 bg-red-50 mb-4">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800 text-sm">
                                <strong>Warning:</strong> All uploaded and approved documents will be marked as rejected.
                                The candidate will be notified to make corrections.
                            </AlertDescription>
                        </Alert>

                        <Label>Reason for Rejection *</Label>
                        <Textarea
                            value={rejectForm.data.rejection_reason}
                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                            placeholder="Explain what needs to be corrected in the documents..."
                            rows={4}
                            required
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRejectSubmission}
                            disabled={rejectForm.processing || !rejectForm.data.rejection_reason}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Reject All Documents
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Document Dialog */}
            <AlertDialog open={showDocRejectDialog} onOpenChange={setShowDocRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            Reject Document
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Reject <strong>{selectedDocument?.document_type_label}</strong>?
                            The candidate will need to reupload a valid document.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-4">
                        <Label>Rejection Reason *</Label>
                        <Textarea
                            value={docRejectForm.data.rejection_reason}
                            onChange={(e) => docRejectForm.setData('rejection_reason', e.target.value)}
                            placeholder="Why is this document being rejected?"
                            rows={3}
                            required
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setShowDocRejectDialog(false);
                            docRejectForm.reset();
                            setSelectedDocument(null);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={rejectDocument}
                            disabled={docRejectForm.processing || !docRejectForm.data.rejection_reason}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Reject Document
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Convert to User Dialog */}
            <AlertDialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                            Convert to User Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will create a user account with the following details:
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-3 py-4 bg-gray-50 rounded-lg p-4">
                        <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">
                                {submission.personal_info?.first_name} {submission.personal_info?.last_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Work Email (Login Username)</p>
                            <code className="text-sm font-mono text-blue-600">{generateWorkEmail(submission.personal_info)}</code>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Position</p>
                            <p className="font-medium">{submission.invite.position}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Department</p>
                            <p className="font-medium">{submission.invite.department}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Temporary Password</p>
                            <code className="text-sm font-mono text-orange-600">{DEFAULT_TEMP_PASSWORD}</code>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> A welcome email will be sent with login credentials.
                        </p>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConvertToUser}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Create User Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
