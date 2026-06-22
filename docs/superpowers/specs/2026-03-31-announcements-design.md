# HRIS-40: Announcements — Design Spec

## Overview

A social feed-style announcements system where anyone with the `ANNOUNCEMENT_CREATE` permission can post rich-text announcements with inline images/GIFs and gallery attachments. All employees can react (Slack-style emoji reactions) and comment (YouTube-style one-level threading). Posts are categorized, pinnable, and displayed in a card-based feed with pinned posts first.

---

## Backend

### Database Schema (Flyway Migration)

**`announcements`**

| Column | Type | Constraints |
|--------|------|------------|
| id | BIGSERIAL | PK |
| title | VARCHAR(255) | NOT NULL |
| body | TEXT | NOT NULL, HTML from Tiptap |
| category | VARCHAR(50) | NOT NULL, DEFAULT 'GENERAL' |
| is_pinned | BOOLEAN | NOT NULL, DEFAULT false |
| author_id | BIGINT | FK → users, NOT NULL |
| published_at | TIMESTAMP | NULLABLE (null = draft) |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Category enum values: `COMPANY_NEWS`, `EVENTS`, `FUN`, `HR_UPDATES`, `GENERAL`

**`announcement_images`**

| Column | Type | Constraints |
|--------|------|------------|
| id | BIGSERIAL | PK |
| announcement_id | BIGINT | FK → announcements, NOT NULL, ON DELETE CASCADE |
| file_path | VARCHAR(500) | NOT NULL |
| file_name | VARCHAR(255) | NOT NULL |
| sort_order | INT | NOT NULL, DEFAULT 0 |
| created_at | TIMESTAMP | NOT NULL |

**`announcement_reactions`**

| Column | Type | Constraints |
|--------|------|------------|
| id | BIGSERIAL | PK |
| announcement_id | BIGINT | FK → announcements, NOT NULL, ON DELETE CASCADE |
| user_id | BIGINT | FK → users, NOT NULL |
| emoji | VARCHAR(20) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| | | UNIQUE(announcement_id, user_id, emoji) |

Supported emojis: `thumbs_up`, `heart`, `fire`, `clap`, `laugh`, `wow`

**`announcement_comments`**

| Column | Type | Constraints |
|--------|------|------------|
| id | BIGSERIAL | PK |
| announcement_id | BIGINT | FK → announcements, NOT NULL, ON DELETE CASCADE |
| user_id | BIGINT | FK → users, NOT NULL |
| parent_id | BIGINT | FK → announcement_comments, NULLABLE (null = top-level) |
| body | TEXT | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

**Permission seed** (same migration): Insert `ANNOUNCEMENT_CREATE` into `permissions` table, assign to ADMIN role.

### Entities

- `Announcement` — extends `BaseEntity`, relationships: `@ManyToOne author`, `@OneToMany images`, `@OneToMany reactions`, `@OneToMany comments`
- `AnnouncementImage` — extends `BaseEntity`, `@ManyToOne announcement`
- `AnnouncementReaction` — no BaseEntity (has own id + created_at only), `@ManyToOne announcement`, `@ManyToOne user`
- `AnnouncementComment` — extends `BaseEntity`, `@ManyToOne announcement`, `@ManyToOne user`, `@ManyToOne parent` (self-ref)

### API Endpoints

#### Announcements CRUD

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/announcements` | Authenticated | Paginated feed. Pinned first, then by publishedAt DESC. Query params: `category` (optional filter), `search` (optional, searches title+body), `page`, `size` (default 10) |
| GET | `/announcements/{id}` | Authenticated | Single post with full detail |
| POST | `/announcements` | `ANNOUNCEMENT_CREATE` | Create. Multipart: JSON part (title, body, category) + optional image files |
| PUT | `/announcements/{id}` | `ANNOUNCEMENT_CREATE` + (author or admin) | Update |
| DELETE | `/announcements/{id}` | `ANNOUNCEMENT_CREATE` + (author or admin) | Delete (cascades images, reactions, comments) |
| PATCH | `/announcements/{id}/pin` | `USER_READ` (admin) | Toggle is_pinned |

#### Reactions

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/announcements/{id}/reactions` | Authenticated | Body: `{ "emoji": "heart" }`. Toggle — if exists, removes it; if not, adds it |
| GET | `/announcements/{id}/reactions` | Authenticated | Returns reaction counts + user's own reactions |

