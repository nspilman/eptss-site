#!/usr/bin/env bash
set -euo pipefail

# Ensure we run from project root
dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$dir"

# 1) Start Colima if not already running
if ! colima status | grep -q "Running"; then
  echo "✨ Starting Colima..."
  colima start
else
  echo "✔️ Colima already running"
fi

# 2) Start Supabase local dev stack
echo "✨ Starting Supabase local dev stack..."
supabase start

# 3) Capture Supabase status output
echo "✨ Retrieving Supabase connection info..."
status=$(supabase status)

# 4) Run Drizzle migrations
echo "✨ Running Drizzle migrations..."
bunx drizzle-kit migrate

# 5) Export for Cypress
export CYPRESS_SUPABASE_URL=$(echo "$status" | grep "API URL:" | awk '{print $3}')
export CYPRESS_SUPABASE_GRAPHQL_URL=$(echo "$status" | grep "GraphQL URL:" | awk '{print $3}')
export CYPRESS_DATABASE_URL=$(echo "$status" | grep "DB URL:" | awk '{print $3}')
export CYPRESS_SUPABASE_STUDIO_URL=$(echo "$status" | grep "Studio URL:" | awk '{print $3}')
export CYPRESS_SUPABASE_INBUCKET_URL=$(echo "$status" | grep "Inbucket URL:" | awk '{print $3}')
export CYPRESS_SUPABASE_JWT_SECRET=$(echo "$status" | grep "JWT secret:" | awk '{print $3}')
export CYPRESS_SUPABASE_ANON_KEY=$(echo "$status" | grep "anon key:" | awk '{print $3}')
export CYPRESS_SUPABASE_SERVICE_ROLE_KEY=$(echo "$status" | grep "service_role key:" | awk '{print $3}')

# Export for Next.js
export DATABASE_URL="$CYPRESS_DATABASE_URL"
export NEXT_PUBLIC_SUPABASE_URL="$CYPRESS_SUPABASE_URL"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="$CYPRESS_SUPABASE_ANON_KEY"
export NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY="$CYPRESS_SUPABASE_SERVICE_ROLE_KEY"

# 6) Display summary
echo "✅ Cypress environment variables set:"
echo "  CYPRESS_SUPABASE_URL=$CYPRESS_SUPABASE_URL"
echo "  CYPRESS_DATABASE_URL=$CYPRESS_DATABASE_URL"
echo "  CYPRESS_SUPABASE_ANON_KEY=$CYPRESS_SUPABASE_ANON_KEY"

# 7) Start Next.js dev server
echo "🚀 Starting Next.js dev server..."
bun run dev &

# 8) Launch Cypress
echo "🚀 Launching Cypress..."
bun cypress open --config-file cypress.config.local.ts
