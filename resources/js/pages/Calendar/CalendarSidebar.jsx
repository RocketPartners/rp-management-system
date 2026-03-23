import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Users } from 'lucide-react';

export default function CalendarSidebar({
    statistics,
    usersOnLeaveToday,
    eventTypes,
    visibleEventTypes,
    onToggleEventType,
}) {
    return (
        <div className="space-y-6">
            {/* Statistics Card */}
            {statistics && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Overview</CardTitle>
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
                                {statistics.users_on_leave_today}
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
                                            {leave.user.department}
                                        </p>
                                        <Badge
                                            className="mt-1 text-xs"
                                            style={{
                                                backgroundColor:
                                                    leave.leave_type.color,
                                                color: '#fff',
                                            }}
                                        >
                                            {leave.leave_type.name}
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
                    <CardTitle className="text-sm">Event Types</CardTitle>
                    <p className="mt-1 text-xs text-gray-500">
                        Click to show/hide event types on calendar
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {eventTypes.map((type) => {
                            const isVisible = visibleEventTypes.includes(
                                type.slug,
                            );
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => onToggleEventType(type.slug)}
                                    className={`flex w-full items-center gap-3 rounded-md border-2 p-2 transition-all hover:bg-gray-100 ${
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
                                        className="h-4 w-4 flex-shrink-0 rounded"
                                        style={{ backgroundColor: type.color }}
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
    );
}
