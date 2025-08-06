import React from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Loader2, FileText } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading form...' }) => {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <FileText className="w-12 h-12 text-gray-400" />
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute -top-1 -right-1" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">{message}</h3>
            <p className="text-sm text-gray-500 mt-1">Please wait while we prepare the form</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;