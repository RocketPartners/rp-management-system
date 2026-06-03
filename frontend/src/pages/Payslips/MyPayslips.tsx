import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Download, FileText, Loader2 } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { downloadPayslip, getMyPayslips } from '@/lib/payslips-api';
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

const PAGE_SIZE = 20;

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Something went wrong';
}

export default function MyPayslips() {
    const { can } = usePermission();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '0', 10);

    const canView = can('PAYSLIP_VIEW') || can('PAYSLIP_MANAGE');

    const payslipsQuery = useQuery({
        queryKey: ['my-payslips', page],
        queryFn: () => getMyPayslips({ page, size: PAGE_SIZE }),
        enabled: canView,
    });

    async function handleDownload(id: number) {
        try {
            await downloadPayslip(id);
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    }

    if (!canView) {
        return (
            <div className="p-8">
                <Card className="p-8 text-center text-gray-600">
                    You do not have access to payslips.
                </Card>
            </div>
        );
    }

    const data = payslipsQuery.data;
    const payslips = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;

    return (
        <div className="p-6 lg:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Payslips</h1>
                <p className="text-sm text-gray-500">
                    View and download your payslips by pay period.
                </p>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="font-semibold">Pay period</TableHead>
                                <TableHead className="font-semibold">File</TableHead>
                                <TableHead className="font-semibold">Issued</TableHead>
                                <TableHead className="text-right font-semibold">Download</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payslipsQuery.isLoading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-10 text-center text-gray-500">
                                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            )}
                            {!payslipsQuery.isLoading && payslips.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-10 text-center text-gray-500">
                                        You have no payslips yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {payslips.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.payPeriodLabel}</TableCell>
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
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            title="Download"
                                            onClick={() => handleDownload(p.id)}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
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
        </div>
    );
}
