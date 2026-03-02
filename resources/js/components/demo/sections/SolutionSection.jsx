import React from 'react';
import { Users, Bot, ShieldCheck } from 'lucide-react';
import DemoSection from '../DemoSection';
import FeatureCard from '../FeatureCard';
import ScreenshotPlaceholder from '../ScreenshotPlaceholder';

export default function SolutionSection() {
    const pillars = [
        {
            icon: Users,
            title: 'Modern Workplace Support',
            color: 'blue',
            bullets: [
                'Office, remote, and hybrid work—all supported',
                'WFH scheduling with flexible patterns',
                'Unified calendar across all work arrangements',
                'Team coordination regardless of location',
            ],
        },
        {
            icon: Bot,
            title: 'Intelligent Automation',
            color: 'green',
            bullets: [
                'Automated leave and WFH workflows',
                'Smart conflict detection (holidays, quotas, capacity)',
                'Real-time notifications and updates',
                'Auto-fetch holidays from 140+ countries',
            ],
        },
        {
            icon: ShieldCheck,
            title: 'Security & Compliance',
            color: 'yellow',
            bullets: [
                'AES-256 encryption for sensitive documents',
                'Role-based access control (RBAC)',
                'Immutable audit trails for all actions',
                'GDPR-ready (data export, right to be forgotten)',
            ],
        },
    ];

    return (
        <DemoSection
            id="solution"
            title="Our Solution: Three Pillars"
            backgroundColor="bg-white"
        >
            {/* Three Pillar Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {pillars.map((pillar, index) => (
                    <FeatureCard
                        key={index}
                        icon={pillar.icon}
                        title={pillar.title}
                        bullets={pillar.bullets}
                        color={pillar.color}
                        delay={index * 0.1}
                    />
                ))}
            </div>

            {/* Architecture Diagram */}
            <div className="mt-12 max-w-5xl mx-auto">
                <ScreenshotPlaceholder
                    title="System Architecture"
                    dimensions="1600x900"
                    aspectRatio="wide"
                />
            </div>
        </DemoSection>
    );
}
