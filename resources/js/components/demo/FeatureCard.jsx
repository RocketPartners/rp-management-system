import React from 'react';
import { motion } from 'framer-motion';

const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
};

export default function FeatureCard({
    icon: Icon,
    title,
    bullets = [],
    color = 'blue',
    badge,
    delay = 0,
}) {
    const colorClass = colorClasses[color] || colorClasses.blue;

    return (
        <motion.div
            className={`rounded-xl border-2 p-6 ${colorClass}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            viewport={{ once: true }}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    {Icon && <Icon className="w-8 h-8 mr-3" />}
                    <h3 className="text-2xl font-semibold">{title}</h3>
                </div>
                {badge && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white">
                        {badge}
                    </span>
                )}
            </div>

            {/* Bullets */}
            {bullets.length > 0 && (
                <ul className="space-y-3">
                    {bullets.map((bullet, index) => (
                        <li key={index} className="flex items-start text-lg">
                            <span className="mr-2 mt-1">•</span>
                            <span>{bullet}</span>
                        </li>
                    ))}
                </ul>
            )}
        </motion.div>
    );
}
