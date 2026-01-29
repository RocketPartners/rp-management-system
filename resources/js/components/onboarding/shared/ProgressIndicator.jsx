/**
 * ProgressIndicator - Multi-step progress visualization
 * Shows current step, completed steps, and overall progress
 */

import { Card, CardContent } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import {
    CheckCircle2,
    CreditCard,
    FileText,
    Phone,
    UserPlus,
} from 'lucide-react';
import React from 'react';

const STEP_ICONS = {
    1: UserPlus,
    2: CreditCard,
    3: Phone,
    4: FileText,
};

const STEP_TITLES = {
    1: 'Personal Info',
    2: 'Government IDs',
    3: 'Emergency Contact',
    4: 'Documents',
};

/**
 * ProgressIndicator component
 *
 * @param {Object} props
 * @param {number} props.currentStep - Current active step (1-4)
 * @param {number} props.totalSteps - Total number of steps (default: 4)
 * @returns {JSX.Element}
 */
export const ProgressIndicator = React.memo(
    ({ currentStep, totalSteps = 4 }) => {
        const steps = Array.from({ length: totalSteps }, (_, i) => ({
            number: i + 1,
            title: STEP_TITLES[i + 1],
            icon: STEP_ICONS[i + 1],
        }));

        return (
            <Card className="animate-fade-in animation-delay-100">
                <CardContent className="pt-6">
                    <div className="mb-4 flex items-center justify-between">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;

                            return (
                                <div
                                    key={step.number}
                                    className="flex flex-1 items-center"
                                >
                                    <div className="flex flex-1 flex-col items-center">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                                                isCompleted
                                                    ? 'border-green-600 bg-green-600'
                                                    : isActive
                                                      ? 'border-green-500 bg-green-500'
                                                      : 'border-gray-300 bg-gray-100'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-6 w-6 text-white" />
                                            ) : (
                                                <StepIcon
                                                    className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400'}`}
                                                />
                                            )}
                                        </div>
                                        <p
                                            className={`mt-2 text-sm font-medium ${
                                                isActive
                                                    ? 'text-green-600'
                                                    : isCompleted
                                                      ? 'text-green-600'
                                                      : 'text-gray-500'
                                            }`}
                                        >
                                            {step.title}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`mx-4 h-0.5 flex-1 ${
                                                isCompleted
                                                    ? 'bg-green-600'
                                                    : 'bg-gray-200'
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <Progress
                        value={(currentStep / totalSteps) * 100}
                        className="h-2 [&>[data-slot=progress-indicator]]:bg-green-600"
                    />
                </CardContent>
            </Card>
        );
    },
);

ProgressIndicator.displayName = 'ProgressIndicator';

export default ProgressIndicator;
