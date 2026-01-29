<?php

namespace App\Mail\Leave;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeaveRequestSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $leaveRequest;

    public $employee;

    /**
     * Create a new message instance.
     */
    public function __construct(LeaveRequest $leaveRequest)
    {
        $this->leaveRequest = $leaveRequest;
        $this->employee = $leaveRequest->user;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Leave Request Submitted - '.$this->employee->name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.leave.leave-request-submitted',
            with: [
                'leaveRequest' => $this->leaveRequest,
                'employee' => $this->employee,
                'leaveType' => $this->leaveRequest->leaveType,
                'startDate' => $this->leaveRequest->start_date->format('F d, Y'),
                'endDate' => $this->leaveRequest->end_date->format('F d, Y'),
                'totalDays' => $this->leaveRequest->total_days,
                'reason' => $this->leaveRequest->reason,
                'status' => $this->leaveRequest->status,
                'viewUrl' => route('leaves.show', $this->leaveRequest->id),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
