// /app/dashboard/createJob/page.tsx
'use client';

import { Suspense } from 'react';
import CreateJobForm from '@/app/components/jobs/CreateJobForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';

export default function CreateJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userProperties, hasProperties } = usePropertyStore();

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

  return (
    <div className="space-y-4 p-4 sm:p-8 w-full max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Create New Maintenance Job
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        Fill out the form below to add a new job.
      </p>
      
      {hasProperties ? (
        <Suspense fallback={
          <div className="flex items-center justify-center p-4 text-sm sm:text-base text-gray-500">
            Loading form...
          </div>
        }>
          <CreateJobForm />
        </Suspense>
      ) : (
        <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800">
            Please select a property first to create a maintenance job.
          </p>
          <p className="text-sm text-yellow-700 mt-2">
            You need to have access to at least one property to create maintenance jobs.
          </p>
        </div>
      )}
    </div>
  );
}
