import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, FileText, Shield, User } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

export default function OnboardingPortal() {
    const { token } = useParams<{ token: string }>();

    return (
        <>
            <Helmet>
                <title>Onboarding</title>
            </Helmet>

            <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900">
                            <ClipboardList className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-2xl">
                            Employee Onboarding
                        </CardTitle>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Welcome! The onboarding portal is currently being
                            set up. Please check back soon.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-center text-sm font-medium text-zinc-700">
                                What you'll be able to do:
                            </p>
                            <div className="grid gap-3">
                                <div className="flex items-start gap-3 rounded-lg border bg-zinc-50 p-3">
                                    <User className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">
                                            Personal Information
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            Fill in your personal details and
                                            emergency contacts
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border bg-zinc-50 p-3">
                                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">
                                            Document Upload
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            Upload required documents like IDs,
                                            certificates, and photos
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 rounded-lg border bg-zinc-50 p-3">
                                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">
                                            Secure Submission
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            Your documents are encrypted and
                                            securely stored
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-center text-xs text-muted-foreground">
                                If you have any questions, please contact your
                                HR department.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
