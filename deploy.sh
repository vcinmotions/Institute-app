#!/usr/bin/env bash
# =====================================================================
#  Deploy the live portal (https://iapp.vcglobalskills.in): API + website.
#
#  Run on the server, from anywhere:
#      bash ~/iapp/deploy.sh                  full deploy (pull, API, DB update, website)
#      bash ~/iapp/deploy.sh --server-only    API (+ DB update) only
#      bash ~/iapp/deploy.sh --frontend-only  website only
#      bash ~/iapp/deploy.sh --skip-migrate   do not update database tables
#      bash ~/iapp/deploy.sh --skip-pull      deploy the code already on disk
#
#  Safe by design:
#   - Stops at the first error. If the website build fails, the running site is not touched.
#   - The website is built into a second folder (.next-a / .next-b) while the old one keeps
#     serving, then pm2 switches over. If the new one does not answer, it switches back.
#   - The database update only ADDS tables/columns; anything that could lose data is refused.
#
#  Needs (one-time): server/.env.portal filled in. frontend/.env.production is created from
#  frontend/.env.portal.example if missing.
# =====================================================================
set -Eeuo pipefail

# ---- settings ----
API_NAME="iapp-api"
WEB_NAME="iapp-web"
API_PORT=5001
WEB_PORT=3100
BUILD_MEMORY_MB=2048

# ---- options ----
DO_PULL=1; DO_SERVER=1; DO_FRONTEND=1; DO_MIGRATE=1
for arg in "$@"; do
  case "$arg" in
    --server-only)   DO_FRONTEND=0 ;;
    --frontend-only) DO_SERVER=0; DO_MIGRATE=0 ;;
    --skip-migrate)  DO_MIGRATE=0 ;;
    --skip-pull)     DO_PULL=0 ;;
    -h|--help)       sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "Unknown option: $arg (use --help)"; exit 1 ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER="$ROOT/server"
FRONTEND="$ROOT/frontend"

step() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
ok()   { printf '\033[32m    OK: %s\033[0m\n' "$*"; }
warn() { printf '\033[33m    WARNING: %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mDEPLOY FAILED: %s\033[0m\n' "$*"; exit 1; }
trap 'die "command failed on line $LINENO: $BASH_COMMAND"' ERR

# Values left in the shell (e.g. after ". .env.portal") break installs: NODE_ENV=production
# makes npm skip the build tools. The API reads .env.portal itself, so none are needed here.
unset NODE_ENV PORT HOST HOSTNAME DATABASE_URL

wait_http() { # url, expected codes regex, seconds
  local url="$1" want="$2" secs="$3" code=""
  for _ in $(seq 1 "$secs"); do
    code="$(curl -s -o /dev/null -w '%{http_code}' "$url" || true)"
    [[ "$code" =~ ^($want)$ ]] && return 0
    sleep 1
  done
  echo "    last answer from $url: ${code:-none}"
  return 1
}

# ---- checks ----
step "Checks"
command -v pm2 >/dev/null || die "pm2 not found"
command -v node >/dev/null || die "node not found"
[[ -f "$SERVER/.env.portal" ]] || die "server/.env.portal is missing (copy server/.env.portal.example and fill it in)"
if grep -q $'\r' "$SERVER/.env.portal"; then
  sed -i 's/\r$//' "$SERVER/.env.portal"; ok "removed Windows line endings from server/.env.portal"
fi
if grep -q '^[^#]*CHANGE_ME' "$SERVER/.env.portal"; then
  echo "    Still to fill in:"; grep -n '^[^#]*CHANGE_ME' "$SERVER/.env.portal" | cut -d= -f1 | sed 's/^/      /'
  die "server/.env.portal still contains CHANGE_ME values"
fi
for k in SUBSCRIPTION_PRIVATE_KEY SUBSCRIPTION_PUBLIC_KEY JWT_SECRET ENCRYPTION_KEY BACKUP_SECRET; do
  v="$(grep -m1 "^$k=" "$SERVER/.env.portal" | cut -d= -f2- || true)"
  [[ -n "$v" ]] || die "$k is empty or missing in server/.env.portal"
