import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { setRememberMe } from '@/lib/spring-boot-api';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                    }) => void;
                    renderButton: (parent: HTMLElement, config: Record<string, unknown>) => void;
                };
            };
        };
    }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface LoginErrors {
    email?: string;
    password?: string;
}

export default function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [remember, setRemember] = useState<boolean>(false);
    const [processing, setProcessing] = useState<boolean>(false);
    const [errors, setErrors] = useState<LoginErrors>({});
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const gisLoadedRef = useRef(false);
    const googleButtonRef = useRef<HTMLDivElement>(null);

    const handleGoogleResponse = useCallback(
        async (response: { credential: string }) => {
            setErrors({});
            try {
                setRememberMe(true); // Google login always uses localStorage
                await loginWithGoogle(response.credential);
                navigate('/dashboard', { replace: true });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Google login failed';
                setErrors({ email: message });
            }
        },
        [loginWithGoogle, navigate],
    );

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || gisLoadedRef.current) return;
        gisLoadedRef.current = true;

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.google?.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            });
            // Render Google's standard button
            if (googleButtonRef.current) {
                window.google?.accounts.id.renderButton(googleButtonRef.current, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    width: googleButtonRef.current.offsetWidth || 400,
                });
            }
        };
        document.head.appendChild(script);
    }, [handleGoogleResponse]);

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            setRememberMe(remember);
            await login(email, password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Authentication failed';
            setErrors({ email: message });
            setProcessing(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Log in</title>
            </Helmet>

            <div className="flex min-h-screen overflow-hidden">
                {/* Left Side - Branding */}
                <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-12 lg:flex lg:w-1/2">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="animate-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-400/20"></div>
                        <div className="animate-blob animation-delay-2000 absolute -right-24 top-1/2 h-80 w-80 rounded-full bg-indigo-400/20"></div>
                        <div className="animate-blob animation-delay-4000 absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-purple-400/20"></div>
                    </div>

                    <div className="animate-fade-in-up relative z-10 text-center">
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

                        <div className="animate-fade-in-up animation-delay-600 mt-12 flex items-center justify-center gap-8 text-blue-100">
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
                                                value={email}
                                                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                                autoComplete="username"
                                                placeholder="you@example.com"
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
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
                                                value={password}
                                                className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                onChange={(e) =>
                                                    setPassword(e.target.value)
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
                                                checked={remember}
                                                onCheckedChange={(checked) =>
                                                    setRemember(checked === true)
                                                }
                                            />
                                            <Label
                                                htmlFor="remember"
                                                className="cursor-pointer text-sm font-normal"
                                            >
                                                Remember me
                                            </Label>
                                        </div>

                                        <Link
                                            to="/forgot-password"
                                            className="text-sm text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
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

                                {/* Divider */}
                                {GOOGLE_CLIENT_ID && (
                                    <div className="animate-fade-in animation-delay-750 mt-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300" />
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="bg-white px-4 text-gray-500">or</span>
                                            </div>
                                        </div>

                                        <div ref={googleButtonRef} className="mt-4 flex justify-center" />
                                    </div>
                                )}

                                <div className="animate-fade-in animation-delay-800 mt-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <Link
                                            to="/register"
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
