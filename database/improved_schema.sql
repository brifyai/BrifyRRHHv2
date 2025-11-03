-- Improved Schema for Employee Communication System
-- This file defines an enhanced database structure for the internal communication system
-- Maintains all existing data while improving performance and scalability

-- Create companies table with enhanced structure
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  legal_name VARCHAR(255),
  tax_id VARCHAR(50),
  industry VARCHAR(100),
  size VARCHAR(50), -- small, medium, large, enterprise
  headquarters_address TEXT,
  website VARCHAR(255),
  founded_date DATE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table for better organization
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

-- Create teams table for better organization
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

-- Create employees table with enhanced structure
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  personal_email VARCHAR(255),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  region VARCHAR(100),
  branch VARCHAR(100),
  country VARCHAR(100),
  timezone VARCHAR(50),
  office_location VARCHAR(255),
  job_title VARCHAR(100),
  role VARCHAR(100),
  level VARCHAR(50), -- junior, mid, senior, lead, manager, director, vp, c-level
  employment_type VARCHAR(50), -- full-time, part-time, contract, intern
  work_mode VARCHAR(20), -- on-site, hybrid, remote
  contract_type VARCHAR(50), -- indefinite, fixed-term, freelance, internship
  seniority VARCHAR(50), -- less than 3 months, 1-3 years, 3-5 years, more than 5 years
  hire_date DATE,
  anniversary_date DATE,
  birthday DATE,
  salary DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'CLP',
  profile_picture_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  has_subordinates BOOLEAN DEFAULT false,
  is_manager BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table with enhanced structure
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  description TEXT,
  status VARCHAR(50) DEFAULT 'planning', -- planning, active, on-hold, completed, cancelled
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  project_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_members table for project assignments
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

-- Create skills table with categories
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50), -- technical, soft, language, certification
  description TEXT,
  is_certification BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_skills junction table with proficiency levels
CREATE TABLE IF NOT EXISTS employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20) DEFAULT 'intermediate', -- beginner, intermediate, advanced, expert
  years_of_experience INTEGER,
  certification_date DATE,
  certification_expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, skill_id)
);

-- Create interests table with categories
CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50), -- hobby, sport, art, technology, social_cause
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_interests junction table
CREATE TABLE IF NOT EXISTS employee_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
  level VARCHAR(20) DEFAULT 'interested', -- interested, passionate, expert
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, interest_id)
);

-- Create communication_channels table
CREATE TABLE IF NOT EXISTS communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL, -- whatsapp, telegram, email, slack, teams
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communication_logs table with enhanced structure
CREATE TABLE IF NOT EXISTS communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  recipient_ids UUID[], -- Array of recipient employee IDs
  channel_id UUID REFERENCES communication_channels(id),
  message_type VARCHAR(50), -- text, image, document, template
  subject VARCHAR(255), -- For email-like communications
  message TEXT NOT NULL,
  template_id UUID,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, read, failed
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  metadata JSONB, -- For additional channel-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject_template VARCHAR(255),
  body_template TEXT NOT NULL,
  channel_id UUID REFERENCES communication_channels(id),
  category VARCHAR(50), -- general, hr, project, announcement
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);

CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);

CREATE INDEX IF NOT EXISTS idx_teams_department_id ON teams(department_id);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);

CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_team_id ON employees(team_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_level ON employees(level);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_work_mode ON employees(work_mode);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);

CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_project_manager_id ON projects(project_manager_id);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_employee_id ON project_members(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_members_is_active ON project_members(is_active);

CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);

