import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch, isAuthenticated, login, logout } from '@/lib/spring-boot-api';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function SpringBootTest() {
    const [email, setEmail] = useState('admin@rocketpartners.com');
    const [password, setPassword] = useState('admin123');
    const [loggedIn, setLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('general');

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await login(email, password);
            setLoggedIn(true);
            setResult({
                action: 'Login',
                tokenPreview: data.accessToken.substring(0, 50) + '...',
                expiresIn: data.expiresIn,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        setLoggedIn(false);
        setResult({ action: 'Logout', message: 'Logged out successfully' });
    };

    const handleApiCall = async (path, label, options = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(path, options);
            const json = await res.json();
            setResult({ action: label, data: json });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = (path, label, body) => {
        handleApiCall(path, label, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    };

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'leave-types', label: 'Leave Types' },
        { id: 'leave-apps', label: 'Leave Applications' },
        { id: 'leave-balances', label: 'Balances' },
    ];

    return (
        <>
            <Head title="Spring Boot API Test" />
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-3xl space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Spring Boot API Test</CardTitle>
                            <CardDescription>
                                React → Spring Boot → Keycloak authentication flow
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!loggedIn ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleLogin} disabled={loading} className="w-full">
                                        {loading ? 'Logging in...' : 'Login via Spring Boot → Keycloak'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-sm font-medium text-green-700">
                                            Authenticated with Keycloak
                                        </span>
                                    </div>

                                    {/* Tab navigation */}
                                    <div className="flex gap-1 rounded-lg bg-gray-200 p-1">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                                    activeTab === tab.id
                                                        ? 'bg-white text-gray-900 shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* General tab */}
                                    {activeTab === 'general' && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" onClick={() => handleApiCall('/auth/me', 'GET /auth/me')} disabled={loading}>
                                                GET /auth/me
                                            </Button>
                                            <Button variant="outline" onClick={() => handleApiCall('/roles/all', 'GET /roles/all')} disabled={loading}>
                                                GET /roles/all
                                            </Button>
                                            <Button variant="outline" onClick={() => handleApiCall('/permissions/all', 'GET /permissions/all')} disabled={loading}>
                                                GET /permissions/all
                                            </Button>
                                            <Button variant="outline" onClick={() => handleApiCall('/departments/active', 'GET /departments/active')} disabled={loading}>
                                                GET /departments/active
                                            </Button>
                                            <Button variant="outline" onClick={() => handleApiCall('/users?page=0&size=5', 'GET /users')} disabled={loading}>
                                                GET /users
                                            </Button>
                                            <Button variant="outline" onClick={() => handleApiCall('/actuator/health', 'GET /health')} disabled={loading}>
                                                GET /health
                                            </Button>
                                        </div>
                                    )}

                                    {/* Leave Types tab */}
                                    {activeTab === 'leave-types' && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-gray-500 uppercase">Read</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" onClick={() => handleApiCall('/leave-types?page=0&size=10', 'GET /leave-types')} disabled={loading}>
                                                    GET /leave-types
                                                </Button>
                                                <Button variant="outline" onClick={() => handleApiCall('/leave-types/active', 'GET /leave-types/active')} disabled={loading}>
                                                    GET /leave-types/active
                                                </Button>
                                                <Button variant="outline" onClick={() => handleApiCall('/leave-types/1', 'GET /leave-types/1')} disabled={loading}>
                                                    GET /leave-types/1
                                                </Button>
                                            </div>
                                            <p className="text-xs font-medium text-gray-500 uppercase mt-3">Create</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                <Button
                                                    variant="default"
                                                    onClick={() => handlePost('/leave-types', 'POST /leave-types (Test Type)', {
                                                        name: 'Test Leave',
                                                        code: 'TEST_' + Date.now(),
                                                        description: 'Test leave type',
                                                        defaultDaysPerYear: 5,
                                                        isPaid: false,
                                                        requiresManagerApproval: true,
                                                        requiresHrApproval: true,
                                                        color: '#F97316',
                                                    })}
                                                    disabled={loading}
                                                >
                                                    POST /leave-types (Create Test Type)
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Leave Applications tab */}
                                    {activeTab === 'leave-apps' && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-gray-500 uppercase">Read</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" onClick={() => handleApiCall('/leave-applications?page=0&size=10', 'GET /leave-applications')} disabled={loading}>
                                                    GET /leave-applications
                                                </Button>
                                                <Button variant="outline" onClick={() => handleApiCall('/leave-applications/my?page=0&size=10', 'GET /leave-applications/my')} disabled={loading}>
                                                    GET /my applications
                                                </Button>
                                                <Button variant="outline" onClick={() => handleApiCall('/leave-applications/status/PENDING_MANAGER', 'GET /status/PENDING_MANAGER')} disabled={loading}>
                                                    GET /status/PENDING_MANAGER
                                                </Button>
                                                <Button variant="outline" onClick={() => handleApiCall('/leave-applications/status/PENDING_HR', 'GET /status/PENDING_HR')} disabled={loading}>
                                                    GET /status/PENDING_HR
                                                </Button>
                                            </div>

                                            <p className="text-xs font-medium text-gray-500 uppercase mt-3">Submit Leave</p>
                                            <Button
                                                variant="default"
                                                className="w-full"
                                                onClick={() => handlePost('/leave-applications', 'POST /leave-applications (Annual Leave)', {
                                                    leaveTypeId: 1,
                                                    startDate: '2026-05-01',
                                                    endDate: '2026-05-03',
                                                    reason: 'Family vacation',
                                                    duration: 'FULL_DAY',
                                                    availability: 'REACHABLE',
                                                    emergencyContactName: 'Jane Doe',
                                                    emergencyContactPhone: '+1234567890',
                                                })}
                                                disabled={loading}
                                            >
                                                Submit Annual Leave (May 1-3)
                                            </Button>

                                            <p className="text-xs font-medium text-gray-500 uppercase mt-3">Approval Workflow</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handlePost('/leave-applications/1/manager/approve', 'Manager Approve #1', { comments: 'Approved by manager' })}
                                                    disabled={loading}
                                                >
                                                    Manager Approve #1
                                                </Button>
                                                <Button
                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                    onClick={() => handlePost('/leave-applications/1/manager/reject', 'Manager Reject #1', { comments: 'Not enough coverage' })}
                                                    disabled={loading}
                                                >
                                                    Manager Reject #1
                                                </Button>
                                                <Button
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    onClick={() => handlePost('/leave-applications/1/hr/approve', 'HR Approve #1', { comments: 'Approved by HR' })}
                                                    disabled={loading}
                                                >
                                                    HR Approve #1
                                                </Button>
                                                <Button
                                                    className="bg-orange-600 hover:bg-orange-700 text-white"
                                                    onClick={() => handlePost('/leave-applications/1/hr/reject', 'HR Reject #1', { comments: 'Rejected by HR' })}
                                                    disabled={loading}
                                                >
                                                    HR Reject #1
                                                </Button>
                                            </div>

                                            <p className="text-xs font-medium text-gray-500 uppercase mt-3">Cancellation</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handlePost('/leave-applications/1/cancel', 'Cancel #1', {})}
                                                    disabled={loading}
                                                >
                                                    Cancel Pending #1
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handlePost('/leave-applications/1/request-cancellation', 'Request Cancel #1', { reason: 'Plans changed' })}
                                                    disabled={loading}
                                                >
                                                    Request Cancel #1
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handlePost('/leave-applications/1/cancellation/approve', 'Approve Cancel #1', { comments: 'OK' })}
                                                    disabled={loading}
                                                >
                                                    HR Approve Cancel #1
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handlePost('/leave-applications/1/cancellation/reject', 'Reject Cancel #1', { comments: 'Cannot cancel' })}
                                                    disabled={loading}
                                                >
                                                    HR Reject Cancel #1
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Leave Balances tab */}
                                    {activeTab === 'leave-balances' && (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" onClick={() => handleApiCall('/leave-applications/balances', 'GET /balances (my)')} disabled={loading}>
                                                    GET My Balances
                                                </Button>
                                                <Button variant="outline" onClick={() => handleApiCall('/leave-applications/balances/user/1', 'GET /balances/user/1')} disabled={loading}>
                                                    GET Balances User #1
                                                </Button>
                                            </div>
                                            <Button
                                                variant="default"
                                                className="w-full"
                                                onClick={() => handlePost('/leave-applications/balances/initialize/1?year=2026', 'Initialize Balances User #1', {})}
                                                disabled={loading}
                                            >
                                                Initialize Balances for User #1 (2026)
                                            </Button>
                                        </div>
                                    )}

                                    <Button
                                        variant="destructive"
                                        onClick={handleLogout}
                                        className="w-full"
                                    >
                                        Logout
                                    </Button>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {result && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">{result.action}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="max-h-96 overflow-auto rounded-md bg-gray-900 p-4 text-xs text-green-400">
                                    {JSON.stringify(result.data || result, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
