import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import {
    getAccessToken,
    isAuthenticated as checkAuth,
    login as apiLogin,
    logout as apiLogout,
    apiFetch,
} from '@/lib/spring-boot-api';

export interface AuthUser {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    position?: string;
    department?: { id: number; name: string } | null;
    employeeId?: string;
    phoneNumber?: string;
    roles?: string[];
    permissions?: string[];
}

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const res = await apiFetch('/auth/me');
            if (res.ok) {
                const json = await res.json();
                const data = json.data || json;
                setUser({
                    id: data.id,
                    name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email,
                    profilePicture: data.profilePicture,
                    position: data.position,
                    department: data.department,
                    employeeId: data.employeeId,
                    phoneNumber: data.phoneNumber,
                    roles: data.roles || [],
                    permissions: data.permissions || [],
                });
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        if (checkAuth()) {
            fetchUser().finally(() => setIsLoading(false));
        } else {
            // Check if we have a token in localStorage
            const savedToken = localStorage.getItem('accessToken');
            if (savedToken) {
                // Token was persisted — try to restore session
                fetchUser().finally(() => setIsLoading(false));
            } else {
                setIsLoading(false);
            }
        }
    }, [fetchUser]);

    const login = useCallback(
        async (email: string, password: string) => {
            const data = await apiLogin(email, password);
            // Persist tokens
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            await fetchUser();
        },
        [fetchUser],
    );

    const logout = useCallback(async () => {
        await apiLogout();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                refreshUser: fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
