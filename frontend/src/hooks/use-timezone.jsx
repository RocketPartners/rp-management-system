import { createContext, useContext, useEffect, useState } from 'react';

const TimezoneContext = createContext();

const timezones = [
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

export function TimezoneProvider({ children }) {
    const [timezone, setTimezone] = useState(() => {
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

export function useTimezone() {
    const context = useContext(TimezoneContext);
    if (!context) {
        return { timezone: 'Asia/Manila', setTimezone: () => {}, timezones };
    }
    return context;
}
