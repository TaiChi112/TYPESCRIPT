#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."
sleep 5

echo "📦 Pushing Prisma schema..."
bunx prisma db push --accept-data-loss --skip-generate || {
  echo "⚠️  Prisma push failed, retrying in 5 seconds..."
  sleep 5
  bunx prisma db push --accept-data-loss --skip-generate
}

echo "✅ Database initialization complete!"
echo "🚀 Starting API server..."

exec bun run --watch src/index.ts
