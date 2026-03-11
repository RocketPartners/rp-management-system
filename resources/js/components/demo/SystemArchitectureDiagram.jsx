import React from 'react';
import { ArrowDown, Server, Database, Cloud, Code, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SystemArchitectureDiagram() {
    const layers = [
        {
            icon: Layout,
            title: 'Frontend Layer',
            color: 'from-purple-500 to-purple-600',
            borderColor: 'border-purple-300',
            bgColor: 'bg-purple-50',
            technologies: [
                { name: 'React 19', desc: 'Modern UI components' },
                { name: 'Inertia.js', desc: 'SPA-like routing' },
                { name: 'TailwindCSS', desc: 'Responsive styling' },
            ],
            features: ['📊 Dashboard', '📅 Calendar', '📝 Leave', '🏠 WFH', '📄 Documents'],
        },
        {
            icon: Server,
            title: 'Backend Layer',
            color: 'from-orange-500 to-orange-600',
            borderColor: 'border-orange-300',
            bgColor: 'bg-orange-50',
            technologies: [
                { name: 'Laravel 11', desc: 'PHP framework' },
                { name: 'PHP 8.4', desc: 'Application server' },
                { name: 'Sanctum', desc: 'API authentication' },
            ],
            features: ['⚙️ Business Logic', '🔐 Authorization', '📨 Notifications', '🔄 Workflows'],
        },
        {
            icon: Database,
            title: 'Data Layer',
            color: 'from-teal-500 to-teal-600',
            borderColor: 'border-teal-300',
            bgColor: 'bg-teal-50',
            technologies: [
                { name: 'MySQL 8', desc: 'Relational database' },
                { name: 'Private Storage', desc: 'Secure file storage' },
                { name: 'Audit Logs', desc: 'Immutable tracking' },
            ],
            features: ['👥 Users', '📝 Requests', '📅 Events', '📄 Documents', '📋 Audit'],
        },
        {
            icon: Cloud,
            title: 'Infrastructure',
            color: 'from-indigo-500 to-indigo-600',
            borderColor: 'border-indigo-300',
            bgColor: 'bg-indigo-50',
            technologies: [
                { name: 'Nginx', desc: 'Web server' },
                { name: 'PHP-FPM', desc: 'Process manager' },
                { name: 'AWS/Cloud', desc: 'Deployment' },
            ],
            features: ['🔒 SSL/TLS', '⚡ Caching', '📊 Monitoring', '🔄 Backups'],
        },
    ];

    return (
        <div className="max-w-6xl mx-auto py-12">
            {/* Architecture Layers */}
            <div className="space-y-6">
                {layers.map((layer, index) => (
                    <React.Fragment key={index}>
                        {/* Layer Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className={`relative bg-white rounded-xl shadow-xl border-4 ${layer.borderColor} overflow-hidden`}
                        >
                            {/* Header */}
                            <div className={`bg-gradient-to-r ${layer.color} text-white px-6 py-4`}>
                                <div className="flex items-center gap-3">
                                    <layer.icon className="w-8 h-8" />
                                    <h3 className="text-2xl font-bold">{layer.title}</h3>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Technologies */}
                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    {layer.technologies.map((tech, techIndex) => (
                                        <div
                                            key={techIndex}
                                            className={`${layer.bgColor} rounded-lg p-4 border-2 ${layer.borderColor}`}
                                        >
                                            <div className="font-bold text-gray-900 mb-1">{tech.name}</div>
                                            <div className="text-sm text-gray-600">{tech.desc}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Features */}
                                <div className="flex flex-wrap gap-3">
                                    {layer.features.map((feature, featureIndex) => (
                                        <span
                                            key={featureIndex}
                                            className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-700"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Arrow Between Layers */}
                        {index < layers.length - 1 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.2 + 0.3 }}
                                viewport={{ once: true }}
                                className="flex justify-center"
                            >
                                <div className="bg-gray-200 rounded-full p-3">
                                    <ArrowDown className="w-8 h-8 text-gray-600 animate-bounce" />
                                </div>
                            </motion.div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Summary Stats */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                viewport={{ once: true }}
                className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8"
            >
                <h3 className="text-2xl font-bold mb-6 text-center">Architecture Highlights</h3>
                <div className="grid md:grid-cols-4 gap-6 text-center">
                    <div>
                        <div className="text-4xl font-bold mb-2">4</div>
                        <div className="text-blue-100">Clean Layers</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-2">100%</div>
                        <div className="text-blue-100">Secure Access</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-2">1000+</div>
                        <div className="text-blue-100">Users Supported</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold mb-2">99.9%</div>
                        <div className="text-blue-100">Uptime SLA</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
