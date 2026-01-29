// resources/js/Pages/Auth/Register.jsx
import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Progress } from '@/Components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { User, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

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
        
        const isValidDomain = ALLOWED_EMAIL_DOMAINS.some(allowedDomain => 
            domain === allowedDomain.toLowerCase()
        );

        if (!isValidDomain) {
            setEmailError(`Email must be from: ${ALLOWED_EMAIL_DOMAINS.join(' or ')}`);
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
        return data.suffix && data.suffix !== 'none' ? `${name} ${data.suffix}` : name;
    };

    return (
        <>
            <Head title="Register" />
            
            <div className="min-h-screen flex overflow-hidden">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-12 relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full animate-blob"></div>
                        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-400/20 rounded-full animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-purple-400/20 rounded-full animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="text-center relative z-10 animate-fade-in-up">
                        <div className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-3xl p-10 mb-8 animate-scale-in hover:scale-105 transition-transform duration-300">
                            <img 
                                src="/images/logo.png" 
                                alt="Company Logo" 
                                className="h-32 w-auto object-contain"
                            />
                        </div>
                        
                        <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in-up animation-delay-200">
                            Join Our Team
                        </h1>
                        <p className="text-xl text-blue-100 max-w-md animate-fade-in-up animation-delay-400">
                            Create your account and start managing your business operations efficiently
                        </p>
                        
                        {/* Registration Steps Indicator */}
                        <div className="mt-12 space-y-4 text-left max-w-sm mx-auto animate-fade-in-up animation-delay-600">
                            <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${currentStep >= 1 ? 'bg-white/20' : 'bg-white/5'}`}>
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-white/20 text-white'} font-bold text-sm`}>
                                    {currentStep > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
                                </div>
                                <div className="text-white">
                                    <p className="font-medium">Verify Email</p>
                                    <p className="text-xs text-blue-100">Company email required</p>
                                </div>
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${currentStep >= 2 ? 'bg-white/20' : 'bg-white/5'}`}>
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-white text-blue-600' : 'bg-white/20 text-white'} font-bold text-sm`}>
                                    {currentStep > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
                                </div>
                                <div className="text-white">
                                    <p className="font-medium">Your Information</p>
                                    <p className="text-xs text-blue-100">Name and details</p>
                                </div>
                            </div>

                            <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${currentStep >= 3 ? 'bg-white/20' : 'bg-white/5'}`}>
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 3 ? 'bg-white text-blue-600' : 'bg-white/20 text-white'} font-bold text-sm`}>
                                    3
                                </div>
                                <div className="text-white">
                                    <p className="font-medium">Set Password</p>
                                    <p className="text-xs text-blue-100">Secure your account</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Registration Form */}
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
                                    <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
                                    <CardDescription className="mt-2">
                                        Step {currentStep} of 3 - {
                                            currentStep === 1 ? 'Verify Email' :
                                            currentStep === 2 ? 'Your Information' :
                                            'Set Password'
                                        }
                                    </CardDescription>
                                </div>
                                
                                <div className="pt-2">
                                    <Progress value={progressPercentage} className="h-2" />
                                </div>
                            </CardHeader>
                            
                            <CardContent>
                                <form onSubmit={submit} className="space-y-6">
                                    
                                    {/* STEP 1: Email Verification */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6 animate-fade-in">
                                            <Alert className="bg-blue-50 border-blue-200">
                                                <Shield className="h-4 w-4 text-blue-600" />
                                                <AlertDescription className="text-blue-800">
                                                    Only {ALLOWED_EMAIL_DOMAINS.join(' or ')} email addresses can register
                                                </AlertDescription>
                                            </Alert>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Work Email Address</Label>
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
                                                            setData('email', e.target.value);
                                                            setEmailVerified(false);
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
                                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        {emailError}
                                                    </p>
                                                )}
                                                {errors.email && (
                                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        {errors.email}
                                                    </p>
                                                )}
                                                {emailVerified && (
                                                    <p className="text-sm text-green-600 flex items-center gap-1">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Email verified successfully!
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-3">
                                                {!emailVerified ? (
                                                    <Button 
                                                        type="button"
                                                        onClick={verifyEmail}
                                                        disabled={!data.email || verifying}
                                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {verifying ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Verifying...
                                                            </>
                                                        ) : (
                                                            <>
                                                                Verify Email
                                                                <ArrowRight className="h-4 w-4 ml-2" />
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
                                                        <ArrowRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: Personal Information */}
                                    {currentStep === 2 && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="first_name">First Name *</Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                        <Input
                                                            id="first_name"
                                                            name="first_name"
                                                            value={data.first_name}
                                                            className={`pl-10 ${errors.first_name ? 'border-red-500' : ''}`}
                                                            autoComplete="given-name"
                                                            placeholder="John"
                                                            onChange={(e) => setData('first_name', e.target.value)}
                                                            required
                                                            autoFocus
                                                        />
                                                    </div>
                                                    {errors.first_name && (
                                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                                            <AlertCircle className="h-4 w-4" />
                                                            {errors.first_name}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="last_name">Last Name *</Label>
                                                    <Input
                                                        id="last_name"
                                                        name="last_name"
                                                        value={data.last_name}
                                                        className={errors.last_name ? 'border-red-500' : ''}
                                                        autoComplete="family-name"
                                                        placeholder="Doe"
                                                        onChange={(e) => setData('last_name', e.target.value)}
                                                        required
                                                    />
                                                    {errors.last_name && (
                                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                                            <AlertCircle className="h-4 w-4" />
                                                            {errors.last_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="middle_name">Middle Name (Optional)</Label>
                                                <Input
                                                    id="middle_name"
                                                    name="middle_name"
                                                    value={data.middle_name}
                                                    autoComplete="additional-name"
                                                    placeholder="Optional"
                                                    onChange={(e) => setData('middle_name', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="suffix">Suffix (Optional)</Label>
                                                <Select value={data.suffix} onValueChange={(value) => setData('suffix', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="Jr.">Jr.</SelectItem>
                                                        <SelectItem value="Sr.">Sr.</SelectItem>
                                                        <SelectItem value="II">II</SelectItem>
                                                        <SelectItem value="III">III</SelectItem>
                                                        <SelectItem value="IV">IV</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                    <p className="text-sm font-medium text-blue-900">Your Email</p>
                                                </div>
                                                <p className="text-sm text-blue-700 font-mono">{data.email}</p>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button 
                                                    type="button"
                                                    variant="outline"
                                                    onClick={prevStep}
                                                    className="flex-1"
                                                >
                                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                                    Back
                                                </Button>
                                                <Button 
                                                    type="button"
                                                    onClick={nextStep}
                                                    disabled={!data.first_name || !data.last_name}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Continue
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: Password Setup */}
                                    {currentStep === 3 && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password</Label>
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
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        required
                                                        autoFocus
                                                    />
                                                </div>
                                                {errors.password && (
                                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        {errors.password}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Must be at least 8 characters long
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        id="password_confirmation"
                                                        type="password"
                                                        name="password_confirmation"
                                                        value={data.password_confirmation}
                                                        className={`pl-10 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                                                        autoComplete="new-password"
                                                        placeholder="••••••••"
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                {errors.password_confirmation && (
                                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="h-4 w-4" />
                                                        {errors.password_confirmation}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        <span className="text-green-800 font-medium">Name:</span>
                                                        <span className="text-green-700">{getFullName()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        <span className="text-green-800 font-medium">Email:</span>
                                                        <span className="text-green-700 font-mono text-xs">{data.email}</span>
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
                                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                                    Back
                                                </Button>
                                                <Button 
                                                    type="submit"
                                                    disabled={processing || !data.password || !data.password_confirmation}
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Creating Account...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Create Account
                                                            <CheckCircle2 className="h-4 w-4 ml-2" />
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                </form>

                                <div className="mt-6 text-center animate-fade-in">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{' '}
                                        <Link 
                                            href={route('login')} 
                                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                                        >
                                            Sign in
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