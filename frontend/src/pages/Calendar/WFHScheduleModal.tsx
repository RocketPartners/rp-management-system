import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MobileBottomSheet } from '@/components/mobile-nav/MobileBottomSheet';
import { useIsBottomNav } from '@/hooks/use-bottom-nav';
import { apiFetch } from '@/lib/spring-boot-api';
import type { WFHWeeklyUsage } from '@/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const WEEKDAYS: { day: number; label: string }[] = [
    { day: 1, label: 'Mon' },
    { day: 2, label: 'Tue' },
    { day: 3, label: 'Wed' },
    { day: 4, label: 'Thu' },
    { day: 5, label: 'Fri' },
];

function isWeekend(dateStr: string): boolean {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDay();
    return day === 0 || day === 6;
}

function generateRecurringDates(
    recurringDays: number[],
    recurringMonth: string,
): string[] {
    if (recurringDays.length === 0 || !recurringMonth) return [];

    const dates: string[] = [];
    const [year, month] = recurringMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const current = new Date(Math.max(start.getTime(), today.getTime()));

    while (current <= end) {
        const dayOfWeek = current.getDay();
        const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

        if (recurringDays.includes(adjustedDay) && !isWeekend(dateStr)) {
            dates.push(dateStr);
        }

        current.setDate(current.getDate() + 1);
    }

    return dates;
}

interface WFHScheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    weeklyUsage: WFHWeeklyUsage | null;
    onScheduled: (message: string) => void;
}

type ScheduleMode = 'one-time' | 'recurring';

export default function WFHScheduleModal({
    open,
    onOpenChange,
    weeklyUsage,
    onScheduled,
}: WFHScheduleModalProps) {
    const [mode, setMode] = useState<ScheduleMode>('one-time');
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [reason, setReason] = useState<string>('');
    const [recurringDays, setRecurringDays] = useState<number[]>([]);
    const [recurringMonth, setRecurringMonth] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const isMobile = useIsBottomNav();

    const handleDateSelect = (dateStr: string) => {
        if (isWeekend(dateStr)) {
            setError('Cannot schedule WFH on weekends (Saturday or Sunday)');
            return;
        }
        setError(null);
        setSelectedDates((prev) =>
            prev.includes(dateStr)
                ? prev.filter((d) => d !== dateStr)
                : [...prev, dateStr].sort(),
        );
    };

    const resetForm = () => {
        setMode('one-time');
        setSelectedDates([]);
        setReason('');
        setRecurringDays([]);
        setRecurringMonth('');
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleSubmit = async () => {
        let datesToSchedule: string[] = [];

        if (mode === 'one-time') {
            if (selectedDates.length === 0) {
                setError('Please select at least one date');
                return;
            }
            datesToSchedule = selectedDates;
        } else {
            if (!recurringMonth) {
                setError('Please select a month');
                return;
            }
            if (recurringDays.length === 0) {
                setError('Please select at least one day of the week');
                return;
            }
            datesToSchedule = generateRecurringDates(
                recurringDays,
                recurringMonth,
            );
            if (datesToSchedule.length === 0) {
                setError('No valid dates found for the selected pattern');
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const res = await apiFetch('/wfh/schedules', {
                method: 'POST',
                body: JSON.stringify({
                    dates: datesToSchedule,
                    reason: reason || null,
                    mode,
                }),
            });

            const json = await res.json();

            if (res.ok) {
                resetForm();
                onOpenChange(false);
                onScheduled(json.message || 'WFH scheduled successfully!');
            } else {
                if (json.errors) {
                    const errorMessages = Object.values(
                        json.errors as Record<string, string[]>,
                    ).flat();
                    setError(errorMessages.join(', '));
                } else {
                    setError(json.message || 'Failed to schedule WFH');
                }
            }
        } catch {
            setError('Failed to schedule WFH');
        } finally {
            setLoading(false);
        }
    };

    const previewDates =
        mode === 'recurring'
            ? generateRecurringDates(recurringDays, recurringMonth)
            : [];

    const scheduleDateCount =
        mode === 'one-time' ? selectedDates.length : previewDates.length;

    const formContent = (
                <div className="grid gap-4 lg:gap-6">
                    {/* Weekly Usage */}
                    {weeklyUsage && (
                        <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-3 lg:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-900">
                                        This Week's Quota
                                    </h4>
                                    <p className="mt-1 text-xs text-blue-700">
                                        {weeklyUsage.used} of{' '}
                                        {weeklyUsage.quota} days used
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-900">
                                        {weeklyUsage.remaining}
                                    </div>
                                    <div className="text-xs text-blue-700">
                                        days left
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mode Toggle */}
                    <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
                        <button
                            onClick={() => setMode('one-time')}
                            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                                mode === 'one-time'
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            One-Time Dates
                        </button>
                        <button
                            onClick={() => setMode('recurring')}
                            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                                mode === 'recurring'
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Recurring Pattern
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                            <svg
                                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Single column on mobile, two on desktop */}
                    <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
                        {/* Left Column - Date Selection */}
                        <div className="space-y-4">
                            {mode === 'one-time' ? (
                                <div>
                                    <Label
                                        htmlFor="wfh-date"
                                        className="text-base font-semibold"
                                    >
                                        Select Date
                                    </Label>
                                    <p className="mb-3 mt-1 text-xs text-gray-500">
                                        Choose a weekday (Mon-Fri only)
                                    </p>
                                    <input
                                        type="date"
                                        id="wfh-date"
                                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleDateSelect(
                                                    e.target.value,
                                                );
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <Label
                                            htmlFor="wfh-month"
                                            className="text-base font-semibold"
                                        >
                                            Select Month
                                        </Label>
                                        <p className="mb-3 mt-1 text-xs text-gray-500">
                                            Choose the month for your WFH
                                            pattern
                                        </p>
                                        <input
                                            type="month"
                                            id="wfh-month"
                                            value={recurringMonth}
                                            onChange={(e) =>
                                                setRecurringMonth(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                            min={new Date()
                                                .toISOString()
                                                .slice(0, 7)}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-base font-semibold">
                                            Select Days of the Week
                                        </Label>
                                        <p className="mb-3 mt-1 text-xs text-gray-500">
                                            Choose which days you'll work from
                                            home for{' '}
                                            {recurringMonth
                                                ? new Date(
                                                      recurringMonth + '-01',
                                                  ).toLocaleDateString(
                                                      'en-US',
                                                      {
                                                          month: 'long',
                                                          year: 'numeric',
                                                      },
                                                  )
                                                : 'the selected month'}
                                        </p>
                                        <div className="grid grid-cols-5 gap-2">
                                            {WEEKDAYS.map(({ day, label }) => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() =>
                                                        setRecurringDays(
                                                            (prev) =>
                                                                prev.includes(
                                                                    day,
                                                                )
                                                                    ? prev.filter(
                                                                          (d) =>
                                                                              d !==
                                                                              day,
                                                                      )
                                                                    : [
                                                                          ...prev,
                                                                          day,
                                                                      ].sort(),
                                                        )
                                                    }
                                                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                                                        recurringDays.includes(
                                                            day,
                                                        )
                                                            ? 'bg-blue-500 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <Label
                                    htmlFor="wfh-reason"
                                    className="text-base font-semibold"
                                >
                                    Reason (Optional)
                                </Label>
                                <textarea
                                    id="wfh-reason"
                                    rows={isMobile ? 2 : 4}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="mt-2 w-full resize-none rounded-lg border-2 border-gray-300 px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    placeholder="e.g., Doctor's appointment, Home maintenance, Focus work..."
                                />
                            </div>
                        </div>

                        {/* Right Column - Selected Dates / Preview */}
                        <div>
                            {mode === 'one-time' ? (
                                <SelectedDatesList
                                    dates={selectedDates}
                                    onRemove={handleDateSelect}
                                />
                            ) : (
                                <RecurringPreview
                                    dates={previewDates}
                                    recurringDays={recurringDays}
                                    recurringMonth={recurringMonth}
                                />
                            )}
                        </div>
                    </div>
                </div>
    );

    const footerContent = (
        <div className="flex gap-2 mt-4">
            <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
            >
                Cancel
            </Button>
            <Button
                onClick={handleSubmit}
                disabled={
                    loading ||
                    (mode === 'one-time' && selectedDates.length === 0) ||
                    (mode === 'recurring' && (!recurringMonth || recurringDays.length === 0))
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scheduling...
                    </>
                ) : (
                    <>
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {scheduleDateCount > 0
                            ? `Schedule (${scheduleDateCount} ${scheduleDateCount === 1 ? 'day' : 'days'})`
                            : mode === 'one-time' ? 'Schedule WFH' : 'Schedule Pattern'}
                    </>
                )}
            </Button>
        </div>
    );

    if (isMobile) {
        return (
            <MobileBottomSheet
                open={open}
                onOpenChange={(isOpen) => {
                    if (!isOpen) handleClose();
                    else onOpenChange(true);
                }}
                header={
                    <div className="px-5 pb-3 pt-1">
                        <h2 className="text-base font-semibold text-slate-900">Schedule Work From Home</h2>
                        <p className="text-xs text-gray-500">Schedule dates or set up a recurring pattern</p>
                    </div>
                }
            >
                <div className="px-4 pb-4">
                    {formContent}
                    {footerContent}
                </div>
            </MobileBottomSheet>
        );
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) handleClose();
                else onOpenChange(true);
            }}
        >
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Schedule Work From Home</DialogTitle>
                    <DialogDescription>
                        Schedule specific dates or set up a recurring weekly pattern. Weekends are not allowed.
                    </DialogDescription>
                </DialogHeader>
                {formContent}
                <DialogFooter className="mt-6 gap-2">
                    {footerContent}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface SelectedDatesListProps {
    dates: string[];
    onRemove: (date: string) => void;
}

function SelectedDatesList({ dates, onRemove }: SelectedDatesListProps) {
    return (
        <>
            <Label className="text-base font-semibold">
                Selected Dates ({dates.length})
            </Label>
            {dates.length === 0 ? (
                <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                        No dates selected yet
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        Pick a date to get started
                    </p>
                </div>
            ) : (
                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-2">
                    {dates.map((date, index) => (
                        <div
                            key={date}
                            className="group flex items-center justify-between rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 transition-all duration-200 hover:from-blue-100 hover:to-blue-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                                    {index + 1}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-blue-900">
                                        {new Date(
                                            date + 'T00:00:00',
                                        ).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                        })}
                                    </div>
                                    <div className="text-xs text-blue-700">
                                        {new Date(
                                            date + 'T00:00:00',
                                        ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onRemove(date)}
                                className="rounded-full p-1 text-red-600 opacity-0 transition-opacity hover:bg-red-100 hover:text-red-800 group-hover:opacity-100"
                                title="Remove date"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

interface RecurringPreviewProps {
    dates: string[];
    recurringDays: number[];
    recurringMonth: string;
}

function RecurringPreview({
    dates,
    recurringDays,
    recurringMonth,
}: RecurringPreviewProps) {
    return (
        <>
            <Label className="text-base font-semibold">Pattern Preview</Label>
            {dates.length === 0 ? (
                <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                        No dates to preview
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        Select days and date range
                    </p>
                </div>
            ) : (
                <>
                    <div className="mb-3 mt-2 rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
                        <p className="text-sm font-semibold text-blue-900">
                            {dates.length} WFH{' '}
                            {dates.length === 1 ? 'day' : 'days'} will be
                            scheduled
                        </p>
                        <p className="mt-1 text-xs text-blue-700">
                            {recurringDays
                                .map(
                                    (d) =>
                                        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][
                                            d - 1
                                        ],
                                )
                                .join(', ')}{' '}
                            &bull;{' '}
                            {recurringMonth
                                ? new Date(
                                      recurringMonth + '-01',
                                  ).toLocaleDateString('en-US', {
                                      month: 'long',
                                      year: 'numeric',
                                  })
                                : ''}
                        </p>
                    </div>
                    <div className="max-h-48 space-y-2 overflow-y-auto pr-2">
                        {dates.slice(0, 10).map((date, index) => (
                            <div
                                key={date}
                                className="flex items-center gap-3 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2"
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                                    {index + 1}
                                </div>
                                <div className="text-xs font-semibold text-blue-900">
                                    {new Date(
                                        date + 'T00:00:00',
                                    ).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </div>
                            </div>
                        ))}
                        {dates.length > 10 && (
                            <p className="py-2 text-center text-xs text-gray-500">
                                ... and {dates.length - 10} more dates
                            </p>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
