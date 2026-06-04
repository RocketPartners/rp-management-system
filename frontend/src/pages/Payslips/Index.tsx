import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    CalendarRange,
    Download,
    FilePlus,
    FileText,
    Filter,
    Inbox,
    Loader2,
    ReceiptText,
    RefreshCw,
    Search,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { apiGet } from '@/lib/spring-boot-api';
import {
    deletePayslip,
    downloadPayslip,
    getPayPeriods,
    getPayslips,
    replacePayslip,
    uploadPayslip,
} from '@/lib/payslips-api';
import type { PagedResponse, PayslipResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import CreatePayslipDialog from './CreatePayslipDialog';

interface EmployeeOption {
    id: number;
    firstName: string;
    lastName: string;
}

const PAGE_SIZE = 20;

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Something went wrong';
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
    return (first + last).toUpperCase();
}

export default function PayslipsIndex() {
    const { can } = usePermission();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '0', 10);
    const filterEmployeeId = searchParams.get('employeeId') ?? '';
    const filterPayPeriodId = searchParams.get('payPeriodId') ?? '';
    const hasActiveFilters = filterEmployeeId !== '' || filterPayPeriodId !== '';

    const [uploadOpen, setUploadOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [employeeId, setEmployeeId] = useState('');
    const [payPeriodId, setPayPeriodId] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const [replaceTarget, setReplaceTarget] = useState<PayslipResponse | null>(null);
    const [replaceFile, setReplaceFile] = useState<File | null>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);

    const [deleteTarget, setDeleteTarget] = useState<PayslipResponse | null>(null);

    const canManage = can('PAYSLIP_MANAGE');

    const payslipsQuery = useQuery({
        queryKey: ['payslips', page, filterEmployeeId, filterPayPeriodId],
        queryFn: () =>
            getPayslips({
                page,
                size: PAGE_SIZE,
                employeeId: filterEmployeeId ? Number(filterEmployeeId) : undefined,
                payPeriodId: filterPayPeriodId ? Number(filterPayPeriodId) : undefined,
            }),
        enabled: canManage,
    });

    const payPeriodsQuery = useQuery({
        queryKey: ['pay-periods'],
        queryFn: getPayPeriods,
        enabled: canManage,
    });

    const employeesQuery = useQuery({
        queryKey: ['users-list'],
        queryFn: () => apiGet<PagedResponse<EmployeeOption>>('/users?size=200'),
        enabled: canManage,
    });

    const uploadMutation = useMutation({
        mutationFn: () => uploadPayslip(Number(employeeId), Number(payPeriodId), uploadFile as File),
        onSuccess: () => {
            toast.success('Payslip uploaded');
            queryClient.invalidateQueries({ queryKey: ['payslips'] });
            closeUpload();
        },
        onError: (err: unknown) => toast.error(getErrorMessage(err)),
    });

    const replaceMutation = useMutation({
        mutationFn: () => replacePayslip(replaceTarget!.id, replaceFile as File),
        onSuccess: () => {
            toast.success('Payslip replaced');
            queryClient.invalidateQueries({ queryKey: ['payslips'] });
            setReplaceTarget(null);
            setReplaceFile(null);
        },
        onError: (err: unknown) => toast.error(getErrorMessage(err)),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePayslip(id),
        onSuccess: () => {
            toast.success('Payslip removed');
            queryClient.invalidateQueries({ queryKey: ['payslips'] });
        },
        onError: (err: unknown) => toast.error(getErrorMessage(err)),
    });

    const employeeOptions = (employeesQuery.data?.content ?? []).map((u) => ({
        value: String(u.id),
        label: `${u.firstName} ${u.lastName}`,
    }));
    const payPeriodOptions = (payPeriodsQuery.data ?? []).map((pp) => ({
        value: String(pp.id),
        label: pp.label,
    }));

    // Filter changes reset to the first page so the user never lands on an empty page.
    function updateFilter(key: 'employeeId' | 'payPeriodId', value: string) {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        next.delete('page');
        setSearchParams(next);
    }

    function clearFilters() {
        const next = new URLSearchParams(searchParams);
        next.delete('employeeId');
        next.delete('payPeriodId');
        next.delete('page');
        setSearchParams(next);
    }

    // Preserve active filters when paging.
    function goToPage(nextPage: number) {
        const next = new URLSearchParams(searchParams);
        next.set('page', String(nextPage));
        setSearchParams(next);
    }

    function closeUpload() {
        setUploadOpen(false);
        setEmployeeId('');
        setPayPeriodId('');
        setUploadFile(null);
    }

    function validatePdf(file: File | null): file is File {
        if (!file) {
            toast.error('Please choose a PDF file');
            return false;
        }
        if (file.type !== 'application/pdf') {
            toast.error('Payslip must be a PDF file');
            return false;
        }
        return true;
    }

    function handleUpload() {
        if (!employeeId) return toast.error('Select an employee');
        if (!payPeriodId) return toast.error('Select a pay period');
        if (!validatePdf(uploadFile)) return;
        uploadMutation.mutate();
    }

    function handleReplace() {
        if (!validatePdf(replaceFile)) return;
        replaceMutation.mutate();
    }

    async function handleDownload(id: number) {
        try {
            await downloadPayslip(id);
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    }

    if (!canManage) {
        return (
            <div className="p-8">
                <Card className="p-8 text-center text-gray-600">
                    You do not have permission to manage payslips.
                </Card>
            </div>
        );
    }

    const data = payslipsQuery.data;
    const payslips = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    return (
        <div className="mx-auto max-w-4xl p-6 lg:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <ReceiptText className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payslips</h1>
                        <p className="text-sm text-gray-500">
                            Upload and manage employee payslips by pay period.
                        </p>
                    </div>
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button variant="outline" onClick={() => setCreateOpen(true)}>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Create payslip
                    </Button>
                    <Button onClick={() => setUploadOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload payslip
                    </Button>
                </div>
            </div>

            <div className="mb-4 flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
                <div className="hidden items-center gap-1.5 self-center pr-1 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:flex">
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                </div>
                <div className="w-full sm:w-60">
                    <Label className="mb-1.5 block text-xs font-medium text-gray-500">Employee</Label>
                    <Combobox
                        value={filterEmployeeId}
                        onChange={(value) => updateFilter('employeeId', value)}
                        placeholder="All employees"
                        searchPlaceholder="Search employees…"
                        emptyText="No employees found."
                        options={employeeOptions}
                        icon={<Search />}
                        className="bg-white"
                    />
                </div>
                <div className="w-full sm:w-60">
                    <Label className="mb-1.5 block text-xs font-medium text-gray-500">Pay period</Label>
                    <Combobox
                        value={filterPayPeriodId}
                        onChange={(value) => updateFilter('payPeriodId', value)}
                        placeholder="All pay periods"
                        searchPlaceholder="Search pay periods…"
                        emptyText="No pay periods found."
                        options={payPeriodOptions}
                        icon={<CalendarRange />}
                        className="bg-white"
                    />
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-gray-500 hover:text-gray-900 sm:ml-auto"
                    >
                        <X className="mr-1.5 h-4 w-4" />
                        Clear filters
                    </Button>
                )}
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="font-semibold">Employee</TableHead>
                                <TableHead className="font-semibold">Pay period</TableHead>
                                <TableHead className="font-semibold">File</TableHead>
                                <TableHead className="font-semibold">Uploaded</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payslipsQuery.isLoading &&
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={`skeleton-${i}`}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                                                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-100" />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            {!payslipsQuery.isLoading && payslips.length === 0 && (
                                <TableRow className="hover:bg-transparent">
                                    <TableCell colSpan={5} className="py-16">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-100">
                                                <Inbox className="h-7 w-7 text-blue-500" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {hasActiveFilters
                                                    ? 'No payslips match these filters'
                                                    : 'No payslips uploaded yet'}
                                            </p>
                                            <p className="mt-1 max-w-sm text-sm text-gray-500">
                                                {hasActiveFilters
                                                    ? 'Try adjusting or clearing the filters to see more results.'
                                                    : 'Upload a PDF or create a payslip to get started.'}
                                            </p>
                                            <div className="mt-4 flex gap-2">
                                                {hasActiveFilters ? (
                                                    <Button variant="outline" size="sm" onClick={clearFilters}>
                                                        Clear filters
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" onClick={() => setUploadOpen(true)}>
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Upload payslip
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            {payslips.map((p) => (
                                <TableRow key={p.id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                                {getInitials(p.employeeName)}
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {p.employeeName}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className="border-blue-100 bg-blue-50 font-medium text-blue-700"
                                        >
                                            {p.payPeriodLabel}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDownload(p.id)}
                                                    className="group/file inline-flex max-w-[260px] items-center gap-2 text-gray-600 transition-colors hover:text-blue-600"
                                                >
                                                    <FileText className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover/file:text-blue-600" />
                                                    <span className="truncate underline-offset-4 group-hover/file:underline">
                                                        {p.fileName}
                                                    </span>
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-md break-all">
                                                {p.fileName}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Download"
                                                className="hover:bg-blue-50 hover:text-blue-600"
                                                onClick={() => handleDownload(p.id)}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Replace"
                                                onClick={() => setReplaceTarget(p)}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Remove"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => setDeleteTarget(p)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {payslips.length > 0 && (
                    <div className="flex items-center justify-between border-t bg-gray-50/50 px-4 py-3">
                        <span className="text-sm text-gray-500">
                            {totalElements} payslip{totalElements === 1 ? '' : 's'}
                            {totalPages > 1 && ` · Page ${page + 1} of ${totalPages}`}
                        </span>
                        {totalPages > 1 && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 0}
                                    onClick={() => goToPage(page - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => goToPage(page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Upload dialog */}
            <Dialog open={uploadOpen} onOpenChange={(open) => (open ? setUploadOpen(true) : closeUpload())}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload payslip</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-1 block">Employee</Label>
                            <Combobox
                                value={employeeId}
                                onChange={setEmployeeId}
                                placeholder="Select employee"
                                searchPlaceholder="Search employees…"
                                emptyText="No employees found."
                                options={employeeOptions}
                            />
                        </div>
                        <div>
                            <Label className="mb-1 block">Pay period</Label>
                            <Combobox
                                value={payPeriodId}
                                onChange={setPayPeriodId}
                                placeholder="Select pay period"
                                searchPlaceholder="Search pay periods…"
                                emptyText="No pay periods found."
                                options={payPeriodOptions}
                            />
                        </div>
                        <div>
                            <Label className="mb-1 block">PDF file</Label>
                            <button
                                type="button"
                                onClick={() => uploadInputRef.current?.click()}
                                className="flex w-full items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                <FileText className="h-4 w-4 text-gray-400" />
                                {uploadFile ? uploadFile.name : 'Click to attach a PDF'}
                            </button>
                            <input
                                ref={uploadInputRef}
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeUpload}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                            {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Replace dialog */}
            <Dialog
                open={replaceTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setReplaceTarget(null);
                        setReplaceFile(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Replace payslip</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                        Replacing the payslip for <strong>{replaceTarget?.employeeName}</strong> ·{' '}
                        {replaceTarget?.payPeriodLabel}. The previous file is kept for records.
                    </p>
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => replaceInputRef.current?.click()}
                            className="flex w-full items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            <FileText className="h-4 w-4 text-gray-400" />
                            {replaceFile ? replaceFile.name : 'Click to attach the new PDF'}
                        </button>
                        <input
                            ref={replaceInputRef}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => setReplaceFile(e.target.files?.[0] ?? null)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setReplaceTarget(null);
                                setReplaceFile(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleReplace} disabled={replaceMutation.isPending}>
                            {replaceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Replace
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CreatePayslipDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={() => queryClient.invalidateQueries({ queryKey: ['payslips'] })}
            />

            <DeleteConfirmationModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => {
                    if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
                }}
                title="Remove payslip?"
                description="The payslip is soft-deleted and kept for records, but the employee will no longer see it."
                itemName={deleteTarget ? `${deleteTarget.employeeName} · ${deleteTarget.payPeriodLabel}` : null}
            />
        </div>
    );
}
