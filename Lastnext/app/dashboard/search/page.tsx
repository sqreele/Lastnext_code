// app/dashboard/search/page.tsx
"use client";

import { Suspense, useState } from 'react';
import SearchContent, { FilterState } from './SearchContent';

// Wrapper component to manage filter state
function SearchPageContent() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    dateRange: undefined,
    is_preventivemaintenance: null
  });

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

  return (
    <SearchContent
      filters={filters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-gray-500">Loading search results...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
