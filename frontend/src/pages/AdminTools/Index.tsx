import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Database,
    HardDrive,
    RefreshCw,
    Search,
    Server,
    Settings,
    Shield,
    Trash2,
    User,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiGet, apiFetch } from '@/lib/spring-boot-api';

// ==================== HEALTH CHECKS TAB ====================

function HealthTab() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['admin-health'],
        queryFn: () => apiGet<any>('/admin-tools/health'),
        refetchInterval: 15000,
    });

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            UP: 'border-green-200 bg-green-50 text-green-700',
            CONFIGURED: 'border-green-200 bg-green-50 text-green-700',
            DOWN: 'border-red-200 bg-red-50 text-red-700',
            DEGRADED: 'border-amber-200 bg-amber-50 text-amber-700',
            NOT_CONFIGURED: 'border-slate-200 bg-slate-50 text-slate-500',
        };
        return <Badge variant="outline" className={`text-xs font-bold ${styles[status] || styles.DEGRADED}`}>{status}</Badge>;
    };

    if (isLoading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Auto-refreshes every 15 seconds</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Database */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-blue-500" />
                                <span className="font-semibold text-gray-900">Database</span>
                            </div>
                            {statusBadge(data?.database?.status)}
                        </div>
                        {data?.database?.status === 'UP' && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Connections</span>
                                    <span className="font-medium">{data.database.activeConnections} / {data.database.maxConnections}</span>
                                </div>
                                <Progress value={(data.database.activeConnections / data.database.maxConnections) * 100} className="h-1.5" />
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Database Size</span>
                                    <span className="font-medium">{data.database.databaseSize}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tables</span>
                                    <span className="font-medium">{data.database.tableCount}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Keycloak */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-purple-500" />
                                <span className="font-semibold text-gray-900">Keycloak (Auth)</span>
                            </div>
                            {statusBadge(data?.keycloak?.status)}
                        </div>
                        {data?.keycloak?.httpStatus && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">HTTP Response</span>
                                <span className="font-medium">{data.keycloak.httpStatus}</span>
                            </div>
                        )}
                        {data?.keycloak?.error && (
                            <p className="text-xs text-red-500 mt-1">{data.keycloak.error}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Mail */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-green-500" />
                                <span className="font-semibold text-gray-900">Email Service</span>
                            </div>
                            {statusBadge(data?.mail?.status)}
                        </div>
                        {data?.mail?.host && (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Host</span>
                                    <span className="font-mono text-xs">{data.mail.host}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-500">Account</span>
                                    <span className="font-mono text-xs">{data.mail.username}</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* JVM */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Server className="h-4 w-4 text-orange-500" />
                                <span className="font-semibold text-gray-900">JVM Runtime</span>
                            </div>
                            <span className="text-xs text-gray-400">Java {data?.jvm?.javaVersion}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Heap Memory</span>
                                <span className="font-medium">{data?.jvm?.heapUsedMb} / {data?.jvm?.heapMaxMb} MB ({data?.jvm?.heapUsagePercent}%)</span>
                            </div>
                            <Progress value={data?.jvm?.heapUsagePercent || 0} className="h-1.5" />
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Processors / Threads</span>
                                <span className="font-medium">{data?.jvm?.processors} CPUs / {data?.jvm?.totalThreads} threads</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Uptime</span>
                                <span className="font-medium">
                                    {data?.uptimeSeconds >= 86400
                                        ? `${Math.floor(data.uptimeSeconds / 86400)}d ${Math.floor((data.uptimeSeconds % 86400) / 3600)}h`
                                        : data?.uptimeSeconds >= 3600
                                          ? `${Math.floor(data.uptimeSeconds / 3600)}h ${Math.floor((data.uptimeSeconds % 3600) / 60)}m`
                                          : `${Math.floor((data?.uptimeSeconds || 0) / 60)}m`}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ==================== USER LOOKUP TAB ====================

function UserLookupTab() {
    const [query, setQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['admin-user-lookup', searchQuery],
        queryFn: () => apiGet<any>(`/admin-tools/user-lookup?query=${encodeURIComponent(searchQuery)}`),
        enabled: !!searchQuery,
    });

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (query.trim()) setSearchQuery(query.trim());
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by email or user ID..."
                        className="pl-10"
                    />
                </div>
                <Button type="submit" disabled={!query.trim()}>Lookup</Button>
            </form>

            {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}

            {isError && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm text-red-700">User not found for "{searchQuery}"</span>
                    </CardContent>
                </Card>
            )}

            {data && (
                <div className="space-y-4">
                    {/* User info card */}
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                                    {data.firstName?.charAt(0)}{data.lastName?.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{data.fullName}</h3>
                                    <p className="text-sm text-gray-500">{data.email}</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <Badge variant="outline" className={
                                            data.status === 'ACTIVE' ? 'border-green-200 bg-green-50 text-green-700'
                                            : data.status === 'SUSPENDED' ? 'border-red-200 bg-red-50 text-red-700'
                                            : 'border-amber-200 bg-amber-50 text-amber-700'
                                        }>{data.status}</Badge>
                                        {data.roles?.map((role: string) => (
                                            <Badge key={role} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{role}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div><p className="text-xs text-gray-400">ID</p><p className="text-sm font-medium">{data.id}</p></div>
                                <div><p className="text-xs text-gray-400">Employee ID</p><p className="text-sm font-medium">{data.employeeId || '—'}</p></div>
                                <div><p className="text-xs text-gray-400">Department</p><p className="text-sm font-medium">{data.departmentName || '—'}</p></div>
                                <div><p className="text-xs text-gray-400">Position</p><p className="text-sm font-medium">{data.positionTitle || '—'}</p></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions */}
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Permissions ({data.permissions?.length || 0})</CardTitle></CardHeader>
                        <CardContent className="p-5 pt-0">
                            <div className="flex flex-wrap gap-1.5">
                                {data.permissions?.map((p: string) => (
                                    <span key={p} className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-mono font-medium text-gray-600">{p}</span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
                        <CardContent className="p-5 pt-0">
                            {data.recentActivity?.length === 0 ? (
                                <p className="text-sm text-gray-400 py-4 text-center">No recent activity</p>
                            ) : (
                                <div className="space-y-2">
                                    {data.recentActivity?.map((a: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={`text-[10px] ${
                                                    a.severity === 'ERROR' || a.severity === 'CRITICAL' ? 'border-red-200 bg-red-50 text-red-700'
                                                    : a.severity === 'WARN' ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                    : 'border-blue-200 bg-blue-50 text-blue-700'
                                                }`}>{a.severity}</Badge>
                                                <div>
                                                    <code className="text-xs font-medium text-gray-700">{a.eventName}</code>
                                                    <p className="text-[10px] text-gray-400 truncate max-w-[300px]">{a.message}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(a.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

// ==================== SYSTEM CONFIG TAB ====================

function ConfigTab() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin-config'],
        queryFn: () => apiGet<any[]>('/admin-tools/config'),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ key, value }: { key: string; value: string }) => {
            await apiFetch(`/admin-tools/config/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-config'] });
            toast.success('Setting updated');
        },
        onError: () => toast.error('Failed to update setting'),
    });

    function handleToggle(key: string, currentValue: string) {
        updateMutation.mutate({ key, value: currentValue === 'true' ? 'false' : 'true' });
    }

    function handleTextSave(key: string, value: string) {
        updateMutation.mutate({ key, value });
    }

    if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>;

    return (
        <div className="space-y-3">
            {data?.map((setting: any) => (
                <Card key={setting.key}>
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex-1">
                            <p className="font-mono text-sm font-medium text-gray-900">{setting.key}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
                        </div>
                        <div className="ml-4">
                            {setting.value === 'true' || setting.value === 'false' ? (
                                <button
                                    onClick={() => handleToggle(setting.key, setting.value)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        setting.value === 'true' ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        setting.value === 'true' ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            ) : (
                                <EditableValue
                                    value={setting.value}
                                    onSave={(v) => handleTextSave(setting.key, v)}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function EditableValue({ value, onSave }: { value: string; onSave: (v: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    if (!editing) {
        return (
            <button onClick={() => { setEditValue(value); setEditing(true); }}
                className="rounded border border-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition">
                {value || <span className="text-gray-400 italic">empty</span>}
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8 w-48 text-sm" autoFocus />
            <Button size="sm" className="h-8" onClick={() => { onSave(editValue); setEditing(false); }}>Save</Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
    );
}

// ==================== CACHE MANAGEMENT TAB ====================

function CacheTab() {
    const queryClient = useQueryClient();
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['admin-caches'],
        queryFn: () => apiGet<any[]>('/admin-tools/caches'),
    });

    async function clearCache(name: string) {
        await apiFetch(`/admin-tools/caches/${name}`, { method: 'DELETE' });
        toast.success(`Cache "${name}" cleared`);
        refetch();
    }

    async function clearAll() {
        await apiFetch('/admin-tools/caches', { method: 'DELETE' });
        toast.success('All caches cleared');
        queryClient.invalidateQueries();
        refetch();
    }

    if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{data?.length || 0} caches registered</p>
                <Button variant="destructive" size="sm" onClick={clearAll} className="gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" /> Clear All
                </Button>
            </div>

            {!data?.length ? (
                <Card><CardContent className="p-8 text-center text-sm text-gray-400">No caches found</CardContent></Card>
            ) : (
                <div className="space-y-2">
                    {data.map((cache: any) => (
                        <Card key={cache.name}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <p className="font-mono text-sm font-medium text-gray-900">{cache.name}</p>
                                    <p className="text-xs text-gray-400">{cache.type}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => clearCache(cache.name)} className="gap-1.5">
                                    <RefreshCw className="h-3.5 w-3.5" /> Clear
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// ==================== RECENT ERRORS TAB ====================

function ErrorsTab() {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['admin-recent-errors'],
        queryFn: () => apiGet<any[]>('/admin-tools/recent-errors?limit=50'),
        refetchInterval: 5000,
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Auto-refreshes every 5 seconds</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
            </div>

            {isLoading && <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>}

            {!isLoading && !data?.length && (
                <Card>
                    <CardContent className="flex flex-col items-center gap-2 p-12">
                        <CheckCircle2 className="h-8 w-8 text-green-400" />
                        <p className="font-medium text-gray-900">All clear</p>
                        <p className="text-sm text-gray-400">No errors in the last 7 days</p>
                    </CardContent>
                </Card>
            )}

            {data?.map((err: any) => (
                <Card key={err.id} className={err.severity === 'CRITICAL' ? 'border-red-200' : ''}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 rounded-full p-1.5 ${
                                    err.severity === 'CRITICAL' ? 'bg-purple-100' : 'bg-red-100'
                                }`}>
                                    <AlertTriangle className={`h-3.5 w-3.5 ${
                                        err.severity === 'CRITICAL' ? 'text-purple-600' : 'text-red-500'
                                    }`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs font-semibold text-gray-900">{err.eventName}</code>
                                        <Badge variant="outline" className={`text-[10px] ${
                                            err.severity === 'CRITICAL' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-red-200 bg-red-50 text-red-700'
                                        }`}>{err.severity}</Badge>
                                        {err.httpStatus && (
                                            <Badge variant="outline" className="text-[10px] border-gray-200">{err.httpStatus}</Badge>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{err.message}</p>
                                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-gray-400">
                                        {err.actorName && <span><User className="inline h-3 w-3 mr-0.5" />{err.actorName}</span>}
                                        {err.endpoint && <span className="font-mono">{err.httpMethod} {err.endpoint}</span>}
                                        {err.ipAddress && <span>{err.ipAddress}</span>}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-4">
                                {new Date(err.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ==================== MAIN PAGE ====================

export default function AdminTools() {
    return (
        <>
            <Helmet><title>Admin Tools | HRIS</title></Helmet>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Tools</h1>
                        <p className="mt-1 text-sm text-gray-500">System configuration, debugging, and monitoring</p>
                    </div>

                    <Tabs defaultValue="health" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="health" className="gap-1.5 text-xs"><HardDrive className="h-3.5 w-3.5" /> Health</TabsTrigger>
                            <TabsTrigger value="user" className="gap-1.5 text-xs"><User className="h-3.5 w-3.5" /> User Lookup</TabsTrigger>
                            <TabsTrigger value="config" className="gap-1.5 text-xs"><Settings className="h-3.5 w-3.5" /> Config</TabsTrigger>
                            <TabsTrigger value="cache" className="gap-1.5 text-xs"><Database className="h-3.5 w-3.5" /> Caches</TabsTrigger>
                            <TabsTrigger value="errors" className="gap-1.5 text-xs"><AlertTriangle className="h-3.5 w-3.5" /> Errors</TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <TabsContent value="health"><HealthTab /></TabsContent>
                            <TabsContent value="user"><UserLookupTab /></TabsContent>
                            <TabsContent value="config"><ConfigTab /></TabsContent>
                            <TabsContent value="cache"><CacheTab /></TabsContent>
                            <TabsContent value="errors"><ErrorsTab /></TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </>
    );
}
