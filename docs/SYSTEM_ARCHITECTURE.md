# HR Management System - System Architecture

## High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   React 19   │  │  Inertia.js  │  │ Tailwind CSS │              │
│  │   Components │  │  SPA Router  │  │   Styling    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│         │                  │                   │                     │
│         └──────────────────┴───────────────────┘                    │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │ HTTP/JSON
┌────────────────────────────┼─────────────────────────────────────────┐
│                            ▼                                          │
│                   APPLICATION LAYER                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Laravel 11 Framework                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │ │
│  │  │ Controllers  │  │   Services   │  │  Middleware  │         │ │
│  │  │              │  │              │  │   - Auth     │         │ │
│  │  │ - Leave      │  │ - Leave      │  │   - RBAC     │         │ │
│  │  │ - WFH        │  │ - WFH        │  │   - CORS     │         │ │
│  │  │ - Calendar   │  │ - Calendar   │  │   - Validate │         │ │
│  │  │ - Document   │  │ - Document   │  │              │         │ │
│  │  │ - Onboarding │  │ - Audit      │  │              │         │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │ │
│  │                                                                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │ │
│  │  │   Models     │  │   Policies   │  │   Events     │         │ │
│  │  │  (Eloquent)  │  │    (RBAC)    │  │ (Observers)  │         │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬──────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────────┐
│                            ▼                                          │
│                      DATA LAYER                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     MySQL Database                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │  │
│  │  │    Users     │  │Leave Requests│  │   Documents  │        │  │
│  │  │    Roles     │  │Leave Balances│  │  Audit Logs  │        │  │
│  │  │ Permissions  │  │  WFH Schedule│  │   Holidays   │        │  │
│  │  │              │  │Calendar Events│  │              │        │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   File Storage (Private Disk)                  │  │
│  │            Onboarding Documents, Profile Pictures              │  │
│  └───────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │    Nginx     │  │   PHP-FPM    │  │    Redis     │               │
│  │ (Web Server) │  │   (PHP 8.4)  │  │   (Cache)    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  AWS EC2     │  │   AWS RDS    │  │   AWS S3     │               │
│  │ (Optional)   │  │  (Optional)  │  │  (Optional)  │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Component Breakdown

### 1. **Frontend (Presentation Layer)**

#### **Technology Stack**
- **React 19** - UI component library
- **Inertia.js** - SPA-like experience with server-side routing
- **TailwindCSS 4** - Utility-first styling
- **Framer Motion** - Animations and transitions
- **Vite** - Build tool and dev server

#### **Key Features**
- Server-side rendering (SSR) via Inertia
- Component-based architecture
- Real-time updates via props
- Responsive design (mobile-first)

#### **Page Structure**
```
Pages/
├── Dashboard.jsx           # Main dashboard
├── Calendar/
│   └── Index.jsx          # Unified calendar view
├── Leave/
│   ├── MyLeaves.jsx       # Employee leave view
│   └── Requests.jsx       # Manager approval queue
├── WFH/
│   └── Index.jsx          # WFH scheduler
├── Onboarding/
│   ├── Invites/           # HR invite management
│   └── Submissions/       # HR review submissions
├── Guest/
│   └── Onboarding/        # Guest onboarding portal
└── Demo.jsx               # Public demo presentation
```

---

### 2. **Backend (Application Layer)**

#### **Technology Stack**
- **Laravel 11** - PHP framework
- **PHP 8.4** - Modern PHP features
- **Laravel Sanctum** - API authentication
- **Laravel Policies** - Authorization (RBAC)
- **Eloquent ORM** - Database abstraction

#### **Service Architecture**

```
Services/
├── LeaveRequestService         # Leave workflow logic
├── LeaveBalanceService         # Balance calculations
├── WorkFromHomeService         # WFH scheduling
├── CalendarService             # Calendar aggregation
├── OnboardingDocumentService   # Document operations
├── DocumentAuditService        # Audit logging
├── DataPrivacyService          # GDPR compliance
└── HolidayService             # Holiday management
```

#### **Controllers (MVC Pattern)**

