<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Onboarding Document Types
    |--------------------------------------------------------------------------
    |
    | Define all document types that can be uploaded during onboarding.
    | Each type includes validation rules, labels, and requirements.
    |
    */

    'document_types' => [
        'resume' => [
            'label' => 'Resume / CV',
            'required' => true,
            'description' => 'Your updated resume or curriculum vitae',
            'accepted_formats' => ['pdf', 'doc', 'docx'],
            'max_size' => 10240, // 10MB
            'multiple_allowed' => true,
            'icon' => 'FileText',
        ],
        'government_id' => [
            'label' => 'Government ID',
            'required' => true,
            'description' => 'Any valid government-issued ID (Driver\'s License, Passport, etc.)',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 5120, // 5MB
            'multiple_allowed' => true,
            'icon' => 'CreditCard',
        ],
        'nbi_clearance' => [
            'label' => 'NBI Clearance',
            'required' => true,
            'description' => 'Valid NBI clearance certificate (must not be expired)',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 5120,
            'multiple_allowed' => false,
            'icon' => 'Shield',
        ],
        'pnp_clearance' => [
            'label' => 'PNP Clearance',
            'required' => true,
            'description' => 'Valid PNP/Police clearance certificate',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 5120,
            'multiple_allowed' => false,
            'icon' => 'ShieldCheck',
        ],
        'medical_certificate' => [
            'label' => 'Medical Certificate',
            'required' => true,
            'description' => 'Recent medical examination results (within last 6 months)',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 5120,
            'multiple_allowed' => false,
            'icon' => 'Heart',
        ],
        'sss_id' => [
            'label' => 'SSS ID',
            'required' => false,
            'description' => 'SSS UMID or E-card',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 5120,
            'multiple_allowed' => false,
            'icon' => 'CreditCard',
        ],
        'tin_id' => [
            'label' => 'TIN ID',
            'required' => false,
            'description' => 'TIN card or BIR certificate of registration',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 5120,
            'multiple_allowed' => false,
            'icon' => 'CreditCard',
        ],
        'philhealth_id' => [
            'label' => 'PhilHealth ID',
            'required' => false,
            'description' => 'PhilHealth member data record (MDR) or ID card',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 5120,
            'multiple_allowed' => false,
            'icon' => 'CreditCard',
        ],
        'hdmf_pagibig_id' => [
            'label' => 'HDMF / Pag-IBIG ID',
            'required' => false,
            'description' => 'Pag-IBIG member data form (MDF) or loyalty card',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 5120,
            'multiple_allowed' => false,
            'icon' => 'CreditCard',
        ],
        'diploma' => [
            'label' => 'Diploma',
            'required' => false,
            'description' => 'Highest educational attainment diploma or certificate',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 10240,
            'multiple_allowed' => true,
            'icon' => 'GraduationCap',
        ],
        'transcript' => [
            'label' => 'Transcript of Records',
            'required' => false,
            'description' => 'Official transcript of records (TOR)',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 10240,
            'multiple_allowed' => false,
            'icon' => 'FileText',
        ],
        'birth_certificate' => [
            'label' => 'Birth Certificate',
            'required' => false,
            'description' => 'PSA-authenticated birth certificate',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 5120,
            'multiple_allowed' => false,
            'icon' => 'Baby',
        ],
        'previous_employment_coe' => [
            'label' => 'Certificate of Employment',
            'required' => false,
            'description' => 'Certificate of Employment from previous company (if applicable)',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png'],
            'max_size' => 5120,
            'multiple_allowed' => true,
            'icon' => 'Briefcase',
        ],
        'other' => [
            'label' => 'Other Documents',
            'required' => false,
            'description' => 'Any other relevant documents',
            'accepted_formats' => ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
            'max_size' => 10240,
            'multiple_allowed' => true,
            'icon' => 'Paperclip',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Invite Settings
    |--------------------------------------------------------------------------
    */

    'invite' => [
        'expiration_days' => 30,   // Days from invite sent until expiration
        'max_extensions' => 2,    // Maximum automatic extensions allowed
        'extension_days' => 7,    // Days added per extension
        // Total possible days: 30 + (2 * 7) = 44 days maximum
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    */

    'notifications' => [
        'notify_hr_on_upload' => true,
        'notify_hr_on_submit' => true,
        'notify_candidate_on_approval' => true,
        'notify_candidate_on_rejection' => true,
        'hr_emails' => [
            'hr@rocketpartners.com',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Completion Weights
    |--------------------------------------------------------------------------
    |
    | Define how much each section contributes to overall completion percentage
    |
    */

    'completion_weights' => [
        'personal_info' => 20,
        'government_ids' => 20,
        'emergency_contact' => 20,
        'documents' => 40,
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Settings
    |--------------------------------------------------------------------------
    */

    'default_password' => 'password',
    'force_password_change' => true,

    /*
    |--------------------------------------------------------------------------
    | Work Email Settings
    |--------------------------------------------------------------------------
    */

    'work_email' => [
        'domain' => 'rocketpartners.io',
        'format' => '{first}.{last}',
    ],
];