#### Comments

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/announcements/{id}/comments` | Authenticated | All comments with replies nested under parent. Ordered by createdAt ASC |
| POST | `/announcements/{id}/comments` | Authenticated | Body: `{ "body": "...", "parentId": null }`. parentId for replies |
| DELETE | `/announcements/{id}/comments/{commentId}` | Own comment or admin | Delete comment (and its replies if top-level) |

#### Image Upload

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/uploads/images` | Authenticated | Multipart file upload. Validates image types (jpg, png, gif, webp). Max 5MB. Returns `{ "url": "/uploads/images/uuid-filename.jpg" }`. Used by Tiptap inline embeds and gallery |

Image storage: Local filesystem at `./uploads/images/` inside the Docker container, mounted as a volume. Served via a static resource handler mapped to `/uploads/**`.

#### Feed Response Shape

```json
{
  "content": [
    {
      "id": 1,
      "title": "Welcome to Q2!",
      "body": "<p>Exciting quarter ahead...</p>",
      "category": "COMPANY_NEWS",
      "isPinned": true,
      "authorId": 1,
      "authorName": "Marco Tan",
      "authorPosition": "HR Admin",
      "authorImageUrl": null,
      "publishedAt": "2026-03-31T09:00:00",
      "images": [
        { "id": 1, "url": "/uploads/images/abc.jpg", "fileName": "team.jpg", "sortOrder": 0 }
      ],
      "reactions": {
        "heart": 5,
        "fire": 3,
        "thumbs_up": 12
      },
      "userReactions": ["heart"],
      "commentsCount": 8,
      "createdAt": "2026-03-31T09:00:00"
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 25,
  "totalPages": 3,
  "first": true,
  "last": false
}
```

#### Single Post Response (includes comments)

Same as feed item but adds:
```json
{
  "comments": [
    {
      "id": 1,
      "userId": 5,
      "userName": "Ana Santos",
      "userPosition": "Senior Engineer",
      "userImageUrl": null,
      "body": "This is amazing!",
      "parentId": null,
      "createdAt": "2026-03-31T10:00:00",
      "replies": [
        {
          "id": 2,
          "userId": 1,
          "userName": "Marco Tan",
          "userPosition": "HR Admin",
          "userImageUrl": null,
          "body": "Thanks Ana!",
          "parentId": 1,
          "createdAt": "2026-03-31T10:30:00"
        }
      ]
    }
  ]
}
```

### Service Layer

- `AnnouncementService` — CRUD operations, feed query with pinned-first ordering, authorization checks (author or admin for edit/delete)
- `AnnouncementReactionService` — toggle reaction, get reaction summary with user's own reactions
- `AnnouncementCommentService` — create/delete comments, fetch threaded comments
- `FileUploadService` — handle multipart image upload, validate type/size, store to filesystem, return URL

### Dashboard Integration

Update `DashboardServiceImpl`:
- `announcementsCount` in `MyDashboardResponse`: count of announcements published in the last 7 days (replaces hardcoded 0)
- Admin tab "Announcements" section: fetch latest 3 announcements (title, authorName, publishedAt, total reaction count)

Add to `AdminDashboardResponse`:
```java
// Replace List<Object> announcements with:
private List<AnnouncementPreview> recentAnnouncements;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public static class AnnouncementPreview {
    private Long id;
    private String title;
    private String authorName;
    private String category;
    private LocalDateTime publishedAt;
    private int totalReactions;
}
```

### Test Data Seeder

Add to existing `DataSeeder.java` (new `seedAnnouncements()` method):

8 sample announcements with varied categories, reactions from different seeded users, and threaded comments:

1. "Welcome to Q2 — Big Things Ahead!" — COMPANY_NEWS, pinned, by Marco Tan, 16 reactions, 4 comments (2 with replies)
2. "Friday Fun: Share Your Workspace Setup!" — EVENTS, by Design Lead, 18 reactions, 6 comments
3. "New Health & Wellness Benefits Starting April" — HR_UPDATES, pinned, by HR Manager, 25 reactions, 3 comments
4. "Hack Week 2026 — Sign Up Now!" — EVENTS, by Lead Engineer 1, 28 reactions, 3 comments (1 with reply)
5. "Meme Monday: When the Deploy Works on First Try" — FUN, by Junior Dev, 40 reactions, 8 comments (3 with replies)
6. "Q1 All-Hands Meeting Recap" — COMPANY_NEWS, by Marco Tan, 10 reactions, 2 comments
7. "Office Lunch Rotation Schedule — April" — GENERAL, by HR Coordinator, 5 reactions
8. "Shoutout: Team Alpha Shipped the Dashboard!" — FUN, by PM, 37 reactions, 5 comments (2 with replies)

