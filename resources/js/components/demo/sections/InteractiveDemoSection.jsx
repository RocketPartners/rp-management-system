import React from 'react';
import DemoSection from '../DemoSection';
import VideoPlaceholder from '../VideoPlaceholder';

export default function InteractiveDemoSection() {
    return (
        <DemoSection
            id="interactive-demo"
            title="See It In Action"
            backgroundColor="bg-gradient-to-br from-gray-900 to-gray-800"
        >
            <div className="max-w-5xl mx-auto">
                {/* Subtitle */}
                <p className="text-xl text-gray-300 text-center mb-12">
                    Watch Sarah's leave request journey:<br />
                    Application → Manager Approval → HR Approval → Calendar
                </p>

                {/* Video Placeholder */}
                <VideoPlaceholder
                    title="Demo Walkthrough - Leave Request Lifecycle"
                    duration="3:45"
                    thumbnailText="Interactive Demo"
                />

                {/* Optional Note */}
                <p className="text-center text-gray-400 mt-8 text-sm">
                    This interactive demo shows the complete employee experience from request to confirmation
                </p>
            </div>
        </DemoSection>
    );
}
