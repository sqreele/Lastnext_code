'use client';

import { useMemo } from 'react';
import { Job, Property } from '@/app/lib/types';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Building,
  X
} from 'lucide-react';

interface DashboardOverviewProps {
  jobs: Job[];
  properties: Property[];
  selectedProperty: string | null;
  onClose: () => void;
}

export default function DashboardOverview({ 
  jobs, 
  properties, 
  selectedProperty,
  onClose 
}: DashboardOverviewProps) {
  
  const stats = useMemo(() => {
    const total = jobs.length;
    const completed = jobs.filter(job => job.status === 'completed').length;
    const pending = jobs.filter(job => job.status === 'pending').length;
    const inProgress = jobs.filter(job => job.status === 'in_progress').length;
    const overdue = jobs.filter(job => 
      job.status === 'pending' && 
      new Date(job.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    ).length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      completionRate
    };
  }, [jobs]);

  const selectedPropertyName = useMemo(() => {
    return properties.find(p => p.property_id === selectedProperty)?.name || 'All Properties';
  }, [properties, selectedProperty]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
            <p className="text-sm text-gray-500 mt-1">
              {selectedPropertyName} • {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Jobs"
            value={stats.total}
            icon={<Building className="h-5 w-5" />}
            color="bg-blue-500"
          />
          
          <MetricCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle className="h-5 w-5" />}
            color="bg-green-500"
          />
          
          <MetricCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Clock className="h-5 w-5" />}
            color="bg-yellow-500"
          />
          
          <MetricCard
            title="Overdue"
            value={stats.overdue}
            icon={<AlertTriangle className="h-5 w-5" />}
            color="bg-red-500"
          />
        </div>

        {/* Completion Rate */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Completion Rate</span>
            <span className="text-sm text-gray-500">{stats.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/dashboard/createJob"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Job
          </a>
          <a
            href="/dashboard/Preventive_maintenance"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
          >
            Preventive Maintenance
          </a>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className={`${color} text-white p-2 rounded-md mr-3`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
