# Maintenance Job System Setup Guide

This guide will help you set up the new maintenance job functionality that has been added to your property management system.

## Overview

The maintenance job system adds dedicated functionality for creating, managing, and tracking maintenance tasks with enhanced features including:

- **Maintenance Types**: Corrective, Preventive, Emergency
- **Scheduling**: Scheduled dates, due dates, recurring maintenance
- **Resource Management**: Cost estimates, parts and tools tracking
- **Safety Notes**: Important safety considerations
- **Enhanced Property Selection**: Better UI with property selection workflow

## Files Added/Modified

### Database Schema
- ✅ `prisma/schema.prisma` - Added MaintenanceJob, Room, Topic, Job models
- ✅ `prisma/migrations/001_add_maintenance_jobs.sql` - Database migration script

### Types and Interfaces
- ✅ `app/lib/types.tsx` - Added MaintenanceJob types and interfaces

### Components
- ✅ `app/components/jobs/MaintenanceJobForm.tsx` - New maintenance job form component
- ✅ `app/dashboard/createJob/page.tsx` - Updated to use maintenance job form

### API Functions
- ✅ `app/lib/data.ts` - Added maintenance job CRUD operations

## Setup Instructions

### 1. Database Migration

First, you need to apply the database schema changes:

```bash
# Navigate to your project directory
cd Lastnext

# Generate Prisma client with new schema
npx prisma generate

# Apply the database migration
npx prisma db push

# Or if you prefer using migration files:
# npx prisma migrate dev --name add_maintenance_jobs
```

### 2. Install Dependencies

All required dependencies are already included in your `package.json`. If you need to reinstall:

```bash
npm install
```

### 3. Environment Setup

Ensure your `.env` file contains the correct database URL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
```

### 4. Backend API Setup

You'll need to implement the corresponding backend endpoints for the maintenance job API calls:

- `POST /api/maintenance-jobs/` - Create maintenance job
- `GET /api/maintenance-jobs/` - List maintenance jobs (with filtering)
- `GET /api/maintenance-jobs/{id}/` - Get specific maintenance job
- `PATCH /api/maintenance-jobs/{id}/` - Update maintenance job
- `DELETE /api/maintenance-jobs/{id}/` - Delete maintenance job

## Features

### Enhanced Form

The new maintenance job form includes 5 tabs:

1. **Basic Info**: Title, description, maintenance type, priority, status
2. **Scheduling**: Scheduled date, due date, estimated hours, recurring options
3. **Resources**: Cost estimates, parts required, tools required, safety notes
4. **Media**: Image uploads and management
5. **Advanced**: Additional remarks and information

### Property Selection

- Improved property selection UI with clear messaging
- Property requirement validation
- Easy property switching
- Better error handling for users without property access

### Maintenance Types

- **Corrective**: Fix existing issues
- **Preventive**: Scheduled preventive maintenance
- **Emergency**: Urgent maintenance requiring immediate attention

### Recurring Maintenance

Support for recurring maintenance schedules:
- Weekly
- Monthly
- Quarterly
- Yearly

## Usage

### Creating a Maintenance Job

1. Navigate to `/dashboard/createJob`
2. Select a property (if not already selected)
3. Fill out the maintenance job form across the 5 tabs
4. Submit to create the maintenance job

### Property Selection

The system now requires property selection before creating maintenance jobs:
- If no property is selected, a prominent selection UI is shown
- Clear messaging guides users through the selection process
- Property information is displayed once selected

## API Integration

The maintenance job form integrates with the following API endpoints:

```typescript
// Create maintenance job
const newJob = await createMaintenanceJob({
  title: "HVAC System Maintenance",
  description: "Annual HVAC system inspection and cleaning",
  maintenance_type: "preventive",
  priority: "medium",
  property_id: "property-uuid",
  scheduled_date: "2024-01-15T10:00:00Z",
  is_recurring: true,
  recurrence_pattern: "yearly"
});
```

## Database Schema

### MaintenanceJob Table

```sql
MaintenanceJob {
  id                 String (UUID, Primary Key)
  job_id             String (Unique identifier)
  title              String
  description        String
  maintenance_type   String (corrective/preventive/emergency)
  status             String (pending/in_progress/completed/cancelled)
  priority           String (low/medium/high)
  assigned_to        String (optional)
  estimated_hours    Float (optional)
  scheduled_date     DateTime (optional)
  due_date           DateTime (optional)
  cost_estimate      Float (optional)
  parts_required     Text (optional)
  tools_required     Text (optional)
  safety_notes       Text (optional)
  is_recurring       Boolean
  recurrence_pattern String (optional)
  property_id        String (Required foreign key)
  room_id            String (Optional foreign key)
  topic_id           String (Optional foreign key)
  user_id            String (Foreign key)
  created_at         DateTime
  updated_at         DateTime
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify database permissions

2. **Property Selection Issues**
   - Ensure user has access to properties
   - Check UserProperty associations in database
   - Verify property store state management

3. **Form Validation Errors**
   - Title and description are required fields
   - Property selection is mandatory
   - Check date format for scheduling fields

## Next Steps

After setting up the maintenance job system, you might want to:

1. **Add Dashboard Views**: Create listing and detail views for maintenance jobs
2. **Implement Notifications**: Set up alerts for due dates and recurring maintenance
3. **Add Reporting**: Create reports for maintenance costs and scheduling
4. **Mobile Support**: Ensure the form works well on mobile devices
5. **File Uploads**: Implement actual image upload functionality

## Support

If you encounter any issues during setup:

1. Check the browser console for JavaScript errors
2. Verify database schema is correctly applied
3. Ensure all dependencies are installed
4. Check API endpoint implementations

The maintenance job system is now ready to use and will provide enhanced maintenance management capabilities for your property management application.