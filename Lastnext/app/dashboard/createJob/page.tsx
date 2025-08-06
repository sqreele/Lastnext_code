// /app/dashboard/createJob/page.tsx
'use client';

import { Suspense } from 'react';
import CreateJobForm from '@/app/components/jobs/CreateJobForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Building2, AlertCircle } from 'lucide-react';

export default function CreateJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { selectedProperty, userProperties, setSelectedProperty, hasProperties } = usePropertyStore();

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

  // If user has no properties at all
  if (!hasProperties) {
    return (
      <div className="space-y-4 p-4 sm:p-8 w-full max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Create New Maintenance Job
        </h1>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium">No Properties Available</p>
                <p className="text-yellow-700 text-sm mt-1">
                  You need to have access to at least one property to create maintenance jobs. 
                  Please contact your administrator to assign you to a property.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has properties but none selected
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
              Select Property
            </CardTitle>
            <CardDescription>
              Please select a property first to create a maintenance job.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property-select">Available Properties</Label>
                <Select onValueChange={(value) => setSelectedProperty(value)}>
                  <SelectTrigger id="property-select">
                    <SelectValue placeholder="Choose a property..." />
                  </SelectTrigger>
                  <SelectContent>
                    {userProperties.map((property) => (
                      <SelectItem key={property.property_id} value={property.property_id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {property.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Tip:</strong> Once you select a property, you'll be able to access the complete job creation form 
                  with property-specific rooms and topics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Property is selected, show the form
  return (
    <div className="space-y-4 p-4 sm:p-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Create New Maintenance Job
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Fill out the form below to add a new job.
          </p>
        </div>
        
        {/* Property switcher */}
        <div className="flex items-center gap-2">
          <Label htmlFor="current-property" className="text-sm font-medium">Property:</Label>
          <Select value={selectedProperty} onValueChange={(value) => setSelectedProperty(value)}>
            <SelectTrigger id="current-property" className="w-[200px]">
              <SelectValue />
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
      </div>
      
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
