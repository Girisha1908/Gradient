create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_by uuid references profiles(id)
);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade
);

-- PART 2: VERIFIED WORK SYSTEM
alter table task_deliverables
add column if not exists verified boolean default false,
add column if not exists verified_by uuid references profiles(id),
add column if not exists company_name text,
add column if not exists verified_at timestamp;

-- PART 3: TASK TO TEAM RELATIONSHIP
alter table tasks
add column if not exists team_id uuid references teams(id);

-- PART 4: BACKFILL EXISTING APPROVED TASKS TO BE VERIFIED
UPDATE task_deliverables
SET 
  verified = true,
  verified_by = reviewed_by,
  company_name = 'SGG Company',
  verified_at = reviewed_at
WHERE status = 'approved' AND (verified = false OR verified IS NULL);

-- PART 5: EXPERIENCE RECORDS (Company-Signed Experience Layer)
create table if not exists experience_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  company_name text,
  role text,
  total_tasks integer,
  completed_tasks integer,
  performance_score integer,
  top_skills text[],
  manager_remarks text,
  generated_by uuid references profiles(id),
  created_at timestamp default now()
);

-- PART 6: TASK REFERENCE MATERIALS (Manager attachments for tasks)
create table if not exists task_references (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  file_name text,
  file_url text,
  uploaded_by uuid references profiles(id),
  created_at timestamp default now()
);

-- PART 7: TASK CHAT MESSAGES
create table if not exists task_messages (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id),
  sender_id uuid references profiles(id),
  message text,
  file_url text,
  created_at timestamp default now()
);

-- PART 8: CHAT NOTIFICATIONS
alter table tasks
add column if not exists has_unread_messages boolean default false,
add column if not exists unread_messages_count integer default 0;

-- PART 9: MESSAGE-LEVEL READ STATUS
alter table task_messages
add column if not exists is_read boolean default false;

-- PART 10: CASCADE DELETE for task_messages
-- (task_messages FK should cascade; drop and recreate if needed)
-- If your original FK already cascades, skip this.
-- Otherwise run: ALTER TABLE task_messages DROP CONSTRAINT IF EXISTS task_messages_task_id_fkey;
-- ALTER TABLE task_messages ADD CONSTRAINT task_messages_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- PART 11: PUBLIC PROFILE (username)
alter table profiles
add column if not exists username text unique;

-- PART 12: OFFERS TABLE (Admin Discovery)
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  company_name text,
  message text,
  status text default 'pending',
  created_at timestamp default now()
);

-- PART 13: ENSURE REVIEW COLUMNS EXIST
alter table task_deliverables
add column if not exists feedback text,
add column if not exists reviewed_at timestamp,
add column if not exists reviewed_by uuid references profiles(id);

-- PART 14: FIX WRONG USER ATTRIBUTION IN DELIVERABLES
-- Backfill: set submitted_by to the correct employee from task_assignments
-- Run this ONCE to fix any old records where manager ID was stored instead of employee
UPDATE task_deliverables td
SET submitted_by = ta.user_id
FROM task_assignments ta
WHERE td.task_id = ta.task_id
AND td.submitted_by != ta.user_id;
