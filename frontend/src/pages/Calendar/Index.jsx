import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    Loader2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import CalendarFilters from './CalendarFilters';
import CalendarSidebar from './CalendarSidebar';
import { setupEventTooltip } from './event-tooltip';
import EventDetailModal from './EventDetailModal';
import WFHScheduleModal from './WFHScheduleModal';

// Map backend view names to FullCalendar view names
const VIEW_MAP = {
    month: 'dayGridMonth',
    week: 'timeGridWeek',
    day: 'timeGridDay',
    dayGridMonth: 'month',
    timeGridWeek: 'week',
    timeGridDay: 'day',
};

const toFullCalendarView = (v) => VIEW_MAP[v] || 'dayGridMonth';
const toBackendView = (v) => VIEW_MAP[v] || 'month';

const DEFAULT_FILTERS = {
    event_types: ['leave', 'holiday', 'wfh'],
    user_ids: null,
    department_id: null,
    manager_id: null,
    leave_type_ids: null,
    search: null,
    country_codes: ['PH', 'US', 'ES'],
    us_states: [],
};

function loadFilters(settings) {
    try {
        const saved = localStorage.getItem('calendar_filters');
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...DEFAULT_FILTERS, ...parsed };
        }
    } catch {
        /* ignore */
    }
    return {
        ...DEFAULT_FILTERS,
        event_types:
            settings.visible_event_types || DEFAULT_FILTERS.event_types,
    };
}

function persistFilters(filters) {
    try {
        localStorage.setItem('calendar_filters', JSON.stringify(filters));
    } catch {
        /* ignore */
    }
}

export default function CalendarIndex({
    auth,
    settings,
    eventTypes,
    departments,
    leaveTypes,
    usStates = [],
    managers = [],
}) {
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [usersOnLeaveToday, setUsersOnLeaveToday] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showWFHModal, setShowWFHModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [wfhWeeklyUsage, setWfhWeeklyUsage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [currentView, setCurrentView] = useState(
        toFullCalendarView(settings.default_view),
    );
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filters, setFilters] = useState(() => loadFilters(settings));

    // Persist filters to localStorage whenever they change
    useEffect(() => {
        persistFilters(filters);
    }, [filters]);

    // Fetch calendar events
    const fetchEvents = useCallback(
        async (fetchInfo) => {
            setLoading(true);
            try {
                const response = await window.apiAxios.get(
                    '/api/calendar/events',
                    {
                        params: {
                            start: fetchInfo.startStr.split('T')[0],
                            end: fetchInfo.endStr.split('T')[0],
                            ...filters,
                        },
                    },
                );
                setEvents(response.data.data);
            } catch (error) {
                console.error('Error fetching calendar events:', error);
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
            const response = await window.apiAxios.get(
                '/api/calendar/statistics',
                {
                    params: {
                        start: view.currentStart.toISOString().split('T')[0],
                        end: view.currentEnd.toISOString().split('T')[0],
                        event_types: filters.event_types,
                    },
                },
            );
            setStatistics(response.data.data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }, [filters]);

    // Fetch users on leave today
    const fetchUsersOnLeaveToday = useCallback(async () => {
        try {
            const response = await window.apiAxios.get(
                '/api/calendar/users-on-leave',
                {
                    params: { date: new Date().toISOString().split('T')[0] },
                },
            );
            setUsersOnLeaveToday(response.data.data);
        } catch (error) {
            console.error('Error fetching users on leave:', error);
        }
    }, []);

    // Event click handler
    const handleEventClick = useCallback((clickInfo) => {
        if (clickInfo.event.extendedProps?.event_type === 'holiday') return;

        setSelectedEvent({
            title: clickInfo.event.title,
            start: clickInfo.event.start,
            end: clickInfo.event.end,
            ...clickInfo.event.extendedProps,
        });
        setShowEventModal(true);
    }, []);

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

    const handleViewChange = (view) => {
        setCurrentView(view);
        const api = calendarRef.current?.getApi();
        if (api) api.changeView(view);
    };

    // Export handler
    const handleExport = async () => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        const view = api.view;
        const start = view.currentStart.toISOString().split('T')[0];
        const end = view.currentEnd.toISOString().split('T')[0];
        window.location.href = `/calendar/export?start=${start}&end=${end}&format=csv&event_types[]=${filters.event_types.join('&event_types[]=')}`;
    };

    // Toggle event type visibility from sidebar legend
    const handleToggleEventType = useCallback((slug) => {
        setFilters((prev) => {
            const newTypes = prev.event_types.includes(slug)
                ? prev.event_types.filter((t) => t !== slug)
                : [...prev.event_types, slug];
            return { ...prev, event_types: newTypes };
        });
    }, []);

    // Apply filters from filter sheet
    const handleApplyFilters = useCallback((tempFilters) => {
        setFilters((prev) => ({
            ...prev,
            event_types: tempFilters.event_types,
            country_codes: tempFilters.country_codes,
            us_states: tempFilters.us_states,
            manager_id: tempFilters.manager_id,
        }));
    }, []);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, []);

    // Open WFH modal
    const handleOpenWFHModal = async () => {
        try {
            const response = await window.apiAxios.get('/api/wfh/weekly-usage');
            setWfhWeeklyUsage(response.data.data);
        } catch {
            /* ignore */
        }
        setShowWFHModal(true);
    };

    // WFH scheduled callback — refresh calendar and show success
    const handleWFHScheduled = useCallback(
        (message) => {
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
    }, [filters]);

    // Save settings on unmount
    useEffect(() => {
        return () => {
            window.apiAxios
                .put('/calendar/settings', {
                    default_view: toBackendView(currentView),
                    show_weekends: settings.show_weekends,
                    visible_event_types: filters.event_types,
                    default_filters: filters,
                })
                .catch(() => {});
        };
    }, [currentView, filters]);

    // Formatted date range for header
    const getDateRangeText = () => {
        const api = calendarRef.current?.getApi();
        if (!api) return '';
        const start = api.view.currentStart;
        const end = api.view.currentEnd;

        if (currentView === 'dayGridMonth') {
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
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Calendar
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            View team activities, leaves, and events
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleOpenWFHModal}
                        >
                            <svg
                                className="mr-2 h-4 w-4"
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
                            size="sm"
                            onClick={() => setShowFilters(true)}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Calendar" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Success Message */}
                    {successMessage && (
                        <div className="animate-fade-in mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                            <p className="text-sm font-medium text-green-800">
                                {successMessage}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        {/* Main Calendar */}
                        <div className="lg:col-span-3">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
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
                                            <h3 className="text-lg font-semibold">
                                                {getDateRangeText()}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {[
                                                'dayGridMonth',
                                                'timeGridWeek',
                                                'timeGridDay',
                                            ].map((view) => (
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
                                </CardHeader>
                                <CardContent>
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
                                        weekends={settings.show_weekends}
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
                                        moreLinkText={(num) => `+${num} more`}
                                        moreLinkClassNames="fc-more-link"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
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
        </AuthenticatedLayout>
    );
}
