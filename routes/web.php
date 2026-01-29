<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeAssetController;
use App\Http\Controllers\EmployeeDashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LeaveApprovalController;
use App\Http\Controllers\LeaveBalanceController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\Onboarding\GuestOnboardingController;
use App\Http\Controllers\Onboarding\OnboardingDocumentDownloadController;
use App\Http\Controllers\Onboarding\OnboardingInviteController;
use App\Http\Controllers\Onboarding\OnboardingSubmissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserImportController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // Redirect to dashboard if authenticated, otherwise to login
    return auth()->check()
        ? redirect('/dashboard')
        : redirect('/login');
});

// ============================================
// 👤 GUEST ONBOARDING ROUTES (No authentication required)
// ✅ MUST BE OUTSIDE auth middleware - Using /guest prefix to avoid conflicts
// ============================================
Route::prefix('guest/onboarding')->name('guest.onboarding.')
    ->middleware('validate.onboarding.invite')
    ->group(function () {
        Route::get('/{token}', [GuestOnboardingController::class, 'show'])->name('show');
        Route::get('/{token}/checklist', [GuestOnboardingController::class, 'checklist'])->name('checklist');
        Route::post('/{token}/personal-info', [GuestOnboardingController::class, 'updatePersonalInfo'])->name('update-personal-info');
        Route::post('/{token}/government-ids', [GuestOnboardingController::class, 'updateGovernmentIds'])->name('update-government-ids');
        Route::post('/{token}/emergency-contact', [GuestOnboardingController::class, 'updateEmergencyContact'])->name('update-emergency-contact');
        Route::post('/{token}/upload-document', [GuestOnboardingController::class, 'uploadDocument'])->name('upload-document');
        Route::post('/{token}/replace-document/{document}', [GuestOnboardingController::class, 'replaceDocument'])->name('replace-document');
        Route::delete('/{token}/documents/{document}', [GuestOnboardingController::class, 'deleteDocument'])->name('delete-document');
        Route::post('/{token}/submit', [GuestOnboardingController::class, 'submit'])->name('submit');
    });

