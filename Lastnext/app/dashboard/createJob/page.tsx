// /app/dashboard/createJob/page.tsx
'use client';

import { Suspense } from 'react';
import MaintenanceJobForm from '@/app/components/jobs/MaintenanceJobForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/app/lib/user-context';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { AlertTriangle, Building, Wrench } from 'lucide-react';

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

  // Get the effective property ID from multiple sources
  const effectivePropertyId = selectedProperty || 
                             userProfile?.activePropertyId || 
                             userProfile?.properties?.[0]?.id ||
                             userProperties?.[0]?.property_id;

  return (
    <div className="space-y-6 p-4 sm:p-8 w-full max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
          <Wrench className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Create New Maintenance Job
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Fill out the form below to add a new maintenance job.
          </p>
        </div>
      </div>

      {/* Property Selection Card - Only show if no property is selected */}
      {!effectivePropertyId && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Building className="w-5 h-5" />
              Property Selection Required
            </CardTitle>
            <CardDescription className="text-amber-700">
              Please select a property first to create a maintenance job.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property-selector">Select Property</Label>
                <Select 
                  value={selectedProperty || ''} 
                  onValueChange={(value) => setSelectedProperty(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a property to get started" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProperties.length > 0 ? (
                      userProperties.map((property) => (
                        <SelectItem key={property.property_id} value={property.property_id}>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {property.name}
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-properties" disabled>
                        No properties available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {userProperties.length === 0 && (
                <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">No Properties Found</p>
                      <p className="text-yellow-700 mt-1">
                        You don't have access to any properties. Please contact your administrator to get property access before creating maintenance jobs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Summary - Show current selected property */}
      {effectivePropertyId && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Selected Property</p>
                  <p className="text-sm text-green-700">
                    {userProperties.find(p => p.property_id === effectivePropertyId)?.name || 'Unknown Property'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProperty('')}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                Change Property
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Maintenance Job Form */}
      {effectivePropertyId ? (
        <Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500">Loading maintenance job form...</p>
            </div>
          </div>
        }>
          <MaintenanceJobForm propertyId={effectivePropertyId} />
        </Suspense>
      ) : (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Property Selection Required</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Select a property from the dropdown above to start creating your maintenance job. 
            All maintenance jobs must be associated with a specific property.
          </p>
        </div>
      )}
    </div>
  );
}
