"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useToast } from '@/app/components/ui/use-toast';
import { Loader2, Upload, X, Plus, Trash2, Wrench, Calendar, DollarSign, AlertTriangle, Clock, Repeat } from 'lucide-react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { MaintenanceJob, Property, Room, Topic, MaintenanceJobImage, MaintenanceType, RecurrencePattern, JobStatus, JobPriority } from '@/app/lib/types';
import { createMaintenanceJob } from '@/app/lib/data';
import { cn } from '@/app/lib/utils';
import RoomAutocomplete from './RoomAutocomplete';
import TopicAutocomplete from './TopicAutocomplete';
import FileUpload from './FileUpload';

interface MaintenanceJobFormProps {
  onSuccess?: (job: MaintenanceJob) => void;
  onCancel?: () => void;
  initialData?: Partial<MaintenanceJob>;
  isEdit?: boolean;
  propertyId?: string;
}

const MaintenanceJobForm: React.FC<MaintenanceJobFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  isEdit = false,
  propertyId
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { selectedProperty, userProperties, setSelectedProperty } = usePropertyStore();

  // Get the actual property ID to use
  const effectivePropertyId = propertyId || selectedProperty;

  // Form state
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    maintenance_type: initialData.maintenance_type || 'corrective',
    priority: initialData.priority || 'medium',
    status: initialData.status || 'pending',
    assigned_to: initialData.assigned_to || '',
    estimated_hours: initialData.estimated_hours?.toString() || '',
    scheduled_date: initialData.scheduled_date ? new Date(initialData.scheduled_date).toISOString().slice(0, 16) : '',
    due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().slice(0, 16) : '',
    cost_estimate: initialData.cost_estimate?.toString() || '',
    parts_required: initialData.parts_required || '',
    tools_required: initialData.tools_required || '',
    safety_notes: initialData.safety_notes || '',
    remarks: initialData.remarks || '',
    is_recurring: initialData.is_recurring || false,
    recurrence_pattern: initialData.recurrence_pattern || ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Load initial data
  useEffect(() => {
    if (initialData.images) {
      const urls = initialData.images.map(img => img.image_url);
      setImageUrls(urls);
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (files: File[]) => {
    setImages(prev => [...prev, ...files]);
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUrlRemove = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleTopicSelect = (topic: { title: string; description: string }) => {
    // For now, create a mock topic object
    setSelectedTopic({
      id: Date.now(),
      title: topic.title,
      description: topic.description
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Job title is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Job description is required",
        variant: "destructive"
      });
      return false;
    }

    if (!effectivePropertyId) {
      toast({
        title: "Validation Error",
        description: "Please select a property",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare maintenance job data
      const maintenanceJobData: Partial<MaintenanceJob> = {
        ...formData,
        property_id: effectivePropertyId!,
        room_id: selectedRoom?.room_id?.toString(),
        topic_id: selectedTopic?.id?.toString(),
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        cost_estimate: formData.cost_estimate ? parseFloat(formData.cost_estimate) : null,
        scheduled_date: formData.scheduled_date || null,
        due_date: formData.due_date || null,
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern as RecurrencePattern : null
      };

      // Create the maintenance job via API
      const newMaintenanceJob = await createMaintenanceJob(maintenanceJobData);

      toast({
        title: "Success",
        description: isEdit ? "Maintenance job updated successfully" : "Maintenance job created successfully",
      });

      if (onSuccess) {
        onSuccess(newMaintenanceJob);
      } else {
        router.push(`/dashboard/maintenance-jobs/${newMaintenanceJob.job_id}`);
      }
    } catch (error) {
      console.error('Error creating maintenance job:', error);
      toast({
        title: "Error",
        description: "Failed to create maintenance job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const maintenanceTypeOptions = [
    { value: 'corrective', label: 'Corrective', icon: Wrench, color: 'bg-blue-100 text-blue-800' },
    { value: 'preventive', label: 'Preventive', icon: Calendar, color: 'bg-green-100 text-green-800' },
    { value: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'bg-red-100 text-red-800' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const recurrenceOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            {isEdit ? 'Edit Maintenance Job' : 'Create New Maintenance Job'}
          </CardTitle>
          <CardDescription>
            {isEdit ? 'Update maintenance job details and information' : 'Fill in the details to create a new maintenance job'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!effectivePropertyId && (
            <div className="mb-6 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800 font-medium">
                  Please select a property first to create a maintenance job.
                </p>
              </div>
              <div className="mt-3">
                <Label htmlFor="property-select">Select Property</Label>
                <Select 
                  value={selectedProperty || ''} 
                  onValueChange={(value) => setSelectedProperty(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProperties.map((property) => (
                      <SelectItem key={property.property_id} value={property.property_id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter maintenance job title..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maintenance_type">Maintenance Type</Label>
                    <Select value={formData.maintenance_type} onValueChange={(value) => handleInputChange('maintenance_type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="w-4 h-4" />
                              <Badge className={option.color}>{option.label}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the maintenance work to be performed..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge className={option.color}>{option.label}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge className={option.color}>{option.label}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Room</Label>
                    <RoomAutocomplete
                      selectedRoom={selectedRoom}
                      onRoomSelect={handleRoomSelect}
                      propertyId={effectivePropertyId}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Topic</Label>
                    <TopicAutocomplete
                      topics={[]}
                      selectedTopic={selectedTopic ? { title: selectedTopic.title, description: selectedTopic.description || '' } : { title: '', description: '' }}
                      onSelect={handleTopicSelect}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Scheduling Tab */}
              <TabsContent value="scheduling" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date">Scheduled Date</Label>
                    <Input
                      id="scheduled_date"
                      type="datetime-local"
                      value={formData.scheduled_date}
                      onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="datetime-local"
                      value={formData.due_date}
                      onChange={(e) => handleInputChange('due_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimated_hours">Estimated Hours</Label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="estimated_hours"
                        type="number"
                        step="0.5"
                        min="0"
                        value={formData.estimated_hours}
                        onChange={(e) => handleInputChange('estimated_hours', e.target.value)}
                        placeholder="0.0"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <Input
                      id="assigned_to"
                      value={formData.assigned_to}
                      onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                      placeholder="Enter assignee name"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_recurring"
                      checked={formData.is_recurring}
                      onChange={(e) => handleInputChange('is_recurring', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is_recurring" className="flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      Recurring Maintenance
                    </Label>
                  </div>

                  {formData.is_recurring && (
                    <div className="space-y-2">
                      <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
                      <Select value={formData.recurrence_pattern} onValueChange={(value) => handleInputChange('recurrence_pattern', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          {recurrenceOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost_estimate">Cost Estimate</Label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="cost_estimate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cost_estimate}
                        onChange={(e) => handleInputChange('cost_estimate', e.target.value)}
                        placeholder="0.00"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parts_required">Parts Required</Label>
                  <Textarea
                    id="parts_required"
                    value={formData.parts_required}
                    onChange={(e) => handleInputChange('parts_required', e.target.value)}
                    placeholder="List the parts and materials needed..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tools_required">Tools Required</Label>
                  <Textarea
                    id="tools_required"
                    value={formData.tools_required}
                    onChange={(e) => handleInputChange('tools_required', e.target.value)}
                    placeholder="List the tools and equipment needed..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="safety_notes">Safety Notes</Label>
                  <Textarea
                    id="safety_notes"
                    value={formData.safety_notes}
                    onChange={(e) => handleInputChange('safety_notes', e.target.value)}
                    placeholder="Important safety considerations and precautions..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Upload Images</Label>
                    <FileUpload
                      onFileSelect={handleImageUpload}
                      accept="image/*"
                      maxFiles={10}
                    />
                  </div>

                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {images.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleImageRemove(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Images */}
                  {imageUrls.length > 0 && (
                    <div className="space-y-2">
                      <Label>Existing Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleImageUrlRemove(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="remarks">Additional Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    placeholder="Any additional notes or remarks..."
                    rows={4}
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Maintenance Job Information</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This form creates a dedicated maintenance job with specific tracking for scheduling, resources, costs, and recurring patterns. 
                        Use the scheduling tab for time-based planning and the resources tab for cost and material tracking.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <hr className="border-gray-200" />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting || !effectivePropertyId}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEdit ? 'Update Maintenance Job' : 'Create Maintenance Job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceJobForm;