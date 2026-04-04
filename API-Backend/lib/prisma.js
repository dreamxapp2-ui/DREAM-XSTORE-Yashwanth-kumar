const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');

const globalForPrisma = global;
const prismaStub = {
  $connect: async () => {},
  $disconnect: async () => {},
};

function buildPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return prismaStub;
  }

  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

const prisma =
  globalForPrisma.prisma ||
  buildPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;