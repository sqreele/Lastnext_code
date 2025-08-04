// app/dashboard/page.tsx
import { Suspense } from 'react';
import { fetchJobsForProperty, fetchProperties } from '@/app/lib/data.server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import DashboardSkeleton from './DashboardSkeleton';
import ErrorBoundary from '@/app/components/ErrorBoundary';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.accessToken) {
    redirect('/auth/signin');
  }
  
  const accessToken = session.user.accessToken;
  
  try {
    // Fetch initial data
    const properties = await fetchProperties(accessToken);
    
    if (!properties?.length) {
      return <NoPropertiesState />;
    }
    
    // Get user's selected property or default to first
    const userProperties = session.user.properties || [];
    const selectedPropertyId = userProperties[0]?.property_id || properties[0]?.property_id;
    
    const jobs = selectedPropertyId 
      ? await fetchJobsForProperty(selectedPropertyId, accessToken)
      : [];
    
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardClient 
              initialJobs={jobs}
              initialProperties={properties}
              initialSelectedProperty={selectedPropertyId}
            />
          </Suspense>
        </div>
      </ErrorBoundary>
    );
    
  } catch (error) {
    console.error('Dashboard error:', error);
    return <DashboardErrorState error={error} />;
  }
}

// No Properties State Component
function NoPropertiesState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m5 0v-4a1 1 0 011-1h2a1 1 0 011 1v4M7 7h10M7 11h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Available</h3>
        <p className="text-sm text-gray-500 mb-6">
          You need at least one property assigned to use the dashboard. Please contact your administrator.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// Error State Component
function DashboardErrorState({ error }: { error: any }) {
  const isAuthError = error?.message?.includes('401') || error?.message?.includes('unauthorized');
  
  if (isAuthError) {
    redirect('/auth/signin?error=session_expired');
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Error</h3>
        <p className="text-sm text-gray-500 mb-6">
          There was a problem loading your dashboard. Please try again.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
          
            href="/auth/signin"
            className="block w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Sign In Again
          </a>
        </div>
      </div>
    </div>
  );
}
