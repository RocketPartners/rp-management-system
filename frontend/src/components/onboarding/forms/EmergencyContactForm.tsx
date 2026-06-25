/**
 * EmergencyContactForm - Step 3 of onboarding process
 * Collects emergency contact information
 */

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RELATIONSHIP_OPTIONS } from '@/lib/constants/onboarding/selectOptions';
import { BRAND_CLASSES } from '@/lib/constants/theme';
import type {
    EmergencyContactFormData,
    FormState,
} from '@/types/onboarding';
import { ChevronLeft, ChevronRight, Loader2, Phone } from 'lucide-react';
import type React from 'react';

interface EmergencyContactFormProps {
    /** Form state instance for emergency contact. */
    form: FormState<EmergencyContactFormData>;
    /** Handler for moving to the next step. */
    onNext: () => void;
    /** Handler for going back to the previous step. */
    onBack: () => void;
}

/** Step 3 of onboarding — collects emergency contact information. */
export const EmergencyContactForm = ({
    form,
    onNext,
    onBack,
}: EmergencyContactFormProps) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <Card className="animate-fade-in">
            <CardHeader>
                <CardTitle
                    className={`flex items-center gap-2 ${BRAND_CLASSES.textPrimary}`}
                >
                    <Phone className="h-5 w-5" />
                    Emergency Contact
                </CardTitle>
                <CardDescription>
                    Who should we contact in case of emergency?
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="emergency_name">Contact Name *</Label>
                        <Input
                            id="emergency_name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="Jane Doe"
                            className="focus:border-[#2596be] focus:ring-[#2596be]" /* Using inline value for Tailwind JIT */
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="emergency_phone">
                                Phone Number *
                            </Label>
                            <Input
                                id="emergency_phone"
                                type="tel"
                                value={form.data.phone}
                                onChange={(e) =>
                                    form.setData('phone', e.target.value)
                                }
                                placeholder="09XX XXX XXXX"
                                className="focus:border-[#2596be] focus:ring-[#2596be]" /* Using inline value for Tailwind JIT */
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergency_mobile">
                                Mobile Number
                            </Label>
                            <Input
                                id="emergency_mobile"
                                type="tel"
                                value={form.data.mobile}
                                onChange={(e) =>
                                    form.setData('mobile', e.target.value)
                                }
                                placeholder="09XX XXX XXXX"
                                className="focus:border-[#2596be] focus:ring-[#2596be]" /* Using inline value for Tailwind JIT */
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="relationship">Relationship *</Label>
                        <Select
                            value={form.data.relationship}
                            onValueChange={(value) =>
                                form.setData('relationship', value)
                            }
                        >
                            <SelectTrigger className="focus:ring-[#2596be]">
                                <SelectValue placeholder="Select relationship..." />
                            </SelectTrigger>
                            <SelectContent>
                                {RELATIONSHIP_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className={BRAND_CLASSES.buttonPrimary}
                        >
                            {form.processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Save & Continue
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default EmergencyContactForm;
