// resources/js/Pages/Auth/Login.jsx
import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Mail, Lock, AlertCircle } from 'lucide-react';

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
                        {/* Logo - Bigger size */}
                        <div className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-3xl p-10 mb-8 animate-scale-in hover:scale-105 transition-transform duration-300">
                            <img
                                src="/images/logo.png"
                                alt="Company Logo"
                                className="h-32 w-auto object-contain"
                            />
                        </div>

                        <p className="text-xl text-blue-100 max-w-md animate-fade-in-up animation-delay-400">
                            Managing your business operations with ease and efficiency
                        </p>

                        {/* Stats - Now showing actual user count */}
                        <div className="mt-12 flex items-center justify-center gap-8 text-blue-100 animate-fade-in-up animation-delay-600">
                            <div className="text-center hover:scale-110 transition-transform duration-300">
                                <div className="text-3xl font-bold">{userCount}+</div>
                                <div className="text-sm">Active Users</div>
                            </div>
                            <div className="w-px h-12 bg-blue-400"></div>
                            <div className="text-center hover:scale-110 transition-transform duration-300">
                                <div className="text-3xl font-bold">24/7</div>
                                <div className="text-sm">Support</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                    <div className="w-full max-w-md animate-fade-in-right">
                        {/* Mobile Logo - Bigger */}
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
                                {/* Logo in Card Header */}
                                <div className="flex justify-center">
                                    <div className="inline-flex items-center justify-center bg-blue-50 rounded-xl p-3">
                                        <img
                                            src="/images/icon.png"
                                            alt="Company Logo"
                                            className="h-20 w-auto object-contain"
                                        />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
                                    <CardDescription className="mt-2">
                                        Enter your credentials to access your account
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {status && (
                                    <Alert className="mb-6 animate-slide-down bg-green-50 border-green-200">
                                        <AlertDescription className="text-green-800">
                                            {status}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <form onSubmit={submit} className="space-y-6">
                                    <div className="space-y-2 animate-fade-in animation-delay-400">
                                        <Label htmlFor="email">Email Address</Label>
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
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2 animate-fade-in animation-delay-500">
                                        <Label htmlFor="password">Password</Label>
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
                                                onChange={(e) => setData('password', e.target.value)}
                                                required
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between animate-fade-in animation-delay-600">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remember"
                                                checked={data.remember}
                                                onCheckedChange={(checked) => setData('remember', checked)}
                                            />
                                            <Label
                                                htmlFor="remember"
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                Remember me
                                            </Label>
                                        </div>

                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full animate-fade-in animation-delay-700"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center animate-fade-in animation-delay-800">
                                    <p className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <Link
                                            href={route('register')}
                                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                                        >
                                            Sign up
                                        </Link>
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
