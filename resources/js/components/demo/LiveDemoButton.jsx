import React from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveDemoButton({
    dashboardUrl = "http://127.0.0.1:8000/dashboard",
    label = "Launch Live Dashboard",
    description = "Click to open the actual dashboard in a new tab"
}) {
    return (
        <motion.a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
        >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="p-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Play className="w-8 h-8" />
                        <h3 className="text-2xl font-bold">{label}</h3>
                    </div>
                    <p className="text-blue-100 mb-6">{description}</p>
                    <div className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                        <ExternalLink className="w-5 h-5" />
                        Open Dashboard
                    </div>
                </div>
                <div className="bg-blue-800 px-6 py-3 text-sm text-center">
                    <span className="text-blue-200">💡 Note:</span> You'll need to be logged in to view the dashboard
                </div>
            </div>
        </motion.a>
    );
}
