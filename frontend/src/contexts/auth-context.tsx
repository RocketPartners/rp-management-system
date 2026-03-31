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

/**
 * Maps backend SCREAMING_SNAKE permissions to frontend dotted format.
 * Both formats are kept so `can('users.view')` and `can('USER_READ')` both work.
 */
const ACTION_MAP: Record<string, string[]> = {
    READ: ['view', 'read'],
    VIEW: ['view', 'read'],
    CREATE: ['create'],
    UPDATE: ['edit', 'update', 'manage'],
    EDIT: ['edit', 'update'],
    DELETE: ['delete'],
    APPROVE: ['approve'],
    REJECT: ['reject'],
};

const RESOURCE_ALIASES: Record<string, string[]> = {
    USER: ['users'],
    ROLE: ['roles'],
    DEPARTMENT: ['departments'],
    PERMISSION: ['permissions'],
    POSITION: ['positions'],
    TEAM: ['teams'],
    LEAVE_TYPE: ['leave-types'],
    LEAVE_APPLICATION: ['leaves', 'leave-applications'],
    ATTENDANCE: ['attendance'],
    HOLIDAY: ['holidays'],
    ASSET: ['assets', 'inventory-items', 'inventory'],
    INVENTORY_ITEM: ['assets', 'inventory-items'],
    INVENTORY_CATEGORY: ['inventory-categories', 'asset-categories'],
    INVENTORY_ASSIGNMENT: ['inventory-assignments', 'asset-assignments'],
    PROJECT: ['projects'],
    PROJECT_ASSIGNMENT: ['project-assignments', 'tasks'],
    ANNOUNCEMENT: ['announcements'],
};

// Extra dotted aliases that don't follow the generic pattern
const EXTRA_ALIASES: Record<string, string[]> = {
    USER_UPDATE: ['users.approve', 'users.assign-permissions'],
    LEAVE_APPLICATION_READ: ['leaves.view-all'],
    ASSET_ASSIGN: ['assets.assign', 'assets.check-out', 'assets.check-in'],
};

function normalizePermissions(backendPerms: string[]): string[] {
    const expanded = new Set<string>(backendPerms);

    for (const perm of backendPerms) {
        // Find the action suffix (last segment after final _)
        const actionKeys = Object.keys(ACTION_MAP);
        let matchedAction = '';
        let resourcePart = '';

        for (const action of actionKeys) {
            if (perm.endsWith(`_${action}`)) {
                matchedAction = action;
                resourcePart = perm.slice(0, -(action.length + 1));
                break;
            }
        }

        if (!matchedAction || !resourcePart) continue;

        const resources = RESOURCE_ALIASES[resourcePart];
        const actions = ACTION_MAP[matchedAction];
        if (resources && actions) {
            for (const res of resources) {
                for (const act of actions) {
                    expanded.add(`${res}.${act}`);
                }
            }
        }

        // Add any extra aliases
        const extras = EXTRA_ALIASES[perm];
        if (extras) {
            for (const alias of extras) {
                expanded.add(alias);
            }
        }
    }

    return Array.from(expanded);
}

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
                    permissions: normalizePermissions(data.permissions || []),
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
