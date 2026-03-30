# HRIS-30 Frontend: User Management Pages

## Overview

Migrate User Management UI from legacy Inertia/Laravel pages to React Router + Spring Boot API. Build 6 new TSX pages consuming the 15 backend endpoints from HRIS-30.

## Tech Stack Additions

| Package | Purpose | Why |
|---|---|---|
| `@tanstack/react-query` | Data fetching, caching, mutations | Enforces consistent fetch/loading/error patterns across all pages |
| `react-hook-form` | Form state management | Handles 30+ field forms without manual useState per field |
| `zod` + `@hookform/resolvers` | Schema validation | Type-safe validation co-located with form definitions |
| `sonner` | Toast notifications | Consistent success/error feedback without per-page Alert state |

## Pages

### 1. User List (`/users`) - `pages/Users/Index.tsx`

- **Data**: `GET /users/search?search=&status=&page=0&size=15`
- **Features**: Search input (debounced), status filter dropdown (PENDING, ACTIVE, REJECTED, SUSPENDED), paginated table, row actions (view, edit, delete, approve/reject/suspend)
- **Components**: Card, Table, Input, Select, Badge, DropdownMenu, Pagination
- **Permission gate**: `users.view` (via sidebar, already handled by layout)

### 2. Create User (`/users/create`) - `pages/Users/Create.tsx`

- **Data**: `POST /users`
- **Reference data**: Needs departments, positions, roles, managers for dropdowns — fetched via `GET /departments`, `GET /positions`, `GET /roles`, `GET /users/search` (for manager select)
- **Form sections** (react-hook-form + zod):
  1. Account (email, password) - required
  2. Personal Info (firstName, lastName, middleName, suffix, gender, dateOfBirth, civilStatus)
  3. Contact (phone, personalMobile, workEmail, personalEmail)
  4. Address (address, addressLine2, city, state, postalCode, country)
  5. Emergency Contact (name, phone, mobile, relationship)
  6. Government IDs (SSS, TIN, HDMF, PhilHealth, payroll account)
  7. Employment (employeeId, hireDate, employmentType, department, position, manager, roles)
- **Permission gate**: `users.create` on "Create User" button

### 3. Edit User (`/users/:id/edit`) - `pages/Users/Edit.tsx`

- **Data**: `GET /users/:id` (prefill), `PUT /users/:id` (submit)
- **Same form as Create** via shared `UserForm.tsx`, minus password field
- **Permission gate**: `users.edit`

### 4. User Detail (`/users/:id`) - `pages/Users/Show.tsx`

- **Data**: `GET /users/:id`, `GET /users/:id/permissions`
- **Sections**:
  1. Header card: avatar, name, role badges, status badge, action buttons (edit, delete, approve/reject/suspend)
  2. Personal info card
  3. Contact & address card
  4. Emergency contact card
  5. Government IDs card (masked display)
  6. Employment card (department, position, manager, hire date, type)
  7. Permission matrix table: grouped by category, shows role source + override + effective state, grant/revoke/remove actions
- **Permission gate**: `users.view`

### 5. Pending Approvals (`/users/pending-approvals`) - `pages/Users/PendingApprovals.tsx`

- **Data**: `GET /users/pending-approvals?search=&page=0&size=15`
- **Features**: Search, paginated table, individual approve/reject buttons, bulk selection with bulk approve/reject
- **Bulk actions**: `POST /users/bulk-approve`, `POST /users/bulk-reject`
- **Permission gate**: `users.approve` (maps to `USER_UPDATE` backend permission)

### 6. My Profile (`/profile`) - `pages/Profile/Index.tsx`

- **Data**: `GET /users/me`, `PATCH /users/me`, `PUT /users/me/password`
- **Sections**:
  1. Profile header (name, email, role, department)
  2. Editable personal info form (phone, address, emergency contact — subset of full user form)
  3. Change password form (current, new, confirm)
- **No permission gate** — any authenticated user can access their own profile

## Shared Components

### `UserForm.tsx` (new, `components/users/UserForm.tsx`)

Shared form component used by Create and Edit pages.

- Props: `mode: 'create' | 'edit'`, `defaultValues?`, `onSubmit`, `isSubmitting`
- Uses react-hook-form with zod schema
- 7 collapsible sections matching the form sections above
- Fetches reference data (departments, positions, roles) internally via useQuery

### `UserStatusBadge.tsx` (new, `components/users/UserStatusBadge.tsx`)

Reusable status badge with consistent colors:
- PENDING: yellow + clock icon
- ACTIVE: green + check icon
- REJECTED: red + x icon
- SUSPENDED: orange + alert icon

### `PermissionMatrix.tsx` (new, `components/users/PermissionMatrix.tsx`)

Permission matrix table for the User Detail page.
- Groups permissions by category
- Shows: permission name, from role (boolean), override (grant/revoke/none), effective (boolean)
- Action buttons: grant, revoke, remove override
- Confirmation dialog for destructive actions

## TypeScript Types (added to `types/index.d.ts`)

```typescript
// User Management (Spring Boot camelCase)
export interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    suffix: string | null;
    fullName: string;
    phone: string | null;
    personalMobile: string | null;
    workEmail: string | null;
    personalEmail: string | null;
    civilStatus: string | null;
    dateOfBirth: string | null;
    birthday: string | null;
    gender: string | null;
    address: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    emergencyContactMobile: string | null;
    emergencyContactRelationship: string | null;
    sssNumber: string | null;
    tinNumber: string | null;
    hdmfNumber: string | null;
    philhealthNumber: string | null;
    payrollAccount: string | null;
    hireDate: string | null;
    terminationDate: string | null;
    employeeId: string | null;
    profileImageUrl: string | null;
    employmentType: string | null;
    status: string;
    accountStatus: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
    approvedBy: number | null;
    approvedAt: string | null;
    departmentId: number | null;
    departmentName: string | null;
    positionId: number | null;
    positionTitle: string | null;
    managerId: number | null;
    managerName: string | null;
    roles: string[];
    permissions: string[];
    createdAt: string;
    updatedAt: string;
}

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface PermissionMatrixEntry {
    permissionId: number;
    permissionName: string;
    permissionSlug: string;
    group: string;
    fromRole: boolean;
    overrideType: 'GRANT' | 'REVOKE' | null;
    effective: boolean;
    reason: string | null;
    expiresAt: string | null;
    grantedBy: number | null;
}

export interface DepartmentOption {
    id: number;
    name: string;
}

export interface PositionOption {
    id: number;
    title: string;
}

export interface RoleOption {
    id: number;
    name: string;
}
```

## Router Changes (`router.tsx`)

```typescript
// Add lazy imports
const UserList = lazy(() => import('@/pages/Users/Index'));
const UserCreate = lazy(() => import('@/pages/Users/Create'));
const UserShow = lazy(() => import('@/pages/Users/Show'));
const UserEdit = lazy(() => import('@/pages/Users/Edit'));
const PendingApprovals = lazy(() => import('@/pages/Users/PendingApprovals'));
const Profile = lazy(() => import('@/pages/Profile/Index'));

// Replace ComingSoon placeholders
{ path: '/users', element: <UserList /> },
{ path: '/users/create', element: <UserCreate /> },
{ path: '/users/:id', element: <UserShow /> },
{ path: '/users/:id/edit', element: <UserEdit /> },
{ path: '/users/pending-approvals', element: <PendingApprovals /> },
{ path: '/profile', element: <Profile /> },
```

## TanStack Query Setup

### QueryClient Provider (`main.tsx`)

Wrap app in `QueryClientProvider` with sensible defaults:
- `staleTime: 5 * 60 * 1000` (5 minutes)
- `retry: 1`
- `refetchOnWindowFocus: false`

### Query Key Convention

All query keys follow: `[domain, ...params]`
- `['users', { search, status, page }]` — user list
- `['users', id]` — single user
- `['users', id, 'permissions']` — user permissions
- `['users', 'pending', { search, page }]` — pending approvals
- `['profile']` — current user profile
- `['departments']` — department options
- `['positions']` — position options
- `['roles']` — role options

### Mutation Pattern

Every mutation uses `useMutation` + `queryClient.invalidateQueries`:
```typescript
const createUser = useMutation({
    mutationFn: (data) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('User created successfully');
        navigate('/users');
    },
    onError: (error) => toast.error(error.message),
});
```

## Sonner Setup

Add `<Toaster />` to `main.tsx` or `AuthenticatedLayout.tsx`. All success/error notifications use:
```typescript
import { toast } from 'sonner';
toast.success('User created successfully');
toast.error('Failed to create user');
```

## Navigation Changes (`AuthenticatedLayout.tsx`)

Add "Create User" button/link in the User Management sidebar section (gated by `users.create` permission). Add `/profile` link in the user dropdown menu (top-right).

## File Structure

```
frontend/src/
  pages/
    Users/
      Index.tsx          # User list with search/filter/pagination
      Create.tsx         # Create user (uses UserForm)
      Edit.tsx           # Edit user (uses UserForm)
      Show.tsx           # User detail + permission matrix
      PendingApprovals.tsx  # Pending users + bulk actions
    Profile/
      Index.tsx          # Self-service profile + change password
  components/
    users/
      UserForm.tsx       # Shared create/edit form
      UserStatusBadge.tsx  # Status badge component
      PermissionMatrix.tsx # Permission matrix table
```

## Backend Endpoints Consumed

| Endpoint | Used By |
|---|---|
| `GET /users/search` | User List |
| `GET /users/:id` | User Detail, Edit (prefill) |
| `POST /users` | Create User |
| `PUT /users/:id` | Edit User |
| `DELETE /users/:id` | User Detail (delete action) |
| `POST /users/:id/activate` | User Detail |
| `POST /users/:id/deactivate` | User Detail |
| `POST /users/:id/approve` | User Detail, Pending Approvals |
| `POST /users/:id/reject` | User Detail, Pending Approvals |
| `POST /users/:id/suspend` | User Detail |
| `GET /users/pending-approvals` | Pending Approvals |
| `POST /users/bulk-approve` | Pending Approvals |
| `POST /users/bulk-reject` | Pending Approvals |
| `GET /users/:id/permissions` | User Detail |
| `POST /users/:id/permissions/:pid/grant` | User Detail |
| `POST /users/:id/permissions/:pid/revoke` | User Detail |
| `DELETE /users/:id/permissions/:pid` | User Detail |
| `POST /users/:id/permissions/reset` | User Detail |
| `GET /users/me` | Profile |
| `PATCH /users/me` | Profile |
| `PUT /users/me/password` | Profile |
