#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

step() { echo -e "\n${GREEN}▸ $1${NC}"; }
info() { echo -e "  ${CYAN}$1${NC}"; }
warn() { echo -e "  ${YELLOW}$1${NC}"; }
fail() { echo -e "  ${RED}✗ $1${NC}"; exit 1; }

# ── Cleanup: kill all child processes on exit ─────────────────
DEV_PID=""
cleanup() {
  echo ""
  echo -e "${YELLOW}▸ Shutting down dev servers...${NC}"
  if [ -n "$DEV_PID" ]; then
    kill -- -$DEV_PID 2>/dev/null || true
    wait $DEV_PID 2>/dev/null || true
  fi
  echo -e "${GREEN}▸ Dev servers stopped.${NC}"
}
trap cleanup EXIT INT TERM

# ── 1. Check prerequisites ──────────────────────────────────────
step "Checking prerequisites..."

if ! command -v docker &>/dev/null; then
  fail "Docker is required. Install it from https://docs.docker.com/get-docker/"
fi

if ! docker info &>/dev/null; then
  fail "Docker daemon is not running. Start Docker and try again."
fi

if ! command -v node &>/dev/null; then
  fail "Node.js is required. Install it from https://nodejs.org/"
fi

info "Docker ✓  Node $(node -v) ✓"

# ── 2. Install dependencies ─────────────────────────────────────
step "Installing dependencies..."
if ! npm install; then
  fail "npm install failed. Check the output above."
fi

# ── 3. Start Docker services (PostgreSQL + Redis) ───────────────
step "Starting PostgreSQL & Redis..."

# Check for port conflicts before starting
for port_info in "5434:PostgreSQL" "6379:Redis"; do
  port="${port_info%%:*}"
  service="${port_info##*:}"
  if ss -tln 2>/dev/null | grep -q ":${port} "; then
    warn "Port $port is already in use (needed by $service)"
    warn "Run: sudo ss -tlnp | grep $port   to find the process"
    warn "Then stop it and re-run this script."
    fail "Port $port conflict for $service"
  fi
done

if ! docker compose up -d --wait; then
  echo ""
  warn "docker compose up failed. Container logs:"
  docker compose logs --tail=20 2>&1 || true
  fail "Could not start Docker services. See logs above."
fi
info "PostgreSQL on :5434 ✓  Redis on :6379 ✓"

# ── 4. Run Prisma migrations ────────────────────────────────────
step "Running database migrations..."
cd apps/api

if ! npx prisma generate --no-hints; then
  fail "prisma generate failed. Check your schema.prisma file."
fi

if ! npx prisma migrate dev --skip-generate --name init 2>&1; then
  warn "prisma migrate dev failed, trying migrate deploy..."
  if ! npx prisma migrate deploy; then
    fail "Database migration failed. Check your DATABASE_URL and that PostgreSQL is running."
  fi
fi
info "Migrations applied ✓"

# ── 5. Seed the database ────────────────────────────────────────
step "Seeding database..."
if ! npx prisma db seed; then
  warn "Seeding failed (this may be OK if already seeded)"
fi
cd "$ROOT_DIR"

# ── 6. Start dev servers ────────────────────────────────────────
step "Starting dev servers..."
echo ""
echo -e "  ${GREEN}┌─────────────────────────────────────────────┐${NC}"
echo -e "  ${GREEN}│                                             │${NC}"
echo -e "  ${GREEN}│   🌐 Frontend:  http://localhost:3000       │${NC}"
echo -e "  ${GREEN}│   🔌 API:       http://localhost:3001/api   │${NC}"
echo -e "  ${GREEN}│                                             │${NC}"
echo -e "  ${GREEN}│   Login:  admin@hubspot-clone.local         │${NC}"
echo -e "  ${GREEN}│   Pass:   admin123                          │${NC}"
echo -e "  ${GREEN}│                                             │${NC}"
echo -e "  ${GREEN}└─────────────────────────────────────────────┘${NC}"
echo ""

info "Press Ctrl+C to stop all servers."
echo ""

# Start in a new process group so we can kill the whole tree
set -m
npm run dev &
DEV_PID=$!
set +m

# Wait for the dev servers; on Ctrl+C the trap handles cleanup
wait $DEV_PID 2>/dev/null || true
