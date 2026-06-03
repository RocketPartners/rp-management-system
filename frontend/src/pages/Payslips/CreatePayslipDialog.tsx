import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { apiGet } from '@/lib/spring-boot-api';
import { generatePayslip, getPayPeriods, type LineItemInput } from '@/lib/payslips-api';
import type { PagedResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface EmployeeOption {
    id: number;
    firstName: string;
    lastName: string;
}

interface CreatePayslipDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: () => void;
}

type Category = LineItemInput['category'];
const CATEGORIES: Category[] = ['EARNING', 'DEDUCTION', 'ALLOWANCE'];

interface RowState {
    category: Category;
    label: string;
    amount: string;
}

const firstRow = (): RowState => ({ category: 'EARNING', label: 'Basic Pay', amount: '' });
const emptyRow = (): RowState => ({ category: 'EARNING', label: '', amount: '' });

function titleCase(value: string): string {
    return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function CreatePayslipDialog({ open, onOpenChange, onCreated }: CreatePayslipDialogProps) {
    const queryClient = useQueryClient();
    const [employeeId, setEmployeeId] = useState('');
    const [payPeriodId, setPayPeriodId] = useState('');
    const [rows, setRows] = useState<RowState[]>([firstRow()]);

    const periodsQuery = useQuery({ queryKey: ['pay-periods'], queryFn: getPayPeriods, enabled: open });
    const employeesQuery = useQuery({
        queryKey: ['users-list'],
        queryFn: () => apiGet<PagedResponse<EmployeeOption>>('/users?size=200'),
        enabled: open,
    });

    const net = rows.reduce((sum, row) => {
        const amount = parseFloat(row.amount) || 0;
        return row.category === 'DEDUCTION' ? sum - amount : sum + amount;
    }, 0);

    const mutation = useMutation({
        mutationFn: () =>
            generatePayslip({
                employeeId: Number(employeeId),
                payPeriodId: Number(payPeriodId),
                // Only submit completed rows; blank rows would fail backend @NotBlank validation.
                lineItems: rows
                    .filter((row) => row.label.trim() && row.amount !== '')
                    .map((row) => ({
                        category: row.category,
                        label: row.label.trim(),
                        amount: parseFloat(row.amount) || 0,
                    })),
            }),
        onSuccess: () => {
            toast.success('Payslip generated');
            queryClient.invalidateQueries({ queryKey: ['payslips'] });
            onCreated();
            close();
        },
        onError: (err: unknown) =>
            toast.error(err instanceof Error ? err.message : 'Failed to generate payslip'),
    });

    function close() {
        onOpenChange(false);
        setEmployeeId('');
        setPayPeriodId('');
        setRows([firstRow()]);
    }

    function updateRow(index: number, patch: Partial<RowState>) {
        setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    }

    function handleSubmit() {
        if (!employeeId) return toast.error('Select an employee');
        if (!payPeriodId) return toast.error('Select a pay period');
        const filled = rows.filter((r) => r.label.trim() && r.amount !== '');
        if (filled.length === 0) return toast.error('Add at least one line item');
        if (rows.some((r) => r.label.trim() && r.amount === '')) {
            return toast.error('Every line item needs an amount');
        }
        mutation.mutate();
    }

    return (
        <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create payslip</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1 block">Employee</Label>
                            <Combobox
                                value={employeeId}
                                onChange={setEmployeeId}
                                placeholder="Select employee"
                                searchPlaceholder="Search employees…"
                                emptyText="No employees found."
                                options={(employeesQuery.data?.content ?? []).map((u) => ({
                                    value: String(u.id),
                                    label: `${u.firstName} ${u.lastName}`,
                                }))}
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
                                options={(periodsQuery.data ?? []).map((pp) => ({
                                    value: String(pp.id),
                                    label: pp.label,
                                }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="block">Line items</Label>
                        {rows.map((row, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Select
                                    value={row.category}
                                    onValueChange={(v) => updateRow(index, { category: v as Category })}
                                >
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {titleCase(c)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    className="flex-1"
                                    placeholder="Label (e.g. Withholding Tax)"
                                    value={row.label}
                                    onChange={(e) => updateRow(index, { label: e.target.value })}
                                />
                                <Input
                                    className="w-32"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={row.amount}
                                    onChange={(e) => updateRow(index, { amount: e.target.value })}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                                    disabled={rows.length === 1}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRows((prev) => [...prev, emptyRow()])}
                        >
                            <Plus className="mr-1 h-4 w-4" /> Add line item
                        </Button>
                    </div>

                    <div className="flex justify-between border-t pt-3 text-sm">
                        <span className="font-medium text-gray-700">Net pay</span>
                        <span className="font-semibold">
                            PHP{' '}
                            {net.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={close}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
