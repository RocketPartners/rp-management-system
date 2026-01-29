<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $allowedDomains = ['rocketpartners.ph', 'rocketpartners.io'];

        $allowedDomains = ['rocketpartners.ph', 'rocketpartners.io'];

        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:'.User::class,
                function ($attribute, $value, $fail) use ($allowedDomains) {
                    // Extract domain
                    $emailParts = explode('@', strtolower($value));

                    // Must have exactly 2 parts
                    if (count($emailParts) !== 2) {
                        $fail('Invalid email format.');

                        return;
                    }

                    $domain = $emailParts[1];

                    // Check exact domain match
                    if (! in_array($domain, $allowedDomains)) {
                        $fail('Only @rocketpartners.ph or @rocketpartners.io email addresses are allowed.');
                    }
                },
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Build full name from parts
        $nameParts = [$request->first_name];
        if ($request->middle_name) {
            $nameParts[] = $request->middle_name;
        }
        $nameParts[] = $request->last_name;

        $fullName = implode(' ', $nameParts);

        // Add suffix if provided and not "none"
        if ($request->suffix && $request->suffix !== 'none') {
            $fullName .= ' '.$request->suffix;
        }

        $user = User::create([
            'name' => $fullName,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'suffix' => $request->suffix === 'none' ? null : $request->suffix,
            'email' => $request->email,
            'work_email' => $request->email,
            'work_email' => $request->email,
            'password' => Hash::make($request->password),
            'employment_status' => 'active',
            'account_status' => 'pending', // ✅ Start as pending
            'email_verified_at' => now(), // ✅ Auto-verify email for development
        ]);

        event(new Registered($user)); // This sends verification email
        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
