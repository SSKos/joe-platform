#!/bin/bash
# deploy.sh — deploy JOE to Hetzner server
# Run from your Mac: ./deploy.sh
# Prerequisites: SSH key access to root@157.180.85.212

set -e  # exit on any error

SERVER="root@157.180.85.212"
APP_DIR="/var/www/joe"
NGINX_CONF_DIR="/var/www/html/nginx/conf.d"

echo "==> Pushing local changes to GitHub..."
git push origin main

echo "==> Connecting to server..."
ssh "$SERVER" bash -s << EOF
  set -e

  echo "--- Pulling latest code..."
  cd $APP_DIR
  git pull origin main

  echo "--- Copying nginx config..."
  cp $APP_DIR/joe.nginx.conf $NGINX_CONF_DIR/joe.nginx.conf

  echo "--- Testing nginx config..."
  docker exec portfolio_nginx nginx -t

  echo "--- Building and restarting JOE containers..."
  docker compose -f $APP_DIR/joe-docker-compose.prod.yml --env-file $APP_DIR/.env.joe up -d --build

  echo "--- Reloading nginx..."
  docker exec portfolio_nginx nginx -s reload

  echo "--- Health check..."
  sleep 5
  curl -sf https://joe.kk-about.me/api/health && echo "" || echo "WARNING: health check failed"

  echo "--- Done. Container status:"
  docker ps --filter "name=joe_" --format "table {{.Names}}\t{{.Status}}"
EOF

echo ""
echo "✓ Deploy complete: https://joe.kk-about.me"
