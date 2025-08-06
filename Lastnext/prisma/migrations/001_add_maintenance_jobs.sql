-- Migration: Add MaintenanceJob and related tables
-- Run this after updating schema.prisma

-- Add new columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create Room table
CREATE TABLE IF NOT EXISTS "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room_type" TEXT NOT NULL DEFAULT 'General',
    "property_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- Create Topic table  
CREATE TABLE IF NOT EXISTS "Topic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- Create Job table
CREATE TABLE IF NOT EXISTS "Job" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assigned_to" TEXT,
    "estimated_hours" DOUBLE PRECISION,
    "actual_hours" DOUBLE PRECISION,
    "is_defective" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "property_id" TEXT,
    "room_id" TEXT,
    "topic_id" TEXT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- Create MaintenanceJob table
CREATE TABLE IF NOT EXISTS "MaintenanceJob" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "maintenance_type" TEXT NOT NULL DEFAULT 'corrective',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assigned_to" TEXT,
    "estimated_hours" DOUBLE PRECISION,
    "actual_hours" DOUBLE PRECISION,
    "scheduled_date" TIMESTAMP(3),
    "due_date" TIMESTAMP(3),
    "completion_date" TIMESTAMP(3),
    "cost_estimate" DOUBLE PRECISION,
    "actual_cost" DOUBLE PRECISION,
    "parts_required" TEXT,
    "tools_required" TEXT,
    "safety_notes" TEXT,
    "remarks" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_pattern" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "room_id" TEXT,
    "topic_id" TEXT,

    CONSTRAINT "MaintenanceJob_pkey" PRIMARY KEY ("id")
);

-- Create JobImage table
CREATE TABLE IF NOT EXISTS "JobImage" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "job_id" TEXT NOT NULL,

    CONSTRAINT "JobImage_pkey" PRIMARY KEY ("id")
);

-- Create MaintenanceJobImage table
CREATE TABLE IF NOT EXISTS "MaintenanceJobImage" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "job_id" TEXT NOT NULL,

    CONSTRAINT "MaintenanceJobImage_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
ALTER TABLE "Job" ADD CONSTRAINT IF NOT EXISTS "Job_job_id_key" UNIQUE ("job_id");
ALTER TABLE "MaintenanceJob" ADD CONSTRAINT IF NOT EXISTS "MaintenanceJob_job_id_key" UNIQUE ("job_id");

-- Create indexes
CREATE INDEX IF NOT EXISTS "MaintenanceJob_property_id_idx" ON "MaintenanceJob"("property_id");
CREATE INDEX IF NOT EXISTS "MaintenanceJob_status_idx" ON "MaintenanceJob"("status");
CREATE INDEX IF NOT EXISTS "MaintenanceJob_maintenance_type_idx" ON "MaintenanceJob"("maintenance_type");
CREATE INDEX IF NOT EXISTS "MaintenanceJob_scheduled_date_idx" ON "MaintenanceJob"("scheduled_date");

-- Add foreign key constraints
ALTER TABLE "Room" ADD CONSTRAINT IF NOT EXISTS "Room_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Job" ADD CONSTRAINT IF NOT EXISTS "Job_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT IF NOT EXISTS "Job_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT IF NOT EXISTS "Job_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT IF NOT EXISTS "Job_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MaintenanceJob" ADD CONSTRAINT IF NOT EXISTS "MaintenanceJob_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceJob" ADD CONSTRAINT IF NOT EXISTS "MaintenanceJob_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceJob" ADD CONSTRAINT IF NOT EXISTS "MaintenanceJob_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MaintenanceJob" ADD CONSTRAINT IF NOT EXISTS "MaintenanceJob_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "JobImage" ADD CONSTRAINT IF NOT EXISTS "JobImage_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceJobImage" ADD CONSTRAINT IF NOT EXISTS "MaintenanceJobImage_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "MaintenanceJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;