import React from 'react';
import { Check, Lock, Shield, FileText, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import DemoSection from '../DemoSection';
import FeatureCard from '../FeatureCard';
import ScreenshotPlaceholder from '../ScreenshotPlaceholder';

export default function DocumentSecuritySection() {
    return (
        <>
            {/* Section 7A: Security Overview */}
            <DemoSection
                id="security-overview"
                title="Document Security"
                subtitle="Enterprise-Grade Protection"
                backgroundColor="bg-gradient-to-br from-green-50 to-white"
            >
                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <FeatureCard
                        icon={Lock}
                        title="Encryption & Access"
                        color="green"
                        bullets={[
                            'AES-256 encryption at rest',
                            'Role-based access control (RBAC)',
                            '2FA for highly sensitive documents',
                        ]}
                    />
                    <FeatureCard
                        icon={FileText}
                        title="Audit & Compliance"
                        color="blue"
                        bullets={[
                            'Immutable audit trail (every access logged)',
                            '7-year retention for compliance',
                            'GDPR data export & anonymization',
                        ]}
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Three-Tier Classification"
                        color="yellow"
                        bullets={[
                            '🟢 Normal: Standard authentication',
                            '🟡 Sensitive: RBAC enforced',
                            '🔴 Highly Sensitive: 2FA required',
                        ]}
                    />
                    <FeatureCard
                        icon={Scale}
                        title="Legal Hold"
                        color="red"
                        bullets={[
                            'Prevent deletion during litigation',
                            'Survives retention policies',
                            'HR-controlled activation',
                        ]}
                    />
                </div>

                {/* Screenshots */}
                <div className="grid md:grid-cols-2 gap-6 mt-12">
                    <ScreenshotPlaceholder title="Document Upload Interface" dimensions="1000x700" />
                    <ScreenshotPlaceholder title="Access Audit Log" dimensions="1200x700" />
                </div>
            </DemoSection>

            {/* Section 7B: Employee Portal */}
            <DemoSection
                id="security-portal"
                subtitle="Secure Self-Service for Employees"
                backgroundColor="bg-white"
            >
                {/* Key Features */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {[
                        'Drag-and-drop upload with instant encryption',
                        'Track document status: Pending → Approved',
                        '2FA prompt for sensitive documents',
                        'GDPR data export: Download all your data anytime',
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

                {/* Use Cases */}
                <div className="mt-12 max-w-5xl mx-auto bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 border-2 border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Use Cases</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-4xl mb-3">📄</div>
                            <div className="font-semibold text-gray-900 mb-2">Onboarding Documents</div>
                            <div className="text-sm text-gray-600">Resumes, IDs, certificates encrypted on upload</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">🏥</div>
                            <div className="font-semibold text-gray-900 mb-2">Medical Records</div>
                            <div className="text-sm text-gray-600">2FA required, 15-min session timeout</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">⚖️</div>
                            <div className="font-semibold text-gray-900 mb-2">Litigation Support</div>
                            <div className="text-sm text-gray-600">Legal hold prevents deletion</div>
                        </div>
                    </div>
                </div>

                {/* Screenshot */}
                <div className="mt-12 max-w-5xl mx-auto">
                    <ScreenshotPlaceholder
                        title="Document Portal with Status Badges"
                        dimensions="1600x900"
                        aspectRatio="wide"
                    />
                </div>
            </DemoSection>
        </>
    );
}
