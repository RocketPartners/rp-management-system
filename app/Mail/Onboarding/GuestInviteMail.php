<?php

namespace App\Mail\Onboarding;

use App\Models\OnboardingInvite;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GuestInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public $invite;

    /**
     * Create a new message instance.
     */
    public function __construct(OnboardingInvite $invite)
    {
        $this->invite = $invite;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Rocket Partners - Complete Your Onboarding',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.onboarding.guest-invite',
            with: [
                'invite' => $this->invite,
                'guestUrl' => $this->invite->guest_url,
                'expiresAt' => $this->invite->expires_at,
                'firstName' => $this->invite->first_name,
                'position' => $this->invite->position,
                'department' => $this->invite->department,
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
