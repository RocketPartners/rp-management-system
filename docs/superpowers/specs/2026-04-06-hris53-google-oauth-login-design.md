# HRIS-53: Google OAuth Login

**Date:** 2026-04-06
**Status:** Approved
**Branch (Frontend):** `feature/HRIS-53-google-oauth-login` from `release/0.0.3`

---

## Problem

The login page only supports email/password authentication. The backend already has `POST /auth/google` that accepts a Google ID token and returns JWT tokens, but the frontend has no way to trigger Google sign-in.

## Solution

Add a "Sign in with Google" button to the login page using Google Identity Services (GIS) SDK. Frontend-only change — no backend modifications needed.

---

## Flow

1. Login page loads → GIS SDK script tag loads
2. User clicks "Sign in with Google"
3. Google shows account picker popup
4. Google returns `idToken` (JWT with user's email)
5. Frontend calls `POST /auth/google` with `{ idToken }`
6. Backend validates user exists + is active, exchanges with Keycloak, returns `AuthResponse`
7. Frontend stores tokens and redirects to `/dashboard`

## Frontend Changes

### 1. `lib/spring-boot-api.ts` — Add `loginWithGoogle` function

```typescript
export async function loginWithGoogle(idToken: string) {
    const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
    const json = await res.json();
    if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || 'Google login failed');
    }
    accessToken = json.data.accessToken;
    refreshToken = json.data.refreshToken;
    tokenExpiry = Date.now() + json.data.expiresIn - 30000;
    persistTokens();
    return json.data;
}
```

### 2. `contexts/auth-context.tsx` — Expose `loginWithGoogle`

- Import `loginWithGoogle as apiLoginWithGoogle` from spring-boot-api
- Add `loginWithGoogle: (idToken: string) => Promise<void>` to `AuthContextType`
- Implement: call `apiLoginWithGoogle(idToken)`, persist tokens, fetch user
- Expose in provider value

### 3. `pages/Auth/Login.tsx` — Add Google button

- Load GIS SDK: `<script src="https://accounts.google.com/gsi/client">` via useEffect
- Add "or" divider after the Sign In button
- Add "Sign in with Google" button with Google logo SVG
- On click: call `google.accounts.id.initialize()` + `google.accounts.id.prompt()` or use `google.accounts.oauth2` code flow
- On success callback: call `loginWithGoogle(response.credential)` from auth context
- On error: display error same as email/password login
- Loading state while Google auth is processing

### 4. `.env` — Already configured

`VITE_GOOGLE_CLIENT_ID` is set.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| User not in system | Backend returns error → show "User not registered in system" |
| User account inactive | Backend returns error → show "User account is not active" |
| Google popup closed | No action needed — user just stays on login page |
| GIS SDK fails to load | Google button hidden or disabled |
| Network error | Show generic error message |

## Files Changed

| File | Change |
|------|--------|
| `lib/spring-boot-api.ts` | Add `loginWithGoogle()` function |
| `contexts/auth-context.tsx` | Add `loginWithGoogle` to context |
| `pages/Auth/Login.tsx` | Add Google button + GIS SDK integration |
