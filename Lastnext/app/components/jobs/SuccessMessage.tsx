import React from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { CheckCircle, Eye, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuccessMessageProps {
  jobId?: string;
  jobTitle?: string;
  onViewJob?: () => void;
  onCreateAnother?: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ 
  jobId, 
  jobTitle, 
  onViewJob, 
  onCreateAnother 
}) => {
  const router = useRouter();

  const handleViewJob = () => {
    if (onViewJob) {
      onViewJob();
    } else if (jobId) {
      router.push(`/dashboard/jobs/${jobId}`);
    }
  };

  const handleCreateAnother = () => {
    if (onCreateAnother) {
      onCreateAnother();
    } else {
      router.push('/dashboard/createJob');
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              Job Created Successfully!
            </h3>
            {jobTitle && (
              <p className="text-sm text-green-700 mt-1">
                "{jobTitle}" has been created and is ready for assignment.
              </p>
            )}
          </div>

          <div className="flex gap-3 w-full max-w-xs">
            <Button 
              onClick={handleViewJob}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Job
            </Button>
            <Button 
              onClick={handleCreateAnother}
              variant="outline"
              className="flex-1 border-green-300 text-green-700 hover:bg-green-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Another
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuccessMessage;