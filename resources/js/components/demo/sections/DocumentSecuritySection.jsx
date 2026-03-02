import React from 'react';
import { Check, DoorOpen, Lock, FileText, KeyRound, Scale, Upload, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import DemoSection from '../DemoSection';
import ScreenshotPlaceholder from '../ScreenshotPlaceholder';

export default function DocumentSecuritySection() {
    return (
        <>
            {/* Section 5A: Security Overview */}
            <DemoSection
                id="security-overview"
                title="Document Security"
                subtitle="Multi-Layer Document Protection"
                backgroundColor="bg-gradient-to-br from-green-50 to-white"
            >
                {/* Security Layers */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {[
                        { icon: DoorOpen, label: 'Access Control', desc: 'Only HR and document owner can view' },
                        { icon: Lock, label: 'Encryption (AES-256)', desc: 'Files encrypted at rest, unreadable if stolen' },
                        { icon: FileText, label: 'Audit Trail', desc: 'Every access logged with IP, device, timestamp' },
                        { icon: KeyRound, label: '2FA Protection', desc: 'Required for highly sensitive documents' },
                        { icon: Scale, label: 'Legal Hold', desc: 'Prevents deletion for litigation support' },
                    ].map((layer, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start bg-white p-6 rounded-lg border-2 border-green-200"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <layer.icon className="w-8 h-8 text-green-600 mr-4 flex-shrink-0" />
                            <div>
                                <div className="font-semibold text-lg text-gray-900">Layer {index + 1}: {layer.label}</div>
                                <div className="text-gray-700 mt-1">{layer.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Security Architecture */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <ScreenshotPlaceholder title="Security Layers Diagram" dimensions="1200x900" />
                </div>
            </DemoSection>

            {/* Section 5B: Employee Portal */}
            <DemoSection
                id="security-portal"
                subtitle="For Employees: Your Data, Protected"
                backgroundColor="bg-white"
            >
                {/* Portal Features */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {[
                        'Drag-and-drop upload with instant encryption',
                        'Track document status: Pending → Approved',
                        '2FA prompt for sensitive documents',
                        'Export all your data anytime (GDPR)',
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start bg-blue-50 p-5 rounded-lg border border-blue-200"
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
                    <ScreenshotPlaceholder title="Upload Interface" dimensions="1000x700" />
                    <ScreenshotPlaceholder title="Document List with Badges" dimensions="1200x600" />
                </div>
            </DemoSection>

            {/* Section 5C: Sensitivity Levels */}
            <DemoSection
                id="security-sensitivity"
                subtitle="Three-Tier Classification"
                backgroundColor="bg-gray-50"
            >
                {/* Sensitivity Tiers */}
                <div className="grid md:grid-cols-3 gap-6">
                    <motion.div
                        className="bg-green-50 border-2 border-green-200 rounded-xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-4 h-4 rounded-full bg-green-500 mr-3" />
                            <h3 className="text-2xl font-bold text-green-700">Normal</h3>
                        </div>
                        <div className="space-y-3 text-gray-700">
                            <p className="text-lg">Resume, certificates</p>
                            <p className="text-sm">Standard authentication required</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-3" />
                            <h3 className="text-2xl font-bold text-yellow-700">Sensitive</h3>
                        </div>
                        <div className="space-y-3 text-gray-700">
                            <p className="text-lg">Government IDs, contracts</p>
                            <p className="text-sm">Role-based access control</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-red-50 border-2 border-red-200 rounded-xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-4 h-4 rounded-full bg-red-500 mr-3" />
                            <h3 className="text-2xl font-bold text-red-700">Highly Sensitive</h3>
                        </div>
                        <div className="space-y-3 text-gray-700">
                            <p className="text-lg">Medical records, financial data</p>
                            <p className="text-sm">2FA required, 15-min session timeout</p>
                        </div>
                    </motion.div>
                </div>

                {/* Classification Table */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <ScreenshotPlaceholder title="Classification Table" dimensions="1000x600" />
                </div>
            </DemoSection>

            {/* Section 5D: Audit Trail */}
            <DemoSection
                id="security-audit"
                subtitle="Complete Transparency"
                backgroundColor="bg-white"
            >
                {/* Audit Features */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {[
                        'Every view, download, approval logged',
                        'IP address, device, timestamp captured',
                        'Immutable logs (cannot be modified)',
                        '7-year retention for compliance',
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start bg-blue-50 p-5 rounded-lg border border-blue-200"
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

                {/* Access Log Screenshot */}
                <div className="mt-12 max-w-5xl mx-auto">
                    <ScreenshotPlaceholder title="Access Log Table" dimensions="1400x700" aspectRatio="wide" />
                </div>
            </DemoSection>

            {/* Section 5E: Compliance */}
            <DemoSection
                id="security-compliance"
                subtitle="Legal & Regulatory Compliance"
                backgroundColor="bg-gray-50"
            >
                {/* Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Legal Hold */}
                    <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Legal Hold System</h3>
                        <ul className="space-y-3 text-lg text-gray-700">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Protection from deletion</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Survives retention policies</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Active litigation support</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>HR-controlled activation</span>
                            </li>
                        </ul>
                    </div>

                    {/* GDPR Compliance */}
                    <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">GDPR Compliance</h3>
                        <ul className="space-y-3 text-lg text-gray-700">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Data export (Article 20)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Right to be forgotten (Article 17)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Anonymization on demand</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>7-year retention</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Screenshots */}
                <div className="grid md:grid-cols-2 gap-6 mt-12">
                    <ScreenshotPlaceholder title="Legal Hold Dialog" dimensions="800x500" />
                    <ScreenshotPlaceholder title="Data Export Interface" dimensions="900x600" />
                </div>
            </DemoSection>
        </>
    );
}
