// /app/dashboard/createJob/page.tsx
'use client';

import { Suspense } from 'react';
import CreateJobForm from '@/app/components/jobs/CreateJobForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/app/lib/user-context';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';

import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Building2 } from 'lucide-react';
import PropertySwitcher from '@/app/components/jobs/PropertySwitcher';
import Breadcrumb from '@/app/components/ui/breadcrumb';
import InfoCard from '@/app/components/ui/info-card';

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

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperty(propertyId);
  };

  return (
    <div className="space-y-4 p-4 sm:p-8 w-full max-w-4xl mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumb 
        items={[
          { label: "Jobs", href: "/dashboard/jobs" },
          { label: "Create Job" }
        ]} 
        className="mb-4"
      />
      
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Create New Maintenance Job
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Fill out the form below to add a new job.
        </p>
      </div>
      
      {userProperties.length === 0 ? (
        <InfoCard 
          type="warning" 
          title="No Properties Available"
          className="mb-4"
        >
          <div className="space-y-4">
            <p>
              You need to have access to at least one property to create maintenance jobs.
            </p>
            <p className="text-sm">
              Please contact your administrator to get access to properties, or check if you have the correct permissions.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              Back to Dashboard
            </Button>
          </div>
        </InfoCard>
      ) : !selectedProperty ? (
        <InfoCard 
          type="info" 
          title="Select a Property"
          className="mb-4"
        >
          <div className="space-y-4">
            <p>
              Please select a property first to create a maintenance job.
            </p>
            <div className="space-y-2">
              <Label htmlFor="property-select" className="text-blue-800 font-medium">
                Choose Property *
              </Label>
              <Select onValueChange={handlePropertySelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a property to continue..." />
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
            
            <div className="p-3 bg-blue-100 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Once you select a property, you'll be able to create maintenance jobs for that specific location.
              </p>
            </div>
          </div>
        </InfoCard>
      ) : (
        <div className="space-y-4">
          {/* Property Selection Header */}
          <InfoCard 
            type="success" 
            title="Ready to Create Maintenance Jobs"
            className="mb-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">
                  Select a property below or use the current selection
                </p>
              </div>
              <PropertySwitcher showLabel={false} />
            </div>
          </InfoCard>

          {/* Helpful Information */}
          <InfoCard 
            type="tip" 
            title="Creating a Maintenance Job"
            className="mb-4"
          >
            <div className="space-y-2">
              <p>
                Use the tabs below to organize your job information:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Basic Info:</strong> Property, description, priority, room, and topic</li>
                <li><strong>Details:</strong> Status, estimated hours, assignee, and remarks</li>
                <li><strong>Media:</strong> Upload images and documents</li>
                <li><strong>Advanced:</strong> Special options like marking as defect</li>
              </ul>
            </div>
          </InfoCard>

          {/* Job Creation Form */}
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-sm text-gray-500">Loading job creation form...</p>
              </div>
            </div>
          }>
            <CreateJobForm propertyId={selectedProperty} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
