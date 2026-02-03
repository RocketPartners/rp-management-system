// resources/js/Components/ProfilePictureUpload.jsx
import { Button } from '@/Components/ui/button';
import { Camera, Upload, User, X } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePictureUpload({
    currentImage,
    onImageChange,
    onImageRemove,
}) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(currentImage || null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Pass file to parent
        if (onImageChange) {
            onImageChange(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (onImageRemove) {
            onImageRemove();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-6">
                {/* Preview */}
                <div className="relative">
                    {preview ? (
                        <div className="group relative">
                            <img
                                src={preview}
                                alt="Profile"
                                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                            />
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute right-0 top-0 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gray-100 shadow-lg">
                            <User className="h-16 w-16 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Upload Area */}
                <div className="flex-1">
                    <div
                        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                            dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="profile-picture-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="profile-picture-upload"
                            className="cursor-pointer"
                        >
                            <div className="flex flex-col items-center">
                                <Camera className="mb-3 h-10 w-10 text-gray-400" />
                                <p className="mb-1 text-sm font-medium text-gray-900">
                                    Upload Profile Picture
                                </p>
                                <p className="mb-3 text-xs text-gray-600">
                                    Drag and drop or click to browse
                                </p>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        document
                                            .getElementById(
                                                'profile-picture-upload',
                                            )
                                            .click()
                                    }
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose File
                                </Button>
                                <p className="mt-3 text-xs text-gray-500">
                                    PNG, JPG, GIF up to 5MB
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
