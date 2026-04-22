# PWA Mobile Optimization — Design Spec

**Date**: 2026-04-07
**Branch**: `feature/HRIS-45-pwa-optimization`
**Stack**: React 19 + React Router + TanStack Query + Radix UI + Tailwind CSS + Vite

## Overview

Replace the hamburger sidebar with a liquid glass bottom navigation bar on mobile. Add a dedicated notifications page, a quick-action FAB, and fix known bugs. Desktop sidebar remains unchanged.

## 1. Mobile Bottom Navigation

**Visible on**: `< lg` breakpoint only (mobile/tablet). Hidden on desktop.

### Three floating glass elements

Positioned `fixed` at the bottom of the viewport with `z-index` above page content.

**1a. Glass Pill (4 tabs)**
- Tabs: Home (`/dashboard`), Calendar (`/calendar`), Leaves (`/my-leaves`), Alerts (`/notifications`)
- Shape: `border-radius: 9999px` (full capsule)
- Active state: filled monochrome icon + inner pill with subtle background (`rgba(0,0,0,0.08)` light / `rgba(255,255,255,0.12)` dark)
- Inactive: outline monochrome icons, muted label
- Notification badge on Alerts tab (red dot with count, same data as existing `unreadCount` query)

**1b. More Blob**
- Separate circle to the right of the pill
- Icon-only: `···` (three dots), no label
- Same glass material and `border-radius: 9999px`
- Tap opens the More Sheet (section 2)

**1c. + FAB (Floating Action Button)**
- Floats above the pill at top-right (not inline with the bar)
- Same glass material, `border-radius: 9999px`
- Tap expands a vertical menu upward with spring animation:
  - Apply Leave → `/my-leaves/apply`
  - Request WFH → `/my-wfh`
  - Submit Ticket → `/support`
- Each action item is a glass pill with monochrome icon + label
- Scrim overlay behind when open, tap scrim to dismiss
- `+` icon rotates 45° (becomes `×`) when open

### Glass Material (adaptive light/dark)

Uses `prefers-color-scheme` media query. Only the bottom nav adapts; the rest of the app stays light.

| Property | Light | Dark |
|---|---|---|
| `background` | `rgba(255,255,255,0.5)` | `rgba(40,40,65,0.6)` |
| `backdrop-filter` | `blur(40px) saturate(180%)` | `blur(40px) saturate(150%)` |
| `border` | `1px solid rgba(255,255,255,0.7)` | `1px solid rgba(255,255,255,0.1)` |
| `box-shadow` | `0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)` | `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)` |
| Icon color (inactive) | `rgba(0,0,0,0.3)` | `rgba(255,255,255,0.4)` |
| Icon color (active) | `rgba(0,0,0,0.8)` filled | `rgba(255,255,255,0.9)` filled |
| Label color (inactive) | `rgba(0,0,0,0.35)` | `rgba(255,255,255,0.4)` |
| Label color (active) | `#1e293b` | `#fff` |

### Layout

```
┌──────────────────────────────────────┐
│                                 [+]  │  ← FAB (above pill, right-aligned)
│                                      │
│ [ Home  Calendar  Leaves  Alerts ] ○ │  ← Pill (4 tabs) + More blob
└──────────────────────────────────────┘
     ↑ 14px from bottom, 12px horizontal margins
```

## 2. More Sheet (Bottom Sheet)

**Trigger**: Tap the `···` More blob on mobile.

**Appearance**:
- Glass bottom sheet slides up from bottom
- `border-radius: 24px 24px 0 0` top corners
- Frosted glass background matching nav material
- Drag handle (36×4px pill, centered)
- Scrim overlay behind (`rgba(0,0,0,0.15)` light / `rgba(0,0,0,0.3)` dark), tap to dismiss
- `max-height: 85vh`, scrollable body
- Spring animation on open/close

**Content** (permission-aware, reuses `buildNavigation()` logic):
- **Header**: User avatar circle + name + role/position
- **Personal nav items**: Dashboard, Calendar, My Leaves, My WFH, Announcements, My Assets
- **Administration divider** (shown if user has any admin permission)
- **Expandable accordions**: User Management, Role Management, Organization, Onboarding, Leave Management, Projects — each with chevron, expands to show sub-items
- **Divider**
- **Settings + Support**
- **Footer** (sticky at bottom): Log Out button (red)

