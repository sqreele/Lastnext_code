// /app/dashboard/createJob/page.tsx
'use client';

import { Suspense } from 'react';
import CreateJobForm from '@/app/components/jobs/CreateJobForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/app/lib/user-context'; // If you have this

export default function CreateJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userProfile } = useUser(); // If available

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // If you have a default property or active property in your user context
  const activePropertyId = userProfile?.activePropertyId || userProfile?.properties?.[0]?.id;

  return (
    <div className="space-y-4 p-4 sm:p-8 w-full max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Create New Maintenance Job
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        Fill out the form below to add a new job.
      </p>
      
      {activePropertyId ? (
        <Suspense fallback={
          <div className="flex items-center justify-center p-4 text-sm sm:text-base text-gray-500">
            Loading form...
          </div>
        }>
          <CreateJobForm propertyId={activePropertyId} />
        </Suspense>
      ) : (
        <div className="space-y-4">
          <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Property Selection Required
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Please select a property first to create a maintenance job. You can select a property from your dashboard or user menu.
                </p>
              </div>
            </div>
          </div>
          
          {/* Fallback form for property selection */}
          <div className="p-6 border rounded-lg bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Or create a job without pre-selecting a property:
            </h3>
            <Suspense fallback={
              <div className="flex items-center justify-center p-4 text-sm sm:text-base text-gray-500">
                Loading form...
              </div>
            }>
              <CreateJobForm />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
