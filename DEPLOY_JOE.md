# JOE — Deployment Guide (Hetzner, alongside Portfolio)

JOE runs as two Docker containers (`joe_backend`, `joe_mongo`) on the same Hetzner server
as the Portfolio stack. The existing `portfolio_nginx` handles SSL termination and reverse
proxying for both applications. **The Portfolio stack is never modified.**

---

## Section 1 — Prerequisites Check

SSH into the server, then verify:

```bash
docker --version        # need 24+
git --version           # need any recent version
df -h /var/www          # check free disk (need at least 2 GB free)
docker ps               # confirm portfolio containers are running
```

Expected output of `docker ps` — these four must be running:
```
portfolio_nginx
portfolio_frontend_prod
portfolio_backend_prod
portfolio_db_prod
```

---

## Section 2 — DNS Setup

In your DNS provider (Cloudflare, Namecheap, etc.) add an **A record**:

| Type | Name | Value           | TTL  |
|------|------|-----------------|------|
| A    | joe  | 157.180.85.212  | Auto |

This creates `joe.kk-about.me → 157.180.85.212`.

DNS changes propagate in 5–30 minutes. Verify before continuing:

```bash
dig +short joe.kk-about.me
# Must return: 157.180.85.212
```

Do not proceed to Section 5 (SSL) until this returns the correct IP.

---

## Section 3 — Clone Repository and Configure Environment

```bash
# Clone into /var/www/joe
git clone https://github.com/SSKos/joe-platform.git /var/www/joe
cd /var/www/joe

# Create the env file from the template
cp .env.joe.example .env.joe
nano .env.joe
```

Fill in each variable:

| Variable | What to put |
|---|---|
| `PORT` | Leave as `3000` — must match Dockerfile |
| `NODE_ENV` | Leave as `production` |
| `JWT_SECRET` | Run `openssl rand -hex 32` and paste the output |
| `JWT_EXPIRY` | Leave as `7d` (or adjust to taste) |
| `MONGODB_URI` | Leave as `mongodb://joe_mongo:27017/JOEdb` — `joe_mongo` is the Docker container name, resolved by Docker's internal DNS |
| `ALLOWED_ORIGIN` | `https://joe.kk-about.me` (exact URL, no trailing slash) |

**Critical:** `.env.joe` must never be committed to git. Confirm it is ignored:

```bash
grep ".env.joe" .gitignore
```

If not listed, add it:

```bash
echo ".env.joe" >> .gitignore
```

---

## Section 4 — Create Shared Network and Start JOE Containers

### 4a — Create the shared Docker network

`portfolio_nginx` handles all incoming traffic. It needs to reach `joe_backend`, but
they are on separate Docker networks by default. The solution is a shared external
network called `nginx_shared`.

```bash
# Create the shared network (once, fails silently if already exists)
docker network create nginx_shared

# Connect the existing portfolio nginx to this network
docker network connect nginx_shared portfolio_nginx

# Verify the connection
docker network inspect nginx_shared --format '{{range .Containers}}{{.Name}} {{end}}'
# Must include: portfolio_nginx
```

> **Note:** If `portfolio_nginx` is ever recreated (e.g., after `docker compose up --build`
> on the portfolio), run `docker network connect nginx_shared portfolio_nginx` again.
> The `nginx_shared` network itself is permanent and does not need to be recreated.

### 4b — Build and start JOE

```bash
cd /var/www/joe

docker compose -f joe-docker-compose.prod.yml --env-file .env.joe up -d --build
```

Docker will:
1. Build the multi-stage image (React build → Node runner, takes ~2–3 min)
2. Pull `mongo:7`
3. Start `joe_mongo`, then `joe_backend`

Check startup logs:

```bash
docker compose -f joe-docker-compose.prod.yml logs -f
```

A successful start looks like:
```
joe_backend  | App listening on port 3000
```

Press `Ctrl+C` to stop following logs. Check container health:

```bash
docker ps | grep joe
# Both joe_backend and joe_mongo must show status "Up"
```

Test the backend is reachable from inside the server (before nginx is configured):

```bash
docker exec portfolio_nginx wget -qO- http://joe_backend:3000/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

If this fails, the `nginx_shared` network is not connected — re-run Section 4a.

---

## Section 5 — SSL Certificate for joe.kk-about.me

The existing `portfolio_nginx` is already running on ports 80 and 443. You cannot
use certbot's standalone mode (it would conflict). Use **webroot mode** instead —
certbot writes a challenge file to disk, and nginx serves it over HTTP.

### 5a — Find the nginx config mount and certbot webroot

```bash
docker inspect portfolio_nginx | grep -A 40 '"Mounts"'
```

Look for the mount that maps to `/etc/nginx/conf.d` in the container — that is where
you will place `joe.nginx.conf`. Also look for a mount to `/var/www/certbot` — that
is the webroot certbot uses.

Common output patterns:

| Host path | Container path | Purpose |
|---|---|---|
| `/var/www/html/nginx/conf.d` | `/etc/nginx/conf.d` | nginx site configs |
| `/var/www/certbot` | `/var/www/certbot` | certbot webroot |
| `/etc/letsencrypt` | `/etc/letsencrypt` | certificates (read-only) |

If `/var/www/certbot` is not mounted, check what webroot path the existing
kk-about.me certificate was obtained with:
```bash
certbot certificates
```

### 5b — Add the HTTP-only nginx block first

Copy `joe.nginx.conf` to the nginx config directory found in 5a. For example:

```bash
cp /var/www/joe/joe.nginx.conf /var/www/html/nginx/conf.d/joe.nginx.conf
```

Before reloading, the HTTPS server block references a certificate that doesn't exist
yet. **Comment out the entire second `server { ... }` block** (lines starting with
`# Phase 2`) for now:

