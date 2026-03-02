import React from 'react';
import { Check, CalendarDays, Filter, Eye, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import DemoSection from '../DemoSection';
import FeatureCard from '../FeatureCard';
import ScreenshotPlaceholder from '../ScreenshotPlaceholder';

export default function CalendarSection() {
    return (
        <>
            {/* Section 6A: Calendar Overview */}
            <DemoSection
                id="calendar-overview"
                title="Team Calendar & Visibility"
                subtitle="Unified View of All Events"
                backgroundColor="bg-gradient-to-br from-indigo-50 to-white"
            >
                {/* Key Features */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {[
                        'Leaves, holidays, and WFH events in one unified calendar',
                        'Multiple views: Month, Week, Day, List',
                        'Color-coded event types with interactive legend',
                        'Real-time updates via WebSocket notifications',
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start bg-white p-5 rounded-lg border border-indigo-200"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Check className="w-6 h-6 text-indigo-600 mr-4 mt-0.5 flex-shrink-0" />
                            <span className="text-lg text-gray-800">{feature}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Screenshots */}
                <div className="mt-12">
                    <ScreenshotPlaceholder
                        title="Calendar Month View with Multiple Event Types"
                        dimensions="1920x1080"
                        aspectRatio="wide"
                    />
                </div>
            </DemoSection>

            {/* Section 6B: Manager Tools */}
            <DemoSection
                id="calendar-features"
                subtitle="Planning & Coordination Tools"
                backgroundColor="bg-white"
            >
                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <FeatureCard
                        icon={Filter}
                        title="Smart Filters"
                        color="blue"
                        bullets={[
                            'Filter by department, user, event type',
                            'Date range selection',
                            'Hide/show specific event types',
                        ]}
                    />
                    <FeatureCard
                        icon={Eye}
                        title="Team Availability"
                        color="green"
                        bullets={[
                            "See who's available for meetings",
                            'Conflict detection for scheduling',
                            'Team capacity at a glance',
                        ]}
                    />
                    <FeatureCard
                        icon={CalendarDays}
                        title="Holiday Management"
                        color="yellow"
                        bullets={[
                            'Auto-fetch holidays from API (140+ countries)',
                            'Federal, state, regional holidays',
                            'Automatic exclusion from leave calculations',
                        ]}
                    />
                    <FeatureCard
                        icon={Download}
                        title="Export & Sync"
                        color="indigo"
                        bullets={[
                            'Export to Google Calendar',
                            'Export to Outlook',
                            'PDF report generation',
                        ]}
                    />
                </div>

                {/* Screenshots */}
                <div className="grid md:grid-cols-2 gap-6 mt-12">
                    <ScreenshotPlaceholder title="Filter Panel with Toggles" dimensions="1000x700" />
                    <ScreenshotPlaceholder title="Team Calendar Multi-User View" dimensions="1200x700" />
                </div>
            </DemoSection>
        </>
    );
}
