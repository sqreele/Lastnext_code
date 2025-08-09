import { Suspense } from 'react';
import { fetchJobsForProperty, fetchProperties } from '@/app/lib/data.server';
import JobsContent from '@/app/dashboard/JobsContent';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { Metadata } from 'next';

// Add metadata for better SEO and performance
export const metadata: Metadata = {
  title: 'Dashboard - Maintenance Management',
  description: 'View and manage your maintenance jobs'
};

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 60; // Revalidate every 60 seconds

// Cache the data fetching functions with tags for on-demand revalidation
const getCachedProperties = unstable_cache(
  async (accessToken: string) => {
    const start = Date.now();
    const result = await fetchProperties(accessToken);
    console.log(`Properties fetch took ${Date.now() - start}ms`);
    return result;
  },
  ['properties'],
  { 
    revalidate: 60, 
    tags: ['properties', 'dashboard'] 
  }
);

const getCachedJobs = unstable_cache(
  async (propertyId: string, accessToken: string) => {
    const start = Date.now();
    const result = await fetchJobsForProperty(propertyId, accessToken);
    console.log(`Jobs fetch took ${Date.now() - start}ms`);
    return result;
  },
  ['jobs'],
  { 
    revalidate: 60, 
    tags: ['jobs', 'dashboard'] 
  }
);

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="space-y-6 w-full animate-pulse p-4 sm:p-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
      
      {/* Tabs skeleton */}
      <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
      
      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex justify-center mt-8">
        <div className="h-10 bg-gray-200 rounded w-64"></div>
      </div>
    </div>
  );
}

// Error component
function DashboardError({ reset }: { reset?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <h1 className="text-xl font-bold text-red-600">Error Loading Dashboard</h1>
      <p className="text-gray-600">There was a problem loading your dashboard data.</p>
      <div className="flex gap-4">
        {reset && (
          <button 
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
        <a 
          href="/dashboard" 
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Refresh Page
        </a>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const startTime = Date.now();
  
  // Get session (cached by NextAuth)
  const session = await getServerSession(authOptions);
  
  // Early return for unauthenticated users
  if (!session?.user?.accessToken) {
    redirect('/auth/signin?callbackUrl=/dashboard');
  }
  
  const accessToken = session.user.accessToken;
  
  try {
    // Determine the initial property ID to use
    const initialPropertyId = session.user.properties?.[0]?.property_id || null;
    
    // Parallel data fetching with Promise.allSettled for better error handling
    const [propertiesResult, jobsResult] = await Promise.allSettled([
      getCachedProperties(accessToken),
      initialPropertyId 
        ? getCachedJobs(initialPropertyId, accessToken)
        : Promise.resolve([])
    ]);
    
    // Handle properties result
    const properties = propertiesResult.status === 'fulfilled' 
      ? propertiesResult.value 
      : [];
      
    // Validate properties data
    if (!properties || !Array.isArray(properties)) {
      console.error('Invalid properties data or unauthorized access');
      redirect('/auth/signin?error=session_expired');
    }
    
    // Handle jobs result
    const jobs = jobsResult.status === 'fulfilled'
      ? jobsResult.value
      : [];
    
    console.log(`Dashboard total load time: ${Date.now() - startTime}ms`);
    
    return (
      <div className="space-y-8 p-4 sm:p-8 w-full">
        <Suspense fallback={<DashboardSkeleton />}>
          <JobsContent 
            jobs={jobs} 
            properties={properties} 
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    
    // Check for auth errors
    const isAuthError = 
      error instanceof Error && 
      (error.message.includes('unauthorized') || 
       error.message.includes('401') || 
       error.message.includes('token') ||
       error.message.includes('session'));
    
    if (isAuthError) {
      redirect('/auth/signin?error=session_expired&callbackUrl=/dashboard');
    }
    
    // For other errors, show error component
    return <DashboardError />;
  }
}
