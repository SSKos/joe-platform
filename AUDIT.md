# Project Audit Report — JOE (Journal of Everything)

## 1. Project Overview

- **Goal**: A transparent, equitable scientific publishing platform that compensates peer reviewers, accepts manuscripts in any format, and targets a 30–45 day editorial decision cycle.
- **Target users**: Academic authors (submitters), peer reviewers, editors, and institutional members worldwide.
- **Scale estimate**: **Large** — the specification explicitly targets tens of thousands of users, hundreds of thousands of published articles, and significant associated media (images, video, audio, supplementary data) with global, low-latency access requirements.
- **Key requirements**:
  - Full manuscript lifecycle workflow: Submission → Desk Review → Peer Review → Decision → Revision → Acceptance → Production → Publication
  - File ingestion in heterogeneous formats (DOCX, LaTeX, PDF, Markdown)
  - AI-assisted reviewer matching by expertise and workload
  - Monetary compensation processing for reviewers (Stripe/PayPal)
  - Post-publication commentary, corrections, and retraction audit trail
  - Integration with ORCID, Crossref/DOI, PubMed, iThenticate, Altmetric
  - Tiered, equitable APC pricing with full waiver support

---

## 2. Tech Stack Inventory

| Layer | Technology | Version (if known) |
|-------|------------|-------------------|
| Language (backend) | Node.js / JavaScript | Not pinned in package.json |
| Framework (backend) | Express | ^4.17.1 |
| ODM | Mongoose | ^6.0.8 |
| Database | MongoDB | localhost:27017 (no version pinned) |
| Authentication | JWT (jsonwebtoken) | ^8.5.1 |
| Password hashing | bcryptjs | ^2.4.3 |
| Validation | celebrate (Joi) + validator.js | ^15.0.0 / ^13.7.0 |
| File uploads | Multer | ^1.4.5-lts.1 |
| Logging | Winston + express-winston | ^3.3.3 / ^4.2.0 |
| Language (frontend) | JavaScript (TypeScript listed but unused) | — |
| UI framework | React | ^17.0.1 |
| Routing | React Router DOM | ^5.3.3 |
| Document preview | react-pdf, mammoth | ^7.3.3 / ^1.6.0 |
| Styling | Plain CSS with BEM methodology | — |
| Build tooling | Create React App (react-scripts) | ^5.0.1 |
| File storage | Local filesystem (`backend/uploads/`) | — |
| Infrastructure | None (bare Node.js process) | — |
| CI/CD | None | — |
| Testing | None | — |

**Architectural pattern detected**: Classic two-tier MVC monolith — Express REST API (Controllers / Routes / Models) + React SPA. No service layer, no async job queue, no caching, no search index.

---

## 3. Stack & Architecture Evaluation

### 3.1 Strengths

- **Domain model is coherent.** The five Mongoose schemas — `Author`, `Article`, `Revision`, `Review`, `Organisation` — correctly capture the scientific publishing workflow. The `Article.state` enum (`Submitting → Submitted → SuggestedForReview → UnderReview → ... → Published`) is accurate and matches the spec's editorial pipeline.
- **Validation is present from the start.** Using `celebrate`/`Joi` at the route layer enforces input contracts early.
- **Error handling is structured.** Custom error classes in `errors/errors.js` map cleanly to HTTP status codes, preventing naked 500 responses.
- **Winston logging is configured.** Separate request and error log streams are a good baseline.
- **Reviewer selector exists.** `controllers/engine/reviewerselector.js` shows awareness of the AI-matching requirement even at skeleton stage.
- **ESLint (airbnb-base) is enforced.** Consistent code style across the backend codebase.

---

### 3.2 Concerns

#### CRITICAL

**C1 — Frontend is a repurposed learning project (Mesto photo-sharing app)**
The frontend is a direct fork of a Yandex Practicum "Mesto" educational project and has not been cleaned up. Evidence:
- `frontend/src/components/AddPlacePopup.js`, `EditAvatarPopup.js`, `ImagePopup.js`, `Main copy.js` — none of these belong to a scientific publishing platform.
- The `package.json` deploy script targets `avlavrov@62.84.117.220:/home/avlavrov/mesto/react-mesto-api-full/frontend` (hardcoded IP + Mesto path).
- Domain names: `mesto.lavrov.nomoredomains.work` / `api.mesto.lavrov.nomoredomains.work`.
- The frontend `README.md` explicitly describes authentication and API issues from the original Mesto integration.
This is not merely cosmetic — it signals that shared state management, routing, and component contracts were designed for a different domain and may carry hidden assumptions incompatible with the publishing workflow.