// ============================================
// 🔐 AUTHENTICATED ROUTES
// ============================================
Route::middleware(['auth', 'verified'])->group(function () {

    // Pending Approval Page
    Route::get('/account/pending', function () {
        return Inertia::render('Auth/PendingApproval');
    })->name('account.pending');

    // ============================================
    // 🏠 SMART DASHBOARD ROUTER
    // ============================================
    Route::get('/dashboard', function () {
        $user = auth()->user();

        $isAdmin = $user->roles->whereIn('slug', ['super-admin', 'admin', 'hr-manager'])->count() > 0;

        if ($isAdmin) {
            return app(DashboardController::class)->index();
        } else {
            return app(EmployeeDashboardController::class)->index();
        }
    })->name('dashboard');

    // ============================================
    // ⚙️ PROFILE & SETTINGS
    // ============================================
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::post('/profile', [SettingsController::class, 'updateProfile'])->name('update-profile');
        Route::put('/password', [SettingsController::class, 'updatePassword'])->name('update-password');
        Route::delete('/account', [SettingsController::class, 'destroy'])->name('destroy');
    });

    // ============================================
    // 🆘 SUPPORT
    // ============================================
    Route::get('/support', function () {
        return Inertia::render('Support');
    })->name('support');

    Route::prefix('tickets')->name('tickets.')->group(function () {
        Route::get('/', [TicketController::class, 'index'])->name('index');
        Route::post('/', [TicketController::class, 'store'])->name('store');
        Route::post('/{ticket}/messages', [TicketController::class, 'addMessage'])->name('add-message');
        Route::patch('/{ticket}/status', [TicketController::class, 'updateStatus'])->name('update-status');
    });

    // ============================================
    // 👤 EMPLOYEE SELF-SERVICE ROUTES
    // ============================================
    Route::prefix('employees')->name('employees.')->group(function () {
        Route::get('/assets', [EmployeeAssetController::class, 'index'])->name('assets');
    });

    // ============================================
    // 📅 CALENDAR MODULE
    // ============================================
    Route::prefix('calendar')->name('calendar.')->group(function () {
        // Main calendar page (accessible to all authenticated users)
        Route::get('/', [CalendarController::class, 'index'])->name('index');

        // Export calendar data (requires team view permission)
        Route::get('/export', [CalendarController::class, 'export'])->name('export');

        // Save user calendar settings
        Route::put('/settings', [CalendarController::class, 'saveSettings'])->name('settings.update');
    });

    // ============================================
    // 📋 EMPLOYEE LEAVE ROUTES (Self-Service)
    // ============================================
    Route::prefix('my-leaves')->name('my-leaves.')->group(function () {
        Route::get('/', [LeaveRequestController::class, 'index'])->name('index');
        Route::get('/apply', [LeaveRequestController::class, 'create'])->name('apply');
        Route::post('/', [LeaveRequestController::class, 'store'])->name('store');
        Route::get('/{leave}/edit', [LeaveRequestController::class, 'edit'])->name('edit');
        Route::put('/{leave}', [LeaveRequestController::class, 'update'])->name('update');
        Route::get('/{leave}', [LeaveRequestController::class, 'show'])->name('show');
        Route::post('/{leave}/cancel', [LeaveRequestController::class, 'cancel'])->name('cancel');
        Route::post('/{leave}/request-cancel', [LeaveRequestController::class, 'requestCancellation'])->name('request-cancel');
    });

    // ============================================
    // 👥 USER MANAGEMENT ROUTES (Admin/HR)
    // ============================================
    Route::get('/users/import', [UserImportController::class, 'show'])->name('users.import');
    Route::post('/users/import', [UserImportController::class, 'import'])->name('users.import.store');

    // Pending Approvals (for Senior/Lead/PM)
    Route::get('/users/pending-approvals', [UserController::class, 'pendingApprovals'])->name('users.pending-approvals');

    // User Approval Routes (BEFORE resource routes)
    Route::post('/users/{user}/approve', [UserController::class, 'approve'])->name('users.approve');
    Route::post('/users/{user}/reject', [UserController::class, 'reject'])->name('users.reject');

    Route::resource('users', UserController::class);

    // ============================================
    // 📦 INVENTORY MANAGEMENT
    // ============================================
    Route::post('/inventory/delete-assets', [InventoryController::class, 'deleteSelectedAssets'])->name('inventory.delete-assets');
    Route::resource('inventory', InventoryController::class);

    // Individual Assets
    Route::prefix('individual-assets')->name('individual-assets.')->group(function () {
        Route::get('/', [AssetController::class, 'index'])->name('index');
        Route::get('/assign/{asset?}', [AssetController::class, 'assignForm'])->name('assign');
        Route::post('/assign', [AssetController::class, 'assign'])->name('store-assignment');
        Route::post('/lookup', [AssetController::class, 'lookup'])->name('lookup');
        Route::get('/{asset}/edit', [AssetController::class, 'edit'])->name('edit');
        Route::put('/{asset}', [AssetController::class, 'update'])->name('update');
        Route::post('/{assignment}/return', [AssetController::class, 'return'])->name('return');
        Route::get('/{asset}', [AssetController::class, 'show'])->name('show');
    });

    // ============================================
    // 📋 LEAVE MANAGEMENT ROUTES (Admin/HR)
    // ============================================
    Route::prefix('leaves')->name('leaves.')->group(function () {
        // Pending Approvals (Hierarchical - MUST come BEFORE {leave} routes)
        Route::get('/pending-approvals', [LeaveApprovalController::class, 'pendingApprovals'])->name('pending-approvals');

        Route::get('/', [LeaveController::class, 'index'])->name('index');
        Route::get('/apply', [LeaveController::class, 'create'])->name('apply');
        Route::post('/', [LeaveController::class, 'store'])->name('store');
        Route::get('/{leave}', [LeaveController::class, 'show'])->name('show');

        // Manager Approval
        Route::post('/{leave}/manager-approve', [LeaveApprovalController::class, 'managerApprove'])->name('manager-approve');
        Route::post('/{leave}/manager-reject', [LeaveApprovalController::class, 'managerReject'])->name('manager-reject');

        // HR Approval
        Route::post('/{leave}/hr-approve', [LeaveApprovalController::class, 'hrApprove'])->name('hr-approve');
        Route::post('/{leave}/hr-reject', [LeaveApprovalController::class, 'hrReject'])->name('hr-reject');

        // Cancellation Approval (HR only)
        Route::post('/{leave}/approve-cancellation', [LeaveApprovalController::class, 'approveCancellation'])->name('approve-cancellation');
        Route::post('/{leave}/reject-cancellation', [LeaveApprovalController::class, 'rejectCancellation'])->name('reject-cancellation');
    });

    // ============================================
    // 📋 LEAVE TYPES MANAGEMENT (HR/Admin only)
    // ============================================
    Route::prefix('leave-types')->name('leave-types.')->group(function () {
        Route::get('/', [LeaveTypeController::class, 'index'])->name('index');
        Route::get('/create', [LeaveTypeController::class, 'create'])->name('create');
        Route::post('/', [LeaveTypeController::class, 'store'])->name('store');
        Route::get('/{leaveType}/edit', [LeaveTypeController::class, 'edit'])->name('edit');
        Route::put('/{leaveType}', [LeaveTypeController::class, 'update'])->name('update');
        Route::patch('/{leaveType}/toggle', [LeaveTypeController::class, 'toggleActive'])->name('toggle');
        Route::delete('/{leaveType}', [LeaveTypeController::class, 'destroy'])->name('destroy');
    });

    // ============================================
    // 💰 LEAVE BALANCE MANAGEMENT (HR/Admin only)
    // ============================================
    Route::prefix('leave-balances')->name('leave-balances.')->group(function () {
        Route::get('/', [LeaveBalanceController::class, 'index'])->name('index');
        Route::post('/reset', [LeaveBalanceController::class, 'reset'])->name('reset');
        Route::get('/preview', [LeaveBalanceController::class, 'preview'])->name('preview');
    });

    // ============================================
    // 🎓 ONBOARDING MANAGEMENT (HR/Admin only)
    // ============================================
    Route::prefix('onboarding')->name('onboarding.')->group(function () {

        // Invites Management
        Route::prefix('invites')->name('invites.')->group(function () {
            Route::get('/', [OnboardingInviteController::class, 'index'])->name('index');
            Route::get('/create', [OnboardingInviteController::class, 'create'])->name('create');
            Route::post('/', [OnboardingInviteController::class, 'store'])->name('store');
            Route::get('/{invite}', [OnboardingInviteController::class, 'show'])->name('show');
            Route::post('/{invite}/resend', [OnboardingInviteController::class, 'resend'])->name('resend');
            Route::post('/{invite}/extend', [OnboardingInviteController::class, 'extend'])->name('extend');
            Route::post('/{invite}/cancel', [OnboardingInviteController::class, 'cancel'])->name('cancel');
            Route::post('/{invite}/convert-to-user', [OnboardingInviteController::class, 'convertToUser'])->name('convert-to-user');
        });

        // Submissions Review
        Route::prefix('submissions')->name('submissions.')->group(function () {
            Route::get('/', [OnboardingSubmissionController::class, 'index'])->name('index');
            Route::get('/{submission}/review', [OnboardingSubmissionController::class, 'review'])->name('review');
            Route::post('/{submission}/approve', [OnboardingSubmissionController::class, 'approve'])->name('approve');
            Route::post('/{submission}/reject', [OnboardingSubmissionController::class, 'reject'])->name('reject');
            Route::post('/documents/{document}/approve', [OnboardingSubmissionController::class, 'approveDocument'])->name('approve-document');
            Route::post('/documents/{document}/reject', [OnboardingSubmissionController::class, 'rejectDocument'])->name('reject-document');
            Route::get('/documents/{document}/view', [OnboardingDocumentDownloadController::class, 'view'])->name('view-document');
            Route::get('/documents/{document}/download', [OnboardingDocumentDownloadController::class, 'download'])->name('download-document');
        });
    });

    // ============================================
    // 📁 PROJECT MANAGEMENT
    // ============================================
    Route::resource('projects', ProjectController::class);

    Route::prefix('tasks')->name('tasks.')->group(function () {
        Route::get('/', [TaskController::class, 'index'])->name('index');
        Route::get('/kanban', [TaskController::class, 'kanban'])->name('kanban');
        Route::get('/create', [TaskController::class, 'create'])->name('create');
        Route::post('/', [TaskController::class, 'store'])->name('store');
        Route::put('/{task}', [TaskController::class, 'update'])->name('update');
        Route::patch('/{task}/status', [TaskController::class, 'updateStatus'])->name('updateStatus');
        Route::delete('/{task}', [TaskController::class, 'destroy'])->name('destroy');
    });

    // ============================================
    // 🔐 PERMISSION MANAGEMENT
    // ============================================

    // User permission overrides management
    Route::prefix('users/{user}/permissions')->name('users.permissions.')->group(function () {
        Route::get('/', [App\Http\Controllers\UserPermissionController::class, 'edit'])->name('edit');
        Route::put('/', [App\Http\Controllers\UserPermissionController::class, 'update'])->name('update');
        Route::post('/reset', [App\Http\Controllers\UserPermissionController::class, 'reset'])->name('reset');
        Route::post('/{permission}/grant', [App\Http\Controllers\UserPermissionController::class, 'grant'])->name('grant');
        Route::post('/{permission}/revoke', [App\Http\Controllers\UserPermissionController::class, 'revoke'])->name('revoke');
        Route::delete('/{permission}', [App\Http\Controllers\UserPermissionController::class, 'removeOverride'])->name('remove-override');
    });

    // Role built-in permissions management
    Route::prefix('roles/{role}/permissions')->name('roles.permissions.')->group(function () {
        Route::get('/', [App\Http\Controllers\RolePermissionController::class, 'edit'])->name('edit');
        Route::put('/', [App\Http\Controllers\RolePermissionController::class, 'update'])->name('update');
        Route::get('/preview', [App\Http\Controllers\RolePermissionController::class, 'preview'])->name('preview');
    });

    // Permission reference list
    Route::get('/permissions', [App\Http\Controllers\PermissionController::class, 'index'])->name('permissions.index');
});

require __DIR__.'/auth.php';