**Implementation**: Extract `buildNavigation()` from `AuthenticatedLayout.tsx` into a shared utility (e.g., `src/lib/navigation.ts`) so both the sidebar and the sheet consume the same config. Use the existing Radix `Sheet` component from `components/ui/sheet.tsx`.

## 3. Notifications Page

**Route**: `/notifications` (new route, inside `AuthenticatedLayout`)

**Trigger**: Tap Alerts tab in bottom nav (mobile). Also accessible from desktop.

**Layout** (all left-aligned, no centered content):
- **Top section**: "Notifications" title (left) + "Mark all read" link (right)
- **Filter tabs**: Horizontal row of pill-shaped tabs — All, Unread, Leaves, System. Active tab: dark fill + white text.
- **Notification list**: Full-width, left-aligned items
  - Each item: colored icon (by notification type, in a rounded square), title (bold if unread), message (2-line clamp), timestamp, unread indicator dot
  - Tap: marks as read + navigates to reference (reuses `getNotificationRoute`)
  - Empty state: left-aligned text, no centered icons

**Data**: Reuses existing queries from `NotificationDropdown`:
- `['notifications', 'unread-count']` for badge
- `['notifications', 'list']` for the list (extend with filter params)
- Same `markReadMutation` and `markAllReadMutation`

**New file**: `src/pages/Notifications/Index.tsx`

**Desktop behavior**: Top bar bell dropdown stays as-is. `/notifications` page works on desktop too.

## 4. NotificationDropdown Mobile Behavior

On mobile (`< lg`), tapping the bell icon in the top bar navigates to `/notifications` instead of opening the Radix dropdown. On desktop, the dropdown works as-is.

This fixes the `w-96` hardcoded width bug — mobile users never see the dropdown.

## 5. Bug Fixes & Cleanup

| File | Fix |
|---|---|
| `public/sw.js` | Icon paths: `/icon-192x192.png` → `/images/icon-192x192.png` (lines 6, 7) |
| `src/hooks/use-notification-socket.ts` | Remove unused `SOCKJS_URL` constant (line 12) |
| `vite.config.ts` | Remove hardcoded `dev-hris.geloflix.com` from `allowedHosts` and `hmr`. Clean config for commit — server-specific settings via env vars or local-only overrides |
| `AuthenticatedLayout.tsx` | Remove hamburger button on mobile (replaced by More blob). Keep on desktop as sidebar collapse toggle. |

## 6. Mobile PWA Polish

- **Bottom padding**: Main content gets `pb-28 lg:pb-0` to clear the floating bottom nav
- **Top nav on mobile**: Remove hamburger button (replaced by More sheet). Keep logo, user dropdown, timezone, notification bell (which redirects to `/notifications` on mobile).
- **Safe areas**: Bottom nav respects `env(safe-area-inset-bottom)` for notched devices (add to the nav zone's bottom positioning)
- **Sidebar**: Hidden completely on mobile (no overlay, no translate). Only visible `lg:` and up.

## 7. File Changes Summary

**New files**:
- `src/components/mobile-nav/BottomNav.tsx` — glass pill + more blob + FAB
- `src/components/mobile-nav/MoreSheet.tsx` — bottom sheet with full nav
- `src/components/mobile-nav/QuickActionFab.tsx` — FAB + action menu
- `src/pages/Notifications/Index.tsx` — full-screen notification page
- `src/lib/navigation.ts` — shared nav config extracted from AuthenticatedLayout

**Modified files**:
- `src/layouts/AuthenticatedLayout.tsx` — add BottomNav, remove mobile hamburger, extract nav config
- `src/router.tsx` — add `/notifications` route
- `src/components/notifications/NotificationDropdown.tsx` — mobile: navigate instead of dropdown
- `public/sw.js` — fix icon paths
- `src/hooks/use-notification-socket.ts` — remove unused constant
- `vite.config.ts` — remove hardcoded host

## 8. Out of Scope

- Full dark mode for the entire app (only bottom nav adapts)
- Swipe gesture to dismiss bottom sheet (use tap-scrim for now)
- Notification pagination / infinite scroll (use existing page size of 15)
- Push notification permission prompt redesign
- New backend endpoints
