// resources/js/Components/DeleteConfirmationModal.jsx
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?",
    description = "This action cannot be undone. This will permanently delete this item and remove all associated data.",
    itemName = null
}) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-scale-in">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                                {itemName && (
                                    <p className="text-sm text-gray-600 mt-0.5">Delete "{itemName}"</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-6">
                        {description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
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