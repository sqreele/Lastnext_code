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
import { Loader2, Upload, X, Plus, Trash2, Edit3, Camera, FileText, AlertCircle } from 'lucide-react';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { useJobStore } from '@/app/lib/stores/jobStore';
import { Job, Property, Room, Topic, JobImage, TopicFromAPI } from '@/app/lib/types';
import { createJob } from '@/app/lib/data';
import { cn } from '@/app/lib/utils';
import RoomAutocomplete from './RoomAutocomplete';
import TopicAutocomplete from './TopicAutocomplete';
import FileUpload from './FileUpload';

interface CreateJobFormProps {
  onSuccess?: (job: Job) => void;
  onCancel?: () => void;
  initialData?: Partial<Job>;
  isEdit?: boolean;
  propertyId?: string;
}

const CreateJobForm: React.FC<CreateJobFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  isEdit = false,
  propertyId
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { selectedProperty, userProperties, setSelectedProperty } = usePropertyStore();
  const { triggerJobCreation } = useJobStore();

  // Form state
  const [formData, setFormData] = useState({
    description: initialData.description || '',
    priority: initialData.priority || 'medium',
    status: initialData.status || 'pending',
    assigned_to: '',
    estimated_hours: '',
    is_defective: initialData.is_defective || false,
    remarks: initialData.remarks || ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topics, setTopics] = useState<TopicFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate form completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    let total = 4; // Basic required fields

    if (formData.description.trim().length >= 10) completed++;
    if (selectedProperty) completed++;
    if (selectedRoom) completed++;
    if (selectedTopic) completed++;

    return Math.round((completed / total) * 100);
  };

  // Load initial data
  useEffect(() => {
    if (initialData.images) {
      // Convert JobImage[] to string[]
      const urls = initialData.images.map(img => 
        typeof img === 'string' ? img : img.image_url
      );
      setImageUrls(urls);
    }
  }, [initialData]);

  // Handle propertyId prop if passed
  useEffect(() => {
    if (propertyId && propertyId !== selectedProperty) {
      setSelectedProperty(propertyId);
    }
  }, [propertyId, selectedProperty, setSelectedProperty]);

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
    // Find the full topic object from topics array
    const fullTopic = topics.find(t => t.title === topic.title);
    setSelectedTopic(fullTopic || null);
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Job description is required",
        variant: "destructive"
      });
      return false;
    }

    if (formData.description.trim().length < 10) {
      toast({
        title: "Validation Error",
        description: "Job description should be at least 10 characters long",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedProperty) {
      toast({
        title: "Validation Error",
        description: "Please select a property",
        variant: "destructive"
      });
      return false;
    }

    // Validate estimated hours if provided
    if (formData.estimated_hours && parseFloat(formData.estimated_hours) < 0) {
      toast({
        title: "Validation Error",
        description: "Estimated hours must be a positive number",
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
      // Prepare job data first (without images)
      const jobData = {
        ...formData,
        property_id: selectedProperty || undefined,
        room_id: selectedRoom?.room_id,
        topic_id: selectedTopic?.id,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null
      };

      // Create job first to get job ID
      const newJob = await createJob(jobData);

      // Now upload images if any
      if (images.length > 0) {
        // For now, we'll just add the image URLs to the job data
        // In a real implementation, you'd upload each image and get URLs
        const imageData: JobImage[] = images.map((file, index) => ({
          id: index + 1,
          image_url: URL.createObjectURL(file), // This is temporary
          uploaded_at: new Date().toISOString()
        }));
        
        // Update job with images
        // This would require an updateJob function
        console.log('Images to upload:', images);
      }

      // Trigger job creation notification
      triggerJobCreation();

      toast({
        title: "Success",
        description: isEdit ? "Job updated successfully" : "Job created successfully",
      });

      if (onSuccess) {
        onSuccess(newJob);
      } else {
        router.push(`/dashboard/jobs/${newJob.job_id}`);
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: "Failed to create job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // If no property is selected, show property selection first
  if (!selectedProperty) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Select Property
            </CardTitle>
            <CardDescription>
              Please select a property to create a maintenance job
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="property">Property *</Label>
                <Select 
                  value={selectedProperty || ''} 
                  onValueChange={(value) => {
                    setSelectedProperty(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProperties.map((property) => (
                      <SelectItem key={property.property_id} value={property.property_id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {userProperties.length === 0 ? (
                  <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-yellow-800 font-medium">No Properties Available</p>
                        <p className="text-yellow-700 text-sm">
                          Please contact your administrator to add properties to your account.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Select a property to continue creating your maintenance job
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                {userProperties.length > 0 && (
                  <Button 
                    type="button" 
                    disabled={!selectedProperty}
                    onClick={() => {
                      // This will trigger the form to show once a property is selected
                    }}
                  >
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            {isEdit ? 'Edit Job' : 'Create New Job'}
          </CardTitle>
          <CardDescription>
            {isEdit ? 'Update job details and information' : 'Fill in the details to create a new maintenance job'}
          </CardDescription>
          {selectedProperty && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Property: {userProperties.find(p => p.property_id === selectedProperty)?.name}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProperty('')}
                className="h-6 px-2 text-xs"
              >
                Change
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Form Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Form Completion</span>
              <span className="text-sm text-gray-500">{calculateCompletion()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${calculateCompletion()}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Tips for creating a good maintenance job</h4>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Be specific about the issue or work required</li>
                        <li>• Include relevant room and topic information</li>
                        <li>• Set appropriate priority based on urgency</li>
                        <li>• Add images to help visualize the problem</li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Property Selection - Read Only since it's already selected */}
                <div className="space-y-2">
                  <Label htmlFor="property">Property</Label>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {userProperties.find(p => p.property_id === selectedProperty)?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Property ID: {selectedProperty}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProperty('')}
                    >
                      Change
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the job requirements..."
                      rows={4}
                      required
                    />
                    <div className="flex justify-between items-center text-sm">
                      <span className={formData.description.length < 10 ? "text-red-500" : "text-gray-500"}>
                        Minimum 10 characters recommended
                      </span>
                      <span className={formData.description.length > 1000 ? "text-red-500" : "text-gray-500"}>
                        {formData.description.length}/1000
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={option.color}>{option.label}</Badge>
                            </div>
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
                      propertyId={selectedProperty || undefined}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Topic</Label>
                    <TopicAutocomplete
                      topics={topics}
                      selectedTopic={selectedTopic ? { title: selectedTopic.title, description: selectedTopic.description || '' } : { title: '', description: '' }}
                      onSelect={handleTopicSelect}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={option.color}>{option.label}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated_hours">Estimated Hours</Label>
                    <Input
                      id="estimated_hours"
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.estimated_hours}
                      onChange={(e) => handleInputChange('estimated_hours', e.target.value)}
                      placeholder="0.0"
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

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    placeholder="Additional notes or remarks..."
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
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_defective"
                    checked={formData.is_defective}
                    onChange={(e) => handleInputChange('is_defective', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="is_defective">Mark as Defect</Label>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Advanced Options</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Use these options carefully. Defect jobs are marked for special attention and may have different workflows.
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEdit ? 'Update Job' : 'Create Job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateJobForm;