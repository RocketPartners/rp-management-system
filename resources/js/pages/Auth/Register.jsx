// resources/js/Pages/Auth/Register.jsx
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Progress } from '@/Components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Lock,
    Mail,
    Shield,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const ALLOWED_EMAIL_DOMAINS = ['@rocketpartners.ph', '@rocketpartners.io'];

export default function Register() {
    const [currentStep, setCurrentStep] = useState(1);
    const [emailVerified, setEmailVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [emailError, setEmailError] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: 'none',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    // Verify email domain
    const verifyEmail = async () => {
        setEmailError('');

        const emailParts = data.email.toLowerCase().split('@');

        if (emailParts.length !== 2) {
            setEmailError('Invalid email format');
            setEmailVerified(false);
            return;
        }

        const domain = '@' + emailParts[1];

        const isValidDomain = ALLOWED_EMAIL_DOMAINS.some(
            (allowedDomain) => domain === allowedDomain.toLowerCase(),
        );

        if (!isValidDomain) {
            setEmailError(
                `Email must be from: ${ALLOWED_EMAIL_DOMAINS.join(' or ')}`,
            );
            setEmailVerified(false);
            return;
        }

        setVerifying(true);

        setTimeout(() => {
            setEmailVerified(true);
            setVerifying(false);
        }, 1000);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    const nextStep = () => {
        if (currentStep === 1 && emailVerified) {
            setCurrentStep(2);
        } else if (currentStep === 2 && data.first_name && data.last_name) {
            setCurrentStep(3);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const progressPercentage = (currentStep / 3) * 100;

    // Get full name for display
    const getFullName = () => {
        const parts = [data.first_name, data.middle_name, data.last_name];
        const name = parts.filter(Boolean).join(' ');
        return data.suffix && data.suffix !== 'none'
            ? `${name} ${data.suffix}`
            : name;
    };

    return (
        <>
            <Head title="Register" />

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

                        <h1 className="animate-fade-in-up animation-delay-200 mb-4 text-4xl font-bold text-white">
                            Join Our Team
                        </h1>
                        <p className="animate-fade-in-up animation-delay-400 max-w-md text-xl text-blue-100">
                            Create your account and start managing your business
                            operations efficiently
                        </p>

                        {/* Registration Steps Indicator */}
                        <div className="animate-fade-in-up animation-delay-600 mx-auto mt-12 max-w-sm space-y-4 text-left">
                            <div
                                className={`flex items-center gap-3 rounded-lg p-3 transition-all ${currentStep >= 1 ? 'bg-white/20' : 'bg-white/5'}`}
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-white/20 text-white'} text-sm font-bold`}
                                >
                                    {currentStep > 1 ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        '1'
                                    )}
                                </div>
                                <div className="text-white">
                                    <p className="font-medium">Verify Email</p>
                                    <p className="text-xs text-blue-100">
                                        Company email required
                                    </p>
                                </div>
                            </div>

                            <div
                                className={`flex items-center gap-3 rounded-lg p-3 transition-all ${currentStep >= 2 ? 'bg-white/20' : 'bg-white/5'}`}
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 2 ? 'bg-white text-blue-600' : 'bg-white/20 text-white'} text-sm font-bold`}
                                >
                                    {currentStep > 2 ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        '2'
                                    )}
                                </div>
                                <div className="text-white">
                                    <p className="font-medium">
                                        Your Information
                                    </p>
                                    <p className="text-xs text-blue-100">
                                        Name and details
                                    </p>
                                </div>
                            </div>

                            <div
                                className={`flex items-center gap-3 rounded-lg p-3 transition-all ${currentStep >= 3 ? 'bg-white/20' : 'bg-white/5'}`}
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 3 ? 'bg-white text-blue-600' : 'bg-white/20 text-white'} text-sm font-bold`}
                                >
                                    3
                                </div>
                                <div className="text-white">
                                    <p className="font-medium">Set Password</p>
                                    <p className="text-xs text-blue-100">
                                        Secure your account
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Registration Form */}
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
                                        Create Account
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Step {currentStep} of 3 -{' '}
                                        {currentStep === 1
                                            ? 'Verify Email'
                                            : currentStep === 2
                                              ? 'Your Information'
                                              : 'Set Password'}
                                    </CardDescription>
                                </div>

                                <div className="pt-2">
                                    <Progress
                                        value={progressPercentage}
                                        className="h-2"
                                    />
                                </div>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={submit} className="space-y-6">
                                    {/* STEP 1: Email Verification */}
                                    {currentStep === 1 && (
                                        <div className="animate-fade-in space-y-6">
                                            <Alert className="border-blue-200 bg-blue-50">
                                                <Shield className="h-4 w-4 text-blue-600" />
                                                <AlertDescription className="text-blue-800">
                                                    Only{' '}
                                                    {ALLOWED_EMAIL_DOMAINS.join(
                                                        ' or ',
                                                    )}{' '}
                                                    email addresses can register
                                                </AlertDescription>
                                            </Alert>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Work Email Address
                                                </Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        name="email"
                                                        value={data.email}
                                                        className={`pl-10 ${emailError || errors.email ? 'border-red-500' : emailVerified ? 'border-green-500' : ''}`}
                                                        autoComplete="username"
                                                        placeholder="yourname@rocketpartners.ph"
                                                        onChange={(e) => {
                                                            setData(
                                                                'email',
                                                                e.target.value,
                                                            );
                                                            setEmailVerified(
                                                                false,
                                                            );
                                                            setEmailError('');
                                                        }}
                                                        required
                                                        autoFocus
                                                    />
                                                    {emailVerified && (
                                                        <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-600" />
                                                    )}
                                                </div>
                                                {emailError && (
                                                    <p className="flex items-center gap-1 text-sm text-red-500">
                                                        <AlertCircle className="h-4 w-4" />
                                                        {emailError}
                                                    </p>
                                                )}
                                                {errors.email && (
                                                    <p className="flex items-center gap-1 text-sm text-red-500">
                                                        <AlertCircle className="h-4 w-4" />
                                                        {errors.email}
                                                    </p>
                                                )}
                                                {emailVerified && (
                                                    <p className="flex items-center gap-1 text-sm text-green-600">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Email verified
                                                        successfully!
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-3">
                                                {!emailVerified ? (
                                                    <Button
                                                        type="button"
                                                        onClick={verifyEmail}
                                                        disabled={
                                                            !data.email ||
                                                            verifying
                                                        }
                                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {verifying ? (
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
                                                                Verifying...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Verify Email
                                                                <ArrowRight className="ml-2 h-4 w-4" />
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        onClick={nextStep}
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                    >
                                                        Continue
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: Personal Information */}
                                    {currentStep === 2 && (
                                        <div className="animate-fade-in space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="first_name">
                                                        First Name *
                                                    </Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                        <Input
                                                            id="first_name"
                                                            name="first_name"
                                                            value={
                                                                data.first_name
                                                            }
                                                            className={`pl-10 ${errors.first_name ? 'border-red-500' : ''}`}
                                                            autoComplete="given-name"
                                                            placeholder="John"
                                                            onChange={(e) =>
                                                                setData(
                                                                    'first_name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            required
                                                            autoFocus
                                                        />
                                                    </div>
                                                    {errors.first_name && (
                                                        <p className="flex items-center gap-1 text-sm text-red-500">
                                                            <AlertCircle className="h-4 w-4" />
                                                            {errors.first_name}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="last_name">
                                                        Last Name *
                                                    </Label>
                                                    <Input
                                                        id="last_name"
                                                        name="last_name"
                                                        value={data.last_name}
                                                        className={
                                                            errors.last_name
                                                                ? 'border-red-500'
                                                                : ''
                                                        }
                                                        autoComplete="family-name"
                                                        placeholder="Doe"
                                                        onChange={(e) =>
                                                            setData(
                                                                'last_name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    {errors.last_name && (
                                                        <p className="flex items-center gap-1 text-sm text-red-500">
                                                            <AlertCircle className="h-4 w-4" />
                                                            {errors.last_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="middle_name">
                                                    Middle Name (Optional)
                                                </Label>
                                                <Input
                                                    id="middle_name"
                                                    name="middle_name"
                                                    value={data.middle_name}
                                                    autoComplete="additional-name"
                                                    placeholder="Optional"
                                                    onChange={(e) =>
                                                        setData(
                                                            'middle_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="suffix">
                                                    Suffix (Optional)
                                                </Label>
                                                <Select
                                                    value={data.suffix}
                                                    onValueChange={(value) =>
                                                        setData('suffix', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            None
                                                        </SelectItem>
                                                        <SelectItem value="Jr.">
                                                            Jr.
                                                        </SelectItem>
                                                        <SelectItem value="Sr.">
                                                            Sr.
                                                        </SelectItem>
                                                        <SelectItem value="II">
                                                            II
                                                        </SelectItem>
                                                        <SelectItem value="III">
                                                            III
                                                        </SelectItem>
                                                        <SelectItem value="IV">
                                                            IV
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="rounded-lg bg-blue-50 p-4">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                    <p className="text-sm font-medium text-blue-900">
                                                        Your Email
                                                    </p>
                                                </div>
                                                <p className="font-mono text-sm text-blue-700">
                                                    {data.email}
                                                </p>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={prevStep}
                                                    className="flex-1"
                                                >
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Back
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={nextStep}
                                                    disabled={
                                                        !data.first_name ||
                                                        !data.last_name
                                                    }
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Continue
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: Password Setup */}
                                    {currentStep === 3 && (
                                        <div className="animate-fade-in space-y-6">
                                            <div className="space-y-2">
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
                                                        autoComplete="new-password"
                                                        placeholder="••••••••"
                                                        onChange={(e) =>
                                                            setData(
                                                                'password',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                        autoFocus
                                                    />
                                                </div>
                                                {errors.password && (
                                                    <p className="flex items-center gap-1 text-sm text-red-500">
                                                        <AlertCircle className="h-4 w-4" />
                                                        {errors.password}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Must be at least 8
                                                    characters long
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">
                                                    Confirm Password
                                                </Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        id="password_confirmation"
                                                        type="password"
                                                        name="password_confirmation"
                                                        value={
                                                            data.password_confirmation
                                                        }
                                                        className={`pl-10 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                                                        autoComplete="new-password"
                                                        placeholder="••••••••"
                                                        onChange={(e) =>
                                                            setData(
                                                                'password_confirmation',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                </div>
                                                {errors.password_confirmation && (
                                                    <p className="flex items-center gap-1 text-sm text-red-500">
                                                        <AlertCircle className="h-4 w-4" />
                                                        {
                                                            errors.password_confirmation
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium text-green-800">
                                                            Name:
                                                        </span>
                                                        <span className="text-green-700">
                                                            {getFullName()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium text-green-800">
                                                            Email:
                                                        </span>
                                                        <span className="font-mono text-xs text-green-700">
                                                            {data.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={prevStep}
                                                    className="flex-1"
                                                >
                                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                                    Back
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        processing ||
                                                        !data.password ||
                                                        !data.password_confirmation
                                                    }
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
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
                                                            Creating Account...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Create Account
                                                            <CheckCircle2 className="ml-2 h-4 w-4" />
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </form>

                                <div className="animate-fade-in mt-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{' '}
                                        <Link
                                            href={route('login')}
                                            className="font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
                                        >
                                            Sign in
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
