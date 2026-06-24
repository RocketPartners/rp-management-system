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
});
