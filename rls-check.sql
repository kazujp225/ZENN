-- Check RLS status for all tables
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE(table_name text, rls_enabled boolean) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    t.tablename::text,
    pg_class.relrowsecurity
  FROM pg_tables t
  JOIN pg_class ON pg_class.relname = t.tablename
  WHERE t.schemaname = 'public' 
  AND t.tablename NOT LIKE 'pg_%'
  AND t.tablename NOT LIKE 'sql_%'
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;