**C2 — JWT stored in `localStorage` (XSS vulnerability)**
`frontend/src/utils/auth.js` and `api.js` store and read the JWT from `localStorage`. Any XSS attack can exfiltrate the token. For a platform storing sensitive research, unpublished manuscripts, and payment information, this is unacceptable. Tokens must be stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies managed server-side.

**C3 — Local filesystem used for all file storage**
`middlewares/fileloader.js` (Multer) writes uploaded manuscripts, review documents, and supplements directly to `backend/uploads/`. This is incompatible with the spec's requirement for large-scale media (images, video, audio) and distributed/CDN delivery. A single server disk will exhaust, files are lost on server replacement, and there is no CDN layer. Integration with AWS S3 (or equivalent object storage) is listed in the spec as a planned integration — it must be a Day 1 requirement, not a future upgrade.

**C4 — Hardcoded fallback JWT secret**
`middlewares/auth.js` falls back to `'some-secret-key'` when `NODE_ENV` is not `production`. This is a well-known anti-pattern: development secrets routinely leak into staging and production environments. All secrets must be required, not optional.

**C5 — No helmet, no rate limiting**
The Express app has neither `helmet` (security headers) nor any rate limiter (`express-rate-limit`). The backend README contains a comment noting these are commented out. For an internet-facing platform accepting file uploads and processing payments, missing security headers (CSP, HSTS, X-Frame-Options) and absence of rate limiting are critical gaps.

---

#### HIGH

**H1 — Severely outdated dependencies**

| Package | Current in project | Latest stable | Gap |
|---|---|---|---|
| React | 17.0.1 | 19.x | 2 major versions |
| React Router DOM | 5.3.3 | 7.x | 2 major versions |
| Mongoose | 6.0.8 | 8.x | 2 major versions |
| jsonwebtoken | 8.5.1 | 9.x | 1 major version |
| dotenv | 10.0.0 | 16.x | significant |

Running 2-major-version-old dependencies means missing security patches, performance improvements, and bug fixes accumulated over multiple years.

**H2 — No horizontal scalability path for the database**
MongoDB is configured at `mongodb://localhost:27017/JOEdb` — a single-node, local instance. There is no replica set, no connection pooling configuration, no sharding plan. For a platform targeting hundreds of thousands of articles with concurrent global access, a standalone local MongoDB is a hard architectural ceiling.

**H3 — No full-text search infrastructure**
There is no search index (Elasticsearch/OpenSearch/Typesense) anywhere in the stack. For a scientific publishing platform, finding articles by keyword, author, category, and abstract text is a core feature. MongoDB's built-in text search will not scale to hundreds of thousands of documents with the relevance ranking researchers expect.

**H4 — No async job queue**
Reviewer assignment (`reviewerselector.js`), plagiarism checks, email notifications, payment processing, and DOI registration are all inherently asynchronous operations. The current architecture has no message queue (BullMQ, RabbitMQ, etc.), meaning these operations either block request handlers or are absent. Blocking expensive operations in Express request handlers will cause timeout failures under load.

**H5 — `/uploads` route bypasses authentication**
`middlewares/auth.js` explicitly skips JWT validation for the `/uploads` path (`if (req.path === '/uploads') { ... return next(); }`). This means all uploaded files — including unpublished manuscripts under peer review — are publicly accessible if the URL is known. Pre-publication manuscripts must be protected.

**H6 — No state management for complex client-side workflow**
React's `useState`/`useContext` (managed in `App.js`) is adequate for simple apps. The submission → revision → review → decision cycle involves deeply nested state (article, revisions array, reviewers array, review documents, reviewer decisions) that will become unmanageable without a structured state management approach (Zustand, Redux Toolkit, or React Query for server state).

---

#### MEDIUM

**M1 — TypeScript is listed as a dependency but not used**
`typescript: ^4.3.2` appears in `frontend/package.json` but all source files are `.js`. For a platform of this scale and complexity, the lack of type safety will cause integration bugs between the API contract and the frontend. Either adopt TypeScript fully or remove the dependency.

**M2 — No environment file template**
There is no `.env.example` or `.env.template` committed to the repository. New developers have no way to know what environment variables are required (JWT secret, MongoDB URI, port, etc.) without reading the source code.

