# JOE — Deployment Guide (Fly.io)

This guide deploys the JOE monorepo (Express API + React SPA) to Fly.io as a single app.
The Express server serves both the REST API and the compiled React frontend.

---

## Section 1 — Prerequisites

### Install flyctl

**macOS / Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows:** Download the installer from https://fly.io/docs/flyctl/install/

After installation, verify it works:
```bash
flyctl version
```

### Log in or create an account

```bash
# New account:
fly auth signup

# Existing account:
fly auth login
```

### Docker

`fly deploy` uses Fly's **remote builder** by default — Docker does **not** need to be installed on your machine. The build happens in the cloud. You only need Docker locally if you want to test the image before deploying.

---

## Section 2 — MongoDB Atlas Setup

JOE uses MongoDB Atlas (cloud-hosted MongoDB) instead of a local database. Atlas is independent of any hosting platform — if you ever move to a different host, you just update the `MONGODB_URI` secret. Your data stays intact.

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.

2. Create a **free M0 cluster** (shared, no credit card required). Choose any region.

3. In the cluster, go to **Database Access → Add New Database User**:
   - Authentication method: Password
   - Username: `joe-app`
   - Password: generate a strong password and save it somewhere safe
   - Role: `Read and write to any database`

4. Go to **Network Access → Add IP Address**:
   - Enter `0.0.0.0/0` — this allows connections from Fly.io machines (their IPs change on each deploy)
   - Click Confirm

5. Go to your cluster → **Connect → Drivers** and copy the connection string. It looks like:
   ```
   mongodb+srv://joe-app:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<password>` with the actual password you set in step 3. Also append the database name:
   ```
   mongodb+srv://joe-app:yourpassword@cluster0.xxxxx.mongodb.net/JOEdb?retryWrites=true&w=majority
   ```
   Keep this string — you will need it in Section 4.

> **Note:** Atlas is the source of truth for all data. Moving JOE to a different host later (VPS, Railway, Render, etc.) means only updating the `MONGODB_URI` environment variable on the new host — no data migration needed.

---

## Section 3 — Create the Fly App and Volume

From the **project root** (where `fly.toml` lives):

```bash
cd /path/to/joe-code
```

### Create the app

```bash
fly launch --no-deploy
```

This registers the app with Fly.io and writes the generated app name into `fly.toml`. When prompted:
- Accept or change the app name (it must be globally unique — rename `joe-staging` in `fly.toml` if needed)
- Select region: `fra` (Frankfurt) or whichever is closest to your users
- **Do not** set up a Postgres database (JOE uses MongoDB Atlas)
- **Do not** deploy yet

### Create the persistent Volume

```bash
fly volumes create uploads_data --region fra --size 1
```

This creates a **1 GB persistent disk** that survives deploys, restarts, and machine replacements. Uploaded manuscript files are stored here.

> **Important — single-region limitation:** A Fly Volume is tied to one region and one machine. If you later scale to multiple machines (`fly scale count 2`), each machine gets its own separate volume — uploaded files will **not** be shared between machines. If you need multi-machine scale, migrate file storage to AWS S3 first (see Section 8).

---

## Section 4 — Set Secrets

Secrets are encrypted environment variables stored by Fly. They are never visible after being set and are injected into the running container at startup.

Set all required secrets in one command (replace placeholder values):

```bash
fly secrets set \
  JWT_SECRET="replace-with-a-long-random-string-minimum-32-chars" \
  MONGODB_URI="mongodb+srv://joe-app:yourpassword@cluster0.xxxxx.mongodb.net/JOEdb?retryWrites=true&w=majority" \
  ALLOWED_ORIGIN="https://your-app-name.fly.dev" \
  JWT_EXPIRY="7d"
```

> **Notes:**
> - `PORT` and `NODE_ENV` are already set in `fly.toml [env]` — no need to set them as secrets.
> - `ALLOWED_ORIGIN` must match the exact URL of your deployed app. Find it after `fly launch` completes: it will be `https://<app-name>.fly.dev`. If you add a custom domain later, update this value.
> - `JWT_SECRET` should be a random string of at least 32 characters. Generate one with:
>   ```bash
>   openssl rand -hex 32
>   ```
> - `fly secrets set` can take multiple `KEY=VALUE` pairs in one command, as shown above.

