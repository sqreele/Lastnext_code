"use client";

import React from 'react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Building2 } from 'lucide-react';

interface PropertySwitcherProps {
  className?: string;
  showLabel?: boolean;
}

const PropertySwitcher: React.FC<PropertySwitcherProps> = ({ 
  className = "", 
  showLabel = true 
}) => {
  const { selectedProperty, userProperties, setSelectedProperty } = usePropertyStore();

  if (userProperties.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">Property:</span>
      )}
      <Select 
        value={selectedProperty || ''} 
        onValueChange={setSelectedProperty}
      >
        <SelectTrigger className="w-auto min-w-[200px]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <SelectValue placeholder="Select property" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {userProperties.map((property) => (
            <SelectItem key={property.property_id} value={property.property_id}>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {property.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PropertySwitcher;