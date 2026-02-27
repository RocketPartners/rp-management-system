<?php

namespace App\Console\Commands\Test;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class ResetTestDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:reset-database';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset the test database by running migrations and seeders';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Resetting test database...');

        // Run migrations fresh
        Artisan::call('migrate:fresh', [
            '--env' => 'testing',
            '--force' => true,
        ]);

        $this->info('Migrations completed.');

        // Seed the database
        Artisan::call('db:seed', [
            '--env' => 'testing',
            '--force' => true,
        ]);

        $this->info('Database seeded successfully.');
        $this->line(json_encode(['success' => true]));

        return 0;
    }
}
