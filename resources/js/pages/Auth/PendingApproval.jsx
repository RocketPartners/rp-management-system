import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock, LogOut, Mail } from 'lucide-react';

export default function PendingApproval({ auth }) {
    return (
        <>
            <Head title="Pending Approval" />

            <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
                <div className="w-full max-w-md">
                    <Card className="animate-fade-in">
                        <CardHeader className="space-y-4 text-center">
                            <div className="flex justify-center">
                                <div className="inline-flex items-center justify-center rounded-full bg-yellow-100 p-4">
                                    <Clock className="h-12 w-12 text-yellow-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">
                                Account Pending Approval
                            </CardTitle>
                            <CardDescription>
                                Your account is waiting for HR verification
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <Alert className="border-blue-200 bg-blue-50">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    <strong>Email verified!</strong> ✓
                                    <br />
                                    Your email{' '}
                                    <strong>{auth.user.email}</strong> has been
                                    confirmed.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900">
                                    What happens next?
                                </h3>
                                <ol className="space-y-3 text-sm text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                            1
                                        </span>
                                        <span>
                                            Our HR team has been notified of
                                            your registration
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                            2
                                        </span>
                                        <span>
                                            They will review your account
                                            (usually within 24 hours)
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                            3
                                        </span>
                                        <span>
                                            You'll receive an email when your
                                            account is approved
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-600" />
                                        <span className="font-medium text-green-700">
                                            Then you can access the system!
                                        </span>
                                    </li>
                                </ol>
                            </div>

                            <Alert className="border-gray-200 bg-gray-50">
                                <AlertDescription className="text-sm text-gray-700">
                                    If you have any questions, please contact HR
                                    at <strong>hr@rocketpartners.ph</strong>
                                </AlertDescription>
                            </Alert>

                            <Button
                                asChild
                                variant="outline"
                                className="w-full"
                            >
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
