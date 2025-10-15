-- Migration Script for Employee Communication System
-- This script migrates the existing database schema to the improved schema
-- while preserving all existing data

BEGIN;

-- 1. Create new tables that don't exist in the old schema
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  head_id UUID REFERENCES employees(id),
  budget DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department_id, name)
);

CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role VARCHAR(100),
  assigned_date DATE DEFAULT NOW(),
  unassigned_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, employee_id)
);

CREATE TABLE IF NOT EXISTS communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject_template VARCHAR(255),
  body_template TEXT NOT NULL,
  channel_id UUID REFERENCES communication_channels(id),
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add new columns to existing tables
-- Add columns to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
ADD COLUMN IF NOT EXISTS size VARCHAR(50),
ADD COLUMN IF NOT EXISTS headquarters_address TEXT,
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS founded_date DATE,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add columns to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS personal_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS mobile VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS office_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS role VARCHAR(100),
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS salary DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'CLP',
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS is_manager BOOLEAN DEFAULT false;

-- Add columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'planning',
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS actual_start_date DATE,
ADD COLUMN IF NOT EXISTS actual_end_date DATE,
ADD COLUMN IF NOT EXISTS spent DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS project_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES employees(id) ON DELETE SET NULL;

-- Add columns to employee_skills table
ALTER TABLE employee_skills 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS proficiency_level VARCHAR(20) DEFAULT 'intermediate',
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
ADD COLUMN IF NOT EXISTS certification_date DATE,
ADD COLUMN IF NOT EXISTS certification_expiry DATE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add columns to employee_interests table
ALTER TABLE employee_interests 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS level VARCHAR(20) DEFAULT 'interested',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add columns to communication_logs table
ALTER TABLE communication_logs 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES communication_channels(id),
ADD COLUMN IF NOT EXISTS message_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS subject VARCHAR(255),
ADD COLUMN IF NOT EXISTS template_id UUID,
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failure_reason TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Update existing communication_logs to set company_id
UPDATE communication_logs 
SET company_id = (
  SELECT e.company_id 
  FROM employees e 
  WHERE e.id = communication_logs.sender_id
)
WHERE company_id IS NULL AND sender_id IS NOT NULL;

-- 3. Create new indexes
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_teams_department_id ON teams(department_id);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_team_id ON employees(team_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_project_manager_id ON projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_employee_id ON project_members(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_members_is_active ON project_members(is_active);
CREATE INDEX IF NOT EXISTS idx_communication_channels_name ON communication_channels(name);
CREATE INDEX IF NOT EXISTS idx_communication_channels_is_active ON communication_channels(is_active);
CREATE INDEX IF NOT EXISTS idx_communication_logs_company_id ON communication_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_channel_id ON communication_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_scheduled_at ON communication_logs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_message_templates_company_id ON message_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_channel_id ON message_templates(channel_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_is_active ON message_templates(is_active);

-- 4. Insert default communication channels
INSERT INTO communication_channels (name, description) VALUES 
  ('whatsapp', 'WhatsApp Business API'),
  ('telegram', 'Telegram Bot API'),
  ('email', 'Email SMTP'),
  ('sms', 'SMS Gateway')
ON CONFLICT (name) DO NOTHING;

-- 5. Update employee data to populate new fields
-- Split name into first_name and last_name (simple approach)
UPDATE employees 
SET first_name = SPLIT_PART(name, ' ', 1),
    last_name = SUBSTRING(name FROM LENGTH(SPLIT_PART(name, ' ', 1)) + 2),
    job_title = position,
    role = position,
    employment_type = contract_type
WHERE first_name IS NULL OR last_name IS NULL;

-- Set is_manager flag based on has_subordinates
UPDATE employees 
SET is_manager = has_subordinates
WHERE is_manager IS NULL;

-- 6. Create new triggers
-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for new tables
CREATE TRIGGER update_departments_updated_at 
  BEFORE UPDATE ON departments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at 
  BEFORE UPDATE ON teams 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_members_updated_at 
  BEFORE UPDATE ON project_members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_channels_updated_at 
  BEFORE UPDATE ON communication_channels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at 
  BEFORE UPDATE ON message_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing triggers
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at 
  BEFORE UPDATE ON employees 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_communication_logs_updated_at ON communication_logs;
CREATE TRIGGER update_communication_logs_updated_at 
  BEFORE UPDATE ON communication_logs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set manager flags
CREATE OR REPLACE FUNCTION update_employee_manager_flags()
RETURNS TRIGGER AS $$
BEGIN
    -- Update has_subordinates flag for the manager
    IF NEW.manager_id IS NOT NULL THEN
        UPDATE employees 
        SET has_subordinates = true 
        WHERE id = NEW.manager_id;
    END IF;
    
    -- Check if this employee is a manager
    IF EXISTS (SELECT 1 FROM employees WHERE manager_id = NEW.id) THEN
        NEW.is_manager = true;
        NEW.has_subordinates = true;
    ELSE
        NEW.is_manager = false;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for employee manager flags
CREATE TRIGGER update_employee_manager_flags_trigger
  BEFORE INSERT OR UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_employee_manager_flags();

COMMIT;