create table teams (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_by uuid references profiles(id)
);

create table team_members (
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
