import React from 'react';
import { ChevronRight, Home, Plus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';

interface JobBreadcrumbProps {
  currentStep?: string;
}

const JobBreadcrumb: React.FC<JobBreadcrumbProps> = ({ currentStep = 'Create Job' }) => {
  const router = useRouter();

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/dashboard')}
        className="h-auto p-0 text-muted-foreground hover:text-foreground"
      >
        <Home className="w-4 h-4 mr-1" />
        Dashboard
      </Button>
      <ChevronRight className="w-4 h-4" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/dashboard/jobs')}
        className="h-auto p-0 text-muted-foreground hover:text-foreground"
      >
        Jobs
      </Button>
      <ChevronRight className="w-4 h-4" />
      <div className="flex items-center text-foreground font-medium">
        <Plus className="w-4 h-4 mr-1" />
        {currentStep}
      </div>
    </nav>
  );
};

export default JobBreadcrumb;