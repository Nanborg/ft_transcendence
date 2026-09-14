const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// REQUIRED: Prisma v7 uses the pg adapter.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
// WHY: Shared Prisma client avoids reconnecting per route.
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
