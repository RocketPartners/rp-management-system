# HRIS Frontend — Setup Guide

## Prerequisites

- **Node.js** 18+ (recommended: 20 LTS)
- **npm** 9+
- Backend API running on `http://localhost:8080` (see backend repo SETUP.md)

## 1. Clone and Install

```bash
git clone https://github.com/RocketPartners/rp-management-system.git
cd rp-management-system
git checkout release/0.0.4

cd frontend
npm install
```

## 2. Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Edit `frontend/.env`:

```env
# Required
VITE_SPRING_BOOT_API_URL=http://localhost:8080/api/v1
VITE_APP_NAME=HRIS

# Google OAuth (get from Google Cloud Console > APIs & Services > Credentials)
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>

# AI Chat — optional (requires LaunchCode API key)
VITE_AI_PROXY_URL=https://rocketpartners.launch-code.dev/api/gateway/bedrock
VITE_AI_API_KEY=<launchcode-api-key>
VITE_AI_MODEL=us.anthropic.claude-sonnet-4-6
```

| Variable | Required | Description |
|---|---|---|
| `VITE_SPRING_BOOT_API_URL` | Yes | Backend API base URL |
| `VITE_APP_NAME` | No | App display name (default: HRIS) |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID for login |
| `VITE_AI_PROXY_URL` | No | AI chat proxy endpoint |
| `VITE_AI_API_KEY` | No | AI chat API key |
| `VITE_AI_MODEL` | No | Claude model ID (default: claude-sonnet-4-6) |

## 3. Run Development Server

```bash
cd frontend
npm run dev
```

The app runs at **http://localhost:5174**.

Vite proxies `/api` requests to `http://localhost:8080` automatically (configured in `vite.config.ts`).

## 4. Build for Production

```bash
cd frontend
npm run build
```

Output goes to `frontend/dist/`.

## 5. Other Commands

```bash
npm run lint      # ESLint checks
npm run preview   # Preview production build locally
```

## Tech Stack

- React 19, TypeScript 5.9, Vite 8
- TanStack Query 5 (data fetching)
- React Hook Form 7 + Zod 4 (forms/validation)
- shadcn/ui + Radix UI (components)
- Tailwind CSS 4
- React Router 7
- FullCalendar 6 (calendar views)
- Recharts (analytics charts)
- STOMP/SockJS (WebSocket notifications)
- Web Push API (browser push notifications)

## Project Structure

```
frontend/
  src/
    components/       # Shared UI components
    contexts/         # React contexts (auth, timezone)
    hooks/            # Custom hooks
    layouts/          # Page layouts (AuthenticatedLayout)
    lib/              # Utilities (API client, navigation config)
    pages/            # Route pages
    types/            # TypeScript type definitions
    css/              # Global styles
  public/
    sw.js             # Service worker (push notifications)
    manifest.json     # PWA manifest
```

## Auth Flow

- Authentication is handled by **Keycloak** (JWT)
- The auth context is at `src/contexts/auth-context.tsx`
- API client with token handling: `src/lib/spring-boot-api.ts`
- Route guards: `src/components/route-guards.tsx` (ProtectedRoute, GuestRoute, PermissionRoute)

## Troubleshooting

| Issue | Fix |
|---|---|
| `CORS error` on API calls | Make sure the backend is running and CORS origins include `http://localhost:5174` |
| `401 Unauthorized` | Check Keycloak is running (port 8180) and your token hasn't expired |
| Push notifications not working | Generate VAPID keys (see backend setup) and ensure HTTPS or localhost |
| Blank page after login | Check browser console — likely a missing env var or backend connection issue |
