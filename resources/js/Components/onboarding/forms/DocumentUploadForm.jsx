/**
 * DocumentUploadForm - Step 4 of onboarding process
 * Handles document upload with multi-file support per document type
 */

import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import {
    Upload,
    FileText,
    CheckCircle2,
    ChevronLeft,
    Send,
    Loader2,
    Info,
    Trash2,
} from 'lucide-react';
import { StatusBadge } from '@/components/onboarding/shared/StatusBadge';
import { BRAND_CLASSES } from '@/lib/constants/theme';
import { GUEST_ONBOARDING_ROUTES } from '@/lib/constants/onboarding/routes';
import {
    getDocumentsByType,
    countUploadedRequiredTypes,
    countRequiredDocumentTypes,
    hasDocumentType,
} from '@/lib/utils/documentHelpers';

/**
 * DocumentUploadForm component
 *
 * @param {Object} props
 * @param {Object} props.submission - Submission data with documents
 * @param {Object} props.requiredDocuments - Required document types configuration
 * @param {Object} props.documentForm - Inertia form instance for document uploads
 * @param {string} props.inviteToken - Invite token for API calls
 * @param {Function} props.onBack - Handler for going back to previous step
 * @param {Function} props.onDeleteDocument - Handler for deleting a document
 * @param {Function} props.onFinalSubmit - Handler for final submission
 * @returns {JSX.Element}
 */