```bash
nano /var/www/html/nginx/conf.d/joe.nginx.conf
# Comment out from "# Phase 2" to the end of the file with #
```

Test nginx config and reload:

```bash
docker exec portfolio_nginx nginx -t
docker exec portfolio_nginx nginx -s reload
```

Verify HTTP works:

```bash
curl -I http://joe.kk-about.me/.well-known/acme-challenge/
# Must return 404 (directory exists but no challenge file yet — that's correct)
```

### 5c — Obtain the certificate

```bash
certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  -d joe.kk-about.me \
  --email your@email.com \
  --agree-tos \
  --no-eff-email
```

Successful output ends with:
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/joe.kk-about.me/fullchain.pem
```

### 5d — Activate the HTTPS block

Uncomment the Phase 2 HTTPS server block in `joe.nginx.conf`:

```bash
nano /var/www/html/nginx/conf.d/joe.nginx.conf
# Remove the # comments from the Phase 2 server block
```

Reload nginx:

```bash
docker exec portfolio_nginx nginx -t   # must say "syntax is ok"
docker exec portfolio_nginx nginx -s reload
```

---

## Section 6 — Verify the Deployment

```bash
# Health check
curl https://joe.kk-about.me/api/health
# Expected: {"status":"ok","timestamp":"..."}

# HTTP → HTTPS redirect
curl -I http://joe.kk-about.me
# Expected: HTTP/1.1 301 Moved Permanently

# Open in browser
echo "Open: https://joe.kk-about.me"
```

Check that kk-about.me (the portfolio) still works:

```bash
curl -I https://kk-about.me
# Must return 200 — portfolio must be unaffected
```

---

## Section 7 — Updating JOE After Code Changes

```bash
cd /var/www/joe
git pull

docker compose -f joe-docker-compose.prod.yml --env-file .env.joe up -d --build
```

Docker Compose rebuilds the image and replaces `joe_backend` with zero impact on
`joe_mongo` or the Portfolio stack. The old container serves traffic until the new one
is healthy, then Docker switches over.

MongoDB data (volume `joe_mongo_data`) and uploaded files (volume `joe_uploads`) are
**never affected by deploys**.

To update environment variables:

```bash
nano .env.joe
# Edit values, then restart the backend:
docker compose -f joe-docker-compose.prod.yml --env-file .env.joe up -d joe_backend
```

---

## Section 8 — Monitoring and Troubleshooting

**View live JOE logs:**
```bash
docker compose -f joe-docker-compose.prod.yml logs -f joe_backend
```

**View MongoDB logs:**
```bash
docker compose -f joe-docker-compose.prod.yml logs -f joe_mongo
```

**Open a MongoDB shell:**
```bash
docker exec -it joe_mongo mongosh JOEdb
# Inside mongosh:
db.articles.countDocuments()
db.authors.find({}, {email: 1})
exit
```

**Restart only the backend (without rebuilding):**
```bash
docker compose -f joe-docker-compose.prod.yml restart joe_backend
```

**Check all running containers:**
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Check nginx can reach joe_backend:**
```bash
docker exec portfolio_nginx wget -qO- http://joe_backend:3000/api/health
```

**If `joe_backend` is unreachable from nginx** — the shared network was lost:
```bash
docker network connect nginx_shared portfolio_nginx
docker exec portfolio_nginx nginx -s reload
```

**Check disk and volume usage:**
```bash
df -h /var/www
docker system df
docker volume inspect joe_mongo_data
docker volume inspect joe_uploads
```

---

## Section 9 — Moving to a Different Server

### MongoDB data

JOE's MongoDB data lives in the Docker named volume `joe_mongo_data`. To move it:

```bash
# On the current server — dump the database
docker exec joe_mongo mongodump --db JOEdb --out /tmp/joedump
docker cp joe_mongo:/tmp/joedump ./joedump

# Copy to new server
scp -r ./joedump user@newserver:/tmp/joedump

# On the new server — restore
docker exec -i new_joe_mongo mongorestore --db JOEdb /tmp/joedump/JOEdb
```

### Uploaded files

Files uploaded by users live in volume `joe_uploads` at `/app/backend/uploads`:

```bash
# Copy uploads out of the volume via the container
docker run --rm -v joe_uploads:/data -v $(pwd):/backup alpine \
  tar czf /backup/joe_uploads_backup.tar.gz -C /data .

# Copy to new server and restore there
scp joe_uploads_backup.tar.gz user@newserver:/var/www/joe/
```

### nginx config

`joe.nginx.conf` is portable. Copy it to the new server's nginx config directory
and adjust the `proxy_pass` hostname if the container name changes.

### Environment variables

`.env.joe` is on the server only (never in git). Copy it manually:

```bash
scp /var/www/joe/.env.joe user@newserver:/var/www/joe/.env.joe
```

Update `ALLOWED_ORIGIN` to the new domain **before** switching DNS.
