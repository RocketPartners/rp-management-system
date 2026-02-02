// resources/js/Components/ProfilePictureUpload.jsx
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Camera, Upload, X, User } from 'lucide-react';

export default function ProfilePictureUpload({ currentImage, onImageChange, onImageRemove }) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(currentImage || null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
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
                        <div className="relative group">
                            <img
                                src={preview}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-0 right-0 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                            <User className="h-16 w-16 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Upload Area */}
                <div className="flex-1">
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                        <label htmlFor="profile-picture-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                                <Camera className="h-10 w-10 text-gray-400 mb-3" />
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                    Upload Profile Picture
                                </p>
                                <p className="text-xs text-gray-600 mb-3">
                                    Drag and drop or click to browse
                                </p>
                                <Button type="button" size="sm" variant="outline" onClick={() => document.getElementById('profile-picture-upload').click()}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Choose File
                                </Button>
                                <p className="text-xs text-gray-500 mt-3">
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