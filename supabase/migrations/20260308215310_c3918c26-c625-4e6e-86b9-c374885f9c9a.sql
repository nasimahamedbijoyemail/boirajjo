
-- Fix: Re-grant EXECUTE on has_role to authenticated so RLS policies work
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
