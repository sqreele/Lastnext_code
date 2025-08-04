'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Building2, Plus, ArrowLeft, Settings, Users } from 'lucide-react';

export default function PropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userProperties, selectedProperty, setSelectedProperty } = usePropertyStore();

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

  return (
    <div className="space-y-4 p-4 sm:p-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Properties Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your properties and their settings.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      {userProperties.length === 0 ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Building2 className="w-5 h-5" />
              No Properties Found
            </CardTitle>
            <CardDescription className="text-yellow-700">
              You don't have any properties assigned to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-yellow-700">
                Please contact your administrator to add properties to your account.
              </p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProperties.map((property) => (
            <Card 
              key={property.property_id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedProperty === property.property_id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : ''
              }`}
              onClick={() => setSelectedProperty(property.property_id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="w-5 h-5" />
                    {property.name}
                  </CardTitle>
                  {selectedProperty === property.property_id && (
                    <Badge variant="default" className="bg-blue-600">
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {property.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Property ID:</span>
                    <span className="font-mono text-gray-800">{property.property_id}</span>
                  </div>
                  
                  {property.created_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-gray-800">
                        {new Date(property.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProperty(property.property_id);
                        router.push('/dashboard/createJob');
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Job
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to property settings or jobs list
                        router.push(`/dashboard/jobs?property=${property.property_id}`);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common actions for property management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => router.push('/dashboard/createJob')}
              disabled={!selectedProperty}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Job
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard/jobs')}
              className="flex items-center gap-2"
            >
              View All Jobs
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard/rooms')}
              className="flex items-center gap-2"
            >
              Manage Rooms
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}