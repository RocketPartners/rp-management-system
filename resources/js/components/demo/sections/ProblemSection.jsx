import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import DemoSection from '../DemoSection';
import ScreenshotPlaceholder from '../ScreenshotPlaceholder';

export default function ProblemSection() {
    const problems = [
        'Manual leave tracking in spreadsheets',
        'Unencrypted documents on shared drives',
        'Email chains for approvals create delays',
        'No audit trail for compliance',
        'No visibility into team availability',
        'Complex workflows confuse employees',
    ];

    return (
        <DemoSection
            id="problem"
            title="Traditional HR Systems Are Broken"
            backgroundColor="bg-gray-50"
        >
            {/* Problem List */}
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {problems.map((problem, index) => (
                    <motion.div
                        key={index}
                        className="flex items-start bg-white p-6 rounded-lg border-2 border-red-200"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <X className="w-6 h-6 text-red-600 mr-4 mt-1 flex-shrink-0" />
                        <span className="text-lg text-gray-800">{problem}</span>
                    </motion.div>
                ))}
            </div>

            {/* Before State Screenshot */}
            <div className="mt-12 max-w-4xl mx-auto">
                <ScreenshotPlaceholder
                    title="Before: Messy Spreadsheet Example"
                    dimensions="1200x800"
                />
            </div>
        </DemoSection>
    );
}
