import React from 'react';
import { Bot, Shield, BarChart3 } from 'lucide-react';
import DemoSection from '../DemoSection';
import FeatureCard from '../FeatureCard';
import ScreenshotPlaceholder from '../ScreenshotPlaceholder';

export default function SolutionSection() {
    const pillars = [
        {
            icon: Bot,
            title: 'Intelligent Automation',
            color: 'blue',
            bullets: [
                'Dynamic approval workflows',
                'Real-time balance validation',
                'Automated compliance tracking',
                'Calendar integration',
            ],
        },
        {
            icon: Shield,
            title: 'Enterprise Security',
            color: 'green',
            bullets: [
                'AES-256 encryption at rest',
                'Role-based access control',
                'Two-factor authentication',
                'Immutable audit logs',
            ],
        },
        {
            icon: BarChart3,
            title: 'Complete Visibility',
            color: 'yellow',
            bullets: [
                'Real-time dashboards',
                'Team calendar views',
                'Compliance reporting',
                'Historical analytics',
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
