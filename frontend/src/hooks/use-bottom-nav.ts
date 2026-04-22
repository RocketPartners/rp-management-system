import { useEffect, useState } from 'react';

const LG_BREAKPOINT = 1024;

export function useIsBottomNav() {
    const [show, setShow] = useState(
        () => typeof window !== 'undefined' && window.innerWidth < LG_BREAKPOINT,
    );

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`);
        const onChange = () => setShow(window.innerWidth < LG_BREAKPOINT);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return show;
}