Reactions distributed across seeded users with realistic variety (more laughs on FUN posts, more hearts on HR posts, etc.).

---

## Frontend

### New Page: `/announcements`

File: `frontend/src/pages/Announcements/Index.tsx`

#### Layout

Follows the same page structure as other pages (header with icon + title, content area with max-w-7xl). Creative additions:

**Header:**
- Megaphone icon (lucide `Megaphone`) with gradient blue-purple background on the icon badge
- Title: "Announcements"
- Subtitle: "A space for the team to share updates, wins, and good vibes"
- "New Post" button (permission-gated: `announcements.create`) — opens create dialog

**Category Filter:**
- Horizontal pill tabs below header: All | Company News | Events | Fun | HR Updates | General
- "All" is default, clicking a category filters the feed
- Active tab uses a filled style, inactive uses outline

**Feed:**
- Card-based, full-width cards with rounded-xl corners
- Pinned posts shown first with a subtle left blue accent border and small "Pinned" badge
- Cards have generous padding (p-6), subtle hover shadow transition
- Paginated with "Load More" button at bottom (not infinite scroll — simpler)

#### Announcement Card

```
┌────────────────────────────────────────────────────────────┐
│ [avatar] Marco Tan                                    [···]│
│          HR Admin · Company News · 2 hours ago         menu│
│                                                            │
│  Welcome to Q2 — Big Things Ahead!          ← title, bold │
│                                                            │
│  <rendered HTML body with inline images/GIFs>              │
│                                                            │
│  ┌──────────────────────────────────────┐                  │
│  │ [📸 img1] [📸 img2] [📸 img3]        │  ← gallery row  │
│  └──────────────────────────────────────┘                  │
│                                                            │
│  ❤️ 12  🔥 5  👏 3  😂 1               💬 8 comments       │
│                                                            │
│  ┌──────────────────────────────────────────────────┐      │
│  │ [👍] [❤️] [🔥] [👏] [😂] [😮]                    │      │
│  └──────────────────────────────────────────────────┘      │
│                                                            │
│  ▼ View 8 comments                                         │
│    ┌─────────────────────────────────────────────┐         │
│    │ [av] Ana Santos · 2h ago                    │         │
│    │ This is amazing! Can't wait!     [Reply]    │         │
│    │   └─ [av] Marco Tan · 1h ago                │         │
│    │     Thanks Ana! Details coming soon          │         │
│    ├─────────────────────────────────────────────┤         │
│    │ [av] Jose Cruz · 1h ago                     │         │
│    │ Let's gooo!                      [Reply]    │         │
│    └─────────────────────────────────────────────┘         │
│    [avatar] Write a comment...              [Send]         │
└────────────────────────────────────────────────────────────┘
```

**Card details:**
- Author section: 40px avatar circle (initials or image), name bold, position + category badge + relative time in gray
- Three-dot menu (DropdownMenu): Edit, Delete (only for own posts or admins), Pin/Unpin (admins only)
- Title: text-xl font-bold
- Body: rendered with `dangerouslySetInnerHTML` from Tiptap HTML. Prose styling for readability (sensible line-height, image max-width)
- Gallery: horizontal row of rounded thumbnails (max-h-48, object-cover). Click opens image in a Dialog overlay (lightbox)
- Reaction summary: row of emoji + count badges. User's active reactions have a highlighted background (e.g., blue-100 ring)
- Reaction picker: row of 6 emoji buttons. Click toggles reaction via API. Optimistic update with TanStack Query mutation
- Comments: collapsed by default. "View N comments" button expands the section
- Comment thread: top-level comments with avatar, name, time, body, Reply button. Replies indented with a left border line
- Comment input: avatar + text input + Send button at the bottom of the comment section

#### Create/Edit Dialog

File: `frontend/src/pages/Announcements/CreateEditDialog.tsx`

Uses shadcn Dialog component:
- Title input
- Category select dropdown (Company News, Events, Fun, HR Updates, General)
- Tiptap editor with toolbar: Bold, Italic, Underline, H1, H2, Link, Image (upload), Bullet List, Ordered List, Blockquote, Code Block
- Image upload button in Tiptap toolbar calls `/uploads/images`, inserts returned URL as inline image
- Gallery section below editor: drag-and-drop area or "Add Images" button for gallery attachments
- Cancel + Publish buttons
- Edit mode: pre-fills all fields, button says "Save Changes"

