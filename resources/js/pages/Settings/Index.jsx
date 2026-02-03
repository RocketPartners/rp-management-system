// resources/js/Pages/Settings/AccountSettings.jsx
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    Camera,
    CheckCircle2,
    Lock,
    Settings,
    User as UserIcon,
} from 'lucide-react';
import { useState } from 'react';

export default function AccountSettings({ auth, mustVerifyEmail, status }) {
    // Form for updating profile information
    const {
        data: profileData,
        setData: setProfileData,
        post: postProfile,
        processing: processingProfile,
        errors: profileErrors,
        recentlySuccessful: profileSuccess,
    } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        profile_picture: null,
    });

    // Form for updating password
    const {
        data: passwordData,
        setData: setPasswordData,
        put: putPassword,
        processing: processingPassword,
        errors: passwordErrors,
        reset: resetPassword,
        recentlySuccessful: passwordSuccess,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [previewUrl, setPreviewUrl] = useState(null);

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        postProfile(route('settings.update-profile'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        putPassword(route('settings.update-password'), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData('profile_picture', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getProfileDisplay = () => {
        if (previewUrl) {
            return previewUrl;
        }
        if (auth.user.profile_picture) {
            return `/storage/${auth.user.profile_picture}`;
        }
        return null;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Settings className="h-8 w-8 text-gray-700" />
                    <h2 className="text-3xl font-bold text-gray-900">
                        Account Settings
                    </h2>
                </div>
            }
        >
            <Head title="Account Settings" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Status Messages */}
                {status === 'verification-link-sent' && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                            A new verification link has been sent to your email
                            address.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>
                            Update your account's profile information and email
                            address.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleProfileSubmit}
                            className="space-y-6"
                        >
                            {/* Profile Picture */}
                            <div>
                                <Label>Profile Picture</Label>
                                <div className="mt-2 flex items-center gap-6">
                                    {getProfileDisplay() ? (
                                        <img
                                            src={getProfileDisplay()}
                                            alt="Profile"
                                            className="h-20 w-20 rounded-full border-2 border-gray-200 object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-200 bg-blue-600">
                                            <span className="text-2xl font-medium text-white">
                                                {auth.user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            id="profile_picture"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        'profile_picture',
                                                    )
                                                    .click()
                                            }
                                        >
                                            <Camera className="mr-2 h-4 w-4" />
                                            Choose Photo
                                        </Button>
                                        <p className="mt-1 text-sm text-gray-500">
                                            JPG, PNG or GIF. Max size 2MB.
                                        </p>
                                    </div>
                                </div>
                                {profileErrors.profile_picture && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {profileErrors.profile_picture}
                                    </p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) =>
                                        setProfileData('name', e.target.value)
                                    }
                                    className="mt-1"
                                    required
                                />
                                {profileErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {profileErrors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) =>
                                        setProfileData('email', e.target.value)
                                    }
                                    className="mt-1"
                                    required
                                />
                                {profileErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {profileErrors.email}
                                    </p>
                                )}

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="mt-2">
                                            <Alert className="border-yellow-200 bg-yellow-50">
                                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                <AlertDescription className="text-yellow-700">
                                                    Your email address is
                                                    unverified.
                                                    <Button
                                                        variant="link"
                                                        className="ml-1 h-auto p-0 text-yellow-700 underline"
                                                        onClick={() =>
                                                            postProfile(
                                                                route(
                                                                    'verification.send',
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        Click here to re-send
                                                        the verification email.
                                                    </Button>
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={processingProfile}
                                >
                                    {processingProfile
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </Button>

                                {profileSuccess && (
                                    <p className="flex items-center gap-1 text-sm text-green-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Saved successfully
                                    </p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Update Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Update Password
                        </CardTitle>
                        <CardDescription>
                            Ensure your account is using a long, random password
                            to stay secure.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handlePasswordSubmit}
                            className="space-y-6"
                        >
                            {/* Current Password */}
                            <div>
                                <Label htmlFor="current_password">
                                    Current Password
                                </Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={(e) =>
                                        setPasswordData(
                                            'current_password',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1"
                                    autoComplete="current-password"
                                />
                                {passwordErrors.current_password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {passwordErrors.current_password}
                                    </p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={passwordData.password}
                                    onChange={(e) =>
                                        setPasswordData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1"
                                    autoComplete="new-password"
                                />
                                {passwordErrors.password && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {passwordErrors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <Label htmlFor="password_confirmation">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) =>
                                        setPasswordData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1"
                                    autoComplete="new-password"
                                />
                                {passwordErrors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {passwordErrors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    disabled={processingPassword}
                                >
                                    {processingPassword
                                        ? 'Updating...'
                                        : 'Update Password'}
                                </Button>

                                {passwordSuccess && (
                                    <p className="flex items-center gap-1 text-sm text-green-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Password updated
                                    </p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Delete Account Section (Optional) */}
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600">
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Permanently delete your account and all associated
                            data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-4 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-700">
                                Once your account is deleted, all of its
                                resources and data will be permanently deleted.
                                Before deleting your account, please download
                                any data or information that you wish to retain.
                            </AlertDescription>
                        </Alert>
                        <Button variant="destructive">Delete Account</Button>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
