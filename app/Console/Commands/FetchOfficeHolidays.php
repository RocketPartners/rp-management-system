<?php

namespace App\Console\Commands;

use App\Models\Holiday;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class FetchOfficeHolidays extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'holidays:fetch {year?} {--countries=PH,US,ES}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch holidays from Office Holidays ICS calendars (officeholidays.com)';

    /**
     * Country code mapping for ICS URLs
     */
    protected array $countryMapping = [
        'PH' => 'philippines',
        'US' => 'usa',
        'ES' => 'spain',
    ];

    /**
     * Country name mapping for display
     */
    protected array $countryNames = [
        'PH' => 'Philippines',
        'US' => 'United States',
        'ES' => 'Spain',
    ];

    /**
     * US State names for parsing
     */
    protected array $usStates = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
        'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
        'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
        'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
        'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
        'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
        'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
        'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
        'West Virginia', 'Wisconsin', 'Wyoming',
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $year = $this->argument('year') ?? now()->year;
        $countries = explode(',', $this->option('countries'));

        $this->info("Fetching holidays from Office Holidays ICS calendars for year {$year}...");

        $totalFetched = 0;
        $totalStored = 0;

        foreach ($countries as $countryCode) {
            $countryCode = strtoupper(trim($countryCode));

            if (!isset($this->countryMapping[$countryCode])) {
                $this->warn("Unknown country code: {$countryCode}. Skipping...");
                continue;
            }

            $this->info("\nProcessing {$this->countryNames[$countryCode]} ({$countryCode})...");

            try {
                $holidays = $this->fetchCountryHolidays($countryCode, $year);

                $totalFetched += count($holidays);

                // Store holidays in database
                foreach ($holidays as $holiday) {
                    $stored = $this->storeHoliday($holiday);
                    if ($stored) {
                        $totalStored++;
                    }
                }

                $this->info("  → Found ".count($holidays)." holidays for {$this->countryNames[$countryCode]}");

            } catch (\Exception $e) {
                $this->error("  ✗ Error processing {$countryCode}: ".$e->getMessage());
                continue;
            }
        }

        $this->newLine();
        $this->info("✅ Successfully processed {$totalFetched} holidays");
        $this->info("✅ Stored {$totalStored} holidays in database");

        return Command::SUCCESS;
    }

    /**
     * Fetch holidays for a country from ICS calendar
     */
    protected function fetchCountryHolidays(string $countryCode, int $year): array
    {
        $countrySlug = $this->countryMapping[$countryCode];
        $url = "https://www.officeholidays.com/ics-all/{$countrySlug}";

        $this->info("  Fetching from: {$url}");

        $response = Http::timeout(30)->get($url);

        if (!$response->successful()) {
            throw new \Exception("Failed to fetch ICS calendar: ".$response->status());
        }

        return $this->parseICS($response->body(), $countryCode, $year);
    }

    /**
     * Parse ICS calendar format
     */
    protected function parseICS(string $icsContent, string $countryCode, int $year): array
    {
        $holidays = [];
        $lines = explode("\n", $icsContent);
        $currentEvent = null;

        foreach ($lines as $line) {
            $line = trim($line);

            if ($line === 'BEGIN:VEVENT') {
                $currentEvent = [];
            } elseif ($line === 'END:VEVENT' && $currentEvent !== null) {
                // Process the complete event
                if (isset($currentEvent['DTSTART']) && isset($currentEvent['SUMMARY'])) {
                    try {
                        $date = $this->parseICSDate($currentEvent['DTSTART']);

                        // Only include holidays for the requested year
                        if ($date->year == $year) {
                            $cleanName = $this->cleanSummary($currentEvent['SUMMARY'], $this->countryNames[$countryCode]);
                            $description = $currentEvent['DESCRIPTION'] ?? '';

                            // Extract state/region info for US holidays
                            $stateInfo = $countryCode === 'US'
                                ? $this->extractStateInfo($cleanName, $description)
                                : ['state' => null, 'region' => null];

                            // Extract holiday type from description/name
                            $holidayType = $this->extractHolidayType($cleanName, $description);

                            $holidays[] = [
                                'name' => $cleanName,
                                'date' => $date,
                                'country_code' => $countryCode,
                                'country_name' => $this->countryNames[$countryCode],
                                'state' => $stateInfo['state'],
                                'region' => $stateInfo['region'],
                                'type' => $holidayType,
                                'description' => $description,
                            ];
                        }
                    } catch (\Exception $e) {
                        // Skip invalid dates
                        continue;
                    }
                }
                $currentEvent = null;
            } elseif ($currentEvent !== null && strpos($line, ':') !== false) {
                [$key, $value] = explode(':', $line, 2);
                // Remove parameters like ;VALUE=DATE
                $key = explode(';', $key)[0];
                $currentEvent[$key] = $value;
            }
        }

        return $holidays;
    }

    /**
     * Parse ICS date format (YYYYMMDD or YYYYMMDDTHHMMSSZ)
     */
    protected function parseICSDate(string $dateStr): Carbon
    {
        // Remove any timezone info and parse just the date
        $dateStr = preg_replace('/[TZ].*$/', '', $dateStr);

        return Carbon::createFromFormat('Ymd', $dateStr);
    }

    /**
     * Clean summary by removing country name prefix
     */
    protected function cleanSummary(string $summary, string $countryName): string
    {
        // Remove patterns like "Philippines: Holiday Name" or "Holiday Name (Philippines)"
        $summary = preg_replace('/^' . preg_quote($countryName, '/') . ':\s*/', '', $summary);
        $summary = preg_replace('/\s*\(' . preg_quote($countryName, '/') . '\)$/', '', $summary);

        return trim($summary);
    }

    /**
     * Extract state and region information from US holidays
     */
    protected function extractStateInfo(string $name, string $description): array
    {
        $state = null;
        $region = null;

        // Check if the holiday name contains a state name
        foreach ($this->usStates as $stateName) {
            // Check in holiday name (e.g., "Texas Independence Day", "Georgia Day")
            if (stripos($name, $stateName) !== false) {
                $state = $stateName;
                break;
            }

            // Check in description
            if (stripos($description, $stateName) !== false) {
                // Be more strict with description to avoid false positives
                if (preg_match('/\b' . preg_quote($stateName, '/') . '\b/i', $description)) {
                    $state = $stateName;
                    break;
                }
            }
        }

        // Extract region/city info from description (e.g., "Hawaii. Oahu only")
        if (preg_match('/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+only/i', $description, $matches)) {
            $region = $matches[1];
        }

        return [
            'state' => $state,
            'region' => $region,
        ];
    }

    /**
     * Extract holiday type from name or description
     * Types: federal, government, state, regional, observance
     */
    protected function extractHolidayType(string $name, string $description): string
    {
        $combined = strtolower($name . ' ' . $description);

        // Check for explicit type mentions in description
        if (stripos($combined, 'federal holiday') !== false) {
            return 'federal';
        }

        if (stripos($combined, 'government holiday') !== false) {
            return 'government';
        }

        if (stripos($combined, 'state holiday') !== false) {
            return 'state';
        }

        if (stripos($combined, 'regional holiday') !== false) {
            return 'regional';
        }

        if (stripos($combined, 'not a public holiday') !== false ||
            stripos($combined, 'observance') !== false) {
            return 'observance';
        }

        // Default to public if no specific type is found
        return 'public';
    }

    /**
     * Store holiday in database
     */
    protected function storeHoliday(array $data): bool
    {
        try {
            Holiday::updateOrCreate(
                [
                    'date' => $data['date']->format('Y-m-d'),
                    'country_code' => $data['country_code'],
                    'name' => $data['name'],
                ],
                [
                    'country_name' => $data['country_name'],
                    'state' => $data['state'] ?? null,
                    'region' => $data['region'] ?? null,
                    'type' => $data['type'],
                    'description' => $data['description'],
                    'is_active' => true,
                ]
            );

            return true;
        } catch (\Exception $e) {
            $this->warn("  ⚠ Failed to store holiday: {$data['name']} - ".$e->getMessage());
            return false;
        }
    }
}
