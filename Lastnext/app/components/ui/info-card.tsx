"use client";

import React from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Info, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

interface InfoCardProps {
  type?: 'info' | 'warning' | 'success' | 'tip';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  type = 'info', 
  title, 
  children, 
  className = "" 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'tip':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-800';
      case 'success':
        return 'text-green-800';
      case 'tip':
        return 'text-blue-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <Card className={`${getStyles()} ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            {title && (
              <h4 className={`font-medium ${getTextColor()} mb-1`}>
                {title}
              </h4>
            )}
            <div className={`text-sm ${getTextColor()}`}>
              {children}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoCard;