import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a single instance with optimized settings
export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    // Optimize connection pool
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Ensure connection is established
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  
  // Pre-connect to database to avoid cold start
  prisma.$connect()
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));
}

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

// Query optimization wrapper with timing
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

// Batch query helper
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
