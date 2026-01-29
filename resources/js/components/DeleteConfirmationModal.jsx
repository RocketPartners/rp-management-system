// resources/js/Components/DeleteConfirmationModal.jsx
import { Button } from '@/Components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    description = 'This action cannot be undone. This will permanently delete this item and remove all associated data.',
    itemName = null,
}) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="animate-fade-in fixed inset-0 z-50 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="animate-scale-in w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-red-100 p-2">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {title}
                                </h3>
                                {itemName && (
                                    <p className="mt-0.5 text-sm text-gray-600">
                                        Delete "{itemName}"
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-md p-1 transition-colors hover:bg-gray-100"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Description */}
                    <p className="mb-6 text-sm text-gray-600">{description}</p>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