done
v="$(grep -m1 '^ENCRYPTION_KEY=' "$SERVER/.env.portal" | cut -d= -f2-)"
[[ ${#v} -eq 32 ]] || die "ENCRYPTION_KEY must be exactly 32 characters (it has ${#v}). Use: openssl rand -hex 16"
unset v
grep -q '^PG_ADMIN_DATABASE=' "$SERVER/.env.portal" || warn "PG_ADMIN_DATABASE is not set in server/.env.portal (new institute sign-up needs it on cPanel)"
ok "node $(node -v), pm2 $(pm2 -v)"

# ---- 1. code ----
if (( DO_PULL )); then
  step "Getting the latest code"
  cd "$ROOT"
  # Files the deploy itself changes: the Prisma client (regenerated for Linux) and tsconfig.json
  # (Next.js adds its build folder to it). Drop those local changes so the pull is clean.
  git checkout -- server/prisma-client frontend/tsconfig.json 2>/dev/null || true
  git pull --ff-only
  ok "$(git log --oneline -1)"
fi

# ---- 2. API ----
if (( DO_SERVER )); then
  step "API: installing packages"
  cd "$SERVER"
  npm install --include=dev --no-audit --no-fund

  step "API: generating the database client"
  ./node_modules/.bin/prisma generate --schema=prisma/central/schema.prisma
  ./node_modules/.bin/prisma generate --schema=prisma/institute/schema.prisma

  if (( DO_MIGRATE )); then
    step "Database: updating tables (central + every institute)"
    APP_ENV=portal node scripts/dev-push-postgres.js --apply \
      || die "database update failed for at least one database (see FAILED lines above). The API was NOT restarted."
  fi

  step "API: (re)starting $API_NAME"
  # Always start fresh with a clean environment. pm2 otherwise keeps the variables of the shell
  # the app was FIRST started from (e.g. JWT_SECRET=CHANGE_ME), and they would win over .env.portal.
  pm2 delete "$API_NAME" >/dev/null 2>&1 || true
  env -i HOME="$HOME" USER="${USER:-}" PATH="$PATH" APP_ENV=portal \
    pm2 start "npx ts-node --transpile-only server.ts" --name "$API_NAME" --cwd "$SERVER"
  wait_http "http://127.0.0.1:$API_PORT/api/subscription/locked" "200" 60 \
    || die "API does not answer on port $API_PORT. See: pm2 logs $API_NAME --lines 80 --nostream"
  ok "API answers on port $API_PORT"
fi

# ---- 3. website ----
if (( DO_FRONTEND )); then
  cd "$FRONTEND"
  if [[ ! -f .env.production ]]; then
    cp .env.portal.example .env.production; ok "created frontend/.env.production"
  fi
  sed -i 's/\r$//' .env.production
  grep -q '^NEXT_PUBLIC_API_BASE_URL=https://' .env.production \
    || die "frontend/.env.production must set NEXT_PUBLIC_API_BASE_URL=https://.../api"

  # Build into the folder that is NOT live, so the site keeps running during the build.
  LIVE_FILE="$FRONTEND/.live-dist"
  LIVE="$(cat "$LIVE_FILE" 2>/dev/null || echo .next)"
  if [[ "$LIVE" == ".next-a" ]]; then NEW=".next-b"; else NEW=".next-a"; fi

  step "Website: installing packages"
  npm install --include=dev --no-audit --no-fund

  step "Website: building into $NEW (live site keeps running from $LIVE)"
  rm -rf "$NEW"
  NEXT_DIST_DIR="$NEW" NODE_OPTIONS="--max-old-space-size=$BUILD_MEMORY_MB" npm run build
  # Next.js traces from the repo root (it has its own package.json), so server.js usually lands
  # in <dist>/standalone/frontend/. Find it wherever it is.
  app_dir() { # dist folder -> folder holding server.js
    if   [[ -f "$FRONTEND/$1/standalone/frontend/server.js" ]]; then echo "$FRONTEND/$1/standalone/frontend"
    elif [[ -f "$FRONTEND/$1/standalone/server.js" ]];          then echo "$FRONTEND/$1/standalone"
    else return 1; fi
  }
  APP_DIR="$(app_dir "$NEW")" || die "build did not produce server.js under $NEW/standalone"

  # Standalone output needs the static files and public folder copied next to server.js.
  mkdir -p "$APP_DIR/$NEW"
  rm -rf "$APP_DIR/$NEW/static" "$APP_DIR/public"
  cp -r "$NEW/static" "$APP_DIR/$NEW/static"
  cp -r public "$APP_DIR/public"
  ok "build ready ($APP_DIR/server.js)"

  start_web() { # dist folder
    local dir; dir="$(app_dir "$1")" || return 1
    pm2 delete "$WEB_NAME" >/dev/null 2>&1 || true
    env -i HOME="$HOME" USER="${USER:-}" PATH="$PATH" NODE_ENV=production PORT="$WEB_PORT" HOSTNAME=127.0.0.1 \
      pm2 start "$dir/server.js" --name "$WEB_NAME" --cwd "$dir"
  }

  step "Website: switching $WEB_NAME to $NEW"
  start_web "$NEW"
  if wait_http "http://127.0.0.1:$WEB_PORT/signup" "200" 60; then
    echo "$NEW" > "$LIVE_FILE"
    ok "website answers on port $WEB_PORT"
    # keep the previous build for a manual rollback, remove anything older
    for d in .next-a .next-b; do
      if [[ "$d" != "$NEW" && "$d" != "$LIVE" ]]; then rm -rf "$d"; fi
    done
  else
    warn "new website did not answer - switching back to $LIVE"
    trap - ERR
    start_web "$LIVE" || warn "no previous build to switch back to"
    die "website deploy failed. See: pm2 logs $WEB_NAME --lines 80 --nostream"
  fi
fi

# ---- 4. done ----
step "Saving pm2 process list"
pm2 save >/dev/null
pm2 list

printf '\n\033[1;32mDEPLOY OK\033[0m  %s\n' "$(cd "$ROOT" && git log --oneline -1)"
