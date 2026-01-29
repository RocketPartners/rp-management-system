/**
 * DocumentCard component
 * Displays a single document with status, actions, and metadata
 * Eliminates duplicate document display logic across Form.jsx and Review.jsx
 */

import { Button } from '@/Components/ui/button';
import { getDocumentStatusConfig } from '@/lib/constants/onboarding/statuses';
import { Download, Eye, FileText, Lock, Trash2, Unlock } from 'lucide-react';
import React from 'react';
import { StatusBadge } from './StatusBadge';

/**
 * DocumentCard - Single document display component
 *
 * @param {Object} props
 * @param {Object} props.document - Document object with filename, status, etc.
 * @param {Function} props.onDelete - Delete handler (optional)
 * @param {Function} props.onApprove - Approve handler (optional, admin only)
 * @param {Function} props.onReject - Reject handler (optional, admin only)
 * @param {boolean} props.showActions - Show action buttons (default: true)
 * @param {boolean} props.showAdminActions - Show admin approve/reject buttons (default: false)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element}
 */
export const DocumentCard = React.memo(
    ({
        document,
        onDelete,
        onApprove,
        onReject,
        showActions = true,
        showAdminActions = false,
        className = '',
    }) => {
        const statusConfig = getDocumentStatusConfig(document.status);
        const isPending =
            document.status === 'pending' || document.status === 'uploaded';
        const isRejected = document.status === 'rejected';
        const isApproved = document.status === 'approved';

        return (
            <div
                className={`space-y-3 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md ${className}`}
            >
                {/* Document Info */}
                <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            {/* Icon with status color */}
                            <div
                                className={`rounded p-1.5 ${statusConfig.iconBgColor}`}
                            >
                                <FileText
                                    className={`h-4 w-4 ${statusConfig.iconColor}`}
                                />
                            </div>

                            {/* Filename */}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                    {document.filename}
                                </p>
                                {document.file_size && document.created_at && (
                                    <p className="text-xs text-gray-500">
                                        {document.file_size} • Uploaded{' '}
                                        {new Date(
                                            document.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {document.description && (
                            <div className="mb-2 rounded bg-gray-50 p-2">
                                <p className="text-xs text-gray-600">
                                    <strong>Note:</strong>{' '}
                                    {document.description}
                                </p>
                            </div>
                        )}

                        {/* Rejection Reason */}
                        {document.rejection_reason && (
                            <div className="rounded border border-red-200 bg-red-50 p-2">
                                <p className="text-xs text-red-800">
                                    <strong>Rejected:</strong>{' '}
                                    {document.rejection_reason}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Status Badge */}
                    <StatusBadge status={document.status} variant="document" />
                </div>

                {/* Action Buttons */}
                {showActions && (
                    <>
                        {/* View/Download Buttons */}
                        <div className="flex gap-2">
                            {document.view_url && (
                                <a
                                    href={document.view_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                </a>
                            )}
                            {document.download_url && (
                                <a
                                    href={document.download_url}
                                    className="flex-1"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                </a>
                            )}
                            {onDelete && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDelete(document.id)}
                                    className="flex-shrink-0 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Admin Actions - Approve/Reject */}
                        {showAdminActions &&
                            isPending &&
                            onApprove &&
                            onReject && (
                                <div className="flex gap-2 border-t pt-3">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => onApprove(document)}
                                    >
                                        <Lock className="mr-2 h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => onReject(document)}
                                    >
                                        <Unlock className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                </div>
                            )}

                        {/* Re-approval for rejected docs */}
                        {showAdminActions && isRejected && onApprove && (
                            <div className="border-t pt-3">
                                <Button
                                    size="sm"
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    onClick={() => onApprove(document)}
                                >
                                    <Lock className="mr-2 h-4 w-4" />
                                    Approve This Document
                                </Button>
                            </div>
                        )}

                        {/* Revoke approval for approved docs */}
                        {showAdminActions && isApproved && onReject && (
                            <div className="border-t pt-3">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => onReject(document)}
                                >
                                    <Unlock className="mr-2 h-4 w-4" />
                                    Revoke Approval
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    },
);

DocumentCard.displayName = 'DocumentCard';

export default DocumentCard;
