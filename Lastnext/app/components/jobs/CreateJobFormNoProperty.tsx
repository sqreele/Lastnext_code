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
import { useJobStore } from '@/app/lib/stores/jobStore';
import { Job, Room, Topic, JobImage, TopicFromAPI } from '@/app/lib/types';
import { createJob } from '@/app/lib/data';
import { cn } from '@/app/lib/utils';
import RoomAutocomplete from './RoomAutocomplete';
import TopicAutocomplete from './TopicAutocomplete';
import FileUpload from './FileUpload';

interface CreateJobFormNoPropertyProps {
  onSuccess?: (job: Job) => void;
  onCancel?: () => void;
  initialData?: Partial<Job>;
  isEdit?: boolean;
}

const CreateJobFormNoProperty: React.FC<CreateJobFormNoPropertyProps> = ({
  onSuccess,
  onCancel,
  initialData = {},
  isEdit = false
}) => {
  const router = useRouter();
  const { toast } = useToast();
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
        description: "Description is required",
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
      // Prepare job data without property_id
      const jobData = {
        ...formData,
        room_id: selectedRoom?.room_id,
        topic_id: selectedTopic?.id,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null
      };

      // Create job without property association
      const newJob = await createJob(jobData);

      // Handle image uploads if any
      if (images.length > 0) {
        const imageData: JobImage[] = images.map((file, index) => ({
          id: index + 1,
          image_url: URL.createObjectURL(file), // This is temporary
          uploaded_at: new Date().toISOString()
        }));
        
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
            {isEdit ? 'Edit Job' : 'Create New Job (No Property)'}
          </CardTitle>
          <CardDescription>
            {isEdit ? 'Update job details and information' : 'Fill in the details to create a new maintenance job without property association'}
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
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the maintenance task..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => handleInputChange('priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Badge className={option.color}>{option.label}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleInputChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
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
                    <div>
                      <Label htmlFor="room">Room (Optional)</Label>
                      <RoomAutocomplete
                        onRoomSelect={handleRoomSelect}
                        selectedRoom={selectedRoom}
                        excludePropertyFilter={true}
                      />
                    </div>

                    <div>
                      <Label htmlFor="topic">Topic (Optional)</Label>
                      <TopicAutocomplete
                        onTopicSelect={handleTopicSelect}
                        selectedTopic={selectedTopic}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <Input
                      id="assigned_to"
                      value={formData.assigned_to}
                      onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                      placeholder="Enter assignee name"
                    />
                  </div>

                  <div>
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

                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    placeholder="Additional notes or remarks..."
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-4">
                <div>
                  <Label>Upload Images</Label>
                  <FileUpload
                    onUpload={handleImageUpload}
                    acceptedFileTypes={['image/*']}
                    maxFiles={5}
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                </div>

                {/* Display uploaded images */}
                {(images.length > 0 || imageUrls.length > 0) && (
                  <div className="space-y-2">
                    <Label>Uploaded Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
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
                      {imageUrls.map((url, index) => (
                        <div key={`url-${index}`} className="relative group">
                          <img
                            src={url}
                            alt={`Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
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
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_defective"
                    checked={formData.is_defective}
                    onChange={(e) => handleInputChange('is_defective', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_defective">Mark as Defective</Label>
                </div>

                {formData.is_defective && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Defective Item</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      This job has been marked as defective and may require special handling.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEdit ? 'Update Job' : 'Create Job'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateJobFormNoProperty;