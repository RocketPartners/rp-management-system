// resources/js/Components/SearchableManagerSelect.jsx
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function SearchableManagerSelect({
    managers = [],
    value,
    onChange,
    error,
    currentManagerId,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Find selected manager
    const selectedManager = managers.find((m) => m.id === parseInt(value));

    // Filter managers based on search
    const filteredManagers = managers.filter((manager) => {
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
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
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
                className={`flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-left shadow-sm transition-colors ${
                    error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
            >
                {selectedManager ? (
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                            <span className="text-xs font-medium text-white">
                                {selectedManager.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <span className="truncate font-medium text-gray-900">
                                {selectedManager.name}
                            </span>
                            {selectedManager.position && (
                                <span className="truncate text-xs text-gray-500">
                                    {selectedManager.position}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-500">Select manager...</span>
                )}
                <div className="ml-2 flex items-center gap-1">
                    {selectedManager && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="rounded p-1 transition-colors hover:bg-gray-100"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    )}
                    <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 transform' : ''}`}
                    />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 mt-1 max-h-[400px] w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
                    {/* Search Input */}
                    <div className="sticky top-0 border-b border-gray-200 bg-white p-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, position, or department..."
                                className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Manager List */}
                    <div className="max-h-[300px] overflow-y-auto">
                        {filteredManagers.length > 0 ? (
                            filteredManagers.map((manager) => (
                                <button
                                    key={manager.id}
                                    type="button"
                                    onClick={() => handleSelect(manager.id)}
                                    className={`flex w-full items-center gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50 ${
                                        value === manager.id.toString()
                                            ? 'bg-blue-50'
                                            : ''
                                    }`}
                                >
                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                                        <span className="text-sm font-medium text-white">
                                            {manager.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate font-medium text-gray-900">
                                                {manager.name}
                                            </span>
                                            {currentManagerId ===
                                                manager.id && (
                                                <span className="flex-shrink-0 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                    Your Manager
                                                </span>
                                            )}
                                        </div>
                                        {(manager.position ||
                                            manager.department) && (
                                            <div className="flex items-center gap-2 truncate text-xs text-gray-500">
                                                {manager.position && (
                                                    <span>
                                                        {manager.position}
                                                    </span>
                                                )}
                                                {manager.position &&
                                                    manager.department && (
                                                        <span>•</span>
                                                    )}
                                                {manager.department && (
                                                    <span>
                                                        {manager.department}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {value === manager.id.toString() && (
                                        <Check className="h-4 w-4 flex-shrink-0 text-blue-600" />
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
