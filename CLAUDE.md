# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JOE (Journal of Everything) is a scientific publishing platform where authors submit manuscripts, peer reviewers are compensated, and editors manage a 30-45 day review cycle. The codebase is a two-tier monolith: Express REST API (`backend/`) + React SPA (`frontend/`).

## Commands

### Backend (`backend/`)
```bash
npm install          # Install dependencies
npm run dev          # Dev server with nodemon → http://localhost:2000
npm start            # Production server
npm run lint         # ESLint (airbnb-base config)
```

### Frontend (`frontend/`)
```bash
npm install          # Install dependencies
npm start            # Dev server → http://localhost:3000
npm run build        # Production build → ./build/
npm test             # Run tests (currently only a placeholder)
```

### Development Setup
1. Copy `backend/.env.example` → `backend/.env` and set `JWT_SECRET` (required, no fallback)
2. Start MongoDB locally (connects to `mongodb://localhost:27017/JOEdb`)
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm start`

`REACT_APP_API_URL=http://localhost:2000` in `frontend/.env` controls the API target.

## Architecture

### Backend: `backend/`
Classic MVC with no service layer:
- **`app.js`** — Express entry; registers middleware (Helmet, rate-limit, CORS, cookie-parser) and mounts all routes
- **`routes/`** — Endpoint definitions with celebrate/Joi validation; some have Swagger annotations
- **`controllers/`** — Business logic handlers
- **`models/`** — Mongoose schemas (Article, Author, Review, Revision, Organisation)
- **`middlewares/auth.js`** — JWT cookie validation for protected routes
- **`errors/errors.js`** — Custom error classes that map to HTTP status codes
- **`middlewares/logger.js`** — Winston request/error logging

API docs available at `GET /api-docs` (swagger-ui-express).

### Frontend: `frontend/src/`
- **`components/App/`** — Root router and auth state; uses React Router v5 (migration to v6 documented in `frontend/ROUTER_MIGRATION.md`)
- **`utils/api.js`** — Fetch client; always uses `credentials: 'include'` for cookie-based auth
- **`utils/auth.js`** — `login()`, `checkSession()`, `signout()` helpers
- **`contexts/CurrentUserContext.js`** — User auth state shared via React Context
- **`categories.js`** — Research field taxonomy (large static data file)

Legacy `blocks/` directory contains leftover components from a previous project (Mesto) — avoid adding to it.

### Domain Model & Article State Machine
The core workflow is encoded in the `Article` model:

```
Submitting → Submitted → SuggestedForReview → UnderReview → WaitingAuthorReply → Accepted → Published
                                                                                 → Rejected
                                                                                 → Revoked
```

Reviewer status per article: `requestedReview → underReview → reviewed | declinedReview | expiredReview`
Reviewer decision: `Accept | Revise | Decline`

### Authentication
JWT is stored in an **HttpOnly, Secure, SameSite=Strict cookie** — never localStorage. The frontend sends it automatically via `credentials: 'include'`. `JWT_SECRET` must be set via env var (the app will not start without it).

### File Storage
Uploaded files are stored locally in `backend/uploads/`. Phase 2 will migrate to AWS S3 + CloudFront. Do not add logic that assumes local storage will persist in production.

## Key Conventions

- **ESLint**: `airbnb-base` is enforced. Run `npm run lint` before committing. Notable rule overrides: `no-underscore-dangle` allows `_id`; `no-useless-escape` is off.
- **CSS**: BEM methodology, plain CSS files. No CSS-in-JS or utility frameworks.
- **Validation**: All input validation happens at the route layer via `celebrate` + Joi schemas — not in controllers.
- **Errors**: Throw instances from `errors/errors.js` rather than raw `Error`; the global error handler maps them to HTTP responses.
- **Logging**: Use Winston (`middlewares/logger.js`) — do not use `console.log` in backend code.
- **No tests yet**: Zero tests exist. The article state machine and reviewer matching logic (`controllers/engine/reviewerselector.js`) are the highest-priority targets for future test coverage.

## Known Gaps (Phase 2 Scope)
- React Router v5 → v6 migration (see `frontend/ROUTER_MIGRATION.md`)
- Swagger annotations incomplete for `revisions`, `organisations`, `myaccount` routes
- No Redis (logout doesn't blacklist tokens; rate-limit state is in-memory)
- No async job queue (reviewer matching runs synchronously in request handler)
- No email, payment (Stripe), or plagiarism-check (iThenticate) integrations
- No CI/CD pipeline or Docker setup
