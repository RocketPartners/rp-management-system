<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $isAdmin = $user->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count() > 0;

        $query = Ticket::with(['user', 'messages.user']);

        if (! $isAdmin) {
            $query->where('user_id', $user->id);
        }

        $tickets = $query->orderBy('updated_at', 'desc')->get();

        return response()->json([
            'tickets' => $tickets->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'subject' => $ticket->subject,
                    'description' => $ticket->description,
                    'category' => $ticket->category,
                    'priority' => $ticket->priority,
                    'status' => $ticket->status,
                    'created_at' => $ticket->created_at->toIso8601String(),
                    'updated_at' => $ticket->updated_at->toIso8601String(),
                    'resolved_at' => $ticket->resolved_at ? $ticket->resolved_at->toIso8601String() : null,
                    'user' => [
                        'id' => $ticket->user->id,
                        'name' => $ticket->user->name,
                        'email' => $ticket->user->email,
                    ],
                    'messages' => $ticket->messages->map(function ($message) {
                        return [
                            'id' => $message->id,
                            'author' => $message->user ? $message->user->name : 'Support Team',
                            'is_support' => $message->is_support,
                            'message' => $message->message,
                            'created_at' => $message->created_at->toIso8601String(),
                        ];
                    }),
                ];
            }),
            'isAdmin' => $isAdmin,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:bug,feature,question,other',
            'priority' => 'required|in:low,medium,high,critical',
        ]);

        $ticket = Ticket::create([
            'user_id' => Auth::id(),
            'subject' => $validated['subject'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'status' => 'open',
        ]);

        $ticket->load(['user', 'messages.user']);

        return response()->json([
            'ticket' => [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'description' => $ticket->description,
                'category' => $ticket->category,
                'priority' => $ticket->priority,
                'status' => $ticket->status,
                'created_at' => $ticket->created_at->toIso8601String(),
                'updated_at' => $ticket->updated_at->toIso8601String(),
                'resolved_at' => $ticket->resolved_at ? $ticket->resolved_at->toIso8601String() : null,
                'user' => [
                    'id' => $ticket->user->id,
                    'name' => $ticket->user->name,
                    'email' => $ticket->user->email,
                ],
                'messages' => $ticket->messages->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'author' => $message->user ? $message->user->name : 'Support Team',
                        'is_support' => $message->is_support,
                        'message' => $message->message,
                        'created_at' => $message->created_at->toIso8601String(),
                    ];
                }),
            ],
        ], 201);
    }

    public function addMessage(Request $request, Ticket $ticket)
    {
        $user = Auth::user();
        $isAdmin = $user->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count() > 0;

        if ($ticket->user_id !== $user->id && ! $isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'is_support' => $isAdmin,
            'message' => $validated['message'],
        ]);

        $ticket->touch();
        $ticket->load(['user', 'messages.user']);

        return response()->json([
            'message' => [
                'id' => $message->id,
                'author' => $message->user ? $message->user->name : 'Support Team',
                'is_support' => $message->is_support,
                'message' => $message->message,
                'created_at' => $message->created_at->toIso8601String(),
            ],
            'ticket' => [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'description' => $ticket->description,
                'category' => $ticket->category,
                'priority' => $ticket->priority,
                'status' => $ticket->status,
                'created_at' => $ticket->created_at->toIso8601String(),
                'updated_at' => $ticket->updated_at->toIso8601String(),
                'resolved_at' => $ticket->resolved_at ? $ticket->resolved_at->toIso8601String() : null,
                'user' => [
                    'id' => $ticket->user->id,
                    'name' => $ticket->user->name,
                    'email' => $ticket->user->email,
                ],
                'messages' => $ticket->messages->map(function ($msg) {
                    return [
                        'id' => $msg->id,
                        'author' => $msg->user ? $msg->user->name : 'Support Team',
                        'is_support' => $msg->is_support,
                        'message' => $msg->message,
                        'created_at' => $msg->created_at->toIso8601String(),
                    ];
                }),
            ],
        ], 201);
    }

    public function updateStatus(Request $request, Ticket $ticket)
    {
        $user = Auth::user();
        $isAdmin = $user->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count() > 0;

        if (! $isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
        ]);

        $updateData = ['status' => $validated['status']];

        if (in_array($validated['status'], ['resolved', 'closed']) && ! $ticket->resolved_at) {
            $updateData['resolved_at'] = now();
        } elseif (! in_array($validated['status'], ['resolved', 'closed']) && $ticket->resolved_at) {
            $updateData['resolved_at'] = null;
        }

        $ticket->update($updateData);
        $ticket->load(['user', 'messages.user']);

        return response()->json([
            'ticket' => [
                'id' => $ticket->id,
                'subject' => $ticket->subject,
                'description' => $ticket->description,
                'category' => $ticket->category,
                'priority' => $ticket->priority,
                'status' => $ticket->status,
                'created_at' => $ticket->created_at->toIso8601String(),
                'updated_at' => $ticket->updated_at->toIso8601String(),
                'resolved_at' => $ticket->resolved_at ? $ticket->resolved_at->toIso8601String() : null,
                'user' => [
                    'id' => $ticket->user->id,
                    'name' => $ticket->user->name,
                    'email' => $ticket->user->email,
                ],
                'messages' => $ticket->messages->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'author' => $message->user ? $message->user->name : 'Support Team',
                        'is_support' => $message->is_support,
                        'message' => $message->message,
                        'created_at' => $message->created_at->toIso8601String(),
                    ];
                }),
            ],
        ]);
    }
}
