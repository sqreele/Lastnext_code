# Maintenance Job Creation Feature

## Overview
The maintenance job creation feature allows users to create, manage, and track maintenance tasks for properties. The system includes comprehensive form validation, property selection requirements, and a rich user interface.

## Key Features

### 1. Property Selection Requirement
- **Primary Flow**: Users must select a property before creating a maintenance job
- **Fallback Flow**: Form provides property selection dropdown if no property is pre-selected
- **Validation**: Clear error messages guide users to select a property first

### 2. Comprehensive Form Structure
The form is organized into four main tabs:

#### Basic Information
- **Property Selection**: Dropdown with user's available properties
- **Job Description**: Required text area for job details
- **Priority**: Low, Medium, High (with color-coded badges)
- **Room Selection**: Autocomplete for property-specific rooms
- **Topic Selection**: Autocomplete for maintenance topics

#### Details
- **Status**: Pending, In Progress, Completed, Cancelled, Waiting Parts
- **Assigned To**: Text field for assignee name
- **Estimated Hours**: Numeric input with decimal support
- **Remarks**: Additional notes text area

#### Media
- **Image Upload**: Support for multiple images (up to 10)
- **File Preview**: Thumbnail grid with remove functionality
- **Existing Images**: Display and manage previously uploaded images

#### Advanced
- **Defect Marking**: Checkbox to mark job as defective
- **Special Handling**: Warning notices for defect jobs

### 3. Enhanced Database Schema
New dedicated models for better organization:

#### MaintenanceJob Model
```prisma
model MaintenanceJob {
  id                String   @id @default(uuid())
  job_id            String   @unique
  description       String
  status            String   @default("pending")
  priority          String   @default("medium")
  property_id       String
  room_id           String?
  topic_id          String?
  assigned_to       String?
  estimated_hours   Float?
  actual_hours      Float?
  is_defective      Boolean  @default(false)
  is_preventive     Boolean  @default(false)
  remarks           String?
  created_by        String
  updated_by        String?
  completed_by      String?
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  completed_at      DateTime?
  due_date          DateTime?
  
  // Relations
  property          Property @relation(fields: [property_id], references: [id])
  creator           User     @relation("CreatedJobs", fields: [created_by], references: [id])
  updater           User?    @relation("UpdatedJobs", fields: [updated_by], references: [id])
  completer         User?    @relation("CompletedJobs", fields: [completed_by], references: [id])
  images            JobImage[]
  attachments       JobAttachment[]
}
```

#### Supporting Models
- **JobImage**: For uploaded photos and documentation
- **JobAttachment**: For file attachments and documents

### 4. User Experience Enhancements

#### Property Pre-selection
- When accessing via property context, the property is automatically selected
- Property dropdown is disabled when pre-selected
- Clear indication when property is pre-selected

#### Validation & Error Handling
- Real-time form validation
- Contextual error messages
- Tab navigation to error locations
- Toast notifications for success/error states

#### Responsive Design
- Mobile-optimized form layout
- Grid-based responsive image gallery
- Adaptive text sizing and spacing

## Technical Implementation

### Components
- **CreateJobForm**: Main form component with tabbed interface
- **RoomAutocomplete**: Property-specific room selection
- **TopicAutocomplete**: Maintenance topic selection
- **FileUpload**: Image and file upload handling

### API Integration
- **createJob**: POST to `/api/jobs/` endpoint
- **uploadJobImage**: Multipart file upload
- **Property/Room/Topic**: Autocomplete data fetching

### State Management
- **PropertyStore**: Global property selection state
- **JobStore**: Job creation notifications and updates
- **Form State**: Local form data management

## Usage Flows

### Primary Flow (Property Pre-selected)
1. User navigates to create job with property context
2. Property is automatically selected and locked
3. User fills required fields (description)
4. User optionally adds room, topic, images, etc.
5. Form validation ensures completeness
6. Job is created and user redirected to job details

### Secondary Flow (No Property Context)
1. User navigates to create job page
2. Warning message displayed about property requirement
3. User can select property from dropdown
4. Form becomes fully functional once property selected
5. Standard creation flow continues

### Error Handling
1. Missing property: Tab navigation to basic info
2. Missing description: Focus on description field
3. API errors: Toast notification with retry option
4. Network issues: Graceful degradation

## Future Enhancements
- Drag-and-drop image uploads
- Due date scheduling
- Recurring maintenance jobs
- Email notifications
- Mobile app integration
- Barcode scanning for equipment
- Time tracking integration
- Parts inventory integration

## Configuration
The feature can be configured through:
- Environment variables for file upload limits
- Prisma schema for custom fields
- Component props for form behavior
- CSS variables for styling customization