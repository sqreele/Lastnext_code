'use client';

import React from 'react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { Building2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface PropertySwitcherProps {
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  showLabel?: boolean;
}

const PropertySwitcher: React.FC<PropertySwitcherProps> = ({
  variant = 'default',
  className = "",
  showLabel = true
}) => {
  const { selectedProperty, userProperties, setSelectedProperty } = usePropertyStore();

  const currentProperty = userProperties.find(p => p.property_id === selectedProperty);

  if (userProperties.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <Building2 className="w-4 h-4" />
        {showLabel && <span className="text-sm">No properties</span>}
      </div>
    );
  }

  if (userProperties.length === 1) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Building2 className="w-4 h-4 text-blue-600" />
        {showLabel && <span className="text-sm font-medium">{currentProperty?.name}</span>}
      </div>
    );
  }

  const getButtonContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <>
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium truncate max-w-24">
              {currentProperty?.name || 'Property'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </>
        );
      case 'minimal':
        return (
          <>
            <Building2 className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </>
        );
      default:
        return (
          <>
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">{currentProperty?.name || 'Select Property'}</span>
            <Badge variant="secondary" className="text-xs">
              {userProperties.length}
            </Badge>
            <ChevronDown className="w-3 h-3" />
          </>
        );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`flex items-center gap-2 h-auto p-2 ${className}`}
          title={currentProperty?.name || 'Select Property'}
        >
          {getButtonContent()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch Property</DropdownMenuLabel>
        <DropdownMenuSeparator />
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

export default PropertySwitcher;