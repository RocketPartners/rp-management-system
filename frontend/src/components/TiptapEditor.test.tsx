import TiptapEditor from '@/components/TiptapEditor';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---- Mock the Spring Boot API client (auth-injecting helpers) ----
const apiPostFormData = vi.fn();
const apiFetch = vi.fn();
vi.mock('@/lib/spring-boot-api', () => ({
    apiPostFormData: (...args: unknown[]) => apiPostFormData(...args),
    apiFetch: (...args: unknown[]) => apiFetch(...args),
}));

// ---- Mock the Tiptap React editor so the image command is observable ----
const setImage = vi.fn();
const run = vi.fn();
const editorChain = { focus: vi.fn(() => editorChain), setImage, run };
const editor = {
    chain: vi.fn(() => editorChain),
    getHTML: vi.fn(() => ''),
    isActive: vi.fn(() => false),
};
let capturedOnUpdate: ((args: { editor: typeof editor }) => void) | undefined;
vi.mock('@tiptap/react', () => ({
    useEditor: (config: { onUpdate?: (args: { editor: typeof editor }) => void }) => {
        capturedOnUpdate = config.onUpdate;
        return editor;
    },
    EditorContent: () => null,
}));
// Extensions are imported by the component but unused under the mocked editor.
vi.mock('@tiptap/starter-kit', () => ({ default: { configure: vi.fn(() => ({})) } }));
vi.mock('@tiptap/extension-image', () => ({ default: { configure: vi.fn(() => ({})) } }));
vi.mock('@tiptap/extension-link', () => ({ default: { configure: vi.fn(() => ({})) } }));
vi.mock('@tiptap/extension-underline', () => ({ default: {} }));
vi.mock('@tiptap/extension-placeholder', () => ({ default: { configure: vi.fn(() => ({})) } }));

setImage.mockImplementation(() => editorChain);

describe('TiptapEditor handleImageUpload (H3 authenticated image fetch)', () => {
    beforeEach(() => {
        apiPostFormData.mockReset();
        apiFetch.mockReset();
        setImage.mockReset();
        setImage.mockImplementation(() => editorChain);
        run.mockReset();
        capturedOnUpdate = undefined;
        // jsdom does not implement object URLs.
        URL.createObjectURL = vi.fn(() => 'blob:mock-object-url');
        URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('uploads via /uploads/images, fetches the returned url with auth, and embeds an object URL', async () => {
        // Arrange
        apiPostFormData.mockResolvedValue({ url: '/uploads/images/abc.png' });
        apiFetch.mockResolvedValue({
            ok: true,
            status: 200,
            blob: vi.fn().mockResolvedValue(new Blob(['png-bytes'], { type: 'image/png' })),
        });
        const { container } = render(
            <TiptapEditor content="" onChange={vi.fn()} />,
        );
        const input = container.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const file = new File(['png-bytes'], 'photo.png', { type: 'image/png' });

        // Act
        fireEvent.change(input, { target: { files: [file] } });

        // Assert
        await waitFor(() => expect(apiPostFormData).toHaveBeenCalledTimes(1));
        const [uploadPath, formData] = apiPostFormData.mock.calls[0];
        expect(uploadPath).toBe('/uploads/images');
        expect(formData).toBeInstanceOf(FormData);

        await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
        expect(apiFetch).toHaveBeenCalledWith('/uploads/images/abc.png');

        await waitFor(() => expect(setImage).toHaveBeenCalledTimes(1));
        expect(setImage).toHaveBeenCalledWith({ src: 'blob:mock-object-url' });
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    });

    it('persists the API path (not the blob: URL) in the serialized body', async () => {
        // Arrange
        apiPostFormData.mockResolvedValue({ url: '/uploads/images/abc.png' });
        apiFetch.mockResolvedValue({
            ok: true,
            status: 200,
            blob: vi.fn().mockResolvedValue(new Blob(['png-bytes'], { type: 'image/png' })),
        });
        const onChange = vi.fn();
        const { container } = render(
            <TiptapEditor content="" onChange={onChange} />,
        );
        const input = container.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        const file = new File(['png-bytes'], 'photo.png', { type: 'image/png' });

        // Act
        fireEvent.change(input, { target: { files: [file] } });
        await waitFor(() => expect(setImage).toHaveBeenCalledTimes(1));

        // Simulate Tiptap serializing the doc that now shows the blob URL.
        editor.getHTML.mockReturnValue('<p><img src="blob:mock-object-url"></p>');
        capturedOnUpdate?.({ editor });

        // Assert: the persisted body uses the stable API path, never blob:
        expect(onChange).toHaveBeenCalledTimes(1);
        const persisted = onChange.mock.calls[0][0] as string;
        expect(persisted).toContain('/uploads/images/abc.png');
        expect(persisted).not.toContain('blob:');
    });
});
