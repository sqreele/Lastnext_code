"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X, Calendar, CalendarIcon, Check, Wrench } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Badge } from "@/app/components/ui/badge";
import { JobStatus, JobPriority } from "@/app/lib/types";
import { cn } from "@/app/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/app/components/ui/calendar";
import { usePropertyStore } from "@/app/lib/stores/propertyStore";

export interface FilterState {
  search: string;
  status: JobStatus | "all";
  priority: JobPriority | "all";
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  is_preventivemaintenance?: boolean | null;
}

interface SearchContentProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export default function SearchContent({
  filters,
  onFilterChange,
  onClearFilters,
}: SearchContentProps) {
  const { selectedProperty } = usePropertyStore();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search ||
      filters.status !== "all" ||
      filters.priority !== "all" ||
      filters.dateRange?.from ||
      filters.dateRange?.to ||
      filters.is_preventivemaintenance !== null
    );
  }, [filters]);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "waiting_sparepart", label: "Waiting Sparepart" },
  ];

  const priorityOptions = [
    { value: "all", label: "All Priority" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Priority</label>
          <Select
            value={filters.priority}
            onValueChange={(value) => handleFilterChange("priority", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date Range</label>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange?.from && !filters.dateRange?.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                selected={filters.dateRange}
                onSelect={(range) => {
                  handleFilterChange("dateRange", range);
                  setIsDatePickerOpen(false);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="preventive_maintenance"
            checked={filters.is_preventivemaintenance === true}
            onChange={(e) =>
              handleFilterChange(
                "is_preventivemaintenance",
                e.target.checked ? true : null
              )
            }
            className="rounded border-gray-300"
          />
          <label
            htmlFor="preventive_maintenance"
            className="text-sm font-medium text-gray-700 flex items-center gap-1"
          >
            <Wrench className="w-4 h-4" />
            Preventive Maintenance Only
          </label>
        </div>

        {selectedProperty && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Property: {selectedProperty}
          </Badge>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {filters.search && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
              Search: {filters.search}
              <button
                onClick={() => handleFilterChange("search", "")}
                className="ml-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange("status", "all")}
                className="ml-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.priority !== "all" && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Priority: {filters.priority}
              <button
                onClick={() => handleFilterChange("priority", "all")}
                className="ml-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.dateRange?.from && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Date: {format(filters.dateRange.from, "MMM dd")}
              {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM dd")}`}
              <button
                onClick={() => handleFilterChange("dateRange", undefined)}
                className="ml-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.is_preventivemaintenance === true && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <Wrench className="w-3 h-3 mr-1" />
              Preventive Maintenance
              <button
                onClick={() => handleFilterChange("is_preventivemaintenance", null)}
                className="ml-1 hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}