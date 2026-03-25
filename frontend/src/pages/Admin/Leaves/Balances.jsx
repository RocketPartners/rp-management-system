import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarClock,
    Info,
    RefreshCw,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';

export default function Balances({
    currentYear,
    nextYear,
    nextYearBalancesExist,
    stats,
    balanceHistory,
}) {
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [resetYear, setResetYear] = useState(nextYear);
    const [confirmed, setConfirmed] = useState(false);
    const [forceReset, setForceReset] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = () => {
        if (!confirmed) return;

        setIsResetting(true);

        router.post(
            route('leave-balances.reset'),
            {
                year: resetYear,
                confirm: confirmed,
                force_reset: forceReset,
            },
            {
                onFinish: () => {
                    setIsResetting(false);
                    setShowResetDialog(false);
                    setConfirmed(false);
                    setForceReset(false);
                },
            },
        );
    };

    const openResetDialog = (year) => {
        setResetYear(year);
        setShowResetDialog(true);
        setConfirmed(false);
        setForceReset(false);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Leave Balance Management
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage and reset leave balances for all employees
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Leave Balance Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Info Alert */}
                    <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Automatic Reset:</strong> Leave balances are
                            automatically reset every January 1st at 1:00 AM.
                            Unused balances from the previous year will be
                            carried over based on each leave type's carry-over
                            policy.
                        </AlertDescription>
                    </Alert>

                    {/* Stats Cards */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Active Users */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Users
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.total_users}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Employees with balances
                                </p>
                            </CardContent>
                        </Card>

                        {/* Total Balances */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Balances
                                </CardTitle>
                                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.total_balances}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    For year {currentYear}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Carried Over */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Carried Over
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.total_carried_over}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Days from previous year
                                </p>
                            </CardContent>
                        </Card>

                        {/* Low Balance Count */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Low Balances
                                </CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {stats.low_balance_count}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Below 25% remaining
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Reset Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Reset Leave Balances</CardTitle>
                            <CardDescription>
                                Manually reset leave balances for a new year.
                                This will create new balances for all active
                                employees and carry over unused days based on
                                each leave type's policy.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Reset for Next Year */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <div className="font-medium">
                                        Reset for {nextYear}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {nextYearBalancesExist ? (
                                            <span className="text-green-600 dark:text-green-400">
                                                ✓ Balances already exist for{' '}
                                                {nextYear}
                                            </span>
                                        ) : (
                                            <span>
                                                Create new balances for{' '}
                                                {nextYear} with carry-over from{' '}
                                                {currentYear}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => openResetDialog(nextYear)}
                                    disabled={isResetting}
                                    variant={
                                        nextYearBalancesExist
                                            ? 'outline'
                                            : 'default'
                                    }
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {nextYearBalancesExist
                                        ? 'Reset Again'
                                        : 'Reset Now'}
                                </Button>
                            </div>

                            {/* Reset for Current Year */}
                            <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
                                <div className="space-y-0.5">
                                    <div className="font-medium text-orange-900 dark:text-orange-100">
                                        Reset for {currentYear} (Current Year)
                                    </div>
                                    <div className="text-sm text-orange-700 dark:text-orange-300">
                                        ⚠️ Warning: This will delete existing
                                        balances and recreate them. Use with
                                        caution!
                                    </div>
                                </div>
                                <Button
                                    onClick={() => openResetDialog(currentYear)}
                                    disabled={isResetting}
                                    variant="destructive"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reset Current
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Balance History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Balance History</CardTitle>
                            <CardDescription>
                                Previous years' balance records
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {balanceHistory.length > 0 ? (
                                    balanceHistory.map((record) => (
                                        <div
                                            key={record.year}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    Year {record.year}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {record.balance_count}{' '}
                                                    balance records
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    {record.total_carried} days
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Carried over
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-sm text-muted-foreground">
                                        No balance history available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Reset Confirmation Dialog */}
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            Reset Leave Balances for {resetYear}?
                        </DialogTitle>
                        <DialogDescription>
                            This action will create new leave balances for all
                            active employees in {resetYear}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>What will happen:</strong>
                                <ul className="mt-2 list-inside list-disc space-y-1">
                                    <li>
                                        New balances created for all active
                                        employees
                                    </li>
                                    <li>
                                        Unused days from {resetYear - 1} will be
                                        carried over (if allowed)
                                    </li>
                                    <li>
                                        Each leave type's carry-over policy will
                                        be applied
                                    </li>
                                </ul>
                            </AlertDescription>
                        </Alert>

                        {/* Confirmation Checkbox */}
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="confirm"
                                checked={confirmed}
                                onCheckedChange={setConfirmed}
                            />
                            <Label
                                htmlFor="confirm"
                                className="text-sm leading-relaxed"
                            >
                                I understand that this will create/reset leave
                                balances for {resetYear}
                            </Label>
                        </div>

                        {/* Force Reset Option (if balances already exist) */}
                        {(resetYear === nextYear && nextYearBalancesExist) ||
                        resetYear === currentYear ? (
                            <div className="flex items-start space-x-2 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950">
                                <Checkbox
                                    id="force"
                                    checked={forceReset}
                                    onCheckedChange={setForceReset}
                                />
                                <Label
                                    htmlFor="force"
                                    className="text-sm leading-relaxed text-orange-800 dark:text-orange-200"
                                >
                                    <strong>Force reset:</strong> Delete
                                    existing {resetYear} balances and recreate
                                    them
                                </Label>
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowResetDialog(false)}
                            disabled={isResetting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReset}
                            disabled={!confirmed || isResetting}
                        >
                            {isResetting ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reset Balances
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
