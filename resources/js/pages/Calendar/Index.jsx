// resources/js/Pages/Calendar/Index.jsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Map backend view names to FullCalendar view names
const viewNameMap = {
    // Backend -> FullCalendar
    month: 'dayGridMonth',
    week: 'timeGridWeek',
    day: 'timeGridDay',
    // FullCalendar -> Backend
    dayGridMonth: 'month',
    timeGridWeek: 'week',
    timeGridDay: 'day',
};

const toFullCalendarView = (backendView) =>
    viewNameMap[backendView] || 'dayGridMonth';
const toBackendView = (fullCalendarView) =>
    viewNameMap[fullCalendarView] || 'month';

export default function CalendarIndex({
    auth,
    settings,
    eventTypes,
    departments,
    leaveTypes,
}) {
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [usersOnLeaveToday, setUsersOnLeaveToday] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [currentView, setCurrentView] = useState(
        toFullCalendarView(settings.default_view),
    );
    const [currentDate, setCurrentDate] = useState(new Date());
    const [visibleEventTypes, setVisibleEventTypes] = useState(
        settings.visible_event_types || ['leave'],
    );

    // Filters state
    const [filters, setFilters] = useState({
        event_types: settings.visible_event_types || ['leave'],
        user_ids: null,
        department: null,
        leave_type_ids: null,
        search: null,
    });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch calendar events
    const fetchEvents = async (fetchInfo) => {
        setLoading(true);
        console.log('🔍 Fetching events:', {
            start: fetchInfo.startStr.split('T')[0],
            end: fetchInfo.endStr.split('T')[0],
            filters,
        });
        try {
            const response = await window.apiAxios.get('/api/calendar/events', {
                params: {
                    start: fetchInfo.startStr.split('T')[0],
                    end: fetchInfo.endStr.split('T')[0],
                    ...filters,
                },
            });
            console.log(
                '✅ Events received:',
                response.data.data.length,
                'events',
            );
            console.log('📊 First event:', response.data.data[0]);
            setEvents(response.data.data);
        } catch (error) {
            console.error('❌ Error fetching calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch statistics
    const fetchStatistics = async () => {
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
    };

    // Fetch users on leave today
    const fetchUsersOnLeaveToday = async () => {
        try {
            const response = await window.apiAxios.get(
                '/api/calendar/users-on-leave',
                {
                    params: {
                        date: new Date().toISOString().split('T')[0],
                    },
                },
            );
            setUsersOnLeaveToday(response.data.data);
        } catch (error) {
            console.error('Error fetching users on leave:', error);
        }
    };

    // Event click handler
    const handleEventClick = (clickInfo) => {
        setSelectedEvent({
            title: clickInfo.event.title,
            start: clickInfo.event.start,
            end: clickInfo.event.end,
            ...clickInfo.event.extendedProps,
        });
        setShowEventModal(true);
    };

    // Date click handler removed - requires interaction plugin
    // const handleDateClick = (arg) => {
    //     console.log('Date clicked:', arg.dateStr);
    //     // Future: Open "Add Event" modal
    // };

    // View change handler
    const handleViewChange = (view) => {
        setCurrentView(view);
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.changeView(view);
        }
    };

    // Navigation handlers
    const handlePrevious = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.prev();
            setCurrentDate(calendarApi.getDate());
        }
    };

    const handleNext = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.next();
            setCurrentDate(calendarApi.getDate());
        }
    };

    const handleToday = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.today();
            setCurrentDate(calendarApi.getDate());
        }
    };

    // Export handler
    const handleExport = async () => {
        try {
            const calendarApi = calendarRef.current?.getApi();
            if (!calendarApi) return;

            const view = calendarApi.view;
            const start = view.currentStart.toISOString().split('T')[0];
            const end = view.currentEnd.toISOString().split('T')[0];

            const url = `/calendar/export?start=${start}&end=${end}&format=csv&event_types[]=${filters.event_types.join('&event_types[]=')}`;
            window.location.href = url;
        } catch (error) {
            console.error('Error exporting calendar:', error);
        }
    };

    // Toggle event type visibility
    const toggleEventType = (slug) => {
        const newTypes = visibleEventTypes.includes(slug)
            ? visibleEventTypes.filter((t) => t !== slug)
            : [...visibleEventTypes, slug];

        setVisibleEventTypes(newTypes);
        setFilters((prev) => ({ ...prev, event_types: newTypes }));
    };

    // Save settings
    const saveSettings = async () => {
        try {
            await window.apiAxios.put('/calendar/settings', {
                default_view: toBackendView(currentView),
                show_weekends: true,
                visible_event_types: visibleEventTypes,
                default_filters: filters,
            });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    // Fetch data on mount and filter changes
    useEffect(() => {
        fetchStatistics();
        fetchUsersOnLeaveToday();
    }, [filters]);

    // Debug: Log when events change
    useEffect(() => {
        console.log('📅 Events state updated:', events.length, 'events');
        if (events.length > 0) {
            console.log('First event in state:', events[0]);
        }
    }, [events]);

    // Save settings on unmount
    useEffect(() => {
        return () => {
            saveSettings();
        };
    }, [currentView, visibleEventTypes, filters]);

    // Get formatted date range
    const getDateRangeText = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (!calendarApi) return '';

        const view = calendarApi.view;
        const start = view.currentStart;
        const end = view.currentEnd;

        const options = { year: 'numeric', month: 'long' };

        if (currentView === 'dayGridMonth') {
            return start.toLocaleDateString('en-US', options);
        } else if (currentView === 'timeGridWeek') {
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else {
            return start.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
        }
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
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
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
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        {/* Main Calendar Area */}
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
                                            <Button
                                                variant={
                                                    currentView ===
                                                    'dayGridMonth'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    handleViewChange(
                                                        'dayGridMonth',
                                                    )
                                                }
                                            >
                                                Month
                                            </Button>
                                            <Button
                                                variant={
                                                    currentView ===
                                                    'timeGridWeek'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    handleViewChange(
                                                        'timeGridWeek',
                                                    )
                                                }
                                            >
                                                Week
                                            </Button>
                                            <Button
                                                variant={
                                                    currentView ===
                                                    'timeGridDay'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    handleViewChange(
                                                        'timeGridDay',
                                                    )
                                                }
                                            >
                                                Day
                                            </Button>
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
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Statistics Card */}
                            {statistics && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">
                                            Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">
                                                Total Events
                                            </span>
                                            <Badge variant="secondary">
                                                {statistics.total_events}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">
                                                On Leave Today
                                            </span>
                                            <Badge variant="secondary">
                                                {
                                                    statistics.users_on_leave_today
                                                }
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Users on Leave Today */}
                            {usersOnLeaveToday.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4" />
                                            On Leave Today
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {usersOnLeaveToday.map((leave) => (
                                                <div
                                                    key={leave.id}
                                                    className="flex items-start gap-3"
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">
                                                            {leave.user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {
                                                                leave.user
                                                                    .department
                                                            }
                                                        </p>
                                                        <Badge
                                                            className="mt-1 text-xs"
                                                            style={{
                                                                backgroundColor:
                                                                    leave
                                                                        .leave_type
                                                                        .color,
                                                                color: '#fff',
                                                            }}
                                                        >
                                                            {
                                                                leave.leave_type
                                                                    .name
                                                            }
                                                        </Badge>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {leave.total_days}d
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Event Types Legend */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">
                                        Event Types
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {eventTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() =>
                                                    toggleEventType(type.slug)
                                                }
                                                className={`flex w-full items-center gap-2 rounded p-2 transition-colors hover:bg-gray-50 ${
                                                    visibleEventTypes.includes(
                                                        type.slug,
                                                    )
                                                        ? ''
                                                        : 'opacity-40'
                                                }`}
                                            >
                                                <div
                                                    className="h-4 w-4 rounded"
                                                    style={{
                                                        backgroundColor:
                                                            type.color,
                                                    }}
                                                />
                                                <span className="flex-1 text-left text-sm">
                                                    {type.name}
                                                </span>
                                                {type.count !== undefined && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {type.count}
                                                    </Badge>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Detail Modal */}
            {showEventModal && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>
                                        {selectedEvent.user_name}
                                    </CardTitle>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {selectedEvent.event_type === 'leave' &&
                                            selectedEvent.leave_type}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowEventModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
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
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-gray-500">
                                    Department
                                </span>
                                <p className="text-sm">
                                    {selectedEvent.department || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">
                                    Duration
                                </span>
                                <p className="text-sm">
                                    {selectedEvent.start?.toLocaleDateString()}{' '}
                                    - {selectedEvent.end?.toLocaleDateString()}
                                    {selectedEvent.total_days &&
                                        ` (${selectedEvent.total_days} days)`}
                                </p>
                            </div>
                            {selectedEvent.reason && (
                                <div>
                                    <span className="text-sm font-medium text-gray-500">
                                        Reason
                                    </span>
                                    <p className="text-sm">
                                        {selectedEvent.reason}
                                    </p>
                                </div>
                            )}
                            {selectedEvent.status && (
                                <div>
                                    <span className="text-sm font-medium text-gray-500">
                                        Status
                                    </span>
                                    <Badge className="ml-2">
                                        {selectedEvent.status}
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
