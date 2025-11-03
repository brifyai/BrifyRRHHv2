
-- Verificación post-reestructuración
SELECT 'companies' as table_name, COUNT(*) as record_count FROM companies
UNION ALL
SELECT 'employees' as table_name, COUNT(*) as record_count FROM employees
UNION ALL
SELECT 'folders' as table_name, COUNT(*) as record_count FROM folders
UNION ALL
SELECT 'documents' as table_name, COUNT(*) as record_count FROM documents
UNION ALL
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
ORDER BY table_name;
    