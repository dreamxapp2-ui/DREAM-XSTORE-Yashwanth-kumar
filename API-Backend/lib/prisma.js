const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

const globalForPrisma = global;
const prismaStub = {
  $connect: async () => {},
  $disconnect: async () => {},
};

function buildPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return prismaStub;
  }

  const clientOptions = {
    adapter: null,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  };

  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  clientOptions.adapter = new PrismaNeon(pool);

  return new PrismaClient(clientOptions);
}

const prisma =
  globalForPrisma.prisma ||
  buildPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;