import React from 'react';
import { Clock, Shield, Smile, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import DemoSection from '../DemoSection';
import ScreenshotPlaceholder from '../ScreenshotPlaceholder';

export default function BusinessValueSection() {
    const metrics = [
        {
            icon: Clock,
            value: '90% Faster',
            description: 'Approvals complete in minutes, not days',
            color: 'blue',
        },
        {
            icon: Shield,
            value: '100% Compliance',
            description: 'GDPR, labor law, audit-ready always',
            color: 'green',
        },
        {
            icon: Smile,
            value: 'Higher Satisfaction',
            description: 'Employees love transparency and speed',
            color: 'yellow',
        },
        {
            icon: DollarSign,
            value: 'Reduced Workload',
            description: 'HR spends less time on manual tasks',
            color: 'green',
        },
    ];

    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        yellow: 'from-yellow-500 to-yellow-600',
    };

    return (
        <DemoSection
            id="business-value"
            title="Measurable ROI"
            backgroundColor="bg-white"
        >
            {/* Metric Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <motion.div
                        key={index}
                        className={`bg-gradient-to-br ${colorClasses[metric.color]} rounded-xl p-8 text-white text-center`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <metric.icon className="w-12 h-12 mx-auto mb-4" />
                        <div className="text-4xl font-bold mb-3">{metric.value}</div>
                        <div className="text-sm opacity-90">{metric.description}</div>
                    </motion.div>
                ))}
            </div>

            {/* Analytics Dashboard Screenshot */}
            <div className="mt-12 max-w-6xl mx-auto">
                <ScreenshotPlaceholder title="Analytics Dashboard" dimensions="1600x900" aspectRatio="wide" />
            </div>
        </DemoSection>
    );
}
