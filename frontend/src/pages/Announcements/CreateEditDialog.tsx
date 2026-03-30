import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import TiptapEditor from '@/components/TiptapEditor';
import { apiPostFormData, apiPut } from '@/lib/spring-boot-api';
import type { AnnouncementResponse } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'GENERAL', label: 'General' },
    { value: 'COMPANY_NEWS', label: 'Company News' },
    { value: 'EVENTS', label: 'Events' },
    { value: 'FUN', label: 'Fun' },
    { value: 'HR_UPDATES', label: 'HR Updates' },
];

interface CreateEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    announcement?: AnnouncementResponse | null;
}

export default function CreateEditDialog({ open, onOpenChange, announcement }: CreateEditDialogProps) {
    const queryClient = useQueryClient();
    const isEdit = !!announcement;
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState(announcement?.title || '');
    const [body, setBody] = useState(announcement?.body || '');
    const [category, setCategory] = useState(announcement?.category || 'GENERAL');
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

    // Reset form when dialog opens/closes
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setTitle(announcement?.title || '');
            setBody(announcement?.body || '');
            setCategory(announcement?.category || 'GENERAL');
            setGalleryFiles([]);
            setGalleryPreviews([]);
        }
        onOpenChange(isOpen);
    };

    const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setGalleryFiles((prev) => [...prev, ...files]);
        files.forEach((f) => {
            const url = URL.createObjectURL(f);
            setGalleryPreviews((prev) => [...prev, url]);
        });
        if (galleryInputRef.current) galleryInputRef.current.value = '';
    };

    const removeGalleryItem = (index: number) => {
        setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
        setGalleryPreviews((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const createMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            const announcementData = JSON.stringify({ title, body, category });
            formData.append(
                'announcement',
                new Blob([announcementData], { type: 'application/json' })
            );
            galleryFiles.forEach((file) => formData.append('images', file));
            return apiPostFormData<AnnouncementResponse>('/announcements', formData);
        },
        onSuccess: () => {
            toast.success(isEdit ? 'Announcement updated' : 'Announcement published');
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            handleOpenChange(false);
        },
        onError: (err: Error) => {
            toast.error(err.message || 'Failed to save announcement');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async () => {
            return apiPut<AnnouncementResponse>(`/announcements/${announcement!.id}`, {
                title,
                body,
                category,
            });
        },
        onSuccess: () => {
            toast.success('Announcement updated');
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            handleOpenChange(false);
        },
        onError: (err: Error) => {
            toast.error(err.message || 'Failed to update announcement');
        },
    });

    const handleSubmit = () => {
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!body.trim() || body === '<p></p>') {
            toast.error('Body is required');
            return;
        }
        if (isEdit) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Give your announcement a title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Content</Label>
                        <TiptapEditor
                            content={body}
                            onChange={setBody}
                            placeholder="Write your announcement..."
                        />
                    </div>

                    {/* Gallery Upload (create mode only) */}
                    {!isEdit && (
                        <div className="space-y-2">
                            <Label>Gallery Images</Label>
                            <div className="flex flex-wrap gap-3">
                                {galleryPreviews.map((url, i) => (
                                    <div
                                        key={i}
                                        className="group relative h-24 w-24 overflow-hidden rounded-lg border"
                                    >
                                        <img
                                            src={url}
                                            alt={`Gallery ${i + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryItem(i)}
                                            className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => galleryInputRef.current?.click()}
                                    className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500"
                                >
                                    <ImagePlus className="h-5 w-5" />
                                    <span className="text-xs">Add</span>
                                </button>
                            </div>
                            <input
                                ref={galleryInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                multiple
                                className="hidden"
                                onChange={handleGalleryAdd}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Save Changes' : 'Publish'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
