import {
    Bell,
    CheckCircle2,
    Clock,
    LifeBuoy,
    MessageSquare,
    UserCheck,
    XCircle,
    type LucideIcon,
} from 'lucide-react';

export interface NotificationResponse {
    id: number;
    type: string;
    title: string;
    message: string;
    referenceType: string | null;
    referenceId: number | null;
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
}

interface NotificationMeta {
    icon: LucideIcon;
    color: string;
    label: string;
}

export const NOTIFICATION_META: Record<string, NotificationMeta> = {
    TICKET_REPLY: { icon: MessageSquare, color: 'text-blue-500', label: 'Ticket Reply' },
    TICKET_STATUS: { icon: LifeBuoy, color: 'text-indigo-500', label: 'Ticket Update' },
    LEAVE_REQUESTED: { icon: Clock, color: 'text-yellow-500', label: 'Leave Request' },
    LEAVE_APPROVED: { icon: CheckCircle2, color: 'text-green-500', label: 'Leave Approved' },
    LEAVE_APPROVED_BY_MANAGER: { icon: CheckCircle2, color: 'text-green-500', label: 'Manager Approved' },
    LEAVE_REJECTED: { icon: XCircle, color: 'text-red-500', label: 'Leave Rejected' },
    LEAVE_REJECTED_BY_MANAGER: { icon: XCircle, color: 'text-red-500', label: 'Manager Rejected' },
    LEAVE_CANCELLED: { icon: XCircle, color: 'text-gray-500', label: 'Leave Cancelled' },
    LEAVE_CANCELLATION_REQUESTED: { icon: Clock, color: 'text-orange-500', label: 'Cancellation Requested' },
    LEAVE_CANCELLATION_APPROVED: { icon: CheckCircle2, color: 'text-green-500', label: 'Cancellation Approved' },
    LEAVE_CANCELLATION_REJECTED: { icon: XCircle, color: 'text-red-500', label: 'Cancellation Rejected' },
    USER_APPROVAL: { icon: UserCheck, color: 'text-green-500', label: 'User Approval' },
    ONBOARDING_SUBMITTED: { icon: UserCheck, color: 'text-blue-500', label: 'Onboarding Submitted' },
    ONBOARDING_APPROVED: { icon: CheckCircle2, color: 'text-green-500', label: 'Onboarding Approved' },
    ONBOARDING_REJECTED: { icon: XCircle, color: 'text-red-500', label: 'Onboarding Rejected' },
    ONBOARDING_UPDATE: { icon: UserCheck, color: 'text-teal-500', label: 'Onboarding' },
};

const DEFAULT_META: NotificationMeta = { icon: Bell, color: 'text-gray-500', label: 'Notification' };

export function getNotificationMeta(type: string): NotificationMeta {
    return NOTIFICATION_META[type] ?? DEFAULT_META;
}

export function getNotificationRoute(referenceType: string | null, referenceId: number | null): string | null {
    if (!referenceType || !referenceId) return null;
    switch (referenceType) {
        case 'TICKET':
            return `/support`;
        case 'LEAVE':
        case 'LEAVE_APPLICATION':
            return `/my-leaves/${referenceId}`;
        case 'USER':
            return `/users/${referenceId}`;
        case 'ONBOARDING':
            return `/onboarding/submissions/${referenceId}`;
        default:
            return null;
    }
}
