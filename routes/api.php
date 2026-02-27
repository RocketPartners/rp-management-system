<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\WorkFromHomeController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/**
 * API Routes
 *
 * These routes are loaded by the RouteServiceProvider and all of them will
 * be assigned to the "api" middleware group.
 */

// ============================================
// 🏥 HEALTH CHECK ENDPOINTS (Public)
// ============================================

// Health check endpoint for Docker and monitoring
Route::get('/health', function () {
    try {
        // Check database connection
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        $dbStatus = 'disconnected';
    }

    $status = $dbStatus === 'connected' ? 'healthy' : 'unhealthy';
    $statusCode = $dbStatus === 'connected' ? 200 : 503;

    return response()->json([
        'status' => $status,
        'timestamp' => now()->toISOString(),
        'services' => [
            'database' => $dbStatus,
            'cache' => cache()->getStore() instanceof \Illuminate\Contracts\Cache\Store ? 'connected' : 'disconnected',
        ],
        'application' => [
            'name' => config('app.name'),
            'environment' => config('app.env'),
            'debug' => config('app.debug'),
        ],
    ], $statusCode);
})->name('api.health');

// API version endpoint
Route::get('/version', function () {
    return response()->json([
        'version' => config('app.version', '1.0.0'),
        'laravel' => app()->version(),
        'php' => PHP_VERSION,
    ]);
})->name('api.version');

// ============================================
// 🔒 AUTHENTICATED API ROUTES
// ============================================

Route::middleware(['auth:sanctum'])->group(function () {

    // ============================================
    // 📅 CALENDAR API ROUTES
    // ============================================
    Route::prefix('calendar')->name('api.calendar.')->group(function () {
        // Get calendar events
        Route::get('/events', [CalendarController::class, 'events'])->name('events');

        // Get calendar statistics
        Route::get('/statistics', [CalendarController::class, 'statistics'])->name('statistics');

        // Get users on leave for a specific date
        Route::get('/users-on-leave', [CalendarController::class, 'usersOnLeave'])->name('users-on-leave');

        // Get event types (with optional counts)
        Route::get('/event-types', [CalendarController::class, 'eventTypes'])->name('event-types');
    });

    // ============================================
    // 🏠 WORK FROM HOME API ROUTES
    // ============================================
    Route::prefix('wfh')->name('api.wfh.')->group(function () {
        // Schedule WFH
        Route::post('/', [WorkFromHomeController::class, 'store'])->name('store');

        // Get WFH schedules for current user
        Route::get('/', [WorkFromHomeController::class, 'index'])->name('index');

        // Get weekly WFH usage
        Route::get('/weekly-usage', [WorkFromHomeController::class, 'weeklyUsage'])->name('weekly-usage');

        // Cancel WFH
        Route::delete('/{wfh}', [WorkFromHomeController::class, 'destroy'])->name('destroy');

        // WFH Settings
        Route::get('/settings', [WorkFromHomeController::class, 'getSettings'])->name('settings');
        Route::put('/settings', [WorkFromHomeController::class, 'updateSettings'])->name('settings.update');
    });
});
