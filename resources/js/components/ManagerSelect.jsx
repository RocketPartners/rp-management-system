// Create new file: resources/js/Components/ManagerSelect.jsx
import { Button } from '@/Components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/Components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useState } from 'react';

export function ManagerSelect({
    managers = [],
    value,
    onChange,
    error,
    currentManagerId,
}) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'w-full justify-between',
                        error && 'border-red-500',
                        !value && 'text-muted-foreground',
                    )}
                >
                    {selectedManager ? (
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                                <span className="text-xs font-medium text-white">
                                    {selectedManager.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-medium">
                                    {selectedManager.name}
                                </span>
                                {selectedManager.position && (
                                    <span className="text-xs text-gray-500">
                                        {selectedManager.position}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        'Select your manager...'
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            placeholder="Search by name, position, or department..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <CommandList>
                        <CommandEmpty>No manager found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                            {filteredManagers.map((manager) => (
                                <CommandItem
                                    key={manager.id}
                                    value={manager.id.toString()}
                                    onSelect={() => {
                                        onChange(manager.id.toString());
                                        setOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === manager.id.toString()
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    <div className="flex flex-1 items-center gap-3">
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                                            <span className="text-sm font-medium text-white">
                                                {manager.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex min-w-0 flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">
                                                    {manager.name}
                                                </span>
                                                {currentManagerId ===
                                                    manager.id && (
                                                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        Your Manager
                                                    </span>
                                                )}
                                            </div>
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
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
