'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import PropertySelector from '@/app/components/ui/PropertySelector';
import PropertyHeader from '@/app/components/ui/PropertyHeader';
import PropertySwitcher from '@/app/components/ui/PropertySwitcher';
import CreateJobForm from '@/app/components/jobs/CreateJobForm';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Building2, 
  Wrench, 
  Settings, 
  Users, 
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

export default function CreateJobExamplePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { selectedProperty, userProperties, setSelectedProperty } = usePropertyStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const currentProperty = userProperties.find(p => p.property_id === selectedProperty);

  return (
    <div className="space-y-6 p-4 sm:p-8 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Maintenance Job Management
        </h1>
        <p className="text-lg text-muted-foreground">
          Create and manage maintenance jobs for your properties
        </p>
      </div>

      {/* Property Selection Components Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Switcher */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Property Switcher
            </CardTitle>
            <CardDescription>
              Compact property switcher for navigation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Default</h4>
              <PropertySwitcher variant="default" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Compact</h4>
              <PropertySwitcher variant="compact" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Minimal</h4>
              <PropertySwitcher variant="minimal" />
            </div>
          </CardContent>
        </Card>

        {/* Property Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Property Header
            </CardTitle>
            <CardDescription>
              Display current property with dropdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PropertyHeader />
          </CardContent>
        </Card>

        {/* Property Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Property Selector
            </CardTitle>
            <CardDescription>
              Form-based property selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PropertySelector
              value={selectedProperty || ''}
              onValueChange={setSelectedProperty}
              placeholder="Choose a property"
            />
          </CardContent>
        </Card>
      </div>

      {/* Current Property Status */}
      {currentProperty && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Active Property
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-green-900">{currentProperty.name}</h3>
                <p className="text-sm text-green-700">
                  Property ID: {currentProperty.property_id}
                </p>
                {currentProperty.description && (
                  <p className="text-sm text-green-600">{currentProperty.description}</p>
                )}
              </div>
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Property Warning */}
      {!selectedProperty && userProperties.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              Property Selection Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Please select a property above to create maintenance jobs.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Properties Available */}
      {userProperties.length === 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              No Properties Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              You don't have any properties assigned to your account. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Job Section */}
      {selectedProperty && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Create New Maintenance Job
            </CardTitle>
            <CardDescription>
              Fill out the form below to add a new maintenance job for {currentProperty?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showForm ? (
              <div className="text-center space-y-4">
                <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Create a Job?
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Click the button below to open the maintenance job creation form.
                  </p>
                  <Button onClick={() => setShowForm(true)} className="gap-2">
                    <FileText className="w-4 h-4" />
                    Open Job Form
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Maintenance Job Form</h3>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                    size="sm"
                  >
                    Close Form
                  </Button>
                </div>
                <CreateJobForm 
                  propertyId={selectedProperty}
                  onSuccess={(job) => {
                    console.log('Job created:', job);
                    setShowForm(false);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Property Information */}
      {userProperties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Available Properties ({userProperties.length})
            </CardTitle>
            <CardDescription>
              Properties you have access to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProperties.map((property) => (
                <div
                  key={property.property_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProperty === property.property_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProperty(property.property_id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium">{property.name}</h4>
                    {selectedProperty === property.property_id && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    ID: {property.property_id}
                  </p>
                  {property.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {property.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}