import React from 'react';
import { Check, Calendar, Target, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import DemoSection from '../DemoSection';
import FeatureCard from '../FeatureCard';
import ScreenshotPlaceholder from '../ScreenshotPlaceholder';

export default function WFHSchedulerSection() {
    return (
        <>
            {/* Section 5A: WFH Overview */}
            <DemoSection
                id="wfh-overview"
                title="Work From Home Scheduler"
                subtitle="Flexible Hybrid Work Management"
                backgroundColor="bg-gradient-to-br from-purple-50 to-white"
            >
                {/* Key Features */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {[
                        'Month-specific recurring patterns (e.g., Mon/Wed for Feb, Tue/Thu for Mar)',
                        'One-time date selection for ad-hoc flexibility',
                        'Weekly quota tracking (default 2 days/week)',
                        'Real-time pattern preview before scheduling',
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start bg-white p-5 rounded-lg border border-purple-200"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Check className="w-6 h-6 text-purple-600 mr-4 mt-0.5 flex-shrink-0" />
                            <span className="text-lg text-gray-800">{feature}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Screenshots */}
                <div className="grid md:grid-cols-2 gap-6 mt-12">
                    <ScreenshotPlaceholder title="WFH Scheduling Modal" dimensions="1000x800" />
                    <ScreenshotPlaceholder title="Weekly Quota Display" dimensions="800x600" />
                </div>
            </DemoSection>

            {/* Section 5B: Smart Features */}
            <DemoSection
                id="wfh-features"
                subtitle="Intelligent Automation & Integration"
                backgroundColor="bg-white"
            >
                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <FeatureCard
                        icon={Calendar}
                        title="Calendar Integration"
                        color="blue"
                        bullets={[
                            'Blue-themed WFH events on team calendar',
                            'Visibility for managers and team members',
                            'Export to Google Calendar/Outlook',
                        ]}
                    />
                    <FeatureCard
                        icon={Target}
                        title="Conflict Detection"
                        color="yellow"
                        bullets={[
                            'Weekend blocking (Sat/Sun validation)',
                            'Quota enforcement (prevent over-scheduling)',
                            'Holiday exclusion automatically',
                        ]}
                    />
                    <FeatureCard
                        icon={Clock}
                        title="Flexible Patterns"
                        color="green"
                        bullets={[
                            'Recurring: Same days every week',
                            'Month-specific: Different days per month',
                            'One-time: Ad-hoc date selection',
                        ]}
                    />
                    <FeatureCard
                        icon={Users}
                        title="Team Coordination"
                        color="purple"
                        bullets={[
                            'See who else is WFH on selected dates',
                            'Manager approval workflow (optional)',
                            'Real-time schedule updates',
                        ]}
                    />
                </div>

                {/* Calendar View Screenshot */}
                <div className="mt-12 max-w-5xl mx-auto">
                    <ScreenshotPlaceholder
                        title="Calendar View with WFH Events (Blue)"
                        dimensions="1600x900"
                        aspectRatio="wide"
                    />
                </div>
            </DemoSection>
        </>
    );
}
