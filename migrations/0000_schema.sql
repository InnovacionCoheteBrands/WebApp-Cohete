-- Create enums
CREATE TYPE "project_status" AS ENUM ('active', 'planning', 'completed', 'on_hold');

-- Create tables
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "full_name" TEXT NOT NULL,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "projects" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "client" TEXT NOT NULL,
  "description" TEXT,
  "start_date" TIMESTAMP,
  "end_date" TIMESTAMP,
  "status" project_status DEFAULT 'active',
  "created_by" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "analysis_results" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "mission" TEXT,
  "vision" TEXT,
  "objectives" TEXT,
  "target_audience" TEXT,
  "brand_tone" TEXT,
  "keywords" TEXT,
  "core_values" TEXT,
  "content_themes" JSONB,
  "competitor_analysis" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "project_assignments" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "assigned_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "documents" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "uploaded_by" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "filename" TEXT NOT NULL,
  "original_name" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "extracted_text" TEXT,
  "analysis_status" TEXT DEFAULT 'pending',
  "analysis_results" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "schedules" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "start_date" TIMESTAMP,
  "end_date" TIMESTAMP,
  "specifications" TEXT,
  "created_by" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "schedule_entries" (
  "id" SERIAL PRIMARY KEY,
  "schedule_id" INTEGER NOT NULL REFERENCES "schedules"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "content" TEXT,
  "platform" TEXT,
  "post_date" TIMESTAMP,
  "post_time" TEXT,
  "hashtags" TEXT,
  "reference_image_prompt" TEXT,
  "reference_image_url" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" SERIAL PRIMARY KEY,
  "project_id" INTEGER REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "content" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create session store table
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "session" ("expire");
