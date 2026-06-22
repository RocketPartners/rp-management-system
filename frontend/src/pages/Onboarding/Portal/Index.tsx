/**
 * Onboarding Portal - Main 4-step form page
 * Ported from monolith's Guest/Onboarding/Form.jsx
 * Replaces Inertia server-side props with TanStack Query + Spring Boot API
 */

import { DocumentUploadForm } from '@/components/onboarding/forms/DocumentUploadForm';
import { EmergencyContactForm } from '@/components/onboarding/forms/EmergencyContactForm';
import { GovernmentIdForm } from '@/components/onboarding/forms/GovernmentIdForm';
import { PersonalInfoForm } from '@/components/onboarding/forms/PersonalInfoForm';
import { ProgressIndicator } from '@/components/onboarding/shared/ProgressIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnboardingForm } from '@/hooks/onboarding/useOnboardingForm';
import { portalGet } from '@/lib/api/onboarding-portal';
import { BRAND_CLASSES } from '@/lib/constants/theme';
import { useQuery } from '@tanstack/react-query';
import {
    AlertCircle,
    Briefcase,
    Building2,
    Clock,
    Loader2,
    Rocket,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Navigate, useParams } from 'react-router-dom';

export default function OnboardingPortal() {
    const { token } = useParams<{ token: string }>();

    const { data: portalData, isLoading, error } = useQuery({
        queryKey: ['onboarding-portal', token],
        queryFn: () => portalGet(`/onboarding/portal/${token}`),
        enabled: !!token,
        retry: false,
    });

    // Loading state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#2596be]" />
                    <p className="mt-4 text-gray-600">Loading your onboarding form...</p>
                </div>
            </div>
        );
    }

    // Error state (invalid/expired token)
    if (error) {
        return (
            <>
                <Helmet><title>Onboarding - Error</title></Helmet>
                <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                                <AlertCircle className="h-7 w-7 text-red-600" />
                            </div>
                            <CardTitle className="text-xl">Invalid or Expired Link</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-sm text-muted-foreground">
                                {(error as Error).message || 'This onboarding link is no longer valid. Please contact HR for assistance.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    if (!portalData) return null;

    const { invite, submission, required_documents, submission_status, can_edit, is_locked, revision_notes } = portalData as any;

    // If already submitted, redirect to success page
    if (submission?.submitted_at) {
        return <Navigate to={`/onboarding/${token}/success`} replace />;
    }

    return <OnboardingForm
        invite={invite}
        submission={submission}
        requiredDocuments={required_documents}
        submissionStatus={submission_status}
        token={token!}
    />;
}

/**
 * Inner form component — needs to be separate so useOnboardingForm
 * hook can read the loaded submission data.
 */
function OnboardingForm({ invite, submission, requiredDocuments, submissionStatus, token }: any) {
    const {
        currentStep,
        totalSteps,
        personalForm,
        govIdForm,
        emergencyForm,
        documentForm,
        handleSavePersonalInfo,
        handleSaveGovIds,
        handleSaveEmergency,
        handleUploadDocument,
        handleDeleteDocument,
        handleFinalSubmit,
        goToPreviousStep,
    } = useOnboardingForm(submission, token);

    return (
        <>
            <Helmet><title>Complete Your Onboarding</title></Helmet>

            <div className="min-h-screen bg-zinc-50 px-4 py-12">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Header */}
                    <div className="animate-fade-in text-center">
                        <div className="mb-6 flex flex-col items-center justify-center">
                            <div className="mb-2 flex items-center gap-3">
                                <div className={`p-3 ${BRAND_CLASSES.bgPrimary} rounded-xl shadow-lg`}>
                                    <Rocket className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900">
                                    Onboarding Portal
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                Welcome, {invite.full_name || 'New Team Member'}!
                            </p>
                        </div>

                        {/* Position & Department Badges */}
                        {invite.position && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <Badge className={`${BRAND_CLASSES.badgePrimary} px-4 py-1.5 text-base`}>
                                    <Briefcase className="mr-2 h-4 w-4" />
                                    {invite.position}
                                </Badge>
                                {invite.department && (
                                    <Badge className="border-gray-300 bg-gray-100 px-4 py-1.5 text-base text-gray-700">
                                        <Building2 className="mr-2 h-4 w-4" />
                                        {invite.department}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Expiration Warning */}
                        <Alert className="mt-6 border-amber-300 bg-amber-50">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                <strong>Expires:</strong>{' '}
                                {new Date(invite.expires_at).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </AlertDescription>
                        </Alert>
                    </div>

                    {/* Progress Indicator */}
                    <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <PersonalInfoForm
                            form={personalForm}
                            onNext={handleSavePersonalInfo}
                        />
                    )}

                    {/* Step 2: Government IDs */}
                    {currentStep === 2 && (
                        <GovernmentIdForm
                            form={govIdForm}
                            onNext={handleSaveGovIds}
                            onBack={goToPreviousStep}
                        />
                    )}

                    {/* Step 3: Emergency Contact */}
                    {currentStep === 3 && (
                        <EmergencyContactForm
                            form={emergencyForm}
                            onNext={handleSaveEmergency}
                            onBack={goToPreviousStep}
                        />
                    )}

                    {/* Step 4: Document Upload */}
                    {currentStep === 4 && (
                        <DocumentUploadForm
                            submission={submission}
                            requiredDocuments={requiredDocuments}
                            documentForm={documentForm}
                            submissionStatus={submissionStatus}
                            onBack={goToPreviousStep}
                            onDeleteDocument={handleDeleteDocument}
                            onUpload={handleUploadDocument}
                            onFinalSubmit={handleFinalSubmit}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
