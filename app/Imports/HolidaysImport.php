<?php

namespace App\Imports;

use App\Models\Holiday;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class HolidaysImport implements SkipsOnError, SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use SkipsErrors, SkipsFailures;

    private int $rowCount = 0;
    private int $created = 0;
    private int $skipped = 0;

    public function model(array $row)
    {
        $this->rowCount++;

        $getValue = function (array $possibleKeys) use ($row) {
            foreach ($possibleKeys as $key) {
                if (isset($row[$key]) && $row[$key] !== null && $row[$key] !== '') {
                    return $row[$key];
                }
            }
            return null;
        };

        $name = $getValue(['name', 'holiday_name', 'holiday', 'title']);
        $date = $this->parseDate($getValue(['date', 'holiday_date']));
        $countryCode = strtoupper(trim($getValue(['country_code', 'country', 'code']) ?? 'PH'));
        $type = strtolower(trim($getValue(['type', 'holiday_type']) ?? 'public'));
        $description = $getValue(['description', 'notes']);
        $state = $getValue(['state', 'us_state', 'region']);

        if (! $name || ! $date) {
            $this->skipped++;
            Log::warning("Holiday Import - Row {$this->rowCount}: Skipped - Missing name or date");
            return null;
        }

        // Skip duplicate (same name + date + country)
        $exists = Holiday::where('name', $name)
            ->where('date', $date)
            ->where('country_code', $countryCode)
            ->exists();

        if ($exists) {
            $this->skipped++;
            return null;
        }

        $this->created++;

        return new Holiday([
            'name' => $name,
            'date' => $date,
            'country_code' => $countryCode,
            'type' => $type,
            'description' => $description,
            'state' => $state,
            'is_active' => true,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required',
            'date' => 'required',
        ];
    }

    public function getCreatedCount(): int
    {
        return $this->created;
    }

    public function getSkippedCount(): int
    {
        return $this->skipped;
    }

    private function parseDate($date)
    {
        if (! $date) {
            return null;
        }

        try {
            if (is_numeric($date)) {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($date)->format('Y-m-d');
            }
            return \Carbon\Carbon::parse($date)->format('Y-m-d');
        } catch (\Exception $e) {
            Log::warning("Holiday Import - Failed to parse date: {$date}");
            return null;
        }
    }
}