export const DocumentUploadForm = ({
    submission,
    requiredDocuments,
    documentForm,
    inviteToken,
    onBack,
    onDeleteDocument,
    onFinalSubmit,
}) => {
    const [selectedDocType, setSelectedDocType] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            documentForm.setData('file', file);
        }
    };

    const handleUpload = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('document_type', documentForm.data.document_type);
        formData.append('file', documentForm.data.file);
        formData.append('description', documentForm.data.description || '');

        documentForm.post(route(GUEST_ONBOARDING_ROUTES.UPLOAD_DOCUMENT, inviteToken), {
            preserveScroll: true,
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                // Clear only file and description, keep document_type
                documentForm.setData('file', null);
                documentForm.setData('description', '');
                // Reset file input
                const fileInput = document.getElementById('file-upload');
                if (fileInput) fileInput.value = '';
            },
            onError: (errors) => {
                console.error('Upload failed:', errors);
                alert('Upload failed: ' + (errors.file || errors.document_type || 'Unknown error'));
            },
        });
    };

    const uploadedRequiredCount = countUploadedRequiredTypes(requiredDocuments, submission?.documents);
    const requiredCount = countRequiredDocumentTypes(requiredDocuments);
    const canSubmit = uploadedRequiredCount >= requiredCount;

    // Get accepted file types for selected document type
    const getAcceptedFileTypes = () => {
        if (!selectedDocType || !requiredDocuments[selectedDocType]) {
            return '.pdf,.jpg,.jpeg,.png,.doc,.docx';
        }
        const formats = requiredDocuments[selectedDocType].accepted_formats || [];
        return formats.map(ext => `.${ext}`).join(',');
    };

    // Get formatted file type display text
    const getFileTypeDisplayText = () => {
        if (!selectedDocType || !requiredDocuments[selectedDocType]) {
            return 'PDF, JPG, JPEG, PNG, DOC, DOCX (Max 10MB)';
        }
        const config = requiredDocuments[selectedDocType];
        const formats = (config.accepted_formats || []).map(ext => ext.toUpperCase()).join(', ');
        const maxSizeMB = Math.round((config.max_size || 10240) / 1024);
        return `${formats} (Max ${maxSizeMB}MB)`;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Document Type Selector Grid */}
            <Card>
                <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${BRAND_CLASSES.textPrimary}`}>
                        <Upload className="h-5 w-5" />
                        Upload Required Documents
                    </CardTitle>
                    <CardDescription>
                        Select a document type below. You can upload multiple files for each type.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Document Type Grid with Status Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {Object.entries(requiredDocuments || {}).map(([key, doc]) => {
                            const documentsForType = getDocumentsByType(submission?.documents, key);
                            const isSelected = selectedDocType === key;

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDocType(key);
                                        documentForm.setData('document_type', key);
                                        documentForm.setData('file', null);
                                        documentForm.setData('description', '');
                                    }}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${
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
                                                <FileText className={`h-4 w-4 ${
                                                    documentsForType.length > 0 ? 'text-green-600' : 'text-gray-400'
                                                }`} />
                                                <span className="font-medium text-sm">
                                                    {doc.label}
                                                    {doc.required && <span className="text-red-600 ml-1">*</span>}
                                                </span>
                                            </div>
                                            {doc.accepted_formats && doc.max_size && (
                                                <p className="text-xs text-gray-500 mt-1 ml-6">
                                                    {doc.accepted_formats.map(f => f.toUpperCase()).join(', ')} • Max {doc.max_size >= 1024 ? `${doc.max_size / 1024}MB` : `${doc.max_size}KB`}
                                                </p>
                                            )}
                                            {documentsForType.length > 0 && (
                                                <div className="mt-2 ml-6">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {documentsForType.length} file{documentsForType.length !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                        {documentsForType.length > 0 && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Upload Form for Selected Type */}
                    {selectedDocType ? (
                        <div className="space-y-4">
                            {/* Show existing files for this document type */}
                            {getDocumentsByType(submission?.documents, selectedDocType).length > 0 && (
                                <Card className="border-green-200 bg-green-50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-green-600" />
                                            Uploaded Files for {requiredDocuments[selectedDocType]?.label}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {getDocumentsByType(submission?.documents, selectedDocType).map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="p-2 bg-green-100 rounded">
                                                        <FileText className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-gray-900 truncate">
                                                            {doc.filename}
                                                        </p>
                                                        {doc.description && (
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {doc.description}
                                                            </p>
                                                        )}
                                                        {doc.status === 'approved' && (
                                                            <p className="text-xs text-green-600 mt-1">
                                                                ✓ Approved by HR - cannot be deleted
                                                            </p>
                                                        )}
                                                    </div>
                                                    <StatusBadge status={doc.status} variant="document" className="flex-shrink-0" />
                                                </div>
                                                {/* Only show delete button for non-approved documents */}
                                                {doc.status !== 'approved' && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDeleteDocument(doc.id)}
                                                        className="text-red-600 hover:bg-red-50 ml-2 flex-shrink-0"
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
                            <Card className={`border-2 ${BRAND_CLASSES.borderPrimary}`}>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        {getDocumentsByType(submission?.documents, selectedDocType).length > 0
                                            ? `Add Another File for ${requiredDocuments[selectedDocType]?.label}`
                                            : `Upload ${requiredDocuments[selectedDocType]?.label}`
                                        }
                                    </CardTitle>
                                    <CardDescription>
                                        You can upload multiple files for this document type
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Select File *</Label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#2596be] transition-colors">
                                                <Input
                                                    type="file"
                                                    accept={getAcceptedFileTypes()}
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id="file-upload"
                                                />
                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Click to upload or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {getFileTypeDisplayText()}
                                                    </p>
                                                    {documentForm.data.file && (
                                                        <p className={`text-sm ${BRAND_CLASSES.textPrimary} font-medium mt-2`}>
                                                            ✓ {documentForm.data.file.name}
                                                        </p>
                                                    )}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Description (Optional)</Label>
                                            <Textarea
                                                value={documentForm.data.description}
                                                onChange={(e) => documentForm.setData('description', e.target.value)}
                                                placeholder="Additional notes about this document..."
                                                rows={2}
                                                className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                                            />
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={handleUpload}
                                            disabled={documentForm.processing || !documentForm.data.file}
                                            className={`w-full ${BRAND_CLASSES.buttonPrimary}`}
                                        >
                                            {documentForm.processing ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
                                            ) : (
                                                <><Upload className="h-4 w-4 mr-2" />Upload File</>
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
                                👆 Select a document type above to start uploading
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* All Uploaded Documents - Grouped by Type */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>All Uploaded Documents ({submission?.documents?.length || 0})</span>
                        <Badge className={`${BRAND_CLASSES.badgePrimary}`}>
                            {uploadedRequiredCount}/{requiredCount} Required Types
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {submission?.documents && submission.documents.length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(requiredDocuments || {}).map(([key, doc]) => {
                                const docsForType = getDocumentsByType(submission?.documents, key);
                                if (docsForType.length === 0) return null;

                                return (
                                    <div key={key} className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            <h4 className="font-semibold text-sm text-gray-700">
                                                {doc.label}
                                                {doc.required && <span className="text-red-600 ml-1">*</span>}
                                            </h4>
                                            <Badge variant="secondary" className="text-xs">
                                                {docsForType.length} file{docsForType.length !== 1 ? 's' : ''}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2 pl-6">
                                            {docsForType.map((document) => (
                                                <div
                                                    key={document.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:border-[#2596be] transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className={`p-2 ${BRAND_CLASSES.bgPrimary} rounded-lg flex-shrink-0`}>
                                                            <FileText className="h-4 w-4 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm text-gray-900 truncate">
                                                                {document.filename}
                                                            </p>
                                                            {document.description && (
                                                                <p className="text-xs text-gray-500 truncate">
                                                                    {document.description}
                                                                </p>
                                                            )}
                                                            {document.status === 'approved' && (
                                                                <p className="text-xs text-green-600 mt-1">
                                                                    ✓ Approved by HR - cannot be deleted
                                                                </p>
                                                            )}
                                                        </div>
                                                        <StatusBadge status={document.status} variant="document" className="flex-shrink-0" />
                                                    </div>
                                                    {/* Only show delete button for non-approved documents */}
                                                    {document.status !== 'approved' && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onDeleteDocument(document.id)}
                                                            className="text-red-600 hover:bg-red-50 ml-2 flex-shrink-0"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Upload className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                            <p className="text-lg font-medium">No documents uploaded yet</p>
                            <p className="text-sm mt-1">Select a document type above to get started</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Submit Final */}
            <Card className={`border-2 ${BRAND_CLASSES.borderPrimary} bg-gradient-to-br from-blue-50 to-white`}>
                <CardContent className="pt-6">
                    <div className="text-center mb-6">
                        <div className={`inline-flex items-center justify-center w-16 h-16 ${BRAND_CLASSES.bgPrimary} rounded-full mb-4`}>
                            <Send className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Ready to Submit?
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {uploadedRequiredCount} of {requiredCount} required document types completed
                        </p>
                    </div>

                    {/* Missing Required Document Types Alert */}
                    {!canSubmit && (
                        <Alert className="mb-4 border-orange-300 bg-orange-50">
                            <Info className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                                <strong>Missing required documents:</strong>
                                <ul className="list-disc list-inside mt-2">
                                    {Object.entries(requiredDocuments || {})
                                        .filter(([key, doc]) => doc.required && !hasDocumentType(submission?.documents, key))
                                        .map(([key, doc]) => (
                                            <li key={key}>{doc.label}</li>
                                        ))
                                    }
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={onBack}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <Button
                            onClick={onFinalSubmit}
                            disabled={!canSubmit}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Submit to HR
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DocumentUploadForm;
