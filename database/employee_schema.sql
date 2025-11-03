-- Schema for Employee Communication System
-- This file defines the database structure for the internal communication system

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  region VARCHAR(100),
  branch VARCHAR(100),
  country VARCHAR(100),
  timezone VARCHAR(50),
  department VARCHAR(100),
  team VARCHAR(100),
  business_unit VARCHAR(100),
  level VARCHAR(50),
  position VARCHAR(100),
  has_subordinates BOOLEAN DEFAULT false,
  work_mode VARCHAR(20), -- Presencial, Híbrido, Remoto
  contract_type VARCHAR(50), -- Indefinido, Plazo Fijo, Honorarios, Práctica
  seniority VARCHAR(50), -- Menos de 3 meses, 1-3 años, Más de 5 años
  anniversary_date DATE,
  birthday DATE,
  project_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_skills junction table
CREATE TABLE IF NOT EXISTS employee_skills (
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (employee_id, skill_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interests table
CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_interests junction table
CREATE TABLE IF NOT EXISTS employee_interests (
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
  PRIMARY KEY (employee_id, interest_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communication_logs table for tracking messages
CREATE TABLE IF NOT EXISTS communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES employees(id),
  recipient_ids UUID[], -- Array of recipient employee IDs
  message TEXT NOT NULL,
  channel VARCHAR(20), -- whatsapp, telegram
  status VARCHAR(20), -- sent, delivered, read
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_level ON employees(level);
CREATE INDEX IF NOT EXISTS idx_employees_region ON employees(region);
CREATE INDEX IF NOT EXISTS idx_employees_team ON employees(team);
CREATE INDEX IF NOT EXISTS idx_employees_project_id ON employees(project_id);
CREATE INDEX IF NOT EXISTS idx_employees_work_mode ON employees(work_mode);
CREATE INDEX IF NOT EXISTS idx_employees_contract_type ON employees(contract_type);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);

CREATE INDEX IF NOT EXISTS idx_communication_logs_sender_id ON communication_logs(sender_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_channel ON communication_logs(channel);
CREATE INDEX IF NOT EXISTS idx_communication_logs_status ON communication_logs(status);
CREATE INDEX IF NOT EXISTS idx_communication_logs_sent_at ON communication_logs(sent_at);

-- Enable Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Companies can be viewed by all authenticated users
CREATE POLICY "Companies are viewable by everyone" 
ON companies FOR SELECT 
USING (true);

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

-- Skills and interests can be viewed by all authenticated users
CREATE POLICY "Skills are viewable by everyone" 
ON skills FOR SELECT 
USING (true);

CREATE POLICY "Interests are viewable by everyone" 
ON interests FOR SELECT 
USING (true);

-- Communication logs can only be viewed by the sender
CREATE POLICY "Users can view their own communication logs" 
ON communication_logs FOR SELECT 
USING (sender_id = (SELECT id FROM employees WHERE email = (SELECT email FROM users WHERE id = auth.uid())));

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
INSERT INTO skills (name) VALUES 
  ('Primeros Auxilios'),
  ('Manejo de Montacargas'),
  ('Certificación en Scrum'),
  ('Inglés Avanzado'),
  ('Excel Avanzado'),
  ('Python'),
  ('Diseño UX'),
  ('Marketing Digital'),
  ('Ventas'),
  ('Finanzas')
ON CONFLICT (name) DO NOTHING;

-- Insert sample interests
INSERT INTO interests (name) VALUES 
  ('Interesado en voluntariado'),
  ('Club de running'),
  ('Música'),
  ('Deportes'),
  ('Arte'),
  ('Tecnología'),
  ('Sostenibilidad'),
  ('Cocina'),
  ('Viajes'),
  ('Lectura')
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
CREATE TRIGGER update_employees_updated_at 
  BEFORE UPDATE ON employees 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_logs_updated_at 
  BEFORE UPDATE ON communication_logs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();