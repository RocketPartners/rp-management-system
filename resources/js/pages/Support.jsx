import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { useTimezone } from '@/hooks/use-timezone.jsx';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Bug, Lightbulb, MessageSquare, Plus, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Support() {
    const [statusFilter, setStatusFilter] = useState('open');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [allTickets, setAllTickets] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { timezone } = useTimezone();

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'resolved':
                return 'bg-purple-100 text-purple-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else if (diffInDays < 7) {
            return `${diffInDays}d ago`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: timezone,
            });
        }
    };

    const formatFullDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: timezone,
        });
    };

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [ticketType, setTicketType] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        priority: 'medium',
        description: '',
        category: 'bug',
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await axios.get('/tickets');
            setAllTickets(response.data.tickets);
            setIsAdmin(response.data.isAdmin);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setIsLoading(false);
        }
    };

    // Filter tickets based on search and filters
    const tickets = allTickets.filter((ticket) => {
        const matchesSearch =
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || ticket.status === statusFilter;
        const matchesCategory =
            categoryFilter === 'all' || ticket.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const handleOpenDialog = (type) => {
        setTicketType(type);
        setFormData({
            ...formData,
            category: type,
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setTicketType('');
        setFormData({
            subject: '',
            priority: 'medium',
            description: '',
            category: 'bug',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post('/tickets', formData);
            handleCloseDialog();
            await fetchTickets();
        } catch (error) {
            console.error('Error creating ticket:', error);
            if (error.response) {
                console.error('Validation errors:', error.response.data);
                alert(
                    'Error creating ticket: ' +
                        JSON.stringify(
                            error.response.data.errors ||
                                error.response.data.message,
                        ),
                );
            }
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        try {
            const response = await axios.post(
                `/tickets/${selectedTicket.id}/messages`,
                {
                    message: newMessage,
                },
            );

            const updatedTickets = allTickets.map((ticket) =>
                ticket.id === selectedTicket.id ? response.data.ticket : ticket,
            );
            setAllTickets(updatedTickets);
            setSelectedTicket(response.data.ticket);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            if (error.response) {
                alert(
                    'Error sending message: ' +
                        (error.response.data.message || 'Unknown error'),
                );
            }
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!selectedTicket || !isAdmin) return;

        try {
            const response = await axios.patch(
                `/tickets/${selectedTicket.id}/status`,
                {
                    status: newStatus,
                },
            );

            const updatedTickets = allTickets.map((ticket) =>
                ticket.id === selectedTicket.id ? response.data.ticket : ticket,
            );
            setAllTickets(updatedTickets);
            setSelectedTicket(response.data.ticket);
        } catch (error) {
            console.error('Error updating status:', error);
            if (error.response) {
                alert(
                    'Error updating status: ' +
                        (error.response.data.message || 'Unknown error'),
                );
            }
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Support" />

            <div className="p-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Support
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Submit and track your support tickets
                        </p>
                    </div>
                    <Button
                        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => handleOpenDialog('feature')}
                    >
                        <Plus className="h-4 w-4" />
                        New Ticket
                    </Button>
                </div>

                {/* Filters Bar */}
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full max-w-md"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">
                                In Progress
                            </SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="all">All Status</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={categoryFilter}
                        onValueChange={setCategoryFilter}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="bug">Bug</SelectItem>
                            <SelectItem value="feature">
                                Feature Request
                            </SelectItem>
                            <SelectItem value="question">Question</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="ml-auto text-sm text-gray-500">
                        Showing{' '}
                        {tickets.length > 0 ? `1-${tickets.length}` : '0-0'} of{' '}
                        {tickets.length}
                    </div>
                </div>

                {/* Tickets List / Empty State */}
                <div className="min-h-[400px] rounded-lg border border-gray-200 bg-white">
                    {isLoading ? (
                        <div className="flex h-[400px] items-center justify-center">
                            <div className="py-12 text-center">
                                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                <p className="text-gray-500">
                                    Loading tickets...
                                </p>
                            </div>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="flex h-[400px] items-center justify-center">
                            <div className="py-12 text-center">
                                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                    No tickets found
                                </h3>
                                <p className="mb-6 text-gray-500">
                                    Click "New Ticket" to submit a support
                                    request.
                                </p>
                                <Button
                                    className="mx-auto flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={() => handleOpenDialog('feature')}
                                >
                                    <Plus className="h-4 w-4" />
                                    New Ticket
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full divide-y divide-gray-200">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
                                        selectedTicket?.id === ticket.id
                                            ? 'bg-blue-50 hover:bg-blue-50'
                                            : ''
                                    }`}
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex items-center gap-2">
                                                <h3 className="truncate text-base font-semibold text-gray-900">
                                                    {ticket.subject}
                                                </h3>
                                                <Badge
                                                    className={`${getPriorityBadgeColor(ticket.priority)} border-0 text-xs`}
                                                >
                                                    {ticket.priority
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        ticket.priority.slice(
                                                            1,
                                                        )}
                                                </Badge>
                                            </div>
                                            <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                                                {ticket.description}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    {ticket.category ===
                                                    'bug' ? (
                                                        <Bug className="h-3 w-3" />
                                                    ) : (
                                                        <Lightbulb className="h-3 w-3" />
                                                    )}
                                                    {ticket.category
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        ticket.category.slice(
                                                            1,
                                                        )}
                                                </span>
                                                <span>•</span>
                                                <span>Ticket #{ticket.id}</span>
                                                {isAdmin && ticket.user && (
                                                    <>
                                                        <span>•</span>
                                                        <span>
                                                            {ticket.user.name}
                                                        </span>
                                                    </>
                                                )}
                                                <span>•</span>
                                                <span>
                                                    Updated{' '}
                                                    {formatDate(
                                                        ticket.updated_at,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <Badge
                                                className={`${getStatusBadgeColor(ticket.status)} border-0`}
                                            >
                                                {ticket.status === 'in_progress'
                                                    ? 'In Progress'
                                                    : ticket.status
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                      ticket.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ticket Conversation */}
                {selectedTicket && (
                    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
                        {/* Conversation Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
                            <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {selectedTicket.subject}
                                    </h2>
                                    {isAdmin ? (
                                        <Select
                                            value={selectedTicket.status}
                                            onValueChange={handleStatusChange}
                                        >
                                            <SelectTrigger className="h-7 w-36">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="open">
                                                    Open
                                                </SelectItem>
                                                <SelectItem value="in_progress">
                                                    In Progress
                                                </SelectItem>
                                                <SelectItem value="resolved">
                                                    Resolved
                                                </SelectItem>
                                                <SelectItem value="closed">
                                                    Closed
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Badge
                                            className={`${getStatusBadgeColor(selectedTicket.status)} border-0`}
                                        >
                                            {selectedTicket.status ===
                                            'in_progress'
                                                ? 'In Progress'
                                                : selectedTicket.status
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  selectedTicket.status.slice(
                                                      1,
                                                  )}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Ticket #{selectedTicket.id} • Created{' '}
                                    {formatFullDate(selectedTicket.created_at)}
                                    {isAdmin &&
                                        selectedTicket.user &&
                                        ` • Reported by ${selectedTicket.user.name}`}
                                    {selectedTicket.resolved_at && (
                                        <span className="font-medium text-green-600">
                                            {' '}
                                            • Resolved{' '}
                                            {formatFullDate(
                                                selectedTicket.resolved_at,
                                            )}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSelectedTicket(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="max-h-[500px] space-y-4 overflow-y-auto p-6">
                            {selectedTicket.messages?.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.is_support ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div
                                        className={`max-w-[70%] ${message.is_support ? '' : 'flex flex-col items-end'}`}
                                    >
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-700">
                                                {message.author}
                                            </span>
                                            <span
                                                className="text-xs text-gray-500"
                                                title={formatFullDate(
                                                    message.created_at,
                                                )}
                                            >
                                                {formatDate(message.created_at)}
                                            </span>
                                        </div>
                                        <div
                                            className={`rounded-lg px-4 py-2 ${
                                                message.is_support
                                                    ? 'bg-gray-100 text-gray-900'
                                                    : 'bg-blue-600 text-white'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap text-sm">
                                                {message.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        {selectedTicket.status !== 'closed' && (
                            <div className="border-t border-gray-200 bg-gray-50 p-4">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex gap-2"
                                >
                                    <Textarea
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) =>
                                            setNewMessage(e.target.value)
                                        }
                                        rows={2}
                                        className="flex-1 resize-none"
                                    />
                                    <Button
                                        type="submit"
                                        className="self-end bg-blue-600 text-white hover:bg-blue-700"
                                        disabled={!newMessage.trim()}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                )}

                {/* Create Ticket Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-blue-600" />
                                Create New Ticket
                            </DialogTitle>
                            <DialogDescription>
                                Provide details about your request and we'll get
                                back to you as soon as possible.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 py-4">
                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) =>
                                            handleInputChange('category', value)
                                        }
                                        required
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bug">
                                                Bug Report
                                            </SelectItem>
                                            <SelectItem value="feature">
                                                Feature Request
                                            </SelectItem>
                                            <SelectItem value="question">
                                                Question
                                            </SelectItem>
                                            <SelectItem value="other">
                                                Other
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Subject */}
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject *</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Brief description of the issue"
                                        value={formData.subject}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'subject',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) =>
                                            handleInputChange('priority', value)
                                        }
                                    >
                                        <SelectTrigger id="priority">
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">
                                                Low
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                Medium
                                            </SelectItem>
                                            <SelectItem value="high">
                                                High
                                            </SelectItem>
                                            <SelectItem value="critical">
                                                Critical
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Description *
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe your request in detail..."
                                        value={formData.description}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        rows={6}
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={handleCloseDialog}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Submit Ticket
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}
