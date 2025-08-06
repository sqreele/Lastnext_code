// /app/dashboard/jobsNoProperty/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import JobsDashboardNoProperty from '@/app/components/jobs/JobsDashboardNoProperty';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { getJobs } from '@/app/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Jobs Dashboard (No Property) - Maintenance & Job Management',
  description: 'View and manage maintenance jobs that are not associated with any property. Filter by status, priority, and more.',
  keywords: ['jobs dashboard', 'maintenance jobs', 'no property', 'job management', 'dashboard'],
  openGraph: {
    title: 'Jobs Dashboard (No Property) - Maintenance & Job Management',
    description: 'Comprehensive view of maintenance jobs without property association.',
    url: 'https://pmcs.site/dashboard/jobsNoProperty',
    type: 'website',
    images: [
      {
        url: 'https://pmcs.site/og-jobs-no-property.jpg',
        width: 1200,
        height: 630,
        alt: 'Jobs No Property Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs Dashboard (No Property) - Maintenance & Job Management',
    description: 'Manage maintenance jobs without property association.',
    images: ['https://pmcs.site/twitter-jobs-no-property.jpg'],
  },
};

export default async function JobsNoPropertyPage() {
  // Server-side session check
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Fetch jobs data
  let jobs = [];
  try {
    const jobsData = await getJobs();
    jobs = jobsData || [];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    jobs = [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs dashboard...</p>
          </div>
        </div>
      }>
        <JobsDashboardNoProperty jobs={jobs} />
      </Suspense>
    </div>
  );
}