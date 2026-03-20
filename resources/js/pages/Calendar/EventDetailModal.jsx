import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function EventDetailModal({ event, open, onOpenChange }) {
    if (!event) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{event.user_name}</DialogTitle>
                    {event.event_type === 'leave' && event.leave_type && (
                        <p className="text-sm text-gray-500">{event.leave_type}</p>
                    )}
                </DialogHeader>

                <div className="space-y-3">
                    <div>
                        <span className="text-sm font-medium text-gray-500">
                            Department
                        </span>
                        <p className="text-sm">{event.department || 'N/A'}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500">
                            Duration
                        </span>
                        <p className="text-sm">
                            {event.start?.toLocaleDateString()} -{' '}
                            {event.end?.toLocaleDateString()}
                            {event.total_days && ` (${event.total_days} days)`}
                        </p>
                    </div>
                    {event.reason && (
                        <div>
                            <span className="text-sm font-medium text-gray-500">
                                Reason
                            </span>
                            <p className="text-sm">{event.reason}</p>
                        </div>
                    )}
                    {event.status && (
                        <div>
                            <span className="text-sm font-medium text-gray-500">
                                Status
                            </span>
                            <Badge className="ml-2">{event.status}</Badge>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
