import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Clock, Mail, CheckCircle2, LogOut } from 'lucide-react';

export default function PendingApproval({ auth }) {
    return (
        <>
            <Head title="Pending Approval" />
            
            <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <Card className="animate-fade-in">
                        <CardHeader className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="inline-flex items-center justify-center bg-yellow-100 rounded-full p-4">
                                    <Clock className="h-12 w-12 text-yellow-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl font-bold">Account Pending Approval</CardTitle>
                            <CardDescription>
                                Your account is waiting for HR verification
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            <Alert className="bg-blue-50 border-blue-200">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    <strong>Email verified!</strong> ✓
                                    <br />
                                    Your email <strong>{auth.user.email}</strong> has been confirmed.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900">What happens next?</h3>
                                <ol className="space-y-3 text-sm text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">1</span>
                                        <span>Our HR team has been notified of your registration</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">2</span>
                                        <span>They will review your account (usually within 24 hours)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">3</span>
                                        <span>You'll receive an email when your account is approved</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                                        <span className="font-medium text-green-700">Then you can access the system!</span>
                                    </li>
                                </ol>
                            </div>

                            <Alert className="bg-gray-50 border-gray-200">
                                <AlertDescription className="text-gray-700 text-sm">
                                    If you have any questions, please contact HR at <strong>hr@rocketpartners.ph</strong>
                                </AlertDescription>
                            </Alert>

                            <Button asChild variant="outline" className="w-full">
                                <Link href={route('logout')} method="post" as="button">
                                    <LogOut className="h-4 w-4 mr-2" />
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