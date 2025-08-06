"use client";

import React, { useState, useEffect } from 'react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { Job, JobStatus, JobPriority } from '@/app/lib/types';
import { fetchJobsForProperty } from '@/app/lib/data';
import { JobCard } from './JobCard';
import JobFilters, { FilterState } from './JobFilters';
import Pagination from './Pagination';
import { Loader2 } from 'lucide-react';

interface JobListProps {
  initialJobs?: Job[];
  showFilters?: boolean;
  showPagination?: boolean;
  maxJobs?: number;
  hidePropertyInfo?: boolean;
}

const JobList: React.FC<JobListProps> = ({
  initialJobs = [],
  showFilters = true,
  showPagination = true,
  maxJobs = 50,
  hidePropertyInfo = false
}) => {
  const { selectedProperty } = usePropertyStore();
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(initialJobs);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    dateRange: undefined,
    is_preventivemaintenance: null
  });

  // Fetch jobs when property changes (only if not hiding property info)
  useEffect(() => {
    const loadJobs = async () => {
      if (!selectedProperty && !hidePropertyInfo) {
        setJobs([]);
        setFilteredJobs([]);
        return;
      }

      // If hiding property info, use initial jobs
      if (hidePropertyInfo) {
        setJobs(initialJobs);
        setFilteredJobs(initialJobs);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetchedJobs = await fetchJobsForProperty(selectedProperty);
        setJobs(fetchedJobs);
        setFilteredJobs(fetchedJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs');
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [selectedProperty, hidePropertyInfo, initialJobs]);

  // Apply filters
  useEffect(() => {
    let filtered = [...jobs];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(job => job.priority === filters.priority);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.description?.toLowerCase().includes(searchLower) ||
        job.job_id?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by date range
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.created_at);
        const fromDate = filters.dateRange?.from;
        const toDate = filters.dateRange?.to;
        
        if (fromDate && toDate) {
          return jobDate >= fromDate && jobDate <= toDate;
        } else if (fromDate) {
          return jobDate >= fromDate;
        } else if (toDate) {
          return jobDate <= toDate;
        }
        return true;
      });
    }

    // Filter by preventive maintenance
    if (filters.is_preventivemaintenance !== null) {
      filtered = filtered.filter(job => job.is_preventivemaintenance === filters.is_preventivemaintenance);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [jobs, filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      dateRange: undefined,
      is_preventivemaintenance: null
    });
  };

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading jobs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!selectedProperty && !hidePropertyInfo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please select a property to view jobs.</p>
      </div>
    );
  }

  if (filteredJobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">
          {hidePropertyInfo ? "No jobs found." : "No jobs found for this property."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showFilters && (
        <JobFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentJobs.slice(0, maxJobs).map((job) => (
          <JobCard key={job.job_id} job={job} hidePropertyInfo={hidePropertyInfo} />
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default JobList;
