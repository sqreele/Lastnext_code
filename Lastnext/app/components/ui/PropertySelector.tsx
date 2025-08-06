'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { Building2 } from 'lucide-react';

interface PropertySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Select a property",
  showLabel = true,
  label = "Property",
  className = "",
  disabled = false
}) => {
  const { userProperties } = usePropertyStore();

  if (userProperties.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        {showLabel && <Label>{label}</Label>}
        <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-500">
          <Building2 className="w-4 h-4" />
          <span className="text-sm">No properties available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && <Label>{label}</Label>}
      <Select 
        value={value || ''} 
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
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

export default PropertySelector;