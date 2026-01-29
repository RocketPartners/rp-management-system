/**
 * DocumentCard component
 * Displays a single document with status, actions, and metadata
 * Eliminates duplicate document display logic across Form.jsx and Review.jsx
 */

import React from 'react';
import { Button } from '@/Components/ui/button';
import { FileText, Trash2, Eye, Download, Lock, Unlock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { getDocumentStatusConfig } from '@/lib/constants/onboarding/statuses';

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
export const DocumentCard = React.memo(({
    document,
    onDelete,
    onApprove,
    onReject,
    showActions = true,
    showAdminActions = false,
    className = '',
}) => {
    const statusConfig = getDocumentStatusConfig(document.status);
    const isPending = document.status === 'pending' || document.status === 'uploaded';
    const isRejected = document.status === 'rejected';
    const isApproved = document.status === 'approved';

    return (
        <div className={`border rounded-lg p-4 space-y-3 bg-white hover:shadow-md transition-shadow ${className}`}>
            {/* Document Info */}
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        {/* Icon with status color */}
                        <div className={`p-1.5 rounded ${statusConfig.iconBgColor}`}>
                            <FileText className={`h-4 w-4 ${statusConfig.iconColor}`} />
                        </div>

                        {/* Filename */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                                {document.filename}
                            </p>
                            {document.file_size && document.created_at && (
                                <p className="text-xs text-gray-500">
                                    {document.file_size} • Uploaded {new Date(document.created_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {document.description && (
                        <div className="bg-gray-50 rounded p-2 mb-2">
                            <p className="text-xs text-gray-600">
                                <strong>Note:</strong> {document.description}
                            </p>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {document.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                            <p className="text-xs text-red-800">
                                <strong>Rejected:</strong> {document.rejection_reason}
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
                                <Button variant="outline" size="sm" className="w-full">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                </Button>
                            </a>
                        )}
                        {document.download_url && (
                            <a href={document.download_url} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                    <Download className="h-4 w-4 mr-2" />
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
                                className="text-red-600 hover:bg-red-50 flex-shrink-0"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Admin Actions - Approve/Reject */}
                    {showAdminActions && isPending && onApprove && onReject && (
                        <div className="flex gap-2 pt-3 border-t">
                            <Button
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => onApprove(document)}
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => onReject(document)}
                            >
                                <Unlock className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </div>
                    )}

                    {/* Re-approval for rejected docs */}
                    {showAdminActions && isRejected && onApprove && (
                        <div className="pt-3 border-t">
                            <Button
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => onApprove(document)}
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                Approve This Document
                            </Button>
                        </div>
                    )}

                    {/* Revoke approval for approved docs */}
                    {showAdminActions && isApproved && onReject && (
                        <div className="pt-3 border-t">
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => onReject(document)}
                            >
                                <Unlock className="h-4 w-4 mr-2" />
                                Revoke Approval
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
});

DocumentCard.displayName = 'DocumentCard';

export default DocumentCard;
