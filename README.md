# Shorty Frontend

Frontend for Shorty URL shortener, built with React + Vite, animated glass UI, routing, auth session bootstrapping, and comprehensive Vitest coverage.

## Tech Stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Sonner (toasts)
- Vitest + Testing Library

## Quick Start

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Quality Commands

```bash
npm run lint
npm run test -- --run
```

## Project Structure

The project follows layered architecture with gradual migration to reusable feature modules:

```text
src/
  app/                 # app composition (providers, router, root)
  pages/               # route-level pages
  features/            # domain features (auth/profile/shorten)
  entities/            # domain entity contracts (user, short-link)
  shared/              # reusable ui/lib/config/i18n
  components/          # legacy shared components (transitional)
  lib/                 # legacy utilities (transitional)
  test/                # unit/integration tests
```

## Architecture Notes

- `src/app/providers/AppProviders.jsx` is the composition root for `Theme`, `Lang`, `Auth`, and `Toaster`.
- `src/app/router/AppRouter.jsx` contains centralized route declarations and redirects.
- `src/app/router/RequireAuth.jsx` guards private routes based on `AuthContext`.
- `src/shared/config/motionTokens.js` is the single source of truth for motion/hover tokens.
- `src/shared/ui/PageHeaderReveal.jsx` provides consistent animated page header behavior.

## UI System Conventions

- Use tokens from `src/shared/config/motionTokens.js` instead of hardcoding durations/easing.
- Prefer `GLASS_HOVER_INTERACTIVE_CLASS` for hover lift on glass cards to keep light/dark behavior consistent.
- Reuse `AppBackground` (`src/shared/ui/AppBackground.jsx`) instead of duplicating blob backgrounds.
- Use `copyTextToClipboard` from `src/shared/lib/clipboard.js` instead of repeating clipboard fallbacks.

## i18n and Theming

- Translations are provided by `LangContext` and dictionary in `src/translations.js` (re-exported through `src/shared/i18n/translations.js`).
- Theme mode is managed by `ThemeContext` and persisted via `localStorage` (`shorty-theme`).

## Testing Strategy

- Component tests validate behavior of key UX flows (`ShortenForm`, `AuthPage`, `ProfilePage`, routing).
- API wrapper and contexts are tested independently (`api`, `AuthContext`, language dictionary).
- Use `src/test/helpers.jsx` for provider-aware rendering in tests.

## How to Add a New Feature

1. Create feature module under `src/features/<feature-name>/`.
2. Put pure domain helpers in `model/` or `lib/`.
3. Put reusable UI for that feature in `ui/`.
4. Keep page-level composition in `src/pages/`.
5. Reuse shared tokens/utilities from `src/shared`.
6. Add or update Vitest coverage for business logic and critical UI states.

## Troubleshooting

- If auth-protected routes loop to login, check refresh endpoint behavior in `AuthContext`.
- If global network indicator appears unexpectedly, verify `silent: true` usage for background refreshes.
- If animations feel inconsistent, audit components for hardcoded timing values and replace with motion tokens.

## Definition of Done for Frontend Changes

- `npm run lint` passes
- `npm run test -- --run` passes
- Light and dark theme visual states both checked
- New UI behavior is tokenized/reused where applicable
- Relevant docs and tests are updated
