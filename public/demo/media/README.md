# Demo Media Assets

This directory contains images and videos for the demo presentation at `/demo`.

## Directory Structure

```
media/
├── images/          # Screenshots, diagrams, UI mockups
└── videos/          # Screen recordings, demos
```

## Naming Convention

Use descriptive names following this pattern:
`{section}-{description}.{ext}`

Examples:
- `problem-messy-spreadsheet.png`
- `leave-employee-dashboard.png`
- `wfh-calendar-view.mp4`

## Media Needed by Section

### Section 1: Hero
- [ ] `hero-dashboard-overview.png` - Main dashboard screenshot
- [ ] `hero-demo-video.mp4` (optional) - System walkthrough

### Section 2: The Problem
- [x] `problem-messy-spreadsheet.png` - Chaotic Excel/email example ✅
- [ ] `problem-email-chaos.png` - Email thread screenshot
- [ ] `problem-manual-tracking.png` - Manual process visualization

### Section 3: Our Solution (Three Pillars)
- [ ] `solution-architecture-diagram.png` - System architecture
- [ ] `solution-pillars-visual.png` - Three pillars graphic

### Section 4: Leave Management - Employee View
- [ ] `leave-employee-dashboard.png` - Employee leave page
- [ ] `leave-request-form.png` - Leave request interface
- [ ] `leave-balance-card.png` - Balance display

### Section 5: Leave Management - Manager View
- [ ] `leave-manager-dashboard.png` - Manager approval queue
- [ ] `leave-team-calendar.png` - Team leave visualization
- [ ] `leave-approval-action.png` - Approval workflow

### Section 6: Leave Management - HR Dashboard
- [ ] `leave-hr-analytics.png` - HR analytics view
- [ ] `leave-organization-view.png` - Company-wide leave view
- [ ] `leave-reports.png` - Leave reports

### Section 7: Leave Management - Smart Features
- [ ] `leave-conflict-detection.png` - Quota validation
- [ ] `leave-holiday-exclusion.png` - Holiday auto-detection
- [ ] `leave-balance-calculation.png` - Real-time balance

### Section 8: Work From Home - Overview
- [ ] `wfh-scheduler-interface.png` - WFH scheduling UI
- [ ] `wfh-patterns.png` - Month-specific patterns
- [ ] `wfh-quota-tracking.png` - Weekly quota display

### Section 9: WFH - Smart Features
- [ ] `wfh-calendar-integration.png` - Calendar sync
- [ ] `wfh-conflict-detection.png` - Quota warning
- [ ] `wfh-team-coordination.png` - Team WFH view

### Section 10: Team Calendar - Overview
- [ ] `calendar-unified-view.png` - Multi-user calendar
- [ ] `calendar-event-types.png` - Color-coded events
- [ ] `calendar-real-time-updates.png` - Live updates demo

### Section 11: Calendar - Manager Tools
- [ ] `calendar-filters.png` - Filter options
- [ ] `calendar-holiday-management.png` - Holiday admin
- [ ] `calendar-export.png` - Export functionality

### Section 12: Document Security - Overview
- [ ] `security-upload-interface.png` - Document upload UI
- [ ] `security-audit-trail.png` - Command-line audit output
- [ ] `security-rbac-diagram.png` - Access control visualization

### Section 13: Document Security - Portal
- [ ] `security-portal-dashboard.png` - Employee document portal
- [ ] `security-status-tracking.png` - Document status badges
- [ ] `security-legal-hold.png` - Legal hold indicator

### Section 14: Competitive Advantage
- [ ] `competitive-comparison-table.png` - Feature comparison
- [ ] `competitive-integration-diagram.png` - System integration visual

### Section 15: Implementation & Support
- [ ] `implementation-timeline.png` - Rollout timeline
- [ ] `implementation-training.png` - Training materials
- [ ] `support-dashboard.png` - Support system

## File Specifications

### Images
- **Format:** PNG (preferred) or JPG
- **Resolution:** Minimum 1920x1080 for full-screen
- **Size:** Optimize for web (< 500KB per image)
- **Aspect Ratios:**
  - Standard: 16:9 (1920x1080)
  - Wide: 21:9 (2560x1080)
  - Square: 1:1 (1000x1000)

### Videos
- **Format:** MP4 (H.264 codec)
- **Resolution:** 1920x1080 recommended
- **Length:** 10-30 seconds per clip
- **Size:** < 10MB per video
- **Frame Rate:** 30 fps

## Placeholder Replacement

Current placeholders in demo use `ScreenshotPlaceholder` component.

To replace with real images:
1. Add image to appropriate folder
2. Update component in `resources/js/components/demo/sections/*Section.jsx`
3. Replace `<ScreenshotPlaceholder />` with `<img src="/demo/media/images/your-file.png" />`

Example:
```jsx
// Before
<ScreenshotPlaceholder title="Employee Dashboard" dimensions="1600x900" />

// After
<img
    src="/demo/media/images/leave-employee-dashboard.png"
    alt="Employee Dashboard"
    className="w-full rounded-lg shadow-xl"
/>
```

## Current Assets

### Images
- ✅ `problem-messy-spreadsheet.png` (70KB) - Section 2: The Problem

### Videos
- (none yet)

## Tips for Screenshots

1. **Use incognito/private mode** - Clean browser, no extensions
2. **Zoom to 100%** - Avoid blurry screenshots
3. **Hide sensitive data** - Use test/demo accounts
4. **Use consistent theme** - Light mode recommended
5. **Capture full UI** - Include navigation, headers
6. **Crop appropriately** - Focus on relevant content

## Tips for Screen Recordings

1. **Script the demo** - Know what to show
2. **Hide notifications** - Enable Do Not Disturb
3. **Slow down** - Deliberate mouse movements
4. **Add voiceover** (optional) - Explain what's happening
5. **Edit for clarity** - Cut mistakes, add captions

## Compression Tools

- **Images:** TinyPNG (https://tinypng.com)
- **Videos:** HandBrake (https://handbrake.fr)
- **Batch optimization:** `npm run optimize-demo-media` (TODO)

---

**Last Updated:** March 10, 2026
**Maintained By:** Demo Team
