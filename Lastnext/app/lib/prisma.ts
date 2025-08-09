import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
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
  queryName?: string
): Promise<T> {
  const start = Date.now();
  
  try {
    const result = await queryFn();
    
    if (process.env.NODE_ENV === 'development' && queryName) {
      console.log(`Query [${queryName}] took ${Date.now() - start}ms`);
    }
    
    return result;
  } catch (error) {
    console.error(`Query [${queryName || 'unknown'}] failed:`, error);
    throw error;
  }
}

export async function batchQueries<T extends any[]>(
  queries: Promise<any>[]
): Promise<T> {
  const start = Date.now();
  const results = await Promise.all(queries);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`Batch queries (${queries.length}) took ${Date.now() - start}ms`);
  }
  
  return results as T;
}
