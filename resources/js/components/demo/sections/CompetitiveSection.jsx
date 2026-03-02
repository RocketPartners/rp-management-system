import React from 'react';
import { motion } from 'framer-motion';
import DemoSection from '../DemoSection';
import ScreenshotPlaceholder from '../ScreenshotPlaceholder';

export default function CompetitiveSection() {
    const comparison = [
        { traditional: 'Email approvals', ours: 'Automated workflows' },
        { traditional: 'Unencrypted files', ours: 'AES-256 encryption' },
        { traditional: 'Manual logs', ours: 'Immutable audit trail' },
        { traditional: 'No 2FA', ours: '2FA for sensitive docs' },
        { traditional: 'Spreadsheet tracking', ours: 'Real-time dashboards' },
    ];

    return (
        <DemoSection
            id="competitive"
            title="Why Choose Us?"
            backgroundColor="bg-gradient-to-br from-gray-50 to-white"
        >
            {/* Comparison Table */}
            <div className="max-w-5xl mx-auto">
                <motion.div
                    className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    {/* Table Header */}
                    <div className="grid grid-cols-2 bg-gray-100 border-b-2 border-gray-200">
                        <div className="p-6 text-center">
                            <h3 className="text-xl font-bold text-red-600">Traditional Systems</h3>
                        </div>
                        <div className="p-6 text-center border-l-2 border-gray-200">
                            <h3 className="text-xl font-bold text-green-600">Our System</h3>
                        </div>
                    </div>

                    {/* Table Rows */}
                    {comparison.map((row, index) => (
                        <motion.div
                            key={index}
                            className="grid grid-cols-2 border-b border-gray-200 last:border-b-0"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <div className="p-6 text-center text-lg text-gray-600 bg-red-50">
                                {row.traditional}
                            </div>
                            <div className="p-6 text-center text-lg font-semibold text-gray-900 bg-green-50 border-l-2 border-gray-200">
                                {row.ours}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Feature Matrix Screenshot */}
            <div className="mt-12 max-w-4xl mx-auto">
                <ScreenshotPlaceholder title="Feature Comparison Matrix" dimensions="1200x700" aspectRatio="wide" />
            </div>
        </DemoSection>
    );
}
