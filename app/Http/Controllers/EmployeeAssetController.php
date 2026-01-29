<?php

namespace App\Http\Controllers;

use App\Models\IndividualAssetAssignment;
use Inertia\Inertia;

class EmployeeAssetController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get currently assigned assets
        $assignedAssets = IndividualAssetAssignment::where('user_id', $user->id)
            ->where('status', 'active')
            ->whereNull('actual_return_date')
            ->with('asset.inventoryItem.category')
            ->get();

        // Get assignment history (returned assets)
        $assignmentHistory = IndividualAssetAssignment::where('user_id', $user->id)
            ->where('status', 'returned')
            ->whereNotNull('actual_return_date')
            ->with('asset.inventoryItem')
            ->orderBy('actual_return_date', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Employees/Assets/MyAssets', [
            'assignedAssets' => $assignedAssets,
            'assignmentHistory' => $assignmentHistory,
        ]);
    }
}
