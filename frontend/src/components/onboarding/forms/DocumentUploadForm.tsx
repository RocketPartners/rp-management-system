/**
 * DocumentUploadForm - Step 4 of onboarding process
 * Handles document upload with multi-file support per document type
 */

import { StatusBadge } from '@/components/onboarding/shared/StatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BRAND_CLASSES } from '@/lib/constants/theme';
import {
    countRequiredDocumentTypes,
    countUploadedRequiredTypes,
    getDocumentsByType,
} from '@/lib/onboarding/document-helpers';
import type {
    DocumentFormData,
    FormState,
    RequiredDocuments,
    Submission,
    SubmissionStatus,
} from '@/types/onboarding';
import {
    CheckCircle2,
    ChevronLeft,
    FileText,
    Info,
    Loader2,
    Send,
    Trash2,
    Upload,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface DocumentUploadFormProps {
    /** Submission data with uploaded documents. */
    submission: Submission | null | undefined;
    /** Required document types configuration. */
    requiredDocuments: RequiredDocuments;
    /** Form state instance for document uploads. */
    documentForm: FormState<DocumentFormData>;
    /** Server-side validation status (can_submit, blocker, missing_documents). */
    submissionStatus: SubmissionStatus | null | undefined;
    /** Handler for going back to the previous step. */
    onBack: () => void;
    /** Handler for deleting a document. */
    onDeleteDocument: (documentId: number) => void;
    /** Handler for uploading a document. */
    onUpload: (e?: React.FormEvent | React.MouseEvent) => void;
    /** Handler for final submission. */
    onFinalSubmit: () => void;
}

/** Step 4 of onboarding — handles document upload with multi-file support. */
export const DocumentUploadForm = ({
    submission,
    requiredDocuments,
    documentForm,
    submissionStatus,
    onBack,
    onDeleteDocument,
    onUpload,
    onFinalSubmit,
}: DocumentUploadFormProps) => {
    const [selectedDocType, setSelectedDocType] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            documentForm.setData('file', file);
        }
    };

    const handleUpload = (e: React.MouseEvent) => {
        e.preventDefault();
        onUpload(e);
    };

    const uploadedRequiredCount = countUploadedRequiredTypes(
        requiredDocuments,
        submission?.documents,
    );
    const requiredCount = countRequiredDocumentTypes(requiredDocuments);

    // Use backend validation status which checks:
    // All required documents APPROVED (not just uploaded)
    const canSubmit = submissionStatus?.can_submit || false;
    const blockerMessage = submissionStatus?.blocker || null;

    // Get accepted file types for selected document type
    const getAcceptedFileTypes = () => {
        if (!selectedDocType || !requiredDocuments[selectedDocType]) {
            return '.pdf,.jpg,.jpeg,.png,.doc,.docx';
        }
        const formats =
            requiredDocuments[selectedDocType].accepted_formats || [];
        return formats.map((ext) => `.${ext}`).join(',');
    };

    // Get formatted file type display text
    const getFileTypeDisplayText = () => {
        if (!selectedDocType || !requiredDocuments[selectedDocType]) {
            return 'PDF, JPG, JPEG, PNG, DOC, DOCX (Max 10MB)';
        }
        const config = requiredDocuments[selectedDocType];
        const formats = (config.accepted_formats || [])
            .map((ext) => ext.toUpperCase())
            .join(', ');
        const maxSizeMB = Math.round((config.max_size || 10240) / 1024);
        return `${formats} (Max ${maxSizeMB}MB)`;
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Document Type Selector Grid */}
            <Card>
                <CardHeader>
                    <CardTitle
                        className={`flex items-center gap-2 ${BRAND_CLASSES.textPrimary}`}
                    >
                        <Upload className="h-5 w-5" />
                        Upload Required Documents
                    </CardTitle>
                    <CardDescription>
                        Select a document type below. You can upload multiple
                        files for each type.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Document Type Grid with Status Indicators */}
                    <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {Object.entries(requiredDocuments || {}).map(
                            ([key, doc]) => {
                                const documentsForType = getDocumentsByType(
                                    submission?.documents,
                                    key,
                                );
                                const isSelected = selectedDocType === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => {
                                            setSelectedDocType(key);
                                            documentForm.setData(
                                                'document_type',
                                                key,
                                            );
                                            documentForm.setData('file', null);
                                            documentForm.setData(
                                                'description',
                                                '',
                                            );
                                        }}
                                        className={`rounded-lg border-2 p-4 text-left transition-all ${
                                            isSelected
                                                ? `border-[#2596be] bg-blue-50`
                                                : documentsForType.length > 0
                                                  ? 'border-green-200 bg-green-50 hover:border-green-300'
                                                  : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <FileText
                                                        className={`h-4 w-4 ${
                                                            documentsForType.length >
                                                            0
                                                                ? 'text-green-600'
                                                                : 'text-gray-400'
                                                        }`}
                                                    />
                                                    <span className="text-sm font-medium">
                                                        {doc.label}
                                                        {doc.required && (
                                                            <span className="ml-1 text-red-600">
                                                                *
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                {doc.accepted_formats &&
                                                    doc.max_size && (
                                                        <p className="ml-6 mt-1 text-xs text-gray-500">
                                                            {doc.accepted_formats
                                                                .map((f) =>
                                                                    f.toUpperCase(),
                                                                )
                                                                .join(
                                                                    ', ',
                                                                )}{' '}
                                                            • Max{' '}
                                                            {doc.max_size >=
                                                            1024
                                                                ? `${doc.max_size / 1024}MB`
                                                                : `${doc.max_size}KB`}
                                                        </p>
                                                    )}
                                                {documentsForType.length >
                                                    0 && (
                                                    <div className="ml-6 mt-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {
                                                                documentsForType.length
                                                            }{' '}
                                                            file
                                                            {documentsForType.length !==
                                                            1
                                                                ? 's'
                                                                : ''}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                            {documentsForType.length > 0 && (
                                                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                                            )}
                                        </div>
                                    </button>
                                );
                            },
                        )}
                    </div>

                    {/* Upload Form for Selected Type */}
                    {selectedDocType ? (
                        <div className="space-y-4">
                            {/* Show existing files for this document type */}
                            {getDocumentsByType(
                                submission?.documents,
                                selectedDocType,
                            ).length > 0 && (
                                <Card className="border-green-200 bg-green-50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <FileText className="h-4 w-4 text-green-600" />
                                            Uploaded Files for{' '}
                                            {
                                                requiredDocuments[
                                                    selectedDocType
                                                ]?.label
                                            }
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {getDocumentsByType(
                                            submission?.documents,
                                            selectedDocType,
                                        ).map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between rounded-lg border border-green-200 bg-white p-3"
                                            >
                                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                                    <div className="rounded bg-green-100 p-2">
                                                        <FileText className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-gray-900">
                                                            {doc.filename}
                                                        </p>
                                                        {doc.description && (
                                                            <p className="truncate text-xs text-gray-500">
                                                                {
                                                                    doc.description
                                                                }
                                                            </p>
                                                        )}
                                                        {doc.status ===
                                                            'approved' && (
                                                            <p className="mt-1 text-xs text-green-600">
                                                                ✓ Approved by HR
                                                                - cannot be
                                                                deleted
                                                            </p>
                                                        )}
                                                    </div>
                                                    <StatusBadge
                                                        status={doc.status}
                                                        variant="document"
                                                        className="flex-shrink-0"
                                                    />
                                                </div>
                                                {/* Only show delete button for non-approved documents */}
                                                {doc.status !== 'approved' && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            onDeleteDocument(
                                                                doc.id,
                                                            )
                                                        }
                                                        className="ml-2 flex-shrink-0 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Upload New File Form */}
                            <Card
                                className={`border-2 ${BRAND_CLASSES.borderPrimary}`}
                            >
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {getDocumentsByType(
                                            submission?.documents,
                                            selectedDocType,
                                        ).length > 0
                                            ? `Add Another File for ${requiredDocuments[selectedDocType]?.label}`
                                            : `Upload ${requiredDocuments[selectedDocType]?.label}`}
                                    </CardTitle>
                                    <CardDescription>
                                        You can upload multiple files for this
                                        document type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Select File *</Label>
                                            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-[#2596be]">
                                                <Input
                                                    type="file"
                                                    accept={getAcceptedFileTypes()}
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="file-upload"
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    className="cursor-pointer"
                                                >
                                                    <Upload className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Click to upload or drag
                                                        and drop
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {getFileTypeDisplayText()}
                                                    </p>
                                                    {documentForm.data.file && (
                                                        <p
                                                            className={`text-sm ${BRAND_CLASSES.textPrimary} mt-2 font-medium`}
                                                        >
                                                            ✓{' '}
                                                            {
                                                                documentForm
                                                                    .data.file
                                                                    .name
                                                            }
                                                        </p>
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>
                                                Description (Optional)
                                            </Label>
                                            <Textarea
                                                value={
                                                    documentForm.data
                                                        .description
                                                }
                                                onChange={(e) =>
                                                    documentForm.setData(
                                                        'description',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Additional notes about this document..."
                                                rows={2}
                                                className="focus:border-[#2596be] focus:ring-[#2596be]" /* Using inline value for Tailwind JIT */
                                            />
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={handleUpload}
                                            disabled={
                                                documentForm.processing ||
                                                !documentForm.data.file
                                            }
                                            className={`w-full ${BRAND_CLASSES.buttonPrimary}`}
                                        >
                                            {documentForm.processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload File
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Alert className="border-gray-300">
                            <Info className="h-4 w-4 text-gray-600" />
                            <AlertDescription className="text-gray-700">
                                👆 Select a document type above to start
                                uploading
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* All Uploaded Documents - Grouped by Type */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>
                            All Uploaded Documents (
                            {submission?.documents?.length || 0})
                        </span>
                        <Badge className={`${BRAND_CLASSES.badgePrimary}`}>
                            {uploadedRequiredCount}/{requiredCount} Required
                            Types
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {submission?.documents &&
                    submission.documents.length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(requiredDocuments || {}).map(
                                ([key, doc]) => {
                                    const docsForType = getDocumentsByType(
                                        submission?.documents,
                                        key,
                                    );
                                    if (docsForType.length === 0) return null;

                                    return (
                                        <div key={key} className="space-y-2">
                                            <div className="mb-2 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <h4 className="text-sm font-semibold text-gray-700">
                                                    {doc.label}
                                                    {doc.required && (
                                                        <span className="ml-1 text-red-600">
                                                            *
                                                        </span>
                                                    )}
                                                </h4>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {docsForType.length} file
                                                    {docsForType.length !== 1
                                                        ? 's'
                                                        : ''}
                                                </Badge>
                                            </div>
                                            <div className="space-y-2 pl-6">
                                                {docsForType.map((document) => (
                                                    <div
                                                        key={document.id}
                                                        className="flex items-center justify-between rounded-lg border bg-gray-50 p-3 transition-colors hover:border-[#2596be]"
                                                    >
                                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                                            <div
                                                                className={`p-2 ${BRAND_CLASSES.bgPrimary} flex-shrink-0 rounded-lg`}
                                                            >
                                                                <FileText className="h-4 w-4 text-white" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-gray-900">
                                                                    {
                                                                        document.filename
                                                                    }
                                                                </p>
                                                                {document.description && (
                                                                    <p className="truncate text-xs text-gray-500">
                                                                        {
                                                                            document.description
                                                                        }
                                                                    </p>
                                                                )}
                                                                {document.status ===
                                                                    'approved' && (
                                                                    <p className="mt-1 text-xs text-green-600">
                                                                        ✓
                                                                        Approved
                                                                        by HR -
                                                                        cannot
                                                                        be
                                                                        deleted
                                                                    </p>
                                                                )}
                                                                {document.status ===
                                                                    'rejected' &&
                                                                    document.rejection_reason && (
                                                                        <div className="mt-2 rounded border border-red-200 bg-red-50 p-2">
                                                                            <p className="text-xs text-red-800">
                                                                                <strong>
                                                                                    Rejection
                                                                                    Reason:
                                                                                </strong>{' '}
                                                                                {
                                                                                    document.rejection_reason
                                                                                }
                                                                            </p>
                                                                            <p className="mt-1 text-xs text-red-600">
                                                                                Please
                                                                                delete
                                                                                this
                                                                                file
                                                                                and
                                                                                upload
                                                                                a
                                                                                corrected
                                                                                version.
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                            </div>
                                                            <StatusBadge
                                                                status={
                                                                    document.status
                                                                }
                                                                variant="document"
                                                                className="flex-shrink-0"
                                                            />
                                                        </div>
                                                        {/* Only show delete button for non-approved documents */}
                                                        {document.status !==
                                                            'approved' && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    onDeleteDocument(
                                                                        document.id,
                                                                    )
                                                                }
                                                                className="ml-2 flex-shrink-0 text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-500">
                            <Upload className="mx-auto mb-3 h-16 w-16 text-gray-300" />
                            <p className="text-lg font-medium">
                                No documents uploaded yet
                            </p>
                            <p className="mt-1 text-sm">
                                Select a document type above to get started
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submit Final */}
            <Card
                className={`border-2 ${BRAND_CLASSES.borderPrimary} bg-gradient-to-br from-blue-50 to-white`}
            >
                <CardContent className="pt-6">
                    <div className="mb-6 text-center">
                        <div
                            className={`inline-flex h-16 w-16 items-center justify-center ${canSubmit ? 'bg-green-600' : BRAND_CLASSES.bgPrimary} mb-4 rounded-full transition-colors`}
                        >
                            <Send className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-gray-900">
                            {canSubmit
                                ? 'Ready to Submit!'
                                : 'Submission Checklist'}
                        </h3>
                        <p className="mb-4 text-gray-600">
                            {uploadedRequiredCount} of {requiredCount} required
                            document types uploaded
                        </p>
                    </div>

                    {/* Validation Status Alerts */}
                    {!canSubmit && blockerMessage && (
                        <Alert className="mb-4 border-orange-300 bg-orange-50">
                            <Info className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                <strong>Cannot submit yet:</strong>
                                <p className="mt-2">{blockerMessage}</p>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Show document status breakdown */}
                    {!canSubmit &&
                        submission?.documents &&
                        submission.documents.length > 0 && (
                            <Alert className="mb-4 border-blue-300 bg-blue-50">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    <strong>Document Review Status:</strong>
                                    <ul className="mt-2 list-none space-y-1">
                                        {Object.entries(requiredDocuments || {})
                                            .filter(
                                                ([key, doc]) => doc.required,
                                            )
                                            .map(([key, doc]) => {
                                                const uploadedDoc =
                                                    submission.documents?.find(
                                                        (d) =>
                                                            d.document_type ===
                                                            key,
                                                    );
                                                const status =
                                                    uploadedDoc?.status ||
                                                    'not_uploaded';
                                                const statusColors: Record<
                                                    string,
                                                    string
                                                > = {
                                                    approved: 'text-green-700',
                                                    uploaded: 'text-blue-700',
                                                    rejected: 'text-red-700',
                                                    not_uploaded:
                                                        'text-gray-600',
                                                };
                                                const statusLabels: Record<
                                                    string,
                                                    string
                                                > = {
                                                    approved: 'Approved',
                                                    uploaded:
                                                        'Pending HR Review',
                                                    rejected:
                                                        'Rejected - Please re-upload',
                                                    not_uploaded:
                                                        'Not uploaded',
                                                };
                                                return (
                                                    <li
                                                        key={key}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span
                                                            className={`font-medium ${statusColors[status]}`}
                                                        >
                                                            {status ===
                                                            'approved'
                                                                ? '✓'
                                                                : status ===
                                                                    'rejected'
                                                                  ? '✗'
                                                                  : status ===
                                                                      'uploaded'
                                                                    ? '⏳'
                                                                    : '○'}
                                                        </span>
                                                        <span className="flex-1">
                                                            {doc.label}
                                                        </span>
                                                        <span
                                                            className={`text-sm ${statusColors[status]}`}
                                                        >
                                                            {
                                                                statusLabels[
                                                                    status
                                                                ]
                                                            }
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                    {canSubmit && (
                        <Alert className="mb-4 border-green-300 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                <strong>All requirements met!</strong>
                                <p className="mt-1">
                                    Your onboarding information is complete and
                                    all documents have been approved. Click
                                    "Submit to HR" to finalize your submission.
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={onBack}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button
                            onClick={onFinalSubmit}
                            disabled={!canSubmit}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Submit to HR
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DocumentUploadForm;