---

## Section 5 — Deploy

```bash
fly deploy
```

What happens:
1. Fly uploads your source code to the remote builder
2. Docker builds the image in two stages (React build → Node runner)
3. The image is pushed to Fly's internal registry
4. A new machine starts with the image and Volume attached

### Check deployment status

```bash
fly status
```

Look for `started` in the machine state column.

### Tail live logs

```bash
fly logs
```

A successful start looks like:
```
[info] App listening on port 8080
[info] MongoDB connected
```

If you see a MongoDB connection error, double-check the `MONGODB_URI` secret and that `0.0.0.0/0` is in Atlas Network Access.

---

## Section 6 — Verify

### Open the app in your browser

```bash
fly open
```

This opens `https://<app-name>.fly.dev` in your default browser.

### Test the health endpoint

```bash
curl https://your-app-name.fly.dev/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-03-11T12:00:00.000Z"}
```

### SSH into the running machine (if needed)

```bash
fly ssh console
```

This gives you a shell inside the running container. Useful for inspecting `/app/backend/uploads`, checking environment variables, or running one-off scripts:

```bash
# Inside the container:
ls /app/backend/uploads
echo $MONGODB_URI
node backend/seed.js   # populate test data
```

---

## Section 7 — Updating the App

After making code changes:

```bash
git add .
git commit -m "your message"
fly deploy
```

That's it. Fly builds a new image and performs a zero-downtime swap.

> **The Volume is NOT affected by deploys.** Files in `/app/backend/uploads` persist across every deploy and restart.

To update a secret:
```bash
fly secrets set JWT_SECRET="new-value"
```
This automatically triggers a restart of the machine.

---

## Section 8 — Moving to Production Hosting Later

When you outgrow Fly.io's free tier or need a dedicated production environment:

### If staying on MongoDB Atlas (recommended)

No data migration needed. Atlas is already production-grade. Simply:
1. Deploy to the new host (VPS, Railway, Render, etc.)
2. Set `MONGODB_URI` to the same Atlas connection string
3. Update `ALLOWED_ORIGIN` to the new domain

Your data is already there. Zero downtime on the database side.

### If migrating the database to a new host

```bash
# Export from Atlas:
mongodump --uri="mongodb+srv://joe-app:password@cluster0.xxxxx.mongodb.net/JOEdb" --out=./dump

# Import to new host:
mongorestore --uri="mongodb://new-host:27017/JOEdb" ./dump/JOEdb
```

### Migrating uploaded files to S3

When ready to move off the Fly Volume:

1. Implement the Multer S3 storage adapter (`multer-s3` package) in `backend/middlewares/fileloader.js`

2. Sync existing files from the Volume to S3 before switching:
   ```bash
   fly ssh console
   # Inside the container:
   aws s3 sync /app/backend/uploads s3://your-bucket/uploads
   ```

3. Update `MONGODB_URI` paths stored in revision documents to point to S3 URLs

### Switching DNS / domain

Before cutting over DNS to the new host:
```bash
# On the new host, set:
ALLOWED_ORIGIN="https://yournewdomain.com"
```
Update this **before** changing DNS to avoid a CORS window.

---

## Section 9 — Changes Applied Automatically by Claude Code

The following code changes were made to prepare the project for production deployment:

| File | Change | Why |
|---|---|---|
| `backend/app.js` | Added `GET /api/health` endpoint before auth middleware | Fly.io health checks require an unauthenticated endpoint to verify the machine is alive |
| `backend/app.js` | Added `express.static` + SPA catch-all in production | Express must serve the React build and handle client-side routes (React Router) in production, where there is no separate CRA dev server |
| `backend/middlewares/fileloader.js` | Upload destination reads `NODE_ENV` and uses `/app/backend/uploads` in production | Multer's `'uploads/'` is CWD-relative; in Docker CWD is `/app`, so files would land in `/app/uploads/` — missing the Fly Volume mounted at `/app/backend/uploads` |
| `frontend/src/utils/api.js` | Fallback changed from `'http://localhost:2000'` to `''` | In production the SPA and API share the same origin; an empty base URL makes all fetch calls go to the same host. Local dev is preserved via `REACT_APP_API_URL=http://localhost:2000` in `frontend/.env` |
