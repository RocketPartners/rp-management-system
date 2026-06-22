# HRIS-39: Tickets & Notification System Design

## Overview

Port the Laravel ticket/support system to Spring Boot with enhancements: file attachments, email notifications, and a reusable notification module with WebSocket real-time push. The notification backend is scaffolded for all features but only wired to tickets in this ticket.

## Scope

### New Backend Files

| File | Purpose |
|------|---------|
| `V19__create_tickets_and_notifications.sql` | Flyway migration for tickets, ticket_messages, ticket_attachments, notifications |
| `Ticket.java` | Entity with status/category/priority enums |
| `TicketMessage.java` | Entity for conversation threading |
| `TicketAttachment.java` | Entity for file metadata |
| `Notification.java` | Entity for in-app notifications (reusable) |
| `TicketRepository.java` | Custom queries for admin vs employee filtering |
| `TicketMessageRepository.java` | Standard repository |
| `TicketAttachmentRepository.java` | Standard repository |
| `NotificationRepository.java` | Queries for unread count, user notifications |
| `TicketService.java` | Interface |
| `TicketServiceImpl.java` | Business logic: CRUD, messages, attachments, status workflow |
| `NotificationService.java` | Interface |
| `NotificationServiceImpl.java` | send() → DB + WebSocket + Email |
| `StorageService.java` | Interface for file storage abstraction |
| `LocalStorageService.java` | Local filesystem implementation |
| `TicketController.java` | REST endpoints for tickets |
| `NotificationController.java` | REST endpoints for notifications |
| `FileController.java` | Serve stored files |
| `WebSocketConfig.java` | STOMP over SockJS configuration |
| `EmailService.java` | Async email sending with templates |
| DTOs: `CreateTicketRequest`, `AddMessageRequest`, `UpdateStatusRequest`, `TicketResponse`, `TicketDetailResponse`, `TicketMessageResponse`, `TicketAttachmentResponse`, `NotificationResponse` |

### Modified Backend Files

| File | Change |
|------|--------|
| `DataSeeder.java` | Add seed data for sample tickets, messages, notifications |
| `SecurityConfig.java` | Allow `/ws/**` WebSocket handshake endpoint |
| `application.yml` | Add file upload config, email config, WebSocket config |

### Frontend Files

| File | Change |
|------|--------|
| `src/pages/Support.tsx` | **Rewrite** from Support.jsx — TSX, TanStack Query, spring-boot-api, file uploads |
| `src/router.tsx` | Wire `/support` route to Support component |
| `src/contexts/auth-context.tsx` | Add TICKET resource aliases |

### Untouched

- Notification frontend (bell icon, dropdown, WebSocket client) — scaffolded in backend only
- All other existing features

---

## Database Schema

### `tickets`

