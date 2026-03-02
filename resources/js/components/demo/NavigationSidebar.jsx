import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function NavigationSidebar({ sections }) {
    const [activeSection, setActiveSection] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections.map(s => document.getElementById(s.id));
            const scrollPosition = window.scrollY + 200;

            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const element = sectionElements[i];
                if (element && element.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i].id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, [sections]);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200
                    transform transition-transform duration-300 ease-in-out z-40
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="p-6 h-full overflow-y-auto">
                    {/* Logo/Title */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900">HR System Demo</h2>
                        <p className="text-sm text-gray-500 mt-1">Presentation Guide</p>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-2">
                        {sections.map((section, index) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`
                                    w-full text-left px-4 py-3 rounded-lg transition-colors
                                    ${activeSection === section.id
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="flex items-start">
                                    <span className="text-xs font-medium text-gray-400 mr-3 mt-0.5">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="text-sm">{section.title}</span>
                                </div>
                            </button>
                        ))}
                    </nav>

                    {/* Progress Indicator */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="text-xs text-gray-500 mb-2">Progress</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                />
            )}
        </>
    );
}
