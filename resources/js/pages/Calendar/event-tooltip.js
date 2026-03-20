/**
 * Sets up a custom DOM tooltip on a FullCalendar event element.
 * Called from FullCalendar's `eventDidMount` callback.
 */
export function setupEventTooltip(info) {
    const eventType = info.event.extendedProps?.event_type;
    let tooltipContent = '';

    if (eventType === 'holiday') {
        const holidayName = info.event.extendedProps?.holiday_name || info.event.title;
        const countryName = info.event.extendedProps?.country_name || '';
        const countryCode = info.event.extendedProps?.country_code || '';
        const holidayTypeLabel = info.event.extendedProps?.holiday_type_label || '';
        const flag = countryCode === 'PH' ? '\u{1F1F5}\u{1F1ED}' : countryCode === 'US' ? '\u{1F1FA}\u{1F1F8}' : countryCode === 'ES' ? '\u{1F1EA}\u{1F1F8}' : '\u{1F389}';

        tooltipContent = `
            <div class="custom-tooltip-content">
                <div class="tooltip-title">${flag} ${holidayName}</div>
                <div class="tooltip-subtitle">${countryName}</div>
                ${holidayTypeLabel ? `<div class="tooltip-info">\u{1F4CC} ${holidayTypeLabel}</div>` : ''}
            </div>
        `;
    } else if (eventType === 'wfh') {
        const userName = info.event.extendedProps?.user_name || info.event.title;
        const department = info.event.extendedProps?.department || '';
        const wfhType = info.event.extendedProps?.wfh_type || '';
        const reason = info.event.extendedProps?.reason || '';

        tooltipContent = `
            <div class="custom-tooltip-content">
                <div class="tooltip-title">\u{1F3E0} ${userName}</div>
                ${department ? `<div class="tooltip-info">\u{1F4CD} ${department}</div>` : ''}
                <div class="tooltip-subtitle">Working from home</div>
                ${wfhType === 'recurring' ? `<div class="tooltip-info">\u{1F504} Recurring</div>` : ''}
                ${reason ? `<div class="tooltip-info">\u{1F4AC} ${reason}</div>` : ''}
            </div>
        `;
    } else {
        const userName = info.event.extendedProps?.user_name || info.event.title;
        const leaveType = info.event.extendedProps?.leave_type || '';
        const department = info.event.extendedProps?.department || '';
        const totalDays = info.event.extendedProps?.total_days || '';

        tooltipContent = `
            <div class="custom-tooltip-content">
                <div class="tooltip-title">${userName}</div>
                ${leaveType ? `<div class="tooltip-subtitle">${leaveType}</div>` : ''}
                ${department ? `<div class="tooltip-info">\u{1F4CD} ${department}</div>` : ''}
                ${totalDays ? `<div class="tooltip-info">\u{1F4C5} ${totalDays} day${totalDays > 1 ? 's' : ''}</div>` : ''}
            </div>
        `;
    }

    info.el.setAttribute('data-tooltip', tooltipContent);
    info.el.classList.add('has-custom-tooltip');

    let tooltipEl = null;

    const showTooltip = () => {
        document.querySelectorAll('.custom-event-tooltip').forEach(el => el.remove());

        tooltipEl = document.createElement('div');
        tooltipEl.className = 'custom-event-tooltip';
        tooltipEl.innerHTML = tooltipContent;
        document.body.appendChild(tooltipEl);

        const rect = info.el.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();

        let top = rect.bottom + window.scrollY + 5;
        let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);

        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        if (rect.bottom + tooltipRect.height + 10 > window.innerHeight) {
            top = rect.top + window.scrollY - tooltipRect.height - 5;
            tooltipEl.classList.add('tooltip-above');
        }

        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;

        setTimeout(() => tooltipEl.classList.add('tooltip-visible'), 10);
    };

    const hideTooltip = () => {
        if (tooltipEl) {
            tooltipEl.classList.remove('tooltip-visible');
            setTimeout(() => tooltipEl?.remove(), 200);
            tooltipEl = null;
        }
    };

    info.el.addEventListener('mouseenter', showTooltip);
    info.el.addEventListener('mouseleave', hideTooltip);

    const scrollHandler = () => hideTooltip();
    window.addEventListener('scroll', scrollHandler, true);

    info.el._cleanupTooltip = () => {
        info.el.removeEventListener('mouseenter', showTooltip);
        info.el.removeEventListener('mouseleave', hideTooltip);
        window.removeEventListener('scroll', scrollHandler, true);
        hideTooltip();
    };
}
