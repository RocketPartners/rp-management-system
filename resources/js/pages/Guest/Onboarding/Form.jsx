// resources/js/Pages/Guest/Onboarding/Form.jsx
import { DocumentUploadForm } from '@/components/onboarding/forms/DocumentUploadForm';
import { EmergencyContactForm } from '@/components/onboarding/forms/EmergencyContactForm';
import { GovernmentIdForm } from '@/components/onboarding/forms/GovernmentIdForm';
import { PersonalInfoForm } from '@/components/onboarding/forms/PersonalInfoForm';
import { ProgressIndicator } from '@/components/onboarding/shared/ProgressIndicator';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import { useOnboardingForm } from '@/hooks/onboarding/useOnboardingForm';
import { BRAND_CLASSES } from '@/lib/constants/theme';
import { Head } from '@inertiajs/react';
import { Briefcase, Building2, Clock, Rocket } from 'lucide-react';

/**
 * Main Onboarding Form - Orchestrates the 4-step process
 * Reduced from 1,063 lines to ~200 lines by extracting step components
 *
 * @param {Object} props
 * @param {Object} props.invite - Invitation data
 * @param {Object} props.submission - Current submission state
 * @param {Object} props.requiredDocuments - Required document types configuration
 * @returns {JSX.Element}
 */
export default function Form({ invite, submission, requiredDocuments }) {
    // Consolidated form state management
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
        handleDeleteDocument,
        handleFinalSubmit,
        goToPreviousStep,
    } = useOnboardingForm(submission, invite.token);

    return (
        <>
            <Head title="Complete Your Onboarding" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 px-4 py-12">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Header with Logo */}
                    <div className="animate-fade-in text-center">
                        <div className="mb-6 flex flex-col items-center justify-center">
                            {/* Logo */}
                            <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#2596be] to-[#1e7a9e] px-4 py-2 shadow-md transition-shadow hover:shadow-lg">
                                <img
                                    src="/images/logo.png"
                                    alt="Rocket Partners"
                                    className="h-10 w-auto object-contain"
                                />
                            </div>

                            {/* Title */}
                            <div className="mb-2 flex items-center gap-3">
                                <div
                                    className={`p-3 ${BRAND_CLASSES.bgPrimary} rounded-xl shadow-lg`}
                                >
                                    <Rocket className="h-8 w-8 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold text-gray-900">
                                    Onboarding Portal
                                </h1>
                            </div>

                            <p className="text-lg text-gray-600">
                                Welcome, {invite.full_name || 'New Team Member'}
                                !
                            </p>
                        </div>

                        {/* Position Badge */}
                        {invite.position && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <Badge
                                    className={`${BRAND_CLASSES.badgePrimary} px-4 py-1.5 text-base`}
                                >
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
                                {new Date(invite.expires_at).toLocaleDateString(
                                    'en-US',
                                    {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    },
                                )}
                            </AlertDescription>
                        </Alert>
                    </div>

                    {/* Progress Indicator */}
                    <ProgressIndicator
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                    />

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
                            inviteToken={invite.token}
                            onBack={goToPreviousStep}
                            onDeleteDocument={handleDeleteDocument}
                            onFinalSubmit={handleFinalSubmit}
                        />
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
                .animation-delay-100 {
                    animation-delay: 0.1s;
                }
            `}</style>
        </>
    );
}
