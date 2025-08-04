'use client';

import React from 'react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { Building2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface PropertyHeaderProps {
  className?: string;
  showPropertyCount?: boolean;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  className = "",
  showPropertyCount = true
}) => {
  const { selectedProperty, userProperties, setSelectedProperty } = usePropertyStore();

  const currentProperty = userProperties.find(p => p.property_id === selectedProperty);

  if (userProperties.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Building2 className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">No properties</span>
      </div>
    );
  }

  if (userProperties.length === 1) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Building2 className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium">{currentProperty?.name || 'Property'}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center gap-2 h-auto p-2 ${className}`}>
          <Building2 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{currentProperty?.name || 'Select Property'}</span>
          {showPropertyCount && (
            <Badge variant="secondary" className="text-xs">
              {userProperties.length}
            </Badge>
          )}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userProperties.map((property) => (
          <DropdownMenuItem
            key={property.property_id}
            onClick={() => setSelectedProperty(property.property_id)}
            className={`flex items-center gap-2 ${
              selectedProperty === property.property_id ? 'bg-blue-50' : ''
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span className="flex-1">{property.name}</span>
            {selectedProperty === property.property_id && (
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PropertyHeader;