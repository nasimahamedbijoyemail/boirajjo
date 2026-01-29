import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AcademicDepartment } from '@/types/database';

export const useAcademicDepartments = () => {
  return useQuery({
    queryKey: ['academic-departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_departments')
        .select('*')
        .order('category')
        .order('name');
      
      if (error) throw error;
      return data as AcademicDepartment[];
    },
  });
};
