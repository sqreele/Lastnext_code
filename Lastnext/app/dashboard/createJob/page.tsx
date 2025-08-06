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
      
      <Suspense fallback={
        <div className="flex items-center justify-center p-4 text-sm sm:text-base text-gray-500">
          Loading form...
        </div>
      }>
        <CreateJobForm />
      </Suspense>
    </div>
  );
}
