import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('DeleteConfirmationModal', () => {
    it('renders nothing when isOpen is false', () => {
        // Arrange / Act
        const { container } = render(
            <DeleteConfirmationModal
                isOpen={false}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        // Assert
        expect(container).toBeEmptyDOMElement();
    });

    it('renders title, description, and item name when open', () => {
        // Arrange / Act
        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
                title="Delete employee?"
                description="This removes the record permanently."
                itemName="Jane Doe"
            />,
        );

        // Assert
        expect(
            screen.getByRole('heading', { name: 'Delete employee?' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText('This removes the record permanently.'),
        ).toBeInTheDocument();
        expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    });

    it('fires onConfirm and then onClose when the delete button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        const onClose = vi.fn();
        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={onClose}
                onConfirm={onConfirm}
            />,
        );

        // Act
        await user.click(screen.getByRole('button', { name: 'Delete' }));

        // Assert
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('fires only onClose when the cancel button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const onConfirm = vi.fn();
        const onClose = vi.fn();
        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={onClose}
                onConfirm={onConfirm}
            />,
        );

        // Act
        await user.click(screen.getByRole('button', { name: 'Cancel' }));

        // Assert
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
    });
});
