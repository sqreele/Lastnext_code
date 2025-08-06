'use client';

import { Suspense } from 'react';
import CreateJobForm from '@/app/components/jobs/CreateJobForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/app/lib/user-context';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import Link from 'next/link';

export default function CreateJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userProfile } = useUser();
  const { selectedProperty, userProperties } = usePropertyStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // Use selected property from store, fallback to first property
  const activePropertyId = selectedProperty || userProperties?.[0]?.property_id;

  return (
    <div className="space-y-4 p-4 sm:p-8 w-full max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Create New Maintenance Job
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Fill out the form below to add a new job.
        </p>
        {activePropertyId && (
          <p className="text-xs text-gray-500">
            Creating job for: <span className="font-medium">
              {userProperties.find(p => p.property_id === activePropertyId)?.name}
            </span>
          </p>
        )}
      </div>
      
      {activePropertyId ? (
        <Suspense fallback={
          <div className="flex items-center justify-center p-4 text-sm sm:text-base text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Loading form...
          </div>
        }>
          <CreateJobForm propertyId={activePropertyId} />
        </Suspense>
      ) : (
        <div className="p-6 border rounded-lg bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">Create Job Page is Working!</h3>
              <p className="mt-1 text-sm text-blue-700">
                The navigation to this page is working correctly. The form requires a property to be selected to proceed.
              </p>
              <p className="mt-2 text-sm text-blue-700">
                Selected Property: {selectedProperty || 'None'}<br/>
                Available Properties: {userProperties?.length || 0}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Property Selection Required</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Please select a property first to create a maintenance job. You can do this from the property selector in the header.
              </p>
              {userProperties.length === 0 && (
                <p className="mt-2 text-sm text-yellow-700">
                  No properties are available. Please contact your administrator to assign properties to your account.
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-3 py-2 border border-yellow-300 shadow-sm text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
