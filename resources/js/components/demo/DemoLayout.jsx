import React from 'react';
import NavigationSidebar from './NavigationSidebar';

export default function DemoLayout({ children, sections }) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Sidebar */}
            <NavigationSidebar sections={sections} />

            {/* Main Content */}
            <div className="lg:pl-64">
                <main className="w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
