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
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // If no properties exist, show a message
  if (userProperties.length === 0) {
    return (
      <div className="space-y-4 p-4 sm:p-8 w-full max-w-2xl mx-auto">
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
              You need to have at least one property to create maintenance jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-yellow-700">
                Please contact your administrator to add properties to your account, or create a new property if you have the necessary permissions.
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
                  className="bg-yellow-600 hover:bg-yellow-700"
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
                <Label htmlFor="property-select">Property</Label>
                <Select 
                  value={selectedProperty || ''} 
                  onValueChange={(value) => setSelectedProperty(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property to continue" />
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
                  onClick={() => router.push('/dashboard/properties')}
                  variant="outline"
                >
                  Manage Properties
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If property is selected, show the job creation form
  return (
    <div className="space-y-4 p-4 sm:p-8 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Create New Maintenance Job
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Fill out the form below to add a new job.
          </p>
        </div>
        
        {/* Property indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          <Building2 className="w-4 h-4" />
          <span>
            {userProperties.find(p => p.property_id === selectedProperty)?.name || 'Unknown Property'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedProperty('')}
            className="h-6 w-6 p-0 hover:bg-gray-200"
          >
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex items-center justify-center p-4 text-sm sm:text-base text-gray-500">
          Loading form...
        </div>
      }>
        <CreateJobForm propertyId={selectedProperty} />
      </Suspense>
    </div>
  );
}
