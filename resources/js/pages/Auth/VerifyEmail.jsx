// resources/js/Pages/Auth/VerifyEmail.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Inbox, LogOut, Mail, Send } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Verify Email" />

            <div className="flex min-h-screen overflow-hidden">
                {/* Left Side - Branding */}
                <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-12 lg:flex lg:w-1/2">
                    {/* Animated background shapes */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="animate-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-400/20"></div>
                        <div className="animate-blob animation-delay-2000 absolute -right-24 top-1/2 h-80 w-80 rounded-full bg-indigo-400/20"></div>
                        <div className="animate-blob animation-delay-4000 absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-purple-400/20"></div>
                    </div>

                    <div className="animate-fade-in-up relative z-10 text-center">
                        {/* Logo */}
                        <div className="animate-scale-in mb-8 inline-flex items-center justify-center rounded-3xl bg-white/10 p-10 backdrop-blur-sm transition-transform duration-300 hover:scale-105">
                            <img
                                src="/images/logo.png"
                                alt="Company Logo"
                                className="h-32 w-auto object-contain"
                            />
                        </div>

                        <h1 className="animate-fade-in-up animation-delay-200 mb-4 text-4xl font-bold text-white">
                            Almost There!
                        </h1>
                        <p className="animate-fade-in-up animation-delay-400 max-w-md text-xl text-blue-100">
                            Just one more step to secure your account
                        </p>

                        {/* Email Icon */}
                        <div className="animate-fade-in-up animation-delay-600 mt-12">
                            <div className="inline-flex items-center justify-center rounded-full bg-white/20 p-8 backdrop-blur-sm">
                                <Mail className="h-20 w-20 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Verification Form */}
                <div className="flex w-full items-center justify-center bg-gray-50 p-8 lg:w-1/2">
                    <div className="animate-fade-in-right w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="mb-8 text-center lg:hidden">
                            <div className="animate-scale-in mb-4 inline-flex items-center justify-center rounded-2xl bg-white p-6 shadow-lg">
                                <img
                                    src="/images/logo.png"
                                    alt="Company Logo"
                                    className="h-16 w-auto object-contain"
                                />
                            </div>
                        </div>

                        <Card className="animate-fade-in animation-delay-200 transition-shadow duration-300 hover:shadow-xl">
                            <CardHeader className="space-y-4">
                                {/* Icon */}
                                <div className="flex justify-center">
                                    <div className="inline-flex items-center justify-center rounded-full bg-blue-50 p-4">
                                        <Inbox className="h-12 w-12 text-blue-600" />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <CardTitle className="text-3xl font-bold">
                                        Check Your Email
                                    </CardTitle>
                                    <CardDescription className="mt-2 text-base">
                                        We've sent a verification link to your
                                        email address
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Instructions */}
                                <Alert className="border-blue-200 bg-blue-50">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                        <strong>Next steps:</strong>
                                        <ol className="mt-2 list-inside list-decimal space-y-1 text-sm">
                                            <li>Check your email inbox</li>
                                            <li>
                                                Click the verification link we
                                                sent you
                                            </li>
                                            <li>
                                                You'll be redirected back to
                                                complete setup
                                            </li>
                                        </ol>
                                    </AlertDescription>
                                </Alert>

                                {/* Success Message */}
                                {status === 'verification-link-sent' && (
                                    <Alert className="animate-slide-down border-green-200 bg-green-50">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="font-medium text-green-800">
                                            ✓ A new verification link has been
                                            sent to your email!
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Resend Form */}
                                <form onSubmit={submit} className="space-y-4">
                                    <div className="text-center">
                                        <p className="mb-4 text-sm text-gray-600">
                                            Didn't receive the email?
                                        </p>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <svg
                                                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
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
                                        <span className="bg-white px-4 text-gray-500">
                                            or
                                        </span>
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
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log Out
                                    </Link>
                                </Button>

                                {/* Help Text */}
                                <div className="text-center">
                                    <p className="text-xs text-gray-500">
                                        Having trouble? Contact support at{' '}
                                        <a
                                            href="mailto:hr@rocketpartners.ph"
                                            className="text-blue-600 hover:underline"
                                        >
                                            hr@rocketpartners.ph
                                        </a>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <p className="animate-fade-in animation-delay-900 mt-8 text-center text-sm text-gray-500">
                            © 2024 Rocket Partners. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
