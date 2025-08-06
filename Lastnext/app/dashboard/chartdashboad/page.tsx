// ./app/dashboard/chartdashboard/page.tsx
import { Suspense } from 'react';
import PropertyJobsDashboard from '@/app/components/jobs/PropertyJobsDashboard';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

export default async function ChartdashboardPage() {
  // Fetch session on the server
  const session = await getServerSession(authOptions);
  
  // Check if session exists and has a valid token
  if (!session || !session.user || !session.user.accessToken) {
    // Redirect to login if no valid session
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Please log in to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <PropertyJobsDashboard />
      </Suspense>
    </div>
  );
}