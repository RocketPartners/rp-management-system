<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentAccessLog extends Model
{
    use HasFactory;

    const UPDATED_AT = null; // Immutable logs - only created_at, no updated_at

    protected $fillable = [
        'user_id',
        'document_id',
        'action',
        'ip_address',
        'user_agent',
        'context',
        'accessed_at',
    ];

    protected $casts = [
        'context' => 'array',
        'accessed_at' => 'datetime',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * The user who accessed the document
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The document that was accessed
     */
    public function document()
    {
        return $this->belongsTo(OnboardingDocument::class, 'document_id');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForDocument($query, int $documentId)
    {
        return $query->where('document_id', $documentId);
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('accessed_at', '>=', now()->subDays($days));
    }
}
