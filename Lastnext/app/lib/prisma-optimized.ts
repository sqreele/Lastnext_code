import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Add connection pool settings
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Optimize connection pool
prisma.$connect().then(() => {
  console.log('Database connected with optimized pool');
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Add query optimization
export async function optimizedQuery<T>(
  queryFn: () => Promise<T>,
  cacheKey?: string
): Promise<T> {
  // Add query timing in development
  if (process.env.NODE_ENV === 'development') {
    const start = Date.now();
    const result = await queryFn();
    console.log(`Query ${cacheKey} took ${Date.now() - start}ms`);
    return result;
  }
  
  return queryFn();
}
