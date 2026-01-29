<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class UsersImport implements SkipsOnError, SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use SkipsErrors, SkipsFailures;

    private $rowCount = 0;

    public function model(array $row)
    {
        $this->rowCount++;

        // Debug: Log first 3 rows to see actual column names and data
        if ($this->rowCount <= 3) {
            Log::info("Excel Import - Row {$this->rowCount} Columns:", array_keys($row));
            Log::info("Excel Import - Row {$this->rowCount} Data:", $row);
        }

        // Helper function to get value with fallback keys (including numeric indices)
        $getValue = function ($possibleKeys) use ($row) {
            foreach ($possibleKeys as $key) {
                if (isset($row[$key]) && $row[$key] !== null && $row[$key] !== '') {
                    return $row[$key];
                }
            }

            return null;
        };

        // Get name fields
        $firstName = $getValue(['first_name', 'firstname']);
        $middleName = $getValue(['middle_name', 'middlename']);
        $lastName = $getValue(['last_name', 'lastname']);

        // Combine full name
        $fullName = trim(($firstName ?? '').' '.($middleName ?? '').' '.($lastName ?? ''));

        // Get work email - this is the primary login email
        $workEmail = $getValue(['work_email', 'workemail', 'email']);

        // Skip row if no work email (required field)
        if (! $workEmail || ! $firstName || ! $lastName) {
            Log::warning("Row {$this->rowCount}: Skipped - Missing required fields (first_name: {$firstName}, last_name: {$lastName}, work_email: {$workEmail})");

            return null;
        }

        // Get employee mobile numbers - First "Mobile Number" column
        $employeeMobile = $getValue(['mobile_number', 'mobilenumber', 'mobile', 'phone']);
        $employeePhones = $this->splitPhoneNumbers($employeeMobile);

        // Get emergency mobile - Second "Mobile Number" column (numeric index)
        $emergencyMobile = $getValue([
            'mobile_number_1',
            23, 24, 25, // Numeric indices from your log
            'emergency_mobile_number',
            'emergency_mobile',
        ]);
        $emergencyPhones = $this->splitPhoneNumbers($emergencyMobile);

        Log::info("Row {$this->rowCount}: Creating user - {$fullName} ({$workEmail})");

        return new User([
            'employee_id' => $getValue(['employee_no', 'employeeno', 'employee_number']),
            'first_name' => $firstName,
            'middle_name' => $middleName,
            'last_name' => $lastName,
            'name' => $fullName,
            'gender' => $this->mapGender($getValue(['gender'])),
            'civil_status' => $this->mapCivilStatus($getValue(['status', 'civil_status', 'civilstatus', 'marital_status'])),
            'birthday' => $this->parseDate($getValue(['date_of_birth', 'dateofbirth', 'birthday', 'dob'])),
            'address_line_1' => $getValue(['home_address', 'homeaddress', 'address']),

            // Employee phones - split from first Mobile Number column
            'phone_number' => $employeePhones[0] ?? null,
            'personal_mobile' => $employeePhones[1] ?? null,

            // Government IDs - NO splitting, just clean
            'sss_number' => $this->cleanSSS($getValue(['sss_number', 'sssnumber', 'sss'])),
            'tin_number' => $this->cleanTIN($getValue(['tin_number', 'tinnumber', 'tin'])),
            'hdmf_number' => $this->cleanHDMF($getValue([
                'hdmf_pagibig_number',
                'hdmfpagibignumber',
                'hdmf_number',
                'hdmf',
                'pagibig_number',
                'pagibig',
            ])),
            'philhealth_number' => $this->cleanPhilHealth($getValue(['philhealth_number', 'philhealthnumber', 'philhealth'])),
            'payroll_account' => $this->cleanPayrollAccount($getValue([
                'union_bank_payroll_account',
                'unionbankpayrollaccount',
                'union_bankpayroll_account',
                'payroll_account',
                'payrollaccount',
            ])),

            'position' => $getValue(['job_title', 'jobtitle', 'position']),
            'hire_date' => $this->parseDate($getValue(['hire_date', 'hiredate', 'date_hired'])),
            'employment_type' => $this->mapEmploymentType($getValue(['employment_type', 'employmenttype'])),
            'employment_status' => 'active',
            'work_email' => $workEmail,
            'email' => $workEmail,
            'personal_email' => $getValue(['personalemail', 'personal_email']),

            // Emergency Contact
            'emergency_contact_name' => $getValue([
                'contact_person_in_case_of_emergency',
                'contact_person_incase_of_emergency',
                'contactpersonincaseofemergency',
                'emergency_contact_name',
                'emergency_contact',
            ]),
            'emergency_contact_relationship' => $getValue(['relationship', 'emergency_relationship']),

            // Emergency phones - split from second Mobile Number column
            'emergency_contact_phone' => $emergencyPhones[0] ?? null,
            'emergency_contact_mobile' => $emergencyPhones[1] ?? null,

            'password' => Hash::make('password123'),
        ]);
    }

    /**
     * Split phone numbers by / separator and normalize to 10 digits
     * Input: "9123456789/9987654321" (both 10 digits in Excel)
     * Output: ["9123456789", "9987654321"]
     */
    private function splitPhoneNumbers($phoneString)
    {
        if (! $phoneString) {
            return [null, null];
        }

        $phoneString = trim((string) $phoneString);

        // Split by /
        $parts = explode('/', $phoneString);

        $phone1 = isset($parts[0]) ? $this->normalizePhoneNumber(trim($parts[0])) : null;
        $phone2 = isset($parts[1]) ? $this->normalizePhoneNumber(trim($parts[1])) : null;

        return [$phone1, $phone2];
    }

    /**
     * Normalize phone number to 10 digits
     */
    private function normalizePhoneNumber($phone)
    {
        if (! $phone) {
            return null;
        }

        $numbers = preg_replace('/[^0-9]/', '', $phone);
        if (! $numbers) {
            return null;
        }

        // If 11 digits starting with 0, remove leading 0
        if (strlen($numbers) === 11 && substr($numbers, 0, 1) === '0') {
            return substr($numbers, 1);
        }

        // If already 10 digits, return as-is
        if (strlen($numbers) === 10) {
            return $numbers;
        }

        // Pad or truncate to 10 digits
        return strlen($numbers) > 10
            ? substr($numbers, -10)
            : str_pad($numbers, 10, '0', STR_PAD_LEFT);
    }

    /**
     * Clean SSS - NO splitting by /
     */
    private function cleanSSS($sss)
    {
        if (! $sss) {
            return null;
        }

        $sss = trim((string) $sss);
        $numbers = preg_replace('/[^0-9]/', '', $sss);

        if (strlen($numbers) === 10) {
            return substr($numbers, 0, 2).'-'.substr($numbers, 2, 7).'-'.substr($numbers, 9, 1);
        }

        return $numbers ?: null;
    }

    /**
     * Clean TIN - NO splitting by /
     */
    private function cleanTIN($tin)
    {
        if (! $tin) {
            return null;
        }

        $tin = trim((string) $tin);
        $numbers = preg_replace('/[^0-9]/', '', $tin);

        if (strlen($numbers) >= 9) {
            $formatted = substr($numbers, 0, 3).'-'.substr($numbers, 3, 3).'-'.substr($numbers, 6, 3);
            if (strlen($numbers) > 9) {
                $formatted .= '-'.substr($numbers, 9);
            }

            return $formatted;
        }

        return $numbers ?: null;
    }

    /**
     * Clean HDMF - NO splitting by /
     */
    private function cleanHDMF($hdmf)
    {
        if (! $hdmf) {
            return null;
        }

        $hdmf = trim((string) $hdmf);
        $numbers = preg_replace('/[^0-9]/', '', $hdmf);

        return substr($numbers, 0, 12) ?: null;
    }

    /**
     * Clean PhilHealth - NO splitting by /
     */
    private function cleanPhilHealth($philhealth)
    {
        if (! $philhealth) {
            return null;
        }

        $philhealth = trim((string) $philhealth);
        $numbers = preg_replace('/[^0-9]/', '', $philhealth);

        if (strlen($numbers) === 11) {
            return substr($numbers, 0, 4).'-'.substr($numbers, 4, 5).'-'.substr($numbers, 9, 2);
        }

        return $numbers ?: null;
    }

    /**
     * Clean Payroll Account - NO splitting by /
     */
    private function cleanPayrollAccount($account)
    {
        if (! $account) {
            return null;
        }

        $account = trim((string) $account);
        $numbers = preg_replace('/[^0-9]/', '', $account);

        return substr($numbers, 0, 12) ?: null;
    }

    private function mapGender($gender)
    {
        if (! $gender) {
            return 'prefer_not_to_say';
        }

        $gender = strtolower(trim($gender));
        $map = [
            'male' => 'male',
            'm' => 'male',
            'female' => 'female',
            'f' => 'female',
        ];

        return $map[$gender] ?? 'prefer_not_to_say';
    }

    private function mapCivilStatus($status)
    {
        if (! $status) {
            return null;
        }

        $status = strtolower(trim($status));
        $map = [
            'single' => 'single',
            'married' => 'married',
            'widowed' => 'widowed',
            'widow' => 'widowed',
            'divorced' => 'divorced',
            'separated' => 'separated',
        ];

        return $map[$status] ?? null;
    }

    private function mapStatus($status)
    {
        if (! $status) {
            return 'active';
        }

        $status = strtolower(str_replace(' ', '_', trim($status)));
        $validStatuses = ['active', 'on_leave', 'terminated', 'resigned'];

        return in_array($status, $validStatuses) ? $status : 'active';
    }

    private function mapEmploymentType($type)
    {
        if (! $type) {
            return 'full_time';
        }

        $type = strtolower(str_replace([' ', '-'], '_', trim($type)));
        $validTypes = ['full_time', 'part_time', 'contract', 'intern'];

        return in_array($type, $validTypes) ? $type : 'full_time';
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
            Log::warning("Failed to parse date: {$date}");

            return null;
        }
    }

    public function rules(): array
    {
        return [
            'first_name' => 'required',
            'last_name' => 'required',
            'work_email' => 'required|email|unique:users,email',
        ];
    }
}
