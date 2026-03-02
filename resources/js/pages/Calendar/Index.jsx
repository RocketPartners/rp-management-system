// resources/js/Pages/Calendar/Index.jsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head } from '@inertiajs/react';
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    EyeOff,
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
    usStates = [],
}) {
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState(null);
    const [usersOnLeaveToday, setUsersOnLeaveToday] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showWFHModal, setShowWFHModal] = useState(false);
    const [currentView, setCurrentView] = useState(
        toFullCalendarView(settings.default_view),
    );
    const [currentDate, setCurrentDate] = useState(new Date());

    // WFH scheduling state
    const [wfhMode, setWfhMode] = useState('one-time'); // 'one-time' or 'recurring'
    const [wfhSelectedDates, setWfhSelectedDates] = useState([]);
    const [wfhReason, setWfhReason] = useState('');
    const [wfhWeeklyUsage, setWfhWeeklyUsage] = useState(null);
    const [wfhLoading, setWfhLoading] = useState(false);
    const [wfhError, setWfhError] = useState(null);

    // Recurring WFH state
    const [wfhRecurringDays, setWfhRecurringDays] = useState([]); // Array of weekday numbers (1=Mon, 5=Fri)
    const [wfhRecurringMonth, setWfhRecurringMonth] = useState(''); // Selected month (YYYY-MM format)

    // Load filters from localStorage or use defaults
    const getInitialFilters = () => {
        try {
            const savedFilters = localStorage.getItem('calendar_filters');
            if (savedFilters) {
                const parsed = JSON.parse(savedFilters);
                return {
                    event_types: parsed.event_types || ['leave', 'holiday', 'wfh'],
                    user_ids: parsed.user_ids || null,
                    department: parsed.department || null,
                    leave_type_ids: parsed.leave_type_ids || null,
                    search: parsed.search || null,
                    country_codes: parsed.country_codes || ['PH', 'US', 'ES'],
                    us_states: parsed.us_states || [],
                };
            }
        } catch (error) {
            console.error('Error loading saved filters:', error);
        }
        // Default filters
        return {
            event_types: settings.visible_event_types || ['leave', 'holiday', 'wfh'],
            user_ids: null,
            department: null,
            leave_type_ids: null,
            search: null,
            country_codes: ['PH', 'US', 'ES'],
            us_states: [],
        };
    };

    // Filters state
    const [filters, setFilters] = useState(getInitialFilters());
    const [showFilters, setShowFilters] = useState(false);
    const [visibleEventTypes, setVisibleEventTypes] = useState(
        getInitialFilters().event_types
    );

    // Temporary filter state (for modal)
    const [tempFilters, setTempFilters] = useState({
        event_types: filters.event_types,
        country_codes: filters.country_codes,
        us_states: filters.us_states || [],
    });

    // Fetch calendar events
    const fetchEvents = async (fetchInfo) => {
        setLoading(true);
        console.log('🔍 Fetching events with filters:', {
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
            console.log('📊 Event types:', response.data.data.map(e => e.type).filter((v, i, a) => a.indexOf(v) === i));
            console.log('📊 First holiday:', response.data.data.find(e => e.type === 'holiday'));
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
        const eventType = clickInfo.event.extendedProps?.event_type;

        // Don't show modal for holidays - they're just visual indicators
        if (eventType === 'holiday') {
            return;
        }

        setSelectedEvent({
            title: clickInfo.event.title,
            start: clickInfo.event.start,
            end: clickInfo.event.end,
            ...clickInfo.event.extendedProps,
        });
        setShowEventModal(true);
    };

    // Add custom tooltip to events when they mount
    const handleEventDidMount = (info) => {
        const eventType = info.event.extendedProps?.event_type;

        // Create custom tooltip
        let tooltipContent = '';

        if (eventType === 'holiday') {
            const holidayName = info.event.extendedProps?.holiday_name || info.event.title;
            const countryName = info.event.extendedProps?.country_name || '';
            const countryCode = info.event.extendedProps?.country_code || '';
            const holidayTypeLabel = info.event.extendedProps?.holiday_type_label || '';
            const flag = countryCode === 'PH' ? '🇵🇭' : countryCode === 'US' ? '🇺🇸' : countryCode === 'ES' ? '🇪🇸' : '🎉';

            tooltipContent = `
                <div class="custom-tooltip-content">
                    <div class="tooltip-title">${flag} ${holidayName}</div>
                    <div class="tooltip-subtitle">${countryName}</div>
                    ${holidayTypeLabel ? `<div class="tooltip-info">📌 ${holidayTypeLabel}</div>` : ''}
                </div>
            `;
        } else if (eventType === 'wfh') {
            // For WFH events
            const userName = info.event.extendedProps?.user_name || info.event.title;
            const department = info.event.extendedProps?.department || '';
            const wfhType = info.event.extendedProps?.wfh_type || '';
            const reason = info.event.extendedProps?.reason || '';

            tooltipContent = `
                <div class="custom-tooltip-content">
                    <div class="tooltip-title">🏠 ${userName}</div>
                    ${department ? `<div class="tooltip-info">📍 ${department}</div>` : ''}
                    <div class="tooltip-subtitle">Working from home</div>
                    ${wfhType === 'recurring' ? `<div class="tooltip-info">🔄 Recurring</div>` : ''}
                    ${reason ? `<div class="tooltip-info">💬 ${reason}</div>` : ''}
                </div>
            `;
        } else {
            // For leave events
            const userName = info.event.extendedProps?.user_name || info.event.title;
            const leaveType = info.event.extendedProps?.leave_type || '';
            const department = info.event.extendedProps?.department || '';
            const totalDays = info.event.extendedProps?.total_days || '';

            tooltipContent = `
                <div class="custom-tooltip-content">
                    <div class="tooltip-title">${userName}</div>
                    ${leaveType ? `<div class="tooltip-subtitle">${leaveType}</div>` : ''}
                    ${department ? `<div class="tooltip-info">📍 ${department}</div>` : ''}
                    ${totalDays ? `<div class="tooltip-info">📅 ${totalDays} day${totalDays > 1 ? 's' : ''}</div>` : ''}
                </div>
            `;
        }

        // Store tooltip data
        info.el.setAttribute('data-tooltip', tooltipContent);
        info.el.classList.add('has-custom-tooltip');

        // Add hover listeners
        let tooltipEl = null;

        const showTooltip = () => {
            // Remove any existing tooltips
            document.querySelectorAll('.custom-event-tooltip').forEach(el => el.remove());

            // Create tooltip element
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'custom-event-tooltip';
            tooltipEl.innerHTML = tooltipContent;
            document.body.appendChild(tooltipEl);

            // Position tooltip
            const rect = info.el.getBoundingClientRect();
            const tooltipRect = tooltipEl.getBoundingClientRect();

            let top = rect.bottom + window.scrollY + 5;
            let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);

            // Check if tooltip goes off screen
            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }

            // If tooltip would go below viewport, show above
            if (rect.bottom + tooltipRect.height + 10 > window.innerHeight) {
                top = rect.top + window.scrollY - tooltipRect.height - 5;
                tooltipEl.classList.add('tooltip-above');
            }

            tooltipEl.style.top = `${top}px`;
            tooltipEl.style.left = `${left}px`;

            // Fade in
            setTimeout(() => tooltipEl.classList.add('tooltip-visible'), 10);
        };

        const hideTooltip = () => {
            if (tooltipEl) {
                tooltipEl.classList.remove('tooltip-visible');
                setTimeout(() => tooltipEl?.remove(), 200);
                tooltipEl = null;
            }
        };

        info.el.addEventListener('mouseenter', showTooltip);
        info.el.addEventListener('mouseleave', hideTooltip);

        // Remove tooltip on scroll
        const scrollHandler = () => hideTooltip();
        window.addEventListener('scroll', scrollHandler, true);

        // Cleanup on destroy
        info.el._cleanupTooltip = () => {
            info.el.removeEventListener('mouseenter', showTooltip);
            info.el.removeEventListener('mouseleave', hideTooltip);
            window.removeEventListener('scroll', scrollHandler, true);
            hideTooltip();
        };
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

    // Open filters modal
    const handleOpenFilters = () => {
        setTempFilters({
            event_types: filters.event_types,
            country_codes: filters.country_codes,
            us_states: filters.us_states || [],
        });
        setShowFilters(true);
    };

    // Toggle event type in temp filters
    const toggleTempEventType = (slug) => {
        setTempFilters((prev) => {
            const newTypes = prev.event_types.includes(slug)
                ? prev.event_types.filter((t) => t !== slug)
                : [...prev.event_types, slug];
            return { ...prev, event_types: newTypes };
        });
    };

    // Toggle country in temp filters
    const toggleTempCountry = (code) => {
        setTempFilters((prev) => {
            const newCodes = prev.country_codes.includes(code)
                ? prev.country_codes.filter((c) => c !== code)
                : [...prev.country_codes, code];
            return { ...prev, country_codes: newCodes };
        });
    };

    // Toggle US state in temp filters
    const toggleTempUSState = (state) => {
        setTempFilters((prev) => {
            const newStates = prev.us_states.includes(state)
                ? prev.us_states.filter((s) => s !== state)
                : [...prev.us_states, state];
            return { ...prev, us_states: newStates };
        });
    };

    // Apply filters
    const applyFilters = () => {
        const newFilters = {
            ...filters,
            event_types: tempFilters.event_types,
            country_codes: tempFilters.country_codes,
            us_states: tempFilters.us_states,
        };

        // Save to localStorage
        try {
            localStorage.setItem('calendar_filters', JSON.stringify(newFilters));
        } catch (error) {
            console.error('Error saving filters:', error);
        }

        // Update state - useEffect will handle refetch
        setFilters(newFilters);
        setVisibleEventTypes(tempFilters.event_types);
        setShowFilters(false);
    };

    // Clear all filters
    const clearFilters = () => {
        const defaultFilters = {
            event_types: ['leave', 'holiday', 'wfh'],
            user_ids: null,
            department: null,
            leave_type_ids: null,
            search: null,
            country_codes: ['PH', 'US', 'ES'],
            us_states: [],
        };

        // Save to localStorage
        try {
            localStorage.setItem('calendar_filters', JSON.stringify(defaultFilters));
        } catch (error) {
            console.error('Error saving filters:', error);
        }

        setTempFilters({
            event_types: defaultFilters.event_types,
            country_codes: defaultFilters.country_codes,
            us_states: defaultFilters.us_states,
        });
        setFilters(defaultFilters);
        setVisibleEventTypes(defaultFilters.event_types);
        setShowFilters(false);
        // useEffect will handle refetch
    };

    // Toggle event type visibility (for sidebar legend)
    const toggleEventType = (slug) => {
        setVisibleEventTypes((prev) => {
            const newTypes = prev.includes(slug)
                ? prev.filter((t) => t !== slug)
                : [...prev, slug];

            // Update filters and save to localStorage
            setFilters((prevFilters) => {
                const newFilters = {
                    ...prevFilters,
                    event_types: newTypes,
                };

                // Save to localStorage
                try {
                    localStorage.setItem('calendar_filters', JSON.stringify(newFilters));
                } catch (error) {
                    console.error('Error saving filters:', error);
                }

                return newFilters;
            });

            return newTypes;
        });
        // useEffect will handle refetch when filters change
    };

    // Fetch weekly WFH usage
    const fetchWFHWeeklyUsage = async (date = null) => {
        try {
            const params = date ? { date: date.toISOString().split('T')[0] } : {};
            const response = await window.apiAxios.get('/api/wfh/weekly-usage', { params });
            setWfhWeeklyUsage(response.data.data);
        } catch (error) {
            console.error('Error fetching WFH weekly usage:', error);
        }
    };

    // Open WFH modal
    const handleOpenWFHModal = () => {
        setWfhSelectedDates([]);
        setWfhReason('');
        setWfhError(null);
        fetchWFHWeeklyUsage();
        setShowWFHModal(true);
    };

    // Check if date is weekend (Saturday or Sunday)
    const isWeekend = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        const day = date.getDay();
        return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
    };

    // Handle date selection for WFH
    const handleWFHDateSelect = (dateStr) => {
        // Check if it's a weekend
        if (isWeekend(dateStr)) {
            setWfhError('Cannot schedule WFH on weekends (Saturday or Sunday)');
            return;
        }

        setWfhError(null); // Clear any existing error
        setWfhSelectedDates((prev) => {
            if (prev.includes(dateStr)) {
                return prev.filter((d) => d !== dateStr);
            } else {
                return [...prev, dateStr].sort();
            }
        });
    };

    // Generate dates from recurring pattern for the selected month
    const generateRecurringDates = () => {
        if (wfhRecurringDays.length === 0 || !wfhRecurringMonth) {
            return [];
        }

        const dates = [];
        // Parse the selected month (YYYY-MM format)
        const [year, month] = wfhRecurringMonth.split('-').map(Number);

        // Get first and last day of the selected month
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0); // Last day of the month

        // Make sure we don't schedule past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const current = new Date(Math.max(start.getTime(), today.getTime()));

        while (current <= end) {
            const dayOfWeek = current.getDay();
            // Convert Sunday (0) to 7, keep others as is
            const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;

            // Format date as YYYY-MM-DD using local timezone (not UTC)
            const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;

            if (wfhRecurringDays.includes(adjustedDay) && !isWeekend(dateStr)) {
                dates.push(dateStr);
            }

            current.setDate(current.getDate() + 1);
        }

        return dates;
    };

    // Schedule WFH
    const handleScheduleWFH = async () => {
        let datesToSchedule = [];

        if (wfhMode === 'one-time') {
            if (wfhSelectedDates.length === 0) {
                setWfhError('Please select at least one date');
                return;
            }
            datesToSchedule = wfhSelectedDates;
        } else {
            // Recurring mode
            if (!wfhRecurringMonth) {
                setWfhError('Please select a month');
                return;
            }
            if (wfhRecurringDays.length === 0) {
                setWfhError('Please select at least one day of the week');
                return;
            }

            datesToSchedule = generateRecurringDates();

            if (datesToSchedule.length === 0) {
                setWfhError('No valid dates found for the selected pattern');
                return;
            }
        }

        setWfhLoading(true);
        setWfhError(null);

        try {
            const response = await window.apiAxios.post('/api/wfh', {
                dates: datesToSchedule,
                reason: wfhReason || null,
                mode: wfhMode,
            });

            // Success - close modal and refresh calendar
            setShowWFHModal(false);
            setWfhSelectedDates([]);
            setWfhReason('');
            setWfhRecurringDays([]);
            setWfhRecurringMonth('');
            setWfhMode('one-time');

            // Refresh calendar events
            const calendarApi = calendarRef.current?.getApi();
            if (calendarApi) {
                const view = calendarApi.view;
                await fetchEvents({
                    startStr: view.currentStart.toISOString(),
                    endStr: view.currentEnd.toISOString(),
                });
            }

            // Show success message
            alert(response.data.message);
        } catch (error) {
            console.error('Error scheduling WFH:', error);
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                setWfhError(errorMessages.join(', '));
            } else {
                setWfhError(error.response?.data?.message || 'Failed to schedule WFH');
            }
        } finally {
            setWfhLoading(false);
        }
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

        // Refetch calendar events when filters change
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const view = calendarApi.view;
            fetchEvents({
                startStr: view.currentStart.toISOString(),
                endStr: view.currentEnd.toISOString(),
            });
        }
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
                            variant="default"
                            size="sm"
                            onClick={handleOpenWFHModal}
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Schedule WFH
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenFilters}
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
                                        eventDidMount={handleEventDidMount}
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
                                    <p className="text-xs text-gray-500 mt-1">
                                        Click to show/hide event types on calendar
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {eventTypes.map((type) => {
                                            const isVisible = visibleEventTypes.includes(type.slug);
                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() =>
                                                        toggleEventType(type.slug)
                                                    }
                                                    className={`flex w-full items-center gap-3 rounded-md p-2 transition-all hover:bg-gray-100 border-2 ${
                                                        isVisible
                                                            ? 'border-gray-200 bg-white'
                                                            : 'border-transparent bg-gray-50 opacity-50'
                                                    }`}
                                                    title={`Click to ${isVisible ? 'hide' : 'show'} ${type.name.toLowerCase()}`}
                                                >
                                                    {isVisible ? (
                                                        <Eye className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    )}
                                                    <div
                                                        className="h-4 w-4 rounded flex-shrink-0"
                                                        style={{
                                                            backgroundColor: type.color,
                                                        }}
                                                    />
                                                    <span className="flex-1 text-left text-sm font-medium">
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
                                            );
                                        })}
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

            {/* WFH Scheduling Modal */}
            <Dialog open={showWFHModal} onOpenChange={setShowWFHModal}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>🏠 Schedule Work From Home</DialogTitle>
                        <DialogDescription>
                            Schedule specific dates or set up a recurring weekly pattern. Weekends are not allowed.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6">
                        {/* Weekly Usage at the top */}
                        {wfhWeeklyUsage && (
                            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-900">
                                            This Week's Quota
                                        </h4>
                                        <p className="text-xs text-blue-700 mt-1">
                                            {wfhWeeklyUsage.used} of {wfhWeeklyUsage.quota} days used
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-900">
                                            {wfhWeeklyUsage.remaining}
                                        </div>
                                        <div className="text-xs text-blue-700">days left</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mode Toggle */}
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                            <button
                                onClick={() => setWfhMode('one-time')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    wfhMode === 'one-time'
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                📅 One-Time Dates
                            </button>
                            <button
                                onClick={() => setWfhMode('recurring')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    wfhMode === 'recurring'
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                🔄 Recurring Pattern
                            </button>
                        </div>

                        {/* Error Display */}
                        {wfhError && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-800">{wfhError}</p>
                            </div>
                        )}

                        {/* Two Column Layout */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column - Date Selection */}
                            <div className="space-y-4">
                                {wfhMode === 'one-time' ? (
                                    <>
                                        <div>
                                            <Label htmlFor="wfh-date" className="text-base font-semibold">
                                                📅 Select Date
                                            </Label>
                                            <p className="text-xs text-gray-500 mt-1 mb-3">
                                                Choose a weekday (Mon-Fri only)
                                            </p>
                                            <input
                                                type="date"
                                                id="wfh-date"
                                                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleWFHDateSelect(e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Month Selection */}
                                        <div>
                                            <Label htmlFor="wfh-month" className="text-base font-semibold">
                                                📅 Select Month
                                            </Label>
                                            <p className="text-xs text-gray-500 mt-1 mb-3">
                                                Choose the month for your WFH pattern
                                            </p>
                                            <input
                                                type="month"
                                                id="wfh-month"
                                                value={wfhRecurringMonth}
                                                onChange={(e) => setWfhRecurringMonth(e.target.value)}
                                                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                min={new Date().toISOString().slice(0, 7)}
                                            />
                                        </div>

                                        {/* Recurring Pattern Selection */}
                                        <div>
                                            <Label className="text-base font-semibold">
                                                📆 Select Days of the Week
                                            </Label>
                                            <p className="text-xs text-gray-500 mt-1 mb-3">
                                                Choose which days you'll work from home for {wfhRecurringMonth ? new Date(wfhRecurringMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'the selected month'}
                                            </p>
                                            <div className="grid grid-cols-5 gap-2">
                                                {[
                                                    { day: 1, label: 'Mon' },
                                                    { day: 2, label: 'Tue' },
                                                    { day: 3, label: 'Wed' },
                                                    { day: 4, label: 'Thu' },
                                                    { day: 5, label: 'Fri' },
                                                ].map(({ day, label }) => (
                                                    <button
                                                        key={day}
                                                        type="button"
                                                        onClick={() => {
                                                            setWfhRecurringDays((prev) =>
                                                                prev.includes(day)
                                                                    ? prev.filter((d) => d !== day)
                                                                    : [...prev, day].sort()
                                                            );
                                                        }}
                                                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                                            wfhRecurringDays.includes(day)
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
                                    <Label htmlFor="wfh-reason" className="text-base font-semibold">
                                        💬 Reason (Optional)
                                    </Label>
                                    <textarea
                                        id="wfh-reason"
                                        rows={4}
                                        value={wfhReason}
                                        onChange={(e) => setWfhReason(e.target.value)}
                                        className="w-full mt-2 rounded-lg border-2 border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                                        placeholder="e.g., Doctor's appointment, Home maintenance, Focus work..."
                                    />
                                </div>
                            </div>

                            {/* Right Column - Selected Dates or Pattern Preview */}
                            <div>
                                {wfhMode === 'one-time' ? (
                                    <>
                                        <Label className="text-base font-semibold">
                                            ✓ Selected Dates ({wfhSelectedDates.length})
                                        </Label>
                                        {wfhSelectedDates.length === 0 ? (
                                            <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="mt-2 text-sm text-gray-500">No dates selected yet</p>
                                                <p className="text-xs text-gray-400 mt-1">Pick a date to get started</p>
                                            </div>
                                        ) : (
                                            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-2">
                                                {wfhSelectedDates.map((date, index) => (
                                                    <div
                                                        key={date}
                                                        className="group flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-300 rounded-lg px-4 py-3 transition-all duration-200"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold">
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold text-blue-900">
                                                                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                                                        weekday: 'long',
                                                                    })}
                                                                </div>
                                                                <div className="text-xs text-blue-700">
                                                                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleWFHDateSelect(date)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800"
                                                            title="Remove date"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Label className="text-base font-semibold">
                                            🔍 Pattern Preview
                                        </Label>
                                        {(() => {
                                            const previewDates = generateRecurringDates();
                                            return previewDates.length === 0 ? (
                                                <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="mt-2 text-sm text-gray-500">No dates to preview</p>
                                                    <p className="text-xs text-gray-400 mt-1">Select days and date range</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="mt-2 rounded-lg bg-blue-50 border-2 border-blue-200 p-3 mb-3">
                                                        <p className="text-sm font-semibold text-blue-900">
                                                            {previewDates.length} WFH {previewDates.length === 1 ? 'day' : 'days'} will be scheduled
                                                        </p>
                                                        <p className="text-xs text-blue-700 mt-1">
                                                            {wfhRecurringDays.map(d => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][d - 1]).join(', ')} • {wfhRecurringMonth ? new Date(wfhRecurringMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                                        {previewDates.slice(0, 10).map((date, index) => (
                                                            <div
                                                                key={date}
                                                                className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg px-4 py-2"
                                                            >
                                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
                                                                    {index + 1}
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-semibold text-blue-900">
                                                                        {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                                                            weekday: 'short',
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            year: 'numeric',
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {previewDates.length > 10 && (
                                                            <p className="text-xs text-gray-500 text-center py-2">
                                                                ... and {previewDates.length - 10} more dates
                                                            </p>
                                                        )}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowWFHModal(false);
                                setWfhMode('one-time');
                                setWfhSelectedDates([]);
                                setWfhRecurringDays([]);
                                setWfhRecurringMonth('');
                                setWfhError(null);
                            }}
                            disabled={wfhLoading}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleScheduleWFH}
                            disabled={
                                wfhLoading ||
                                (wfhMode === 'one-time' && wfhSelectedDates.length === 0) ||
                                (wfhMode === 'recurring' && (!wfhRecurringMonth || wfhRecurringDays.length === 0))
                            }
                            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                        >
                            {wfhLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Scheduling...
                                </>
                            ) : (
                                <>
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {wfhMode === 'one-time'
                                        ? `Schedule ${wfhSelectedDates.length > 0 ? `(${wfhSelectedDates.length} ${wfhSelectedDates.length === 1 ? 'day' : 'days'})` : 'WFH'}`
                                        : `Schedule ${(() => {
                                            const count = generateRecurringDates().length;
                                            return count > 0 ? `(${count} ${count === 1 ? 'day' : 'days'})` : 'Pattern';
                                        })()}`
                                    }
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Filters Sheet */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Calendar Filters</SheetTitle>
                        <SheetDescription>
                            Choose what to display on your calendar
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                        {/* Event Types Section */}
                        <div>
                            <h3 className="mb-3 text-sm font-semibold">
                                Event Types
                            </h3>
                            <div className="space-y-3">
                                {eventTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        className="flex items-center space-x-3"
                                    >
                                        <Checkbox
                                            id={`event-${type.slug}`}
                                            checked={tempFilters.event_types.includes(
                                                type.slug
                                            )}
                                            onCheckedChange={() =>
                                                toggleTempEventType(type.slug)
                                            }
                                        />
                                        <div className="flex items-center gap-2 flex-1">
                                            <div
                                                className="h-4 w-4 rounded"
                                                style={{
                                                    backgroundColor: type.color,
                                                }}
                                            />
                                            <Label
                                                htmlFor={`event-${type.slug}`}
                                                className="cursor-pointer"
                                            >
                                                {type.name}
                                            </Label>
                                        </div>
                                        {type.count !== undefined && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {type.count}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Countries Section (for Holidays) */}
                        {tempFilters.event_types.includes('holiday') && (
                            <div>
                                <h3 className="mb-3 text-sm font-semibold">
                                    Holiday Countries
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="country-ph"
                                            checked={tempFilters.country_codes.includes(
                                                'PH'
                                            )}
                                            onCheckedChange={() =>
                                                toggleTempCountry('PH')
                                            }
                                        />
                                        <Label
                                            htmlFor="country-ph"
                                            className="cursor-pointer"
                                        >
                                            🇵🇭 Philippines
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="country-us"
                                            checked={tempFilters.country_codes.includes(
                                                'US'
                                            )}
                                            onCheckedChange={() =>
                                                toggleTempCountry('US')
                                            }
                                        />
                                        <Label
                                            htmlFor="country-us"
                                            className="cursor-pointer"
                                        >
                                            🇺🇸 United States
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="country-es"
                                            checked={tempFilters.country_codes.includes(
                                                'ES'
                                            )}
                                            onCheckedChange={() =>
                                                toggleTempCountry('ES')
                                            }
                                        />
                                        <Label
                                            htmlFor="country-es"
                                            className="cursor-pointer"
                                        >
                                            🇪🇸 Spain
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* US States Section (only when US is selected) */}
                        {tempFilters.event_types.includes('holiday') &&
                            tempFilters.country_codes.includes('US') &&
                            usStates.length > 0 && (
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold">
                                        US States
                                    </h3>
                                    <p className="mb-3 text-xs text-gray-500">
                                        Filter holidays by specific US states. If no states
                                        are selected, all US holidays will be shown.
                                    </p>
                                    <div className="max-h-64 space-y-3 overflow-y-auto rounded border border-gray-200 p-3">
                                        {usStates.map((state) => (
                                            <div
                                                key={state}
                                                className="flex items-center space-x-3"
                                            >
                                                <Checkbox
                                                    id={`state-${state.replace(/\s+/g, '-').toLowerCase()}`}
                                                    checked={tempFilters.us_states.includes(
                                                        state
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleTempUSState(state)
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`state-${state.replace(/\s+/g, '-').toLowerCase()}`}
                                                    className="cursor-pointer text-sm"
                                                >
                                                    {state}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>

                    <SheetFooter className="mt-6">
                        <div className="flex w-full gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={clearFilters}
                            >
                                Clear All
                            </Button>
                            <Button className="flex-1" onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AuthenticatedLayout>
    );
}
