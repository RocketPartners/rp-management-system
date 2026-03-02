import React from 'react';
import { motion } from 'framer-motion';

export default function DemoSection({
    id,
    title,
    subtitle,
    children,
    backgroundColor = 'bg-white',
}) {
    return (
        <motion.section
            id={id}
            className={`${backgroundColor} py-16 md:py-24 scroll-mt-20`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {title && (
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-xl text-gray-600">{subtitle}</p>
                        )}
                    </div>
                )}
                <div className="space-y-8">
                    {children}
                </div>
            </div>
        </motion.section>
    );
}
