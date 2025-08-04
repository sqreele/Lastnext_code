// /app/dashboard/createJob/page.tsx
'use client';

import { Suspense } from 'react';
import CreateJobForm from '@/app/components/jobs/CreateJobForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/app/lib/user-context';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Building2, Plus, ArrowRight } from 'lucide-react';
import JobBreadcrumb from '@/app/components/jobs/JobBreadcrumb';
import LoadingState from '@/app/components/jobs/LoadingState';

export default function CreateJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userProfile } = useUser();
  const { selectedProperty, userProperties, setSelectedProperty } = usePropertyStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="space-y-4 p-4 sm:p-8 w-full max-w-2xl mx-auto">
        <JobBreadcrumb />
        <LoadingState message="Loading your account..." />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // If no properties available
  if (userProperties.length === 0) {
    return (
      <div className="space-y-4 p-4 sm:p-8 w-full max-w-2xl mx-auto">
        <JobBreadcrumb />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Create New Maintenance Job
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Fill out the form below to add a new job.
        </p>
        
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Building2 className="w-5 h-5" />
              No Properties Available
            </CardTitle>
            <CardDescription className="text-yellow-700">
              You need to have access to at least one property to create maintenance jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-yellow-700">
                Please contact your administrator to get access to properties, or create a new property if you have the necessary permissions.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  Back to Dashboard
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard/properties')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Properties
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If no property is selected, show property selection
  if (!selectedProperty) {
    return (
      <div className="space-y-4 p-4 sm:p-8 w-full max-w-2xl mx-auto">
        <JobBreadcrumb />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Create New Maintenance Job
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Fill out the form below to add a new job.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Select a Property
            </CardTitle>
            <CardDescription>
              Please select a property first to create a maintenance job.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property-select">Property *</Label>
                <Select 
                  value={selectedProperty || ''} 
                  onValueChange={(value) => setSelectedProperty(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a property to continue" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProperties.map((property) => (
                      <SelectItem key={property.property_id} value={property.property_id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => setSelectedProperty(userProperties[0].property_id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue to Job Form
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Property is selected, show the job creation form
  return (
    <div className="space-y-4 p-4 sm:p-8 w-full max-w-2xl mx-auto">
      <JobBreadcrumb />
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Create New Maintenance Job
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        Fill out the form below to add a new job.
      </p>
      
      <Suspense fallback={<LoadingState message="Loading job form..." />}>
        <CreateJobForm propertyId={selectedProperty} />
      </Suspense>
    </div>
  );
}
