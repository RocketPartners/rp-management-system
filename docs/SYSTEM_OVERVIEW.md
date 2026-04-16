# RP Management System (HRIS) — System Overview

> **Version:** 0.0.3 | **Last Updated:** April 2026
> **Frontend:** React 19 + TypeScript + Vite | **Backend:** Spring Boot 3.4 + Java 17
> **Auth:** Keycloak 24 (OAuth2/OIDC) | **Database:** PostgreSQL 15

---

## Executive Summary

The RP Management System is a **full-stack Human Resource Information System (HRIS)** built for Rocket Partners. It covers the complete employee lifecycle — from onboarding to daily operations — with enterprise-grade security, an AI assistant, and a super admin audit dashboard.

**Key Numbers:**
- 45+ pages across 15 modules
- 31 REST controllers, 100+ API endpoints
- 60+ granular permissions with role-based + per-user overrides
- 24 database migrations, 20+ tables
- Real-time audit trail with analytics dashboard

---

## Table of Contents

1. [Core Modules](#1-core-modules)
2. [AI Assistant (Most Unique Feature)](#2-ai-assistant)
3. [Onboarding Portal (Encrypted, Token-Based)](#3-onboarding-portal)
4. [Audit Trail & Super Admin Dashboard](#4-audit-trail--super-admin-dashboard)
5. [Security Architecture](#5-security-architecture)
6. [Employee Self-Service](#6-employee-self-service)
7. [Admin & HR Operations](#7-admin--hr-operations)
8. [Social Features](#8-social-features)
9. [Infrastructure & DevOps](#9-infrastructure--devops)
10. [Tech Stack](#10-tech-stack)

---

## 1. Core Modules

| Module | Pages | Description |
|--------|-------|-------------|
| Dashboard | 2 (Employee + Admin) | Role-aware dual dashboard with widgets |
| AI Chat | 1 | Claude-powered assistant with session persistence |
| Calendar | 1 | FullCalendar with multi-type events and filters |
| Leave Management | 8 | Apply, approve, cancel, balance tracking |
| WFH Management | 1 | Schedule, quota tracking, monthly view |
| User Management | 5 | CRUD, approvals, permission matrix |
| Team Management | 3 | Teams, leaders, members |
| Organization | 4 | Departments + positions (hierarchical) |
| Role Management | 1 | Roles, permissions, matrix editor |
| Onboarding | 5 | Invites, portal (4-step), submissions, review |
| Announcements | 1 | Social feed with reactions, comments, images |
| Asset Management | 1 | Inventory, assignments, check-in/out |
| Support Tickets | 1 | Threaded tickets with attachments |
| Audit Trail | 2 | Logs table + analytics dashboard |
| Profile | 1 | Self-service profile editing |

---

## 2. AI Assistant

**The standout feature.** An integrated Claude-powered chat assistant available to every employee.

### What It Does
- Conversational AI assistant embedded directly in the HRIS sidebar
- Persistent chat sessions — employees can revisit past conversations
- Streaming responses for real-time interaction
- Tool action support (function calling for structured operations)

### Technical Architecture
- **Model:** Claude 3 Haiku via Amazon Bedrock (proxied through LaunchCode gateway)
- **Streaming:** Server-Sent Events (SSE) with binary Bedrock stream parsing
- **Persistence:** Sessions and messages stored in PostgreSQL (`ai_chat_sessions`, `ai_chat_messages`)
- **Privacy:** Each user sees only their own sessions

### UX Details
- Sidebar auto-collapses on AI Chat page for immersive experience
- Suggested prompts on empty state
- Scroll-to-bottom button for long conversations
- Session management: create, rename, delete, search
- Beta warning banner

---

## 3. Onboarding Portal

**A complete self-service onboarding flow for new hires — no account needed.**

### How It Works
1. **HR sends invite** — generates a unique token, emails a link
2. **New hire opens portal** — public page, no login required (token-based access)
3. **4-step form:**
   - Personal Information (name, email, phone, address)
   - Government IDs (type, number, dates, document upload)
   - Emergency Contact (name, relationship, phone)
   - Document Upload (required documents per position)
4. **Submit for review** — HR gets notified
5. **HR reviews** — approve/reject submission, approve/reject individual documents
6. **Convert to user** — one-click creates the employee account + Keycloak user

### Security Highlights
- **AES-256 encryption** for all uploaded documents (SSN, IDs, etc.)
- Token-based access — no authentication required for the portal
- Token expiry: 30 days (configurable)
- Stored paths are obfuscated
- Documents decrypted only on authorized download
- Revision workflow — rejected submissions can be resubmitted

---

## 4. Audit Trail & Super Admin Dashboard

**Enterprise-grade activity monitoring for complete system visibility.**

### Audit Logging (Automatic)
- **AOP-based** — every controller action is logged automatically via Spring AOP aspect
- **What's captured:** event name, severity, actor (always resolved from local DB), entity type/ID, HTTP method/status, endpoint, IP address, timestamp
- **Async writes** — fire-and-forget, zero impact on request latency
- **Severity levels:** INFO, WARN, ERROR, CRITICAL
- **Actor resolution:** JWT → email → local DB lookup (consistent names across login/logout/authenticated requests)

### Audit Logs Page
- Full-text search across events and messages
- Filters: severity, entity type, HTTP status, date range
- Expandable rows with full detail (endpoint, IP, actor ID)
- CSV export (up to 10,000 records with current filters)
- Pagination (25 per page)

### Audit Dashboard (Grafana-Inspired)
- **Summary Cards:** Total events, errors, critical events, active users today
- **System Health Panel:** JVM heap (progress bar), database connections, uptime (auto-refreshes every 30s)
- **Activity Over Time:** Area chart showing event volume
- **Error Rate Trend:** Stacked area chart (4xx vs 5xx)
- **Most Used APIs:** Area chart of top 10 endpoints
- **Severity Breakdown:** Donut chart
- **Activity Heatmap:** GitHub-style 7x24 grid (day of week × hour)
- **Active Users Today:** Table with action counts and last activity
- **Recent Sessions:** Login/logout pairs with duration calculation
- **Failed Login Monitor:** Table with IP addresses and timestamps

### Background Features
- **Log Retention:** Auto-cleanup of logs older than 90 days (daily cron at 2 AM, configurable via `AUDIT_RETENTION_DAYS`)
- **Email Alerts:** CRITICAL events trigger email notifications to super admin (via Spring ApplicationEvent)
- **SUPER_ADMIN role** — dedicated role with `AUDIT_LOG_READ` permission

---

## 5. Security Architecture

### Authentication
- **Keycloak 24** — centralized OAuth2/OIDC identity provider
- JWT tokens with configurable expiry
- Google OAuth sign-in support
- Token refresh flow
- Keycloak is the single source of truth for passwords

### Authorization (3 Layers)
1. **Role-Based (RBAC):** SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE
2. **Permission-Based:** 60+ granular permissions (e.g., `LEAVE_APPLICATION_APPROVE`)
3. **Per-User Overrides:** Grant/revoke specific permissions per user with optional expiry and reason tracking

### Permission Matrix
- Visual matrix editor in admin UI
- Shows: from-role permissions, user overrides, effective access
- Override details: who granted, when, reason, expiry

### Method-Level Security
- `@PreAuthorize("hasAuthority('PERMISSION_NAME')")` on every endpoint
- Custom JWT converter bridges Keycloak tokens → local permission matrix
- Frontend `usePermission()` hook mirrors backend checks

### Data Protection
- AES-256 encryption for onboarding documents
- BCrypt password hashing (strength 10)
- Sanitized error responses (GlobalExceptionHandler)
- CORS whitelist configuration
- No sensitive data in JWT claims

---

## 6. Employee Self-Service

### My Dashboard
- Leave balances with color-coded progress bars
- Upcoming and pending leaves
- Assigned assets
- WFH this week count
- Quick action buttons (Apply Leave, View Leaves, My WFH, My Profile)
- Personal profile card

### My Leaves
- Apply for leave (date picker, type selector, duration auto-calculation, reason, attachments)
- View all applications with status filter and year selector
- Edit pending applications
- Cancel approved leaves (triggers cancellation workflow)
- Status tracking: Pending Manager → Pending HR → Approved/Rejected

### My WFH
- View schedules by month with status badges
- Weekly usage vs quota tracking
- Monthly stats (approved/upcoming)
- Add new WFH schedule with reason
- Cancel scheduled WFH

### Calendar
- FullCalendar with day/week/month views
- Event types: leaves, WFH, holidays
- Filter by: department, manager, leave type, country, US state
- See who's on leave/WFH today
- Click events for details
- Add WFH directly from calendar

### My Assets
- View all assigned assets with details
- Check-out/check-in history

### My Profile
- Edit personal information
- Update address and emergency contact
- Change password

---

## 7. Admin & HR Operations

### Admin Dashboard
- Active employees, pending approvals, pending leaves, active teams
- Recent leave applications table
- Recent announcements
- Team overview
- Users on leave today
- Upcoming holidays

### User Management
- Search, filter by status, pagination
- Create users (personal info, department, position, role assignment)
- Approve/reject pending accounts (with email notifications)
- Activate/deactivate/suspend accounts
- Permission matrix management per user
- Bulk operations

### Leave Management (Admin)
- View all leave requests with advanced filters
- 3-tier approval workflow: Manager → HR → Final
- Bulk approve/reject
- Leave type configuration (days, paid/unpaid, requires approval, medical cert thresholds)
- Balance management (adjust, initialize, carry-over)
- Holiday management by country (ICS feed import)

### Organization Management
- Departments: hierarchical (parent-child), manager assignment
- Positions: linked to departments, salary ranges, levels
- Teams: leaders, sub-leaders, members, bulk member management

### Role & Permission Management
- Create/edit roles with permission assignment
- Visual permission matrix
- 60+ granular permissions organized by module

### Asset Management
- Full inventory tracking (categories, specs, depreciation)
- Assignment workflow (check-out with expected return date)
- Assignment history per asset
- Low stock alerts
- Dashboard stats

### Onboarding Management
- Send invites (email with portal link)
- Track invite status (pending/accepted/expired)
- Review submissions (approve/reject per field)
- Review documents (approve/reject individually)
- One-click convert to active employee (creates user + Keycloak account)

---

## 8. Social Features

### Announcements
- Rich text posts with TipTap editor
- Image gallery with lightbox viewer
- Category organization (Company News, Events, Fun, HR Updates, General)
- Pin/unpin important announcements
- **6 emoji reactions** (thumbs up, heart, fire, clap, laugh, wow) with toggle and counts
- **Threaded comments** with nested replies
- Author info display (avatar, name, position)
- Paginated feed with category filtering

### Support Tickets
- Create tickets with: subject, category, priority, description, attachments
- Threaded message history
- File attachments on replies
- Status workflow: Open → Resolved → Closed
- Role-aware: employees see own tickets, admins see all
- Categories: Bug, Feature Request, General Inquiry, Other
- Priority levels: Low, Medium, High, Urgent

### Notifications
- In-app notification system
- Unread count badge
- Mark as read (single or all)
- Reference linking (click to navigate to source)

---

## 9. Infrastructure & DevOps

### Docker Compose Stack
| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| PostgreSQL 15 | postgres:15-alpine | 5432 | Application database |
| PostgreSQL 15 | postgres:15-alpine | (internal) | Keycloak database |
| Keycloak 24 | keycloak:24.0 | 8180 | Identity provider |
| Spring Boot App | Custom Dockerfile | 8080 | Backend API |

### Database
- **PostgreSQL 15** with 24 Flyway migrations
- 20+ tables with proper indexes and constraints
- JSONB columns for flexible data (onboarding, AI chat tools)
- Connection pooling via HikariCP (10 max, 5 idle)

### Monitoring
- Spring Boot Actuator (health, info, metrics, caches)
- System Health endpoint (JVM heap, DB connections, uptime)
- Audit trail with real-time analytics
- Auto-refresh dashboard (30s interval)

### Email
- Gmail SMTP integration (configurable)
- Async email sending
- Used for: onboarding invites, critical audit alerts

---

## 10. Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 8 | Build tool |
| TanStack Query | 5 | Data fetching & caching |
| React Hook Form | 7 | Form management |
| Zod | 4 | Schema validation |
| Shadcn/UI | Latest | Component library |
| Tailwind CSS | 4 | Styling |
| FullCalendar | 6 | Calendar views |
| TipTap | 3 | Rich text editor |
| Recharts | Latest | Data visualization |
| Lucide React | Latest | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 3.4 | Application framework |
| Java | 17 | Language |
| Gradle | 8 | Build tool |
| PostgreSQL | 15 | Database |
| Flyway | Latest | Schema migrations |
| Keycloak | 24 | Identity & access management |
| MapStruct | Latest | DTO mapping |
| Spring AOP | Latest | Audit trail aspect |
| Spring Mail | Latest | Email notifications |
| Spring Security | Latest | OAuth2 resource server |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker & Docker Compose | Containerization |
| Keycloak | OAuth2/OIDC identity provider |
| Amazon Bedrock (via LaunchCode) | AI model hosting (Claude Haiku) |
| Gmail SMTP | Email delivery |

---

## Unique Selling Points

1. **AI Assistant** — Claude-powered chat integrated into the HRIS, available to every employee
2. **Encrypted Onboarding Portal** — new hires complete onboarding without an account, all documents AES-256 encrypted
3. **Grafana-Style Audit Dashboard** — enterprise-grade monitoring with heatmaps, session tracking, system health
4. **3-Layer Permission System** — RBAC + granular permissions + per-user overrides with expiry
5. **Social Announcements** — emoji reactions and threaded comments on company posts
6. **Automatic Audit Trail** — zero-code AOP-based logging of every system action
7. **Real-Time Streaming AI** — SSE-based streaming responses from Claude via Bedrock
8. **Holiday ICS Import** — automatic holiday population by country from ICS feeds
9. **Complete Leave Lifecycle** — application → manager approval → HR approval → cancellation workflow
10. **Self-Service Everything** — employees manage their own leaves, WFH, profile, assets, and support tickets

---

*Built by Rocket Partners Engineering Team*
