// resources/js/Components/SearchableManagerSelect.jsx
import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export function SearchableManagerSelect({ managers = [], value, onChange, error, currentManagerId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Find selected manager
    const selectedManager = managers.find(m => m.id === parseInt(value));

    // Filter managers based on search
    const filteredManagers = managers.filter(manager => {
        const query = searchQuery.toLowerCase();
        return (
            manager.name.toLowerCase().includes(query) ||
            manager.position?.toLowerCase().includes(query) ||
            manager.department?.toLowerCase().includes(query)
        );
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (managerId) => {
        onChange(managerId.toString());
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setSearchQuery('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left bg-white border rounded-md shadow-sm transition-colors ${
                    error 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
            >
                {selectedManager ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full flex-shrink-0">
                            <span className="text-xs font-medium text-white">
                                {selectedManager.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-medium text-gray-900 truncate">{selectedManager.name}</span>
                            {selectedManager.position && (
                                <span className="text-xs text-gray-500 truncate">{selectedManager.position}</span>
                            )}
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-500">Select manager...</span>
                )}
                <div className="flex items-center gap-1 ml-2">
                    {selectedManager && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    )}
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-[400px] overflow-hidden">
                    {/* Search Input */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, position, or department..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Manager List */}
                    <div className="overflow-y-auto max-h-[300px]">
                        {filteredManagers.length > 0 ? (
                            filteredManagers.map((manager) => (
                                <button
                                    key={manager.id}
                                    type="button"
                                    onClick={() => handleSelect(manager.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                                        value === manager.id.toString() ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full flex-shrink-0">
                                        <span className="text-sm font-medium text-white">
                                            {manager.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900 truncate">
                                                {manager.name}
                                            </span>
                                            {currentManagerId === manager.id && (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded flex-shrink-0">
                                                    Your Manager
                                                </span>
                                            )}
                                        </div>
                                        {(manager.position || manager.department) && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                                                {manager.position && <span>{manager.position}</span>}
                                                {manager.position && manager.department && <span>•</span>}
                                                {manager.department && <span>{manager.department}</span>}
                                            </div>
                                        )}
                                    </div>
                                    {value === manager.id.toString() && (
                                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-8 text-center text-sm text-gray-500">
                                No managers found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}