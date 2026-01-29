<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\LeaveRequest;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Get statistics
        $stats = [
            'total_users' => User::count(),
            'total_inventory' => InventoryItem::count(),
            'total_projects' => Project::count(),
            'active_projects' => Project::where('status', 'in_progress')->count(),
            'low_stock_items' => InventoryItem::lowStock()->count(),
            'pending_tasks' => Task::whereIn('status', ['todo', 'in_progress'])->count(),
        ];

        // ✅ NEW: Leave Management Stats
        $leaveStats = [
            'pending_manager' => LeaveRequest::where('status', 'pending_manager')->count(),
            'pending_hr' => LeaveRequest::where('status', 'pending_hr')->count(),
            'pending_cancellation' => LeaveRequest::where('status', 'pending_cancellation')->count(),
            'approved' => LeaveRequest::where('status', 'approved')->count(),
            'this_month' => LeaveRequest::whereMonth('start_date', now()->month)
                ->whereYear('start_date', now()->year)
                ->count(),
        ];

        // ✅ NEW: Pending Leave Approvals (for HR/Admin to review)
        $pendingLeaveApprovals = LeaveRequest::with(['user', 'leaveType'])
            ->whereIn('status', ['pending_manager', 'pending_hr', 'pending_cancellation'])
            ->orderByRaw("FIELD(status, 'pending_cancellation', 'pending_hr', 'pending_manager')")
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // ✅ NEW: Upcoming Approved Leaves
        $upcomingLeaves = LeaveRequest::with(['user', 'leaveType'])
            ->where('status', 'approved')
            ->where('start_date', '>=', now())
            ->orderBy('start_date')
            ->limit(5)
            ->get();

        // ✅ NEW: Recent Announcements (with fallback if model doesn't exist)
        $announcements = [];

        if (class_exists(Announcement::class)) {
            $announcements = Announcement::with('creator')
                ->orderBy('published_at', 'desc')
                ->orWhereNull('published_at')
                ->orderBy('created_at', 'desc')
                ->limit(4)
                ->get()
                ->map(function ($announcement) {
                    return [
                        'id' => $announcement->id,
                        'title' => $announcement->title,
                        'body' => $announcement->body,
                        'published_at' => $announcement->published_at,
                        'created_at' => $announcement->created_at,
                        'creator' => $announcement->creator ? [
                            'id' => $announcement->creator->id,
                            'name' => $announcement->creator->name,
                        ] : null,
                        'attachments' => $announcement->attachments ?? [],
                    ];
                });
        }

        // Get low stock items
        $lowStockItems = InventoryItem::with('category')
            ->lowStock()
            ->orderBy('quantity', 'asc')
            ->limit(5)
            ->get();

        // Get recent tasks
        $recentTasks = Task::with(['project', 'assignee'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get project status breakdown
        $projectsByStatus = Project::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        // Get inventory by category
        $inventoryByCategory = InventoryItem::with('category')
            ->selectRaw('category_id, count(*) as count')
            ->groupBy('category_id')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category->name ?? 'Uncategorized',
                    'count' => $item->count,
                    'color' => $item->category->color ?? '#6B7280',
                ];
            });

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => $stats,
            'leaveStats' => $leaveStats,
            'pendingLeaveApprovals' => $pendingLeaveApprovals,
            'upcomingLeaves' => $upcomingLeaves,
            'announcements' => $announcements,
            'lowStockItems' => $lowStockItems,
            'recentTasks' => $recentTasks,
            'projectsByStatus' => $projectsByStatus,
            'inventoryByCategory' => $inventoryByCategory,
        ]);
    }
}
