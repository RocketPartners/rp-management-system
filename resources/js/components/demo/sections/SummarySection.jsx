import React from 'react';
import { Check, Calendar, FileText, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import DemoSection from '../DemoSection';
import ScreenshotPlaceholder from '../ScreenshotPlaceholder';

export default function SummarySection() {
    const takeaways = [
        'Automated workflows save time and reduce errors',
        'Bank-grade security protects sensitive employee data',
        'Complete audit trail ensures compliance',
        'Improved employee experience and satisfaction',
    ];

    const ctas = [
        { label: 'Schedule Full Demo', icon: Calendar, color: 'blue' },
        { label: 'View Documentation', icon: FileText, color: 'green' },
        { label: 'Contact Us', icon: Mail, color: 'gray' },
    ];

    const ctaColors = {
        blue: 'bg-blue-600 hover:bg-blue-700 text-white',
        green: 'bg-green-600 hover:bg-green-700 text-white',
        gray: 'bg-gray-600 hover:bg-gray-700 text-white',
    };

    return (
        <DemoSection
            id="summary"
            title="Ready to Transform Your HR Operations?"
            backgroundColor="bg-gradient-to-br from-blue-50 to-white"
        >
            {/* Key Takeaways */}
            <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Takeaways</h3>
                <div className="space-y-4">
                    {takeaways.map((takeaway, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start bg-white p-6 rounded-lg border-2 border-blue-200"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Check className="w-6 h-6 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
                            <span className="text-lg text-gray-800">{takeaway}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4 mt-12">
                {ctas.map((cta, index) => (
                    <motion.button
                        key={index}
                        className={`
                            flex items-center px-8 py-4 rounded-lg font-semibold text-lg
                            transition-colors shadow-lg hover:shadow-xl
                            ${ctaColors[cta.color]}
                        `}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <cta.icon className="w-5 h-5 mr-2" />
                        {cta.label}
                    </motion.button>
                ))}
            </div>

            {/* Optional Screenshot */}
            <div className="mt-16 max-w-4xl mx-auto">
                <ScreenshotPlaceholder title="Contact or Team Photo" dimensions="1200x600" aspectRatio="wide" />
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 mt-16 pt-8 border-t border-gray-200">
                <p className="text-sm">© 2026 HR Management System. All rights reserved.</p>
            </div>
        </DemoSection>
    );
}
