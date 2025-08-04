'use client';

import { useState, useEffect } from 'react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { useJobStore } from '@/app/lib/stores/jobStore';
import JobsContent from './JobsContent';
import DashboardOverview from './DashboardOverview';
import { Job, Property } from '@/app/lib/types';
import { fetchJobsForProperty } from '@/app/lib/data';
import { useToast } from '@/app/components/ui/use-toast';

interface DashboardClientProps {
  initialJobs: Job[];
  initialProperties: Property[];
  initialSelectedProperty: string;
}

export default function DashboardClient({
  initialJobs,
  initialProperties,
  initialSelectedProperty
}: DashboardClientProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  const [showOverview, setShowOverview] = useState(true);
  
  const { selectedProperty, setSelectedProperty, setUserProperties } = usePropertyStore();
  const { jobCreationCount } = useJobStore();
  const { toast } = useToast();

  // Initialize store with server data
  useEffect(() => {
    setUserProperties(initialProperties);
    if (!selectedProperty) {
      setSelectedProperty(initialSelectedProperty);
    }
  }, [initialProperties, initialSelectedProperty, selectedProperty, setUserProperties, setSelectedProperty]);

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
      {/* Dashboard Overview - collapsible */}
      {showOverview && (
        <DashboardOverview 
          jobs={jobs}
          properties={initialProperties}
          selectedProperty={selectedProperty}
          onClose={() => setShowOverview(false)}
        />
      )}
      
      {/* Main Jobs Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Maintenance Jobs
            </h2>
            <div className="flex items-center space-x-2">
              {!showOverview && (
                <button
                  onClick={() => setShowOverview(true)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Show Overview
                </button>
              )}
              {loading && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Refreshing...
                </div>
              )}
            </div>
          </div>
        </div>
        
        <JobsContent 
          jobs={jobs} 
          properties={initialProperties}
        />
      </div>
    </div>
  );
}
