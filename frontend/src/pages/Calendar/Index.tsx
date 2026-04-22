import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { apiFetch } from '@/lib/spring-boot-api';
import type {
    CalendarEventData,
    CalendarEventTypeConfig,
    CalendarFiltersState,
    CalendarManagerOption,
    CalendarStatsResponse,
    SelectedCalendarEvent,
    UserOnLeaveResponse,
    WFHWeeklyUsage,
} from '@/types';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    Loader2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsBottomNav } from '@/hooks/use-bottom-nav';
import { Helmet } from 'react-helmet-async';

import CalendarFilters from './CalendarFilters';
import CalendarSidebar from './CalendarSidebar';
import { setupEventTooltip } from './event-tooltip';
import EventDetailModal from './EventDetailModal';
import WFHScheduleModal from './WFHScheduleModal';

type FullCalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listMonth';

const DEFAULT_FILTERS: CalendarFiltersState = {
    event_types: ['leave', 'holiday', 'wfh'],
    user_ids: null,
    department_id: null,
    manager_id: null,
    leave_type_ids: null,
    search: null,
    country_codes: ['PH', 'US', 'ES'],
    us_states: [],
};

function loadFilters(): CalendarFiltersState {
    try {
        const saved = localStorage.getItem('calendar_filters');
        if (saved) {
            const parsed = JSON.parse(saved) as Partial<CalendarFiltersState>;
            return { ...DEFAULT_FILTERS, ...parsed };
        }
    } catch {
        /* ignore */
    }
    return { ...DEFAULT_FILTERS };
}

function persistFilters(filters: CalendarFiltersState) {
    try {
        localStorage.setItem('calendar_filters', JSON.stringify(filters));
    } catch {
        /* ignore */
    }
}

