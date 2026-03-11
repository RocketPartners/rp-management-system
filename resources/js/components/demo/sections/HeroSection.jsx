import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import DemoSection from '../DemoSection';
import LiveDemoButton from '../LiveDemoButton';

export default function HeroSection() {
    return (
        <DemoSection id="hero" backgroundColor="bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="text-center text-white py-12">
                {/* Title & Tagline */}
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                    HR Management System
                </h1>
                <p className="text-2xl md:text-3xl text-blue-100 mb-12">
                    Smart Leave Management & Enterprise Document Security
                </p>

                {/* Key Value Propositions */}
                <div className="max-w-4xl mx-auto space-y-4 mb-12">
                    {[
                        'Automated leave workflows save 90% approval time',
                        'Role-based access control protects employee data',
                        'Complete audit trail ensures compliance',
                    ].map((value, index) => (
                        <div key={index} className="flex items-start justify-center text-lg md:text-xl">
                            <Check className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                            <span>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Scroll Indicator */}
                <div className="flex flex-col items-center mt-16">
                    <p className="text-blue-100 mb-4">Scroll to explore</p>
                    <ChevronDown className="w-8 h-8 animate-bounce" />
                </div>
            </div>

            {/* Live Demo Button - Opens in New Tab (No iframe issues) */}
            <div className="mt-12">
                <LiveDemoButton
                    dashboardUrl="http://52.64.225.64/dashboard"
                    label="Launch Live Dashboard Demo"
                    description="Click to explore the actual HR system in a new tab"
                />
            </div>
        </DemoSection>
    );
}
