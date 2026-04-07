# Onboarding Flow

## Overview

The onboarding process takes a new hire from invitation to active employee account.

```
HR Creates Invite → Email Sent → Guest Fills Form → HR Reviews → Account Created
```

---

## Step-by-Step Flow

### 1. HR Creates Invite
- **Who:** Admin / HR Manager
- **Where:** HRIS → Onboarding → Invites → "Send New Invite"
- **What:** Enter candidate's personal email, first name, last name, position, department
- **Result:** Invite created with status `pending`, unique token generated, email sent to candidate

### 2. Candidate Receives Email
- **Who:** Candidate (new hire)
- **What:** Receives email with onboarding link: `https://{app}/onboarding/{token}`
- **Expiry:** Link expires after 30 days (HR can extend)

### 3. Candidate Fills 4-Step Form
- **Where:** Public onboarding portal (no login required, token-based access)
- **Invite status changes:** `pending` → `in_progress`

#### Step 1: Personal Information
- First name, middle name, last name, suffix
- Birthday, gender, civil status
- Phone number, mobile number
- Address (line 1, line 2, city, state, postal code, country)

#### Step 2: Government IDs
- SSS number (optional)
- TIN number (optional)
- HDMF/Pag-IBIG number (optional)
- PhilHealth number (optional)

#### Step 3: Emergency Contact
- Contact name, phone, mobile
- Relationship (spouse, parent, sibling, child, relative, friend)

#### Step 4: Document Upload
- Upload required documents (encrypted at rest with AES-256-GCM):
  - **Required:** Resume/CV, Government ID, NBI Clearance, PNP Clearance, Medical Certificate
  - **Optional:** SSS ID, TIN ID, PhilHealth ID, HDMF/Pag-IBIG ID, Diploma, Transcript, Birth Certificate, Certificate of Employment, Other
- Each document validated for file type and size
- Candidate can upload multiple files per type
- Candidate can delete non-approved documents

### 4. HR Reviews Documents
- **Who:** Admin / HR Manager
- **Where:** HRIS → Onboarding → Submissions → Click submission → Review
- **What:** Review each uploaded document individually
  - **Approve** — marks document as approved
  - **Reject** — marks as rejected with reason (candidate can see reason and re-upload)
- Submission status changes: `draft` → `submitted` → `under_review`

### 5. Candidate Submits Form
- **Requirement:** ALL required documents must be **approved by HR** before submission is allowed
- Candidate sees real-time status: which docs are approved, pending, or rejected
- Once all required docs approved → "Submit to HR" button becomes active
- **Result:** Submission status → `submitted`, invite status → `submitted`
- Candidate is redirected to success/checklist page
- Form becomes **locked** (read-only) after submission

### 6. HR Final Approval
- **Where:** HRIS → Onboarding → Submissions → Review
- **What:** HR reviews the complete submission (personal info, emergency contact, all documents)
- **Approve** → submission status → `approved`
- **Reject** → submission status → `rejected` (with notes)

### 7. Convert to User Account
- **Who:** Admin / HR Manager
- **Where:** HRIS → Onboarding → Submissions → "Convert to User"
- **Requirement:** Submission must be `approved`
- **What happens:**
  1. Creates Keycloak user account (email, name, temporary password, employee role)
  2. Creates database user record (position, department, personal info, gov IDs, emergency contact)
  3. Sends welcome email with login credentials
  4. Submission status → `converted`
- **Result:** New hire can now log into the HRIS system

---

## Status Flow Diagram

### Invite Statuses
```
pending → in_progress → submitted → approved → (converted)
   ↓           ↓
expired    cancelled
```

### Submission Statuses
```
draft → submitted → under_review → approved → converted
                        ↓
                    rejected
```

### Document Statuses
```
pending (uploaded) → approved
                   → rejected (candidate re-uploads → pending)
```

---

## Key Rules

1. **Token-based access** — No login required for the portal. The invite token in the URL is the authentication.
2. **Documents encrypted at rest** — AES-256-GCM encryption. Decrypted on-demand for viewing/download.
3. **HR must approve each document** — Candidate cannot submit until ALL required docs are approved.
4. **Form locks after submission** — Candidate cannot edit after submitting.
5. **Invite expires after 30 days** — HR can extend or cancel invites.
6. **Protected from re-submission** — Once submitted, visiting the link redirects to the success page.

---

## API Endpoints

### Guest Portal (Public — no auth)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/onboarding/portal/{token}` | Load form data |
| POST | `/onboarding/portal/{token}/personal-info` | Save Step 1 |
| POST | `/onboarding/portal/{token}/government-ids` | Save Step 2 |
| POST | `/onboarding/portal/{token}/emergency-contact` | Save Step 3 |
| POST | `/onboarding/portal/{token}/documents` | Upload document |
| DELETE | `/onboarding/portal/{token}/documents/{id}` | Delete document |
| POST | `/onboarding/portal/{token}/submit` | Final submit |

### Admin (Authenticated)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/onboarding/invites` | List / Create invites |
| PUT/DELETE | `/onboarding/invites/{id}` | Update / Delete invite |
| POST | `/onboarding/invites/{id}/resend` | Resend email |
| POST | `/onboarding/invites/{id}/extend` | Extend expiry |
| POST | `/onboarding/invites/{id}/cancel` | Cancel invite |
| GET | `/onboarding/submissions` | List submissions |
| GET | `/onboarding/submissions/{id}` | View submission detail |
| PATCH | `/onboarding/submissions/{id}/review` | Approve/reject submission |
| PATCH | `/onboarding/submissions/{id}/documents/{docId}/review` | Approve/reject document |
| POST | `/onboarding/submissions/{id}/convert` | Convert to user account |
| GET | `/onboarding/documents/{id}/download` | Download (decrypt) document |