**M3 — No API documentation**
No Swagger/OpenAPI spec exists. With a complex REST surface (articles, revisions, reviews, authors, organisations, nested routes), undocumented endpoints become a maintenance liability and block frontend/backend parallel development.

**M4 — React 17 / Create React App**
Create React App is unmaintained (last release 2022). The standard build tooling for new React projects is Vite or Next.js. Staying on CRA means accumulating security vulnerabilities in build tooling with no upstream fixes.

**M5 — `"All files for deepseek"` directory committed to backend**
A directory of backup/AI-generated files is committed to the repository. This pollutes the git history, may contain sensitive logic or credentials, and signals an undisciplined development workflow. All experimental/backup files must be excluded from version control.

---

#### LOW

**L1 — `/crash-test` endpoint must be removed before any deployment**
`app.js` contains a `GET /crash-test` route that intentionally throws an unhandled error. The comment says "KILL before production" — this must be enforced via CI rather than relying on manual memory.

**L2 — `console.log` statements in production code**
Debug `console.log` calls appear throughout controllers. These should be replaced with the Winston logger instances already configured.

**L3 — No React error boundary**
The React app has no `ErrorBoundary` component. An unhandled rendering error will crash the entire SPA with a blank screen rather than showing a degraded-but-functional state.

---

### 3.3 Missing Components

| Component | Impact |
|---|---|
| **Tests** — zero test files exist in either project | Cannot validate correctness, cannot refactor safely |
| **CI/CD pipeline** — no `.github/workflows` or equivalent | No automated checks before merge or deploy |
| **Docker / docker-compose** — no containerisation | Environment inconsistency; no path to cloud deployment |
| **`.env.example`** | Blocks new developer onboarding |
| **Swagger / OpenAPI spec** | Frontend/backend contract is implicit and fragile |
| **Redis** — no caching or session store | Required for rate limiting state, token blacklisting on logout, caching hot article abstracts |
| **Payment integration** — Stripe/PayPal not started | Core revenue and reviewer compensation feature |
| **Email service** — no notification infrastructure | Editorial workflow requires email at every state transition |
| **Plagiarism detection hook** — no iThenticate/Turnitin integration | Required pre-publication quality check |
| **ORCID integration** — no OAuth/API client | Mandatory researcher identification per spec |

---

## 4. Recommendations

| # | Recommendation | Rationale | Priority |
|---|---------------|-----------|----------|
| 1 | **Purge all Mesto legacy artifacts from the frontend** — delete `AddPlacePopup.js`, `EditAvatarPopup.js`, `ImagePopup.js`, `Main copy.js`, update deploy script and domain references | Leftover code from a different domain creates confusion, hidden bugs, and technical debt that compounds as the platform grows | **Critical** |
| 2 | **Replace `localStorage` JWT with `HttpOnly` cookies** — switch to a cookie-based auth flow server-side; remove token from JS-accessible storage | Eliminates XSS token theft for a platform handling unpublished research and payment data | **Critical** |
| 3 | **Migrate file storage to S3 (or compatible object storage) with CDN** — replace Multer local disk with `@aws-sdk/client-s3` or `multer-s3`; serve via CloudFront or equivalent | Required for stated scale; local disk is a hard ceiling on storage and has no redundancy or CDN delivery | **Critical** |
| 4 | **Remove hardcoded fallback JWT secret; require all secrets via env** — throw on startup if `JWT_SECRET` is absent | Prevents the well-known secret-bleeding anti-pattern | **Critical** |
| 5 | **Add `helmet` and `express-rate-limit`** — apply to all routes; tighten CORS to production origins only | Baseline security hardening for any internet-facing API | **Critical** |
| 6 | **Restrict the `/uploads` path behind auth middleware** — remove the `path === '/uploads'` bypass; use pre-signed S3 URLs for authorized access | Unpublished manuscripts must not be publicly accessible | **Critical** |
| 7 | **Upgrade core dependencies** — React → 18.x, React Router → 6.x, Mongoose → 8.x, jsonwebtoken → 9.x; migrate from CRA to Vite | Security patches, performance, and access to current ecosystem tooling | **High** |
| 8 | **Replace single-node MongoDB with a replica set; plan for Atlas or managed MongoDB** | Foundation for the stated scale; replica set also enables change streams for real-time workflow updates | **High** |
| 9 | **Add a job queue (BullMQ + Redis)** — offload reviewer matching, plagiarism checks, email notifications, payment webhooks | Async operations must not block request handlers; critical for reliability at scale | **High** |
| 10 | **Introduce full-text search** — Elasticsearch or OpenSearch (or Typesense for simpler ops); sync article metadata on publish | Core discoverability feature; MongoDB text search will not meet researcher expectations at 100k+ articles | **High** |
| 11 | **Add Docker + docker-compose** — containerise backend, frontend build, MongoDB, Redis, and search; add `.env.example` | Reproducible environments; prerequisite for cloud deployment and CI | **High** |
| 12 | **Set up testing infrastructure** — Jest + Supertest for backend route/controller tests; React Testing Library for frontend components; aim for coverage of the workflow state machine | Zero tests means zero safety net for any change | **High** |
| 13 | **Migrate frontend to TypeScript** — rename `.js` → `.tsx`, generate types from the API schema | TypeScript is already a dependency; the complex nested state (Article → Revision → Review) will produce hard-to-debug runtime errors without it | **Medium** |
| 14 | **Add Swagger/OpenAPI documentation** — `swagger-jsdoc` + `swagger-ui-express` on the backend | Required for frontend/backend contract clarity and future third-party integrations | **Medium** |
| 15 | **Set up CI/CD pipeline** — GitHub Actions: lint → test → build → deploy | Enforces quality gates; automates the currently manual `scp` deploy | **Medium** |
| 16 | **Introduce client-side state management** — React Query for server state (article, revision, review data) + Zustand or Context for local UI state | Submission-through-publication workflow is too stateful for ad-hoc `useState` in `App.js` | **Medium** |

