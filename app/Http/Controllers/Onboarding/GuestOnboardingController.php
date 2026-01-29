<?php

namespace App\Http\Controllers\Onboarding;

use App\Http\Controllers\Controller;
use App\Http\Resources\OnboardingChecklistResource;
use App\Services\Onboarding\OnboardingDocumentService;
use App\Services\Onboarding\OnboardingSubmissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GuestOnboardingController extends Controller
{
    protected $submissionService;

    protected $documentService;

    public function __construct(
        OnboardingSubmissionService $submissionService,
        OnboardingDocumentService $documentService
    ) {
        $this->submissionService = $submissionService;
        $this->documentService = $documentService;
    }

    /**
     * Display the guest onboarding form
     */
    public function show(Request $request, $token)
    {
        // Invite is already validated and loaded by middleware
        $invite = $request->get('invite');

        if ($invite->status === 'approved') {
            return Inertia::render('Guest/Onboarding/Completed', [
                'invite' => $invite,
            ]);
        }

        $submission = $invite->submission;

        // Transform documents for frontend
        if ($submission && $submission->documents) {
            $this->transformDocumentsForFrontend($submission);
        }

        return Inertia::render('Guest/Onboarding/Form', [
            'invite' => $invite,
            'submission' => $submission,
            'requiredDocuments' => $this->documentService->getRequiredDocumentTypes(),
            'canEdit' => $submission ? $submission->canBeEdited() : true,
            'isLocked' => $submission ? $submission->isLocked() : false,
            'revisionNotes' => $submission->revision_notes ?? null,
        ]);
    }

    /**
     * Display requirements checklist
     */
    public function checklist(Request $request, $token)
    {
        $invite = $request->get('invite');

        if ($invite->submission && $invite->submission->documents) {
            $this->transformDocumentsForFrontend($invite->submission);
        }

        $checklist = new OnboardingChecklistResource($invite->submission);

        return Inertia::render('Guest/Onboarding/Checklist', [
            'invite' => $invite,
            'submission' => $invite->submission,
            'checklist' => $checklist,
            'canEdit' => $invite->submission ? $invite->submission->canBeEdited() : true,
        ]);
    }

    /**
     * Update personal information
     */
    public function updatePersonalInfo(Request $request, $token)
    {
        $invite = $request->get('invite');
        $this->validateSubmissionEditable($invite->submission);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'birthday' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other,prefer_not_to_say',
            'civil_status' => 'nullable|in:single,married,widowed,divorced,separated',
            'phone_number' => 'required|string|max:20',
            'mobile_number' => 'nullable|string|max:20',
            'address_line_1' => 'required|string',
            'address_line_2' => 'nullable|string',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
        ]);

        $this->submissionService->updatePersonalInfo($invite->submission, $validated);

        return back()->with('success', 'Personal information saved!');
    }

    /**
     * Update government IDs
     */
    public function updateGovernmentIds(Request $request, $token)
    {
        $invite = $request->get('invite');
        $this->validateSubmissionEditable($invite->submission);

        $validated = $request->validate([
            'sss_number' => 'nullable|string|max:15',
            'tin_number' => 'nullable|string|max:20',
            'hdmf_number' => 'nullable|string|max:12',
            'philhealth_number' => 'nullable|string|max:15',
            'payroll_account' => 'nullable|string|max:12',
        ]);

        $this->submissionService->updateGovernmentIds($invite->submission, $validated);

        return back()->with('success', 'Government IDs saved!');
    }

    /**
     * Update emergency contact
     */
    public function updateEmergencyContact(Request $request, $token)
    {
        $invite = $request->get('invite');
        $this->validateSubmissionEditable($invite->submission);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'relationship' => 'required|string|max:100',
        ]);

        $this->submissionService->updateEmergencyContact($invite->submission, $validated);

        return back()->with('success', 'Emergency contact saved!');
    }

    /**
     * Upload document
     */
    public function uploadDocument(Request $request, $token)
    {
        $invite = $request->get('invite');
        $this->validateSubmissionEditable($invite->submission);

        $validated = $request->validate([
            'document_type' => 'required|string|in:'.implode(',', array_keys(config('onboarding.document_types'))),
            'file' => 'required|file',
            'description' => 'nullable|string|max:500',
        ]);

        // Get config for this document type
        $docConfig = config("onboarding.document_types.{$validated['document_type']}");
        $file = $request->file('file');

        // Validate file type
        $extension = $file->getClientOriginalExtension();
        if (! in_array($extension, $docConfig['accepted_formats'])) {
            return back()->withErrors([
                'file' => 'This document type only accepts: '.implode(', ', $docConfig['accepted_formats']),
            ]);
        }

        // Validate file size (config uses 'max_size' in KB)
        $maxSizeBytes = $docConfig['max_size'] * 1024;
        if ($file->getSize() > $maxSizeBytes) {
            return back()->withErrors([
                'file' => "File too large. Maximum size: {$docConfig['max_size']}KB",
            ]);
        }

        try {
            $document = $this->documentService->uploadDocument(
                $invite->submission,
                $file,
                $validated['document_type'],
                $validated['description'] ?? null
            );

            return back()->with('success', 'Document uploaded successfully!');

        } catch (\Exception $e) {
            return back()->with('error', 'Upload failed: '.$e->getMessage());
        }
    }

    /**
     * Replace an existing document
     */
    public function replaceDocument(Request $request, $token, $documentId)
    {
        $invite = $request->get('invite');
        $document = $invite->submission->documents()->findOrFail($documentId);

        // Check if document can be replaced
        if (! $invite->submission->canBeEdited() || $document->isApproved()) {
            return back()->with('error', 'This document cannot be replaced.');
        }

        // Get config for validation
        $docConfig = config("onboarding.document_types.{$document->document_type}");

        $validated = $request->validate([
            'file' => 'required|file|mimes:'.implode(',', $docConfig['accepted_formats']).'|max:'.$docConfig['max_size'],
        ]);

        try {
            $this->documentService->replaceDocument(
                $document,
                $request->file('file')
            );

            return back()->with('success', 'Document replaced successfully!');

        } catch (\Exception $e) {
            return back()->with('error', 'Replace failed: '.$e->getMessage());
        }
    }

    /**
     * Delete uploaded document
     */
    public function deleteDocument(Request $request, $token, $documentId)
    {
        $invite = $request->get('invite');
        $this->validateSubmissionEditable($invite->submission);

        $document = $invite->submission->documents()->findOrFail($documentId);

        // Don't allow deleting approved documents
        if ($document->isApproved()) {
            return back()->with('error', 'Cannot delete approved documents.');
        }

        try {
            $this->documentService->deleteDocument($document);

            return back()->with('success', 'Document deleted successfully!');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Submit final onboarding form
     */
    public function submit(Request $request, $token)
    {
        $invite = $request->get('invite');
        $this->validateSubmissionEditable($invite->submission);

        try {
            $this->submissionService->submitOnboarding($invite->submission);

            return redirect()->route('guest.onboarding.checklist', $token)
                ->with('success', 'Onboarding submitted successfully! HR will review your submission.');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    // ============================================
    // PRIVATE HELPER METHODS
    // ============================================

    /**
     * Validate that submission can be edited
     *
     * @param  \App\Models\OnboardingSubmission  $submission
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    private function validateSubmissionEditable($submission): void
    {
        if (! $submission->canBeEdited()) {
            abort(403, 'This submission is locked. Contact HR if you need to make changes.');
        }
    }

    /**
     * Transform documents for frontend display
     *
     * @param  \App\Models\OnboardingSubmission  $submission
     */
    private function transformDocumentsForFrontend($submission): void
    {
        $submission->documents->each(function ($doc) use ($submission) {
            $doc->document_type_label = $doc->document_type_label;
            $doc->status_label = $doc->status_label;
            $doc->can_be_replaced = $submission->canBeEdited() && ! $doc->isApproved();
            $doc->needs_action = $doc->isRejected();
        });
    }
}
