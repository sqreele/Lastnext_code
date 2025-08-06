// /app/dashboard/createJobNoProperty/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import CreateJobFormNoProperty from '@/app/components/jobs/CreateJobFormNoProperty';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create Job (No Property) - Maintenance & Job Management Dashboard',
  description: 'Create a new maintenance job without property association. Assign tasks, set priorities, and upload images with our intuitive form.',
  keywords: ['create job', 'maintenance task', 'job management', 'no property', 'dashboard'],
  openGraph: {
    title: 'Create Job (No Property) - Maintenance & Job Management Dashboard',
    description: 'Add new maintenance tasks without property association using our Next.js-powered form.',
    url: 'https://pmcs.site/dashboard/createJobNoProperty',
    type: 'website',
    images: [
      {
        url: 'https://pmcs.site/og-create-job-no-property.jpg',
        width: 1200,
        height: 630,
        alt: 'Create Job No Property Page Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create Job (No Property) - Maintenance & Job Management Dashboard',
    description: 'Effortlessly create maintenance jobs without property association.',
    images: ['https://pmcs.site/twitter-create-job-no-property.jpg'],
  },
};

export default async function CreateJobNoPropertyPage() {
  // Server-side session check
  const session = await getServerSession(authOptions);
  console.log('Server session:', session); // Debug log

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="space-y-4 p-4 sm:p-8 w-full max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Create New Maintenance Job (No Property)
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        Fill out the form below to add a new job without property association.
      </p>
      <Suspense fallback={<div className="flex items-center justify-center p-4 text-sm sm:text-base text-gray-500">Loading form...</div>}>
        <CreateJobFormNoProperty />
      </Suspense>
    </div>
  );
}