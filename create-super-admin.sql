
INSERT INTO public.admins (user_id, role, created_by)
VALUES (
    '8a5c305a-880b-458d-aa4d-03687d672577',
    'super_admin',
    '8a5c305a-880b-458d-aa4d-03687d672577'
)
ON CONFLICT (user_id) DO UPDATE
SET 
    role = 'super_admin',
    updated_at = NOW();
