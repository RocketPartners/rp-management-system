import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DemoLayout from '@/components/demo/DemoLayout';
import HeroSection from '@/components/demo/sections/HeroSection';
import ProblemSection from '@/components/demo/sections/ProblemSection';
import SolutionSection from '@/components/demo/sections/SolutionSection';
import LeaveManagementSection from '@/components/demo/sections/LeaveManagementSection';
import DocumentSecuritySection from '@/components/demo/sections/DocumentSecuritySection';
import CompetitiveSection from '@/components/demo/sections/CompetitiveSection';
import BusinessValueSection from '@/components/demo/sections/BusinessValueSection';
import InteractiveDemoSection from '@/components/demo/sections/InteractiveDemoSection';
import SummarySection from '@/components/demo/sections/SummarySection';

export default function Demo() {
    // Define all sections for navigation
    const sections = [
        { id: 'hero', title: 'Overview' },
        { id: 'problem', title: 'The Problem' },
        { id: 'solution', title: 'Our Solution' },
        { id: 'leave-employee', title: 'Leave: Employee View' },
        { id: 'leave-manager', title: 'Leave: Manager View' },
        { id: 'leave-hr', title: 'Leave: HR Dashboard' },
        { id: 'leave-features', title: 'Leave: Smart Features' },
        { id: 'security-overview', title: 'Security: Overview' },
        { id: 'security-portal', title: 'Security: Employee Portal' },
        { id: 'security-sensitivity', title: 'Security: Classification' },
        { id: 'security-audit', title: 'Security: Audit Trail' },
        { id: 'security-compliance', title: 'Security: Compliance' },
        { id: 'competitive', title: 'Competitive Advantage' },
        { id: 'business-value', title: 'Business Value' },
        { id: 'interactive-demo', title: 'Interactive Demo' },
        { id: 'summary', title: 'Summary & Next Steps' },
    ];

    // Enable smooth scrolling
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    return (
        <>
            <Head title="HR Management System Demo" />

            <DemoLayout sections={sections}>
                <HeroSection />
                <ProblemSection />
                <SolutionSection />
                <LeaveManagementSection />
                <DocumentSecuritySection />
                <CompetitiveSection />
                <BusinessValueSection />
                <InteractiveDemoSection />
                <SummarySection />
            </DemoLayout>
        </>
    );
}
