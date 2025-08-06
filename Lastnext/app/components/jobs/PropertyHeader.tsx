import React from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Building2, MapPin } from 'lucide-react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';

interface PropertyHeaderProps {
  propertyId?: string;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ propertyId }) => {
  const { userProperties } = usePropertyStore();
  
  const currentProperty = userProperties.find(p => p.property_id === propertyId);
  
  if (!currentProperty) {
    return null;
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">{currentProperty.name}</h3>
              {currentProperty.description && (
                <p className="text-sm text-blue-700">{currentProperty.description}</p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <MapPin className="w-3 h-3 mr-1" />
            Active Property
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyHeader;