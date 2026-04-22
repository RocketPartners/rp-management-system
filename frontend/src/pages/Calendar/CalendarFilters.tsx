import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { MobileBottomSheet } from '@/components/mobile-nav/MobileBottomSheet';
import { useIsBottomNav } from '@/hooks/use-bottom-nav';
import type { CalendarEventTypeConfig, CalendarManagerOption } from '@/types';
import { type ChangeEvent, useState } from 'react';

interface TempFilters {
    event_types: string[];
    country_codes: string[];
    us_states: string[];
    manager_id: number | null;
}

interface CalendarFiltersProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: {
        event_types: string[];
        country_codes: string[];
        us_states: string[];
        manager_id: number | null;
    };
    onApply: (filters: TempFilters) => void;
    onClear: () => void;
    eventTypes: CalendarEventTypeConfig[];
    usStates?: string[];
    managers?: CalendarManagerOption[];
}

const countries = [
    { code: 'PH', label: '\u{1F1F5}\u{1F1ED} Philippines' },
    { code: 'US', label: '\u{1F1FA}\u{1F1F8} United States' },
    { code: 'ES', label: '\u{1F1EA}\u{1F1F8} Spain' },
];

function FilterContent({
    tempFilters,
    eventTypes,
    usStates,
    managers,
    toggleEventType,
    toggleCountry,
    toggleUSState,
    setTempFilters,
}: {
    tempFilters: TempFilters;
    eventTypes: CalendarEventTypeConfig[];
    usStates: string[];
    managers: CalendarManagerOption[];
    toggleEventType: (slug: string) => void;
    toggleCountry: (code: string) => void;
    toggleUSState: (state: string) => void;
    setTempFilters: React.Dispatch<React.SetStateAction<TempFilters>>;
}) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-3 text-base font-semibold">Event Types</h3>
                <div className="space-y-1">
                    {eventTypes.map((type) => (
                        <div
                            key={type.id}
                            className="flex items-center space-x-3 rounded-lg px-2 py-2.5 active:bg-gray-50"
                            onClick={() => toggleEventType(type.slug)}
                        >
                            <Checkbox
                                id={`event-${type.slug}`}
                                checked={tempFilters.event_types.includes(type.slug)}
                                onCheckedChange={() => toggleEventType(type.slug)}
                                className="h-5 w-5"
                            />
                            <div className="flex flex-1 items-center gap-2.5">
                                <div className="h-4 w-4 rounded" style={{ backgroundColor: type.color }} />
                                <Label htmlFor={`event-${type.slug}`} className="cursor-pointer text-base">{type.name}</Label>
                            </div>
                            {type.count !== undefined && (
                                <Badge variant="secondary" className="text-xs">{type.count}</Badge>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {tempFilters.event_types.includes('holiday') && (
                <div>
                    <h3 className="mb-3 text-base font-semibold">Holiday Countries</h3>
                    <div className="space-y-1">
                        {countries.map(({ code, label }) => (
                            <div
                                key={code}
                                className="flex items-center space-x-3 rounded-lg px-2 py-2.5 active:bg-gray-50"
                                onClick={() => toggleCountry(code)}
                            >
                                <Checkbox
                                    id={`country-${code.toLowerCase()}`}
                                    checked={tempFilters.country_codes.includes(code)}
                                    onCheckedChange={() => toggleCountry(code)}
                                    className="h-5 w-5"
                                />
                                <Label htmlFor={`country-${code.toLowerCase()}`} className="cursor-pointer text-base">{label}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tempFilters.event_types.includes('holiday') &&
                tempFilters.country_codes.includes('US') &&
                usStates.length > 0 && (
                    <div>
                        <h3 className="mb-3 text-base font-semibold">US States</h3>
                        <p className="mb-3 text-sm text-gray-500">
                            Filter holidays by specific US states. If no states are selected, all US holidays will be shown.
                        </p>
                        <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-2">
                            {usStates.map((state) => (
                                <div
                                    key={state}
                                    className="flex items-center space-x-3 rounded-lg px-2 py-2.5 active:bg-gray-50"
                                    onClick={() => toggleUSState(state)}
                                >
                                    <Checkbox
                                        id={`state-${state.replace(/\s+/g, '-').toLowerCase()}`}
                                        checked={tempFilters.us_states.includes(state)}
                                        onCheckedChange={() => toggleUSState(state)}
                                        className="h-5 w-5"
                                    />
                                    <Label
                                        htmlFor={`state-${state.replace(/\s+/g, '-').toLowerCase()}`}
                                        className="cursor-pointer text-base"
                                    >
                                        {state}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            {managers.length > 0 && (
                <div>
                    <h3 className="mb-3 text-base font-semibold">Filter by Manager / Team</h3>
                    <p className="mb-3 text-sm text-gray-500">Show only events for a specific manager's team</p>
                    <select
                        value={tempFilters.manager_id ?? ''}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                            setTempFilters((prev) => ({
                                ...prev,
                                manager_id: e.target.value ? parseInt(e.target.value) : null,
                            }))
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All Teams</option>
                        {managers.map((manager) => (
                            <option key={manager.id} value={manager.id}>
                                {manager.name}{manager.department?.name ? ` (${manager.department.name})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}

export default function CalendarFilters({
    open,
    onOpenChange,
    filters,
    onApply,
    onClear,
    eventTypes,
    usStates = [],
    managers = [],
}: CalendarFiltersProps) {
    const isMobile = useIsBottomNav();
    const [tempFilters, setTempFilters] = useState<TempFilters>({
        event_types: filters.event_types,
        country_codes: filters.country_codes,
        us_states: filters.us_states || [],
        manager_id: filters.manager_id || null,
    });

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setTempFilters({
                event_types: filters.event_types,
                country_codes: filters.country_codes,
                us_states: filters.us_states || [],
                manager_id: filters.manager_id || null,
            });
        }
        onOpenChange(isOpen);
    };

    const toggleEventType = (slug: string) => {
        setTempFilters((prev) => ({
            ...prev,
            event_types: prev.event_types.includes(slug)
                ? prev.event_types.filter((t) => t !== slug)
                : [...prev.event_types, slug],
        }));
    };

    const toggleCountry = (code: string) => {
        setTempFilters((prev) => ({
            ...prev,
            country_codes: prev.country_codes.includes(code)
                ? prev.country_codes.filter((c) => c !== code)
                : [...prev.country_codes, code],
        }));
    };

    const toggleUSState = (state: string) => {
        setTempFilters((prev) => ({
            ...prev,
            us_states: prev.us_states.includes(state)
                ? prev.us_states.filter((s) => s !== state)
                : [...prev.us_states, state],
        }));
    };

    const handleApply = () => {
        onApply(tempFilters);
        onOpenChange(false);
    };

    const handleClear = () => {
        onClear();
        onOpenChange(false);
    };

    const filterContentProps = {
        tempFilters, eventTypes, usStates, managers,
        toggleEventType, toggleCountry, toggleUSState, setTempFilters,
    };

    if (isMobile) {
        return (
            <MobileBottomSheet
                open={open}
                onOpenChange={handleOpenChange}
                header={
                    <div className="px-5 pb-3 pt-1">
                        <h2 className="text-base font-semibold text-slate-900">Calendar Filters</h2>
                        <p className="text-xs text-gray-500">Choose what to display</p>
                    </div>
                }
            >
                <div className="px-5 pb-6">
                    <FilterContent {...filterContentProps} />
                    <div className="mt-6 flex gap-3">
                        <Button variant="outline" className="flex-1 h-12 text-base" onClick={handleClear}>Clear All</Button>
                        <Button className="flex-1 h-12 text-base" onClick={handleApply}>Apply Filters</Button>
                    </div>
                </div>
            </MobileBottomSheet>
        );
    }

    return (
        <Sheet open={open} onOpenChange={handleOpenChange}>
            <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Calendar Filters</SheetTitle>
                    <SheetDescription>Choose what to display on your calendar</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                    <FilterContent {...filterContentProps} />
                </div>
                <SheetFooter className="mt-6">
                    <div className="flex w-full gap-2">
                        <Button variant="outline" className="flex-1" onClick={handleClear}>Clear All</Button>
                        <Button className="flex-1" onClick={handleApply}>Apply Filters</Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
