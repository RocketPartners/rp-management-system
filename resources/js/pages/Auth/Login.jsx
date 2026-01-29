// resources/js/Pages/Auth/Login.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { useEffect } from 'react';

export default function Login({ status, canResetPassword, userCount = 0 }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title="Log in" />

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
                        {/* Logo - Bigger size */}
                        <div className="animate-scale-in mb-8 inline-flex items-center justify-center rounded-3xl bg-white/10 p-10 backdrop-blur-sm transition-transform duration-300 hover:scale-105">
                            <img
                                src="/images/logo.png"
                                alt="Company Logo"
                                className="h-32 w-auto object-contain"
                            />
                        </div>

                        <p className="animate-fade-in-up animation-delay-400 max-w-md text-xl text-blue-100">
                            Managing your business operations with ease and
                            efficiency
                        </p>

                        {/* Stats - Now showing actual user count */}
                        <div className="animate-fade-in-up animation-delay-600 mt-12 flex items-center justify-center gap-8 text-blue-100">
                            <div className="text-center transition-transform duration-300 hover:scale-110">
                                <div className="text-3xl font-bold">
                                    {userCount}+
                                </div>
                                <div className="text-sm">Active Users</div>
                            </div>
                            <div className="h-12 w-px bg-blue-400"></div>
                            <div className="text-center transition-transform duration-300 hover:scale-110">
                                <div className="text-3xl font-bold">24/7</div>
                                <div className="text-sm">Support</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex w-full items-center justify-center bg-gray-50 p-8 lg:w-1/2">
                    <div className="animate-fade-in-right w-full max-w-md">
                        {/* Mobile Logo - Bigger */}
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
                                {/* Logo in Card Header */}
                                <div className="flex justify-center">
                                    <div className="inline-flex items-center justify-center rounded-xl bg-blue-50 p-3">
                                        <img
                                            src="/images/icon.png"
                                            alt="Company Logo"
                                            className="h-20 w-auto object-contain"
                                        />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <CardTitle className="text-3xl font-bold">
                                        Welcome Back
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Enter your credentials to access your
                                        account
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {status && (
                                    <Alert className="animate-slide-down mb-6 border-green-200 bg-green-50">
                                        <AlertDescription className="text-green-800">
                                            {status}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={submit} className="space-y-6">
                                    <div className="animate-fade-in animation-delay-400 space-y-2">
                                        <Label htmlFor="email">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                                autoComplete="username"
                                                placeholder="you@example.com"
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="animate-fade-in animation-delay-500 space-y-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={data.password}
                                                className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                onChange={(e) =>
                                                    setData(
                                                        'password',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="flex items-center gap-1 text-sm text-red-500">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="animate-fade-in animation-delay-600 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remember"
                                                checked={data.remember}
                                                onCheckedChange={(checked) =>
                                                    setData('remember', checked)
                                                }
                                            />
                                            <Label
                                                htmlFor="remember"
                                                className="cursor-pointer text-sm font-normal"
                                            >
                                                Remember me
                                            </Label>
                                        </div>

                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-sm text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="animate-fade-in animation-delay-700 w-full"
                                        disabled={processing}
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
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </form>

                                <div className="animate-fade-in animation-delay-800 mt-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <Link
                                            href={route('register')}
                                            className="font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                                        >
                                            Sign up
                                        </Link>
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
