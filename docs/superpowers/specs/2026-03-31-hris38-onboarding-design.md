# HRIS-38: Onboarding Feature — Phase 1 (Admin Side)

## Overview

Admin-side onboarding management for the HRIS system. Admins create invites, review submissions, approve/reject documents, and convert approved applicants into Keycloak user accounts. Government ID documents are encrypted at rest with AES-256-GCM.

**Phase 1 scope:** Admin invite management + submission review + convert-to-user. Guest-facing onboarding form deferred to Phase 2.

---

## Database Schema

### `onboarding_invites`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL PK | |
| token | VARCHAR(255) UNIQUE NOT NULL | UUID for the invite link |
| email | VARCHAR(255) NOT NULL | Invitee's email |
| first_name | VARCHAR(255) NOT NULL | |
| last_name | VARCHAR(255) NOT NULL | |
| position | VARCHAR(255) | Job title |
| department | VARCHAR(255) | |
| status | VARCHAR(50) NOT NULL | `pending`, `accepted`, `expired`, `cancelled` |
| expires_at | TIMESTAMP NOT NULL | Default: created_at + 30 days |
| accepted_at | TIMESTAMP | When invitee starts the form |
| invited_by | BIGINT FK users(id) | Admin who created the invite |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `onboarding_submissions`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL PK | |
| invite_id | BIGINT FK onboarding_invites(id) | |
| status | VARCHAR(50) NOT NULL | `draft`, `submitted`, `under_review`, `approved`, `rejected`, `converted` |
| current_step | INT DEFAULT 1 | Tracks guest progress (1-4) |
| personal_info | JSONB | Step 1 data (name, address, birthdate, etc.) |
| emergency_contact | JSONB | Step 3 data |
| notes | TEXT | Admin review notes |
| reviewed_by | BIGINT FK users(id) | Admin who reviewed |
| reviewed_at | TIMESTAMP | |
| converted_user_id | BIGINT FK users(id) | Set after convert-to-user |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `onboarding_documents`

| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL PK | |
| submission_id | BIGINT FK onboarding_submissions(id) | |
| document_type | VARCHAR(50) NOT NULL | e.g., `SSS`, `PHILHEALTH`, `PAGIBIG`, `TIN` |
| file_name | VARCHAR(255) NOT NULL | Original filename |
| stored_path | VARCHAR(500) NOT NULL | Path to encrypted file on disk |
| content_type | VARCHAR(100) | MIME type |
| file_size | BIGINT | |
| status | VARCHAR(50) NOT NULL DEFAULT 'pending' | `pending`, `approved`, `rejected` |
| rejection_reason | TEXT | If rejected |
| uploaded_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

---

## Document Types (Hardcoded Enum)

Matching the monolith's 14 types:

1. `SSS` — SSS ID / E1
2. `PHILHEALTH` — PhilHealth ID
3. `PAGIBIG` — Pag-IBIG ID
4. `TIN` — TIN ID / BIR Form 2316
5. `NBI_CLEARANCE` — NBI Clearance
6. `POLICE_CLEARANCE` — Police Clearance
7. `BARANGAY_CLEARANCE` — Barangay Clearance
8. `BIRTH_CERTIFICATE` — PSA Birth Certificate
9. `DIPLOMA` — Diploma / TOR
10. `TRANSCRIPT` — Transcript of Records
11. `MARRIAGE_CERTIFICATE` — Marriage Certificate (if applicable)
12. `MEDICAL_CERTIFICATE` — Medical Certificate / Drug Test
13. `PHOTO` — 2x2 / 1x1 ID Photo
14. `OTHER` — Other supporting documents

---

## Encryption: AES-256-GCM

### How It Works

- Each file encrypted with AES-256-GCM before writing to disk
- Random 12-byte IV generated per file (unique, never reused)
- Stored format: `[IV (12 bytes)] [ciphertext] [GCM authentication tag (16 bytes)]`
- Master key from `ONBOARDING_ENCRYPTION_KEY` env var (base64-encoded 32-byte key)
- Java 21 built-in `javax.crypto.Cipher` — no external libraries

### Key Management

- `ONBOARDING_ENCRYPTION_KEY` set in `.env` / Docker secrets
- Generate once: `openssl rand -base64 32`
- Never committed to git
- Key rotation: not in Phase 1 scope (can be added later)

### Storage Location

- Encrypted files stored in `./private/onboarding/{submission_id}/` (separate from ticket uploads)
- Directory configured via `app.storage.onboarding-dir` property

---

## Backend Architecture

### Services

| Service | Responsibility |
|---------|---------------|
| `OnboardingInviteService` | CRUD, resend email, extend expiry, cancel, validate token |
| `OnboardingSubmissionService` | List/filter submissions, review, approve/reject individual docs, approve/reject whole submission |
| `OnboardingDocumentService` | Store (encrypt + save to disk), retrieve (load + decrypt), delete |
| `OnboardingConversionService` | Convert approved submission to Keycloak user + DB user record |
| `EncryptionService` | AES-256-GCM encrypt/decrypt (standalone, used by document service) |
| `EmailService` | Send invite emails via Gmail SMTP using Spring Boot Mail |

### Controllers & Endpoints

#### `OnboardingInviteController`

