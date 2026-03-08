
-- Fix: Scope academic_department_id branch to same institution
DROP POLICY IF EXISTS "Users can view requests from same department" ON public.department_book_requests;
CREATE POLICY "Users can view requests from same department"
  ON public.department_book_requests FOR SELECT
  TO authenticated
  USING (
    (department_id IN (SELECT profiles.department_id FROM profiles WHERE profiles.user_id = auth.uid()))
    OR
    (academic_department_id IN (SELECT profiles.academic_department_id FROM profiles WHERE profiles.user_id = auth.uid())
     AND institution_id IN (SELECT profiles.institution_id FROM profiles WHERE profiles.user_id = auth.uid()))
  );
