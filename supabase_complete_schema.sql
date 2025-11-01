-- REGEO Complete Database Schema with Idempotent Setup
-- This schema handles existing tables and policies gracefully

-- First, enable RLS on all tables (safe to run multiple times)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_upvotes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
-- Profiles policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  
  CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (TRUE);
    
  CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
    
  CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN undefined_table THEN
  -- Table doesn't exist yet, policies will be created when table is created
END $$;

-- Projects policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
  DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
  DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
  DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
  
  CREATE POLICY "Projects are viewable by everyone" ON projects
    FOR SELECT USING (TRUE);
    
  CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = profile_id);
    
  CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = profile_id);
    
  CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = profile_id);
EXCEPTION WHEN undefined_table THEN
  -- Table doesn't exist yet, policies will be created when table is created
END $$;

-- Upvotes policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Upvotes are viewable by everyone" ON upvotes;
  DROP POLICY IF EXISTS "Users can insert upvotes" ON upvotes;
  
  CREATE POLICY "Upvotes are viewable by everyone" ON upvotes
    FOR SELECT USING (TRUE);
    
  CREATE POLICY "Users can insert upvotes" ON upvotes
    FOR INSERT WITH CHECK (TRUE);
EXCEPTION WHEN undefined_table THEN
  -- Table doesn't exist yet, policies will be created when table is created
END $$;

-- Project upvotes policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Project upvotes are viewable by everyone" ON project_upvotes;
  DROP POLICY IF EXISTS "Users can insert project upvotes" ON project_upvotes;
  
  CREATE POLICY "Project upvotes are viewable by everyone" ON project_upvotes
    FOR SELECT USING (TRUE);
    
  CREATE POLICY "Users can insert project upvotes" ON project_upvotes
    FOR INSERT WITH CHECK (TRUE);
EXCEPTION WHEN undefined_table THEN
  -- Table doesn't exist yet, policies will be created when table is created
END $$;

-- Enable replication for all tables (only if tables exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles') THEN
    ALTER TABLE profiles REPLICA IDENTITY FULL;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'projects') THEN
    ALTER TABLE projects REPLICA IDENTITY FULL;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'upvotes') THEN
    ALTER TABLE upvotes REPLICA IDENTITY FULL;
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'project_upvotes') THEN
    ALTER TABLE project_upvotes REPLICA IDENTITY FULL;
  END IF;
END $$;

-- Create indexes for better performance (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'profiles_username_idx') THEN
    CREATE INDEX profiles_username_idx ON profiles (username);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'profiles_rank_idx') THEN
    CREATE INDEX profiles_rank_idx ON profiles (rank);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'profiles_upvotes_idx') THEN
    CREATE INDEX profiles_upvotes_idx ON profiles (upvotes);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'projects_profile_id_idx') THEN
    CREATE INDEX projects_profile_id_idx ON projects (profile_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'projects_upvotes_idx') THEN
    CREATE INDEX projects_upvotes_idx ON projects (upvotes);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'upvotes_profile_id_idx') THEN
    CREATE INDEX upvotes_profile_id_idx ON upvotes (profile_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'upvotes_voter_id_idx') THEN
    CREATE INDEX upvotes_voter_id_idx ON upvotes (voter_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'project_upvotes_project_id_idx') THEN
    CREATE INDEX project_upvotes_project_id_idx ON project_upvotes (project_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'project_upvotes_user_id_idx') THEN
    CREATE INDEX project_upvotes_user_id_idx ON project_upvotes (user_id);
  END IF;
END $$;