#### Tiptap Setup

New file: `frontend/src/components/TiptapEditor.tsx`

Dependencies to install: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-underline`, `@tiptap/extension-placeholder`

Editor component:
- Accepts `content` (HTML string) and `onChange` callback
- Toolbar with formatting buttons
- Image button triggers a hidden file input, uploads via `/uploads/images`, inserts the returned URL
- Returns HTML via `editor.getHTML()`

### Router Changes

Add to `frontend/src/router.tsx`:
```typescript
const AnnouncementList = lazy(() => import('@/pages/Announcements/Index'));
// Route:
{ path: '/announcements', element: <AnnouncementList /> }
```

### Sidebar Changes

Add to `AuthenticatedLayout.tsx` navigation:
- "Announcements" link with `Megaphone` icon in the top-level personal section (between "My WFH" and "My Assets")
- Visible to all authenticated users (no permission gate for viewing)

### Types

Add to `frontend/src/types/index.d.ts`:

```typescript
export interface AnnouncementImage {
    id: number;
    url: string;
    fileName: string;
    sortOrder: number;
}

export interface AnnouncementComment {
    id: number;
    userId: number;
    userName: string;
    userPosition: string;
    userImageUrl: string | null;
    body: string;
    parentId: number | null;
    createdAt: string;
    replies: AnnouncementComment[];
}

export interface AnnouncementResponse {
    id: number;
    title: string;
    body: string;
    category: string;
    isPinned: boolean;
    authorId: number;
    authorName: string;
    authorPosition: string;
    authorImageUrl: string | null;
    publishedAt: string;
    images: AnnouncementImage[];
    reactions: Record<string, number>;
    userReactions: string[];
    commentsCount: number;
    comments?: AnnouncementComment[];
    createdAt: string;
}
```

### Dashboard Wiring

Update `Dashboard/Index.tsx`:
- Employee tab: `announcementsCount` stat card already reads from API (will show real count once backend returns it)
- Admin tab: Replace the "No announcements yet" placeholder in the Announcements card with a list of latest 3 announcements (title, author, time, link to `/announcements`)

---

## File Structure

### Backend — New Files
```
src/main/java/org/rp/
  infrastructure/
    database/
      entity/
        Announcement.java
        AnnouncementImage.java
        AnnouncementReaction.java
        AnnouncementComment.java
      repository/
        AnnouncementRepository.java
        AnnouncementImageRepository.java
        AnnouncementReactionRepository.java
        AnnouncementCommentRepository.java
    controller/
      AnnouncementController.java
      FileUploadController.java
  application/
    announcement/
      AnnouncementService.java
      AnnouncementServiceImpl.java
    dto/
      request/
        CreateAnnouncementRequest.java
        UpdateAnnouncementRequest.java
        CreateCommentRequest.java
        ReactionRequest.java
      response/
        AnnouncementResponse.java
        AnnouncementDetailResponse.java
        CommentResponse.java
        ReactionSummaryResponse.java
    file/
      FileUploadService.java
      FileUploadServiceImpl.java
src/main/resources/
  db/migration/
    V17__create_announcements_tables.sql
```

### Backend — Modified Files
```
DataSeeder.java                    — add seedAnnouncements()
DashboardServiceImpl.java          — real announcement count + latest 3
AdminDashboardResponse.java        — replace announcements with AnnouncementPreview
```

### Frontend — New Files
```
frontend/src/
  pages/
    Announcements/
      Index.tsx                     — feed page with category tabs
      CreateEditDialog.tsx          — create/edit modal with Tiptap
  components/
    TiptapEditor.tsx                — reusable rich text editor
```

### Frontend — Modified Files
```
frontend/src/
  types/index.d.ts                  — announcement types
  router.tsx                        — add /announcements route
  layouts/AuthenticatedLayout.tsx   — add sidebar link
  pages/Dashboard/Index.tsx         — wire admin announcements section
```

### New NPM Dependencies
```
@tiptap/react
@tiptap/starter-kit
@tiptap/extension-image
@tiptap/extension-link
@tiptap/extension-underline
@tiptap/extension-placeholder
```

---

## Out of Scope

- Draft/scheduled posts (publishedAt is always set to now on create)
- Notification system for new announcements
- @mentions in comments
- Comment editing (only delete)
- Announcement analytics/views tracking
- S3/cloud storage (local filesystem for now)
- Multitenancy
