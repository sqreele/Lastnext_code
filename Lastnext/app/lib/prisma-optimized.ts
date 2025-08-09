import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export async function optimizedQuery<T>(
  queryFn: () => Promise<T>,
  cacheKey?: string
): Promise<T> {
  if (process.env.NODE_ENV === 'development') {
    const start = Date.now();
    const result = await queryFn();
    console.log(`Query ${cacheKey} took ${Date.now() - start}ms`);
    return result;
  }
  
  return queryFn();
}
