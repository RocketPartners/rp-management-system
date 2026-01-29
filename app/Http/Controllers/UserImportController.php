<?php

namespace App\Http\Controllers;

use App\Imports\UsersImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class UserImportController extends Controller
{
    public function show()
    {
        return Inertia::render('Admin/Users/Import');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240', // 10MB max
        ]);

        try {
            // First, let's see what the headers and data actually are
            $data = Excel::toArray(new UsersImport, $request->file('file'));

            // Get headers and first few rows
            if (isset($data[0])) {
                $headers = isset($data[0][0]) ? array_keys($data[0][0]) : [];
                $firstRows = array_slice($data[0], 0, 3); // First 3 rows

                Log::info('Excel Import Debug:', [
                    'detected_headers' => $headers,
                    'total_rows' => count($data[0]),
                    'first_rows_sample' => $firstRows,
                ]);
            }

            // Now actually import
            $import = new UsersImport;
            Excel::import($import, $request->file('file'));

            // Check for failures
            $failures = $import->failures();
            if (count($failures) > 0) {
                $errorMessages = [];
                foreach ($failures as $failure) {
                    $errorMessages[] = "Row {$failure->row()}: ".implode(', ', $failure->errors());
                }

                Log::error('Import had failures:', $errorMessages);

                return back()->with('error', 'Import completed with errors: '.implode(' | ', $errorMessages));
            }

            // Check for errors
            $errors = $import->errors();
            if (count($errors) > 0) {
                Log::error('Import had errors:', $errors);

                return back()->with('error', 'Import failed with errors. Check logs for details.');
            }

            return redirect()->route('users.index')->with('success', 'Users imported successfully!');

        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();

            $errors = [];
            foreach ($failures as $failure) {
                $errors[] = "Row {$failure->row()}: ".implode(', ', $failure->errors());
            }

            Log::error('Import Validation Failed:', $errors);

            return back()->with('error', 'Validation failed: '.implode(' | ', $errors));

        } catch (\Exception $e) {
            Log::error('Import Exception:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Import failed: '.$e->getMessage());
        }
    }
}
