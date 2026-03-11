# System Architecture Diagram - Visual Specifications

## For Designers/Presentation

### Diagram 1: Simple Overview (Recommended for Slide 3)

**Dimensions:** 1920x1080px (16:9 aspect ratio)
**Style:** Modern, clean, corporate colors

```
┌─────────────────────────────────────────────────────────────────┐
│                    HR MANAGEMENT SYSTEM                          │
│                   System Architecture                            │
└─────────────────────────────────────────────────────────────────┘

┌────────────────┐
│     Users      │
│  👤 Employee   │
│  👔 Manager    │
│  ⚙️  HR Admin  │
└───────┬────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND (User Interface)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │  React   │  │ Inertia  │  │ Tailwind │                       │
│  │    19    │  │   .js    │  │   CSS    │                       │
│  └──────────┘  └──────────┘  └──────────┘                       │
│                                                                   │
│  📊 Dashboard  📅 Calendar  📝 Leave  🏠 WFH  📄 Documents       │
└────────────────────────────┬─────────────────────────────────────┘
                             │ API (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Business Logic)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Laravel 11 Framework (PHP 8.4)                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  Controllers    Services         Middleware                      │
│  ┌──────────┐  ┌──────────┐    ┌──────────┐                    │
│  │ Leave    │  │ Leave    │    │  Auth    │                    │
│  │ WFH      │  │ Calendar │    │  RBAC    │                    │
│  │ Document │  │ Audit    │    │ Validate │                    │
│  └──────────┘  └──────────┘    └──────────┘                    │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE & STORAGE                            │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │   MySQL Database     │  │   File Storage       │            │
│  │                      │  │   (Private Disk)     │            │
│  │  • Users & Roles     │  │                      │            │
│  │  • Leave Requests    │  │  • Documents         │            │
│  │  • WFH Schedules     │  │  • Profile Pics      │            │
│  │  • Audit Logs        │  │  • Attachments       │            │
│  │  • Calendar Events   │  │                      │            │
│  └──────────────────────┘  └──────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE (AWS / Server)                    │
│  Nginx (Web Server)  │  PHP-FPM  │  Redis (Cache)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Color Palette Recommendations

**Primary Colors:**
- **Blue** (#3B82F6) - Trust, technology, corporate
- **Green** (#10B981) - Success, approvals
- **Gray** (#6B7280) - Neutral, backgrounds

**Accent Colors:**
- **Purple** (#8B5CF6) - Frontend layer
- **Orange** (#F59E0B) - Backend layer
- **Teal** (#14B8A6) - Database layer
- **Indigo** (#6366F1) - Infrastructure layer

---

## Box/Component Styling

### Layer Cards
```css
- Background: White (#FFFFFF)
- Border: 2px solid [layer color]
- Border Radius: 12px
- Shadow: 0 4px 6px rgba(0,0,0,0.1)
- Padding: 24px
- Font: Inter, system-ui
```

### Technology Badges
```css
- Background: Gradient (primary to lighter shade)
- Border Radius: 8px
- Padding: 12px 20px
- Font: Bold, 14px
- Icon: 24x24px
```

### Arrows/Connectors
```css
- Style: Solid line, 3px
- Color: #6B7280
- Arrow Head: Filled triangle
- Animation: Subtle flow (optional)
```

---

## Diagram 2: Detailed Component View

**For technical audiences or appendix slides**

```
USER LAYER
├─ Employee Portal
│  ├─ Dashboard
│  ├─ My Leaves
│  ├─ WFH Scheduler
│  └─ My Documents
├─ Manager Portal
│  ├─ Team Dashboard
│  ├─ Approval Queue
│  ├─ Team Calendar
│  └─ Reports
└─ HR Admin Portal
   ├─ Organization Dashboard
   ├─ Leave Management
   ├─ Onboarding
   └─ User Management

FRONTEND LAYER
├─ React 19 Components
│  ├─ Pages (Dashboard, Calendar, Leave, WFH)
│  ├─ Components (Buttons, Cards, Modals)
│  └─ Layouts (Authenticated, Guest, Demo)
├─ Inertia.js Router
│  └─ Server-side routing with SPA feel
├─ State Management
│  └─ Inertia props + React hooks
└─ UI Framework
   ├─ TailwindCSS 4 (Styling)
   ├─ Framer Motion (Animations)
   └─ Lucide Icons

BACKEND LAYER
├─ API Layer
│  ├─ RESTful Routes
│  ├─ JSON Responses
│  └─ Sanctum Authentication
├─ Application Services
│  ├─ LeaveRequestService
│  ├─ WorkFromHomeService
│  ├─ CalendarService
│  ├─ DocumentAuditService
│  └─ DataPrivacyService
├─ Controllers (MVC)
│  ├─ DashboardController
│  ├─ LeaveController
│  ├─ WorkFromHomeController
│  ├─ CalendarController
│  └─ OnboardingController
├─ Authorization
│  ├─ Roles (Super Admin, HR, Manager, Employee)
│  ├─ Permissions (Granular)
│  └─ Policies (Laravel)
└─ Middleware
   ├─ Authentication
   ├─ RBAC Check
   ├─ CSRF Protection
   └─ Rate Limiting

DATA LAYER
├─ MySQL Database
│  ├─ Users & Authentication
│  │  ├─ users
│  │  ├─ roles
│  │  ├─ permissions
│  │  └─ role_user
│  ├─ Leave Management
│  │  ├─ leave_types
│  │  ├─ leave_balances
│  │  └─ leave_requests
│  ├─ Work From Home
│  │  ├─ work_from_home_schedules
│  │  └─ work_from_home_settings
│  ├─ Calendar
│  │  ├─ calendar_events
│  │  └─ holidays
│  ├─ Onboarding
│  │  ├─ onboarding_invites
│  │  ├─ onboarding_submissions
│  │  └─ onboarding_documents
│  └─ Security & Audit
│     ├─ document_access_logs (immutable)
│     └─ permission_audit_logs
└─ File Storage
   ├─ Private Disk (local or S3)
   ├─ Onboarding Documents
   ├─ Profile Pictures
   └─ Attachments

INFRASTRUCTURE LAYER
├─ Web Server
│  └─ Nginx 1.25+ (reverse proxy, static files)
├─ Application Server
│  └─ PHP-FPM 8.4 (process requests)
├─ Cache Layer
│  └─ Redis (session, cache, queues)
├─ Deployment
│  ├─ Development: Laravel Herd
│  └─ Production: AWS EC2 / VPS
└─ Monitoring
   ├─ Application Logs
   ├─ Error Tracking
   └─ Performance Monitoring
```

---

## Icons to Use

**Frontend Layer:**
- React: ⚛️ (React logo)
- Inertia: 🔗 (link/chain)
- Tailwind: 🎨 (palette)

**Backend Layer:**
- Laravel: 🔴 (Laravel logo)
- PHP: 🐘 (elephant)
- Services: ⚙️ (gear)

**Database Layer:**
- MySQL: 🗄️ (database)
- Storage: 📁 (folder)
- Audit: 📋 (clipboard)

**Infrastructure Layer:**
- Server: 🖥️ (monitor)
- Cloud: ☁️ (cloud)
- Security: 🔒 (lock)

---

## Diagram 3: Data Flow Example (Leave Request)

**For showing how the system works**

```
┌─────────────┐
│  Employee   │
│   (React)   │
└──────┬──────┘
       │ 1. Submit Leave Request
       ▼
┌─────────────────────┐
│ LeaveController     │
│ (Laravel Backend)   │
└──────┬──────────────┘
       │ 2. Validate & Check Balance
       ▼
┌─────────────────────┐
│ LeaveRequestService │
│ (Business Logic)    │
└──────┬──────────────┘
       │ 3. Create Request
       ▼
┌─────────────────────┐
│  MySQL Database     │
│  (leave_requests)   │
└──────┬──────────────┘
       │ 4. Trigger Notification
       ▼
┌─────────────────────┐
│  Manager Portal     │
│  (Approval Queue)   │
└──────┬──────────────┘
       │ 5. Approve/Reject
       ▼
┌─────────────────────┐
│ LeaveBalanceService │
│ (Deduct Balance)    │
└──────┬──────────────┘
       │ 6. Sync to Calendar
       ▼
┌─────────────────────┐
│  Team Calendar      │
│  (Event Created)    │
└─────────────────────┘
```

---

## Tools to Create Diagrams

### Option 1: Professional Design Tools
- **Figma** (recommended) - Free, collaborative
- **Adobe Illustrator** - Professional quality
- **Sketch** - macOS design tool

### Option 2: Diagram-Specific Tools
- **Lucidchart** - Web-based, templates available
- **draw.io (diagrams.net)** - Free, open-source
- **Miro** - Collaborative whiteboard

### Option 3: Code-Based (Developers)
- **Mermaid.js** - Markdown-based diagrams
- **PlantUML** - Text-to-diagram
- **D3.js** - Custom JavaScript diagrams

---

## Quick Figma Template

1. **Create artboard:** 1920x1080px
2. **Add background:** Light gradient (#F9FAFB to #FFFFFF)
3. **Create layers:**
   - Header: "System Architecture" (bold, 48px)
   - 4 Layer cards (Frontend, Backend, Database, Infrastructure)
   - Technology badges inside each card
   - Connecting arrows between layers
4. **Add icons:** Use Lucide, Heroicons, or Font Awesome
5. **Export:** PNG (high quality) or SVG (vector)

---

## File Naming Convention

```
system-architecture-simple.png        # For slide 3
system-architecture-detailed.png      # For appendix
system-architecture-dataflow.png      # For explaining workflow
```

---

## Presentation Tips

**Slide 3: System Architecture**
- Keep it simple (use Diagram 1)
- Highlight key technologies (React, Laravel, MySQL)
- Show 4 clear layers
- Use arrows to show data flow
- Time: 60-90 seconds

**Talking Points:**
1. "Our system follows a modern 4-layer architecture"
2. "Frontend: React 19 with Inertia for fast, responsive UI"
3. "Backend: Laravel 11 handles all business logic securely"
4. "Database: MySQL stores everything with full audit trail"
5. "Deployed on AWS for reliability and scalability"

---

## Example Screenshot Placeholder Text

Until diagram is created, use text:

```
┌──────────────────────────────────────────┐
│     HR MANAGEMENT SYSTEM ARCHITECTURE    │
│                                          │
│  Frontend: React 19 + Inertia.js        │
│       ↓                                  │
│  Backend: Laravel 11 + PHP 8.4          │
│       ↓                                  │
│  Database: MySQL + File Storage         │
│       ↓                                  │
│  Infrastructure: AWS Cloud              │
└──────────────────────────────────────────┘
```

Or use a professional placeholder:
- "System Architecture Diagram"
- "Modern 4-Layer Architecture"
- "Scalable & Secure Design"
