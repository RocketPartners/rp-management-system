/**
 * PersonalInfoForm - Step 1 of onboarding process
 * Collects personal information including name, birthday, gender, contact details, and address
 */

import React from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { UserPlus, ChevronRight, Loader2 } from 'lucide-react';
import {
    SUFFIX_OPTIONS,
    GENDER_OPTIONS,
    CIVIL_STATUS_OPTIONS,
} from '@/lib/constants/onboarding/selectOptions';
import { BRAND_CLASSES } from '@/lib/constants/theme';

/**
 * PersonalInfoForm component
 *
 * @param {Object} props
 * @param {Object} props.form - Inertia form instance
 * @param {Function} props.onNext - Handler for moving to next step
 * @returns {JSX.Element}
 */
export const PersonalInfoForm = ({ form, onNext }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <Card className="animate-fade-in">
            <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${BRAND_CLASSES.textPrimary}`}>
                    <UserPlus className="h-5 w-5" />
                    Personal Information
                </CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>First Name *</Label>
                            <Input
                                value={form.data.first_name}
                                onChange={(e) => form.setData('first_name', e.target.value)}
                                placeholder="John"
                                className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Middle Name</Label>
                            <Input
                                value={form.data.middle_name}
                                onChange={(e) => form.setData('middle_name', e.target.value)}
                                placeholder="Michael"
                                className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name *</Label>
                            <Input
                                value={form.data.last_name}
                                onChange={(e) => form.setData('last_name', e.target.value)}
                                placeholder="Doe"
                                className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                                required
                            />
                        </div>
                    </div>

                    {/* Suffix, Birthday, Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Suffix</Label>
                            <Select
                                value={form.data.suffix}
                                onValueChange={(value) => form.setData('suffix', value)}
                            >
                                <SelectTrigger className="focus:ring-[#2596be]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SUFFIX_OPTIONS.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Birthday *</Label>
                            <Input
                                type="date"
                                value={form.data.birthday}
                                onChange={(e) => form.setData('birthday', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Gender *</Label>
                            <Select
                                value={form.data.gender}
                                onValueChange={(value) => form.setData('gender', value)}
                            >
                                <SelectTrigger className="focus:ring-[#2596be]">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {GENDER_OPTIONS.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Civil Status */}
                    <div className="space-y-2">
                        <Label>Civil Status</Label>
                        <Select
                            value={form.data.civil_status}
                            onValueChange={(value) => form.setData('civil_status', value)}
                        >
                            <SelectTrigger className="focus:ring-[#2596be]">
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                {CIVIL_STATUS_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phone Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Phone Number *</Label>
                            <Input
                                type="tel"
                                value={form.data.phone_number}
                                onChange={(e) => form.setData('phone_number', e.target.value)}
                                placeholder="09XX XXX XXXX"
                                className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mobile Number</Label>
                            <Input
                                type="tel"
                                value={form.data.mobile_number}
                                onChange={(e) => form.setData('mobile_number', e.target.value)}
                                placeholder="09XX XXX XXXX"
                                className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                            />
                        </div>
                    </div>

                    {/* Address Fields */}
                    <div className="space-y-2">
                        <Label>Address Line 1 *</Label>
                        <Input
                            value={form.data.address_line_1}
                            onChange={(e) => form.setData('address_line_1', e.target.value)}
                            placeholder="House/Unit No., Street Name"
                            className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Address Line 2</Label>
                        <Input
                            value={form.data.address_line_2}
                            onChange={(e) => form.setData('address_line_2', e.target.value)}
                            placeholder="Barangay, Subdivision"
                            className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>City *</Label>
                            <Input
                                value={form.data.city}
                                onChange={(e) => form.setData('city', e.target.value)}
                                placeholder="Quezon City"
                                className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Province/State</Label>
                            <Input
                                value={form.data.state}
                                onChange={(e) => form.setData('state', e.target.value)}
                                placeholder="Metro Manila"
                                className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input
                                value={form.data.postal_code}
                                onChange={(e) => form.setData('postal_code', e.target.value)}
                                placeholder="1100"
                                className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className={BRAND_CLASSES.buttonPrimary}
                        >
                            {form.processing ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                            ) : (
                                <>Save & Continue<ChevronRight className="h-4 w-4 ml-2" /></>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default PersonalInfoForm;
