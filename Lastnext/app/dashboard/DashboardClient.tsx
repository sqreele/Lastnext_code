'use client';

import { useState, useEffect } from 'react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { useJobStore } from '@/app/lib/stores/jobStore';
import JobsContent from './JobsContent';
import { Job, Property } from '@/app/lib/types';
import { fetchJobsForProperty } from '@/app/lib/data';
import { useToast } from '@/app/components/ui/use-toast';

interface DashboardClientProps {
  initialJobs: Job[];
  initialProperties: Property[];
}

export default function DashboardClient({
  initialJobs,
  initialProperties
}: DashboardClientProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  
  const { selectedProperty, setUserProperties } = usePropertyStore();
  const { jobCreationCount } = useJobStore();
  const { toast } = useToast();

  // Initialize store with server data
  useEffect(() => {
    setUserProperties(initialProperties);
  }, [initialProperties, setUserProperties]);

  // Refresh jobs when property changes or job is created
  useEffect(() => {
    const refreshJobs = async () => {
      if (!selectedProperty) return;
      
      setLoading(true);
      try {
        const newJobs = await fetchJobsForProperty(selectedProperty);
        setJobs(newJobs);
      } catch (error) {
        console.error('Error refreshing jobs:', error);
        toast({
          title: "Error",
          description: "Failed to refresh jobs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    refreshJobs();
  }, [selectedProperty, jobCreationCount, toast]);

  return (
    <div className="space-y-6">
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-600">Refreshing jobs...</span>
        </div>
      )}
      
      {/* Jobs Content */}
      <JobsContent 
        jobs={jobs} 
        properties={initialProperties}
      />
    </div>
  );
}
