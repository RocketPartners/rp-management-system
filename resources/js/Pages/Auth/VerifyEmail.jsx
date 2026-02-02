// resources/js/Pages/Auth/VerifyEmail.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Mail, Send, LogOut, CheckCircle2, Inbox } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Verify Email" />
            
            <div className="min-h-screen flex overflow-hidden">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden">
                    {/* Animated background shapes */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full animate-blob"></div>
                        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-400/20 rounded-full animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-purple-400/20 rounded-full animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="text-center relative z-10 animate-fade-in-up">
                        {/* Logo */}
                        <div className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-3xl p-10 mb-8 animate-scale-in hover:scale-105 transition-transform duration-300">
                            <img 
                                src="/images/logo.png" 
                                alt="Company Logo" 
                                className="h-32 w-auto object-contain"
                            />
                        </div>
                        
                        <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in-up animation-delay-200">
                            Almost There!
                        </h1>
                        <p className="text-xl text-blue-100 max-w-md animate-fade-in-up animation-delay-400">
                            Just one more step to secure your account
                        </p>
                        
                        {/* Email Icon */}
                        <div className="mt-12 animate-fade-in-up animation-delay-600">
                            <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full p-8">
                                <Mail className="h-20 w-20 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Verification Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                    <div className="w-full max-w-md animate-fade-in-right">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="inline-flex items-center justify-center bg-white rounded-2xl p-6 mb-4 animate-scale-in shadow-lg">
                                <img 
                                    src="/images/logo.png" 
                                    alt="Company Logo" 
                                    className="h-16 w-auto object-contain"
                                />
                            </div>
                        </div>

                        <Card className="animate-fade-in animation-delay-200 hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="space-y-4">
                                {/* Icon */}
                                <div className="flex justify-center">
                                    <div className="inline-flex items-center justify-center bg-blue-50 rounded-full p-4">
                                        <Inbox className="h-12 w-12 text-blue-600" />
                                    </div>
                                </div>
                                
                                <div className="text-center">
                                    <CardTitle className="text-3xl font-bold">Check Your Email</CardTitle>
                                    <CardDescription className="mt-2 text-base">
                                        We've sent a verification link to your email address
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-6">
                                {/* Instructions */}
                                <Alert className="bg-blue-50 border-blue-200">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                        <strong>Next steps:</strong>
                                        <ol className="mt-2 space-y-1 text-sm list-decimal list-inside">
                                            <li>Check your email inbox</li>
                                            <li>Click the verification link we sent you</li>
                                            <li>You'll be redirected back to complete setup</li>
                                        </ol>
                                    </AlertDescription>
                                </Alert>

                                {/* Success Message */}
                                {status === 'verification-link-sent' && (
                                    <Alert className="bg-green-50 border-green-200 animate-slide-down">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-800 font-medium">
                                            ✓ A new verification link has been sent to your email!
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Resend Form */}
                                <form onSubmit={submit} className="space-y-4">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-4">
                                            Didn't receive the email?
                                        </p>
                                        <Button 
                                            type="submit" 
                                            disabled={processing}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Resend Verification Email
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500">or</span>
                                    </div>
                                </div>

                                {/* Logout Button */}
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
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Log Out
                                    </Link>
                                </Button>

                                {/* Help Text */}
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">
                                        Having trouble? Contact support at{' '}
                                        <a href="mailto:hr@rocketpartners.ph" className="text-blue-600 hover:underline">
                                            hr@rocketpartners.ph
                                        </a>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <p className="text-center text-sm text-gray-500 mt-8 animate-fade-in animation-delay-900">
                            © 2024 Rocket Partners. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}