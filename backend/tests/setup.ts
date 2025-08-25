import { PrismaClient } from '@prisma/client';

export const testPrisma = new PrismaClient({
  datasourceUrl: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
});

beforeAll(async () => {
  await testPrisma.$connect();
});

afterAll(async () => {
  await testPrisma.$disconnect();
});

beforeEach(async () => {
  // Clean up database before each test
  const tableNames = await testPrisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
  
  for (const { tablename } of tableNames) {
    if (tablename !== '_prisma_migrations') {
      await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
    }
  }
});
