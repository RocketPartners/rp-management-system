import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface TimezoneInfo {
    id: string;
    name: string;
    flag: string;
    offset: string;
}

interface TimezoneContextType {
    timezone: string;
    setTimezone: (tz: string) => void;
    timezones: TimezoneInfo[];
}

const timezones: TimezoneInfo[] = [
    {
        id: 'America/New_York',
        name: 'Atlanta',
        flag: '/images/united-states-of-america.png',
        offset: 'EST/EDT',
    },
    {
        id: 'Europe/Madrid',
        name: 'Spain',
        flag: '/images/spain.png',
        offset: 'CET/CEST',
    },
    {
        id: 'Asia/Manila',
        name: 'Philippines',
        flag: '/images/philippines.png',
        offset: 'PHT',
    },
];

const TimezoneContext = createContext<TimezoneContextType | null>(null);

export function TimezoneProvider({ children }: { children: ReactNode }) {
    const [timezone, setTimezone] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('timezone') || 'Asia/Manila';
        }
        return 'Asia/Manila';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('timezone', timezone);
        }
    }, [timezone]);

    return (
        <TimezoneContext.Provider value={{ timezone, setTimezone, timezones }}>
            {children}
        </TimezoneContext.Provider>
    );
}

export function useTimezone(): TimezoneContextType {
    const context = useContext(TimezoneContext);
    if (!context) {
        return { timezone: 'Asia/Manila', setTimezone: () => {}, timezones };
    }
    return context;
}
