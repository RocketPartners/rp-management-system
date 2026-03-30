import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { apiPostFormData } from '@/lib/spring-boot-api';
import { useRef, useCallback } from 'react';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TiptapEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

function ToolbarButton({
    onClick,
    isActive = false,
    children,
    title,
}: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                'rounded p-1.5 transition-colors hover:bg-gray-200',
                isActive && 'bg-gray-200 text-blue-600'
            )}
        >
            {children}
        </button>
    );
}

export default function TiptapEditor({ content, onChange, placeholder = 'Write something...' }: TiptapEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
            }),
            Image.configure({ inline: true }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-600 underline' },
            }),
            Underline,
            Placeholder.configure({ placeholder }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none',
            },
        },
    });

    const handleImageUpload = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !editor) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const result = await apiPostFormData<{ url: string }>('/uploads/images', formData);
                editor.chain().focus().setImage({ src: result.url }).run();
            } catch (err) {
                console.error('Image upload failed:', err);
            }

            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        [editor]
    );

    const addLink = useCallback(() => {
        if (!editor) return;
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="rounded-lg border border-gray-200 bg-white">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-2 py-1.5">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>

                <div className="mx-1 h-5 w-px bg-gray-300" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>

                <div className="mx-1 h-5 w-px bg-gray-300" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Blockquote"
                >
                    <Quote className="h-4 w-4" />
                </ToolbarButton>

                <div className="mx-1 h-5 w-px bg-gray-300" />

                <ToolbarButton
                    onClick={addLink}
                    isActive={editor.isActive('link')}
                    title="Add Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => fileInputRef.current?.click()}
                    title="Insert Image"
                >
                    <ImageIcon className="h-4 w-4" />
                </ToolbarButton>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                />
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}
