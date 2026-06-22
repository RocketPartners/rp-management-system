# HRIS-38 Phase 2: Guest Onboarding Portal

Exact port of the Laravel monolith's guest onboarding flow (`Guest/Onboarding/Form.jsx` + `Checklist.jsx`) to the standalone frontend + Spring Boot backend.

## Backend: Public Guest Endpoints

New controller `OnboardingPortalController` at `/onboarding/portal/{token}`. All endpoints are **unauthenticated** — access is authorized by a valid, non-expired invite token.

### SecurityConfig Change

Add `/onboarding/portal/**` to `permitAll()` in `SecurityConfig.java`.

### Service: `OnboardingPortalService`

New service containing all guest-facing business logic. Separate from the admin `OnboardingSubmissionService`.

**Token validation** (reused across all endpoints):
- Find invite by token → 404 if not found
- Check `status` is `pending` or `accepted` → 400 if cancelled/expired
- Check `expiresAt` is in the future → 400 if expired (also update status to `expired`)
- Return invite with eager-loaded submission + documents

**Submission auto-creation**: On first data save (personal info, gov IDs, or emergency contact), if no submission exists for the invite, create one with `status=draft`, `currentStep=1`. Set invite status to `accepted` and `acceptedAt=now()`.

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/onboarding/portal/{token}` | Validate token, return invite + submission + documents + required doc types + submission status |
| `POST` | `/onboarding/portal/{token}/personal-info` | Save personal info fields to `personalInfo` JSONB |
| `POST` | `/onboarding/portal/{token}/government-ids` | Save gov ID fields to `personalInfo` JSONB (merged) |
| `POST` | `/onboarding/portal/{token}/emergency-contact` | Save emergency contact to `emergencyContact` JSONB |
| `POST` | `/onboarding/portal/{token}/documents` | Upload file (multipart), encrypt, store |
| `DELETE` | `/onboarding/portal/{token}/documents/{docId}` | Delete non-approved document + encrypted file |
| `POST` | `/onboarding/portal/{token}/submit` | Final submission: set status to `submitted`, set `submittedAt` |

### Validation Rules (matching Laravel)

**Personal Info:**
- `firstName`: required, max 255
- `middleName`: optional, max 255
- `lastName`: required, max 255
- `suffix`: optional, max 10
- `birthday`: required, date, must be before today
- `gender`: required, one of: male, female, other, prefer_not_to_say
- `civilStatus`: optional, one of: single, married, widowed, divorced, separated
- `phoneNumber`: required, max 20
- `mobileNumber`: optional, max 20
- `addressLine1`: required
- `addressLine2`: optional
- `city`: required, max 100
- `state`: optional, max 100
- `postalCode`: optional, max 20
- `country`: optional, max 100 (defaults to "Philippines")

**Government IDs:**
- `sssNumber`: optional, max 15
- `tinNumber`: optional, max 20
- `hdmfNumber`: optional, max 12
- `philhealthNumber`: optional, max 15

**Emergency Contact:**
- `name`: required, max 255
- `phone`: required, max 20
- `mobile`: optional, max 20
- `relationship`: required, max 100

**Document Upload:**
- `documentType`: required, must be one of the 14 valid types
- `file`: required, multipart file
- `description`: optional, max 500
- Max file size: 10MB
- Accepted types: pdf, jpg, jpeg, png, doc, docx

**Submit:**
- Submission must be in `draft` status
- Validates personal info and emergency contact are filled

### Response DTOs

**`GET /portal/{token}` response:**
```json
{
  "invite": {
    "token": "uuid",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "fullName": "FirstName LastName",
    "position": "...",
    "department": "...",
    "status": "pending|accepted",
    "expiresAt": "2026-04-30T00:00:00"
  },
  "submission": {
    "id": 1,
    "status": "draft",
    "currentStep": 2,
    "personalInfo": { ... },
    "emergencyContact": { ... },
    "documents": [
      {
        "id": 1,
        "documentType": "SSS",
        "documentTypeLabel": "SSS ID / E1",
        "fileName": "sss.pdf",
        "contentType": "application/pdf",
        "fileSize": 12345,
        "status": "pending",
        "rejectionReason": null,
        "uploadedAt": "..."
      }
    ]
  },
  "requiredDocuments": {
    "SSS": { "label": "SSS ID / E1", "required": true, "acceptedFormats": ["pdf","jpg","jpeg","png"], "maxSize": 10240 },
    "TIN": { "label": "TIN ID", "required": true, ... },
    "PHILHEALTH": { "label": "PhilHealth ID", "required": true, ... },
    "PAGIBIG": { "label": "Pag-IBIG / HDMF ID", "required": true, ... },
    "NBI_CLEARANCE": { "label": "NBI Clearance", "required": true, ... },
    "BIRTH_CERTIFICATE": { "label": "Birth Certificate / PSA", "required": true, ... },
    "DIPLOMA": { "label": "Diploma / TOR", "required": false, ... },
    "TRANSCRIPT": { "label": "Transcript of Records", "required": false, ... },
    "PHOTO": { "label": "2x2 or 1x1 ID Photo", "required": true, ... },
    "POLICE_CLEARANCE": { "label": "Police Clearance", "required": false, ... },
    "BARANGAY_CLEARANCE": { "label": "Barangay Clearance", "required": false, ... },
    "MARRIAGE_CERTIFICATE": { "label": "Marriage Certificate", "required": false, ... },
    "MEDICAL_CERTIFICATE": { "label": "Medical Certificate", "required": false, ... },
    "OTHER": { "label": "Other Document", "required": false, ... }
  },
  "submissionStatus": {
    "canSubmit": false,
    "blocker": "Please complete all form sections.",
    "missingDocuments": ["SSS", "TIN"]
  }
}
```

### JSONB Storage Mapping

The Spring Boot entity has two JSONB columns: `personalInfo` and `emergencyContact`.

**`personalInfo` stores both Step 1 (personal) and Step 2 (gov IDs):**
```json
{
  "first_name": "John",
  "middle_name": "Michael",
  "last_name": "Doe",
  "suffix": "none",
  "birthday": "1995-06-15",
  "gender": "male",
  "civil_status": "single",
  "phone_number": "09171234567",
  "mobile_number": "",
  "address_line_1": "123 Main St",
  "address_line_2": "Brgy. Example",
  "city": "Quezon City",
  "state": "Metro Manila",
  "postal_code": "1100",
  "country": "Philippines",
  "sss_number": "12-3456789-0",
  "tin_number": "123-456-789-000",
  "hdmf_number": "123456789012",
  "philhealth_number": "1234-56789-01"
}
```

**`emergencyContact`:**
```json
{
  "name": "Jane Doe",
  "phone": "09179876543",
  "mobile": "",
  "relationship": "spouse"
}
```

Key: Use **snake_case** keys in JSONB to match the Laravel monolith's storage format. The request DTOs use Java camelCase (`firstName`) but the service converts to snake_case (`first_name`) when storing in JSONB. The frontend form fields use snake_case to match the monolith — the DTOs accept both via `@JsonProperty("first_name")` annotations.

### Required Document Types Config

Hardcoded in `OnboardingPortalService` (matching the Laravel `config/onboarding.php`):

```java
Map<String, Map<String, Object>> REQUIRED_DOCUMENTS = Map.ofEntries(
    entry("SSS", Map.of("label", "SSS ID / E1", "required", true, "acceptedFormats", List.of("pdf","jpg","jpeg","png"), "maxSize", 10240)),
    entry("TIN", Map.of("label", "TIN ID", "required", true, ...)),
    entry("PHILHEALTH", Map.of("label", "PhilHealth ID", "required", true, ...)),
    entry("PAGIBIG", Map.of("label", "Pag-IBIG / HDMF ID", "required", true, ...)),
    entry("NBI_CLEARANCE", Map.of("label", "NBI Clearance", "required", true, ...)),
    entry("BIRTH_CERTIFICATE", Map.of("label", "Birth Certificate / PSA", "required", true, ...)),
    entry("DIPLOMA", Map.of("label", "Diploma / TOR", "required", false, ...)),
    entry("TRANSCRIPT", Map.of("label", "Transcript of Records", "required", false, ...)),
    entry("PHOTO", Map.of("label", "2x2 or 1x1 ID Photo", "required", true, ...)),
    entry("POLICE_CLEARANCE", Map.of("label", "Police Clearance", "required", false, ...)),
    entry("BARANGAY_CLEARANCE", Map.of("label", "Barangay Clearance", "required", false, ...)),
    entry("MARRIAGE_CERTIFICATE", Map.of("label", "Marriage Certificate", "required", false, ...)),
    entry("MEDICAL_CERTIFICATE", Map.of("label", "Medical Certificate", "required", false, ...)),
    entry("OTHER", Map.of("label", "Other Document", "required", false, ...))
);
```

### Submission Status Calculation

`getSubmissionStatus()` logic (ported from Laravel model method):
1. If no personalInfo or missing required fields → `{ canSubmit: false, blocker: "Please complete personal information." }`
2. If no emergencyContact or missing required fields → `{ canSubmit: false, blocker: "Please complete emergency contact." }`
3. Check required document types: all must have at least one document with `status=approved` → if not, `{ canSubmit: false, blocker: "All required documents must be approved by HR.", missingDocuments: [...] }`
4. If all checks pass → `{ canSubmit: true, blocker: null, missingDocuments: [] }`

### Backend Files

**New files:**
| File | Purpose |
|------|---------|
| `infrastructure/controller/OnboardingPortalController.java` | 7 public endpoints |
| `application/onboarding/OnboardingPortalService.java` | Guest-facing business logic |
| `application/onboarding/dto/request/SavePersonalInfoRequest.java` | Step 1 request DTO |
| `application/onboarding/dto/request/SaveGovernmentIdsRequest.java` | Step 2 request DTO |
| `application/onboarding/dto/request/SaveEmergencyContactRequest.java` | Step 3 request DTO |
| `application/onboarding/dto/response/OnboardingPortalResponse.java` | GET response DTO |

**Modified files:**
| File | Change |
|------|--------|
| `SecurityConfig.java` | Add `/onboarding/portal/**` to `permitAll()` |

---

## Frontend: 4-Step Onboarding Form

Exact port of monolith's `Guest/Onboarding/Form.jsx` and `Checklist.jsx`, replacing Inertia patterns with TanStack Query mutations and the Spring Boot API.

### Pages

**`Portal/Index.tsx`** — Main 4-step form (replaces current placeholder). Matches `Guest/Onboarding/Form.jsx`:
- On mount: `GET /onboarding/portal/{token}` to validate token and load data
- If token invalid/expired: show error card with message
- If submission already submitted: redirect to `/onboarding/{token}/success`
- Header: brand icon, "Onboarding Portal" title, welcome message with name, position/department badges, expiry warning
- ProgressIndicator component
- Step 1-4 forms rendered conditionally based on `currentStep`
- Background: `bg-zinc-50` (flat, no gradient)

**`Portal/Success.tsx`** — Post-submission checklist. Matches `Guest/Onboarding/Checklist.jsx`:
- Success icon + "Submission Complete!" message
- "What's Next?" info alert
- Submission status card with progress bar
- Checklist items with status badges (complete/pending/missing)
- Uploaded documents summary
- "What Happens Next?" card (HR Review → Email Notification → Account Activation)

### Router Changes

```tsx
// Public routes
{ path: '/onboarding/:token', element: <OnboardingPortal /> },
{ path: '/onboarding/:token/success', element: <OnboardingSuccess /> },
```

### Form Components (TSX ports)

Each form component is ported from its monolith JSX equivalent. The interface changes from Inertia's `form.data`/`form.setData`/`form.processing` to plain React state + TanStack Query mutation's `isPending`.

**`components/onboarding/forms/PersonalInfoForm.tsx`**
- Fields: firstName, middleName, lastName, suffix, birthday, gender, civilStatus, phoneNumber, mobileNumber, addressLine1, addressLine2, city, state, postalCode
- Country field pre-filled with "Philippines" (hidden, same as monolith)
- On submit: mutation calls `POST /onboarding/portal/{token}/personal-info`
- On success: advance to step 2

**`components/onboarding/forms/GovernmentIdForm.tsx`**
- Fields: sssNumber, tinNumber, hdmfNumber, philhealthNumber
- All optional with info alert explaining they can be provided later
- On submit: mutation calls `POST /onboarding/portal/{token}/government-ids`
- On success: advance to step 3

**`components/onboarding/forms/EmergencyContactForm.tsx`**
- Fields: name, phone, mobile, relationship (select)
- On submit: mutation calls `POST /onboarding/portal/{token}/emergency-contact`
- On success: advance to step 4

**`components/onboarding/forms/DocumentUploadForm.tsx`**
- Document type grid with upload status indicators
- Click type to select → shows upload form with drag-and-drop
- Shows existing files per type with status badges and delete buttons
- "All Uploaded Documents" summary card grouped by type
- Final submit section with validation status, blocker messages, and "Submit to HR" button
- Upload: `POST /onboarding/portal/{token}/documents` (multipart/form-data)
- Delete: `DELETE /onboarding/portal/{token}/documents/{docId}`
- Submit: `POST /onboarding/portal/{token}/submit`

### Shared Components (TSX ports)

**`components/onboarding/shared/ProgressIndicator.tsx`**
- 4 step circles with icons (UserPlus, CreditCard, Phone, FileText)
- Connected lines showing completion (green when completed)
- Progress bar at bottom

**`components/onboarding/shared/StatusBadge.tsx`**
- Unified badge for submission and document statuses
- Uses status config maps for colors, icons, labels

### Constants (TSX ports)

**`lib/constants/onboarding/selectOptions.ts`** — SUFFIX_OPTIONS, GENDER_OPTIONS, CIVIL_STATUS_OPTIONS, RELATIONSHIP_OPTIONS, DEFAULT_COUNTRY

**`lib/constants/onboarding/statuses.ts`** — SUBMISSION_STATUSES, DOCUMENT_STATUSES, status config maps with colors/icons/labels

### Utilities (TSX ports)

**`lib/utils/documentHelpers.ts`** — getDocumentsByType, countUploadedRequiredTypes, countRequiredDocumentTypes, hasAllRequiredDocuments, formatFileSize, isValidFileType, isValidFileSize

### Hook

**`hooks/onboarding/useOnboardingForm.ts`** — Replaces Inertia hook with TanStack Query:
- 4 form state objects (useState for each step's fields)
- `useMutation` for each save operation (personal info, gov IDs, emergency contact, document upload, delete, submit)
- `determineInitialStep()` logic identical to monolith
- Step navigation: `currentStep`, `goToPreviousStep`
- After each save mutation succeeds: invalidate the portal query, advance step
- Returns same interface as monolith hook but with `isPending` instead of `processing`

### API Integration Pattern

All calls go through the existing `apiFetch` from `@/lib/spring-boot-api` but **without auth headers** (these are public endpoints). Need a small `publicApiFetch` helper or use `fetch` directly since the portal endpoints don't need the Authorization header.

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// For portal (no auth)
export async function portalFetch(path: string, init?: RequestInit) {
    return fetch(`${API_BASE}${path}`, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
}
```

### Styling

- Brand color `#2596be` used throughout (matching monolith)
- `BRAND_CLASSES` from `lib/constants/theme` already exists
- Background: `bg-zinc-50` (flat) instead of monolith's gradient
- No other styling changes — all form layouts, spacing, card structure identical

### Frontend Files

**New files:**
| File | Purpose |
|------|---------|
| `pages/Onboarding/Portal/Index.tsx` | Main 4-step form (replaces placeholder) |
| `pages/Onboarding/Portal/Success.tsx` | Post-submission checklist |
| `hooks/onboarding/useOnboardingForm.ts` | Form state + mutations hook |
| `lib/api/onboarding-portal.ts` | Public API helpers (no auth) |

**Modified/ported files (monolith JSX → standalone TSX):**
| File | Source |
|------|--------|
| `components/onboarding/forms/PersonalInfoForm.tsx` | Monolith PersonalInfoForm.jsx |
| `components/onboarding/forms/GovernmentIdForm.tsx` | Monolith GovernmentIdForm.jsx |
| `components/onboarding/forms/EmergencyContactForm.tsx` | Monolith EmergencyContactForm.jsx |
| `components/onboarding/forms/DocumentUploadForm.tsx` | Monolith DocumentUploadForm.jsx |
| `components/onboarding/shared/ProgressIndicator.tsx` | Monolith ProgressIndicator.jsx |
| `components/onboarding/shared/StatusBadge.tsx` | Monolith StatusBadge.jsx |
| `lib/constants/onboarding/selectOptions.ts` | Monolith selectOptions.js |
| `lib/constants/onboarding/statuses.ts` | Monolith statuses.js |
| `lib/utils/documentHelpers.ts` | Monolith documentHelpers.js |

**Modified files:**
| File | Change |
|------|--------|
| `router.tsx` | Add `/onboarding/:token/success` route |

---

## Implementation Order

1. Backend: `OnboardingPortalService` + request/response DTOs
2. Backend: `OnboardingPortalController` + SecurityConfig permitAll
3. Backend: Build, test endpoints manually
4. Frontend: Constants + utilities (selectOptions, statuses, documentHelpers)
5. Frontend: Shared components (ProgressIndicator, StatusBadge)
6. Frontend: API helper (`portalFetch`)
7. Frontend: `useOnboardingForm` hook
8. Frontend: Form components (PersonalInfoForm, GovernmentIdForm, EmergencyContactForm, DocumentUploadForm)
9. Frontend: Portal/Index.tsx (main form page)
10. Frontend: Portal/Success.tsx (checklist page)
11. Frontend: Router update (add success route)
12. End-to-end test: send invite → click link → fill form → upload docs → submit
