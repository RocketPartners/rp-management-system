import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Download, FileText, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

interface EmployeeOption {
    id: number;
    firstName: string;
    lastName: string;
}

const PAGE_SIZE = 20;

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Something went wrong';
}

export default function PayslipsIndex() {
    const { can } = usePermission();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '0', 10);

    const [uploadOpen, setUploadOpen] = useState(false);
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
        queryKey: ['payslips', page],
        queryFn: () => getPayslips({ page, size: PAGE_SIZE }),
        enabled: canManage,
    });

    const payPeriodsQuery = useQuery({
        queryKey: ['pay-periods'],
        queryFn: getPayPeriods,
        enabled: canManage && uploadOpen,
    });

    const employeesQuery = useQuery({
        queryKey: ['users-list'],
        queryFn: () => apiGet<PagedResponse<EmployeeOption>>('/users?size=200'),
        enabled: canManage && uploadOpen,
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

    return (
        <div className="p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
                    <p className="text-sm text-gray-500">
                        Upload and manage employee payslips by pay period.
                    </p>
                </div>
                <Button onClick={() => setUploadOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload payslip
                </Button>
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
                            {payslipsQuery.isLoading && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-10 text-center text-gray-500">
                                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            )}
                            {!payslipsQuery.isLoading && payslips.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-10 text-center text-gray-500">
                                        No payslips uploaded yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {payslips.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.employeeName}</TableCell>
                                    <TableCell>{p.payPeriodLabel}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center gap-1 text-gray-600">
                                            <FileText className="h-4 w-4" />
                                            {p.fileName}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Download"
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
                                                className="text-red-600 hover:text-red-700"
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

                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-4 py-3">
                        <span className="text-sm text-gray-500">
                            Page {page + 1} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 0}
                                onClick={() => setSearchParams({ page: String(page - 1) })}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages - 1}
                                onClick={() => setSearchParams({ page: String(page + 1) })}
                            >
                                Next
                            </Button>
                        </div>
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
                            <Select value={employeeId} onValueChange={setEmployeeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(employeesQuery.data?.content ?? []).map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.firstName} {u.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-1 block">Pay period</Label>
                            <Select value={payPeriodId} onValueChange={setPayPeriodId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select pay period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(payPeriodsQuery.data ?? []).map((pp) => (
                                        <SelectItem key={pp.id} value={String(pp.id)}>
                                            {pp.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