### Recommended Architecture (Phase 1 Target)

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN (CloudFront)                     │
│            Static frontend assets + media delivery          │
└──────────────┬────────────────────────────┬────────────────┘
               │                            │
    ┌──────────▼──────────┐      ┌──────────▼──────────┐
    │   React SPA (Vite)  │      │  Object Storage (S3) │
    │   TypeScript + RQ   │      │  Manuscripts / Media │
    └──────────┬──────────┘      └─────────────────────┘
               │ HTTPS / HttpOnly Cookie Auth
    ┌──────────▼──────────┐
    │  Express API (v5)   │◄──── Redis (cache + rate limit + BullMQ)
    │  Node.js            │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐      ┌─────────────────────┐
    │  MongoDB Atlas       │      │ Elasticsearch /      │
    │  Replica Set         │      │ OpenSearch           │
    │  (JOEdb)            │      │ (article search)     │
    └─────────────────────┘      └─────────────────────┘
               │
    ┌──────────▼──────────┐
    │  BullMQ Workers     │
    │  - Reviewer match   │
    │  - Plagiarism check │
    │  - Email dispatch   │
    │  - Payment webhook  │
    └─────────────────────┘
```

This remains a monolith (appropriate for Phase 1 / Year 1 scale), with clear internal boundaries that can be extracted into services later if needed.

---

## 5. Summary & Next Steps

The domain model and core API routing skeleton are sound — the Mongoose schemas accurately represent the scientific publishing workflow, and the reviewer selection engine shows domain awareness. However, the platform is being built on a frontend codebase inherited from an unrelated learning project (Mesto), and the infrastructure choices (local MongoDB, local file storage, no job queue, no tests, no CI) are misaligned with the scale explicitly stated in the spec: tens of thousands of users, hundreds of thousands of articles, and large associated media.

**Immediate priorities before any further feature development:**

1. **Clean the frontend** — remove all Mesto artifacts (week 1, unblocks all frontend work).
2. **Fix the three critical security issues** — `localStorage` tokens, public `/uploads` bypass, missing `helmet`/rate limiting (week 1–2).
3. **Switch file storage to S3** — this architectural change touches models, controllers, and the frontend upload flow; doing it now costs 1–2 weeks and saves a painful migration later.
4. **Add Docker + `.env.example`** — essential for team onboarding and reliable testing environments.
5. **Write baseline tests for the Article state machine** — the workflow engine is the highest-risk, highest-value code in the project.

The platform has a strong product vision and a coherent data model. Addressing the critical and high-priority items above within the next 4–6 weeks will place the codebase on a solid foundation for scaling through Phase 2 and beyond.

---
*Audit generated by Claude Code — 2026-03-10*