| Method | Path | Action | Permission |
|--------|------|--------|------------|
| GET | `/onboarding/invites` | List invites (paginated, search, status filter) | `ONBOARDING_VIEW` |
| POST | `/onboarding/invites` | Create invite + send email | `ONBOARDING_MANAGE` |
| GET | `/onboarding/invites/{id}` | Show invite details | `ONBOARDING_VIEW` |
| PUT | `/onboarding/invites/{id}` | Update invite | `ONBOARDING_MANAGE` |
| DELETE | `/onboarding/invites/{id}` | Delete invite | `ONBOARDING_MANAGE` |
| POST | `/onboarding/invites/{id}/resend` | Resend invite email | `ONBOARDING_MANAGE` |
| POST | `/onboarding/invites/{id}/extend` | Extend expiry date | `ONBOARDING_MANAGE` |
| POST | `/onboarding/invites/{id}/cancel` | Cancel invite | `ONBOARDING_MANAGE` |

#### `OnboardingSubmissionController`

| Method | Path | Action | Permission |
|--------|------|--------|------------|
| GET | `/onboarding/submissions` | List submissions (paginated, search, status filter) | `ONBOARDING_VIEW` |
| GET | `/onboarding/submissions/{id}` | Show submission with documents | `ONBOARDING_VIEW` |
| PATCH | `/onboarding/submissions/{id}/review` | Approve/reject whole submission | `ONBOARDING_MANAGE` |
| PATCH | `/onboarding/submissions/{id}/documents/{docId}/review` | Approve/reject single document | `ONBOARDING_MANAGE` |
| POST | `/onboarding/submissions/{id}/convert` | Convert to user account | `ONBOARDING_MANAGE` |

#### `OnboardingDocumentController`

| Method | Path | Action | Permission |
|--------|------|--------|------------|
| GET | `/onboarding/documents/{id}/download` | Decrypt and stream file | `ONBOARDING_VIEW` |

### Permissions (seeded via Flyway migration)

- `ONBOARDING_VIEW` — assigned to: super-admin, admin, hr-manager
- `ONBOARDING_MANAGE` — assigned to: super-admin, admin, hr-manager

### Email

- **Provider:** Gmail SMTP with app password
- **Spring Boot Mail config:** `spring.mail.host=smtp.gmail.com`, port 587, TLS
- **Template:** Simple HTML — greeting, company name, invite link (`{FRONTEND_URL}/onboarding/{token}`), expiration date, CTA button
- **Triggers:** Invite creation, invite resend

---

## Convert-to-User Flow

1. Admin clicks "Convert to User" on an approved submission
2. `OnboardingConversionService.convert(submissionId)`:
   - Validates submission status is `approved`
   - Extracts personal info from JSONB fields
   - Creates Keycloak user via Admin REST API (email, first name, last name, temporary password, `employee` role)
   - Creates DB `User` record (position, department, linked to submission)
   - Documents remain in `./private/onboarding/{submission_id}/` (no move needed — they stay encrypted at rest and are served via the decrypt endpoint)
   - Updates submission status to `converted`, sets `converted_user_id`
   - Sends welcome email with login credentials
3. Frontend: confirmation dialog, status updates to `converted`, link to new user profile

---

## Frontend Pages

### Invites Page (`Onboarding/Invites/Index.tsx`)

- **Top bar:** Search input + "Create Invite" button
- **Filters:** Status dropdown (All, Pending, Accepted, Expired, Cancelled)
- **Table columns:** Name, Email, Position, Department, Status badge, Expires At, Actions dropdown
- **Actions dropdown:** View, Resend Email, Extend (dialog with date picker), Cancel, Delete
- **Create/Edit Dialog:** Form — first name, last name, email, position, department, expiration date (default 30 days)
- **Pagination:** `PagedResponse` pattern

### Submissions Page (`Onboarding/Submissions/Index.tsx`)

- **Top bar:** Search input
- **Filters:** Status dropdown (All, Draft, Submitted, Under Review, Approved, Rejected, Converted)
- **Table columns:** Applicant Name, Email, Position, Status badge, Document progress (e.g., "3/14 approved"), Submitted At, Actions
- **Actions:** View/Review link

### Submission Detail Page (`Onboarding/Submissions/Show.tsx`)

- **Header card:** Applicant info (name, email, position, department), status, progress bar
- **Personal Info section:** Rendered from JSONB (read-only)
- **Emergency Contact section:** Rendered from JSONB (read-only)
- **Documents section:** Grid of document cards:
  - Document type label (e.g., "SSS ID")
  - Status badge (pending/approved/rejected)
  - Thumbnail or file icon
  - View button (decrypt endpoint, opens in new tab)
  - Approve / Reject buttons (reject shows reason input)
- **Bottom actions:** "Approve Submission" / "Reject Submission", "Convert to User" (visible only when status is `approved`)

### Navigation

Already configured in `AuthenticatedLayout.tsx` — "Invites" and "Submissions" under Onboarding accordion, gated by `onboarding.view` / `onboarding.manage`.

---

## Design Decisions

1. **Documents persist after rejection** — admin can re-review; applicant can resubmit specific documents in Phase 2
2. **Invite expiration: 30 days default** — configurable per invite, admin can extend or cancel
3. **Email implemented now** — Gmail SMTP, avoids future rework when Phase 2 adds the guest form
4. **Document types hardcoded** — enum matching monolith's 14 types; rarely changes
5. **Convert-to-user in Phase 1** — complete admin workflow end-to-end
6. **AES-256-GCM for document encryption** — government IDs require encryption at rest; GCM provides both confidentiality and integrity
7. **Separate storage directory** — `./private/onboarding/` distinct from ticket uploads
8. **Sub-POC not involved** — onboarding is HR-driven, no team leader integration

## Out of Scope (Phase 2)

- Guest-facing 4-step onboarding form
- Guest document upload flow
- Invite token validation endpoint (for guest access)
- Bulk invite creation
- Key rotation for encryption
