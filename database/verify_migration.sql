-- Script to verify database migration
-- This script checks that all tables and relationships are correctly set up after migration

-- Check that all tables exist
\dt companies
\dt departments
\dt teams
\dt employees
\dt projects
\dt project_members
\dt skills
\dt employee_skills
\dt interests
\dt employee_interests
\dt communication_channels
\dt communication_logs
\dt message_templates

-- Check that all foreign key constraints are in place
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN (
    'departments', 'teams', 'employees', 'projects', 
    'project_members', 'employee_skills', 'employee_interests',
    'communication_logs', 'message_templates'
)
ORDER BY tc.table_name;

-- Check that all indexes are created
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM 
    pg_indexes 
WHERE 
    tablename IN (
        'companies', 'departments', 'teams', 'employees', 'projects', 
        'project_members', 'skills', 'employee_skills', 'interests', 
        'employee_interests', 'communication_channels', 'communication_logs', 
        'message_templates'
    )
ORDER BY tablename, indexname;

-- Check that triggers are in place
SELECT 
    tgname AS trigger_name,
    relname AS table_name
FROM 
    pg_trigger 
    JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
WHERE 
    relname IN (
        'companies', 'departments', 'teams', 'employees', 'projects', 
        'project_members', 'skills', 'interests', 'communication_channels', 
        'communication_logs', 'message_templates'
    )
ORDER BY relname;

-- Check that RLS is enabled on all tables
SELECT 
    tablename, 
    relrowsecurity AS rls_enabled
FROM 
    pg_tables 
WHERE 
    tablename IN (
        'companies', 'departments', 'teams', 'employees', 'projects', 
        'project_members', 'skills', 'employee_skills', 'interests', 
        'employee_interests', 'communication_channels', 'communication_logs', 
        'message_templates'
    )
    AND schemaname = 'public'
ORDER BY tablename;

-- Check sample data
SELECT COUNT(*) AS companies_count FROM companies;
SELECT COUNT(*) AS employees_count FROM employees;
SELECT COUNT(*) AS projects_count FROM projects;
SELECT COUNT(*) AS skills_count FROM skills;
SELECT COUNT(*) AS interests_count FROM interests;
SELECT COUNT(*) AS communication_channels_count FROM communication_channels;
SELECT COUNT(*) AS communication_logs_count FROM communication_logs;

-- Check that new columns have been added
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'employees' 
    AND column_name IN (
        'first_name', 'last_name', 'personal_email', 'mobile', 
        'emergency_contact_name', 'emergency_contact_phone', 
        'office_location', 'job_title', 'role', 'employment_type', 
        'salary', 'currency', 'profile_picture_url', 'bio', 
        'is_manager'
    )
ORDER BY column_name;

-- Check that new tables have data
SELECT COUNT(*) AS departments_count FROM departments;
SELECT COUNT(*) AS teams_count FROM teams;
SELECT COUNT(*) AS project_members_count FROM project_members;
SELECT COUNT(*) AS message_templates_count FROM message_templates;

-- Check communication channels
SELECT name, description, is_active FROM communication_channels;

-- Check that triggers are working (updated_at should be populated)
SELECT 
    id, 
    name, 
    created_at, 
    updated_at 
FROM 
    companies 
WHERE 
    updated_at IS NOT NULL 
LIMIT 5;

-- Check employee manager relationships
SELECT 
    e.name AS employee_name,
    m.name AS manager_name,
    e.is_manager,
    e.has_subordinates
FROM 
    employees e
    LEFT JOIN employees m ON e.manager_id = m.id
WHERE 
    e.is_manager = true OR e.has_subordinates = true
LIMIT 10;

-- Check project members
SELECT 
    p.name AS project_name,
    e.name AS employee_name,
    pm.role,
    pm.is_active
FROM 
    project_members pm
    JOIN projects p ON pm.project_id = p.id
    JOIN employees e ON pm.employee_id = e.id
LIMIT 10;

-- Check communication logs with channels
SELECT 
    cl.message,
    cl.status,
    cc.name AS channel_name,
    cl.created_at
FROM 
    communication_logs cl
    LEFT JOIN communication_channels cc ON cl.channel_id = cc.id
LIMIT 10;