import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import DemoSection from '../DemoSection';

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
                <div className="relative">
                    <div className="absolute -top-6 left-0 bg-red-100 text-red-800 px-4 py-2 rounded-t-lg font-semibold text-sm">
                        Before: Messy Spreadsheet Example
                    </div>
                    <img
                        src="/demo/media/images/problem-messy-spreadsheet.png"
                        alt="Messy spreadsheet showing chaotic HR tracking"
                        className="w-full rounded-lg shadow-2xl border-4 border-red-200"
                    />
                </div>
            </div>
        </DemoSection>
    );
}
