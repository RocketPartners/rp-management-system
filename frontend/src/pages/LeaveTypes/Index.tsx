/**
 * Leave Types Management Page
 * Ported from monolith's Admin/Leaves/Types.jsx
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import {
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Edit,
    Loader2,
    MoreVertical,
    Plus,
    Search,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { usePermission } from '@/hooks/usePermission';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/spring-boot-api';

interface LeaveTypeResponse {
    id: number;
    name: string;
    code: string;
    description: string;
    defaultDaysPerYear: number;
    isPaid: boolean;
    requiresMedicalCert: boolean;
    medicalCertDaysThreshold: number;
    isCarryOverAllowed: boolean;
    maxCarryOverDays: number;
    requiresManagerApproval: boolean;
    requiresHrApproval: boolean;
    color: string;
    sortOrder: number;
    genderSpecific: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

const DEFAULT_FORM = {
    name: '',
    code: '',
    description: '',
    defaultDaysPerYear: 15,
    isPaid: true,
    requiresMedicalCert: false,
    medicalCertDaysThreshold: 3,
    isCarryOverAllowed: false,
    maxCarryOverDays: 0,
    requiresManagerApproval: true,
    requiresHrApproval: true,
    color: '#3b82f6',
    sortOrder: 0,
    genderSpecific: '',
    isActive: true,
};

export default function LeaveTypeList() {
    const queryClient = useQueryClient();
    const { can } = usePermission();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editDialog, setEditDialog] = useState<{ open: boolean; leaveType: LeaveTypeResponse | null }>({ open: false, leaveType: null });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; leaveType: LeaveTypeResponse | null }>({ isOpen: false, leaveType: null });
    const [form, setForm] = useState(DEFAULT_FORM);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['leave-types'],
        queryFn: () => apiGet<PagedResponse<LeaveTypeResponse>>('/leave-types?size=100'),
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof DEFAULT_FORM) => apiPost('/leave-types', data),
        onSuccess: () => { toast.success('Leave type created'); queryClient.invalidateQueries({ queryKey: ['leave-types'] }); setEditDialog({ open: false, leaveType: null }); },
        onError: (err: Error) => toast.error(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: typeof DEFAULT_FORM }) => apiPut(`/leave-types/${id}`, data),
        onSuccess: () => { toast.success('Leave type updated'); queryClient.invalidateQueries({ queryKey: ['leave-types'] }); setEditDialog({ open: false, leaveType: null }); },
        onError: (err: Error) => toast.error(err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => apiDelete(`/leave-types/${id}`),
        onSuccess: () => { toast.success('Leave type deleted'); queryClient.invalidateQueries({ queryKey: ['leave-types'] }); setDeleteModal({ isOpen: false, leaveType: null }); },
        onError: (err: Error) => toast.error(err.message),
    });

    const openCreate = () => {
        setForm(DEFAULT_FORM);
        setEditDialog({ open: true, leaveType: null });
    };

    const openEdit = (lt: LeaveTypeResponse) => {
        setForm({
            name: lt.name, code: lt.code, description: lt.description || '',
            defaultDaysPerYear: lt.defaultDaysPerYear, isPaid: lt.isPaid,
            requiresMedicalCert: lt.requiresMedicalCert, medicalCertDaysThreshold: lt.medicalCertDaysThreshold || 3,
            isCarryOverAllowed: lt.isCarryOverAllowed, maxCarryOverDays: lt.maxCarryOverDays || 0,
            requiresManagerApproval: lt.requiresManagerApproval, requiresHrApproval: lt.requiresHrApproval,
            color: lt.color || '#3b82f6', sortOrder: lt.sortOrder || 0,
            genderSpecific: lt.genderSpecific || '', isActive: lt.isActive,
        });
        setEditDialog({ open: true, leaveType: lt });
    };

    const handleSubmit = () => {
        if (editDialog.leaveType) {
            updateMutation.mutate({ id: editDialog.leaveType.id, data: form });
        } else {
            createMutation.mutate(form);
        }
    };

    const allTypes = data?.content || [];
    const filtered = allTypes.filter((lt) => {
        if (statusFilter === 'active' && !lt.isActive) return false;
        if (statusFilter === 'inactive' && lt.isActive) return false;
        if (search && !lt.name.toLowerCase().includes(search.toLowerCase()) && !lt.code.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const activeCount = allTypes.filter((t) => t.isActive).length;
    const paidCount = allTypes.filter((t) => t.isPaid).length;
    const totalDays = allTypes.reduce((sum, t) => sum + t.defaultDaysPerYear, 0);
    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <>
            <Helmet><title>Leave Types | HRIS</title></Helmet>

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Leave Types</h1>
                            <p className="text-sm text-gray-500">Configure leave type policies</p>
                        </div>
                    </div>
                    {can('LEAVE_TYPE_CREATE') && (
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Leave Type
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <Card><CardContent className="flex items-center gap-3 pt-6"><div className="rounded-lg bg-blue-100 p-2"><Calendar className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm text-gray-500">Total Types</p><p className="text-2xl font-bold">{allTypes.length}</p></div></CardContent></Card>
                    <Card><CardContent className="flex items-center gap-3 pt-6"><div className="rounded-lg bg-green-100 p-2"><CheckCircle2 className="h-5 w-5 text-green-600" /></div><div><p className="text-sm text-gray-500">Active</p><p className="text-2xl font-bold">{activeCount}</p></div></CardContent></Card>
                    <Card><CardContent className="flex items-center gap-3 pt-6"><div className="rounded-lg bg-gray-100 p-2"><XCircle className="h-5 w-5 text-gray-600" /></div><div><p className="text-sm text-gray-500">Inactive</p><p className="text-2xl font-bold">{allTypes.length - activeCount}</p></div></CardContent></Card>
                    <Card><CardContent className="flex items-center gap-3 pt-6"><div className="rounded-lg bg-emerald-100 p-2"><DollarSign className="h-5 w-5 text-emerald-600" /></div><div><p className="text-sm text-gray-500">Paid Types</p><p className="text-2xl font-bold">{paidCount}</p></div></CardContent></Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input placeholder="Search by name or code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-gray-400" /></button>}
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead className="text-center">Days/Year</TableHead>
                                    <TableHead className="text-center">Paid</TableHead>
                                    <TableHead className="text-center">Carry Over</TableHead>
                                    <TableHead className="text-center">Medical Cert</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>{Array.from({ length: 8 }).map((_, j) => (<TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>))}</TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow><TableCell colSpan={8}><div className="flex flex-col items-center justify-center py-12"><XCircle className="mb-3 h-12 w-12 text-red-300" /><p className="text-lg font-medium">Failed to load leave types</p><p className="mb-4 text-sm text-gray-500">Something went wrong while fetching leave types. Please try again.</p><Button variant="outline" onClick={() => refetch()}>Retry</Button></div></TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={8}><div className="flex flex-col items-center justify-center py-12"><Calendar className="mb-3 h-12 w-12 text-gray-300" /><p className="text-lg font-medium">No leave types found</p></div></TableCell></TableRow>
                                ) : (
                                    filtered.map((lt) => (
                                        <TableRow key={lt.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: lt.color || '#3b82f6' }} />
                                                    <span className="font-medium">{lt.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell><code className="rounded bg-gray-100 px-2 py-0.5 text-xs">{lt.code}</code></TableCell>
                                            <TableCell className="text-center font-medium">{lt.defaultDaysPerYear}</TableCell>
                                            <TableCell className="text-center">{lt.isPaid ? <Badge className="bg-green-100 text-green-700">Paid</Badge> : <Badge variant="secondary">Unpaid</Badge>}</TableCell>
                                            <TableCell className="text-center">{lt.isCarryOverAllowed ? <Badge className="bg-blue-100 text-blue-700">Yes ({lt.maxCarryOverDays}d)</Badge> : <span className="text-gray-400">No</span>}</TableCell>
                                            <TableCell className="text-center">{lt.requiresMedicalCert ? <Badge className="bg-orange-100 text-orange-700">{`>${lt.medicalCertDaysThreshold}d`}</Badge> : <span className="text-gray-400">No</span>}</TableCell>
                                            <TableCell className="text-center"><Badge className={lt.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>{lt.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {can('LEAVE_TYPE_UPDATE') && <DropdownMenuItem onClick={() => openEdit(lt)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>}
                                                        {can('LEAVE_TYPE_DELETE') && (<><DropdownMenuSeparator /><DropdownMenuItem className="text-red-600" onClick={() => setDeleteModal({ isOpen: true, leaveType: lt })}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></>)}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={editDialog.open} onOpenChange={(open) => { if (!open) setEditDialog({ open: false, leaveType: null }); }}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editDialog.leaveType ? 'Edit Leave Type' : 'Create Leave Type'}</DialogTitle>
                        <DialogDescription>Configure leave type policy settings.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Sick Leave" /></div>
                            <div className="space-y-2"><Label>Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g., SL" /></div>
                        </div>
                        <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2"><Label>Days/Year</Label><Input type="number" value={form.defaultDaysPerYear} onChange={(e) => setForm({ ...form, defaultDaysPerYear: Number(e.target.value) })} /></div>
                            <div className="space-y-2"><Label>Color</Label><Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10" /></div>
                            <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between rounded-lg border p-3"><Label>Paid Leave</Label><Switch checked={form.isPaid} onCheckedChange={(v) => setForm({ ...form, isPaid: v })} /></div>
                            <div className="flex items-center justify-between rounded-lg border p-3"><Label>Active</Label><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /></div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3"><Label>Requires Medical Certificate</Label><Switch checked={form.requiresMedicalCert} onCheckedChange={(v) => setForm({ ...form, requiresMedicalCert: v })} /></div>
                        {form.requiresMedicalCert && (
                            <div className="space-y-2"><Label>Medical Cert Required After (days)</Label><Input type="number" value={form.medicalCertDaysThreshold} onChange={(e) => setForm({ ...form, medicalCertDaysThreshold: Number(e.target.value) })} /></div>
                        )}
                        <div className="flex items-center justify-between rounded-lg border p-3"><Label>Allow Carry Over</Label><Switch checked={form.isCarryOverAllowed} onCheckedChange={(v) => setForm({ ...form, isCarryOverAllowed: v })} /></div>
                        {form.isCarryOverAllowed && (
                            <div className="space-y-2"><Label>Max Carry Over Days</Label><Input type="number" value={form.maxCarryOverDays} onChange={(e) => setForm({ ...form, maxCarryOverDays: Number(e.target.value) })} /></div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between rounded-lg border p-3"><Label>Manager Approval</Label><Switch checked={form.requiresManagerApproval} onCheckedChange={(v) => setForm({ ...form, requiresManagerApproval: v })} /></div>
                            <div className="flex items-center justify-between rounded-lg border p-3"><Label>HR Approval</Label><Switch checked={form.requiresHrApproval} onCheckedChange={(v) => setForm({ ...form, requiresHrApproval: v })} /></div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, leaveType: null })}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!form.name || !form.code || isPending}>
                            {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : editDialog.leaveType ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, leaveType: null })}
                onConfirm={() => { if (deleteModal.leaveType) deleteMutation.mutate(deleteModal.leaveType.id); }}
                title="Delete Leave Type"
                description={`Are you sure you want to delete "${deleteModal.leaveType?.name}"? This cannot be undone.`}
            />
        </>
    );
}
