# Dashboard Mobile Optimization — Design Spec

**Date**: 2026-04-07
**Branch**: `feature/HRIS-45-pwa-optimization`
**Scope**: Mobile-only layout changes (`< lg` breakpoint). Desktop layout unchanged.

## Overview

Rearrange the My Dashboard tab for mobile to reduce wasted vertical space and prioritize actionable content. Reuse existing components — no new components. Changes are CSS/layout only via responsive Tailwind classes.

## Mobile Layout (< lg)

### Order of sections:

1. **Header** — Left-aligned welcome text ("Welcome back, Marco!"). Existing header markup, just ensure left-aligned (no centered icon block on mobile). The profile avatar is already in the top nav bar — no separate profile card needed.

2. **Stats 2x2 grid** — Existing `StatCard` components in a 2-column grid instead of 4-column. Smaller padding/font on mobile. Cards: Assigned Assets, Upcoming Leaves, Pending Requests, WFH This Week.

3. **Pending Leave Requests** — Shown before upcoming since it's actionable. Uses existing `LeaveItemCard`. Only shown if there are pending items (existing conditional logic).

4. **Upcoming Leaves** — Existing `LeaveItemCard` list with "View all" link.

5. **Leave Balances** — Horizontal scrolling row of compact chips instead of vertical stack. Each chip shows: leave type color dot, name, remaining/total, mini progress bar. Uses existing leave balance data and color logic.

### What's removed on mobile:

- **Quick Actions card** — redundant with the bottom nav FAB
- **My Profile card** — redundant with the top nav avatar and More sheet profile header
- **My Assets card** (right sidebar) — accessible via More sheet nav
- The entire right sidebar column — its content is either redundant or accessible elsewhere

### What's unchanged:

- Desktop layout (`lg:` and up) — completely untouched
- Admin Dashboard tab — no changes
- All data fetching, queries, types — no changes
- All existing components (`StatCard`, `LeaveItemCard`, `statusBadge`) — reused as-is

## Implementation approach

Modify `frontend/src/pages/Dashboard/Index.tsx` — specifically the `MyDashboardTab` component:

1. **Stats grid**: Change from `grid-cols-1 md:grid-cols-4` to `grid-cols-2 lg:grid-cols-4`. Add tighter padding on mobile via responsive classes.

2. **Section reorder on mobile**: Wrap the main content and sidebar in a flex container that reorders on mobile using `order-` classes:
   - Stats: `order-1`
   - Pending Requests: `order-2`
   - Upcoming Leaves: `order-3`
   - Leave Balances: `order-4`
   - Right sidebar (profile, assets, quick actions): `order-5 hidden lg:block` (hidden on mobile, visible on desktop)

3. **Leave balances mobile layout**: On mobile, render as a horizontal scroll row (`flex overflow-x-auto`) of compact fixed-width cards instead of the vertical `md:grid-cols-2` grid. Each card shows the essential info: color dot, name, remaining/total, progress bar. Use `lg:grid lg:grid-cols-2` to keep the existing desktop layout.

4. **Header**: On mobile, hide the large icon block. Keep the text left-aligned. `hidden lg:flex` on the icon container.

## File changes

- **Modify**: `frontend/src/pages/Dashboard/Index.tsx` — responsive layout classes in `MyDashboardTab`

One file, CSS/layout changes only. No new files, no new components, no data changes.
