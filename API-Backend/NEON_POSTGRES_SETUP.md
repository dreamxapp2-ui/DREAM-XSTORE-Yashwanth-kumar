# Neon PostgreSQL Migration Start

This backend now includes a Prisma schema and Neon-compatible PostgreSQL bootstrap alongside the existing MongoDB connection. The current routes still use Mongoose models, but the Postgres layer is ready for incremental migration.

The implementation uses Prisma 7 with the Neon serverless adapter.

## Install

From `API-Backend`:

```bash
npm install
npm run prisma:generate
```

## Environment

Add a Neon connection string to `.env`:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
MONGODB_URI="mongodb://..."
```

`MONGODB_URI` is still needed until the feature routes are migrated off MongoDB.

## Prisma Commands

```bash
npm run prisma:validate
npm run prisma:generate
npm run db:push
npm run prisma:migrate -- --name init_neon
npm run prisma:studio
```

## Current Scope

The Prisma schema covers the main business entities:

- users
- user addresses
- brands
- products
- orders and order items
- payments
- shipments and shipment events
- reviews
- designs and design ratings
- conversations and messages
- hire requests
- banners

## Recommended Next Steps

1. Provision the Neon database and set `DATABASE_URL`.
2. Run `npm run prisma:generate`.
3. Run `npm run db:push` for the first shared development environment, or create versioned migrations with `npm run prisma:migrate -- --name init_neon`.
4. Migrate one feature slice at a time, starting with read-heavy modules such as catalog or banners before moving auth and orders.