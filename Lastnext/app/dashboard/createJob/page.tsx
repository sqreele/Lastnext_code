// /app/dashboard/createJob/page.tsx
'use client';

import { Suspense, useState } from 'react';
import CreateJobForm from '@/app/components/jobs/CreateJobForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/app/lib/user-context';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import PropertySelector from '@/app/components/ui/PropertySelector';
import { Building2, AlertCircle } from 'lucide-react';

export default function CreateJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userProfile, loading: userLoading } = useUser();
  const { selectedProperty, userProperties, setSelectedProperty } = usePropertyStore();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    // Set the selected property from the store
    if (selectedProperty) {
      setSelectedPropertyId(selectedProperty);
    } else if (userProperties.length > 0) {
      // Auto-select first property if none is selected
      setSelectedPropertyId(userProperties[0].property_id);
      setSelectedProperty(userProperties[0].property_id);
    }
  }, [selectedProperty, userProperties, setSelectedProperty]);

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedProperty(propertyId);
  };

  if (status === 'loading' || userLoading) {
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
    <div className="space-y-4 p-4 sm:p-8 w-full max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Create New Maintenance Job
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Fill out the form below to add a new job.
        </p>
      </div>
      
      {userProperties.length === 0 ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              No Properties Available
            </CardTitle>
            <CardDescription className="text-yellow-700">
              You don't have any properties assigned to your account. Please contact your administrator to get access to properties.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : !selectedPropertyId ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Select Property
            </CardTitle>
            <CardDescription>
              Please select a property to create a maintenance job.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PropertySelector
              value={selectedPropertyId}
              onValueChange={handlePropertyChange}
              placeholder="Select a property"
              label="Property *"
            />
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Property Selection Required</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You need to select a property before you can create a maintenance job. This helps organize and track jobs by location.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Suspense fallback={
          <div className="flex items-center justify-center p-4 text-sm sm:text-base text-gray-500">
            Loading form...
          </div>
        }>
          <CreateJobForm propertyId={selectedPropertyId} />
        </Suspense>
      )}
    </div>
  );
}
