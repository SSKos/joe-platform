# Remediation Report — JOE

**Date**: 2026-03-10
**Phases completed**: Phase 1 (Critical), Phase 2 (High Priority), Phase 3 (Medium Priority)

---

## Changes Made

### Phase 1 — Critical

| Issue | Status | Files Changed |
|-------|--------|---------------|
| C1 — Purge Mesto legacy artifacts | ✅ Done | Deleted: `AddPlacePopup.js`, `EditAvatarPopup.js`, `EditProfilePopup.js`, `ImagePopup.js`, `InfoTooltip.js`, `PopupWithForm.js`, `Main copy.js`; Updated: `App/App.js` (removed commented imports + JSX block), `frontend/package.json` (deploy script), `frontend/README.md` |
| C2 — HttpOnly cookies (replace localStorage JWT) | ✅ Done | `backend/middlewares/auth.js` (cookie extraction), `backend/app.js` (cookie-parser middleware, `/signout` route), `backend/controllers/authors.js` (`login` sets cookie), `frontend/src/utils/auth.js` (new `checkSession`, `signout`, removed Bearer header), `frontend/src/utils/api.js` (removed `_setToken`, added `credentials: 'include'`), `frontend/src/components/App/App.js` (removed localStorage, uses `checkSession`) |
| C3 — Remove hardcoded JWT secret fallback | ✅ Done | `backend/middlewares/auth.js` (module-load check, throws if `JWT_SECRET` unset), `backend/controllers/authors.js` (`login` no longer uses fallback) |
| C4 — Add helmet + express-rate-limit | ✅ Done | `backend/app.js` (both middlewares enabled; CORS updated to env-driven `ALLOWED_ORIGIN`); packages installed |
| C5 — Protect `/uploads` behind auth | ✅ Done | `backend/middlewares/auth.js` (bypass removed entirely); `/uploads` static route is registered after `app.use(auth)` and now requires a valid session cookie |
| C6 — Create `.env.example` | ✅ Done | `backend/.env.example`, `frontend/.env.example` (both created with all required + Phase-2 variables documented) |

### Phase 2 — High Priority

| Issue | Status | Files Changed |
|-------|--------|---------------|
| H1 — Remove `/crash-test` endpoint | ✅ Done | `backend/app.js` |
| H2 — Replace `console.log` with Winston logger | ✅ Done | `backend/middlewares/logger.js` (added standalone `logger` export); all 6 controller files updated: `articles.js`, `authors.js`, `organisations.js`, `myaccount.js`, `reviews.js`, `revisions.js` (also fixed incorrect `require('winston')` import in `revisions.js`) |
| H3 — Remove `All files for deepseek` directory | ✅ Done | Directory deleted; `backend/.gitignore` updated with `*deepseek*/`, `*backup*/` patterns |
| H4 — Add React ErrorBoundary | ✅ Done | `frontend/src/components/ErrorBoundary/ErrorBoundary.js` (new file); `frontend/src/index.js` (wrapped `<App>`) |
| H5 — Upgrade dependencies | ✅ Done | Backend: `mongoose@^8`, `jsonwebtoken@^9`, `dotenv@^16`; Frontend: `react@^18`, `react-dom@^18`; `index.js` migrated to `createRoot` API; `frontend/ROUTER_MIGRATION.md` created for React Router v5→v6 migration |

### Phase 3 — Medium Priority

| Issue | Status | Files Changed |
|-------|--------|---------------|
| M1 — Remove unused TypeScript dependency | ✅ Done | `frontend/package.json` (`typescript` entry removed) |
| M2 — Add Swagger/OpenAPI documentation | ✅ Done | `backend/swagger.js` (new); `backend/app.js` (`/api-docs` endpoint registered); Annotations added to `routes/articles.js`, `routes/authors.js`, `routes/reviews.js`; TODO markers added to `routes/revisions.js` |

---

## Remaining Manual Work

| # | Item | Notes |
|---|------|-------|
| 1 | **Set `JWT_SECRET` in `.env`** | Copy `backend/.env.example` → `backend/.env`, generate a secret with `openssl rand -hex 64`. The server will now crash on startup if this is missing. |
| 2 | **Set `ALLOWED_ORIGIN` in production** | Set to the deployed frontend URL. Currently defaults to `http://localhost:3000`. |
| 3 | **Set `MONGODB_URI` in production** | Should point to a MongoDB Atlas replica set, not `localhost`. |
| 4 | **React Router v5 → v6 migration** | See `frontend/ROUTER_MIGRATION.md`. Estimated 3–4 hours. Required before production deployment. |
| 5 | **Swagger annotations for remaining routes** | `routes/revisions.js`, `routes/organisations.js`, `routes/myaccount.js` have TODO markers — add `@swagger` JSDoc to each. |
| 6 | **Run `npm install` in `frontend/`** | The TypeScript removal only updated `package.json`; run `npm install` from `frontend/` to clean the lockfile. |
| 7 | **S3 migration (Phase 2 scope)** | `backend/uploads/` is still local disk. Requires installing `@aws-sdk/client-s3` or `multer-s3`, setting AWS env vars, and updating `middlewares/fileloader.js`. Variables are documented in `.env.example`. |
| 8 | **Redis + job queue (Phase 2 scope)** | Reviewer matching, notifications, payments need async processing via BullMQ. Variables in `.env.example`. |
| 9 | **Test infrastructure** | Zero tests exist. Backend: add Jest + Supertest; priority: Article state machine in `controllers/articles.js` + `controllers/reviews.js`. Frontend: React Testing Library for auth flow. |
| 10 | **CI/CD pipeline** | No `.github/workflows` exists. Minimum pipeline: lint → test → build. |

---

## How to Verify

1. **JWT_SECRET enforcement** — Start the backend *without* a `.env` file or with `JWT_SECRET=` empty. The process should throw `JWT_SECRET environment variable is required but not set. Aborting.` and exit before binding to a port.

2. **HttpOnly cookie on login**
   - Start backend with `JWT_SECRET` set.
   - `POST /signin` with valid credentials.
   - Inspect the response headers: confirm `Set-Cookie: jwt=...; HttpOnly; SameSite=Strict` is present.
   - Confirm the response body is `{ "message": "Login successful" }` (no token in body).

3. **Session check via cookie**
   - After logging in (cookie set), `GET /authors/me` with no `Authorization` header.
   - Should return `200` with the author's profile (cookie sent automatically by the browser).

4. **Signout clears cookie**
   - `POST /signout`.
   - Confirm `Set-Cookie: jwt=; Max-Age=0` in response.
   - Subsequent `GET /authors/me` should return `401`.

5. **`/uploads` requires auth**
   - Without logging in, attempt `GET /uploads/<any-filename>`.
   - Should return `401 You are not authorised to access this resource`.
   - After logging in (cookie set), the same request should return the file or `404` if not found.

6. **No Mesto artifacts in frontend**
   - `grep -r "Mesto\|mesto\|AddPlacePopup\|EditAvatarPopup\|ImagePopup" frontend/src/` — should return no active (non-commented) references.

7. **Swagger UI**
   - Start backend: `npm run dev`
   - Open `http://localhost:2000/api-docs` — should show the JOE API documentation with Articles, Authors, and Reviews sections.

8. **React 18 root**
   - Start frontend: `npm start`
   - Confirm no `ReactDOM.render is no longer supported` warning in the browser console.
   - Confirm the app renders without an `ErrorBoundary` crash.

---

*Remediation executed by Claude Code — 2026-03-10*
