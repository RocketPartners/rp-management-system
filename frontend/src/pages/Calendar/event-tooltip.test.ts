import { setupEventTooltip } from './event-tooltip';
import { afterEach, describe, expect, it } from 'vitest';

interface TooltipEventProps {
    event_type?: string;
    user_name?: string;
    reason?: string;
    [key: string]: unknown;
}

function buildInfo(title: string, extendedProps: TooltipEventProps) {
    const el = document.createElement('div');
    document.body.appendChild(el);
    return {
        info: {
            event: { title, extendedProps },
            el: el as HTMLElement & { _cleanupTooltip?: () => void },
        },
        el,
    };
}

describe('setupEventTooltip', () => {
    afterEach(() => {
        // Clean up any tooltip elements rendered into the body between tests.
        document
            .querySelectorAll('.custom-event-tooltip')
            .forEach((node) => node.remove());
        document.body.innerHTML = '';
    });

    it('strips executable HTML from a malicious WFH reason in the tooltip', () => {
        // Arrange
        const { info, el } = buildInfo('Bob', {
            event_type: 'wfh',
            user_name: 'Bob',
            reason: '<img src=x onerror=alert(1)>',
        });
        setupEventTooltip(info);

        // Act
        el.dispatchEvent(new MouseEvent('mouseenter'));
        const tooltip = document.body.querySelector('.custom-event-tooltip');

        // Assert
        expect(tooltip).not.toBeNull();
        expect(tooltip?.querySelector('img[onerror]')).toBeNull();
        expect(tooltip?.innerHTML).not.toContain('onerror');
        expect(tooltip?.innerHTML).toContain('Bob');
        expect(el.getAttribute('data-tooltip')).not.toContain('onerror');
    });

    it('renders the holiday branch with country and type label', () => {
        // Arrange
        const { info, el } = buildInfo('Independence Day', {
            event_type: 'holiday',
            holiday_name: 'Independence Day',
            country_name: 'Philippines',
            country_code: 'PH',
            holiday_type_label: 'Regular Holiday',
        });
        setupEventTooltip(info);

        // Act
        el.dispatchEvent(new MouseEvent('mouseenter'));
        const tooltip = document.body.querySelector('.custom-event-tooltip');

        // Assert
        expect(tooltip).not.toBeNull();
        expect(tooltip?.innerHTML).toContain('Independence Day');
        expect(tooltip?.innerHTML).toContain('Philippines');
        expect(tooltip?.innerHTML).toContain('Regular Holiday');
    });

    it('strips executable HTML from a malicious holiday name', () => {
        // Arrange
        const { info, el } = buildInfo('Holiday', {
            event_type: 'holiday',
            holiday_name: '<script>alert(1)</script>',
            country_name: 'US',
            country_code: 'US',
        });
        setupEventTooltip(info);

        // Act
        el.dispatchEvent(new MouseEvent('mouseenter'));
        const tooltip = document.body.querySelector('.custom-event-tooltip');

        // Assert
        expect(tooltip).not.toBeNull();
        expect(tooltip?.querySelector('script')).toBeNull();
        expect(tooltip?.innerHTML).not.toContain('<script>');
        expect(el.getAttribute('data-tooltip')).not.toContain('<script>');
    });

    it('renders the default leave branch with leave type and total days', () => {
        // Arrange
        const { info, el } = buildInfo('Alice', {
            event_type: 'leave',
            user_name: 'Alice',
            leave_type: 'Annual Leave',
            total_days: 3,
        });
        setupEventTooltip(info);

        // Act
        el.dispatchEvent(new MouseEvent('mouseenter'));
        const tooltip = document.body.querySelector('.custom-event-tooltip');

        // Assert
        expect(tooltip).not.toBeNull();
        expect(tooltip?.innerHTML).toContain('Alice');
        expect(tooltip?.innerHTML).toContain('Annual Leave');
        expect(tooltip?.innerHTML).toContain('3 days');
    });

    it('singularizes the day label for a single-day leave', () => {
        // Arrange
        const { info, el } = buildInfo('Alice', {
            event_type: 'leave',
            user_name: 'Alice',
            total_days: 1,
        });
        setupEventTooltip(info);

        // Act
        el.dispatchEvent(new MouseEvent('mouseenter'));
        const tooltip = document.body.querySelector('.custom-event-tooltip');

        // Assert
        expect(tooltip?.innerHTML).toContain('1 day');
        expect(tooltip?.innerHTML).not.toContain('1 days');
    });
});
