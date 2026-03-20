<?php

namespace App\Console\Commands;

use App\Models\DocumentAccessLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AuditTrailStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'audit:status
                            {--detailed : Show detailed statistics}
                            {--recent=10 : Number of recent logs to display}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Display audit trail status and statistics';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('');
        $this->info('═══════════════════════════════════════════════════════════════');
        $this->info('           AUDIT TRAIL STATUS');
        $this->info('═══════════════════════════════════════════════════════════════');
        $this->info('');

        // Check table exists
        if (! Schema::hasTable('document_access_logs')) {
            $this->error('✗ Table "document_access_logs" does not exist!');
            $this->warn('Run: php artisan migrate');

            return Command::FAILURE;
        }

        $this->info('✓ Table "document_access_logs" exists');

        // Total logs
        $total = DocumentAccessLog::count();
        $this->info("✓ Total audit logs: {$total}");

        if ($total === 0) {
            $this->warn('');
            $this->warn('No audit logs found yet.');
            $this->warn('Upload, view, or download a document to create logs.');

            return Command::SUCCESS;
        }

        // Date range
        $first = DocumentAccessLog::orderBy('accessed_at', 'asc')->first();
        $last = DocumentAccessLog::orderBy('accessed_at', 'desc')->first();

        $this->info('✓ Date range: '.$first->accessed_at->format('Y-m-d').' to '.$last->accessed_at->format('Y-m-d'));

        $this->newLine();

        // Action statistics
        $this->info('─────────────────────────────────────────────────────────────────');
        $this->info('  ACTION STATISTICS');
        $this->info('─────────────────────────────────────────────────────────────────');

        $actions = DocumentAccessLog::select('action', DB::raw('count(*) as count'))
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->get();

        $this->table(
            ['Action', 'Count', 'Percentage'],
            $actions->map(function ($action) use ($total) {
                return [
                    $action->action,
                    $action->count,
                    number_format(($action->count / $total) * 100, 2).'%',
                ];
            })
        );

        if ($this->option('detailed')) {
            $this->newLine();
            $this->info('─────────────────────────────────────────────────────────────────');
            $this->info('  TOP USERS BY ACTIVITY');
            $this->info('─────────────────────────────────────────────────────────────────');

            $topUsers = DocumentAccessLog::select('user_id', DB::raw('count(*) as count'))
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->with('user')
                ->limit(10)
                ->get();

            $this->table(
                ['User', 'Actions'],
                $topUsers->map(function ($log) {
                    return [
                        $log->user?->name ?? 'Unknown',
                        $log->count,
                    ];
                })
            );

            $this->newLine();
            $this->info('─────────────────────────────────────────────────────────────────');
            $this->info('  ACTIVITY BY DAY (Last 7 Days)');
            $this->info('─────────────────────────────────────────────────────────────────');

            $dailyStats = DocumentAccessLog::select(
                DB::raw('DATE(accessed_at) as date'),
                DB::raw('count(*) as count')
            )
                ->where('accessed_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->get();

            if ($dailyStats->count() > 0) {
                $this->table(
                    ['Date', 'Count'],
                    $dailyStats->map(function ($stat) {
                        return [$stat->date, $stat->count];
                    })
                );
            } else {
                $this->warn('No activity in the last 7 days');
            }
        }

        // Recent logs
        $recentCount = $this->option('recent');
        $this->newLine();
        $this->info('─────────────────────────────────────────────────────────────────');
        $this->info("  RECENT LOGS (Last {$recentCount})");
        $this->info('─────────────────────────────────────────────────────────────────');

        $recent = DocumentAccessLog::with('user', 'document')
            ->orderBy('accessed_at', 'desc')
            ->limit($recentCount)
            ->get();

        $this->table(
            ['Timestamp', 'Action', 'User', 'Document', 'IP'],
            $recent->map(function ($log) {
                return [
                    $log->accessed_at->format('Y-m-d H:i:s'),
                    $log->action,
                    $log->user?->name ?? 'Unknown',
                    $log->document?->filename ?? 'Deleted',
                    $log->ip_address,
                ];
            })
        );

        $this->newLine();
        $this->info('═══════════════════════════════════════════════════════════════');
        $this->info('✅ Audit trail is operational');
        $this->info('═══════════════════════════════════════════════════════════════');
        $this->newLine();

        return Command::SUCCESS;
    }
}