CREATE INDEX IF NOT EXISTS idx_employee_skills_employee_id ON employee_skills(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_skills_skill_id ON employee_skills(skill_id);

CREATE INDEX IF NOT EXISTS idx_interests_name ON interests(name);
CREATE INDEX IF NOT EXISTS idx_interests_category ON interests(category);

CREATE INDEX IF NOT EXISTS idx_employee_interests_employee_id ON employee_interests(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_interests_interest_id ON employee_interests(interest_id);

CREATE INDEX IF NOT EXISTS idx_communication_channels_name ON communication_channels(name);
CREATE INDEX IF NOT EXISTS idx_communication_channels_is_active ON communication_channels(is_active);

CREATE INDEX IF NOT EXISTS idx_communication_logs_company_id ON communication_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_sender_id ON communication_logs(sender_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_channel_id ON communication_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at ON communication_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_communication_logs_scheduled_at ON communication_logs(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_message_templates_company_id ON message_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_channel_id ON message_templates(channel_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_is_active ON message_templates(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Companies can be viewed by users from the same company
CREATE POLICY "Companies are viewable by users from the same company" 
ON companies FOR SELECT 
USING (
  id IN (
    SELECT company_id 
    FROM employees 
    WHERE email = (SELECT email FROM users WHERE id = auth.uid())
  )
);

-- Departments can be viewed by users from the same company
CREATE POLICY "Departments are viewable by users from the same company" 
ON departments FOR SELECT 
USING (
  company_id IN (
    SELECT company_id 
    FROM employees 
    WHERE email = (SELECT email FROM users WHERE id = auth.uid())
  )
);

-- Teams can be viewed by users from the same company
CREATE POLICY "Teams are viewable by users from the same company" 
ON teams FOR SELECT 
USING (
  department_id IN (
    SELECT id 
    FROM departments 
    WHERE company_id IN (
      SELECT company_id 
      FROM employees 
      WHERE email = (SELECT email FROM users WHERE id = auth.uid())
    )
  )
);

-- Employees can be viewed by users from the same company
CREATE POLICY "Employees are viewable by users from the same company" 
ON employees FOR SELECT 
USING (
  company_id IN (
    SELECT company_id 
    FROM employees 
    WHERE email = (SELECT email FROM users WHERE id = auth.uid())
  )
);

-- Projects can be viewed by users from the same company
CREATE POLICY "Projects are viewable by users from the same company" 
ON projects FOR SELECT 
USING (
  company_id IN (
    SELECT company_id 
    FROM employees 
    WHERE email = (SELECT email FROM users WHERE id = auth.uid())
  )
);

-- Project members can be viewed by users from the same company
CREATE POLICY "Project members are viewable by users from the same company" 
ON project_members FOR SELECT 
USING (
  project_id IN (
    SELECT id 
    FROM projects 
    WHERE company_id IN (
      SELECT company_id 
      FROM employees 
      WHERE email = (SELECT email FROM users WHERE id = auth.uid())
    )
  )
);

-- Skills and interests can be viewed by all authenticated users
CREATE POLICY "Skills are viewable by everyone" 
ON skills FOR SELECT 
USING (true);

CREATE POLICY "Interests are viewable by everyone" 
ON interests FOR SELECT 
USING (true);

-- Communication channels can be viewed by all authenticated users
CREATE POLICY "Communication channels are viewable by everyone" 
ON communication_channels FOR SELECT 
USING (true);

-- Communication logs can only be viewed by users from the same company
CREATE POLICY "Communication logs are viewable by users from the same company" 
ON communication_logs FOR SELECT 
USING (
  company_id IN (
    SELECT company_id 
    FROM employees 
    WHERE email = (SELECT email FROM users WHERE id = auth.uid())
  )
);

-- Message templates can be viewed by users from the same company
CREATE POLICY "Message templates are viewable by users from the same company" 
ON message_templates FOR SELECT 
USING (
  company_id IN (
    SELECT company_id 
    FROM employees 
    WHERE email = (SELECT email FROM users WHERE id = auth.uid())
  )
);

-- Insert sample communication channels
INSERT INTO communication_channels (name, description) VALUES 
  ('whatsapp', 'WhatsApp Business API'),
  ('telegram', 'Telegram Bot API'),
  ('email', 'Email SMTP'),
  ('sms', 'SMS Gateway')
ON CONFLICT (name) DO NOTHING;

-- Insert sample companies
INSERT INTO companies (name) VALUES 
  ('Ariztia'),
  ('Inchcape'),
  ('Achs'),
  ('Arcoprime'),
  ('Grupo Saesa'),
  ('Colbun'),
  ('AFP Habitat'),
  ('Copec'),
  ('Antofagasta Minerals'),
  ('Vida Cámara'),
  ('Enaex'),
  ('SQM'),
  ('CMPC'),
  ('Corporación Chilena - Alemana'),
  ('Hogar Alemán'),
  ('Empresas SB')
ON CONFLICT (name) DO NOTHING;

-- Insert sample skills
INSERT INTO skills (name, category) VALUES 
  ('Primeros Auxilios', 'certification'),
  ('Manejo de Montacargas', 'certification'),
  ('Certificación en Scrum', 'certification'),
  ('Inglés Avanzado', 'language'),
  ('Excel Avanzado', 'technical'),
  ('Python', 'technical'),
  ('Diseño UX', 'technical'),
  ('Marketing Digital', 'technical'),
  ('Ventas', 'soft'),
  ('Finanzas', 'technical')
ON CONFLICT (name) DO NOTHING;

-- Insert sample interests
INSERT INTO interests (name, category) VALUES 
  ('Interesado en voluntariado', 'social_cause'),
  ('Club de running', 'sport'),
  ('Música', 'hobby'),
  ('Deportes', 'sport'),
  ('Arte', 'hobby'),
  ('Tecnología', 'hobby'),
  ('Sostenibilidad', 'social_cause'),
  ('Cocina', 'hobby'),
  ('Viajes', 'hobby'),
  ('Lectura', 'hobby')
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at 
  BEFORE UPDATE ON departments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at 
  BEFORE UPDATE ON teams 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at 
  BEFORE UPDATE ON employees 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_members_updated_at 
  BEFORE UPDATE ON project_members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at 
  BEFORE UPDATE ON skills 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interests_updated_at 
  BEFORE UPDATE ON interests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_channels_updated_at 
  BEFORE UPDATE ON communication_channels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_logs_updated_at 
  BEFORE UPDATE ON communication_logs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at 
  BEFORE UPDATE ON message_templates 
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