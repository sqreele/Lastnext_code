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
  propertyId?: string; // Keep for backward compatibility but make optional
}

const CreateJobForm: React.FC<CreateJobFormProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  isEdit = false,
  propertyId // This is now optional
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { selectedProperty, userProperties, setSelectedProperty } = usePropertyStore();
  const { triggerJobCreation } = useJobStore();
  
  // Use selectedProperty from store or fall back to propertyId prop
  const currentPropertyId = selectedProperty || propertyId;

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

    if (!currentPropertyId) {
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
      // Prepare job data first (without images)
      const jobData = {
        ...formData,
        property_id: currentPropertyId,
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
        </CardHeader>

        <CardContent>
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
                {/* Property Selection */}
                <div className="space-y-2">
                  <Label htmlFor="property">Property *</Label>
                  <Select 
                    value={currentPropertyId || ''} 
                    onValueChange={(value) => {
                      // Update the selected property in the store
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
                  {!currentPropertyId && (
                    <p className="text-sm text-red-600">Please select a property to continue</p>
                  )}
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
                      propertyId={currentPropertyId || undefined}
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