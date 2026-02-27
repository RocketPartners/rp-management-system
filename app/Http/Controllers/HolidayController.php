<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HolidayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $country = $request->input('country', 'PH');
        $year = $request->input('year', now()->year);

        $holidays = Holiday::query()
            ->when($country, fn($q) => $q->where('country_code', $country))
            ->when($year, fn($q) => $q->whereYear('date', $year))
            ->orderBy('date')
            ->paginate(50);

        $availableYears = Holiday::selectRaw('DISTINCT YEAR(date) as year')
            ->orderBy('year', 'desc')
            ->pluck('year');

        $countries = [
            ['code' => 'PH', 'name' => 'Philippines'],
            ['code' => 'US', 'name' => 'United States'],
            ['code' => 'ES', 'name' => 'Spain'],
        ];

        return Inertia::render('Admin/Holidays/Index', [
            'holidays' => $holidays,
            'filters' => [
                'country' => $country,
                'year' => $year,
            ],
            'availableYears' => $availableYears,
            'countries' => $countries,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'country_code' => 'required|string|size:2',
            'type' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        Holiday::create($validated);

        return redirect()->back()->with('success', 'Holiday created successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Holiday $holiday)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'country_code' => 'required|string|size:2',
            'type' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $holiday->update($validated);

        return redirect()->back()->with('success', 'Holiday updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Holiday $holiday)
    {
        $holiday->delete();

        return redirect()->back()->with('success', 'Holiday deleted successfully!');
    }

    /**
     * Fetch holidays from API
     */
    public function fetchFromAPI(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
            'country_code' => 'required|string|size:2',
        ]);

        try {
            \Artisan::call('holidays:fetch', [
                'year' => $validated['year'],
                '--countries' => $validated['country_code'],
            ]);

            $output = \Artisan::output();

            return redirect()->back()->with('success', 'Holidays fetched successfully! '.$output);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to fetch holidays: '.$e->getMessage());
        }
    }

    /**
     * Toggle holiday active status
     */
    public function toggleActive(Holiday $holiday)
    {
        $holiday->update(['is_active' => !$holiday->is_active]);

        return redirect()->back()->with('success', 'Holiday status updated!');
    }
}