export default function CalendarIndex() {
    const calendarRef = useRef<FullCalendar>(null);
    const isMobile = useIsBottomNav();
    const [events, setEvents] = useState<CalendarEventData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [statistics, setStatistics] = useState<CalendarStatsResponse | null>(null);
    const [usersOnLeaveToday, setUsersOnLeaveToday] = useState<UserOnLeaveResponse[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<SelectedCalendarEvent | null>(null);
    const [showEventModal, setShowEventModal] = useState<boolean>(false);
    const [showWFHModal, setShowWFHModal] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [wfhWeeklyUsage, setWfhWeeklyUsage] = useState<WFHWeeklyUsage | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<FullCalendarView>(() => isMobile ? 'listMonth' : 'dayGridMonth');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [filters, setFilters] = useState<CalendarFiltersState>(() => loadFilters());

    // Reference data fetched from API
    const [eventTypes, setEventTypes] = useState<CalendarEventTypeConfig[]>([]);
    const [usStates, setUsStates] = useState<string[]>([]);
    const [managers, setManagers] = useState<CalendarManagerOption[]>([]);

    // Fetch reference data on mount
    useEffect(() => {
        const fetchRefData = async () => {
            try {
                const [typesRes, statesRes, managersRes] = await Promise.allSettled([
                    apiFetch('/calendar/event-types'),
                    apiFetch('/calendar/us-states'),
                    apiFetch('/calendar/managers'),
                ]);

                if (typesRes.status === 'fulfilled' && typesRes.value.ok) {
                    const json = await typesRes.value.json();
                    setEventTypes(json.data || []);
                }
                if (statesRes.status === 'fulfilled' && statesRes.value.ok) {
                    const json = await statesRes.value.json();
                    setUsStates(json.data || []);
                }
                if (managersRes.status === 'fulfilled' && managersRes.value.ok) {
                    const json = await managersRes.value.json();
                    setManagers(json.data || []);
                }
            } catch {
                /* silent */
            }
        };
        fetchRefData();
    }, []);

    // Persist filters to localStorage whenever they change
    useEffect(() => {
        persistFilters(filters);
    }, [filters]);

    // Fetch calendar events
    const fetchEvents = useCallback(
        async (fetchInfo: { startStr: string; endStr: string }) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    start: fetchInfo.startStr.split('T')[0],
                    end: fetchInfo.endStr.split('T')[0],
                });
                filters.event_types.forEach((t) => params.append('event_types', t));
                filters.country_codes.forEach((c) => params.append('country_codes', c));
                if (filters.us_states.length > 0) {
                    filters.us_states.forEach((s) => params.append('us_states', s));
                }
                if (filters.manager_id) {
                    params.set('manager_id', String(filters.manager_id));
                }

                const res = await apiFetch(`/calendar/events?${params.toString()}`);
                if (res.ok) {
                    const json = await res.json();
                    setEvents(json.data || []);
                }
            } catch {
                /* silent */
            } finally {
                setLoading(false);
            }
        },
        [filters],
    );

    // Fetch statistics
    const fetchStatistics = useCallback(async () => {
        try {
            const calendarApi = calendarRef.current?.getApi();
            if (!calendarApi) return;
            const view = calendarApi.view;
            const params = new URLSearchParams({
                start: view.currentStart.toISOString().split('T')[0],
                end: view.currentEnd.toISOString().split('T')[0],
            });
            filters.event_types.forEach((t) => params.append('event_types', t));

            const res = await apiFetch(`/calendar/statistics?${params.toString()}`);
            if (res.ok) {
                const json = await res.json();
                setStatistics(json.data);
            }
        } catch {
            /* silent */
        }
    }, [filters]);

    // Fetch users on leave today
    const fetchUsersOnLeaveToday = useCallback(async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await apiFetch(`/calendar/users-on-leave?date=${today}`);
            if (res.ok) {
                const json = await res.json();
                setUsersOnLeaveToday(json.data || []);
            }
        } catch {
            /* silent */
        }
    }, []);

    // Event click handler
    const handleEventClick = useCallback(
        (clickInfo: { event: { title: string; start: Date | null; end: Date | null; extendedProps: Record<string, unknown> } }) => {
            if ((clickInfo.event.extendedProps?.event_type as string) === 'holiday') return;

            setSelectedEvent({
                title: clickInfo.event.title,
                start: clickInfo.event.start,
                end: clickInfo.event.end,
                event_type: (clickInfo.event.extendedProps?.event_type as string) || '',
                ...clickInfo.event.extendedProps,
            });
            setShowEventModal(true);
        },
        [],
    );

    // Navigation handlers
    const handlePrevious = () => {
        const api = calendarRef.current?.getApi();
        if (api) {
            api.prev();
            setCurrentDate(api.getDate());
        }
    };

    const handleNext = () => {
        const api = calendarRef.current?.getApi();
        if (api) {
            api.next();
            setCurrentDate(api.getDate());
        }
    };

    const handleToday = () => {
        const api = calendarRef.current?.getApi();
        if (api) {
            api.today();
            setCurrentDate(api.getDate());
        }
    };

    const handleViewChange = (view: FullCalendarView) => {
        setCurrentView(view);
        const api = calendarRef.current?.getApi();
        if (api) api.changeView(view);
    };

    // Export handler
    const handleExport = () => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        const view = api.view;
        const start = view.currentStart.toISOString().split('T')[0];
        const end = view.currentEnd.toISOString().split('T')[0];
        const eventTypesParam = filters.event_types
            .map((t) => `event_types[]=${t}`)
            .join('&');
        window.location.href = `/calendar/export?start=${start}&end=${end}&format=csv&${eventTypesParam}`;
    };

    // Toggle event type visibility from sidebar legend
    const handleToggleEventType = useCallback((slug: string) => {
        setFilters((prev) => {
            const newTypes = prev.event_types.includes(slug)
                ? prev.event_types.filter((t) => t !== slug)
                : [...prev.event_types, slug];
            return { ...prev, event_types: newTypes };
        });
    }, []);

    // Apply filters from filter sheet
    const handleApplyFilters = useCallback(
        (tempFilters: {
            event_types: string[];
            country_codes: string[];
            us_states: string[];
            manager_id: number | null;
        }) => {
            setFilters((prev) => ({
                ...prev,
                event_types: tempFilters.event_types,
                country_codes: tempFilters.country_codes,
                us_states: tempFilters.us_states,
                manager_id: tempFilters.manager_id,
            }));
        },
        [],
    );

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, []);

    // Open WFH modal
    const handleOpenWFHModal = async () => {
        try {
            const res = await apiFetch('/wfh/weekly-usage');
            if (res.ok) {
                const json = await res.json();
                setWfhWeeklyUsage(json.data);
            }
        } catch {
            /* ignore */
        }
        setShowWFHModal(true);
    };

    // WFH scheduled callback — refresh calendar and show success
    const handleWFHScheduled = useCallback(
        (message: string) => {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(null), 5000);

            const api = calendarRef.current?.getApi();
            if (api) {
                const view = api.view;
                fetchEvents({
                    startStr: view.currentStart.toISOString(),
                    endStr: view.currentEnd.toISOString(),
                });
            }
        },
        [fetchEvents],
    );

    // Refetch on filter changes
    useEffect(() => {
        fetchStatistics();
        fetchUsersOnLeaveToday();

        const api = calendarRef.current?.getApi();
        if (api) {
            const view = api.view;
            fetchEvents({
                startStr: view.currentStart.toISOString(),
                endStr: view.currentEnd.toISOString(),
            });
        }
    }, [filters, fetchEvents, fetchStatistics, fetchUsersOnLeaveToday]);

    // Formatted date range for header
    const getDateRangeText = (): string => {
        const api = calendarRef.current?.getApi();
        if (!api) return '';
        const start = api.view.currentStart;
        const end = api.view.currentEnd;

        if (currentView === 'dayGridMonth' || currentView === 'listMonth') {
            return start.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
            });
        } else if (currentView === 'timeGridWeek') {
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        return start.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <>
            <Helmet>
                <title>Calendar</title>
            </Helmet>

            {/* Header — white bg strip */}
            <div className="border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
                    <div className="flex items-center gap-3">
                        <div className="hidden rounded-lg bg-blue-100 p-2 lg:block">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/><line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/></svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">Calendar</h1>
                            <p className="hidden text-sm text-gray-500 lg:block">View team activities, leaves, and events</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleOpenWFHModal}
                        >
                            <svg
                                className="mr-1.5 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            Schedule WFH
                        </Button>
                        <Button
                            variant="outline"
                            size={isMobile ? 'sm' : 'default'}
                            onClick={() => setShowFilters(true)}
                        >
                            <Filter className="h-4 w-4 lg:mr-2" />
                            <span className="hidden lg:inline">Filters</span>
                        </Button>
                        <Button
                            variant="outline"
                            size={isMobile ? 'sm' : 'default'}
                            onClick={handleExport}
                            className="hidden lg:inline-flex"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-3 lg:space-y-6 lg:p-6">
                    {/* Success Message */}
                    {successMessage && (
                        <div className="animate-fade-in mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                            <p className="text-sm font-medium text-green-800">
                                {successMessage}
                            </p>
                        </div>
                    )}

                    {/* Mobile overview — compact stats row */}
                    {statistics && (
                        <div className="flex gap-3 lg:hidden">
                            <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                                <span className="text-lg font-bold text-gray-900">{statistics.totalEvents}</span>
                                <span className="text-xs text-gray-500">Events</span>
                            </div>
                            <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                                <span className="text-lg font-bold text-gray-900">{statistics.usersOnLeaveToday}</span>
                                <span className="text-xs text-gray-500">On Leave</span>
                            </div>
                            {usersOnLeaveToday.length > 0 && (
                                <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                                    <span className="text-lg font-bold text-gray-900">{usersOnLeaveToday.length}</span>
                                    <span className="text-xs text-gray-500">WFH Today</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 lg:gap-6 lg:grid-cols-4">
                        {/* Main Calendar */}
                        <div className="lg:col-span-3">
                            <Card>
                                <CardHeader className="px-3 py-3 lg:px-6 lg:py-4">
                                    {/* Row 1: Nav + date */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 lg:gap-4">
                                            <div className="flex items-center gap-1 lg:gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handlePrevious}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleToday}
                                                >
                                                    Today
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleNext}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <h3 className="text-sm font-semibold lg:text-lg">
                                                {getDateRangeText()}
                                            </h3>
                                        </div>
                                        {/* Desktop view toggles */}
                                        <div className="hidden items-center gap-2 lg:flex">
                                            {(
                                                [
                                                    'dayGridMonth',
                                                    'timeGridWeek',
                                                    'timeGridDay',
                                                ] as FullCalendarView[]
                                            ).map((view) => (
                                                <Button
                                                    key={view}
                                                    variant={
                                                        currentView === view
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        handleViewChange(view)
                                                    }
                                                >
                                                    {view === 'dayGridMonth'
                                                        ? 'Month'
                                                        : view ===
                                                            'timeGridWeek'
                                                          ? 'Week'
                                                          : 'Day'}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Mobile view toggles — includes List */}
                                    <div className="mt-2 flex items-center gap-1 lg:hidden">
                                        {(
                                            [
                                                { view: 'listMonth' as FullCalendarView, label: 'List' },
                                                { view: 'dayGridMonth' as FullCalendarView, label: 'Month' },
                                                { view: 'timeGridWeek' as FullCalendarView, label: 'Week' },
                                                { view: 'timeGridDay' as FullCalendarView, label: 'Day' },
                                            ]
                                        ).map(({ view, label }) => (
                                            <Button
                                                key={view}
                                                variant={
                                                    currentView === view
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                className="flex-1 text-xs"
                                                onClick={() =>
                                                    handleViewChange(view)
                                                }
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                </CardHeader>
                                <CardContent className="px-2 pb-3 lg:px-6 lg:pb-6">
                                    {loading && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                        </div>
                                    )}
                                    <FullCalendar
                                        ref={calendarRef}
                                        plugins={[
                                            dayGridPlugin,
                                            timeGridPlugin,
                                            listPlugin,
                                        ]}
                                        initialView={currentView}
                                        headerToolbar={false}
                                        events={events}
                                        eventClick={handleEventClick}
                                        eventDidMount={setupEventTooltip}
                                        datesSet={fetchEvents}
                                        height="auto"
                                        nowIndicator={true}
                                        eventDisplay="block"
                                        displayEventTime={false}
                                        eventTimeFormat={{
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            meridiem: false,
                                        }}
                                        dayMaxEvents={3}
                                        dayMaxEventRows={3}
                                        views={{
                                            dayGridMonth: {
                                                dayMaxEvents: 3,
                                                dayMaxEventRows: 3,
                                            },
                                        }}
                                        moreLinkClick="popover"
                                        moreLinkText={(num: number) =>
                                            `+${num} more`
                                        }
                                        moreLinkClassNames="fc-more-link"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar — hidden on mobile */}
                        <div className="hidden lg:block">
                            <CalendarSidebar
                                statistics={statistics}
                                usersOnLeaveToday={usersOnLeaveToday}
                                eventTypes={eventTypes}
                                visibleEventTypes={filters.event_types}
                                onToggleEventType={handleToggleEventType}
                            />
                        </div>
                    </div>
            </div>

            {/* Event Detail Modal */}
            <EventDetailModal
                event={selectedEvent}
                open={showEventModal}
                onOpenChange={setShowEventModal}
            />

            {/* WFH Scheduling Modal */}
            <WFHScheduleModal
                open={showWFHModal}
                onOpenChange={setShowWFHModal}
                weeklyUsage={wfhWeeklyUsage}
                onScheduled={handleWFHScheduled}
            />

            {/* Filters Sheet */}
            <CalendarFilters
                open={showFilters}
                onOpenChange={setShowFilters}
                filters={filters}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                eventTypes={eventTypes}
                usStates={usStates}
                managers={managers}
            />
        </>
    );
}
