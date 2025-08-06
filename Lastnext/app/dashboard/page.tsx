// app/dashboard/page.tsx (if using client component)
import { Suspense } from 'react';
import { fetchJobsForProperty, fetchProperties } from '@/app/lib/data.server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.accessToken) {
    redirect('/auth/signin');
  }
  
  try {
    const properties = await fetchProperties(session.user.accessToken);
    
    if (!properties?.length) {
      return <NoPropertiesMessage />;
    }
    
    const firstPropertyId = properties[0]?.property_id;
    const jobs = firstPropertyId 
      ? await fetchJobsForProperty(firstPropertyId, session.user.accessToken) 
      : [];
    
    return (
      <div className="space-y-8 p-4 sm:p-8 w-full">
        <Suspense fallback={<LoadingState />}>
          <DashboardClient 
            initialJobs={jobs}
            initialProperties={properties}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    return <ErrorState error={error} />;
  }
}

function NoPropertiesMessage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">No Properties Available</h2>
        <p className="text-gray-600 mb-6">Please contact your administrator to assign properties.</p>
        <a href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Refresh
        </a>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
      <span className="text-gray-600">Loading dashboard...</span>
    </div>
  );
}

function ErrorState({ error }: { error: any }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Dashboard Error</h2>
        <p className="text-gray-600 mb-6">There was a problem loading your dashboard.</p>
        <a href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Try Again
        </a>
      </div>
    </div>
  );
}