```
Controllers/
├── DashboardController         # Role-based dashboards
├── LeaveController             # Employee leave requests
├── LeaveRequestController      # Manager approvals
├── WorkFromHomeController      # WFH scheduling
├── CalendarController          # Calendar API
├── HolidayController           # Holiday management
├── OnboardingInviteController  # HR invite creation
├── OnboardingSubmissionController # HR review
├── GuestOnboardingController   # Guest submission
└── OnboardingDocumentDownloadController # File access
```

---

### 3. **Database Layer**

#### **Core Tables**

**Users & Authentication**
- `users` - User accounts
- `roles` - Role definitions (Super Admin, HR, Manager, Employee)
- `permissions` - Granular permissions
- `role_user` - Many-to-many role assignments
- `permission_user` - User-specific permission overrides

**Leave Management**
- `leave_types` - Leave type definitions (Vacation, Sick, etc.)
- `leave_balances` - User leave balances
- `leave_requests` - Leave requests and approvals
- `holidays` - Public holidays (140+ countries)

**Work From Home**
- `work_from_home_schedules` - WFH schedules
- `work_from_home_settings` - Organizational settings

**Calendar**
- `calendar_events` - Events (Leave, WFH, Holidays)
- `calendar_event_types` - Event type definitions
- `calendar_user_settings` - User preferences

**Onboarding & Documents**
- `onboarding_invites` - HR-created invites
- `onboarding_submissions` - Guest submissions
- `onboarding_documents` - Uploaded documents

**Security & Compliance**
- `document_access_logs` - Immutable audit trail
- `permission_audit_logs` - Permission changes

---

### 4. **Security Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                 Security Layers                          │
├─────────────────────────────────────────────────────────┤
│  1. Authentication                                       │
│     - Laravel Sanctum (Session + Token)                 │
│     - Secure password hashing (bcrypt)                  │
│     - Remember me tokens                                │
│                                                          │
│  2. Authorization (RBAC)                                 │
│     - Role-based permissions                            │
│     - Laravel Policies                                  │
│     - Middleware: auth, verified, role checks           │
│                                                          │
│  3. Data Protection                                      │
│     - Private disk storage (documents)                  │
│     - SQL injection prevention (Eloquent ORM)           │
│     - XSS protection (Laravel Blade/React escaping)     │
│     - CSRF protection (tokens)                          │
│                                                          │
│  4. Audit & Compliance                                   │
│     - Immutable audit logs (every document access)      │
│     - 7-year retention policy                           │
│     - Legal hold system                                 │
│     - User anonymization (GDPR)                         │
└─────────────────────────────────────────────────────────┘
```

---

### 5. **Data Flow Examples**

#### **Leave Request Flow**

```
Employee (React)
    │
    ▼ POST /leave-requests
LeaveController
    │
    ▼ validate + check balance
LeaveRequestService
    │
    ▼ create request
Database (leave_requests)
    │
    ▼ trigger notification
Manager Dashboard
    │
    ▼ approve/reject
LeaveApprovalController
    │
    ▼ update status
LeaveBalanceService (deduct balance)
    │
    ▼ sync to calendar
CalendarService (create event)
```

#### **Document Upload with Audit Trail**

```
Guest User (React)
    │
    ▼ POST /guest/onboarding/{token}/upload-document
GuestOnboardingController
    │
    ▼ validate + store file
OnboardingDocumentService
    │
    ├─▶ Storage::disk('private')->store()  (Save file)
    │
    └─▶ DocumentAuditService::logAccess()  (Audit log)
        │
        ▼ insert into document_access_logs
        Database (immutable log created)
```

---

## Technology Specifications

### **Frontend Build**
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "@inertiajs/react": "^1.0.0",
    "tailwindcss": "^4.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0"
  }
}
```

### **Backend Requirements**
```
PHP: 8.4+
Laravel: 11.x
Database: MySQL 8.0+
Web Server: Nginx 1.25+ / Apache 2.4+
Cache: Redis (optional)
```

### **Infrastructure**
```
Development: Laravel Herd (macOS)
Production:
  - AWS EC2 (Ubuntu 22.04)
  - Nginx + PHP-FPM
  - MySQL RDS (optional)
  - S3 for file storage (optional)
```

---

