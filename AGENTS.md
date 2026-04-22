# AGENTS.md

## Purpose
Guidance for AI coding agents working in this repository. Keep changes small, aligned with current patterns, and validated with project scripts.

## Project Snapshot
- Stack: React 19 + Vite 8 + React Router + Firebase (Auth + Firestore) + Tailwind Vite plugin.
- Entry points: `src/main.jsx` mounts `src/App.jsx` inside `StrictMode`.
- Primary docs: [README](README.md).

## Run And Validate
- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Preview build: `npm run preview`

## Current Routing Reality
Routes currently wired in `src/App.jsx`:
- `/` -> login screen (or redirect to `/lobby` when authenticated)
- `/testing` -> test dashboard (protected page for testing all backend features)
- `/lobby` -> live match lobby (protected page)
- `*` -> redirects to `/`

## Architecture Map
- Auth/session state: `src/contexts/authContext.js` (context only), `src/contexts/AuthProvider.jsx` (provider component)
- Auth hook: `src/hooks/useAuth.js`
- Firebase initialization: `src/services/firebase.js`
- Auth API wrappers: `src/services/authService.js`
- Wallet logic: `src/services/walletService.js`
- Match logic: `src/services/matchService.js`
- UI pages in use:
  - `src/pages/Login.jsx` - login/register
  - `src/pages/TestDashboard.jsx` - comprehensive backend testing (wallet, matches, etc.)
  - `src/pages/LiveLobby.jsx` - live match lobby

## Code Conventions In This Repo
- Use function components and hooks; no class components.
- Keep business logic in `src/services/*` and call from pages/contexts.
- Existing codebase uses semicolons and double quotes in many files; preserve local file style when editing.
- UI text and comments include Turkish; preserve language/context unless asked to rewrite copy.

## Known Baseline Issues
All baseline lint errors have been resolved:
- ✅ `react-refresh/only-export-components` - Fixed by splitting `AuthContext.jsx` → `authContext.js` + `AuthProvider.jsx`
- ✅ Hook/effect warnings in `WalletTest.jsx` - File removed, features moved to `TestDashboard.jsx`
- ✅ `no-useless-catch` in `authService.js` - Fixed
- ✅ `matchData` undefined and duplicate update path in `matchService.js` - Fixed with defensive checks

Current lint status: **0 errors, 0 warnings** ✅

## Firebase And Data Safety
- Firebase config is committed in `src/services/firebase.js`; do not rotate keys or change project IDs unless explicitly requested.
- Firestore collections used by app logic include `users`, `wallets`, `transactions`, and `matches`.
- Prefer defensive checks in service layer for balance/status transitions and surface readable errors back to UI.

## Practical Agent Workflow
1. Read `src/App.jsx` and the target page/service before editing.
2. Apply minimal patch in the relevant layer (`pages`, `contexts`, or `services`).
3. Run `npm run lint` for impacted work and report pre-existing vs new issues clearly.
4. If route behavior changes, verify redirects and protected-route behavior in `src/App.jsx`.
