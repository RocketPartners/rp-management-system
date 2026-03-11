import React from 'react';
import { Check, Shield, FileText, Scale, Clock } from 'lucide-react';
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
                title="Document Security & Compliance"
                subtitle="Robust Protection and Audit Controls"
                backgroundColor="bg-gradient-to-br from-green-50 to-white"
            >
                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <FeatureCard
                        icon={FileText}
                        title="Immutable Audit Trail"
                        color="blue"
                        bullets={[
                            'Every document access logged automatically',
                            'Tracks: upload, view, download, replace, delete',
                            'Captures user ID, IP address, timestamp',
                            'Write-once logs—cannot be modified',
                        ]}
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Role-Based Access Control"
                        color="green"
                        bullets={[
                            'HR/Admin: Full document access',
                            'Managers: Team documents only',
                            'Employees: Own documents only',
                            'Enforced at controller and policy level',
                        ]}
                    />
                    <FeatureCard
                        icon={Clock}
                        title="7-Year Retention Policy"
                        color="yellow"
                        bullets={[
                            'Compliant with Philippine labor law',
                            'Automatic cleanup after retention period',
                            'Legal hold overrides retention',
                            'Configurable per document type',
                        ]}
                    />
                    <FeatureCard
                        icon={Scale}
                        title="Legal Hold System"
                        color="red"
                        bullets={[
                            'Prevent deletion during litigation',
                            'HR-controlled activation with reason',
                            'Survives all retention policies',
                            'Tracked in audit logs',
                        ]}
                    />
                </div>

                {/* Additional Features */}
                <div className="mt-12 max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 border-2 border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Additional Compliance Features</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start">
                            <Check className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="font-semibold text-gray-900">Three-Tier Classification</div>
                                <div className="text-sm text-gray-600 mt-1">Normal, Sensitive, Highly Sensitive document levels</div>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Check className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="font-semibold text-gray-900">User Anonymization</div>
                                <div className="text-sm text-gray-600 mt-1">GDPR compliance for terminated employees</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Screenshots */}
                <div className="grid md:grid-cols-2 gap-6 mt-12">
                    <ScreenshotPlaceholder title="Document Upload Interface" dimensions="1000x700" />
                    <ScreenshotPlaceholder title="Audit Trail Command Output" dimensions="1200x700" />
                </div>
            </DemoSection>

            {/* Section 7B: Employee Portal */}
            <DemoSection
                id="security-portal"
                subtitle="Secure Document Management"
                backgroundColor="bg-white"
            >
                {/* Key Features */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {[
                        'Drag-and-drop upload with automatic classification',
                        'Track document status: Uploaded → Approved/Rejected',
                        'Document replacement preserves audit history',
                        'Legal hold protection prevents accidental deletion',
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
                            <div className="text-sm text-gray-600">Resumes, IDs, certificates with full audit trail</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">🔍</div>
                            <div className="font-semibold text-gray-900 mb-2">Compliance Audits</div>
                            <div className="text-sm text-gray-600">Complete access history for regulators</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">⚖️</div>
                            <div className="font-semibold text-gray-900 mb-2">Litigation Support</div>
                            <div className="text-sm text-gray-600">Legal hold prevents document deletion</div>
                        </div>
                    </div>
                </div>

                {/* Screenshot */}
                <div className="mt-12 max-w-5xl mx-auto">
                    <ScreenshotPlaceholder
                        title="Document Portal with Audit Trail"
                        dimensions="1600x900"
                        aspectRatio="wide"
                    />
                </div>
            </DemoSection>
        </>
    );
}