```sql
CREATE TABLE tickets (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    subject         VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    category        VARCHAR(20) NOT NULL DEFAULT 'other',
    priority        VARCHAR(20) NOT NULL DEFAULT 'medium',
    status          VARCHAR(20) NOT NULL DEFAULT 'open',
    resolved_at     TIMESTAMP,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

- **category** enum: `bug`, `feature`, `question`, `other`
- **priority** enum: `low`, `medium`, `high`, `critical`
- **status** enum: `open`, `in_progress`, `resolved`, `closed`

### `ticket_messages`

```sql
CREATE TABLE ticket_messages (
    id              BIGSERIAL PRIMARY KEY,
    ticket_id       BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    is_support      BOOLEAN NOT NULL DEFAULT FALSE,
    message         TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### `ticket_attachments`

```sql
CREATE TABLE ticket_attachments (
    id              BIGSERIAL PRIMARY KEY,
    ticket_id       BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
    message_id      BIGINT REFERENCES ticket_messages(id) ON DELETE CASCADE,
    file_name       VARCHAR(255) NOT NULL,
    stored_path     VARCHAR(500) NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    file_size       BIGINT NOT NULL,
    uploaded_by     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

- Either `ticket_id` or `message_id` is set (not both)

### `notifications`

```sql
CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    reference_type  VARCHAR(50),
    reference_id    BIGINT,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

### Permissions

```sql
INSERT INTO permissions (name) VALUES ('TICKET_VIEW'), ('TICKET_CREATE'), ('TICKET_MANAGE');
-- TICKET_VIEW + TICKET_CREATE → all roles
-- TICKET_MANAGE → super-admin, admin, hr-manager
```

---

## Backend Architecture

### Storage Module

```
StorageService (interface)
├── store(MultipartFile file, String directory) → String storedPath
├── retrieve(String storedPath) → Resource
├── delete(String storedPath) → void
└── getUrl(String storedPath) → String

LocalStorageService implements StorageService
└── Stores to: {upload-dir}/{directory}/{uuid}_{originalFilename}
└── Config: app.storage.upload-dir=/uploads
```

To swap to S3: create `S3StorageService implements StorageService`, annotate with `@Primary`. Zero changes to calling code.

### Ticket Module

**TicketService methods:**

- `list(userId, isAdmin, status, category, priority, search, page, size)` → `PagedResponse<TicketResponse>`
  - Employees: filtered by `user_id = currentUser`
  - Admins (TICKET_MANAGE): see all tickets
  - Optional filters: status, category, priority, search (subject/description)
- `getById(ticketId, userId, isAdmin)` → `TicketDetailResponse`
  - Includes messages (ordered by created_at ASC) and attachments
  - Authorization: owner or admin
- `create(request, files, userId)` → `TicketResponse`
  - Validates fields, stores attachments via StorageService
  - Default status: `open`
- `addMessage(ticketId, request, files, userId)` → `TicketMessageResponse`
  - Authorization: ticket owner or admin
  - Auto-detect `is_support` based on user roles
  - Store attachments if provided
  - Trigger notification to other party
- `updateStatus(ticketId, newStatus, userId)` → `TicketResponse`
  - Admin only (TICKET_MANAGE)
  - Set `resolved_at = now()` when status → resolved/closed
  - Clear `resolved_at = null` when status → open/in_progress
  - Trigger notification to ticket creator

**Notification triggers from tickets:**
- `addMessage` by support → notify ticket creator: "New reply on your ticket: {subject}"
- `addMessage` by employee → notify all admins: "New message on ticket: {subject}" (or just the last replier)
- `updateStatus` → notify ticket creator: "Ticket status changed to {status}"

### Notification Module

**NotificationService.send():**

```java
void send(Long userId, String type, String title, String message, String refType, Long refId);
```

Execution flow:
1. **DB** — Save `Notification` entity
2. **WebSocket** — Push JSON payload to `/user/{userId}/notifications` via `SimpMessagingTemplate`
3. **Email** — Async (`@Async`) send via `JavaMailSender` using Thymeleaf HTML template

**NotificationController endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | Paginated list for current user |
| GET | `/notifications/unread-count` | `{ count: N }` for badge |
| PATCH | `/notifications/{id}/read` | Mark single as read |
| PATCH | `/notifications/read-all` | Mark all as read |

### WebSocket Configuration

- **Handshake endpoint:** `/ws` (SockJS fallback)
- **STOMP broker:** `/topic`, `/user`
- **App prefix:** `/app`
- **User destination:** `/user/{userId}/notifications`
- **Auth:** JWT token passed as query param on handshake, validated in `ChannelInterceptor`

### Email Configuration

```yaml
app:
  notifications:
    email:
      enabled: true
      from: noreply@rocketpartners.com
spring:
  mail:
    host: ${SMTP_HOST:smtp.gmail.com}
    port: ${SMTP_PORT:587}
    username: ${SMTP_USERNAME:}
    password: ${SMTP_PASSWORD:}
```

Email can be disabled via `app.notifications.email.enabled=false` for local dev.

---

## API Endpoints

### Ticket Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tickets` | Authenticated | List tickets (own or all for admin) |
| GET | `/tickets/{id}` | Owner or TICKET_MANAGE | Detail with messages + attachments |
| POST | `/tickets` | Authenticated | Create (multipart: ticket JSON + files) |
| POST | `/tickets/{id}/messages` | Owner or TICKET_MANAGE | Add reply (multipart: message JSON + files) |
| PATCH | `/tickets/{id}/status` | TICKET_MANAGE | Change status |

### Notification Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Authenticated | User's notifications (paginated) |
| GET | `/notifications/unread-count` | Authenticated | Unread count |
| PATCH | `/notifications/{id}/read` | Authenticated | Mark as read |
| PATCH | `/notifications/read-all` | Authenticated | Mark all as read |

### File Endpoint

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/files/**` | Authenticated | Download/serve stored file |

---

## Frontend

### Support.tsx (rewrite from Support.jsx)

- Convert to TSX with full TypeScript interfaces
- Replace Inertia `usePage()` with TanStack Query
- Replace axios with `apiGet`, `apiPost`, `apiPatch`, `apiPostFormData` from spring-boot-api.ts
- Add file upload to create ticket dialog and message input
- Display attachment chips with download links
- Keep the existing split-panel UI layout (ticket list + conversation)
- Use `usePermission()` for admin checks

### auth-context.tsx additions

```typescript
TICKET: ['tickets', 'support'],
// EXTRA_ALIASES:
TICKET_MANAGE: ['tickets.manage', 'tickets.update-status'],
```

### router.tsx

Replace `{ path: '/support', element: <ComingSoon /> }` with the Support component.

---

## Design Decisions

1. **StorageService interface** — single abstraction point for file storage. Local now, S3 later with one class swap.
2. **Notifications are generic** — `type` + `reference_type` + `reference_id` pattern lets any feature create notifications without schema changes.
3. **WebSocket uses STOMP** — Spring's built-in support, user-scoped destinations, JWT auth on handshake.
4. **Email is async** — `@Async` annotation prevents email failures from blocking API responses.
5. **Email is toggleable** — disabled via config for local dev to avoid SMTP dependency.
6. **Attachments are polymorphic** — can belong to either a ticket or a message via nullable FKs.
7. **No notification frontend** — backend is fully scaffolded (DB + REST + WebSocket + Email), frontend notification UI is deferred to a future ticket.
8. **Support.jsx → Support.tsx** — full TSX rewrite following the same pattern as all other ported pages.

---

## Implementation Order

1. Flyway migration V19 (tickets + ticket_messages + ticket_attachments + notifications + permissions)
2. StorageService interface + LocalStorageService
3. Ticket entities + repositories
4. Notification entity + repository
5. NotificationService (DB + WebSocket + Email)
6. WebSocket config + JWT auth interceptor
7. Email config + templates
8. TicketService (CRUD, messages, attachments, status workflow, notification triggers)
9. Controllers (Ticket, Notification, File)
10. DataSeeder updates (sample tickets, messages)
11. Test all backend endpoints
12. Frontend: auth-context.tsx TICKET aliases
13. Frontend: Support.tsx rewrite from JSX
14. Frontend: router.tsx wiring
15. End-to-end testing