## Deployment Architecture

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │  Load Balancer │
              │   (Optional)   │
              └────────────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
    ┌──────────────┐      ┌──────────────┐
    │  Web Server  │      │  Web Server  │
    │   (Nginx)    │      │   (Nginx)    │
    │  + PHP-FPM   │      │  + PHP-FPM   │
    └──────────────┘      └──────────────┘
            │                     │
            └──────────┬──────────┘
                       ▼
              ┌────────────────┐
              │     MySQL      │
              │   (Database)   │
              └────────────────┘
                       │
              ┌────────────────┐
              │  File Storage  │
              │  (Private Disk) │
              └────────────────┘
```

---

## Key Architectural Decisions

### **1. Monolithic Architecture**
**Why:** Simplifies development, deployment, and maintenance for HR system scale.

### **2. Server-Side Rendering with Inertia**
**Why:** SEO benefits, faster initial load, simpler state management than full SPA.

### **3. Role-Based Access Control (RBAC)**
**Why:** Flexible permission system for HR, managers, employees with different access levels.

### **4. Private Disk Storage**
**Why:** Documents stored outside public web root, accessed only through authenticated controllers.

### **5. Immutable Audit Logs**
**Why:** Compliance requirement - logs cannot be modified once created (no `updated_at`).

### **6. Service Layer Pattern**
**Why:** Separates business logic from controllers, reusable across web/API/CLI.

---

## Performance Considerations

### **Caching Strategy**
- Database query caching (Redis)
- Config/route/view caching (production)
- Eloquent model caching for frequently accessed data

### **Optimization**
- Eager loading relationships (avoid N+1 queries)
- Database indexing on foreign keys and search columns
- Asset bundling with Vite
- Image optimization for uploaded documents

### **Scalability**
- Horizontal scaling: Multiple web servers behind load balancer
- Database replication: Read replicas for reporting
- File storage: S3 for distributed access
- Queue system: Background jobs for emails, notifications

---

## Security Compliance

### **Data Protection**
- ✅ Role-based access control (RBAC)
- ✅ Private document storage
- ✅ Immutable audit trail
- ✅ 7-year data retention
- ✅ Legal hold system

### **GDPR Compliance**
- ✅ Data export (Article 20)
- ✅ User anonymization (Article 17)
- ✅ Consent tracking
- ✅ Audit transparency

### **Philippine Labor Law**
- ✅ 7-year document retention
- ✅ Leave balance tracking
- ✅ Employee records management

---

## Integration Points

### **Current Integrations**
- Holiday API (140+ countries)
- Email notifications (Laravel Mail)
- File storage (local/S3 compatible)

### **Future Integrations**
- Slack notifications
- Microsoft Teams calendar sync
- Payroll system API
- SSO/SAML authentication

---

## Monitoring & Logging

### **Application Logs**
- Laravel logs (`storage/logs/laravel.log`)
- Error tracking (optional: Sentry, Bugsnag)
- Performance monitoring (optional: New Relic)

### **Audit Logs**
- Document access logs (immutable)
- Permission change logs
- User activity tracking

### **System Health**
- Server monitoring (CPU, memory, disk)
- Database performance (slow query log)
- Application response times

---

## Backup & Disaster Recovery

### **Database Backups**
- Daily automated backups
- 30-day retention
- Point-in-time recovery capability

### **File Backups**
- Document storage backup
- Synchronized to S3 or backup server

### **Recovery Plan**
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours
- Tested restore procedures

---

## Development Workflow

```
Local Development (Laravel Herd)
    ↓ git push
GitHub Repository
    ↓ (optional CI/CD)
Automated Tests (PHPUnit, Playwright)
    ↓ manual deploy
Production Server (AWS EC2)
```

### **Environment Management**
- **Local:** `.env` (developer machine)
- **Staging:** `.env.staging` (testing environment)
- **Production:** `.env.production` (live system)

---

## Summary

This architecture provides:
- ✅ **Scalable** - Can grow from 10 to 1000+ users
- ✅ **Secure** - Multiple security layers, audit trail
- ✅ **Maintainable** - Clean separation of concerns
- ✅ **Compliant** - GDPR, labor law requirements met
- ✅ **Performant** - Optimized queries, caching strategy
- ✅ **Modern** - Latest React, Laravel, PHP versions

**Tech Stack Summary:**
- Frontend: React 19 + Inertia.js + TailwindCSS
- Backend: Laravel 11 + PHP 8.4
- Database: MySQL 8.0
- Infrastructure: Nginx + PHP-FPM
- Deployment: AWS EC2 or similar
