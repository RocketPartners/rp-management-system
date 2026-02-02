/**
 * GovernmentIdForm - Step 2 of onboarding process
 * Collects government-issued identification numbers (SSS, TIN, HDMF, PhilHealth)
 */

import React from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { CreditCard, ChevronRight, ChevronLeft, Loader2, Info } from 'lucide-react';
import { BRAND_CLASSES } from '@/lib/constants/theme';

/**
 * GovernmentIdForm component
 *
 * @param {Object} props
 * @param {Object} props.form - Inertia form instance
 * @param {Function} props.onNext - Handler for moving to next step
 * @param {Function} props.onBack - Handler for going back to previous step
 * @returns {JSX.Element}
 */
export const GovernmentIdForm = ({ form, onNext, onBack }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onNext();
    };

    return (
        <Card className="animate-fade-in">
            <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${BRAND_CLASSES.textPrimary}`}>
                    <CreditCard className="h-5 w-5" />
                    Government IDs
                </CardTitle>
                <CardDescription>Provide your government-issued identification numbers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Alert className="border-[#2596be] bg-blue-50">
                        <Info className="h-4 w-4 text-[#2596be]" />
                        <AlertDescription className="text-blue-800">
                            <strong>Note:</strong> All fields are optional. You can provide these details later if you don't have them yet.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="sss_number">SSS Number</Label>
                        <Input
                            id="sss_number"
                            value={form.data.sss_number}
                            onChange={(e) => form.setData('sss_number', e.target.value)}
                            placeholder="XX-XXXXXXX-X"
                            maxLength={15}
                            className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                        />
                        <p className="text-xs text-gray-500">Format: XX-XXXXXXX-X (10 digits)</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tin_number">TIN Number</Label>
                        <Input
                            id="tin_number"
                            value={form.data.tin_number}
                            onChange={(e) => form.setData('tin_number', e.target.value)}
                            placeholder="XXX-XXX-XXX-XXX"
                            maxLength={20}
                            className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                        />
                        <p className="text-xs text-gray-500">Tax Identification Number</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hdmf_number">HDMF / Pag-IBIG Number</Label>
                        <Input
                            id="hdmf_number"
                            value={form.data.hdmf_number}
                            onChange={(e) => form.setData('hdmf_number', e.target.value)}
                            placeholder="XXXXXXXXXXXX"
                            maxLength={12}
                            className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                        />
                        <p className="text-xs text-gray-500">12 digits</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="philhealth_number">PhilHealth Number</Label>
                        <Input
                            id="philhealth_number"
                            value={form.data.philhealth_number}
                            onChange={(e) => form.setData('philhealth_number', e.target.value)}
                            placeholder="XXXX-XXXXX-XX"
                            maxLength={15}
                            className="focus:ring-[#2596be] focus:border-[#2596be]" /* Using inline value for Tailwind JIT */
                        />
                        <p className="text-xs text-gray-500">Format: XXXX-XXXXX-XX</p>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
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

export default GovernmentIdForm;
