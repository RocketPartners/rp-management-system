import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { describe, expect, it, vi } from 'vitest';

import Login from './Login';

// Login pulls auth actions from context and navigation from the router; mock
// both so the component renders in isolation under jsdom.
vi.mock('@/contexts/auth-context', () => ({
    useAuth: () => ({
        login: vi.fn(),
        loginWithGoogle: vi.fn(),
    }),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

function renderLogin() {
    return render(
        <HelmetProvider>
            <Login />
        </HelmetProvider>,
    );
}

describe('Login page', () => {
    it('does not render a "Remember me" checkbox', () => {
        // Arrange / Act
        renderLogin();

        // Assert — the unused "Remember me" control must be gone
        expect(
            screen.queryByRole('checkbox', { name: /remember me/i }),
        ).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/remember me/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/remember me/i)).not.toBeInTheDocument();
    });

    it('still renders the email, password, and sign-in controls', () => {
        // Arrange / Act
        renderLogin();

        // Assert — core login UI remains intact
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /sign in/i }),
        ).toBeInTheDocument();
    });
});
