import React from 'react';
import { Check, Target, Calendar, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import DemoSection from '../DemoSection';
import FeatureCard from '../FeatureCard';
import ScreenshotPlaceholder from '../ScreenshotPlaceholder';

export default function LeaveManagementSection() {
    return (
        <>
            {/* Section 4A: Employee View */}
            <DemoSection
                id="leave-employee"
                title="Leave Management"
                subtitle="For Employees: Simple & Transparent"
                backgroundColor="bg-gradient-to-br from-blue-50 to-white"
            >
                {/* Employee Features */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {[
                        'Visual balance cards with real-time updates',
                        'One-click application with instant validation',
                        'Track status: Pending → Approved → Confirmed',
                        'Mobile-friendly interface',
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start bg-white p-5 rounded-lg border border-blue-200"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Check className="w-6 h-6 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
                            <span className="text-lg text-gray-800">{feature}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Screenshots */}
                <div className="grid md:grid-cols-2 gap-6 mt-12">
                    <ScreenshotPlaceholder title="Leave Balance Cards" dimensions="800x600" />
                    <ScreenshotPlaceholder title="Application Form" dimensions="1000x800" />
                </div>
                <div className="mt-6">
                    <ScreenshotPlaceholder title="Request History Table" dimensions="1200x600" aspectRatio="wide" />
                </div>
            </DemoSection>

            {/* Section 4B: Manager View */}
            <DemoSection
                id="leave-manager"
                subtitle="For Managers: Quick Decisions"
                backgroundColor="bg-white"
            >
                {/* Manager Features */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {[
                        'Smart queue shows only relevant approvals',
                        'See employee balance and team calendar',
                        'Approve/reject with optional comments',
                        'Auto-routing to HR when needed',
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start bg-green-50 p-5 rounded-lg border border-green-200"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Check className="w-6 h-6 text-green-600 mr-4 mt-0.5 flex-shrink-0" />
                            <span className="text-lg text-gray-800">{feature}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Screenshots */}
                <div className="grid md:grid-cols-2 gap-6 mt-12">
                    <ScreenshotPlaceholder title="Pending Approvals Queue" dimensions="1200x800" />
                    <ScreenshotPlaceholder title="Team Calendar with Leaves" dimensions="1600x900" aspectRatio="wide" />
                </div>
            </DemoSection>

            {/* Section 4C: HR Dashboard */}
            <DemoSection
                id="leave-hr"
                subtitle="For HR: Complete Control"
                backgroundColor="bg-gray-50"
            >
                {/* HR Features */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {[
                        'All leaves across departments',
                        'Adjust balances with audit trail',
                        'Configure leave types and policies',
                        'Annual carry-over automation',
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start bg-white p-5 rounded-lg border border-yellow-200"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Check className="w-6 h-6 text-yellow-600 mr-4 mt-0.5 flex-shrink-0" />
                            <span className="text-lg text-gray-800">{feature}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Screenshot */}
                <div className="mt-12">
                    <ScreenshotPlaceholder title="HR Admin Dashboard" dimensions="1920x1080" aspectRatio="wide" />
                </div>
            </DemoSection>

            {/* Section 4D: Smart Features */}
            <DemoSection
                id="leave-features"
                subtitle="Intelligent Automation"
                backgroundColor="bg-white"
            >
                {/* Smart Feature Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <FeatureCard
                        icon={Target}
                        title="Dynamic Workflows"
                        color="blue"
                        bullets={[
                            'Auto-approval for simple requests',
                            'Manager-only or manager→HR routing',
                            'Based on leave type configuration',
                        ]}
                    />
                    <FeatureCard
                        icon={Calendar}
                        title="Calendar Integration"
                        color="green"
                        bullets={[
                            'Visual team availability',
                            'Conflict detection',
                            'Export to personal calendar',
                        ]}
                    />
                    <FeatureCard
                        icon={RefreshCw}
                        title="Flexible Cancellation"
                        color="yellow"
                        bullets={[
                            'Instant cancel pending requests',
                            'Request cancel approved leaves',
                            'Automatic balance restore',
                        ]}
                    />
                    <FeatureCard
                        icon={Zap}
                        title="Real-Time Updates"
                        color="blue"
                        bullets={[
                            'Balances update instantly',
                            'Email notifications',
                            'Mobile alerts',
                        ]}
                    />
                </div>

                {/* Workflow Diagram */}
                <div className="mt-12 max-w-5xl mx-auto">
                    <ScreenshotPlaceholder title="Approval Workflow Diagram" dimensions="1400x800" aspectRatio="wide" />
                </div>
            </DemoSection>
        </>
    );
}
